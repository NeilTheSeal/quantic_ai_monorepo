import json
from datetime import UTC, datetime
from pathlib import Path

import pytest
from summarizer.corpus import ImageRef
from summarizer.pipeline import Services, course_slugs, summarize_course
from summarizer.summary import Pdf, Usage
from summarizer.webdav import Entry

from tests.summarizer.conftest import course_record, lesson_record

SLUG = "python_1_fundamentals"


class MemoryStore:
    """The sync server's WebDAV surface over a dict of path -> bytes."""

    def __init__(self, files: dict[str, bytes]) -> None:
        self.files = dict(files)
        self.puts: list[str] = []

    def listdir(self, path: str) -> list[Entry]:
        prefix = path.strip("/") + "/"
        names: dict[str, bool] = {}
        for key in self.files:
            if key.startswith(prefix):
                head, _, rest = key[len(prefix) :].partition("/")
                names[head] = names.get(head, False) or bool(rest)
        return [Entry(name, is_dir) for name, is_dir in sorted(names.items())]

    def get(self, path: str) -> bytes | None:
        return self.files.get(path)

    def put(self, path: str, body: bytes, content_type: str) -> None:
        self.files[path] = body
        self.puts.append(path)


def captured(lesson_ids: tuple[str, ...] = ("l1", "l2")) -> dict[str, bytes]:
    files = {f"courses/{SLUG}/course.json": course_record(["l1", "l2"])}
    titles = {"l1": "Basics", "l2": "Putting It Together"}
    for n, lesson_id in enumerate(lesson_ids, start=1):
        flags = {"assessment": True} if lesson_id == "l2" else {}
        files[f"courses/{SLUG}/lessons/01-0{n}_{lesson_id}.json"] = lesson_record(
            lesson_id, titles[lesson_id], n, **flags
        )
    return files


class Recorder:
    def __init__(self, fail_describe: bool = False) -> None:
        self.described: list[str] = []
        self.summarized: list[tuple[str, str, list[str]]] = []
        self.fail_describe = fail_describe

    def describe(self, jobs: dict[str, tuple[ImageRef, str]], cache: dict[str, str]) -> int:
        for url in jobs:
            if url in cache:
                continue
            if self.fail_describe:
                raise OSError("network down")
            cache[url] = f"description of {url}"
            self.described.append(url)
        return 0

    def summarize(self, title: str, corpus: str, pdfs: list[Pdf]) -> tuple[str, Usage]:
        self.summarized.append((title, corpus, [pdf.title for pdf in pdfs]))
        return "# Python I: Fundamentals\n\nGuide.\n", Usage(input_tokens=1000, output_tokens=100)

    def services(self) -> Services:
        return Services(
            describe=self.describe,
            summarize=self.summarize,
            fetch=lambda url: b"%PDF-1.7 " + url.encode(),
            now=lambda: datetime(2026, 11, 26, tzinfo=UTC),
        )


def test_course_slugs_lists_folders_only() -> None:
    store = MemoryStore({**captured(), "courses/README.md": b"x"})
    assert course_slugs(store) == [SLUG]


def test_full_run_writes_summary_and_working_files(tmp_path: Path) -> None:
    store = MemoryStore(captured())
    recorder = Recorder()
    status = summarize_course(store, SLUG, tmp_path, recorder.services())

    local = tmp_path / SLUG / "summary.md"
    assert status.startswith(f"wrote {local}")
    document = local.read_text()
    assert document.startswith("# Python I: Fundamentals\n")
    assert (
        "*Generated 2026-11-26 by `summarize.py` with claude-opus-5-5 from 1 ungraded" in document
    )

    working = f"courses/{SLUG}/working/"
    assert store.files[working + "summary.md"].decode() == document
    assert sorted(p.removeprefix(working) for p in store.puts) == [
        "corpus.md",
        "image_captions.json",
        "summary.md",
        "summary_meta.json",
    ]
    captions = json.loads(store.files[working + "image_captions.json"])
    assert len(captions) == 2

    title, corpus, pdfs = recorder.summarized[0]
    assert title == "Python I: Fundamentals"
    assert "Putting It Together" not in corpus
    assert "description of https://uploads.example/shown.png" in corpus
    assert pdfs == ["Summary PDF", "Syntax"]
    meta = json.loads(store.files[working + "summary_meta.json"])
    assert meta["lessons"] == ["01-01_l1.json"]
    assert meta["estimated_cost_usd"] == pytest.approx(0.006)


def test_existing_local_summary_is_left_alone(tmp_path: Path) -> None:
    (tmp_path / SLUG).mkdir()
    (tmp_path / SLUG / "summary.md").write_text("mine")
    store = MemoryStore(captured())
    recorder = Recorder()
    assert summarize_course(store, SLUG, tmp_path, recorder.services()) == "already summarized"
    assert recorder.summarized == []
    assert store.puts == []


def test_summary_from_the_other_machine_is_restored_not_regenerated(tmp_path: Path) -> None:
    store = MemoryStore({**captured(), f"courses/{SLUG}/working/summary.md": b"# From desktop\n"})
    recorder = Recorder()
    status = summarize_course(store, SLUG, tmp_path, recorder.services())
    assert status.startswith("restored")
    assert (tmp_path / SLUG / "summary.md").read_text() == "# From desktop\n"
    assert recorder.summarized == []


def test_incomplete_course_is_skipped(tmp_path: Path) -> None:
    store = MemoryStore(captured(("l1",)))
    recorder = Recorder()
    status = summarize_course(store, SLUG, tmp_path, recorder.services())
    assert status == "skipped: 1 of 2 lessons captured"
    assert recorder.summarized == []
    assert not (tmp_path / SLUG).exists()


def test_cached_descriptions_are_reused(tmp_path: Path) -> None:
    cache = {
        "https://uploads.example/shown.png": "cached",
        "https://uploads.example/inline_code.png": "cached",
    }
    store = MemoryStore(
        {**captured(), f"courses/{SLUG}/working/image_captions.json": json.dumps(cache).encode()}
    )
    recorder = Recorder()
    summarize_course(store, SLUG, tmp_path, recorder.services())
    assert recorder.described == []
    assert f"courses/{SLUG}/working/image_captions.json" not in store.puts


def test_descriptions_are_saved_even_when_describing_fails(tmp_path: Path) -> None:
    store = MemoryStore(captured())
    recorder = Recorder(fail_describe=True)
    with pytest.raises(OSError):
        summarize_course(store, SLUG, tmp_path, recorder.services())
    assert f"courses/{SLUG}/working/image_captions.json" in store.puts
    assert recorder.summarized == []
