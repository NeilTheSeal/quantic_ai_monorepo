import json
from collections.abc import Callable

import pytest
from summarizer.course import Course, Lesson, parse_course_file, parse_lesson_file

RIGHT = "aaaaaaaa-0000-0000-0000-000000000001"
WRONG = "aaaaaaaa-0000-0000-0000-000000000002"
ROOT = "bbbbbbbb-0000-0000-0000-000000000001"
TEXT = "bbbbbbbb-0000-0000-0000-000000000002"
SHOWN = "cccccccc-0000-0000-0000-000000000001"
LEFTOVER = "cccccccc-0000-0000-0000-000000000002"
INLINE = "cccccccc-0000-0000-0000-000000000003"


def image(cid: str, label: str) -> dict[str, object]:
    url = f"https://uploads.example/{label}.png"
    return {
        "id": cid,
        "component_type": "ComponentizedFrame.Image",
        "label": label,
        "image": {"formats": {"original": {"url": url}}},
    }


def frame(frame_id: str = "f1") -> dict[str, object]:
    """A slide with one shown image, one inline image, one leftover, and a question."""
    return {
        "id": frame_id,
        "main_ui_component_id": ROOT,
        "author_comments": [{"text": "internal editing chatter"}],
        "components": [
            {
                "id": ROOT,
                "component_type": "ComponentizedFrame.TextImageInteractive",
                "content_for_text_id": TEXT,
                "content_for_image_id": SHOWN,
            },
            {
                "id": TEXT,
                "component_type": "ComponentizedFrame.Text",
                "text": "Look: !![inline_code]{left}",
            },
            image(SHOWN, "shown"),
            image(LEFTOVER, "leftover"),
            image(INLINE, "inline_code"),
        ],
        "tutor_bot_description": {
            "type": "basic_multiple_choice",
            "instructions": "Select an answer",
            "main_text": "Look: !![inline_code]{left}",
            "challenges": [
                {
                    "answers": [
                        {"id": RIGHT, "is_correct": True, "text": "yes", "message": "Right!"},
                        {"id": WRONG, "is_correct": False, "text": "no", "message": "Common slip."},
                    ]
                },
                {"correct_answer_text": "isn\\'t"},
            ],
        },
    }


def lesson_record(lesson_id: str, title: str, number: int, **flags: object) -> bytes:
    lesson = {
        "id": lesson_id,
        "title": title,
        "assessment": False,
        "test": False,
        "key_terms": ["print()"],
        "description": ["Use print()."],
        "frames": [frame(f"{lesson_id}-f1")],
        **flags,
    }
    capture = {"chapter_number": 1, "lesson_number": number}
    return json.dumps({"capture": capture, "lesson": lesson}).encode()


def course_record(lesson_ids: list[str], **flags: object) -> bytes:
    stream = {
        "title": "Python I: Fundamentals",
        "exam": False,
        "description": "Basics.",
        "chapters": [
            {
                "title": "Ch",
                "lesson_hashes": [{"lesson_id": i} for i in lesson_ids]
                + [{"lesson_id": "future", "coming_soon": True}],
            }
        ],
        "summaries": [
            {"title": "Summary PDF", "url": "https://uploads.example/s.pdf", "type": "pdf"}
        ],
        "resource_downloads": [
            {"title": "Syntax", "url": "https://uploads.example/r.pdf", "type": "pdf"}
        ],
        "stream_lesson_tutor_bot_records": [
            {
                "lesson_id": "l1",
                "outline": {
                    "learning_objectives": [{"title": "Print things.", "frame_ids": ["l1-f1"]}]
                },
                "post_lesson_review_message": "Explain print().",
            }
        ],
        **flags,
    }
    return json.dumps({"capture": {}, "stream": stream}).encode()


@pytest.fixture
def make_course() -> Callable[..., Course]:
    def build(**flags: object) -> Course:
        lessons: list[Lesson] = [
            parse_lesson_file("01-01_basics.json", lesson_record("l1", "Basics", 1)),
            parse_lesson_file(
                "01-02_smartcase.json",
                lesson_record("l2", "Putting It Together", 2, assessment=True),
            ),
        ]
        return parse_course_file(
            "python_1_fundamentals", course_record(["l1", "l2"], **flags), lessons
        )

    return build
