# {{project}}

{{description}}

Course project for `{{course}}` in the Quantic MS in AI Engineering program.

## Setup

Requires Python 3.14 (see `.python-version`; install with pyenv).

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
git config core.hooksPath .githooks
```

## Usage

TODO

## Development

```bash
.venv/bin/python -m ruff format . && .venv/bin/python -m ruff check .
.venv/bin/python -m mypy .
.venv/bin/python -m pytest
```
