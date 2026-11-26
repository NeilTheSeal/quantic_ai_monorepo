import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { JSDOM } from "jsdom";
import { type AnswerKey, buildAnswerKey, type FrameKey } from "../src/answers.ts";
import { AnswerHighlighter, MARK_CLASS } from "../src/highlight.ts";

const RIGHT = "bbbbbbbb-0000-0000-0000-000000000001";
const WRONG = "bbbbbbbb-0000-0000-0000-000000000002";

function slide(frameId: string): string {
  return `<componentized frame-guid="${frameId}">
    <button component-id="${RIGHT}">right</button>
    <button component-id="${WRONG}">wrong</button>
  </componentized>`;
}

const KEY: FrameKey = {
  instructions: "Select an answer",
  challenges: [{ prompt: "<b>card</b>", correct: ["right"] }],
  highlightIds: [RIGHT],
};

function setup(html: string) {
  const dom = new JSDOM(`<!doctype html><html><head></head><body>${html}</body></html>`);
  const doc = dom.window.document;
  const highlighter = new AnswerHighlighter({
    doc,
    schedule: (fn) => {
      fn();
    },
  });
  return { doc, highlighter };
}

function keyed(frameId: string, gradedFrameIds: string[] = []): AnswerKey {
  return { keys: new Map([[frameId, KEY]]), gradedFrameIds };
}

function marked(doc: Document): string[] {
  return [...doc.querySelectorAll(`.${MARK_CLASS}`)].map((el) => el.textContent);
}

test("marks the correct button and shows the panel for the current slide", () => {
  const { doc, highlighter } = setup(slide("frame-1"));
  highlighter.addKeys(keyed("frame-1"));
  assert.deepEqual(marked(doc), [], "nothing while disabled");

  highlighter.setEnabled(true);
  assert.deepEqual(marked(doc), ["right"]);
  const panel = doc.getElementById("course-capture-answer-panel");
  assert.ok(panel);
  assert.match(panel.textContent, /Answer key/);
  assert.match(panel.textContent, /<b>card<\/b> → right/, "text, not HTML");
  assert.equal(panel.querySelector("b"), null);
});

test("disabling removes the marks and the panel", () => {
  const { doc, highlighter } = setup(slide("frame-1"));
  highlighter.addKeys(keyed("frame-1"));
  highlighter.setEnabled(true);
  highlighter.setEnabled(false);
  assert.deepEqual(marked(doc), []);
  assert.equal(doc.getElementById("course-capture-answer-panel"), null);
});

test("a new slide clears the old slide's marks and panel while the old one is still in the DOM", () => {
  const { doc, highlighter } = setup(slide("frame-1"));
  highlighter.addKeys(keyed("frame-1"));
  highlighter.setEnabled(true);
  assert.deepEqual(marked(doc), ["right"]);

  // Like AngularJS: the entering slide is inserted after the leaving one, which lingers.
  doc.body.insertAdjacentHTML("beforeend", slide("frame-2"));
  highlighter.apply();
  assert.equal(doc.querySelectorAll("[frame-guid]").length, 2);
  assert.deepEqual(marked(doc), []);
  assert.equal(doc.getElementById("course-capture-answer-panel"), null);
});

test("a slide animating out (.ng-leave) is never the current one", () => {
  const { doc, highlighter } = setup(
    `<div>${slide("frame-1")}</div><div class="ng-leave">${slide("frame-2")}</div>`,
  );
  highlighter.addKeys(keyed("frame-1"));
  highlighter.setEnabled(true);
  assert.deepEqual(marked(doc), ["right"]);
  assert.ok(doc.getElementById("course-capture-answer-panel"));
});

test("the MutationObserver applies keys to slides inserted later", async () => {
  const dom = new JSDOM("<!doctype html><html><head></head><body></body></html>");
  const doc = dom.window.document;
  const highlighter = new AnswerHighlighter({
    doc,
    schedule: (fn) => {
      setTimeout(fn, 0);
    },
  });
  highlighter.addKeys(keyed("frame-1"));
  highlighter.setEnabled(true);

  doc.body.insertAdjacentHTML("beforeend", slide("frame-1"));
  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.deepEqual(marked(doc), ["right"]);
  highlighter.setEnabled(false);
});

test("a frame seen in graded content loses its key, even one keyed earlier", () => {
  const { doc, highlighter } = setup(slide("frame-1"));
  highlighter.setEnabled(true);
  highlighter.addKeys(keyed("frame-1"));
  assert.deepEqual(marked(doc), ["right"]);

  highlighter.addKeys({ keys: new Map(), gradedFrameIds: ["frame-1"] });
  assert.deepEqual(marked(doc), []);
  assert.equal(doc.getElementById("course-capture-answer-panel"), null);

  // And it stays denied if an ungraded copy shows up again.
  highlighter.addKeys(keyed("frame-1"));
  assert.deepEqual(marked(doc), []);
});

test("keys that arrive after the slide rendered still apply", () => {
  const { doc, highlighter } = setup(slide("frame-1"));
  highlighter.setEnabled(true);
  assert.deepEqual(marked(doc), []);
  highlighter.addKeys(keyed("frame-1"));
  assert.deepEqual(marked(doc), ["right"]);
});

const EXAMPLES = new URL("../../course_html_examples/", import.meta.url);
const PAGE_2 = new URL("app-root_page-2.html", EXAMPLES);
const SAMPLE = new URL("api_calls/b3ebdcba-6b6d-406a-a238-88c6832656ba.json", EXAMPLES);

test(
  "real page 2 markup with the real lesson JSON",
  { skip: !(existsSync(PAGE_2) && existsSync(SAMPLE)) && "samples not present" },
  () => {
    const { doc, highlighter } = setup(readFileSync(PAGE_2, "utf8"));
    highlighter.addKeys(buildAnswerKey(JSON.parse(readFileSync(SAMPLE, "utf8"))));
    highlighter.setEnabled(true);
    // All six reasons on this slide are correct; only the answer buttons get marked.
    const texts = marked(doc).map((text) => text.replace(/\s+/g, " ").trim());
    assert.deepEqual(texts, [
      "It's easy to learn as a beginner.",
      "It has a strong community.",
      "It's used by many companies.",
      "It's a versatile language.",
      "It has tons of Monty Python references.",
      "It runs on lots of different platforms.",
    ]);
    assert.equal(doc.querySelectorAll(`button.${MARK_CLASS}`).length, 6);
    assert.ok(doc.getElementById("course-capture-answer-panel"));
  },
);
