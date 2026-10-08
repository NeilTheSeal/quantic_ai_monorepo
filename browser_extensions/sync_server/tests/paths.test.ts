import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizePath } from "../src/paths.ts";

test("normalizes ordinary paths", () => {
  assert.equal(normalizePath("/"), "");
  assert.equal(normalizePath("//Tampermonkey/sync/"), "Tampermonkey/sync");
  assert.equal(normalizePath("/a%20b/x.user.js"), "a b/x.user.js");
});

test("rejects traversal and odd characters", () => {
  for (const bad of ["/../etc", "/a/%2e%2e/b", "/a/./b", "/a%5Cb", "/a%00", "/%E0%A4%A", "/<x>"]) {
    assert.equal(normalizePath(bad), null, bad);
  }
});
