# course_summarize

Adds to the root CLAUDE.md. See [README.md](README.md) for what this does and the storage layout.

- **Not a nested git repo.** It's a plain folder in the monorepo. `tsconfig.json` extends the
  root `tsconfig.base.json` directly, with no generated copy. ESLint and Prettier use the root
  configs, which ignore the rest of `browser_extensions/tampermonkey/` but not this folder.
- **Stack:** TypeScript, bundled by esbuild ([build.mjs](build.mjs), which also writes the
  userscript header) into `dist/course_summarize.user.js`. `tsc` only type-checks. Tests use
  `node:test` and run the `.ts` sources directly, which is why imports end in `.ts`.
- **`dist/` is committed.** Tampermonkey updates from its raw GitHub URL when `@version` goes
  up. `npm run release` bumps the version and builds; `npm run build` doesn't bump.
- `GM_*` globals and `unsafeWindow` appear only in `src/main.ts` and `src/webdav.ts`. Everything
  else takes its dependencies as arguments so it runs under node:test.
- **This repo is public.** Never put credentials, captured course content, or API samples in
  tracked files. The server URL and credentials live in Tampermonkey storage. Captured data lives
  only in the private `sync_files` repo. Only the final `summary.md` goes in `courses/<course>/`.
- **Python** (`summarize.py`, `summarizer/`, `tests/summarizer/`): its own `.venv` on Python
  3.15.2 with [requirements.txt](requirements.txt); run tools as `.venv/bin/python -m …`. Ruff and
  mypy use the root `pyproject.toml`; the local one only sets pytest's `pythonpath`. Secrets
  (`ANTHROPIC_API_KEY`, `WEBDAV_*`) come from this folder's `.env` (see `.env.example`).
- The summarizer must never feed graded content (SmartCases, exams: see `Course.is_graded`) to a
  model, and only `summary.md` goes in the monorepo. All other working data goes to `sync_files`
  through the WebDAV server.
- Summary prompts live in `summarizer/summary.py`. Changing them changes every future summary;
  existing summaries are only regenerated when their `summary.md` is deleted, both locally and
  in `sync_files` under `working/`.
- Gates: `npm run lint-check && npm run type-check && npm test && npm run format-check`, and for
  Python `ruff format --check`, `ruff check`, `mypy`, `pytest` through `.venv/bin/python -m`.
