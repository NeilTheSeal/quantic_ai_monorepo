#!/usr/bin/env python3
"""PreToolUse hook for Bash: block git and gh commands that modify state.

Neil does all git writes himself (see CLAUDE.md). This hook fails closed: a git or gh
invocation is allowed only when its subcommand is on a read-only allowlist. Exit 2 blocks
the command and surfaces the reason to Claude.
"""

from __future__ import annotations

import json
import os
import re
import shlex
import sys
from collections.abc import Sequence

GIT_READ_ONLY = frozenset(
    {
        "blame",
        "cat-file",
        "check-attr",
        "check-ignore",
        "cherry",
        "count-objects",
        "describe",
        "diff",
        "diff-index",
        "diff-tree",
        "for-each-ref",
        "fsck",
        "grep",
        "help",
        "log",
        "ls-files",
        "ls-remote",
        "ls-tree",
        "merge-base",
        "name-rev",
        "range-diff",
        "rev-list",
        "rev-parse",
        "shortlog",
        "show",
        "show-ref",
        "status",
        "var",
        "version",
        "whatchanged",
        "--version",
        "--help",
        "-h",
    }
)

# git global options that take a separate argument.
GIT_GLOBAL_WITH_ARG = frozenset({"-C", "-c", "--git-dir", "--work-tree", "--namespace"})

BRANCH_WRITE_FLAGS = frozenset(
    {
        "-d",
        "-D",
        "-m",
        "-M",
        "-c",
        "-C",
        "-u",
        "-f",
        "--delete",
        "--move",
        "--copy",
        "--force",
        "--set-upstream-to",
        "--unset-upstream",
        "--edit-description",
        "--track",
        "--no-track",
    }
)
TAG_WRITE_FLAGS = frozenset({"-a", "-s", "-u", "-f", "-d", "-m", "-F", "--delete", "--annotate"})
CONFIG_READ_FLAGS = frozenset(
    {"--get", "--get-all", "--get-regexp", "--list", "-l", "--show-origin", "--show-scope"}
)
CONFIG_WRITE_FLAGS = frozenset(
    {"--add", "--unset", "--unset-all", "--replace-all", "--rename-section", "--remove-section"}
)

GH_READ_ONLY: dict[str, frozenset[str] | None] = {
    # None means every subcommand is allowed.
    "pr": frozenset({"view", "list", "diff", "checks", "status"}),
    "issue": frozenset({"view", "list", "status"}),
    "repo": frozenset({"view", "list"}),
    "run": frozenset({"view", "list", "watch", "download"}),
    "workflow": frozenset({"view", "list"}),
    "release": frozenset({"view", "list", "download"}),
    "gist": frozenset({"view", "list"}),
    "label": frozenset({"list"}),
    "cache": frozenset({"list"}),
    "ruleset": frozenset({"view", "list"}),
    "secret": frozenset({"list"}),
    "variable": frozenset({"list"}),
    "project": frozenset({"view", "list"}),
    "auth": frozenset({"status"}),
    "config": frozenset({"get", "list"}),
    "extension": frozenset({"list"}),
    "alias": frozenset({"list"}),
    "search": None,
    "status": None,
    "browse": None,
    "help": None,
    "version": None,
    "--version": None,
    "--help": None,
}

WRAPPERS = frozenset(
    {"sudo", "env", "command", "exec", "time", "nice", "nohup", "xargs", "builtin", "doas"}
)
SEPARATORS = frozenset({";", "&&", "||", "|", "&", "(", ")", "{", "}", "\n"})
ENV_ASSIGNMENT = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*=")

# Used only when shlex can't tokenize (unbalanced quotes).
FALLBACK_WRITE = re.compile(
    r"\bgit\b[^;&|\n]*?\b(add|am|apply|bisect|checkout|cherry-pick|clean|clone|commit|config|"
    r"fetch|init|merge|mv|notes|pull|push|rebase|reflog|remote|replace|reset|restore|revert|rm|"
    r"stash|submodule|switch|tag|update-ref|worktree|branch)\b"
    r"|\bgh\b[^;&|\n]*?\b(create|merge|close|edit|delete|comment|review|ready|reopen|lock|"
    r"unlock|checkout|fork|sync|set|login|logout|refresh|clone|rename|archive|transfer|pin|"
    r"unpin|enable|disable|run|rerun|cancel|dispatch|upload|approve|develop)\b"
)


def tokenize(command: str) -> list[str] | None:
    """Split a shell command into tokens, keeping operators as their own tokens."""
    lexer = shlex.shlex(command, posix=True, punctuation_chars=";&|(){}<>")
    lexer.whitespace_split = True
    try:
        return [tok.strip("`") for tok in lexer]
    except ValueError:
        return None


def segments(tokens: Sequence[str]) -> list[list[str]]:
    """Split a token list on shell separators."""
    out: list[list[str]] = []
    current: list[str] = []
    for tok in tokens:
        if tok in SEPARATORS or (tok and set(tok) <= set(";&|(){}<>")):
            if current:
                out.append(current)
            current = []
        else:
            current.append(tok)
    if current:
        out.append(current)
    return out


def leading_command(segment: Sequence[str]) -> tuple[str, list[str]] | None:
    """Return (program, args) after skipping env assignments and wrappers."""
    i = 0
    n = len(segment)
    while i < n and ENV_ASSIGNMENT.match(segment[i]):
        i += 1
    while i < n and os.path.basename(segment[i]) in WRAPPERS:
        i += 1
        # Skip the wrapper's own flags (e.g. `xargs -0`, `sudo -u user`).
        while i < n and segment[i].startswith("-"):
            i += 1
        while i < n and ENV_ASSIGNMENT.match(segment[i]):
            i += 1
    if i >= n:
        return None
    return os.path.basename(segment[i]), list(segment[i + 1 :])


def git_subcommand(args: Sequence[str]) -> tuple[str, list[str]] | None:
    """Skip git's global options and return (subcommand, remaining args)."""
    i = 0
    while i < len(args):
        tok = args[i]
        if tok in GIT_GLOBAL_WITH_ARG:
            i += 2
            continue
        if tok.startswith("-") and tok not in {"--version", "--help", "-h"}:
            i += 1
            continue
        return tok, list(args[i + 1 :])
    return None


def positionals(args: Sequence[str]) -> list[str]:
    return [a for a in args if not a.startswith("-")]


def git_allowed(sub: str, rest: Sequence[str]) -> bool:
    if sub in GIT_READ_ONLY:
        return True
    flags = {a.split("=", 1)[0] for a in rest if a.startswith("-")}
    pos = positionals(rest)
    if sub == "branch":
        return not pos and not (flags & BRANCH_WRITE_FLAGS)
    if sub == "tag":
        return not (flags & TAG_WRITE_FLAGS) and (not pos or "-l" in flags or "--list" in flags)
    if sub == "remote":
        return not pos or pos[0] in {"show", "get-url"}
    if sub == "stash":
        return bool(pos) and pos[0] in {"list", "show"}
    if sub == "config":
        return (
            bool(flags & CONFIG_READ_FLAGS)
            and not (flags & CONFIG_WRITE_FLAGS)
            and "-e" not in flags
        )
    if sub == "reflog":
        return not pos or pos[0] == "show"
    if sub == "worktree":
        return bool(pos) and pos[0] == "list"
    if sub == "submodule":
        return not pos or pos[0] in {"status", "summary"}
    if sub == "notes":
        return not pos or pos[0] in {"list", "show"}
    return False


def gh_allowed(args: Sequence[str]) -> bool:
    pos = positionals(args)
    if not pos:
        return True
    group = pos[0]
    if group not in GH_READ_ONLY:
        return False
    allowed = GH_READ_ONLY[group]
    if group == "api":
        return False  # handled below; kept for clarity
    if allowed is None:
        return True
    return len(pos) > 1 and pos[1] in allowed


def gh_api_allowed(args: Sequence[str]) -> bool:
    """`gh api` is read-only only for GET requests without a body."""
    for i, tok in enumerate(args):
        if tok in {"-f", "-F", "--field", "--raw-field", "--input"}:
            return False
        if tok in {"-X", "--method"}:
            method = args[i + 1].upper() if i + 1 < len(args) else ""
            if method != "GET":
                return False
        if tok.startswith("--method=") and tok.split("=", 1)[1].upper() != "GET":
            return False
    return True


def violations(command: str) -> list[str]:
    tokens = tokenize(command)
    if tokens is None:
        return [command.strip()] if FALLBACK_WRITE.search(command) else []
    found: list[str] = []
    for seg in segments(tokens):
        lead = leading_command(seg)
        if lead is None:
            continue
        prog, args = lead
        if prog == "git":
            parsed = git_subcommand(args)
            if parsed is None:
                continue
            sub, rest = parsed
            if not git_allowed(sub, rest):
                found.append(" ".join(seg))
        elif prog == "gh":
            pos = positionals(args)
            ok = gh_api_allowed(args) if pos and pos[0] == "api" else gh_allowed(args)
            if not ok:
                found.append(" ".join(seg))
    return found


def main() -> None:
    try:
        payload = json.load(sys.stdin)
    except (json.JSONDecodeError, OSError):
        sys.exit(0)
    tool_input = payload.get("tool_input") if isinstance(payload, dict) else None
    command = tool_input.get("command") if isinstance(tool_input, dict) else None
    if not isinstance(command, str):
        sys.exit(0)
    bad = violations(command)
    if not bad:
        sys.exit(0)
    print(
        "git_guard: blocked. Git and GitHub are read-only for Claude in this repo.", file=sys.stderr
    )
    for item in bad:
        print(f"  - {item}", file=sys.stderr)
    print(
        "Neil runs all git/gh write commands himself. Describe the change and suggest a commit "
        "message instead.",
        file=sys.stderr,
    )
    sys.exit(2)


if __name__ == "__main__":
    main()
