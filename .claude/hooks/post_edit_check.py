#!/usr/bin/env python3
"""PostToolUse hook for Write and Edit: format the file and report lint/type errors.

Python: ruff format, then ruff check and mypy via the nearest .venv (nested projects have
their own). Prettier-managed files: prettier --write via the nearest node_modules, if any.
Shell: shellcheck if installed. Never blocks; failures come back to Claude as context.
"""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

PY_EXT = {".py", ".pyi"}
NOTEBOOK_EXT = {".ipynb"}
PRETTIER_EXT = {
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".mjs",
    ".cjs",
    ".json",
    ".jsonc",
    ".css",
    ".scss",
    ".html",
    ".yaml",
    ".yml",
}
SHELL_EXT = {".sh", ".bash"}
MAX_LINES = 40
TIMEOUT = 60


def project_root() -> Path:
    return Path(os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd()).resolve()


def find_up(start: Path, marker: str, stop: Path) -> Path | None:
    """Return the nearest ancestor of `start` (inclusive) containing `marker`, not above `stop`."""
    current = start if start.is_dir() else start.parent
    while True:
        if (current / marker).exists():
            return current
        if current == stop or current.parent == current:
            return None
        current = current.parent


def venv_python(root: Path) -> Path | None:
    for candidate in (root / ".venv" / "bin" / "python", root / ".venv" / "Scripts" / "python.exe"):
        if candidate.exists():
            return candidate
    return None


def run(cmd: list[str], cwd: Path) -> tuple[int, str]:
    try:
        proc = subprocess.run(
            cmd, cwd=cwd, capture_output=True, text=True, timeout=TIMEOUT, check=False
        )
    except subprocess.TimeoutExpired:
        return 1, f"timed out after {TIMEOUT}s: {' '.join(cmd)}"
    except OSError as exc:
        return 1, f"could not run {cmd[0]}: {exc}"
    output = (proc.stdout + proc.stderr).strip()
    lines = output.splitlines()
    if len(lines) > MAX_LINES:
        output = "\n".join(lines[:MAX_LINES]) + f"\n... ({len(lines) - MAX_LINES} more lines)"
    return proc.returncode, output


def check_python(file: Path, root: Path, notebook: bool) -> list[str]:
    venv_root = find_up(file, ".venv", root) or root
    python = venv_python(venv_root)
    if python is None:
        return [f"No .venv found for {file.relative_to(root)}; create one (see README.md)."]
    rel = os.path.relpath(file, venv_root)
    messages: list[str] = []
    code, out = run([str(python), "-m", "ruff", "format", rel], venv_root)
    if code != 0:
        messages.append(f"ruff format failed:\n{out}")
    code, out = run([str(python), "-m", "ruff", "check", rel], venv_root)
    if code != 0:
        messages.append(f"ruff check:\n{out}")
    if not notebook:
        code, out = run([str(python), "-m", "mypy", rel], venv_root)
        if code != 0:
            messages.append(f"mypy:\n{out}")
    return messages


def check_prettier(file: Path, root: Path) -> list[str]:
    node_root = find_up(file, "node_modules", root)
    if node_root is None:
        return []
    prettier = node_root / "node_modules" / ".bin" / "prettier"
    if not prettier.exists():
        return []
    code, out = run([str(prettier), "--write", os.path.relpath(file, node_root)], node_root)
    return [f"prettier failed:\n{out}"] if code != 0 else []


def check_shell(file: Path, root: Path) -> list[str]:
    shellcheck = shutil.which("shellcheck")
    if shellcheck is None:
        return []
    code, out = run([shellcheck, str(file)], root)
    return [f"shellcheck:\n{out}"] if code != 0 else []


def main() -> None:
    try:
        payload = json.load(sys.stdin)
    except (json.JSONDecodeError, OSError):
        sys.exit(0)
    tool_input = payload.get("tool_input", {}) if isinstance(payload, dict) else {}
    raw_path = tool_input.get("file_path") if isinstance(tool_input, dict) else None
    if not isinstance(raw_path, str) or not raw_path:
        sys.exit(0)
    file = Path(raw_path).resolve()
    if not file.is_file():
        sys.exit(0)
    root = project_root()
    if root not in file.parents:
        sys.exit(0)

    ext = file.suffix.lower()
    if ext in PY_EXT:
        messages = check_python(file, root, notebook=False)
    elif ext in NOTEBOOK_EXT:
        messages = check_python(file, root, notebook=True)
    elif ext in PRETTIER_EXT:
        messages = check_prettier(file, root)
    elif ext in SHELL_EXT:
        messages = check_shell(file, root)
    else:
        sys.exit(0)

    if messages:
        rel = file.relative_to(root)
        context = f"post_edit_check on {rel}:\n\n" + "\n\n".join(messages)
        context += "\n\nFix these before continuing."
        print(
            json.dumps(
                {
                    "hookSpecificOutput": {
                        "hookEventName": "PostToolUse",
                        "additionalContext": context,
                    }
                }
            )
        )
    sys.exit(0)


if __name__ == "__main__":
    main()
