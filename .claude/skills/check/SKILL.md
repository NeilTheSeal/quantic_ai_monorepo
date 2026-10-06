---
name: check
description: Run the repo's quality gates (ruff format --check, ruff check, mypy, pytest) on a path or on the files changed in the working tree, and report pass/fail per gate. Use after finishing a change, before handing work back, or when the user asks to lint, type-check, test, or "run the checks".
argument-hint: "[path]"
allowed-tools: Bash(.venv/bin/python -m ruff:*), Bash(.venv/bin/python -m mypy:*), Bash(.venv/bin/python -m pytest:*), Bash(git status:*), Bash(git diff:*), Read, Glob
---

# Check

Run every gate and report. Target: `$ARGUMENTS` if given, otherwise the Python files that
`git status --short` shows as modified or untracked, otherwise the whole repo.

## Steps

1. Find the venv: the nearest `.venv/` walking up from the target (nested projects have their
   own). Run from that directory with `<venv>/bin/python -m ...`. If there is no venv, stop and
   say so.
2. Run, in order, and capture each exit code:
   - `ruff format --check <target>`
   - `ruff check <target>`
   - `mypy <target>`
   - `pytest <target> -q` — only if `test_*.py` files exist under the target; otherwise mark it
     `skipped (no tests)`.
3. Print one table:

   | Gate | Status | Details |
   | ---- | ------ | ------- |

   Status is `pass`, `fail`, or `skipped`. Details is the first line of the failure or the count
   of files checked.
4. Under the table, show at most the first 30 lines of output for each failing gate.

## Rules

- If a failure is in a file you edited in this conversation, fix it and re-run the gates once.
  Otherwise report only; don't change files you weren't working on.
- `ruff format --check` failing means run `ruff format <target>` (that is a fix you may apply).
- Never pass `--no-verify`, `# noqa`, or `# type: ignore` to make a gate pass.
