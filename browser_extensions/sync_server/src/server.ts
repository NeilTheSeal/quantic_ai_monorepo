import { createServer } from "node:http";
import { createApp } from "./app.ts";
import { GitHubStorage } from "./storage.ts";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable ${name}`);
  return value;
}

const pass = required("WEBDAV_PASS");
if (pass.length < 16) throw new Error("WEBDAV_PASS must be at least 16 characters");

const storage = new GitHubStorage({
  token: required("GITHUB_TOKEN"),
  repo: required("GITHUB_REPO"),
  branch: process.env.GITHUB_BRANCH || "main",
  prefix: (process.env.GITHUB_PATH_PREFIX ?? "").replace(/^\/+|\/+$/g, ""),
});

const app = createApp(
  // Heroku sets DYNO on every dyno; locally we serve plain HTTP.
  { user: required("WEBDAV_USER"), pass, behindProxy: Boolean(process.env.DYNO) },
  storage,
);

const port = Number(process.env.PORT ?? 3000);
createServer(app).listen(port, () => {
  console.log(`Tampermonkey sync server listening on port ${port}`);
});
