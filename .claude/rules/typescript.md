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
- Each project is self-contained: its own `package.json`, `node_modules/`, `tsconfig.json`,
  `eslint.config.js` (flat config, typescript-eslint), and Prettier config. Pin the Node version
  in `engines` and `.nvmrc`.
- Every project exposes these scripts: `dev`, `build`, `lint`, `typecheck` (`tsc --noEmit`),
  `test`, `format`. Run `npm run lint && npm run typecheck && npm test` before reporting done.
- No `any`; use `unknown` and narrow. Named exports only. `async/await`, not `.then()` chains.
- Tests: Vitest, files named `*.test.ts` next to the source.
- Framework, bundler, and styling are decided per project when it starts and recorded in that
  project's CLAUDE.md. Ask once; don't assume React.
- Dependencies: ask before adding. After approval, `npm install <pkg>` from the project dir. The
  lockfile is committed (by Neil).
- `.vscode/settings.json` at the repo root already formats with Prettier and fixes with ESLint on
  save for these file types.
