---
paths:
  - "**/*.sh"
  - "**/*.bash"
  - ".githooks/**"
---

# Shell scripts

- `#!/usr/bin/env bash` and `set -euo pipefail`. Git hooks in `.githooks/` may use `#!/bin/sh`
  and must then stay POSIX.
- Must run on Linux and macOS. Avoid GNU-only flags: no `sed -i` without a suffix argument, no
  `readlink -f`, `grep -P`, `date -d`, or `cp --parents`. Prefer Python for anything non-trivial.
- Quote every expansion. Use `[ ]` with explicit `-z`/`-n` tests. `command -v tool >/dev/null`
  to check for a tool, and say so on stderr when it's missing instead of failing silently.
- Must pass `shellcheck` with no warnings (the editor runs it; `shellcheck <file>` if installed).
- Resolve paths relative to the script or repo root, never hard-code `/home/...` or `/Users/...`.
