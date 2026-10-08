---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
  - "**/*.mjs"
  - "**/*.cjs"
  - "**/package.json"
  - "**/tsconfig*.json"
---

# TypeScript and Node

- TypeScript with `strict: true`. npm, not pnpm, yarn, or bun. ESM (`"type": "module"`).
- Lint, format and type-strictness rules are shared and live at the repo root; projects do not
  carry their own copies:
  - [eslint.config.js](../../eslint.config.js): flat config, typescript-eslint type-aware rules.
    ESLint finds it by walking up from the linted file, so a project just runs `eslint .`.
  - [.prettierrc.json](../../.prettierrc.json) and [.prettierignore](../../.prettierignore):
    Prettier handles JS/TS, JSON, YAML, CSS, HTML and Markdown only. Python, TOML, shell and
    lockfiles are ignored; they have their own formatters.
  - [tsconfig.base.json](../../tsconfig.base.json): strictness flags. A project's `tsconfig.json`
    does `"extends": "./tsconfig.base.json"` against a generated copy in the project (see
    [scripts/lib/shared-files.sh](../../scripts/lib/shared-files.sh); the nested pre-commit hook
    refreshes it) and adds only compiler/emit settings (target, module, outDir, include). Never
    edit the copy. Emit-specific settings go in a `tsconfig.build.json` when the
    main tsconfig also covers tests.
  - The tools install once at the root (`npm install` in the repo root; devDependencies in the
    root [package.json](../../package.json)). Project `node_modules/` hold only the project's
    own dependencies, `@types/*`, and `typescript` (see next point).
- Two TypeScript versions on purpose. Projects compile with `typescript@^7` (the native
  compiler: only `tsc`, no JavaScript API). The root pins `typescript@^6` because
  typescript-eslint needs the JS API and declares `typescript <6.1`; ESLint resolves it from the
  root `node_modules`, `tsc` resolves from the project's. Do not "unify" them until
  typescript-eslint supports TS 7 (tracked in typescript-eslint/typescript-eslint#10940). Options
  removed in 7 that bite here: `moduleResolution: node10` (use `nodenext`, or `bundler` with
  `module: commonjs`), `baseUrl`, `esModuleInterop: false`. The editor's TypeScript service is
  VS Code's bundled TS 6; `typescript.tsdk` cannot point at a TS 7 package.
- Each project still has its own `package.json`, `node_modules/`, `tsconfig.json`, and `.nvmrc`,
  with the Node version pinned in `engines`.
- Every project exposes these scripts: `dev`, `build`, `lint-check` (`eslint .`), `type-check`
  (`tsc --noEmit`), `test`, `format` (`prettier --write .`), `format-check`
  (`prettier --check .`). Run `npm run lint-check && npm run type-check && npm test` before
  reporting done.
- No `any`; use `unknown` and narrow. Named exports only. `async/await`, not `.then()` chains.
  Data from the wire is `unknown` until a runtime guard has checked it; don't cast it.
- Tests: `node --test` with files in `tests/` by default; Vitest when a project needs its
  tooling (browser, coverage). Either way files are named `*.test.ts`.
- Framework, bundler, and styling are decided per project when it starts and recorded in that
  project's CLAUDE.md. Ask once; don't assume React.
- Dependencies: ask before adding. After approval, `npm install <pkg>` from the project dir. The
  lockfile is committed (by Neil).
- `.vscode/settings.json` at the repo root already formats with Prettier and fixes with ESLint on
  save for these file types.
