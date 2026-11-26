"""Writes a course study guide with Claude Opus 5.5 from the corpus and Quantic's PDFs."""

import base64
import re
from collections.abc import Callable, Sequence
from dataclasses import dataclass

import anthropic
from anthropic.types.beta import (
    BetaContentBlock,
    BetaMessage,
    BetaMessageParam,
    BetaRequestDocumentBlockParam,
    BetaTextBlockParam,
    BetaToolUnionParam,
)

SUMMARY_MODEL = "claude-opus-5-5"
MAX_TOKENS = 128_000  # the model's output maximum: thinking and the whole guide share it
MAX_CONTINUATIONS = 5
FALLBACK_BETA = "server-side-fallback-2026-07-01"
WEB_SEARCH: BetaToolUnionParam = {
    "type": "web_search_20260209",
    "name": "web_search",
    "max_uses": 20,
}

# Claude Opus 5.5 list prices (USD per million tokens) and web search (per search), for the
# cost estimate printed after each run.
PRICE_INPUT = 4.00
PRICE_OUTPUT = 20.00
PRICE_CACHE_WRITE = 5.00
PRICE_CACHE_READ = 0.20
PRICE_PER_SEARCH = 0.01

SYSTEM_PROMPT = """\
You write lasting study guides from Quantic School of Business and Technology course material. \
The reader is an experienced software engineer taking Quantic's MS in AI Engineering. Each \
guide has two jobs, and the reader must always be able to tell them apart.

1. Exam review in Quantic's terms. Capture how Quantic teaches the material: its definitions, \
terminology, conventions, examples, and emphasis. Keep Quantic's wording for definitions and \
key claims; short quotes are welcome. Where Quantic teaches something differently from other \
common sources, or simplifies it, present Quantic's version as the course's answer and note \
the difference.

2. A permanent record for learning after the course is gone. The lessons become inaccessible \
after graduation, so the guide has to stand in for them: complete enough that nothing taught \
is lost. Beyond that, help the reader actually learn the subject: add background, fill gaps \
the course skips, explain why things work, add worked examples, and point to further reading.

Course material forms the body of the guide. Everything you add from outside the course goes \
in a blockquote that begins `> **Beyond the course:**`, except in the guide's two closing \
sections, "Where Quantic differs from other sources" and "Further reading", which are yours by \
definition. Never attribute your additions to Quantic."""

TASK = """\
Above is Quantic's course "{title}": its own PDFs (a course summary and handouts, which count \
as Quantic material) and the captured lessons, slide by slide.

How to read the corpus: each slide gives its instructions, its text (popover asides are \
inlined in parentheses), transcriptions of its images, and its practice questions with the \
correct (✓) and incorrect (✗) answers and Quantic's feedback on each; options marked • are \
polls or reflections with no right answer. Feedback on wrong answers often names a common \
mistake. Key-term lists name terms without definitions; define each from \
the slides. Graded assessments are deliberately left out; don't speculate about them.

Write the study guide as one Markdown document:

- `# {title}`, then a short overview of what the course covers and how it is organized.
- One section per lesson (`## Lesson 1.1: Title`) covering everything it teaches: concepts, \
Quantic's definitions (term in bold), syntax and code examples in fenced code blocks, the \
practices and conventions Quantic recommends, and common mistakes drawn from the practice \
feedback. End each lesson section with a short "What the practice questions checked" list.
- Beyond-the-course material inside each lesson section, where it helps understanding, in the \
blockquote format described above.
- `## Glossary`: every key term, alphabetically, defined as Quantic uses it.
- `## Where Quantic differs from other sources`: conventions or simplifications worth knowing \
about. Leave the section out if there are none.
- `## Further reading`: resources for going deeper, grouped by topic. Confirm each link with \
web search and include only links you found, each with one line on why it's useful. Prefer \
official documentation and long-lived references.

Completeness matters more than brevity, because the reader can't go back to the lessons; \
leave out filler. Keep software-setup and file-saving steps brief unless they teach something \
lasting. Use clean Markdown: one H1, blank lines around headings and code blocks, a language on \
every code fence, no emoji.

Do all of your web searches before you start writing, then write the document in one pass. \
Your text output is saved verbatim as the guide, so output only the document: no preamble, no \
remarks about searching, nothing after it."""


class SummaryError(RuntimeError):
    def __init__(self, message: str, partial: str = "") -> None:
        super().__init__(message)
        self.partial = partial


@dataclass(slots=True)
class Usage:
    model: str = SUMMARY_MODEL
    input_tokens: int = 0
    output_tokens: int = 0
    cache_write_tokens: int = 0
    cache_read_tokens: int = 0
    web_searches: int = 0

    def add(self, message: BetaMessage) -> None:
        usage = message.usage
        self.model = message.model
        self.input_tokens += usage.input_tokens
        self.output_tokens += usage.output_tokens
        self.cache_write_tokens += usage.cache_creation_input_tokens or 0
        self.cache_read_tokens += usage.cache_read_input_tokens or 0
        if usage.server_tool_use is not None:
            self.web_searches += usage.server_tool_use.web_search_requests

    def estimated_cost(self) -> float:
        """USD at Claude Opus 5.5 list prices (an estimate if a fallback model served it)."""
        return (
            self.input_tokens * PRICE_INPUT
            + self.output_tokens * PRICE_OUTPUT
            + self.cache_write_tokens * PRICE_CACHE_WRITE
            + self.cache_read_tokens * PRICE_CACHE_READ
        ) / 1_000_000 + self.web_searches * PRICE_PER_SEARCH


@dataclass(frozen=True, slots=True)
class Pdf:
    title: str
    data: bytes


def build_user_content(
    title: str, corpus: str, pdfs: list[Pdf]
) -> list[BetaRequestDocumentBlockParam | BetaTextBlockParam]:
    """PDFs first, then the corpus, then the task (long material before the question)."""
    content: list[BetaRequestDocumentBlockParam | BetaTextBlockParam] = []
    for pdf in pdfs:
        content.append(
            {
                "type": "document",
                "source": {
                    "type": "base64",
                    "media_type": "application/pdf",
                    "data": base64.standard_b64encode(pdf.data).decode(),
                },
                "title": pdf.title,
            }
        )
    content.append({"type": "text", "text": f"<corpus>\n{corpus}</corpus>"})
    content.append({"type": "text", "text": TASK.format(title=title)})
    return content


def response_text(blocks: Sequence[BetaContentBlock]) -> str:
    """The document text in a response (search results and thinking are not part of it).

    After a mid-output refusal fallback, the declined model's partial text stays: the fallback
    model continues from it.
    """
    return "".join(block.text for block in blocks if block.type == "text")


def extract_document(text: str) -> str:
    """The guide from its H1 on, dropping any stray remarks the model wrote before it."""
    match = re.search(r"^# ", text, flags=re.MULTILINE)
    return (text[match.start() :] if match else text).strip() + "\n"


def echo_content(blocks: Sequence[BetaContentBlock]) -> list[BetaContentBlock]:
    """A turn's content as it must be sent back to continue it.

    Before the last `fallback` block (a model that declined mid-output), the API rejects
    thinking, tool-use, unpaired server-tool-use and unrecognized blocks; text, paired
    server-tool blocks and the `fallback` block itself are kept in place.
    """
    boundary = max((i for i, b in enumerate(blocks) if b.type == "fallback"), default=-1)
    result_ids = {
        tool_use_id
        for b in blocks
        if b.type.endswith("_tool_result")
        and isinstance(tool_use_id := getattr(b, "tool_use_id", None), str)
    }
    kept: list[BetaContentBlock] = []
    for i, block in enumerate(blocks):
        if i < boundary:
            if block.type == "server_tool_use":
                if block.id not in result_ids:
                    continue
            elif not (block.type in ("text", "fallback") or block.type.endswith("_tool_result")):
                continue
        kept.append(block)
    return kept


def write_summary(
    client: anthropic.Anthropic,
    title: str,
    corpus: str,
    pdfs: list[Pdf],
    on_text: Callable[[str], None] | None = None,
) -> tuple[str, Usage]:
    """The study guide as Markdown, plus token usage across the call and any continuations."""
    messages: list[BetaMessageParam] = [
        {"role": "user", "content": build_user_content(title, corpus, pdfs)}
    ]
    usage = Usage()
    parts: list[str] = []
    for _ in range(MAX_CONTINUATIONS + 1):
        with client.beta.messages.stream(
            model=SUMMARY_MODEL,
            max_tokens=MAX_TOKENS,
            system=SYSTEM_PROMPT,
            messages=messages,
            tools=[WEB_SEARCH],
            thinking={"type": "adaptive"},
            output_config={"effort": "high"},
            # Continuations after pause_turn resend the whole prefix; caching makes that cheap.
            cache_control={"type": "ephemeral"},
            betas=[FALLBACK_BETA],
            fallbacks="default",
        ) as stream:
            for event in stream:
                if event.type == "text" and on_text is not None:
                    on_text(event.text)
            response = stream.get_final_message()
        usage.add(response)
        parts.append(response_text(response.content))

        match response.stop_reason:
            case "end_turn" | "stop_sequence":
                return extract_document("".join(parts)), usage
            case "pause_turn":
                # The server-side search loop paused; send the turn back so it continues.
                messages.append({"role": "assistant", "content": echo_content(response.content)})
                continue
            case "refusal":
                raise SummaryError("The model declined to write the summary", "".join(parts))
            case "max_tokens":
                raise SummaryError(
                    f"The summary hit the {MAX_TOKENS}-token output limit", "".join(parts)
                )
            case other:
                # model_context_window_exceeded, tool_use, None...: never save a cut-off guide.
                raise SummaryError(f"The summary stopped early ({other})", "".join(parts))
    raise SummaryError(f"Still paused after {MAX_CONTINUATIONS} continuations", "".join(parts))
