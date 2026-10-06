---
paths:
  - "**/*.py"
  - "**/*.pyi"
  - "**/*.ipynb"
---

# Python

Python 3.14. Ruff (lint + format, 100 columns) and mypy strict are configured in the nearest
`pyproject.toml`; that config is the source of truth. This file covers what config can't express.

## Style

- Modern syntax: `X | None`, `list[int]`, `match`, f-strings, `pathlib.Path`, the `type` alias
  statement. Dataclasses (`slots=True`, `frozen=True` where it fits) for plain records; Pydantic
  models at I/O boundaries (HTTP, files, LLM output).
- Annotate every function, including `-> None`. Prefer `Protocol` and `TypedDict` over `Any`;
  use `object` when the type is truly unknown and narrow it.
- Scripts: `def main() -> None:` plus `if __name__ == "__main__": main()`. Keep I/O in `main`,
  logic in small functions, so the logic is importable and testable.
- `print` is fine for lesson scripts and CLI output. Library and project code uses `logging`.
  `rich` is installed; use it when output formatting matters, not by default.
- Docstrings: one line on public functions, none on obvious helpers. Comments explain why, not
  what.
- Numerics and data: numpy, pandas, scikit-learn, matplotlib, seaborn are installed. Set random
  seeds explicitly. Vectorize before reaching for a Python loop.
- No bare `except:`. No mutable default arguments. No `import *`. No `os.path` when `pathlib`
  will do.

## Tests

- Lessons: `test_<module>.py` next to the module. Projects: `tests/` mirroring the source tree.
- `pytest.mark.parametrize` over loops, fixtures over setup code, `tmp_path` for files. Don't
  mock what you own; mock external HTTP with `httpx.MockTransport` or `respx` if added.

## Notebooks

- `.ipynb` files run on the venv's `ipykernel`. Keep them exploratory; move reusable code into a
  `.py` module and import it. Ruff formats notebooks too.

## Verify

After editing: `ruff format`, `ruff check`, `mypy`, then run the code. The post-edit hook runs
the first three on the file and reports failures to you; read that output before continuing.
