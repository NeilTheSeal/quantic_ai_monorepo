// ==UserScript==
// @name         Quantic Course Capture
// @namespace    http://tampermonkey.net
// @version      0.2.0
// @description  Captures Quantic lesson content from the app's API and uploads it to the WebDAV sync server for later summarization.
// @author       Neil Hendren
// @updateURL    https://raw.githubusercontent.com/NeilTheSeal/quantic_ai_monorepo/refs/heads/main/browser_extensions/tampermonkey/course_summarize/dist/course_summarize.user.js
// @downloadURL  https://raw.githubusercontent.com/NeilTheSeal/quantic_ai_monorepo/refs/heads/main/browser_extensions/tampermonkey/course_summarize/dist/course_summarize.user.js
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

"use strict";
(() => {
  // src/naming.ts
  var ROMAN_VALUES = { I: 1, V: 5, X: 10 };
  var MAX_SLUG_LENGTH = 80;
  function romanToInt(token) {
    if (!/^[IVX]+$/.test(token)) return null;
    let total = 0;
    for (let i = 0; i < token.length; i++) {
      const value = ROMAN_VALUES[token.charAt(i)] ?? 0;
      const next = ROMAN_VALUES[token.charAt(i + 1)] ?? 0;
      total += value < next ? -value : value;
    }
    return intToRoman(total) === token ? total : null;
  }
  function intToRoman(n) {
    const table = [
      [10, "X"],
      [9, "IX"],
      [5, "V"],
      [4, "IV"],
      [1, "I"]
    ];
    let rest = n;
    let out = "";
    for (const [value, numeral] of table) {
      while (rest >= value) {
        out += numeral;
        rest -= value;
      }
    }
    return out;
  }
  function numeralAt(token, after) {
    const value = romanToInt(token);
    if (value === null) return null;
    return token.length > 1 || /^\s*(?:[:\-–—]|$)/.test(after) ? value : null;
  }
  function snakeCase(title) {
    const plain = title.normalize("NFKD").replace(/[̀-ͯ]/g, "");
    const words = [...plain.matchAll(/[A-Za-z0-9]+/g)].map((match) => {
      const token = match[0];
      const numeral = numeralAt(token, plain.slice(match.index + token.length));
      return numeral === null ? token.toLowerCase() : String(numeral);
    });
    const slug = words.join("_").slice(0, MAX_SLUG_LENGTH).replace(/_+$/, "");
    return slug.length > 0 ? slug : "untitled";
  }
  function pad2(n) {
    return String(n).padStart(2, "0");
  }
  function lessonFileName(chapterNumber, lessonNumber, title) {
    return `${pad2(chapterNumber)}-${pad2(lessonNumber)}_${snakeCase(title)}.json`;
  }

  // src/capture.ts
  var MAX_BODY_BYTES = 45e5;
  function isObject(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }
  function stringField(obj, key) {
    const value = obj[key];
    return typeof value === "string" && value.length > 0 ? value : null;
  }
  function readLesson(value) {
    if (!isObject(value)) return null;
    const id = stringField(value, "id");
    const title = stringField(value, "title");
    if (id === null || title === null) return null;
    const frames = Array.isArray(value.frames) ? value.frames : null;
    return { raw: value, id, title, frames };
  }
  function readChapter(value) {
    if (!isObject(value)) return null;
    const hashes = value.lesson_hashes;
    if (!Array.isArray(hashes)) return null;
    const lessonIds = hashes.map((hash) => isObject(hash) ? stringField(hash, "lesson_id") : null).filter((id) => id !== null);
    return { title: stringField(value, "title") ?? "", lessonIds };
  }
  function readStream(value) {
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
      chapters: chapters.map(readChapter).filter((c) => c !== null),
      lessons: lessons.map(readLesson).filter((l) => l !== null)
    };
  }
  function readStreams(body) {
    if (!isObject(body)) return [];
    const contents = body.contents;
    if (!isObject(contents)) return [];
    const streams = contents.lesson_streams;
    if (!Array.isArray(streams)) return [];
    return streams.map(readStream).filter((s) => s !== null);
  }
  function locateLesson(stream, lessonId) {
    for (const [chapterIndex, chapter] of stream.chapters.entries()) {
      const index2 = chapter.lessonIds.indexOf(lessonId);
      if (index2 >= 0) {
        return {
          chapterNumber: chapterIndex + 1,
          chapterTitle: chapter.title || null,
          lessonNumber: index2 + 1,
          lessonsInChapter: chapter.lessonIds.length
        };
      }
    }
    const index = stream.lessons.findIndex((lesson) => lesson.id === lessonId);
    return {
      chapterNumber: 0,
      chapterTitle: null,
      lessonNumber: index + 1,
      lessonsInChapter: stream.lessons.length
    };
  }
  function byteLength(text2) {
    return new TextEncoder().encode(text2).length;
  }
  function serialize(record, maxBytes = MAX_BODY_BYTES) {
    const pretty = JSON.stringify(record, null, 2);
    if (byteLength(pretty) <= maxBytes) return pretty;
    const compact = JSON.stringify(record);
    if (byteLength(compact) <= maxBytes) return compact;
    const lesson = record.lesson;
    const capture = record.capture;
    if (!isObject(lesson) || !Array.isArray(lesson.frames) || !isObject(capture)) return null;
    const frames = lesson.frames.map((frame) => {
      if (!isObject(frame)) return frame;
      const { author_comments: _dropped, ...rest } = frame;
      return rest;
    });
    const stripped = JSON.stringify({
      ...record,
      capture: { ...capture, stripped_fields: ["frames[].author_comments"] },
      lesson: { ...lesson, frames }
    });
    return byteLength(stripped) <= maxBytes ? stripped : null;
  }
  function planCapture(body, context) {
    const plan = { files: [], oversized: [] };
    const baseCapture = {
      source_url: context.sourceUrl,
      captured_at: context.capturedAt,
      script_version: context.scriptVersion
    };
    for (const stream of readStreams(body)) {
      const withContent = stream.lessons.filter((l) => l.frames !== null && l.frames.length > 0);
      if (withContent.length === 0) continue;
      const courseDir = `courses/${snakeCase(stream.title)}`;
      const outline = {
        ...stream.raw,
        lessons: stream.lessons.map(({ raw }) => {
          const { frames: _frames, ...rest } = raw;
          return rest;
        })
      };
      const courseBody = serialize({
        capture: { ...baseCapture, kind: "course" },
        stream: outline
      });
      if (courseBody === null) {
        plan.oversized.push(`${stream.title} (course outline)`);
      } else {
        plan.files.push({
          path: `${courseDir}/course.json`,
          key: `course:${stream.id}`,
          label: `Course outline: ${stream.title}`,
          body: courseBody
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
            lessons_in_chapter: position.lessonsInChapter
          },
          lesson: lesson.raw
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
          body: lessonBody
        });
      }
    }
    return plan;
  }

  // src/answers.ts
  var GRADED_TITLE = /\bsmart\s*cases?\b|\bexams?\b|\bassessments?\b/i;
  function isObject2(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }
  function text(value) {
    return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
  }
  function unescapeAnswer(value) {
    return value.replace(/\\(['"])/g, "$1");
  }
  function readFrame(description) {
    const challenges = [];
    const correctIn = /* @__PURE__ */ new Map();
    const seenIn = /* @__PURE__ */ new Map();
    const rawChallenges = Array.isArray(description.challenges) ? description.challenges : [];
    for (const challenge of rawChallenges) {
      if (!isObject2(challenge)) continue;
      const correct = [];
      const typed = text(challenge.correct_answer_text);
      if (typed !== null) correct.push(unescapeAnswer(typed));
      const answers = Array.isArray(challenge.answers) ? challenge.answers : [];
      for (const answer of answers) {
        if (!isObject2(answer) || typeof answer.id !== "string") continue;
        seenIn.set(answer.id, (seenIn.get(answer.id) ?? 0) + 1);
        if (answer.is_correct === true) {
          correctIn.set(answer.id, (correctIn.get(answer.id) ?? 0) + 1);
          correct.push(text(answer.text) ?? "(image answer)");
        }
      }
      if (correct.length > 0) challenges.push({ prompt: text(challenge.prompt_text), correct });
    }
    const highlightIds = [...correctIn].filter(([id, n]) => seenIn.get(id) === n).map(([id]) => id);
    return { instructions: text(description.instructions), challenges, highlightIds };
  }
  function buildAnswerKey(body) {
    const result = { keys: /* @__PURE__ */ new Map(), gradedFrameIds: [] };
    for (const stream of readStreams(body)) {
      const gradedCourse = stream.raw.exam !== false || GRADED_TITLE.test(stream.title);
      for (const lesson of stream.lessons) {
        if (lesson.frames === null) continue;
        const graded = gradedCourse || lesson.raw.assessment !== false || lesson.raw.test !== false || GRADED_TITLE.test(lesson.title);
        for (const frame of lesson.frames) {
          if (!isObject2(frame) || typeof frame.id !== "string") continue;
          if (graded) {
            result.gradedFrameIds.push(frame.id);
            continue;
          }
          const description = frame.tutor_bot_description;
          if (!isObject2(description)) continue;
          const frameKey = readFrame(description);
          if (frameKey.challenges.length > 0) result.keys.set(frame.id, frameKey);
        }
      }
    }
    return result;
  }

  // src/highlight.ts
  var STYLE_ID = "course-capture-answer-style";
  var PANEL_ID = "course-capture-answer-panel";
  var MARK_CLASS = "course-capture-correct-answer";
  var UUID = /^[0-9a-f-]{36}$/i;
  var CSS_TEXT = `
.${MARK_CLASS} {
  outline: 3px solid #22c55e !important;
  outline-offset: 2px !important;
  box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.3) !important;
}
#${PANEL_ID} {
  position: fixed;
  right: 15px;
  bottom: 100px;
  z-index: 999998;
  max-width: 340px;
  max-height: 40vh;
  overflow: auto;
  padding: 8px 12px;
  border-left: 4px solid #22c55e;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.82);
  color: #ffffff;
  font: 13px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
#${PANEL_ID} .title { font-weight: 700; }
#${PANEL_ID} .instructions { opacity: 0.7; font-size: 12px; }
#${PANEL_ID} ol { margin: 4px 0 0; padding-left: 18px; }
#${PANEL_ID} .prompt { opacity: 0.8; }
#${PANEL_ID} .answer { color: #86efac; font-weight: 600; }
`;
  var AnswerHighlighter = class {
    doc;
    schedule;
    keys = /* @__PURE__ */ new Map();
    /** Frames seen in graded or unflagged lessons: never keyed, even if keyed elsewhere first. */
    denied = /* @__PURE__ */ new Set();
    enabled = false;
    observer = null;
    pending = false;
    /** Frame whose panel is showing (null: none), so the observer doesn't rebuild it in a loop. */
    panelFrame = null;
    constructor(options) {
      this.doc = options.doc;
      this.schedule = options.schedule ?? ((callback) => {
        options.doc.defaultView?.requestAnimationFrame(callback);
      });
    }
    isEnabled() {
      return this.enabled;
    }
    addKeys(update) {
      for (const frameId of update.gradedFrameIds) {
        this.denied.add(frameId);
        this.keys.delete(frameId);
      }
      for (const [frameId, key] of update.keys) {
        if (!this.denied.has(frameId)) this.keys.set(frameId, key);
      }
      this.requestApply();
    }
    setEnabled(enabled) {
      if (enabled === this.enabled) return;
      this.enabled = enabled;
      if (enabled) {
        this.start();
      } else {
        this.stop();
      }
    }
    start() {
      const view = this.doc.defaultView;
      if (view === null) return;
      this.injectStyle();
      this.observer = new view.MutationObserver(() => {
        this.requestApply();
      });
      this.observer.observe(this.doc.documentElement, { childList: true, subtree: true });
      this.requestApply();
    }
    stop() {
      this.observer?.disconnect();
      this.observer = null;
      for (const marked of this.doc.querySelectorAll(`.${MARK_CLASS}`)) {
        marked.classList.remove(MARK_CLASS);
      }
      this.doc.getElementById(PANEL_ID)?.remove();
      this.panelFrame = null;
    }
    requestApply() {
      if (!this.enabled || this.pending) return;
      this.pending = true;
      this.schedule(() => {
        this.pending = false;
        if (this.enabled) this.apply();
      });
    }
    /**
     * The slide on screen: the last `[frame-guid]` element that isn't animating out (AngularJS
     * keeps the leaving slide in the DOM under `.ng-leave` until its animation ends).
     */
    currentFrame() {
      const frames = [...this.doc.querySelectorAll("[frame-guid]")];
      const entering = frames.filter((frame) => frame.closest(".ng-leave") === null);
      return entering.at(-1) ?? frames.at(-1) ?? null;
    }
    /** Marks and panel for the slide currently on screen. Idempotent. */
    apply() {
      const frame = this.currentFrame();
      const frameId = frame?.getAttribute("frame-guid") ?? null;
      const key = frameId === null ? void 0 : this.keys.get(frameId);
      const wantedMarks = /* @__PURE__ */ new Set();
      if (frame !== null && key !== void 0) {
        for (const id of key.highlightIds) {
          if (!UUID.test(id)) continue;
          for (const el of frame.querySelectorAll(`[component-id="${id}"]`)) wantedMarks.add(el);
        }
      }
      for (const marked of this.doc.querySelectorAll(`.${MARK_CLASS}`)) {
        if (!wantedMarks.has(marked)) marked.classList.remove(MARK_CLASS);
      }
      for (const el of wantedMarks) el.classList.add(MARK_CLASS);
      const wanted = key === void 0 ? null : frameId;
      if (wanted !== this.panelFrame) {
        this.panelFrame = wanted;
        this.renderPanel(key);
      }
    }
    injectStyle() {
      if (this.doc.getElementById(STYLE_ID) !== null) return;
      const style = this.doc.createElement("style");
      style.id = STYLE_ID;
      style.textContent = CSS_TEXT;
      (this.doc.querySelector("head") ?? this.doc.documentElement).appendChild(style);
    }
    renderPanel(key) {
      this.doc.getElementById(PANEL_ID)?.remove();
      const body = this.doc.querySelector("body");
      if (key === void 0 || body === null) return;
      const panel = this.doc.createElement("div");
      panel.id = PANEL_ID;
      const title = this.doc.createElement("div");
      title.className = "title";
      title.textContent = "Answer key";
      panel.appendChild(title);
      if (key.instructions !== null) {
        const instructions = this.doc.createElement("div");
        instructions.className = "instructions";
        instructions.textContent = key.instructions;
        panel.appendChild(instructions);
      }
      const list = this.doc.createElement("ol");
      for (const challenge of key.challenges) {
        const item = this.doc.createElement("li");
        if (challenge.prompt !== null) {
          const prompt = this.doc.createElement("span");
          prompt.className = "prompt";
          prompt.textContent = `${challenge.prompt} → `;
          item.appendChild(prompt);
        }
        const answer = this.doc.createElement("span");
        answer.className = "answer";
        answer.textContent = challenge.correct.join(" / ");
        item.appendChild(answer);
        list.appendChild(item);
      }
      panel.appendChild(list);
      body.appendChild(panel);
    }
  };

  // src/intercept.ts
  var LESSON_STREAM_PATH = /^\/api\/lesson_streams\/[0-9a-f-]{36}\.json$/i;
  var LOG_TAG = "[course-capture]";
  function isLessonStreamUrl(url, base) {
    try {
      return LESSON_STREAM_PATH.test(new URL(url, base).pathname);
    } catch {
      return false;
    }
  }
  function requestsLessonContent(url, base) {
    if (!isLessonStreamUrl(url, base)) return false;
    const params = new URL(url, base).searchParams;
    return (params.get("load_full_content_for_lesson_id") ?? "") !== "" || params.get("load_full_content_for_all_lessons") === "true";
  }
  function installInterceptors(options) {
    const { win, onPayload: onPayload2, fallbackDelayMs } = options;
    const base = win.location.href;
    const delivered = /* @__PURE__ */ new Set();
    const originalFetch = win.fetch.bind(win);
    const deliver = (url, body) => {
      const absolute = new URL(url, base).href;
      delivered.add(absolute);
      try {
        onPayload2(absolute, body);
      } catch (err) {
        console.error(LOG_TAG, "handling a lesson_streams response failed", err);
      }
    };
    patchXhr(win, base, deliver);
    patchFetch(win, base, deliver);
    watchResourceTiming(win, base, fallbackDelayMs, delivered, originalFetch, deliver);
  }
  function patchXhr(win, base, deliver) {
    const proto = win.XMLHttpRequest.prototype;
    const originalOpen = proto.open;
    const hooked = /* @__PURE__ */ new WeakSet();
    function onLoad() {
      try {
        const url = this.responseURL;
        if (this.status !== 200 || !isLessonStreamUrl(url, base)) return;
        if (this.responseType === "" || this.responseType === "text") {
          deliver(url, JSON.parse(this.responseText));
        } else if (this.responseType === "json") {
          deliver(url, this.response);
        }
      } catch (err) {
        console.warn(LOG_TAG, "could not read an XHR response", err);
      }
    }
    proto.open = function patchedOpen(...args) {
      try {
        if (!hooked.has(this)) {
          hooked.add(this);
          this.addEventListener("load", onLoad);
        }
      } catch (err) {
        console.warn(LOG_TAG, "XHR hook failed", err);
      }
      Reflect.apply(originalOpen, this, args);
    };
  }
  function patchFetch(win, base, deliver) {
    const originalFetch = win.fetch;
    const readJson = async (response) => {
      try {
        deliver(response.url, await response.json());
      } catch (err) {
        console.warn(LOG_TAG, "could not read a fetch response", err);
      }
    };
    win.fetch = async function patchedFetch(input, init) {
      const response = await originalFetch.call(win, input, init);
      try {
        if (response.ok && isLessonStreamUrl(response.url, base)) void readJson(response.clone());
      } catch (err) {
        console.warn(LOG_TAG, "fetch hook failed", err);
      }
      return response;
    };
  }
  function watchResourceTiming(win, base, delayMs, delivered, fetchFn, deliver) {
    if (typeof win.PerformanceObserver !== "function") return;
    const scheduled = /* @__PURE__ */ new Set();
    const refetch = async (url) => {
      if (delivered.has(url)) return;
      try {
        const response = await fetchFn(url, {
          credentials: "include",
          headers: { accept: "application/json", "fr-client": "web" }
        });
        if (!response.ok) {
          console.warn(LOG_TAG, `re-fetch of ${url} returned HTTP ${response.status}`);
          return;
        }
        if (!delivered.has(url)) deliver(url, await response.json());
      } catch (err) {
        console.warn(LOG_TAG, "re-fetch failed", err);
      }
    };
    const observer = new win.PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const url = entry.name;
        if (scheduled.has(url) || !requestsLessonContent(url, base)) continue;
        scheduled.add(url);
        win.setTimeout(() => void refetch(url), delayMs);
      }
    });
    try {
      observer.observe({ type: "resource", buffered: true });
    } catch (err) {
      console.warn(LOG_TAG, "Resource Timing observer unavailable", err);
    }
  }

  // src/queue.ts
  var ITEM_PREFIX = "item:";
  var BODY_PREFIX = "body:";
  var DONE_PREFIX = "done:";
  var AUTH_FAILED_KEY = "authFailed";
  var NO_CONFIG = "No sync server configured";
  var AUTH_REJECTED = "The sync server rejected the username or password";
  var BASE_BACKOFF_MS = 3e4;
  var MAX_BACKOFF_MS = 30 * 6e4;
  function backoffMs(attempts) {
    return Math.min(BASE_BACKOFF_MS * 2 ** Math.max(0, attempts - 1), MAX_BACKOFF_MS);
  }
  var HttpStatusError = class extends Error {
    status;
    constructor(method, status) {
      super(`${method} returned HTTP ${status}`);
      this.status = status;
    }
  };
  function isQueueItem(value) {
    if (typeof value !== "object" || value === null) return false;
    const v = value;
    return typeof v.path === "string" && typeof v.key === "string" && typeof v.label === "string" && typeof v.attempts === "number" && typeof v.nextAttemptAt === "number" && (v.lastError === null || typeof v.lastError === "string");
  }
  var UploadQueue = class {
    store;
    client;
    events;
    now;
    flushing = null;
    constructor(options) {
      this.store = options.store;
      this.client = options.client;
      this.events = options.events;
      this.now = options.now ?? Date.now;
    }
    /** Queued items, oldest due first. */
    pending() {
      const items = [];
      for (const name of this.store.keys()) {
        if (!name.startsWith(ITEM_PREFIX)) continue;
        const item = this.store.get(name);
        if (isQueueItem(item)) items.push(item);
      }
      return items.sort((a, b) => a.nextAttemptAt - b.nextAttemptAt);
    }
    isCaptured(key) {
      return this.store.get(DONE_PREFIX + key) !== void 0;
    }
    capturedCount() {
      return this.store.keys().filter((name) => name.startsWith(DONE_PREFIX)).length;
    }
    /** Forgets which files were uploaded. The server-side HEAD still prevents re-uploads. */
    forgetCaptured() {
      for (const name of this.store.keys()) {
        if (name.startsWith(DONE_PREFIX)) this.store.delete(name);
      }
    }
    /** Set after a 401; no request is made until the credentials change. */
    authBlocked() {
      return this.store.get(AUTH_FAILED_KEY) !== void 0;
    }
    /** Call after saving new credentials. */
    clearAuthFailure() {
      this.store.delete(AUTH_FAILED_KEY);
    }
    /** Queues files not yet captured or queued. Returns how many were added. */
    enqueue(files) {
      let added = 0;
      for (const file of files) {
        if (this.isCaptured(file.key) || this.store.get(ITEM_PREFIX + file.key) !== void 0) {
          continue;
        }
        this.store.set(BODY_PREFIX + file.key, file.body);
        this.save({
          path: file.path,
          key: file.key,
          label: file.label,
          attempts: 0,
          nextAttemptAt: 0,
          lastError: null
        });
        added++;
      }
      return added;
    }
    /** Milliseconds until the next item is due, or null when nothing is queued. */
    nextDueIn() {
      const soonest = this.pending()[0];
      return soonest === void 0 ? null : Math.max(0, soonest.nextAttemptAt - this.now());
    }
    /** Makes every queued item due now (after new credentials, or "retry now"). */
    retryAllNow() {
      for (const item of this.pending()) this.save({ ...item, nextAttemptAt: 0 });
    }
    /** Uploads every due item, one at a time. Concurrent calls share one run. */
    async flush() {
      if (this.flushing !== null) return this.flushing;
      this.flushing = this.runFlush();
      try {
        await this.flushing;
      } finally {
        this.flushing = null;
      }
    }
    async runFlush() {
      for (; ; ) {
        const due = this.pending().find((item) => item.nextAttemptAt <= this.now());
        if (due === void 0) return;
        if (this.authBlocked()) {
          this.events.needsConfig(AUTH_REJECTED);
          return;
        }
        const client = this.client();
        if (client === null) {
          this.events.needsConfig(NO_CONFIG);
          return;
        }
        const stop = await this.upload(client, due);
        if (stop) return;
      }
    }
    /** Uploads one item. Returns true when the flush must stop (credentials rejected). */
    async upload(client, item) {
      const body = this.store.get(BODY_PREFIX + item.key);
      if (typeof body !== "string") {
        this.remove(item.key);
        this.events.dropped(item, "stored body is missing");
        return false;
      }
      try {
        const headStatus = await client.head(item.path);
        if (headStatus === 200) {
          this.complete(item);
          this.events.alreadyOnServer(item);
          return false;
        }
        if (headStatus !== 404) throw new HttpStatusError("HEAD", headStatus);
        const putStatus = await client.put(item.path, body);
        if (putStatus !== 201 && putStatus !== 204) throw new HttpStatusError("PUT", putStatus);
        this.complete(item);
        this.events.uploaded(item);
        return false;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        const attempts = item.attempts + 1;
        const updated = {
          ...item,
          attempts,
          nextAttemptAt: this.now() + backoffMs(attempts),
          lastError: message
        };
        this.save(updated);
        if (err instanceof HttpStatusError && err.status === 401) {
          this.store.set(AUTH_FAILED_KEY, message);
          this.events.needsConfig(AUTH_REJECTED);
          return true;
        }
        this.events.failed(updated, message);
        return false;
      }
    }
    save(item) {
      this.store.set(ITEM_PREFIX + item.key, item);
    }
    complete(item) {
      this.store.set(DONE_PREFIX + item.key, item.path);
      this.remove(item.key);
    }
    remove(key) {
      this.store.delete(ITEM_PREFIX + key);
      this.store.delete(BODY_PREFIX + key);
    }
  };

  // src/toast.ts
  var TOAST_ID = "course-capture-toast";
  var VISIBLE_MS = 4e3;
  var ERROR_VISIBLE_MS = 8e3;
  var hideTimer;
  var BACKGROUNDS = {
    info: "rgba(0, 0, 0, 0.85)",
    success: "rgba(22, 101, 52, 0.92)",
    error: "rgba(153, 27, 27, 0.92)"
  };
  function element(body) {
    const existing = document.getElementById(TOAST_ID);
    if (existing instanceof HTMLDivElement) return existing;
    const toast = document.createElement("div");
    toast.id = TOAST_ID;
    toast.setAttribute("role", "status");
    Object.assign(toast.style, {
      position: "fixed",
      top: "15px",
      right: "15px",
      zIndex: "999999",
      maxWidth: "360px",
      color: "#ffffff",
      padding: "8px 14px",
      borderRadius: "8px",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: "14px",
      lineHeight: "1.35",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
      pointerEvents: "none",
      transition: "opacity 0.4s ease, transform 0.4s ease",
      opacity: "0",
      transform: "translateY(-10px)"
    });
    body.appendChild(toast);
    return toast;
  }
  function showToast(message, kind = "info") {
    const body = document.querySelector("body");
    if (body === null) {
      document.addEventListener(
        "DOMContentLoaded",
        () => {
          showToast(message, kind);
        },
        { once: true }
      );
      return;
    }
    const toast = element(body);
    toast.textContent = message;
    toast.style.backgroundColor = BACKGROUNDS[kind];
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
    window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(
      () => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(-10px)";
      },
      kind === "error" ? ERROR_VISIBLE_MS : VISIBLE_MS
    );
  }

  // src/webdav.ts
  var REQUEST_TIMEOUT_MS = 6e4;
  function isSyncConfig(value) {
    if (typeof value !== "object" || value === null) return false;
    const v = value;
    return typeof v.baseUrl === "string" && typeof v.username === "string" && typeof v.password === "string";
  }
  function normalizeBaseUrl(input) {
    let url;
    try {
      url = new URL(input.trim());
    } catch {
      return null;
    }
    if (url.protocol !== "https:") return null;
    url.search = "";
    url.hash = "";
    return url.href.endsWith("/") ? url.href : `${url.href}/`;
  }
  function resolvePath(baseUrl, path) {
    const encoded = path.split("/").filter((segment) => segment.length > 0).map(encodeURIComponent).join("/");
    return baseUrl + encoded;
  }
  function basicAuth(username, password) {
    const bytes = new TextEncoder().encode(`${username}:${password}`);
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return `Basic ${btoa(binary)}`;
  }
  function request(method, url, authorization, body) {
    return new Promise((resolve, reject) => {
      const headers = { Authorization: authorization };
      if (body !== void 0) headers["Content-Type"] = "application/json; charset=utf-8";
      GM_xmlhttpRequest({
        method,
        url,
        headers,
        ...body === void 0 ? {} : { data: body },
        timeout: REQUEST_TIMEOUT_MS,
        nocache: true,
        anonymous: true,
        onload: (response) => {
          resolve(response.status);
        },
        onerror: (response) => {
          reject(new Error(`${method} failed: ${response.error || "network error"}`));
        },
        ontimeout: () => {
          reject(new Error(`${method} timed out after ${REQUEST_TIMEOUT_MS / 1e3} s`));
        }
      });
    });
  }
  function createGmDavClient(config) {
    const authorization = basicAuth(config.username, config.password);
    return {
      head: (path) => request("HEAD", resolvePath(config.baseUrl, path), authorization),
      put: (path, body) => request("PUT", resolvePath(config.baseUrl, path), authorization, body)
    };
  }

  // src/main.ts
  var CONFIG_KEY = "config";
  var HIGHLIGHT_KEY = "highlightAnswers";
  var FALLBACK_DELAY_MS = 5e3;
  var LOG_TAG2 = "[course-capture]";
  var store = {
    get: (key) => GM_getValue(key),
    set: (key, value) => {
      GM_setValue(key, value);
    },
    delete: (key) => {
      GM_deleteValue(key);
    },
    keys: () => GM_listValues()
  };
  function loadConfig() {
    const raw = store.get(CONFIG_KEY);
    return isSyncConfig(raw) ? raw : null;
  }
  function promptForConfig() {
    const current = loadConfig();
    const urlInput = window.prompt(
      "Course capture: WebDAV sync server URL (https://…/)",
      current?.baseUrl ?? "https://"
    );
    if (urlInput === null) return null;
    const baseUrl = normalizeBaseUrl(urlInput);
    if (baseUrl === null) {
      window.alert("Course capture: the URL must start with https://");
      return null;
    }
    const username = window.prompt("Course capture: WebDAV username", current?.username ?? "");
    if (username === null) return null;
    const password = window.prompt("Course capture: WebDAV password", "");
    if (password === null) return null;
    const config = { baseUrl, username: username.trim(), password };
    store.set(CONFIG_KEY, config);
    queue.clearAuthFailure();
    queue.retryAllNow();
    return config;
  }
  var promptedThisPage = false;
  var flushTimer;
  var queue = new UploadQueue({
    store,
    client: () => {
      const config = loadConfig();
      return config === null ? null : createGmDavClient(config);
    },
    events: {
      uploaded: (item) => {
        console.info(LOG_TAG2, `uploaded ${item.path}`);
        showToast(`Captured: ${item.label}`, "success");
      },
      alreadyOnServer: (item) => {
        console.info(LOG_TAG2, `already on the server: ${item.path}`);
      },
      failed: (item, error) => {
        console.warn(LOG_TAG2, `upload of ${item.path} failed (attempt ${item.attempts}): ${error}`);
        showToast(`Capture upload failed, will retry: ${item.label}`, "error");
      },
      dropped: (item, reason) => {
        console.warn(LOG_TAG2, `dropped ${item.path}: ${reason}`);
      },
      needsConfig: (reason) => {
        console.warn(LOG_TAG2, reason);
        if (!promptedThisPage) {
          promptedThisPage = true;
          if (promptForConfig() !== null) {
            scheduleFlush(0);
            return;
          }
        }
        const waiting = queue.pending().length;
        showToast(
          `Course capture: ${reason}. ${waiting} file(s) waiting. Tampermonkey menu → Configure sync server.`,
          "error"
        );
      }
    }
  });
  function scheduleFlush(delayMs) {
    window.clearTimeout(flushTimer);
    flushTimer = window.setTimeout(() => void runFlush(), delayMs);
  }
  async function runFlush() {
    try {
      await queue.flush();
    } catch (err) {
      console.error(LOG_TAG2, "flush failed", err);
    }
    const next = queue.nextDueIn();
    if (next !== null && loadConfig() !== null && !queue.authBlocked()) scheduleFlush(next);
  }
  var highlighter = new AnswerHighlighter({ doc: document });
  function onPayload(url, body) {
    try {
      highlighter.addKeys(buildAnswerKey(body));
    } catch (err) {
      console.warn(LOG_TAG2, "building the answer key failed", err);
    }
    const plan = planCapture(body, {
      sourceUrl: url,
      capturedAt: (/* @__PURE__ */ new Date()).toISOString(),
      scriptVersion: GM_info.script.version
    });
    for (const title of plan.oversized) {
      showToast(`Course capture: "${title}" is too large to upload`, "error");
    }
    const added = queue.enqueue(plan.files);
    if (added > 0) {
      console.info(LOG_TAG2, `queued ${added} file(s) from ${url}`);
      scheduleFlush(0);
    }
  }
  function highlightWanted() {
    return store.get(HIGHLIGHT_KEY) === true;
  }
  function applyHighlightSetting() {
    try {
      highlighter.setEnabled(highlightWanted());
    } catch (err) {
      console.error(LOG_TAG2, "answer highlighting failed to start", err);
    }
  }
  function highlightLabel() {
    return `Highlight answers: ${highlightWanted() ? "ON" : "off"} (ungraded lessons)`;
  }
  function registerHighlightToggle() {
    const toggle = () => {
      store.set(HIGHLIGHT_KEY, !highlightWanted());
      applyHighlightSetting();
      GM_registerMenuCommand(highlightLabel(), toggle, { id: menuId });
      showToast(`Answer highlighting ${highlightWanted() ? "on" : "off"}`);
    };
    const menuId = GM_registerMenuCommand(highlightLabel(), toggle);
  }
  function registerMenu() {
    GM_registerMenuCommand("Configure sync server", () => {
      if (promptForConfig() !== null) {
        showToast("Course capture: sync server saved");
        scheduleFlush(0);
      }
    });
    GM_registerMenuCommand("Show capture status", () => {
      const pending = queue.pending();
      const lines = [
        `Server: ${loadConfig()?.baseUrl ?? "not configured"}`,
        ...queue.authBlocked() ? ["Uploads paused: the server rejected the credentials"] : [],
        `Captured (this browser): ${queue.capturedCount()}`,
        `Waiting to upload: ${pending.length}`,
        ...pending.map(
          (item) => `  • ${item.path} (attempts ${item.attempts}${item.lastError === null ? "" : `, ${item.lastError}`})`
        )
      ];
      window.alert(lines.join("\n"));
    });
    GM_registerMenuCommand("Retry uploads now", () => {
      queue.clearAuthFailure();
      queue.retryAllNow();
      scheduleFlush(0);
    });
    GM_registerMenuCommand("Forget local capture cache", () => {
      queue.forgetCaptured();
      showToast("Course capture: local cache cleared (the server still dedupes)");
    });
  }
  installInterceptors({ win: unsafeWindow, onPayload, fallbackDelayMs: FALLBACK_DELAY_MS });
  registerHighlightToggle();
  registerMenu();
  applyHighlightSetting();
  if (queue.pending().length > 0) scheduleFlush(FALLBACK_DELAY_MS);
})();
