// Sees the lesson_streams JSON the app loads, two ways:
//
// 1. Wraps the page's XMLHttpRequest and fetch (AngularJS's $http uses XHR) so the response
//    is read as it arrives, with no extra request. This needs the script to run before the
//    app's first request, which Tampermonkey on Chrome only guarantees in "UserScripts API
//    Dynamic" mode.
// 2. Watches Resource Timing entries (`buffered: true` includes requests made before the
//    script ran). If a full-content request shows up and (1) hasn't delivered it within a few
//    seconds, the same URL is fetched again with the page's cookies.
//
// Both feed one callback; the upload queue dedupes by lesson id, so a double delivery is
// harmless. Every hook is wrapped so a failure here can never break the page's own request.

const LESSON_STREAM_PATH = /^\/api\/lesson_streams\/[0-9a-f-]{36}\.json$/i;
const LOG_TAG = "[course-capture]";

/** A lesson_streams API URL (any query). */
export function isLessonStreamUrl(url: string, base: string): boolean {
  try {
    return LESSON_STREAM_PATH.test(new URL(url, base).pathname);
  } catch {
    return false;
  }
}

/** A lesson_streams URL that asks for lesson content (so it's worth re-fetching). */
export function requestsLessonContent(url: string, base: string): boolean {
  if (!isLessonStreamUrl(url, base)) return false;
  const params = new URL(url, base).searchParams;
  return (
    (params.get("load_full_content_for_lesson_id") ?? "") !== "" ||
    params.get("load_full_content_for_all_lessons") === "true"
  );
}

/** The parts of the page's window (`unsafeWindow`) the hooks touch. */
export type PageWindow = Pick<
  Window & typeof globalThis,
  "fetch" | "XMLHttpRequest" | "PerformanceObserver" | "location" | "setTimeout"
>;

export interface InterceptOptions {
  win: PageWindow;
  onPayload: (url: string, body: unknown) => void;
  /** How long to wait for the hooks before re-fetching a request they missed. */
  fallbackDelayMs: number;
}

type XhrOpenArgs = [
  method: string,
  url: string | URL,
  async?: boolean,
  username?: string | null,
  password?: string | null,
];

export function installInterceptors(options: InterceptOptions): void {
  const { win, onPayload, fallbackDelayMs } = options;
  const base = win.location.href;
  const delivered = new Set<string>();
  // Kept before patching so the fallback's own request doesn't come back through the hook.
  const originalFetch = win.fetch.bind(win);

  const deliver = (url: string, body: unknown): void => {
    const absolute = new URL(url, base).href;
    delivered.add(absolute);
    try {
      onPayload(absolute, body);
    } catch (err: unknown) {
      console.error(LOG_TAG, "handling a lesson_streams response failed", err);
    }
  };

  patchXhr(win, base, deliver);
  patchFetch(win, base, deliver);
  watchResourceTiming(win, base, fallbackDelayMs, delivered, originalFetch, deliver);
}

function patchXhr(
  win: PageWindow,
  base: string,
  deliver: (url: string, body: unknown) => void,
): void {
  const proto = win.XMLHttpRequest.prototype;
  // Re-applied with the right `this` through Reflect.apply below.
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const originalOpen = proto.open;
  const hooked = new WeakSet<XMLHttpRequest>();

  function onLoad(this: XMLHttpRequest): void {
    try {
      const url = this.responseURL;
      if (this.status !== 200 || !isLessonStreamUrl(url, base)) return;
      if (this.responseType === "" || this.responseType === "text") {
        deliver(url, JSON.parse(this.responseText) as unknown);
      } else if (this.responseType === "json") {
        deliver(url, this.response as unknown);
      }
    } catch (err: unknown) {
      console.warn(LOG_TAG, "could not read an XHR response", err);
    }
  }

  proto.open = function patchedOpen(this: XMLHttpRequest, ...args: XhrOpenArgs): void {
    try {
      if (!hooked.has(this)) {
        hooked.add(this);
        this.addEventListener("load", onLoad);
      }
    } catch (err: unknown) {
      console.warn(LOG_TAG, "XHR hook failed", err);
    }
    Reflect.apply(originalOpen, this, args);
  };
}

function patchFetch(
  win: PageWindow,
  base: string,
  deliver: (url: string, body: unknown) => void,
): void {
  const originalFetch = win.fetch;

  const readJson = async (response: Response): Promise<void> => {
    try {
      deliver(response.url, await response.json());
    } catch (err: unknown) {
      console.warn(LOG_TAG, "could not read a fetch response", err);
    }
  };

  win.fetch = async function patchedFetch(
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    const response = await originalFetch.call(win, input, init);
    try {
      if (response.ok && isLessonStreamUrl(response.url, base)) void readJson(response.clone());
    } catch (err: unknown) {
      console.warn(LOG_TAG, "fetch hook failed", err);
    }
    return response;
  };
}

function watchResourceTiming(
  win: PageWindow,
  base: string,
  delayMs: number,
  delivered: ReadonlySet<string>,
  fetchFn: typeof fetch,
  deliver: (url: string, body: unknown) => void,
): void {
  if (typeof win.PerformanceObserver !== "function") return;
  const scheduled = new Set<string>();

  const refetch = async (url: string): Promise<void> => {
    if (delivered.has(url)) return;
    try {
      const response = await fetchFn(url, {
        credentials: "include",
        headers: { accept: "application/json", "fr-client": "web" },
      });
      if (!response.ok) {
        console.warn(LOG_TAG, `re-fetch of ${url} returned HTTP ${response.status}`);
        return;
      }
      if (!delivered.has(url)) deliver(url, await response.json());
    } catch (err: unknown) {
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
  } catch (err: unknown) {
    console.warn(LOG_TAG, "Resource Timing observer unavailable", err);
  }
}
