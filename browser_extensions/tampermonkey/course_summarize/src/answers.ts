// Answer key for ungraded lessons, built from each frame's `tutor_bot_description`.
//
// Graded content is excluded: a lesson goes in only when the API says `assessment: false` and
// `test: false` and its course isn't an `exam`. A missing flag counts as graded. As a second
// guard, titles that name graded formats (SmartCase, exam, assessment) are skipped too.

import { readStreams } from "./capture.ts";

export interface ChallengeKey {
  /** What the challenge asks about (a card's prompt), when there is one. */
  prompt: string | null;
  /** Text of every correct answer. */
  correct: string[];
}

export interface FrameKey {
  instructions: string | null;
  challenges: ChallengeKey[];
  /**
   * Answer component ids safe to highlight: correct in every challenge they appear in. In
   * "this or that" and matching frames one answer pool serves several cards with different
   * correct answers, so those ids are left to the panel.
   */
  highlightIds: string[];
}

export interface AnswerKey {
  /** Frame id → key, for ungraded lessons. */
  keys: Map<string, FrameKey>;
  /** Frame ids of every graded or unflagged lesson in the response. */
  gradedFrameIds: string[];
}

type JsonObject = Record<string, unknown>;

const GRADED_TITLE = /\bsmart\s*cases?\b|\bexams?\b|\bassessments?\b/i;

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

/** `isn\'t` → `isn't`: user-input answers arrive with backslash-escaped quotes. Other
 * backslashes (`\n` in a line of Python) are left alone. */
export function unescapeAnswer(value: string): string {
  return value.replace(/\\(['"])/g, "$1");
}

function readFrame(description: JsonObject): FrameKey {
  const challenges: ChallengeKey[] = [];
  const correctIn = new Map<string, number>();
  const seenIn = new Map<string, number>();

  const rawChallenges = Array.isArray(description.challenges) ? description.challenges : [];
  for (const challenge of rawChallenges) {
    if (!isObject(challenge)) continue;
    const correct: string[] = [];
    const typed = text(challenge.correct_answer_text);
    if (typed !== null) correct.push(unescapeAnswer(typed));
    const answers = Array.isArray(challenge.answers) ? challenge.answers : [];
    for (const answer of answers) {
      if (!isObject(answer) || typeof answer.id !== "string") continue;
      seenIn.set(answer.id, (seenIn.get(answer.id) ?? 0) + 1);
      if (answer.is_correct === true) {
        correctIn.set(answer.id, (correctIn.get(answer.id) ?? 0) + 1);
        correct.push(text(answer.text) ?? "(image answer)");
      }
    }
    // Card prompts ("this or that", matching). A fill-in blank's `blank_text` is the answer
    // itself, so it isn't a prompt.
    if (correct.length > 0) challenges.push({ prompt: text(challenge.prompt_text), correct });
  }

  const highlightIds = [...correctIn].filter(([id, n]) => seenIn.get(id) === n).map(([id]) => id);
  return { instructions: text(description.instructions), challenges, highlightIds };
}

/** Answer keys for the ungraded lessons with content in a lesson_streams body. */
export function buildAnswerKey(body: unknown): AnswerKey {
  const result: AnswerKey = { keys: new Map(), gradedFrameIds: [] };
  for (const stream of readStreams(body)) {
    const gradedCourse = stream.raw.exam !== false || GRADED_TITLE.test(stream.title);
    for (const lesson of stream.lessons) {
      if (lesson.frames === null) continue;
      const graded =
        gradedCourse ||
        lesson.raw.assessment !== false ||
        lesson.raw.test !== false ||
        GRADED_TITLE.test(lesson.title);
      for (const frame of lesson.frames) {
        if (!isObject(frame) || typeof frame.id !== "string") continue;
        if (graded) {
          result.gradedFrameIds.push(frame.id);
          continue;
        }
        const description = frame.tutor_bot_description;
        if (!isObject(description)) continue;
        const frameKey = readFrame(description);
        if (frameKey.challenges.length > 0) result.keys.set(frame.id, frameKey);
      }
    }
  }
  return result;
}
