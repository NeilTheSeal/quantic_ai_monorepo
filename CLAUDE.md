# Quantic AI Engineering monorepo

Coursework for the Quantic MS in AI Engineering: lesson exercises, notes, and course projects.
Primary language is Python 3.14. TypeScript + npm for any web work. [README.md](README.md) covers
setup; this file covers how to work here. Tasks range from a 20-line lesson script to a web app
with CI and a local LLM behind it, so match the effort to the task.

## Who you're working with

- Neil is a software engineer with 10+ years of experience and a student in the program.
- Build what's asked. Don't ask clarifying questions for ordinary ambiguity: pick the sensible
  default, say what you picked in one line, and proceed. Do push back when the request looks
  mistaken, the premise is wrong, or a decision would be expensive to reverse.
- Keep explanations short. Explain a non-obvious decision; don't teach fundamentals.
- Look things up instead of guessing. Dependencies are pinned to recent versions, so your
  training data may be stale for them. Check the installed version, then the docs. Use the
  `researcher` subagent when it takes more than a page or two.

## Environment

- Runs on WSL2 Ubuntu 26.04, Ubuntu 26.04 desktop, and macOS. Never assume one of them. Shell
  scripts must work in bash on both Linux and macOS.
- Every toolchain is project-local: `.venv/` for Python, `node_modules/` for Node. Never install
  globally, never `sudo`, never `pip install` outside a venv.
- Run Python tools through the venv explicitly instead of relying on activation:
  `.venv/bin/python -m ruff check .`. Inside a nested project, use that project's `.venv`.
- Secrets live in `.env` (gitignored) and load with `python-dotenv`. `.env.example` documents the
  variable names. Never write a secret into a tracked file; a hook blocks the common formats.

## Commands (repo root, root `.venv`)

- `.venv/bin/python path/to/script.py` — run a script
- `.venv/bin/python -m ruff format <path>` — format
- `.venv/bin/python -m ruff check <path>` — lint (`--fix` applies safe fixes)
- `.venv/bin/python -m mypy <path>` — type-check (strict)
- `.venv/bin/python -m pytest <path>` — tests (`-x --ff` stops at the first failure)
- `.venv/bin/python -m pip install -r requirements.txt` — (re)install dependencies
- `/check [path]` — run every gate and report a pass/fail table

Editing a `.py` file triggers a hook that formats it and reports ruff and mypy errors back to
you. Fix them before moving on. Don't silence with `# noqa` or `# type: ignore` unless there is
no real fix, and then say why in the comment.

## Layout

- `courses/<course_name>/lesson_<n>/` — one folder per lesson; exercises are plain `.py` scripts
  or notebooks. `course_name` is the snake_case course title.
- `courses/<course_name>/<project_name>/` — a course project. Larger ones are nested git repos
  (see below).
- `web_apps/<app_name>/` — web applications that are not coursework (nested git repos, Node).
- `browser_extensions/` — userscripts, a VS Code extension, and the sync server (nested repos).
- `.claude/` — rules, skills, agents, hooks, settings. `.github/copilot-instructions.md` points
  Copilot here; both tools read this file.
- Put new lesson work under its course folder. Run `/new-lesson` to scaffold one.

## Git and GitHub are read-only for you (IMPORTANT)

Neil does every git write himself. Never run `git add`, `commit`, `push`, `checkout`, `switch`,
`stash`, `reset`, `rebase`, `merge`, `init`, or anything else that changes repo state, and never
`gh pr create`, `gh pr merge`, or any `gh` command that writes to GitHub. A hook blocks these;
don't look for a way around it. Read-only commands (`git status`, `git diff`, `git log`,
`git blame`, `gh pr view`) are fine and encouraged.

When a task is done, list the files you changed and, if it helps, suggest a commit message in
the repo's existing style: imperative mood, under 72 characters, no trailing period.

## Workflow

- Small, clear task (one file, describable in a sentence): do it directly.
- Multi-file or unfamiliar code: read first, state a short plan, then implement.
- Verify before you report done: run the script or tests, run `/check`, and show the output.
  Fix root causes; don't suppress errors.
- Hand non-trivial changes to the `reviewer` subagent before handing them back.
- Delegate wide reads (many files, documentation research) to subagents to keep this context
  clean.
- When compacting, preserve the list of modified files, the commands that verify them, and any
  open decisions.

## Testing

- Course projects: pytest for the core logic, in `tests/` mirroring the source tree.
- Lesson exercises: tests are optional. Early-module exercises are trivial by design. Don't write
  tests for a short script unless asked or the logic is easy to get wrong (parsing, math, edge
  cases). Always run the script once.
- Test files are `test_*.py` and are exempt from the annotation lint. Plain pytest functions and
  fixtures, no unittest classes.

## Dependencies

- Ask before adding one. On approval: add it to the matching group in `requirements.txt` with a
  `>=` minimum, add a `types-*` stub or a mypy override if it ships no types, and reinstall.
- Prefer the standard library and what's already installed. Check `requirements.txt` first.
- Future stack, decided: TypeScript + npm for web; Ollama for local LLMs (see the `local-llm`
  skill). Not decided yet, ask when it comes up: web framework, database, CI provider, Docker.

## Nested project repositories

Some projects need their own repo. Course projects live at `courses/<course>/<project>/` with
their own `.git`, `.venv`, `pyproject.toml`, README, and CLAUDE.md; web apps and extensions live
under `web_apps/` and `browser_extensions/` with their own `package.json`. Every nested repo is
listed in the root `.gitignore` and in `repos.json` (which `scripts/pull-all` and `fetch-all`
read). Shared config files (`tsconfig.base.json`, `.prettierrc.json`, `.gitattributes`,
`.githooks/`) are generated copies: the list is in `scripts/lib/shared-files.sh`, the nested
pre-commit hook refreshes and stages them, and `scripts/sync-shared-files` does it for every
repo. Edit the root originals only. Run `/new-project`
to scaffold a course project; it writes the files and prints the git commands for Neil to run.
Inside a nested project, its CLAUDE.md adds to this one.

## Skills and agents

- `/check [path]` — run ruff, mypy, pytest and report
- `/new-lesson <course> <n> <module> [prompt]` — scaffold a lesson folder and script
- `/new-project <course> <name>` — scaffold a nested project repo
- `local-llm` — Ollama integration conventions (loads when relevant)
- `reviewer` agent — read-only review of a diff in a fresh context
- `researcher` agent — documentation lookup with sources

Path-scoped rules in `.claude/rules/` load when you touch matching files: Python, TypeScript,
Markdown, shell.

## Do not

- Run git or gh write commands (see above).
- Install anything globally, use `sudo`, or pip install outside a venv.
- Add dependencies, frameworks, or Docker without asking.
- Write to `.env` or put secrets in tracked files.
- Use `print` debugging left in place, bare `except:`, `import *`, or mutable default arguments.
- Create files the task didn't need: no extra READMEs, configs, or helper modules for a lesson
  script.
