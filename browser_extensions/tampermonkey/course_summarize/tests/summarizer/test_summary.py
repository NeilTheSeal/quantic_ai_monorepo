from collections.abc import Iterator
from types import SimpleNamespace
from typing import cast

import anthropic
import pytest
from anthropic.types.beta import BetaMessage
from summarizer.summary import (
    Pdf,
    SummaryError,
    Usage,
    build_user_content,
    write_summary,
)


def message(stop_reason: str, text: str, searches: int = 0) -> BetaMessage:
    return BetaMessage.model_validate(
        {
            "id": "msg_1",
            "type": "message",
            "role": "assistant",
            "model": "claude-opus-5-5",
            "content": [{"type": "text", "text": text, "citations": None}],
            "stop_reason": stop_reason,
            "stop_sequence": None,
            "usage": {
                "input_tokens": 100,
                "output_tokens": 10,
                "cache_creation_input_tokens": 0,
                "cache_read_input_tokens": 50,
                "server_tool_use": {"web_search_requests": searches, "web_fetch_requests": 0},
            },
        }
    )


class FakeStream:
    def __init__(self, final: BetaMessage, text: str) -> None:
        self.final = final
        self.text = text

    def __enter__(self) -> FakeStream:
        return self

    def __exit__(self, *args: object) -> None:
        return None

    def __iter__(self) -> Iterator[SimpleNamespace]:
        yield SimpleNamespace(type="text", text=self.text)

    def get_final_message(self) -> BetaMessage:
        return self.final


class FakeClient:
    """Stands in for anthropic.Anthropic: replays canned final messages, records requests."""

    def __init__(self, *finals: tuple[str, str]) -> None:
        self.finals = list(finals)
        self.requests: list[dict[str, object]] = []
        self.beta = SimpleNamespace(messages=SimpleNamespace(stream=self.stream))

    def stream(self, **kwargs: object) -> FakeStream:
        messages = kwargs["messages"]
        assert isinstance(messages, list)
        self.requests.append({**kwargs, "messages": list(messages)})
        stop_reason, text = self.finals.pop(0)
        return FakeStream(message(stop_reason, text, searches=3), text)

    def client(self) -> anthropic.Anthropic:
        return cast(anthropic.Anthropic, self)


def test_user_content_puts_pdfs_first_and_the_task_last() -> None:
    content = [dict(block) for block in build_user_content("Course", "CORPUS", [Pdf("Sum", b"%")])]
    assert [block["type"] for block in content] == ["document", "text", "text"]
    assert content[0]["title"] == "Sum"
    assert content[1]["text"] == "<corpus>\nCORPUS</corpus>"
    assert '"Course"' in str(content[2]["text"])


def test_write_summary_streams_and_returns_text_and_usage() -> None:
    fake = FakeClient(("end_turn", "# Course\n\nBody"))
    chunks: list[str] = []
    text, usage = write_summary(fake.client(), "Course", "corpus", [], chunks.append)
    assert text == "# Course\n\nBody\n"
    assert chunks == ["# Course\n\nBody"]
    assert (usage.input_tokens, usage.output_tokens, usage.web_searches) == (100, 10, 3)
    request = fake.requests[0]
    assert request["model"] == "claude-opus-5-5"
    assert request["thinking"] == {"type": "adaptive"}
    assert request["fallbacks"] == "default"


def test_pause_turn_is_continued_and_text_joined() -> None:
    fake = FakeClient(("pause_turn", "# Course\n\nPart one. "), ("end_turn", "Part two."))
    text, usage = write_summary(fake.client(), "Course", "corpus", [])
    assert text == "# Course\n\nPart one. Part two.\n"
    assert usage.input_tokens == 200
    second = fake.requests[1]["messages"]
    assert isinstance(second, list)
    assert [turn["role"] for turn in second] == ["user", "assistant"]


@pytest.mark.parametrize(("stop", "match"), [("refusal", "declined"), ("max_tokens", "limit")])
def test_unusable_endings_raise(stop: str, match: str) -> None:
    fake = FakeClient((stop, "partial"))
    with pytest.raises(SummaryError, match=match):
        write_summary(fake.client(), "Course", "corpus", [])


def test_estimated_cost() -> None:
    usage = Usage(
        input_tokens=1_000_000, output_tokens=100_000, cache_read_tokens=1_000_000, web_searches=10
    )
    assert usage.estimated_cost() == pytest.approx(4.00 + 2.00 + 0.20 + 0.10)
