---
name: new-lesson
description: Scaffold a lesson exercise under courses/<course>/lesson_<n>/ and, if a prompt is given, implement it as a typed Python script, run it, and run the quality gates. Manual only.
disable-model-invocation: true
argument-hint: "<course_name> <lesson_number> <module_name> [lesson prompt...]"
allowed-tools: Bash(mkdir:*), Bash(ls:*), Bash(.venv/bin/python:*), Read, Write, Edit, Glob
---

# New lesson

Create a lesson folder and script. Arguments: `$0` course (snake_case), `$1` lesson number,
`$2` module name (snake_case, no `.py`). Anything after those is the lesson prompt.

## Steps

1. Validate: course and module are `snake_case`; lesson number is an integer. If the course folder
   doesn't exist yet, create it and add it to the layout tree in `README.md`.
2. Create `courses/$0/lesson_$1/` if missing. Don't add a README, `__init__.py`, or any other
   file unless the prompt requires it.
3. Write `courses/$0/lesson_$1/$2.py`:
   - A one-line module docstring stating the exercise.
   - Logic in small typed functions; `def main() -> None:` and the `__main__` guard.
   - Follow `.claude/rules/python.md`. Stdlib only unless the prompt needs more and it's already
     in `requirements.txt`.
4. If a prompt was given, implement it. If not, write the skeleton with a `main()` that raises
   `NotImplementedError("TODO: <lesson>")` and stop after step 5.
5. Run `.venv/bin/python courses/$0/lesson_$1/$2.py` (feed sample input via a heredoc if it reads
   stdin), then `/check courses/$0/lesson_$1/`. Fix failures.
6. Tests: write `test_$2.py` next to the script only if the logic has real edge cases (parsing,
   arithmetic, boundaries). Skip tests for trivial exercises and say you skipped them.
7. Report: the files created, the run output, the gate results. Suggest a commit message; do not
   run git.
