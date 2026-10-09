#!/usr/bin/env bash
# Shared config files that every nested repo needs a copy of, because a nested repo is also a
# standalone repo (Heroku builds it alone; `extends: ../../tsconfig.base.json` fails there).
# The root copy is the source of truth; the copies are generated, never edited by hand.
#
#   sync_shared_files <nested_dir> [--stage]   copy any file that differs and point every tsconfig
#                                              `extends` at the repo's own copy; --stage also
#                                              git-adds whatever changed
#   check_shared_files <nested_dir>            exit 1 and list stale copies and tsconfigs that
#                                              still reach outside the repo
#
# `SHARED_FILES` maps root path -> path inside the nested repo. The nested pre-commit hook
# (root .githooks/nested-pre-commit) calls sync_shared_files --stage, so a nested commit always
# carries current copies; scripts/sync-shared-files runs it for every repo in repos.json.
set -euo pipefail

SHARED_FILES=(
  "tsconfig.base.json:tsconfig.base.json"
  ".prettierrc.json:.prettierrc.json"
  ".gitattributes:.gitattributes"
  ".githooks/post-merge:.githooks/post-merge"
  ".githooks/nested-pre-commit:.githooks/pre-commit"
)

shared_files_root() {
  cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd
}

# A nested repo must build without the monorepo, so every tsconfig*.json in it that extends
# tsconfig.base.json has to reach the repo's own copy, never ../../tsconfig.base.json at the
# root. Mode "fix" rewrites the `extends` value in place (a regex edit, so comments survive)
# and prints one line per file as "fixed: <relative path>"; mode "check" prints "stale: ..."
# lines instead. Exit status is 0 either way; callers count the lines.
_tsconfig_extends() {
  local nested="$1" mode="$2"
  python3 - "${nested}" "${mode}" <<'EOF'
import os, re, sys
nested, mode = os.path.abspath(sys.argv[1]), sys.argv[2]
skip = {"node_modules", "dist", "out", "build", "coverage", ".git", ".venv"}
pattern = re.compile(r'("extends"\s*:\s*")([^"]*tsconfig\.base\.json)(")')
for dirpath, dirnames, filenames in os.walk(nested):
    dirnames[:] = [d for d in dirnames if d not in skip]
    for filename in filenames:
        if not (filename.startswith("tsconfig") and filename.endswith(".json")):
            continue
        path = os.path.join(dirpath, filename)
        with open(path, encoding="utf-8") as f:
            text = f.read()
        match = pattern.search(text)
        if match is None:
            continue
        expected = os.path.relpath(os.path.join(nested, "tsconfig.base.json"), dirpath)
        if not expected.startswith("."):
            expected = "./" + expected
        if match.group(2) == expected:
            continue
        rel = os.path.relpath(path, nested)
        if mode == "fix":
            with open(path, "w", encoding="utf-8") as f:
                f.write(text[: match.start(2)] + expected + text[match.end(2) :])
            print(f"fixed: {rel}")
        else:
            print(f"stale: {os.path.join(nested, rel)} extends {match.group(2)}, expected {expected}")
EOF
}

sync_shared_files() {
  local nested="$1" stage="${2:-}" root entry src dst tmp changed=0
  root="$(shared_files_root)"
  for entry in "${SHARED_FILES[@]}"; do
    src="${root}/${entry%%:*}"
    dst="${nested}/${entry#*:}"
    if [ ! -f "${src}" ]; then
      echo "sync-shared-files: missing ${src}" >&2
      return 1
    fi
    if [ -f "${dst}" ] && cmp -s "${src}" "${dst}"; then
      continue
    fi
    mkdir -p "$(dirname "${dst}")"
    # Copy then rename: a hook that replaces itself keeps running from the old inode.
    tmp="$(mktemp "${dst}.XXXXXX")"
    cp -p "${src}" "${tmp}"
    mv -f "${tmp}" "${dst}"
    echo "sync-shared-files: updated ${entry#*:} in ${nested}"
    changed=$((changed + 1))
    if [ "${stage}" = "--stage" ]; then
      git -C "${nested}" add -- "${entry#*:}"
    fi
  done
  if ! command -v python3 >/dev/null; then
    echo "sync-shared-files: python3 not found; tsconfig extends not checked" >&2
    return 0
  fi
  local line rel
  while IFS= read -r line; do
    rel="${line#fixed: }"
    echo "sync-shared-files: ${rel} now extends the repo's own tsconfig.base.json"
    if [ "${stage}" = "--stage" ]; then
      git -C "${nested}" add -- "${rel}"
    fi
  done < <(_tsconfig_extends "${nested}" fix)
  return 0
}

check_shared_files() {
  local nested="$1" root entry src dst stale=0
  root="$(shared_files_root)"
  for entry in "${SHARED_FILES[@]}"; do
    src="${root}/${entry%%:*}"
    dst="${nested}/${entry#*:}"
    if [ ! -f "${dst}" ] || ! cmp -s "${src}" "${dst}"; then
      echo "stale: ${nested}/${entry#*:}"
      stale=$((stale + 1))
    fi
  done
  if command -v python3 >/dev/null; then
    local line
    while IFS= read -r line; do
      echo "${line}"
      stale=$((stale + 1))
    done < <(_tsconfig_extends "${nested}" check)
  fi
  [ "${stale}" -eq 0 ]
}
