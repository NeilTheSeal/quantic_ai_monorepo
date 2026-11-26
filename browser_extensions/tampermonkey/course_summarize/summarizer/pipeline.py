"""Finds captured courses without a summary and summarizes them, one at a time."""

import json
import logging
from collections.abc import Callable
from dataclasses import asdict, dataclass, field
from datetime import UTC, datetime
from pathlib import Path
from typing import Protocol

import anthropic

from summarizer.captions import describe_images
from summarizer.corpus import ImageRef, image_jobs, render_course
from summarizer.course import Course, parse_course_file, parse_lesson_file
from summarizer.fetch import download
from summarizer.summary import Pdf, SummaryError, Usage, write_summary
from summarizer.webdav import Entry

COURSES = "courses"
MARKDOWN = "text/markdown; charset=utf-8"
log = logging.getLogger(__name__)


class Store(Protocol):
    def listdir(self, path: str) -> list[Entry]: ...
    def get(self, path: str) -> bytes | None: ...
    def put(self, path: str, body: bytes, content_type: str) -> None: ...


type Describe = Callable[[dict[str, tuple[ImageRef, str]], dict[str, str]], int]
type Summarize = Callable[[str, str, list[Pdf]], tuple[str, Usage]]
type Fetch = Callable[[str], bytes]


@dataclass(slots=True)
class Services:
    """What the pipeline calls out to; tests swap these for fakes."""

    describe: Describe
    summarize: Summarize
    fetch: Fetch = download
    now: Callable[[], datetime] = field(default=lambda: datetime.now(UTC))


def anthropic_services(client: anthropic.Anthropic) -> Services:
    def progress(done: int, total: int) -> None:
        if done == total or done % 20 == 0:
            log.info("  described %d/%d images", done, total)

    written = 0

    def on_text(chunk: str) -> None:
        nonlocal written
        before = written
        written += len(chunk)
        if written // 5000 > before // 5000:
            log.info("  writing… %s characters", f"{written:,}")

    return Services(
        describe=lambda jobs, cache: describe_images(client, jobs, cache, progress),
        summarize=lambda title, corpus, pdfs: write_summary(client, title, corpus, pdfs, on_text),
    )


def working_path(slug: str, name: str) -> str:
    return f"{COURSES}/{slug}/working/{name}"


def course_slugs(store: Store) -> list[str]:
    return [entry.name for entry in store.listdir(COURSES) if entry.is_dir]


def load_course(store: Store, slug: str) -> Course | None:
    course_body = store.get(f"{COURSES}/{slug}/course.json")
    if course_body is None:
        return None
    lessons = []
    for entry in store.listdir(f"{COURSES}/{slug}/lessons"):
        if entry.is_dir or not entry.name.endswith(".json"):
            continue
        body = store.get(f"{COURSES}/{slug}/lessons/{entry.name}")
        if body is not None:
            lessons.append(parse_lesson_file(entry.name, body))
    return parse_course_file(slug, course_body, lessons)


def _load_captions(store: Store, slug: str) -> dict[str, str]:
    body = store.get(working_path(slug, "image_captions.json"))
    if body is None:
        return {}
    raw = json.loads(body)
    if not isinstance(raw, dict):
        return {}
    return {str(k): v for k, v in raw.items() if isinstance(v, str)}


def _put_json(store: Store, path: str, value: object) -> None:
    body = json.dumps(value, indent=2, ensure_ascii=False, sort_keys=True).encode()
    store.put(path, body + b"\n", "application/json; charset=utf-8")


def _fetch_pdfs(course: Course, fetch: Fetch) -> list[Pdf]:
    pdfs: list[Pdf] = []
    for title, url in course.pdfs():
        try:
            pdfs.append(Pdf(title=title, data=fetch(url)))
        except (OSError, ValueError) as err:
            log.warning("  skipping PDF %r: %s", title, err)
    return pdfs


def footer(when: datetime, model: str, lesson_count: int) -> str:
    return (
        "\n---\n\n"
        f"*Generated {when:%Y-%m-%d} by `summarize.py` with {model} from {lesson_count} "
        "ungraded lessons and Quantic's course PDFs. Quoted definitions are Quantic's; "
        "blockquotes marked Beyond the course are not.*\n"
    )


def summarize_course(store: Store, slug: str, output_root: Path, services: Services) -> str:
    """Summarizes one course if it is complete and not yet summarized. Returns a status line."""
    local = output_root / slug / "summary.md"
    remote = store.get(working_path(slug, "summary.md"))
    if local.exists():
        if remote is None:
            # An earlier run wrote the local file but its upload failed; finish the upload so
            # the other machine doesn't pay for the course again.
            store.put(working_path(slug, "summary.md"), local.read_bytes(), MARKDOWN)
            return "already summarized (uploaded the missing server copy)"
        return "already summarized"
    if remote is not None:
        # Summarized on the other machine: restore the local copy instead of paying again.
        local.parent.mkdir(parents=True, exist_ok=True)
        local.write_bytes(remote)
        return f"restored {local} from the sync server"

    course = load_course(store, slug)
    if course is None:
        return "skipped: no course.json"
    missing = course.missing_lesson_ids()
    if missing:
        required = len(course.required_lesson_ids())
        return f"skipped: {required - len(missing)} of {required} lessons captured"
    lessons = course.ungraded_lessons()
    if not lessons:
        return "skipped: no ungraded lessons"

    log.info("Summarizing %s (%d ungraded lessons)", course.title, len(lessons))
    excluded = [lesson.title for lesson in course.lessons if course.is_graded(lesson)]
    if excluded:
        log.info("  leaving out graded lessons: %s", "; ".join(excluded))
    captions = _load_captions(store, slug)
    jobs = image_jobs(course)
    new = [url for url in jobs if url not in captions]
    if new:
        log.info("  describing %d new images (%d cached)", len(new), len(jobs) - len(new))
        try:
            failures = services.describe(jobs, captions)
        except BaseException:
            # Keep what was described so a re-run only pays for the rest, but never let a
            # failed save hide the original error.
            try:
                _put_json(store, working_path(slug, "image_captions.json"), captions)
            except Exception as save_err:  # any store failure: logged, the original error wins
                log.warning("  could not save image descriptions: %s", save_err)
            raise
        _put_json(store, working_path(slug, "image_captions.json"), captions)
        if failures:
            # A summary without its code screenshots would be permanent; stop and let a
            # re-run retry just the failed images.
            raise SummaryError(f"{failures} images could not be described; run again to retry")

    corpus = render_course(course, captions)
    store.put(working_path(slug, "corpus.md"), corpus.encode(), MARKDOWN)
    pdfs = _fetch_pdfs(course, services.fetch)
    log.info("  corpus %s characters, %d PDFs; calling the model", f"{len(corpus):,}", len(pdfs))

    try:
        markdown, usage = services.summarize(course.title, corpus, pdfs)
    except SummaryError as err:
        if err.partial:
            # Paid-for output; keep it for inspection. It never counts as a summary.
            store.put(working_path(slug, "summary_partial.md"), err.partial.encode(), MARKDOWN)
        raise
    when = services.now()
    document = markdown + footer(when, usage.model, len(lessons))

    # Server first: a local file alone would mark the course done on this machine only.
    store.put(working_path(slug, "summary.md"), document.encode(), MARKDOWN)
    local.parent.mkdir(parents=True, exist_ok=True)
    local.write_text(document, encoding="utf-8")
    _put_json(
        store,
        working_path(slug, "summary_meta.json"),
        {
            "generated_at": when.isoformat(),
            "lessons": [lesson.file_name for lesson in lessons],
            "pdfs": [pdf.title for pdf in pdfs],
            "images_described": len(captions),
            "usage": asdict(usage),
            "estimated_cost_usd": round(usage.estimated_cost(), 4),
        },
    )
    return f"wrote {local} (≈${usage.estimated_cost():.2f})"
