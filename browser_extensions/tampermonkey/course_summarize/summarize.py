"""Summarize every captured Quantic course that has no summary yet.

Usage: .venv/bin/python summarize.py   (settings come from .env in this folder)

Reads captured courses from the sync server, skips ones still in progress, and writes
courses/<course>/summary.md in the monorepo. Working data (image descriptions, the corpus, a
copy of the summary) goes back to the sync server under courses/<course>/working/.
"""

import http.client
import logging
import os
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

import anthropic
from dotenv import load_dotenv
from summarizer.pipeline import anthropic_services, course_slugs, summarize_course
from summarizer.summary import SUMMARY_MODEL, SummaryError
from summarizer.webdav import WebDav, WebDavError

PROJECT_DIR = Path(__file__).resolve().parent
REPO_ROOT = PROJECT_DIR.parents[2]
OUTPUT_ROOT = REPO_ROOT / "courses"
REQUIRED_ENV = ("ANTHROPIC_API_KEY", "WEBDAV_URL", "WEBDAV_USER", "WEBDAV_PASS")

log = logging.getLogger("summarize")


def check_api_key(client: anthropic.Anthropic, key: str) -> None:
    """Fails fast, before any work or spending, if the API rejects the key (a free lookup)."""
    hint = ""
    if key.startswith("sk-ant-admin"):
        hint = " It is an Admin API key; the Messages API needs a regular API key (sk-ant-api…)."
    elif not key.startswith("sk-ant-"):
        hint = " It doesn't start with sk-ant-; check for a truncated or mangled paste."
    try:
        client.models.retrieve(SUMMARY_MODEL)
    except (anthropic.AuthenticationError, anthropic.PermissionDeniedError) as err:
        sys.exit(
            f"The Claude API rejected ANTHROPIC_API_KEY from {PROJECT_DIR / '.env'} "
            f"(HTTP {err.status_code}).{hint} Create or copy a key at "
            "https://platform.claude.com/settings/keys."
        )


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    # The HTTP client logs every request at INFO; keep the output to progress lines.
    logging.getLogger("httpx2").setLevel(logging.WARNING)
    # This folder's .env is the source of truth, even over variables exported in the shell.
    load_dotenv(PROJECT_DIR / ".env", override=True)
    missing = [name for name in REQUIRED_ENV if not os.environ.get(name)]
    if missing:
        sys.exit(f"Missing in {PROJECT_DIR / '.env'}: {', '.join(missing)} (see .env.example)")
    if not (REPO_ROOT / "repos.json").exists():
        sys.exit(f"Expected the monorepo root at {REPO_ROOT}")

    client = anthropic.Anthropic(max_retries=4)
    check_api_key(client, os.environ["ANTHROPIC_API_KEY"])
    store = WebDav(os.environ["WEBDAV_URL"], os.environ["WEBDAV_USER"], os.environ["WEBDAV_PASS"])
    services = anthropic_services(client)

    try:
        slugs = course_slugs(store)
    except (WebDavError, OSError, http.client.HTTPException, ET.ParseError) as err:
        sys.exit(f"Could not list courses on the sync server: {err}")

    failed = 0
    for slug in slugs:
        try:
            status = summarize_course(store, slug, OUTPUT_ROOT, services)
        except (
            anthropic.APIError,
            WebDavError,
            SummaryError,
            OSError,
            ValueError,
            http.client.HTTPException,
            ET.ParseError,
        ) as err:
            failed += 1
            log.error("%s: failed: %s", slug, err)
            continue
        log.info("%s: %s", slug, status)
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
