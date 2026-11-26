from collections.abc import Callable
from pathlib import Path

import pytest
from summarizer.corpus import image_jobs, render_course, shown_images, unescape_answer
from summarizer.course import Course, parse_course_file, parse_lesson_file

from tests.summarizer.conftest import frame


def test_shown_images_skip_leftover_components() -> None:
    labels = [image.label for image in shown_images(frame())]
    assert sorted(labels) == ["inline_code", "shown"]


def test_unescape_answer_only_touches_quotes() -> None:
    assert unescape_answer('isn\\\'t \\"nice\\"') == 'isn\'t "nice"'
    assert unescape_answer('print("a\\nb")') == 'print("a\\nb")'


def test_render_course_content(make_course: Callable[..., Course]) -> None:
    captions = {
        "https://uploads.example/inline_code.png": (
            "```python\nprint('hi')\n```\nShows a print call."
        ),
        "https://uploads.example/shown.png": "Decorative: Python logo",
    }
    corpus = render_course(make_course(), captions)
    assert corpus.startswith("# Course: Python I: Fundamentals\n")
    assert "## Lesson 1.1: Basics" in corpus
    assert "Putting It Together" not in corpus, "graded lessons are left out"
    assert "internal editing chatter" not in corpus, "author comments are left out"
    assert "leftover" not in corpus
    assert "Key terms (define them from the slides): print()" in corpus
    assert "- Print things. (slides 1)" in corpus
    assert "Learning objective: Print things." in corpus
    assert "- Explain print()." in corpus
    # The inline image is replaced in place by its description; the shown one is appended.
    assert "Look: [Image: inline_code]\n\n```python\nprint('hi')\n```" in corpus
    assert "[Image: Decorative: Python logo]" in corpus
    assert "  - ✓ yes — Feedback: Right!" in corpus
    assert "  - ✗ no — Feedback: Common slip." in corpus
    assert "  - Typed answer: `isn't`" in corpus


def test_images_without_a_description_appear_by_label(make_course: Callable[..., Course]) -> None:
    assert "[Image: shown (no description)]" in render_course(make_course(), {})


def test_image_jobs_cover_only_ungraded_lessons(make_course: Callable[..., Course]) -> None:
    jobs = image_jobs(make_course())
    assert sorted(jobs) == [
        "https://uploads.example/inline_code.png",
        "https://uploads.example/shown.png",
    ]
    _, context = jobs["https://uploads.example/shown.png"]
    assert context.startswith("Look:")


SAMPLE = (
    Path(__file__).resolve().parents[4] / "sync_server/sync_files/courses/python_1_fundamentals"
)


@pytest.mark.skipif(not SAMPLE.exists(), reason="sync_files clone not present")
def test_real_course() -> None:
    lessons = [
        parse_lesson_file(p.name, p.read_bytes())
        for p in sorted((SAMPLE / "lessons").glob("*.json"))
    ]
    course = parse_course_file(SAMPLE.name, (SAMPLE / "course.json").read_bytes(), lessons)
    assert course.missing_lesson_ids() == []
    assert len(course.ungraded_lessons()) == 9, "the SmartCase is excluded"
    assert len(image_jobs(course)) == 136
    corpus = render_course(course, {})
    assert "Putting the Python Pieces Together" not in corpus
    assert corpus.count("## Lesson ") == 9
