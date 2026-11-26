import assert from "node:assert/strict";
import { test } from "node:test";
import { isLessonStreamUrl, requestsLessonContent } from "../src/intercept.ts";
import { basicAuth, normalizeBaseUrl, resolvePath } from "../src/webdav.ts";

const BASE = "https://app.quantic.edu/course/x/show";
const STREAM = "/api/lesson_streams/b3ebdcba-6b6d-406a-a238-88c6832656ba.json";

test("recognises lesson_streams URLs, relative or absolute", () => {
  assert.ok(isLessonStreamUrl(STREAM, BASE));
  assert.ok(isLessonStreamUrl(`https://app.quantic.edu${STREAM}?filters=%7B%7D`, BASE));
  assert.ok(!isLessonStreamUrl("/api/lesson_streams.json", BASE));
  assert.ok(!isLessonStreamUrl("/api/lesson_progress.json", BASE));
  assert.ok(!isLessonStreamUrl("http://[bad", BASE));
});

test("only full-content requests are worth re-fetching", () => {
  assert.ok(requestsLessonContent(`${STREAM}?load_full_content_for_lesson_id=abc`, BASE));
  assert.ok(requestsLessonContent(`${STREAM}?load_full_content_for_all_lessons=true`, BASE));
  assert.ok(
    !requestsLessonContent(
      `${STREAM}?load_full_content_for_all_lessons=false&load_full_content_for_lesson_id=`,
      BASE,
    ),
  );
  assert.ok(!requestsLessonContent("/api/other.json?load_full_content_for_lesson_id=abc", BASE));
});

test("normalizeBaseUrl requires https and adds a trailing slash", () => {
  assert.equal(normalizeBaseUrl(" https://x.herokuapp.com "), "https://x.herokuapp.com/");
  assert.equal(
    normalizeBaseUrl("https://x.herokuapp.com/dav?q=1#h"),
    "https://x.herokuapp.com/dav/",
  );
  assert.equal(normalizeBaseUrl("http://x.herokuapp.com/"), null);
  assert.equal(normalizeBaseUrl("not a url"), null);
});

test("resolvePath encodes each segment", () => {
  assert.equal(
    resolvePath("https://x/", "courses/a b/c#d.json"),
    "https://x/courses/a%20b/c%23d.json",
  );
});

test("basicAuth encodes UTF-8 credentials", () => {
  assert.equal(basicAuth("user", "pass"), `Basic ${Buffer.from("user:pass").toString("base64")}`);
  assert.equal(basicAuth("ü", "é"), `Basic ${Buffer.from("ü:é").toString("base64")}`);
});
