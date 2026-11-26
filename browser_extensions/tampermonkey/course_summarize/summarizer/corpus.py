"""Turns captured lessons into a labelled Markdown corpus for the summary model.

Each slide comes from its `tutor_bot_description` (Quantic's flattened version: instructions,
main text with popovers inlined, practice questions with correct answers and feedback). Images
are the ones actually shown on the slide, found by walking the slide's component graph, and
appear as their cached descriptions. Graded lessons, `author_comments`, and the auto-generated
`key_term_definitions` (often wrong) are left out.
"""

import re
from collections.abc import Callable
from dataclasses import dataclass

from summarizer.course import Course, Lesson, string_list
from summarizer.jsonutil import JsonObject, obj, objs, text

UUID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
INLINE_IMAGE = re.compile(r"!!\[([^\]]+)\](\{[^}]*\})?")
IMAGE_TYPE = "ComponentizedFrame.Image"
TEXT_TYPE = "ComponentizedFrame.Text"


@dataclass(frozen=True, slots=True)
class ImageRef:
    url: str
    label: str


def _ids_in(value: object) -> list[str]:
    """Component ids referenced anywhere inside a component's fields."""
    if isinstance(value, str):
        return [value] if UUID.match(value) else []
    found: list[str] = []
    if isinstance(value, list):
        for item in value:
            found.extend(_ids_in(item))
    elif isinstance(value, dict):
        for item in value.values():
            found.extend(_ids_in(item))
    return found


def reachable_components(frame: JsonObject) -> dict[str, JsonObject]:
    """Components the slide actually renders: everything reachable from its root components.

    Frames also carry leftover components (old image versions and the like) that nothing
    references; about four in five images in a lesson are such leftovers.
    """
    components = {text(c.get("id")) or "": c for c in objs(frame.get("components"))}
    seen: dict[str, JsonObject] = {}
    stack = [frame.get("main_ui_component_id"), frame.get("continue_button_id")]
    while stack:
        cid = stack.pop()
        if not isinstance(cid, str) or cid in seen or cid not in components:
            continue
        component = components[cid]
        seen[cid] = component
        for key, value in component.items():
            if key != "id":
                stack.extend(_ids_in(value))
    return seen


def inline_image_labels(markdown: str) -> set[str]:
    """Labels of images placed inline with Quantic's `!![label]{options}` syntax."""
    return {match.group(1) for match in INLINE_IMAGE.finditer(markdown)}


def _image_url(component: JsonObject) -> str | None:
    original = obj(obj(obj(component.get("image")).get("formats")).get("original"))
    return text(original.get("url"))


def shown_images(frame: JsonObject) -> list[ImageRef]:
    """Images on screen for a slide: reachable ones plus those placed inline with `!![label]`."""
    reachable = reachable_components(frame)
    inline_labels: set[str] = set()
    for component in reachable.values():
        if component.get("component_type") == TEXT_TYPE:
            inline_labels |= inline_image_labels(text(component.get("text")) or "")
    images: list[ImageRef] = []
    seen_urls: set[str] = set()
    for component in objs(frame.get("components")):
        if component.get("component_type") != IMAGE_TYPE:
            continue
        cid = text(component.get("id")) or ""
        label = text(component.get("label")) or ""
        url = _image_url(component)
        if url is None or url in seen_urls:
            continue
        if cid in reachable or label in inline_labels:
            seen_urls.add(url)
            images.append(ImageRef(url=url, label=label))
    return images


def slide_text(frame: JsonObject) -> str:
    """The slide's main text, as plain context (used when describing its images)."""
    return text(obj(frame.get("tutor_bot_description")).get("main_text")) or ""


def _describe(image: ImageRef, captions: dict[str, str]) -> str:
    caption = captions.get(image.url)
    if caption is None:
        return f"[Image: {image.label or 'untitled'} (no description)]"
    body = caption.strip()
    if body.lower().startswith("decorative"):
        return f"[Image: {body}]"
    return f"[Image: {image.label or 'untitled'}]\n\n{body}\n\n[End of image]"


def unescape_answer(value: str) -> str:
    """`isn\\'t` -> `isn't`: typed answers arrive with backslash-escaped quotes."""
    return re.sub(r"\\(['\"])", r"\1", value)


def _answer_mark(answer: JsonObject) -> str:
    """✓ correct, ✗ incorrect, • a poll or reflection option with no right answer."""
    match answer.get("is_correct"):
        case True:
            return "✓"
        case False:
            return "✗"
        case _:
            return "•"


def _render_challenge(
    index: int, challenge: JsonObject, place_images: Callable[[str], str]
) -> list[str]:
    lines: list[str] = []
    prompt = text(challenge.get("prompt_text"))
    heading = f"- Question {index}" + (f": {prompt}" if prompt else "")
    lines.append(heading)
    blank = text(challenge.get("blank_text"))
    if blank is not None and inline_image_labels(blank):
        # Image blanks (type-in answers over a screenshot): the image is the blank's context.
        lines.append(f"  - Blank: {place_images(blank)}")
    typed = text(challenge.get("correct_answer_text"))
    if typed is not None:
        lines.append(f"  - Typed answer: `{unescape_answer(typed)}`")
    for answer in objs(challenge.get("answers")):
        mark = _answer_mark(answer)
        answer_text = text(answer.get("text")) or "(image answer)"
        feedback = text(answer.get("message"))
        lines.append(f"  - {mark} {answer_text}" + (f" — Feedback: {feedback}" if feedback else ""))
    return lines


def render_slide(
    number: int, frame: JsonObject, captions: dict[str, str], objective: str | None
) -> str:
    description = obj(frame.get("tutor_bot_description"))
    instructions = text(description.get("instructions")) or "Slide"
    images = shown_images(frame)
    by_label = {image.label: image for image in images if image.label}

    def inline(match: re.Match[str]) -> str:
        image = by_label.get(match.group(1))
        return _describe(image, captions) if image else f"[Image: {match.group(1)}]"

    parts = [f"### Slide {number} ({instructions})"]
    if objective:
        parts.append(f"Learning objective: {objective}")

    def place_images(markdown: str) -> str:
        return INLINE_IMAGE.sub(inline, markdown)

    main = text(description.get("main_text"))
    challenges = objs(description.get("challenges"))
    # Images placed in the text or in a blank are described there, not again in the list.
    used_labels = inline_image_labels(main or "")
    for challenge in challenges:
        used_labels |= inline_image_labels(text(challenge.get("blank_text")) or "")
    if main:
        parts.append(place_images(main))
    for image in images:
        if image.label not in used_labels:
            parts.append(_describe(image, captions))
    if challenges:
        kind = text(description.get("type")) or "question"
        lines = [f"Practice ({kind.replace('_', ' ')}):"]
        for i, challenge in enumerate(challenges, start=1):
            lines.extend(_render_challenge(i, challenge, place_images))
        parts.append("\n".join(lines))
    return "\n\n".join(parts)


def _objectives_by_frame(record: JsonObject) -> tuple[dict[str, str], list[tuple[str, list[str]]]]:
    by_frame: dict[str, str] = {}
    objectives: list[tuple[str, list[str]]] = []
    for objective in objs(obj(record.get("outline")).get("learning_objectives")):
        title = text(objective.get("title"))
        if title is None:
            continue
        frame_ids = string_list(objective.get("frame_ids"))
        objectives.append((title, frame_ids))
        for frame_id in frame_ids:
            by_frame.setdefault(frame_id, title)
    return by_frame, objectives


def render_lesson(course: Course, lesson: Lesson, captions: dict[str, str]) -> str:
    record = course.outline_record(lesson.id)
    objective_of, objectives = _objectives_by_frame(record)
    frames = lesson.frames
    slide_of = {text(f.get("id")) or "": i for i, f in enumerate(frames, start=1)}

    parts = [f"## Lesson {lesson.number}: {lesson.title}"]
    goals = string_list(lesson.raw.get("description"))
    if goals:
        parts.append("Lesson goals:\n" + "\n".join(f"- {g}" for g in goals))
    terms = string_list(lesson.raw.get("key_terms"))
    if terms:
        parts.append("Key terms (define them from the slides): " + ", ".join(terms))
    if objectives:
        lines = ["Learning objectives (slides):"]
        for title, frame_ids in objectives:
            numbers = sorted(slide_of[f] for f in frame_ids if f in slide_of)
            lines.append(f"- {title}" + (f" (slides {_ranges(numbers)})" if numbers else ""))
        parts.append("\n".join(lines))
    prompts = [
        p
        for p in (
            text(record.get("pre_lesson_review_message")),
            text(record.get("post_lesson_review_message")),
        )
        if p
    ]
    if prompts:
        parts.append("Tutor review prompts:\n" + "\n".join(f"- {p}" for p in prompts))
    for number, frame in enumerate(frames, start=1):
        frame_id = text(frame.get("id")) or ""
        parts.append(render_slide(number, frame, captions, objective_of.get(frame_id)))
    return "\n\n".join(parts)


def _ranges(numbers: list[int]) -> str:
    """[1, 2, 3, 5] -> '1-3, 5'."""
    out: list[str] = []
    start = prev = None
    for n in numbers:
        if start is None:
            start = prev = n
        elif prev is not None and n == prev + 1:
            prev = n
        else:
            out.append(f"{start}-{prev}" if start != prev else f"{start}")
            start = prev = n
    if start is not None:
        out.append(f"{start}-{prev}" if start != prev else f"{start}")
    return ", ".join(out)


def render_course(course: Course, captions: dict[str, str]) -> str:
    """The whole course's ungraded lessons as one Markdown corpus."""
    stream = course.stream
    parts = [f"# Course: {course.title}"]
    description = text(stream.get("description"))
    if description:
        parts.append(description)
    learn = string_list(stream.get("what_you_will_learn"))
    if learn:
        parts.append("What you will learn:\n" + "\n".join(f"- {item}" for item in learn))
    ungraded = course.ungraded_lessons()
    outline = [f"- {lesson.number} {lesson.title}" for lesson in ungraded]
    parts.append("Lessons in this corpus:\n" + "\n".join(outline))
    for lesson in ungraded:
        parts.append(render_lesson(course, lesson, captions))
    return "\n\n".join(parts) + "\n"


def image_jobs(course: Course) -> dict[str, tuple[ImageRef, str]]:
    """Every image shown in the course's ungraded lessons, with the slide text it sits on."""
    jobs: dict[str, tuple[ImageRef, str]] = {}
    for lesson in course.ungraded_lessons():
        for frame in lesson.frames:
            for image in shown_images(frame):
                jobs.setdefault(image.url, (image, slide_text(frame)))
    return jobs
