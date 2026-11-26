import assert from "node:assert/strict";
import { test } from "node:test";
import type { UploadFile } from "../src/capture.ts";
import {
  type DavClient,
  type KeyValueStore,
  type QueueEvents,
  UploadQueue,
  backoffMs,
} from "../src/queue.ts";

function memoryStore(): KeyValueStore & { data: Map<string, unknown> } {
  const data = new Map<string, unknown>();
  return {
    data,
    // Round-trip through JSON like GM storage does, so tests can't share object references.
    get: (key): unknown =>
      data.has(key) ? (JSON.parse(JSON.stringify(data.get(key))) as unknown) : undefined,
    set: (key, value) => data.set(key, JSON.parse(JSON.stringify(value))),
    delete: (key) => data.delete(key),
    keys: () => [...data.keys()],
  };
}

function fakeServer(headStatus = 404, putStatus = 201) {
  const calls: string[] = [];
  const files = new Map<string, string>();
  const client: DavClient & { headStatus: number; putStatus: number } = {
    headStatus,
    putStatus,
    async head(path) {
      calls.push(`HEAD ${path}`);
      return files.has(path) ? 200 : client.headStatus;
    },
    async put(path, body) {
      calls.push(`PUT ${path}`);
      if (client.putStatus === 201) files.set(path, body);
      return client.putStatus;
    },
  };
  return { client, calls, files };
}

function recorder() {
  const log: string[] = [];
  const events: QueueEvents = {
    uploaded: (item) => log.push(`uploaded ${item.key}`),
    alreadyOnServer: (item) => log.push(`already ${item.key}`),
    failed: (item, error) => log.push(`failed ${item.key}: ${error}`),
    dropped: (item, reason) => log.push(`dropped ${item.key}: ${reason}`),
    needsConfig: (reason) => log.push(`config: ${reason}`),
  };
  return { log, events };
}

const fileA: UploadFile = { path: "courses/c/a.json", key: "lesson:a", label: "A", body: "{}" };
const fileB: UploadFile = { path: "courses/c/b.json", key: "lesson:b", label: "B", body: "[]" };

test("uploads queued files once and remembers them", async () => {
  const store = memoryStore();
  const server = fakeServer();
  const { log, events } = recorder();
  const queue = new UploadQueue({ store, client: () => server.client, events });

  assert.equal(queue.enqueue([fileA, fileB]), 2);
  assert.equal(queue.enqueue([fileA]), 0, "already queued");
  await queue.flush();

  assert.deepEqual(log, ["uploaded lesson:a", "uploaded lesson:b"]);
  assert.equal(server.files.get("courses/c/a.json"), "{}");
  assert.deepEqual(queue.pending(), []);
  assert.ok(queue.isCaptured("lesson:a"));
  assert.equal(queue.enqueue([fileA]), 0, "already captured");
  assert.ok(![...store.data.keys()].some((k) => k.startsWith("body:")), "bodies cleaned up");
});

test("skips the PUT when the other machine already uploaded the file", async () => {
  const server = fakeServer(200);
  const { log, events } = recorder();
  const queue = new UploadQueue({ store: memoryStore(), client: () => server.client, events });
  queue.enqueue([fileA]);
  await queue.flush();
  assert.deepEqual(server.calls, ["HEAD courses/c/a.json"]);
  assert.deepEqual(log, ["already lesson:a"]);
  assert.ok(queue.isCaptured("lesson:a"));
});

test("failures back off and retry when due", async () => {
  let now = 1_000_000;
  const server = fakeServer(404, 502);
  const { log, events } = recorder();
  const queue = new UploadQueue({
    store: memoryStore(),
    client: () => server.client,
    events,
    now: () => now,
  });
  queue.enqueue([fileA]);
  await queue.flush();
  assert.deepEqual(log, ["failed lesson:a: PUT returned HTTP 502"]);
  const item = queue.pending()[0];
  assert.ok(item);
  assert.equal(item.attempts, 1);
  assert.equal(item.nextAttemptAt, now + backoffMs(1));
  assert.equal(queue.nextDueIn(), backoffMs(1));

  await queue.flush();
  assert.equal(server.calls.length, 2, "not due yet, so no new requests");

  now += backoffMs(1);
  server.client.putStatus = 201;
  await queue.flush();
  assert.deepEqual(log.at(-1), "uploaded lesson:a");
  assert.equal(queue.nextDueIn(), null);
});

test("a 401 blocks all uploads until the credentials change", async () => {
  const server = fakeServer(401);
  const { log, events } = recorder();
  const queue = new UploadQueue({ store: memoryStore(), client: () => server.client, events });
  queue.enqueue([fileA, fileB]);
  await queue.flush();
  assert.deepEqual(server.calls, ["HEAD courses/c/a.json"]);
  assert.deepEqual(log, ["config: The sync server rejected the username or password"]);
  assert.ok(queue.authBlocked());

  // Even items that are due make no request while blocked: each would be a failed login.
  queue.retryAllNow();
  await queue.flush();
  assert.equal(server.calls.length, 1);

  // New credentials: unblock, retry everything.
  server.client.headStatus = 404;
  queue.clearAuthFailure();
  queue.retryAllNow();
  await queue.flush();
  assert.deepEqual(log.slice(-2), ["uploaded lesson:a", "uploaded lesson:b"]);
  assert.deepEqual(queue.pending(), []);
});

test("an item whose body vanished is dropped, not retried", async () => {
  const store = memoryStore();
  const server = fakeServer();
  const { log, events } = recorder();
  const queue = new UploadQueue({ store, client: () => server.client, events });
  queue.enqueue([fileA]);
  store.delete("body:lesson:a");
  await queue.flush();
  assert.deepEqual(log, ["dropped lesson:a: stored body is missing"]);
  assert.deepEqual(server.calls, []);
  assert.deepEqual(queue.pending(), []);
});

test("items, bodies and markers are separate keys (no shared array for tabs to clobber)", () => {
  const store = memoryStore();
  const { events } = recorder();
  new UploadQueue({ store, client: () => null, events }).enqueue([fileA, fileB]);
  assert.deepEqual([...store.data.keys()].sort(), [
    "body:lesson:a",
    "body:lesson:b",
    "item:lesson:a",
    "item:lesson:b",
  ]);
});

test("without a server configured nothing is sent and files stay queued", async () => {
  const { log, events } = recorder();
  const queue = new UploadQueue({ store: memoryStore(), client: () => null, events });
  queue.enqueue([fileA]);
  await queue.flush();
  assert.deepEqual(log, ["config: No sync server configured"]);
  assert.equal(queue.pending().length, 1);
});

test("network errors are retried like HTTP errors", async () => {
  const { log, events } = recorder();
  const client: DavClient = {
    head: async () => {
      throw new Error("HEAD failed: network error");
    },
    put: async () => 201,
  };
  const queue = new UploadQueue({ store: memoryStore(), client: () => client, events });
  queue.enqueue([fileA]);
  await queue.flush();
  assert.deepEqual(log, ["failed lesson:a: HEAD failed: network error"]);
  assert.equal(queue.pending()[0]?.attempts, 1);
});

test("the queue survives a reload (new instance, same storage)", async () => {
  const store = memoryStore();
  const { events } = recorder();
  new UploadQueue({ store, client: () => null, events }).enqueue([fileA]);
  const server = fakeServer();
  const reloaded = new UploadQueue({ store, client: () => server.client, events });
  await reloaded.flush();
  assert.equal(server.files.get("courses/c/a.json"), "{}");
});

test("concurrent flushes share one run", async () => {
  const server = fakeServer();
  const { events } = recorder();
  const queue = new UploadQueue({ store: memoryStore(), client: () => server.client, events });
  queue.enqueue([fileA]);
  await Promise.all([queue.flush(), queue.flush()]);
  assert.deepEqual(server.calls, ["HEAD courses/c/a.json", "PUT courses/c/a.json"]);
});

test("backoff doubles and caps at 30 minutes", () => {
  assert.equal(backoffMs(1), 30_000);
  assert.equal(backoffMs(2), 60_000);
  assert.equal(backoffMs(20), 30 * 60_000);
});
