// Turns a `GET /api/lesson_streams/<id>.json` response into the files to upload.
//
// The response carries the whole course outline, plus full `frames` for the lesson named by
// `load_full_content_for_lesson_id` (other lessons have `frames: null`). Each captured file is
// the API object verbatim, wrapped with a `capture` block saying where it came from and where
// the lesson sits in the course. Nothing is converted here; that happens later in Python, so
// the converter can improve without recapturing.

import { lessonFileName, snakeCase } from "./naming.ts";

/** The sync server rejects bodies over 5 MB; stay under it with room for headers. */
export const MAX_BODY_BYTES = 4_500_000;

type JsonObject = Record<string, unknown>;

export interface CaptureContext {
  sourceUrl: string;
  capturedAt: string;
  scriptVersion: string;
}

export interface UploadFile {
  /** Path under the WebDAV root, e.g. `courses/python_1_fundamentals/course.json`. */
  path: string;
  /** Dedupe key: content never changes, so one upload per key ever. */
  key: string;
  /** Human-readable name for notifications. */
  label: string;
  body: string;
}

interface LessonView {
  raw: JsonObject;
  id: string;
  title: string;
  frames: unknown[] | null;
}

interface ChapterView {
  title: string;
  lessonIds: string[];
}

interface StreamView {
  raw: JsonObject;
  id: string;
  title: string;
  chapters: ChapterView[];
  lessons: LessonView[];
}

interface LessonPosition {
  chapterNumber: number;
  chapterTitle: string | null;
  lessonNumber: number;
  lessonsInChapter: number;
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringField(obj: JsonObject, key: string): string | null {
  const value = obj[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function readLesson(value: unknown): LessonView | null {
  if (!isObject(value)) return null;
  const id = stringField(value, "id");
  const title = stringField(value, "title");
  if (id === null || title === null) return null;
  const frames = Array.isArray(value.frames) ? value.frames : null;
  return { raw: value, id, title, frames };
}

function readChapter(value: unknown): ChapterView | null {
  if (!isObject(value)) return null;
  const hashes = value.lesson_hashes;
  if (!Array.isArray(hashes)) return null;
  const lessonIds = hashes
    .map((hash) => (isObject(hash) ? stringField(hash, "lesson_id") : null))
    .filter((id): id is string => id !== null);
  return { title: stringField(value, "title") ?? "", lessonIds };
}

function readStream(value: unknown): StreamView | null {
  if (!isObject(value)) return null;
  const id = stringField(value, "id");
  const title = stringField(value, "title");
  const lessons = value.lessons;
  if (id === null || title === null || !Array.isArray(lessons)) return null;
  const chapters = Array.isArray(value.chapters) ? value.chapters : [];
  return {
    raw: value,
    id,
    title,
    chapters: chapters.map(readChapter).filter((c): c is ChapterView => c !== null),
    lessons: lessons.map(readLesson).filter((l): l is LessonView => l !== null),
  };
}

/** The streams in a lesson_streams response, skipping anything malformed. */
export function readStreams(body: unknown): StreamView[] {
  if (!isObject(body)) return [];
  const contents = body.contents;
  if (!isObject(contents)) return [];
  const streams = contents.lesson_streams;
  if (!Array.isArray(streams)) return [];
  return streams.map(readStream).filter((s): s is StreamView => s !== null);
}

function locateLesson(stream: StreamView, lessonId: string): LessonPosition {
  for (const [chapterIndex, chapter] of stream.chapters.entries()) {
    const index = chapter.lessonIds.indexOf(lessonId);
    if (index >= 0) {
      return {
        chapterNumber: chapterIndex + 1,
        chapterTitle: chapter.title || null,
        lessonNumber: index + 1,
        lessonsInChapter: chapter.lessonIds.length,
      };
    }
  }
  // Not in any chapter: number it by its place in the flat lesson list, under chapter 0.
  const index = stream.lessons.findIndex((lesson) => lesson.id === lessonId);
  return {
    chapterNumber: 0,
    chapterTitle: null,
    lessonNumber: index + 1,
    lessonsInChapter: stream.lessons.length,
  };
}

function byteLength(text: string): number {
  return new TextEncoder().encode(text).length;
}

/**
 * Pretty JSON when it fits, compact JSON when that fits, and as a last resort the lesson
 * without its `author_comments` (Quantic's internal editing threads, which are never fed to
 * the LLM anyway). Returns null when even that is too big.
 */
export function serialize(record: JsonObject, maxBytes = MAX_BODY_BYTES): string | null {
  const pretty = JSON.stringify(record, null, 2);
  if (byteLength(pretty) <= maxBytes) return pretty;
  const compact = JSON.stringify(record);
  if (byteLength(compact) <= maxBytes) return compact;

  const lesson = record.lesson;
  const capture = record.capture;
  if (!isObject(lesson) || !Array.isArray(lesson.frames) || !isObject(capture)) return null;
  const frames = lesson.frames.map((frame: unknown) => {
    if (!isObject(frame)) return frame;
    const { author_comments: _dropped, ...rest } = frame;
    return rest;
  });
  const stripped = JSON.stringify({
    ...record,
    capture: { ...capture, stripped_fields: ["frames[].author_comments"] },
    lesson: { ...lesson, frames },
  });
  return byteLength(stripped) <= maxBytes ? stripped : null;
}

export interface CapturePlan {
  files: UploadFile[];
  /** Lessons that had content but could not be serialized under the size limit. */
  oversized: string[];
}

/** Files to upload for one API response. Empty when the response holds no lesson content. */
export function planCapture(body: unknown, context: CaptureContext): CapturePlan {
  const plan: CapturePlan = { files: [], oversized: [] };
  const baseCapture = {
    source_url: context.sourceUrl,
    captured_at: context.capturedAt,
    script_version: context.scriptVersion,
  };

  for (const stream of readStreams(body)) {
    const withContent = stream.lessons.filter((l) => l.frames !== null && l.frames.length > 0);
    // Course pages and dashboards load the same endpoint without lesson content. Only record
    // a course once a lesson in it is actually opened.
    if (withContent.length === 0) continue;

    const courseDir = `courses/${snakeCase(stream.title)}`;
    const outline = {
      ...stream.raw,
      lessons: stream.lessons.map(({ raw }) => {
        const { frames: _frames, ...rest } = raw;
        return rest;
      }),
    };
    const courseBody = serialize({
      capture: { ...baseCapture, kind: "course" },
      stream: outline,
    });
    if (courseBody === null) {
      plan.oversized.push(`${stream.title} (course outline)`);
    } else {
      plan.files.push({
        path: `${courseDir}/course.json`,
        key: `course:${stream.id}`,
        label: `Course outline: ${stream.title}`,
        body: courseBody,
      });
    }

    for (const lesson of withContent) {
      const position = locateLesson(stream, lesson.id);
      const lessonBody = serialize({
        capture: {
          ...baseCapture,
          kind: "lesson",
          course_id: stream.id,
          course_title: stream.title,
          chapter_number: position.chapterNumber,
          chapter_title: position.chapterTitle,
          lesson_number: position.lessonNumber,
          lessons_in_chapter: position.lessonsInChapter,
        },
        lesson: lesson.raw,
      });
      if (lessonBody === null) {
        plan.oversized.push(lesson.title);
        continue;
      }
      const fileName = lessonFileName(position.chapterNumber, position.lessonNumber, lesson.title);
      plan.files.push({
        path: `${courseDir}/lessons/${fileName}`,
        key: `lesson:${stream.id}:${lesson.id}`,
        label: `${position.chapterNumber}.${position.lessonNumber} ${lesson.title}`,
        body: lessonBody,
      });
    }
  }
  return plan;
}
