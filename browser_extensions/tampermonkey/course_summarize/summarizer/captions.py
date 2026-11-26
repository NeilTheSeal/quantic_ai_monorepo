"""Describes slide images with a low-cost model so the text-only corpus keeps their content.

Most images are IDLE screenshots whose code appears nowhere else, so the description leads with
a verbatim transcription. Results are cached by image URL (the URLs are content-addressed).
"""

import base64
import logging
from collections.abc import Callable
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Literal

import anthropic
from anthropic.types import Base64ImageSourceParam, ImageBlockParam, MessageParam

from summarizer.corpus import ImageRef
from summarizer.fetch import download

CAPTION_MODEL = "claude-haiku-5-5"
MAX_WORKERS = 8
MAX_CONTEXT_CHARS = 4000

SYSTEM_PROMPT = (
    "You describe images from an online Python course so the course can be studied as text. "
    "The description replaces the image in a study corpus, so it must carry everything a "
    "learner would read in the image."
)

INSTRUCTIONS = (
    "First, transcribe all code, terminal or shell output, menus, and other text in the image "
    "exactly as shown, in fenced code blocks where it is code or output. Keep prompts like "
    "`>>>`, error messages, and highlighting (say which part is highlighted and how). Then, in "
    "one or two sentences, say what the image shows and what it is teaching.\n\n"
    "If the image is purely decorative (a logo, an illustration, a photo) and carries no course "
    "content, reply with a single line: `Decorative: <a few words describing it>`.\n\n"
    "Reply with the transcription and description only."
)

type MediaType = Literal["image/jpeg", "image/png", "image/gif", "image/webp"]

MEDIA_TYPES: dict[str, MediaType] = {
    "png": "image/png",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "gif": "image/gif",
    "webp": "image/webp",
}

log = logging.getLogger(__name__)


def _url_image(url: str) -> ImageBlockParam:
    return {"type": "image", "source": {"type": "url", "url": url}}


def _downloaded_image(url: str) -> ImageBlockParam | None:
    """The image as base64, for when the API can't fetch the URL itself."""
    extension = url.rsplit(".", 1)[-1].split("?", 1)[0].lower()
    media_type = MEDIA_TYPES.get(extension)
    if media_type is None:
        return None
    data = base64.standard_b64encode(download(url)).decode()
    source: Base64ImageSourceParam = {"type": "base64", "media_type": media_type, "data": data}
    return {"type": "image", "source": source}


def _messages(image: ImageBlockParam, context: str) -> list[MessageParam]:
    prompt = INSTRUCTIONS
    if context:
        prompt = f"Slide text, for context only:\n\n{context[:MAX_CONTEXT_CHARS]}\n\n{prompt}"
    return [{"role": "user", "content": [image, {"type": "text", "text": prompt}]}]


def describe_image(client: anthropic.Anthropic, url: str, context: str) -> str:
    """A transcription and description of one image."""
    try:
        response = client.messages.create(
            model=CAPTION_MODEL,
            max_tokens=4000,
            output_config={"effort": "low"},
            system=SYSTEM_PROMPT,
            messages=_messages(_url_image(url), context),
        )
    except anthropic.BadRequestError as err:
        # Usually the API failing to fetch the URL; send the bytes instead.
        log.info("URL fetch failed for %s (%s); retrying with the downloaded image", url, err)
        image = _downloaded_image(url)
        if image is None:
            raise
        response = client.messages.create(
            model=CAPTION_MODEL,
            max_tokens=4000,
            output_config={"effort": "low"},
            system=SYSTEM_PROMPT,
            messages=_messages(image, context),
        )
    if response.stop_reason == "refusal":
        return "(no description available)"
    return "".join(block.text for block in response.content if block.type == "text").strip()


def describe_images(
    client: anthropic.Anthropic,
    jobs: dict[str, tuple[ImageRef, str]],
    cache: dict[str, str],
    on_progress: Callable[[int, int], None] | None = None,
) -> int:
    """Fills `cache` with descriptions for every job not already in it. Returns how many failed."""
    todo = {url: context for url, (_, context) in jobs.items() if url not in cache}
    failures = 0
    done = 0
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        futures = {
            pool.submit(describe_image, client, url, context): url for url, context in todo.items()
        }
        for future in as_completed(futures):
            url = futures[future]
            try:
                cache[url] = future.result()
            except (anthropic.APIError, OSError) as err:
                failures += 1
                log.warning("Could not describe %s: %s", url, err)
            done += 1
            if on_progress is not None:
                on_progress(done, len(todo))
    return failures
