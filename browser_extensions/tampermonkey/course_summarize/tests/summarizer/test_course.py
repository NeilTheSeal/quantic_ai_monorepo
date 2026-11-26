from collections.abc import Callable

import pytest
from summarizer.course import Course, parse_course_file, parse_lesson_file

from tests.summarizer.conftest import course_record, lesson_record


def test_complete_course_has_no_missing_lessons(make_course: Callable[..., Course]) -> None:
    course = make_course()
    assert course.required_lesson_ids() == ["l1", "l2"], "coming-soon lessons aren't required"
    assert course.missing_lesson_ids() == []


def test_missing_lessons_are_reported() -> None:
    lessons = [parse_lesson_file("01-01_basics.json", lesson_record("l1", "Basics", 1))]
    course = parse_course_file("c", course_record(["l1", "l2", "l3"]), lessons)
    assert course.missing_lesson_ids() == ["l2", "l3"]


def test_graded_lessons_are_excluded(make_course: Callable[..., Course]) -> None:
    course = make_course()
    assert [lesson.title for lesson in course.ungraded_lessons()] == ["Basics"]


@pytest.mark.parametrize("flags", [{"exam": True}, {"exam": None}, {"title": "Final Exam"}])
def test_graded_or_unflagged_courses_have_no_ungraded_lessons(
    make_course: Callable[..., Course], flags: dict[str, object]
) -> None:
    assert make_course(**flags).ungraded_lessons() == []


@pytest.mark.parametrize(
    ("title", "graded"),
    [("SmartCase: Lists", True), ("Smart Case 2", True), ("Worked Examples", False)],
)
def test_title_guard(title: str, graded: bool) -> None:
    lessons = [parse_lesson_file("x.json", lesson_record("l1", title, 1))]
    course = parse_course_file("c", course_record(["l1"]), lessons)
    assert course.is_graded(course.lessons[0]) is graded


def test_pdfs_include_summaries_and_resources(make_course: Callable[..., Course]) -> None:
    assert [title for title, _ in make_course().pdfs()] == ["Summary PDF", "Syntax"]


def test_lesson_number_comes_from_the_capture_block(make_course: Callable[..., Course]) -> None:
    assert make_course().lessons[0].number == "1.1"
