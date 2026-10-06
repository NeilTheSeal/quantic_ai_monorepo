#!/usr/bin/env python3
"""SessionStart hook: inject a short snapshot of the repo state as context.

Branch, working-tree changes, venv status, and any nested git repositories, so every
conversation starts knowing where things stand without spending tool calls on it.
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path

SKIP_DIRS = {".venv", "node_modules", ".git", ".mypy_cache", ".ruff_cache", "__pycache__"}
MAX_STATUS_LINES = 15
MAX_DEPTH = 4


def git(root: Path, *args: str) -> str:
    try:
        proc = subprocess.run(
            ["git", *args], cwd=root, capture_output=True, text=True, timeout=10, check=False
        )
    except (OSError, subprocess.TimeoutExpired):
        return ""
    return proc.stdout.strip() if proc.returncode == 0 else ""


def nested_repos(root: Path) -> list[str]:
    found: list[str] = []
    for dirpath, dirnames, _ in os.walk(root):
        rel = Path(dirpath).relative_to(root)
        depth = len(rel.parts)
        if depth > MAX_DEPTH:
            dirnames[:] = []
            continue
        if ".git" in dirnames and dirpath != str(root):
            found.append(rel.as_posix() + "/")
            dirnames[:] = []
            continue
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
    return sorted(found)


def venv_summary(root: Path) -> str:
    python = root / ".venv" / "bin" / "python"
    if not python.exists():
        return "root .venv: missing (see README.md)"
    try:
        proc = subprocess.run(
            [str(python), "--version"], capture_output=True, text=True, timeout=10, check=False
        )
        version = (proc.stdout or proc.stderr).strip()
    except (OSError, subprocess.TimeoutExpired):
        version = "unknown version"
    return f"root .venv: {version}"


def main() -> None:
    root = Path(os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd()).resolve()
    lines = [f"Repo snapshot ({root.name}):"]

    branch = git(root, "rev-parse", "--abbrev-ref", "HEAD")
    lines.append(f"- branch: {branch or 'unknown'}")

    status = git(root, "status", "--short")
    if status:
        status_lines = status.splitlines()
        shown = status_lines[:MAX_STATUS_LINES]
        more = len(status_lines) - len(shown)
        lines.append(f"- working tree: {len(status_lines)} changed path(s)")
        lines.extend(f"    {s}" for s in shown)
        if more:
            lines.append(f"    ... {more} more")
    else:
        lines.append("- working tree: clean")

    lines.append(f"- {venv_summary(root)}")

    hooks_path = git(root, "config", "--get", "core.hooksPath")
    if hooks_path != ".githooks":
        lines.append("- pre-commit hook not enabled: `git config core.hooksPath .githooks`")

    repos = nested_repos(root)
    if repos:
        lines.append("- nested git repos (own .venv and CLAUDE.md): " + ", ".join(repos))

    lines.append("- git/gh are read-only for you in this session (hook-enforced).")

    print(
        json.dumps(
            {
                "hookSpecificOutput": {
                    "hookEventName": "SessionStart",
                    "additionalContext": "\n".join(lines),
                }
            }
        )
    )
    sys.exit(0)


if __name__ == "__main__":
    main()
