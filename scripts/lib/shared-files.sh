#!/usr/bin/env bash
# Shared config files that every nested repo needs a copy of, because a nested repo is also a
# standalone repo (Heroku builds it alone; `extends: ../../tsconfig.base.json` fails there).
# The root copy is the source of truth; the copies are generated, never edited by hand.
#
#   sync_shared_files <nested_dir> [--stage]   copy any file that differs; --stage also git-adds it
#   check_shared_files <nested_dir>            exit 1 and list the copies that are out of date
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
  [ "${stale}" -eq 0 ]
}
