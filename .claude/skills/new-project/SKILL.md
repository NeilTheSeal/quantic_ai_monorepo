---
name: new-project
description: Scaffold a course project as a nested git repository under courses/<course>/<project>/ with its own venv, pyproject, README, CLAUDE.md, and .gitignore entry in the monorepo. Prints the git commands for the user to run. Manual only.
disable-model-invocation: true
argument-hint: "<course_name> <project_name> [one-line description]"
allowed-tools: Bash(mkdir:*), Bash(ls:*), Bash(cp:*), Bash(python:*), Bash(pyenv:*), Read, Write, Edit, Glob
---

# New project

Scaffold a nested project repo. `$0` course, `$1` project (both snake_case). Anything after is
the description. Templates live in `${CLAUDE_SKILL_DIR}/templates/`.

## Steps

1. Validate names. The target `courses/$0/$1/` must not exist. Create it, plus `src/$1/` with an
   empty `__init__.py`, and `tests/` with an empty `__init__.py`.
2. Copy and fill the templates, replacing `{{project}}`, `{{course}}`, and `{{description}}`:
   - `CLAUDE.md` → `courses/$0/$1/CLAUDE.md`
   - `pyproject.toml` → `courses/$0/$1/pyproject.toml`
   - `README.md` → `courses/$0/$1/README.md`
   - `gitignore` → `courses/$0/$1/.gitignore`
   - `requirements.txt` → `courses/$0/$1/requirements.txt`
   Copy `.python-version`, `.gitattributes`, and `.githooks/` from the monorepo root unchanged.
3. Add `courses/$0/$1/` to the root `.gitignore` under the nested repositories section, and add
   the project to the nested repositories note in the root `README.md`.
4. Create the venv from inside the project dir: `python -m venv .venv` (pyenv resolves
   `.python-version`), then `.venv/bin/python -m pip install -r requirements.txt`.
5. Do not run `git init` or any other git command. Print this block for Neil to run:

   ```bash
   cd courses/$0/$1
   git init -b main
   git config core.hooksPath .githooks
   git add -A && git commit -m "Scaffold $1"
   ```

6. Report the files created and anything left to decide (framework, database, CI), which belong
   in the project's CLAUDE.md once decided.
