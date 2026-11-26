import assert from "node:assert/strict";
import { test } from "node:test";
import { type PageWindow, installInterceptors } from "../src/intercept.ts";

const ORIGIN = "https://app.quantic.edu";
const STREAM_URL = `${ORIGIN}/api/lesson_streams/b3ebdcba-6b6d-406a-a238-88c6832656ba.json?load_full_content_for_lesson_id=abc`;
const PAYLOAD = { contents: { lesson_streams: [] } };

/** Minimal XHR double: open() then fire() runs the registered load listeners. */
class FakeXhr {
  responseURL = "";
  status = 0;
  responseType = "";
  responseText = "";
  response: unknown = null;
  opened: unknown[] = [];
  private listeners: (() => void)[] = [];
  open(...args: unknown[]): void {
    this.opened = args;
  }
  addEventListener(_type: string, listener: () => void): void {
    this.listeners.push(listener);
  }
  fire(url: string, status: number, text: string): void {
    this.responseURL = url;
    this.status = status;
    this.responseText = text;
    for (const listener of this.listeners) listener.call(this);
  }
}

interface Harness {
  win: PageWindow;
  fetchCalls: string[];
  observe: (url: string) => void;
  runTimers: () => Promise<void>;
}

function harness(fetchImpl: (url: string) => Response): Harness {
  const fetchCalls: string[] = [];
  const timers: (() => void)[] = [];
  let observerCallback: ((list: { getEntries: () => { name: string }[] }) => void) | null = null;

  class FakeObserver {
    constructor(callback: typeof observerCallback) {
      observerCallback = callback;
    }
    observe(): void {
      // Entries are pushed by the harness's observe() helper instead.
    }
  }

  // A fresh subclass per harness: installInterceptors patches the prototype, and a shared one
  // would stack every earlier test's hooks onto later tests' requests.
  class Xhr extends FakeXhr {}

  const win = {
    location: { href: `${ORIGIN}/course/x/show` },
    XMLHttpRequest: Xhr,
    PerformanceObserver: FakeObserver,
    fetch: async (input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      fetchCalls.push(url);
      return fetchImpl(url);
    },
    setTimeout: (fn: () => void) => {
      timers.push(fn);
      return 0;
    },
  } as unknown as PageWindow;

  return {
    win,
    fetchCalls,
    observe: (url) => observerCallback?.({ getEntries: () => [{ name: url }] }),
    runTimers: async () => {
      for (const fn of timers.splice(0)) fn();
      await new Promise((resolve) => setImmediate(resolve));
    },
  };
}

function jsonResponse(url: string, body: unknown): Response {
  const response = new Response(JSON.stringify(body), { status: 200 });
  Object.defineProperty(response, "url", { value: url });
  return response;
}

test("XHR responses for lesson_streams are delivered; others are not", () => {
  const h = harness(() => new Response("{}"));
  const got: [string, unknown][] = [];
  installInterceptors({ win: h.win, onPayload: (u, b) => got.push([u, b]), fallbackDelayMs: 1 });

  const xhr = new h.win.XMLHttpRequest() as unknown as FakeXhr;
  xhr.open("GET", "/api/lesson_streams/x.json");
  assert.deepEqual(xhr.opened, ["GET", "/api/lesson_streams/x.json"], "original open still runs");
  xhr.fire(STREAM_URL, 200, JSON.stringify(PAYLOAD));

  const other = new h.win.XMLHttpRequest() as unknown as FakeXhr;
  other.open("GET", "/api/lesson_progress.json");
  other.fire(`${ORIGIN}/api/lesson_progress.json`, 200, "{}");

  const failed = new h.win.XMLHttpRequest() as unknown as FakeXhr;
  failed.open("GET", STREAM_URL);
  failed.fire(STREAM_URL, 500, "oops");

  assert.deepEqual(got, [[STREAM_URL, PAYLOAD]]);
});

test("invalid JSON in an XHR response doesn't throw into the page", () => {
  const h = harness(() => new Response("{}"));
  installInterceptors({
    win: h.win,
    onPayload: () => {
      assert.fail("invalid JSON must not be delivered");
    },
    fallbackDelayMs: 1,
  });
  const xhr = new h.win.XMLHttpRequest() as unknown as FakeXhr;
  xhr.open("GET", STREAM_URL);
  assert.doesNotThrow(() => {
    xhr.fire(STREAM_URL, 200, "<html>");
  });
});

test("fetch responses are delivered and the page still gets an unread body", async () => {
  const h = harness((url) => jsonResponse(url, PAYLOAD));
  const got: unknown[] = [];
  installInterceptors({ win: h.win, onPayload: (_u, b) => got.push(b), fallbackDelayMs: 1 });

  const response = await h.win.fetch(STREAM_URL);
  assert.deepEqual(await response.json(), PAYLOAD);
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(got, [PAYLOAD]);
});

test("fallback re-fetches a full-content request the hooks missed", async () => {
  const h = harness((url) => jsonResponse(url, PAYLOAD));
  const got: string[] = [];
  installInterceptors({ win: h.win, onPayload: (u) => got.push(u), fallbackDelayMs: 1 });

  h.observe(STREAM_URL);
  h.observe(STREAM_URL); // the same entry twice schedules one re-fetch
  h.observe(`${ORIGIN}/api/lesson_streams/b3ebdcba-6b6d-406a-a238-88c6832656ba.json`);
  await h.runTimers();

  assert.deepEqual(h.fetchCalls, [STREAM_URL]);
  assert.deepEqual(got, [STREAM_URL]);
});

test("fallback does nothing when the hooks already delivered the response", async () => {
  const h = harness((url) => jsonResponse(url, PAYLOAD));
  const got: string[] = [];
  installInterceptors({ win: h.win, onPayload: (u) => got.push(u), fallbackDelayMs: 1 });

  const xhr = new h.win.XMLHttpRequest() as unknown as FakeXhr;
  xhr.open("GET", STREAM_URL);
  xhr.fire(STREAM_URL, 200, JSON.stringify(PAYLOAD));
  h.observe(STREAM_URL);
  await h.runTimers();

  assert.deepEqual(h.fetchCalls, []);
  assert.deepEqual(got, [STREAM_URL]);
});
