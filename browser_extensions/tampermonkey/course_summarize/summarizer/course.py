"""A captured course as stored by the userscript: course.json plus one file per lesson."""

import json
import re
from dataclasses import dataclass

from summarizer.jsonutil import JsonObject, arr, obj, objs, text

GRADED_TITLE = re.compile(r"\bsmart\s*cases?\b|\bexams?\b|\bassessments?\b", re.IGNORECASE)


@dataclass(frozen=True, slots=True)
class Lesson:
    file_name: str
    raw: JsonObject
    capture: JsonObject

    @property
    def id(self) -> str:
        return text(self.raw.get("id")) or ""

    @property
    def title(self) -> str:
        return text(self.raw.get("title")) or self.file_name

    @property
    def frames(self) -> list[JsonObject]:
        return objs(self.raw.get("frames"))

    @property
    def number(self) -> str:
        """'1.3' for chapter 1, lesson 3."""
        return f"{self.capture.get('chapter_number')}.{self.capture.get('lesson_number')}"


@dataclass(frozen=True, slots=True)
class Course:
    slug: str
    stream: JsonObject
    lessons: list[Lesson]

    @property
    def title(self) -> str:
        return text(self.stream.get("title")) or self.slug

    def required_lesson_ids(self) -> list[str]:
        """Every lesson in the chapter outline that has been released."""
        ids: list[str] = []
        for chapter in objs(self.stream.get("chapters")):
            for entry in objs(chapter.get("lesson_hashes")):
                lesson_id = text(entry.get("lesson_id"))
                if lesson_id is not None and entry.get("coming_soon") is not True:
                    ids.append(lesson_id)
        return ids

    def missing_lesson_ids(self) -> list[str]:
        captured = {lesson.id for lesson in self.lessons}
        return [i for i in self.required_lesson_ids() if i not in captured]

    def is_graded(self, lesson: Lesson) -> bool:
        """Graded or unflagged content (SmartCases, exams): never summarized."""
        return (
            self.stream.get("exam") is not False
            or lesson.raw.get("assessment") is not False
            or lesson.raw.get("test") is not False
            or GRADED_TITLE.search(lesson.title) is not None
            or GRADED_TITLE.search(self.title) is not None
        )

    def ungraded_lessons(self) -> list[Lesson]:
        return [lesson for lesson in self.lessons if not self.is_graded(lesson)]

    def outline_record(self, lesson_id: str) -> JsonObject:
        """The tutor-bot record (learning objectives, review prompts) for a lesson."""
        for record in objs(self.stream.get("stream_lesson_tutor_bot_records")):
            if record.get("lesson_id") == lesson_id:
                return record
        return {}

    def pdfs(self) -> list[tuple[str, str]]:
        """(title, url) of Quantic's PDFs for the course: its summaries and resource downloads."""
        found: list[tuple[str, str]] = []
        for item in objs(self.stream.get("summaries")) + objs(
            self.stream.get("resource_downloads")
        ):
            url = text(item.get("url"))
            if url is not None and (item.get("type") == "pdf" or url.lower().endswith(".pdf")):
                found.append((text(item.get("title")) or url.rsplit("/", 1)[-1], url))
        return found


def parse_lesson_file(file_name: str, body: bytes) -> Lesson:
    record = obj(json.loads(body))
    return Lesson(
        file_name=file_name, raw=obj(record.get("lesson")), capture=obj(record.get("capture"))
    )


def parse_course_file(slug: str, body: bytes, lessons: list[Lesson]) -> Course:
    stream = obj(obj(json.loads(body)).get("stream"))
    return Course(
        slug=slug, stream=stream, lessons=sorted(lessons, key=lambda lesson: lesson.file_name)
    )


def chapter_titles(stream: JsonObject) -> list[str]:
    return [text(c.get("title")) or "" for c in objs(stream.get("chapters"))]


def string_list(value: object) -> list[str]:
    return [s for s in (text(v) for v in arr(value)) if s is not None]
