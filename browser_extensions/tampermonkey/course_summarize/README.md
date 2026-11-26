# Quantic course capture

A Tampermonkey userscript that records the lesson content of every Quantic lesson you open and
uploads it to the WebDAV [sync server](../../sync_server/), which commits it to the private
`sync_files` repo. Later steps (not built yet) turn the captures into an LLM-ready corpus and a
course summary.

```text
app.quantic.edu ──lesson_streams JSON──▶ userscript ──WebDAV PUT──▶ sync_server ──▶ sync_files (private)
                                                                                     │
                                                       Python (later) ◀── git pull ──┘
                                                         └─▶ courses/<course>/summary.md (this repo)
```

## What gets captured

Opening a lesson makes the app call
`GET /api/lesson_streams/<course_id>.json?…&load_full_content_for_lesson_id=<lesson_id>`. The
response holds the whole course outline plus the full `frames` of the lesson you opened. The
script saves both, verbatim, with a `capture` block saying where they came from:

```text
sync_files/courses/python_1_fundamentals/
├── course.json                          outline: lessons, key terms, objectives, resources (no frames)
└── lessons/
    ├── 01-01_welcome_to_python.json     { capture: {...}, lesson: <API lesson object> }
    └── 01-02_putting_the_python_pieces_together.json
```

- Course folder: snake_case course title, Roman numerals as digits.
- Lesson file: `<chapter>-<lesson within chapter>_<title>.json`. A lesson that isn't in any
  chapter is numbered `00-<n>` by its place in the course's lesson list.
- Each file is uploaded once. A local cache answers repeat visits with no request at all, and a
  `HEAD` before every `PUT` skips files the other machine already uploaded. Quantic content
  doesn't change, so there is no update path.
- Files over the server's 5 MB limit are saved compact, then without `author_comments`, and as a
  last resort skipped with an error toast. Lesson 1 of Python I is about 1 MB.
- Uploads wait in Tampermonkey storage until the server confirms them, so a closed tab or a
  server error loses nothing. Failures retry with backoff (30 s doubling to 30 min). A 401
  pauses all uploads until new credentials are saved, because the server locks an IP out after
  ten failed logins.

Each frame's `tutor_bot_description` is Quantic's own flattened version of the slide: the
instructions, the main text with popovers inlined, and every answer with `is_correct` and its
feedback message. The raw `components` hold the image URLs.

## Setup (once per machine)

1. Tampermonkey on Chrome needs **Allow User Scripts** turned on for Tampermonkey in
   `chrome://extensions` → Tampermonkey → Details, or scripts don't run at all.
2. Recommended: Tampermonkey Dashboard → Settings → Config mode **Advanced** → Content Script
   API → **UserScripts API Dynamic**. Only this mode guarantees `@run-at document-start` on
   Chrome. Without it the script may load after the app's request; the fallback then fetches
   the same URL a second time (see below), so capture still works with one extra request.
3. Install from the raw URL:
   `https://raw.githubusercontent.com/NeilTheSeal/quantic_ai_monorepo/refs/heads/main/browser_extensions/tampermonkey/course_summarize/dist/course_summarize.user.js`
4. Open any lesson. The script prompts for the sync server URL (`https://<app>.herokuapp.com/`),
   username and password, and stores them in Tampermonkey storage, never in the source (this
   repo is public). To change them later: Tampermonkey menu → **Configure sync server**.

The `@connect herokuapp.com` header allows the server's Heroku host. If the server moves to a
custom domain, add a `@connect` line for it in `build.mjs`.

A green toast top-right ("Captured: 1.3 Scripts and Variables") confirms each upload. The
Tampermonkey menu also has **Show capture status**, **Retry uploads now** and **Forget local
capture cache**. The server still dedupes after the cache is cleared.

## Answer highlighting

For skimming lessons you already know: Tampermonkey menu → **Highlight answers**. It's off by
default, and the setting is remembered per browser. When it's on:

- Correct answer buttons on the current slide get a green outline.
- A panel at the bottom right lists every correct answer for the slide, with the card or
  matching prompt where there is one. Typed-answer blanks appear only in the panel.
- On slides where several cards or blanks share one set of answers ("this or that", matching,
  multi-blank), the correct button depends on which card is active, so only the panel shows
  them.

The answers come from the same lesson_streams response as the capture (`is_correct` and
`correct_answer_text` in `tutor_bot_description`). Graded content gets no key at all:
highlighting needs `assessment: false` and `test: false` on the lesson and `exam: false` on the
course, and a missing flag counts as graded. Lessons or courses whose title says SmartCase, exam or
assessment are skipped as well, in case a graded lesson is ever flagged wrong. See
[src/answers.ts](src/answers.ts) and [src/highlight.ts](src/highlight.ts).

## How it works

- [src/intercept.ts](src/intercept.ts) wraps the page's `XMLHttpRequest` and `fetch`
  (`@sandbox JavaScript` runs the script in the page's context on Chrome) and reads
  lesson_streams responses as they arrive. A `PerformanceObserver` with `buffered: true` also
  sees requests made before the script loaded. If one asked for lesson content and the hooks
  didn't deliver it within 5 s, it is fetched again with the page's cookies.
- [src/capture.ts](src/capture.ts) checks the response shape and plans the files. It stores
  everything verbatim and converts nothing, so the Python converter can improve without
  recapturing.
- [src/queue.ts](src/queue.ts) is the persistent upload queue, and
  [src/webdav.ts](src/webdav.ts) is `HEAD`/`PUT` over `GM_xmlhttpRequest`. That request runs in
  the extension, so the server's CORS rules and Quantic's CSP don't apply.

## Development

```bash
npm install
npm run build          # → dist/course_summarize.user.js (version unchanged)
npm run release        # bump the patch version, then build: do this before committing dist/
npm run dev            # rebuild on change
npm test               # node:test; tests/capture.test.ts also runs against the saved API sample if present
npm run lint-check && npm run type-check && npm run format-check
```

Tampermonkey only installs an update when `@version` goes up, so commit `dist/` from
`npm run release`, not `npm run build`.

## Course summaries (Python)

[summarize.py](summarize.py) turns finished courses into study guides. Run it with no arguments
after finishing a course:

```bash
python3.15 -m venv .venv && .venv/bin/python -m pip install -r requirements.txt   # once
cp .env.example .env                                                            # then fill in
.venv/bin/python summarize.py
```

From anywhere in the repo, `scripts/summarize-courses` does the same.

For every course folder on the sync server, it:

1. Skips the course if `courses/<course>/summary.md` already exists in this repo. If the sync
   server has a copy in `working/summary.md` (the course was summarized on the other
   machine), it restores that copy instead of paying for a new one.
2. Skips the course if any released lesson in its outline hasn't been captured yet, so a
   course in progress is never summarized early.
3. Describes every image actually shown in the ungraded lessons with Claude Haiku 5.5, which
   transcribes code screenshots verbatim. About four in five image components in a lesson are
   leftovers that never render; they're skipped. Descriptions are cached in
   `working/image_captions.json`, so a re-run doesn't pay twice.
4. Builds `working/corpus.md`: each ungraded lesson slide by slide, with its instructions,
   text, image descriptions, practice questions (✓/✗ with Quantic's feedback), objectives and
   key terms. It leaves out graded lessons (SmartCases, exams), `author_comments`, and the
   auto-generated `key_term_definitions`, which are often wrong.
5. Sends the corpus and Quantic's course PDFs to Claude Opus 5.5 (adaptive thinking, high
   effort, streamed, with web search to confirm further-reading links). It writes
   `courses/<course>/summary.md` here, plus `working/summary.md` and `working/summary_meta.json`
   (token usage and estimated cost) on the sync server.

The guide keeps Quantic's own definitions and framing in the body. Anything the model adds from
outside the course goes in `> **Beyond the course:**` blockquotes. Refusal fallbacks are on
(`fallbacks: "default"`), so a declined request is retried on another model. A course costs
roughly $2-3 in API usage, mostly the Opus call. The printed estimate and `summary_meta.json`
give the actual figure.

Python code lives in [summarizer/](summarizer/) (`pipeline.py` orchestrates; `corpus.py`,
`captions.py`, `summary.py`, `webdav.py`), tests in `tests/summarizer/`:

```bash
.venv/bin/python -m ruff format --check . && .venv/bin/python -m ruff check . \
  && .venv/bin/python -m mypy . && .venv/bin/python -m pytest -q
```

## Future work

- **Whole course in one request.** The same endpoint accepts
  `load_full_content_for_all_lessons=true`, which returns every lesson's frames at once. That
  would capture a course from a single lesson visit and allow summaries without finishing every
  lesson. The capture code already saves every lesson in a response that has frames; what's
  missing is a trigger that makes the request. The response is roughly 10× bigger, so keep the
  per-lesson files.
- **Archive assets.** Images and PDFs are only read from Quantic's CDN at summary time. To keep
  them after graduation, download them into each course folder in `sync_files` (skip videos).
- SmartCases (the graded end-of-course quizzes) use the same lesson format and are captured
  like any other lesson, but they never reach a summary.
