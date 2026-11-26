import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { type CaptureContext, planCapture, serialize } from "../src/capture.ts";

const context: CaptureContext = {
  sourceUrl: "https://app.quantic.edu/api/lesson_streams/x.json",
  capturedAt: "2026-11-26T00:00:00.000Z",
  scriptVersion: "0.1.0",
};

function lesson(id: string, title: string, frames: unknown[] | null) {
  return { id, title, key_terms: ["term"], frames };
}

function response(lessons: unknown[]) {
  return {
    meta: {},
    contents: {
      lesson_streams: [
        {
          id: "stream-1",
          title: "Python I: Fundamentals",
          chapters: [
            { title: "Basics", lesson_hashes: [{ lesson_id: "l1" }, { lesson_id: "l2" }] },
            { title: "More", lesson_hashes: [{ lesson_id: "l3" }] },
          ],
          lessons,
        },
      ],
    },
  };
}

const frame = { id: "f1", author_comments: [{ text: "internal" }], components: [] };

test("captures the course outline and the lesson that has frames", () => {
  const body = response([
    lesson("l1", "Welcome", null),
    lesson("l2", "Scripts and Variables", [frame]),
    lesson("l3", "Lists", null),
  ]);
  const plan = planCapture(body, context);
  assert.deepEqual(plan.oversized, []);
  assert.deepEqual(
    plan.files.map((f) => [f.path, f.key]),
    [
      ["courses/python_1_fundamentals/course.json", "course:stream-1"],
      [
        "courses/python_1_fundamentals/lessons/01-02_scripts_and_variables.json",
        "lesson:stream-1:l2",
      ],
    ],
  );

  const course = JSON.parse(plan.files[0]!.body) as {
    capture: { kind: string };
    stream: { lessons: object[] };
  };
  assert.equal(course.capture.kind, "course");
  assert.equal(course.stream.lessons.length, 3);
  assert.ok(course.stream.lessons.every((l: object) => !("frames" in l)));

  const saved = JSON.parse(plan.files[1]!.body);
  assert.deepEqual(saved.capture, {
    source_url: context.sourceUrl,
    captured_at: context.capturedAt,
    script_version: context.scriptVersion,
    kind: "lesson",
    course_id: "stream-1",
    course_title: "Python I: Fundamentals",
    chapter_number: 1,
    chapter_title: "Basics",
    lesson_number: 2,
    lessons_in_chapter: 2,
  });
  // Verbatim: author comments are kept in the raw capture.
  assert.deepEqual(saved.lesson.frames, [frame]);
  assert.equal(plan.files[1]!.label, "1.2 Scripts and Variables");
});

test("numbers lessons within their chapter", () => {
  const plan = planCapture(response([lesson("l3", "Lists", [frame])]), context);
  assert.equal(plan.files[1]!.path, "courses/python_1_fundamentals/lessons/02-01_lists.json");
});

test("a lesson missing from the chapters falls under chapter 0", () => {
  const plan = planCapture(
    response([lesson("l1", "A", null), lesson("zz", "Extra", [frame])]),
    context,
  );
  assert.equal(plan.files[1]!.path, "courses/python_1_fundamentals/lessons/00-02_extra.json");
});

test("responses without lesson content produce no files", () => {
  assert.deepEqual(planCapture(response([lesson("l1", "Welcome", null)]), context).files, []);
  assert.deepEqual(planCapture(response([lesson("l1", "Welcome", [])]), context).files, []);
  assert.deepEqual(planCapture({ contents: {} }, context).files, []);
  assert.deepEqual(planCapture("not json", context).files, []);
  assert.deepEqual(planCapture(null, context).files, []);
});

test("serialize falls back to compact, then strips author comments, then gives up", () => {
  const record = {
    capture: { kind: "lesson" },
    lesson: { id: "l1", frames: [{ id: "f", author_comments: ["x".repeat(500)], text: "keep" }] },
  };
  const pretty = serialize(record, 10_000);
  assert.ok(pretty?.includes("\n  "));

  const compactSize = JSON.stringify(record).length;
  const compact = serialize(record, compactSize);
  assert.equal(compact, JSON.stringify(record));

  const stripped = serialize(record, 200);
  assert.ok(stripped !== null);
  const parsed = JSON.parse(stripped);
  assert.deepEqual(parsed.lesson.frames, [{ id: "f", text: "keep" }]);
  assert.deepEqual(parsed.capture.stripped_fields, ["frames[].author_comments"]);

  assert.equal(serialize(record, 50), null);
});

// The real API response Neil saved; not committed, so the test skips without it.
const SAMPLE = new URL(
  "../../course_html_examples/api_calls/b3ebdcba-6b6d-406a-a238-88c6832656ba.json",
  import.meta.url,
);

test("real lesson_streams sample", { skip: !existsSync(SAMPLE) && "sample not present" }, () => {
  const body: unknown = JSON.parse(readFileSync(SAMPLE, "utf8"));
  const plan = planCapture(body, context);
  assert.deepEqual(
    plan.files.map((f) => f.path),
    [
      "courses/python_1_fundamentals/course.json",
      "courses/python_1_fundamentals/lessons/01-01_welcome_to_python.json",
    ],
  );
  for (const file of plan.files) assert.ok(Buffer.byteLength(file.body) < 4_500_000);
  const saved = JSON.parse(plan.files[1]!.body);
  assert.equal(saved.lesson.frames.length, 22);
  assert.equal(saved.capture.lessons_in_chapter, 10);
});
