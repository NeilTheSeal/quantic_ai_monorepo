// Bundles src/main.ts into dist/course_summarize.user.js with the userscript header.
// The @version comes from package.json; `npm run release` bumps it before building, which is
// what makes Tampermonkey pick up the new file from @updateURL.
import { readFile } from "node:fs/promises";
import * as esbuild from "esbuild";

const pkg = JSON.parse(await readFile(new URL("./package.json", import.meta.url), "utf8"));
const rawUrl =
  "https://raw.githubusercontent.com/NeilTheSeal/quantic_ai_monorepo/refs/heads/main/" +
  "browser_extensions/tampermonkey/course_summarize/dist/course_summarize.user.js";

const header = `// ==UserScript==
// @name         Quantic Course Capture
// @namespace    http://tampermonkey.net
// @version      ${pkg.version}
// @description  Captures Quantic lesson content from the app's API and uploads it to the WebDAV sync server for later summarization.
// @author       Neil Hendren
// @updateURL    ${rawUrl}
// @downloadURL  ${rawUrl}
// @match        https://app.quantic.edu/*
// @run-at       document-start
// @sandbox      JavaScript
// @noframes
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_registerMenuCommand
// @connect      herokuapp.com
// ==/UserScript==
// Built from browser_extensions/tampermonkey/course_summarize/src; edit there, not here.
`;

/** @type {import("esbuild").BuildOptions} */
const options = {
  entryPoints: ["src/main.ts"],
  outfile: "dist/course_summarize.user.js",
  bundle: true,
  format: "iife",
  target: "chrome120",
  charset: "utf8",
  legalComments: "none",
  banner: { js: header },
  logLevel: "info",
};

if (process.argv.includes("--watch")) {
  const context = await esbuild.context(options);
  await context.watch();
} else {
  await esbuild.build(options);
}
