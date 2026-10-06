#!/usr/bin/env python3
"""PreToolUse hook for Write and Edit: refuse writes that contain credentials.

Blocks writes to secret-bearing filenames (.env, private keys) and content that matches
well-known token formats. Exit 2 blocks the write and surfaces the reason to Claude.
"""

from __future__ import annotations

import json
import os
import re
import sys

ALLOWED_ENV_FILES = frozenset({".env.example", ".env.sample", ".env.template"})

SENSITIVE_NAME = re.compile(
    r"(^\.env(\..+)?$|\.pem$|\.key$|\.p12$|\.pfx$|^id_(rsa|ed25519|ecdsa|dsa)$"
    r"|credentials.*\.json$|service[-_]account.*\.json$|^\.netrc$|^\.npmrc$|^\.pypirc$)"
)

TOKEN_PATTERNS: tuple[tuple[str, re.Pattern[str]], ...] = (
    ("AWS access key", re.compile(r"\bAKIA[0-9A-Z]{16}\b")),
    ("private key block", re.compile(r"-----BEGIN (RSA |OPENSSH |EC |DSA |PGP )?PRIVATE KEY-----")),
    ("GitHub token", re.compile(r"\b(gh[pousr]_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{60,})\b")),
    ("Slack token", re.compile(r"\bxox[baprs]-[A-Za-z0-9-]{10,}\b")),
    ("Anthropic/OpenAI-style key", re.compile(r"\bsk-(ant-|proj-)?[A-Za-z0-9_-]{32,}\b")),
    ("Hugging Face token", re.compile(r"\bhf_[A-Za-z0-9]{30,}\b")),
    ("Google API key", re.compile(r"\bAIza[0-9A-Za-z_-]{35}\b")),
    ("JWT", re.compile(r"\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b")),
)


def main() -> None:
    try:
        payload = json.load(sys.stdin)
    except (json.JSONDecodeError, OSError):
        sys.exit(0)
    tool_input = payload.get("tool_input", {}) if isinstance(payload, dict) else {}
    if not isinstance(tool_input, dict):
        sys.exit(0)
    file_path = str(tool_input.get("file_path", ""))
    content = str(tool_input.get("content") or tool_input.get("new_string") or "")

    problems: list[str] = []
    name = os.path.basename(file_path)
    if name and name not in ALLOWED_ENV_FILES and SENSITIVE_NAME.search(name):
        problems.append(f"sensitive filename: {file_path}")
    for label, pattern in TOKEN_PATTERNS:
        if pattern.search(content):
            problems.append(f"content looks like a {label}")

    if not problems:
        sys.exit(0)
    print("secret_guard: refusing write.", file=sys.stderr)
    for item in problems:
        print(f"  - {item}", file=sys.stderr)
    print(
        "Secrets belong in .env (gitignored), loaded via python-dotenv. Document the variable "
        "name in .env.example instead. If this is a placeholder, make it obviously fake.",
        file=sys.stderr,
    )
    sys.exit(2)


if __name__ == "__main__":
    main()
