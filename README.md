# quantic_ai_monorepo

This is a monorepo for coursework, programs, and documents from the
[Quantic School of Business and Technology](https://quantic.edu) **MS in AI Engineering** program.

It collects lesson exercises, notes, and course projects in one place. Some course projects need
their own Git repository. Those projects live in this tree as nested repos, and the monorepo
ignores them (see [Nested project repositories](#nested-project-repositories)).

## Contents

- [Repository layout](#repository-layout)
- [Supported environments](#supported-environments)
- [Installation](#installation)
- [Development workflow](#development-workflow)
- [Nested project repositories](#nested-project-repositories)
- [AI coding assistants](#ai-coding-assistants)

## Repository layout

```text
quantic_ai_monorepo/
├── courses/                         # One folder per course
│   └── ai_assisted_software_development/
│       └── lesson_1/                # One folder per lesson
├── .claude/                         # Claude Code agents and skills (also read by Copilot)
│   ├── agents/
│   └── skills/
├── .github/
│   └── copilot-instructions.md      # GitHub Copilot entry point; defers to CLAUDE.md
├── .githooks/pre-commit             # Ruff + mypy on staged Python files
├── .vscode/                         # Shared editor settings and recommended extensions
├── CLAUDE.md                        # Shared AI assistant context (Claude Code + Copilot)
├── pyproject.toml                   # Project metadata, Ruff, mypy, pytest config
├── requirements.txt                 # Python dependencies for the root .venv
└── .python-version                  # Pinned Python version (3.14.8)
```

### Naming conventions

- Course folders use `snake_case` versions of the course title, such as
  `ai_assisted_software_development`.
- Lesson folders are named `lesson_<n>`.
- Python modules and files use `snake_case`.

The course list is still growing. New courses get a folder under `courses/` as the program
introduces them.

## Supported environments

| Environment          | Shell | Notes                                                         |
| -------------------- | ----- | ------------------------------------------------------------- |
| WSL2 (Ubuntu 26.04)  | bash  | Primary Windows setup. Keep the repo on the Linux filesystem. |
| Ubuntu 26.04 desktop | bash  |                                                               |
| macOS                | zsh   |                                                               |

Native Windows (PowerShell / `cmd`) is **not** a supported target. On a Windows machine, use WSL2.

Every toolchain is project-local:

- **Python**: a `.venv/` virtual environment. The root `.venv` serves code under `courses/`, and a
  standalone project can have its own.
- **Node.js** (when needed): a `node_modules/` folder in each project.

Nothing should be installed globally beyond the interpreters themselves (managed by pyenv).

Line endings are normalized to LF by [.gitattributes](.gitattributes), so files behave the same on
every OS.

## Installation

Requires **Python 3.14.8**, pinned in [.python-version](.python-version).

### Ubuntu 26.04 (desktop or WSL2)

1. **WSL2 only:** clone the repo inside the Linux filesystem (for example `~/Documents/`), not under
   `/mnt/c/`. Files on the Windows drive are much slower, and their permissions and line endings
   can behave differently. Open the repo in VS Code with the
   [WSL extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl)
   (`code .` from the WSL shell).

2. Install the build dependencies and [pyenv](https://github.com/pyenv/pyenv):

   ```bash
   sudo apt update
   sudo apt install -y build-essential curl git libssl-dev zlib1g-dev libbz2-dev \
     libreadline-dev libsqlite3-dev libncursesw5-dev xz-utils tk-dev libxml2-dev \
     libxmlsec1-dev libffi-dev liblzma-dev libzstd-dev
   curl -fsSL https://pyenv.run | bash
   ```

3. Add pyenv to `~/.bashrc`, then restart your shell:

   ```bash
   export PYENV_ROOT="$HOME/.pyenv"
   [[ -d $PYENV_ROOT/bin ]] && export PATH="$PYENV_ROOT/bin:$PATH"
   eval "$(pyenv init - bash)"
   ```

4. From the repo root:

   ```bash
   pyenv install 3.14.8
   python -m venv .venv
   source .venv/bin/activate
   python --version   # should print Python 3.14.8
   python -m pip install -r requirements.txt
   ```

### macOS

1. Install [Homebrew](https://brew.sh), then pyenv:

   ```bash
   brew install pyenv
   ```

2. Add pyenv to `~/.zshrc`, then restart your shell:

   ```bash
   export PYENV_ROOT="$HOME/.pyenv"
   [[ -d $PYENV_ROOT/bin ]] && export PATH="$PYENV_ROOT/bin:$PATH"
   eval "$(pyenv init - zsh)"
   ```

3. From the repo root:

   ```bash
   pyenv install 3.14.8
   python -m venv .venv
   source .venv/bin/activate
   python --version   # should print Python 3.14.8
   python -m pip install -r requirements.txt
   ```

### VS Code

1. Open the repo folder, or [.vscode/quantic_workspace.code-workspace](.vscode/quantic_workspace.code-workspace).
2. Install the recommended extensions when prompted. They are listed in
   [.vscode/extensions.json](.vscode/extensions.json).
3. Run **Python: Select Interpreter** and choose `.venv` if VS Code doesn't pick it automatically.

### Git hooks

Enable the pre-commit hook once per clone:

```bash
git config core.hooksPath .githooks
```

## Development workflow

### Python tooling

All Python tooling is configured in [pyproject.toml](pyproject.toml) and runs from the `.venv`.

| Tool                                 | Purpose                       | Command                         |
| ------------------------------------ | ----------------------------- | ------------------------------- |
| [Ruff](https://docs.astral.sh/ruff/) | Lint, format, import order    | `ruff check .`, `ruff format .` |
| [mypy](https://mypy-lang.org/)       | Static type checking (strict) | `mypy .`                        |
| [pytest](https://docs.pytest.org/)   | Tests                         | `pytest`                        |

Code standards enforced by the config:

- **Python 3.14** syntax (Ruff `UP` rules).
- **100-character** line length.
- **Type annotations required** on all functions (Ruff `ANN` and mypy `strict`). Test files
  (`test_*.py`) are exempt from the annotation lint.
- Tests are named `test_*.py`, and pytest runs from the repo root (`pythonpath = ["."]`).

### Pre-commit hook

[.githooks/pre-commit](.githooks/pre-commit) runs `ruff check` and `mypy` on **staged** `.py` and
`.pyi` files, and blocks the commit if either fails. It needs the root `.venv` to exist.

### Editor behavior

[.vscode/settings.json](.vscode/settings.json) sets these on save:

- Python and notebooks: Ruff formats, fixes, and organizes imports. mypy reports type errors.
- JavaScript, TypeScript, HTML, CSS, JSON, YAML, and Markdown: Prettier formats. ESLint fixes
  JS/TS, and markdownlint fixes Markdown.
- TOML: Even Better TOML formats. Shell scripts: shell-format formats and ShellCheck lints.

### Dependencies

Root Python dependencies live in [requirements.txt](requirements.txt), grouped by purpose. They
include numerical computing, data analysis and ML, plotting, HTTP and validation, notebooks, dev
tools, and type stubs. To add a package, add it to the right group with a minimum version, then
reinstall:

```bash
python -m pip install -r requirements.txt
```

If a library has no type hints, add a `types-*` stub package, or add a
`[[tool.mypy.overrides]]` entry in `pyproject.toml`.

### Secrets

Put API keys and other secrets in a `.env` file, which Git ignores. Load them with
`python-dotenv`. Never commit secrets.

## Nested project repositories

Some course projects need their own Git repository, for example to submit them or to share them
separately. These repos live **inside** this monorepo's directory tree but are **not tracked** by
it.

To add one:

1. Create or clone the project in a suitable place, usually inside its course folder:

   ```bash
   cd courses/<course_name>
   git clone <project-repo-url> <project_name>
   ```

2. Add its path to [.gitignore](.gitignore) under the nested repositories section, so the
   monorepo doesn't try to track it:

   ```gitignore
   courses/<course_name>/<project_name>/
   ```

3. Give the project its own environment (`.venv/`, `node_modules/`, and so on) and its own README.
   A nested project can follow this repo's tooling conventions, but it shouldn't depend on the
   monorepo's root `.venv`.

Run `git` commands from inside the nested project's directory to work with its own history.

> **Note:** There are no nested repos yet. This section will list them as they are added.

## AI coding assistants

This repo is set up for both **Claude Code** and **GitHub Copilot**, and both use the same
context. [CLAUDE.md](CLAUDE.md) is the single source of truth.

| File / folder                                                      | Read by                        | Purpose                                |
| ------------------------------------------------------------------ | ------------------------------ | -------------------------------------- |
| [CLAUDE.md](CLAUDE.md)                                             | Claude Code, Copilot (VS Code) | Shared project context and conventions |
| [.github/copilot-instructions.md](.github/copilot-instructions.md) | Copilot                        | Points Copilot to `CLAUDE.md`          |
| [.claude/agents/](.claude/agents/)                                 | Claude Code, Copilot (VS Code) | Custom subagents (`<name>.md`)         |
| [.claude/skills/](.claude/skills/)                                 | Claude Code, Copilot (VS Code) | Skills (`<name>/SKILL.md`)             |

VS Code Copilot reads `CLAUDE.md`, `.claude/agents/`, and `.claude/skills/` natively, so there are
no duplicate copies under `.github/`. Add agents and skills to `.claude/` only.

A nested project repo can have its own `CLAUDE.md` for project-specific context. Claude Code
loads it alongside the root file when it works in that directory.
