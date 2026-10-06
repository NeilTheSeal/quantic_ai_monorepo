# {{project}}

{{description}}

Course project for `{{course}}`. This is a nested repo inside the Quantic monorepo; the root
`CLAUDE.md` still applies (git is read-only for you, project-local toolchains, Python conventions
in `.claude/rules/`). This file adds what's specific here.

## Commands (from this directory, this project's `.venv`)

- `.venv/bin/python -m pytest` — tests
- `.venv/bin/python -m ruff format . && .venv/bin/python -m ruff check .` — format and lint
- `.venv/bin/python -m mypy .` — type-check
- `.venv/bin/python -m pip install -r requirements.txt` — install

## Layout

- `src/{{project}}/` — package source
- `tests/` — pytest tests mirroring `src/`

## Decisions

Record stack choices here as they're made (framework, storage, CI, LLM runtime), one line each
with the reason.

- (none yet)
