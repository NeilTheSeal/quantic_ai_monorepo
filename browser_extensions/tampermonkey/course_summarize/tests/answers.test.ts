import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { buildAnswerKey, unescapeAnswer } from "../src/answers.ts";

const A = "aaaaaaaa-0000-0000-0000-000000000001";
const B = "aaaaaaaa-0000-0000-0000-000000000002";
const C = "aaaaaaaa-0000-0000-0000-000000000003";

function answer(id: string, isCorrect: boolean, text: string) {
  return { id, is_correct: isCorrect, text, message: null, has_image: false };
}

function body(
  frames: unknown[],
  flags: { assessment?: unknown; test?: unknown; exam?: unknown } = {},
) {
  return {
    contents: {
      lesson_streams: [
        {
          id: "s",
          title: "Course",
          exam: "exam" in flags ? flags.exam : false,
          chapters: [],
          lessons: [
            {
              id: "l",
              title: "Lesson",
              assessment: "assessment" in flags ? flags.assessment : false,
              test: "test" in flags ? flags.test : false,
              frames,
            },
          ],
        },
      ],
    },
  };
}

const multipleChoice = {
  id: "f-mc",
  tutor_bot_description: {
    type: "basic_multiple_choice",
    instructions: "Select an answer",
    challenges: [
      { input_type: "multipleChoice", answers: [answer(A, true, "yes"), answer(B, false, "no")] },
    ],
  },
};

const thisOrThat = {
  id: "f-tot",
  tutor_bot_description: {
    type: "this_or_that",
    instructions: "Select an answer for each card",
    challenges: [
      { prompt_text: "card 1", answers: [answer(A, true, "works"), answer(B, false, "error")] },
      { prompt_text: "card 2", answers: [answer(A, false, "works"), answer(B, true, "error")] },
      { prompt_text: "card 3", answers: [answer(C, true, "always")] },
    ],
  },
};

const typed = {
  id: "f-typed",
  tutor_bot_description: {
    type: "compose_blanks_on_image",
    instructions: "Type an answer in each blank",
    challenges: [{ input_type: "userInput", correct_answer_text: 'isn\\\'t \\"nice.\\"' }],
  },
};

const noQuestion = {
  id: "f-read",
  tutor_bot_description: { type: "no_interaction", instructions: "Read and continue" },
};

test("multiple choice: correct ids are highlightable and listed", () => {
  const key = buildAnswerKey(body([multipleChoice, noQuestion])).keys;
  assert.deepEqual([...key.keys()], ["f-mc"], "slides without questions are left out");
  assert.deepEqual(key.get("f-mc"), {
    instructions: "Select an answer",
    challenges: [{ prompt: null, correct: ["yes"] }],
    highlightIds: [A],
  });
});

test("shared answer pools: only ids correct on every card are highlighted", () => {
  const frame = buildAnswerKey(body([thisOrThat])).keys.get("f-tot");
  assert.ok(frame);
  assert.deepEqual(frame.highlightIds, [C]);
  assert.deepEqual(frame.challenges, [
    { prompt: "card 1", correct: ["works"] },
    { prompt: "card 2", correct: ["error"] },
    { prompt: "card 3", correct: ["always"] },
  ]);
});

test("typed answers are unescaped and listed but not highlighted", () => {
  const frame = buildAnswerKey(body([typed])).keys.get("f-typed");
  assert.ok(frame);
  assert.deepEqual(frame.challenges, [{ prompt: null, correct: ['isn\'t "nice."'] }]);
  assert.deepEqual(frame.highlightIds, []);
  assert.equal(unescapeAnswer('\\"Let\\\'s!\\"'), '"Let\'s!"');
  assert.equal(unescapeAnswer('print("a\\nb")'), 'print("a\\nb")', "other backslashes stay");
});

test("graded or unflagged content gets no key", () => {
  for (const flags of [
    { assessment: true },
    { test: true },
    { exam: true },
    { assessment: undefined },
    { test: null },
    { exam: undefined },
  ]) {
    const result = buildAnswerKey(body([multipleChoice], flags));
    assert.equal(result.keys.size, 0, JSON.stringify(flags));
    assert.deepEqual(result.gradedFrameIds, ["f-mc"], "reported so stale keys can be dropped");
  }
});

test("titles naming graded formats get no key even with ungraded flags", () => {
  for (const title of ["SmartCase: Data Types", "Smart Case 2", "Final Exam", "Assessment"]) {
    const graded = body([multipleChoice]);
    graded.contents.lesson_streams[0]!.lessons[0]!.title = title;
    assert.equal(buildAnswerKey(graded).keys.size, 0, title);
  }
});

test("ordinary titles that merely contain those letters keep their key", () => {
  for (const title of ["Worked Examples", "Reassessing Lists", "Examining Strings"]) {
    const ungraded = body([multipleChoice]);
    ungraded.contents.lesson_streams[0]!.lessons[0]!.title = title;
    assert.equal(buildAnswerKey(ungraded).keys.size, 1, title);
  }
});

test("garbage in, empty key out", () => {
  assert.equal(buildAnswerKey(null).keys.size, 0);
  assert.equal(buildAnswerKey({ contents: { lesson_streams: [{}] } }).keys.size, 0);
  assert.equal(
    buildAnswerKey(body([null, { id: 1 }, { id: "x", tutor_bot_description: 5 }])).keys.size,
    0,
  );
});

const SAMPLE = new URL(
  "../../course_html_examples/api_calls/b3ebdcba-6b6d-406a-a238-88c6832656ba.json",
  import.meta.url,
);

test(
  "real sample: every question slide has a key",
  { skip: !existsSync(SAMPLE) && "sample not present" },
  () => {
    const key = buildAnswerKey(JSON.parse(readFileSync(SAMPLE, "utf8"))).keys;
    assert.equal(key.size, 14);
    const page2 = key.get("37aafb49-68ee-4e4e-bdbc-e900799a55f0");
    assert.equal(page2?.highlightIds.length, 6, "all six reasons are correct");
  },
);
