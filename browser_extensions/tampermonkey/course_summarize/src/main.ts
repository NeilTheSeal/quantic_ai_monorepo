// Entry point: wires the interceptors to the upload queue and registers the menu commands.
// GM_* globals are used only here and in webdav.ts so the other modules run under node:test.

import { buildAnswerKey } from "./answers.ts";
import { planCapture } from "./capture.ts";
import { AnswerHighlighter } from "./highlight.ts";
import { installInterceptors } from "./intercept.ts";
import { type KeyValueStore, type QueueItem, UploadQueue } from "./queue.ts";
import { showToast } from "./toast.ts";
import { type SyncConfig, createGmDavClient, isSyncConfig, normalizeBaseUrl } from "./webdav.ts";

const CONFIG_KEY = "config";
/** Boolean: highlight correct answers in ungraded lessons. Off unless toggled on. */
const HIGHLIGHT_KEY = "highlightAnswers";
const FALLBACK_DELAY_MS = 5000;
const LOG_TAG = "[course-capture]";

const store: KeyValueStore = {
  get: (key) => GM_getValue<unknown>(key),
  set: (key, value) => {
    GM_setValue(key, value as Tampermonkey.StorageValue);
  },
  delete: (key) => {
    GM_deleteValue(key);
  },
  keys: () => GM_listValues(),
};

function loadConfig(): SyncConfig | null {
  const raw = store.get(CONFIG_KEY);
  return isSyncConfig(raw) ? raw : null;
}

/** Asks for the server details with prompt(). Returns null if any prompt is cancelled. */
function promptForConfig(): SyncConfig | null {
  const current = loadConfig();
  const urlInput = window.prompt(
    "Course capture: WebDAV sync server URL (https://…/)",
    current?.baseUrl ?? "https://",
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
  // New credentials: lift the 401 block and give every waiting file a fresh try.
  queue.clearAuthFailure();
  queue.retryAllNow();
  return config;
}

let promptedThisPage = false;
let flushTimer: number | undefined;

const queue = new UploadQueue({
  store,
  client: () => {
    const config = loadConfig();
    return config === null ? null : createGmDavClient(config);
  },
  events: {
    uploaded: (item: QueueItem) => {
      console.info(LOG_TAG, `uploaded ${item.path}`);
      showToast(`Captured: ${item.label}`, "success");
    },
    alreadyOnServer: (item: QueueItem) => {
      console.info(LOG_TAG, `already on the server: ${item.path}`);
    },
    failed: (item: QueueItem, error: string) => {
      console.warn(LOG_TAG, `upload of ${item.path} failed (attempt ${item.attempts}): ${error}`);
      showToast(`Capture upload failed, will retry: ${item.label}`, "error");
    },
    dropped: (item: QueueItem, reason: string) => {
      console.warn(LOG_TAG, `dropped ${item.path}: ${reason}`);
    },
    needsConfig: (reason: string) => {
      console.warn(LOG_TAG, reason);
      // One automatic prompt per page load; after that, the menu command.
      if (!promptedThisPage) {
        promptedThisPage = true;
        if (promptForConfig() !== null) {
          scheduleFlush(0);
          return;
        }
      }
      const waiting = queue.pending().length;
      showToast(
        `Course capture: ${reason}. ${waiting} file(s) waiting. ` +
          "Tampermonkey menu → Configure sync server.",
        "error",
      );
    },
  },
});

function scheduleFlush(delayMs: number): void {
  window.clearTimeout(flushTimer);
  flushTimer = window.setTimeout(() => void runFlush(), delayMs);
}

async function runFlush(): Promise<void> {
  try {
    await queue.flush();
  } catch (err: unknown) {
    console.error(LOG_TAG, "flush failed", err);
  }
  // No timer while unconfigured or after a 401 (every retry would be another failed login, and
  // the server locks the IP out after ten); saving a config triggers the next flush.
  const next = queue.nextDueIn();
  if (next !== null && loadConfig() !== null && !queue.authBlocked()) scheduleFlush(next);
}

const highlighter = new AnswerHighlighter({ doc: document });

function onPayload(url: string, body: unknown): void {
  // Built even while highlighting is off, so toggling it on mid-lesson works.
  try {
    highlighter.addKeys(buildAnswerKey(body));
  } catch (err: unknown) {
    console.warn(LOG_TAG, "building the answer key failed", err);
  }
  const plan = planCapture(body, {
    sourceUrl: url,
    capturedAt: new Date().toISOString(),
    scriptVersion: GM_info.script.version,
  });
  for (const title of plan.oversized) {
    showToast(`Course capture: "${title}" is too large to upload`, "error");
  }
  const added = queue.enqueue(plan.files);
  if (added > 0) {
    console.info(LOG_TAG, `queued ${added} file(s) from ${url}`);
    scheduleFlush(0);
  }
}

function highlightWanted(): boolean {
  return store.get(HIGHLIGHT_KEY) === true;
}

/** Applies the stored setting. Never throws: a failure here must not take the menus with it. */
function applyHighlightSetting(): void {
  try {
    highlighter.setEnabled(highlightWanted());
  } catch (err: unknown) {
    console.error(LOG_TAG, "answer highlighting failed to start", err);
  }
}

function highlightLabel(): string {
  return `Highlight answers: ${highlightWanted() ? "ON" : "off"} (ungraded lessons)`;
}

function registerHighlightToggle(): void {
  const toggle = (): void => {
    store.set(HIGHLIGHT_KEY, !highlightWanted());
    applyHighlightSetting();
    // Same id: updates the label in place (and keeps this handler).
    GM_registerMenuCommand(highlightLabel(), toggle, { id: menuId });
    showToast(`Answer highlighting ${highlightWanted() ? "on" : "off"}`);
  };
  const menuId = GM_registerMenuCommand(highlightLabel(), toggle);
}

function registerMenu(): void {
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
      ...(queue.authBlocked() ? ["Uploads paused: the server rejected the credentials"] : []),
      `Captured (this browser): ${queue.capturedCount()}`,
      `Waiting to upload: ${pending.length}`,
      ...pending.map(
        (item) =>
          `  • ${item.path} (attempts ${item.attempts}${item.lastError === null ? "" : `, ${item.lastError}`})`,
      ),
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
// Menus first, so the toggle to turn highlighting off exists even if starting it fails.
registerHighlightToggle();
registerMenu();
applyHighlightSetting();
// Uploads left over from an earlier page (closed tab, server down).
if (queue.pending().length > 0) scheduleFlush(FALLBACK_DELAY_MS);
