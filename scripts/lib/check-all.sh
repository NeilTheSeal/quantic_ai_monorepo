#!/usr/bin/env bash
# Shared driver for scripts/{type,lint,format}-check-all.
#
# Finds every project in the monorepo that has the relevant tooling and runs its check in
# parallel, one background job per project. Output is only shown for failures; a clean run
# prints a single line. Exit code is 1 if any project failed.
#
# Projects are discovered, not listed:
#   - Node:   a package.json whose "scripts" has the check (type-check / lint-check / format-check).
#   - Python: a pyproject.toml next to a .venv/ (mypy / ruff check / ruff format --check).
# node_modules, .venv, dist, build, .git, sync_files (nested data repo) and the
# new-project templates are never descended into.
#
# Usage (from the wrappers): run_check_all <kind>   where kind is type|lint|format
set -euo pipefail

run_check_all() {
  local kind="$1"
  local root script_dir
  script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  root="$(cd "${script_dir}/../.." && pwd)"

  local npm_script label py_cmd
  case "${kind}" in
    type)
      npm_script="type-check"
      label="type"
      py_cmd=".venv/bin/python -m mypy ."
      ;;
    lint)
      npm_script="lint-check"
      label="lint"
      py_cmd=".venv/bin/python -m ruff check ."
      ;;
    format)
      npm_script="format-check"
      label="format"
      py_cmd=".venv/bin/python -m ruff format --check ."
      ;;
    *)
      echo "run_check_all: unknown kind '${kind}' (expected type|lint|format)" >&2
      return 2
      ;;
  esac

  local tmp
  tmp="$(mktemp -d "${TMPDIR:-/tmp}/check-all.XXXXXX")"
  # shellcheck disable=SC2064  # expand tmp now; it must not change later
  trap "rm -rf '${tmp}'" EXIT

  local -a names=()
  local -a dirs=()
  local -a cmds=()
  local dir pj

  # --- Node projects: package.json with the script defined -----------------------------------
  while IFS= read -r -d '' pj; do
    dir="$(dirname "${pj}")"
    if grep -q "\"${npm_script}\"[[:space:]]*:" "${pj}"; then
      if [ ! -d "${dir}/node_modules" ] && [ ! -d "${root}/node_modules" ]; then
        echo "skip ${dir#"${root}/"}: no node_modules (run npm install)" >&2
        continue
      fi
      names+=("$(project_name "${root}" "${dir}") (npm run ${npm_script})")
      dirs+=("${dir}")
      cmds+=("npm run --silent ${npm_script}")
    fi
  done < <(find_projects "${root}" package.json)

  # --- Python projects: pyproject.toml with a venv next to it -------------------------------
  while IFS= read -r -d '' pj; do
    dir="$(dirname "${pj}")"
    if [ ! -x "${dir}/.venv/bin/python" ]; then
      echo "skip ${dir#"${root}/"}: pyproject.toml without .venv" >&2
      continue
    fi
    names+=("$(project_name "${root}" "${dir}") (${py_cmd})")
    dirs+=("${dir}")
    cmds+=("${py_cmd}")
  done < <(find_projects "${root}" pyproject.toml)

  local count="${#names[@]}"
  if [ "${count}" -eq 0 ]; then
    echo "No projects with ${label} checks found under ${root}" >&2
    return 1
  fi

  # --- Run everything in parallel; each job writes its output and exit code to tmp ----------
  local i
  for i in $(seq 0 $((count - 1))); do
    (
      cd "${dirs[$i]}" || exit 1
      # shellcheck disable=SC2086  # the command string is intentionally word-split
      if ${cmds[$i]} >"${tmp}/${i}.out" 2>&1; then
        echo 0 >"${tmp}/${i}.code"
      else
        echo $? >"${tmp}/${i}.code"
      fi
    ) &
  done
  wait

  # --- Report: failures in full, successes as one line --------------------------------------
  local failed=0 code
  for i in $(seq 0 $((count - 1))); do
    code="$(cat "${tmp}/${i}.code" 2>/dev/null || echo 1)"
    if [ "${code}" != "0" ]; then
      failed=$((failed + 1))
      printf '\n\033[1;31mFAIL\033[0m %s (exit %s)\n' "${names[$i]}" "${code}"
      sed 's/^/    /' "${tmp}/${i}.out"
    fi
  done

  if [ "${failed}" -eq 0 ]; then
    echo "All ${label} checks passed (${count} projects)"
    return 0
  fi
  printf '\n%d of %d projects failed %s checks\n' "${failed}" "${count}" "${label}"
  return 1
}

# Print NUL-separated paths of every <file> under <root>, skipping generated/vendored trees.
find_projects() {
  local root="$1" file="$2"
  find "${root}" \
    \( -name node_modules -o -name .venv -o -name .git -o -name dist -o -name build \
    -o -name sync_files -o -name templates -o -name .mypy_cache -o -name .ruff_cache \) -prune \
    -o -type f -name "${file}" -print0 | sort -z
}

# "." for the root itself, otherwise the path relative to the root.
project_name() {
  local root="$1" dir="$2"
  if [ "${dir}" = "${root}" ]; then
    echo "."
  else
    echo "${dir#"${root}/"}"
  fi
}
