# Tampermonkey sync server

A minimal WebDAV server for Tampermonkey's sync feature. Files are stored in a GitHub repo
through the Contents API (one commit per write), because Heroku's filesystem is wiped on every
restart. No runtime dependencies; Node 24+ runs the TypeScript directly.

## GitHub setup

1. Create a **private** repo for the synced files, e.g. `NeilTheSeal/tampermonkey-sync`, with
   an initial commit on `main`.
2. Create a fine-grained personal access token scoped to that repo only, with
   **Contents: Read and write**.

## Heroku config

```bash
heroku config:set WEBDAV_USER=neil WEBDAV_PASS="$(openssl rand -base64 24)" \
  GITHUB_TOKEN=github_pat_... GITHUB_REPO=NeilTheSeal/tampermonkey-sync
```

Optional: `GITHUB_BRANCH` (default `main`), `GITHUB_PATH_PREFIX` (default `tampermonkey`).
See `.env.example`. On Heroku (`DYNO` is set) plain-HTTP requests are refused.

Deploying from this subfolder of the monorepo:

```bash
git subtree push --prefix browser_extensions/sync_server heroku main
```

## Tampermonkey

Dashboard → Settings (Config mode: Advanced) → Script Sync → Type **WebDAV**:

- URL: `https://<app>.herokuapp.com/`
- Username / password: the `WEBDAV_*` values

## Development

```bash
npm install
cp .env.example .env   # fill in values
npm run dev            # http://localhost:3000
npm run typecheck && npm test
```
