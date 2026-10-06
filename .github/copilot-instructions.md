# Copilot instructions

All project context, conventions, and workflow rules for AI assistants live in
[CLAUDE.md](../CLAUDE.md) at the repo root. Read it and follow it as if its contents were written
here. Path-scoped rules are in `.claude/rules/`, custom agents in `.claude/agents/`, and skills in
`.claude/skills/`.

The hooks in `.claude/hooks/` run only under Claude Code. The rules they enforce apply to you by
instruction: never run git or gh commands that change state, never write secrets into tracked
files, and run `ruff format`, `ruff check`, and `mypy` through the project's `.venv` after editing
Python.
