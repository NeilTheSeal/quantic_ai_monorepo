// Persistent upload queue. Files wait in userscript storage until the server has them, so a
// closed tab, an offline laptop or a server error loses nothing. Content never changes, so
// each key is uploaded at most once: a local `done:` marker answers repeat visits without a
// request, and a HEAD before every PUT covers files the other machine already uploaded.
//
// Every item, body and marker is its own storage key. Tampermonkey gives each tab a cached
// copy of stored values that syncs with a delay, so a shared array rewritten by two tabs
// would drop entries; separate keys mean a tab only ever writes the entries it touches.

import type { UploadFile } from "./capture.ts";

export interface KeyValueStore {
  get(key: string): unknown;
  set(key: string, value: unknown): void;
  delete(key: string): void;
  keys(): string[];
}

export interface DavClient {
  /** HTTP status of a HEAD on `path` (200 exists, 404 missing). */
  head(path: string): Promise<number>;
  /** HTTP status of a PUT of `body` to `path` (201 created, 204 overwritten). */
  put(path: string, body: string): Promise<number>;
}

export interface QueueItem {
  path: string;
  key: string;
  label: string;
  attempts: number;
  nextAttemptAt: number;
  lastError: string | null;
}

export interface QueueEvents {
  uploaded(item: QueueItem): void;
  alreadyOnServer(item: QueueItem): void;
  /** A retryable failure; the item stays queued with a backoff. */
  failed(item: QueueItem, error: string): void;
  /** The item was removed without uploading (its stored body is gone). */
  dropped(item: QueueItem, reason: string): void;
  /** There is work to do but no server configured, or the server rejected the credentials. */
  needsConfig(reason: string): void;
}

export interface QueueOptions {
  store: KeyValueStore;
  client: () => DavClient | null;
  events: QueueEvents;
  now?: () => number;
}

const ITEM_PREFIX = "item:";
const BODY_PREFIX = "body:";
const DONE_PREFIX = "done:";
const AUTH_FAILED_KEY = "authFailed";

export const NO_CONFIG = "No sync server configured";
export const AUTH_REJECTED = "The sync server rejected the username or password";

const BASE_BACKOFF_MS = 30_000;
const MAX_BACKOFF_MS = 30 * 60_000;

/** Delay before retry number `attempts` (1-based): 30 s, 1 min, 2 min, ... capped at 30 min. */
export function backoffMs(attempts: number): number {
  return Math.min(BASE_BACKOFF_MS * 2 ** Math.max(0, attempts - 1), MAX_BACKOFF_MS);
}

class HttpStatusError extends Error {
  readonly status: number;
  constructor(method: string, status: number) {
    super(`${method} returned HTTP ${status}`);
    this.status = status;
  }
}

function isQueueItem(value: unknown): value is QueueItem {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.path === "string" &&
    typeof v.key === "string" &&
    typeof v.label === "string" &&
    typeof v.attempts === "number" &&
    typeof v.nextAttemptAt === "number" &&
    (v.lastError === null || typeof v.lastError === "string")
  );
}

export class UploadQueue {
  private readonly store: KeyValueStore;
  private readonly client: () => DavClient | null;
  private readonly events: QueueEvents;
  private readonly now: () => number;
  private flushing: Promise<void> | null = null;

  constructor(options: QueueOptions) {
    this.store = options.store;
    this.client = options.client;
    this.events = options.events;
    this.now = options.now ?? Date.now;
  }

  /** Queued items, oldest due first. */
  pending(): QueueItem[] {
    const items: QueueItem[] = [];
    for (const name of this.store.keys()) {
      if (!name.startsWith(ITEM_PREFIX)) continue;
      const item = this.store.get(name);
      if (isQueueItem(item)) items.push(item);
    }
    return items.sort((a, b) => a.nextAttemptAt - b.nextAttemptAt);
  }

  isCaptured(key: string): boolean {
    return this.store.get(DONE_PREFIX + key) !== undefined;
  }

  capturedCount(): number {
    return this.store.keys().filter((name) => name.startsWith(DONE_PREFIX)).length;
  }

  /** Forgets which files were uploaded. The server-side HEAD still prevents re-uploads. */
  forgetCaptured(): void {
    for (const name of this.store.keys()) {
      if (name.startsWith(DONE_PREFIX)) this.store.delete(name);
    }
  }

  /** Set after a 401; no request is made until the credentials change. */
  authBlocked(): boolean {
    return this.store.get(AUTH_FAILED_KEY) !== undefined;
  }

  /** Call after saving new credentials. */
  clearAuthFailure(): void {
    this.store.delete(AUTH_FAILED_KEY);
  }

  /** Queues files not yet captured or queued. Returns how many were added. */
  enqueue(files: readonly UploadFile[]): number {
    let added = 0;
    for (const file of files) {
      if (this.isCaptured(file.key) || this.store.get(ITEM_PREFIX + file.key) !== undefined) {
        continue;
      }
      // Body first: an item without a body is dropped, a body without an item is just garbage.
      this.store.set(BODY_PREFIX + file.key, file.body);
      this.save({
        path: file.path,
        key: file.key,
        label: file.label,
        attempts: 0,
        nextAttemptAt: 0,
        lastError: null,
      });
      added++;
    }
    return added;
  }

  /** Milliseconds until the next item is due, or null when nothing is queued. */
  nextDueIn(): number | null {
    const soonest = this.pending()[0];
    return soonest === undefined ? null : Math.max(0, soonest.nextAttemptAt - this.now());
  }

  /** Makes every queued item due now (after new credentials, or "retry now"). */
  retryAllNow(): void {
    for (const item of this.pending()) this.save({ ...item, nextAttemptAt: 0 });
  }

  /** Uploads every due item, one at a time. Concurrent calls share one run. */
  async flush(): Promise<void> {
    if (this.flushing !== null) return this.flushing;
    this.flushing = this.runFlush();
    try {
      await this.flushing;
    } finally {
      this.flushing = null;
    }
  }

  private async runFlush(): Promise<void> {
    for (;;) {
      const due = this.pending().find((item) => item.nextAttemptAt <= this.now());
      if (due === undefined) return;
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
  private async upload(client: DavClient, item: QueueItem): Promise<boolean> {
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      const attempts = item.attempts + 1;
      const updated = {
        ...item,
        attempts,
        nextAttemptAt: this.now() + backoffMs(attempts),
        lastError: message,
      };
      this.save(updated);
      if (err instanceof HttpStatusError && err.status === 401) {
        // Stop everything: each further try is another failed login, and the server locks
        // the IP out after ten.
        this.store.set(AUTH_FAILED_KEY, message);
        this.events.needsConfig(AUTH_REJECTED);
        return true;
      }
      this.events.failed(updated, message);
      return false;
    }
  }

  private save(item: QueueItem): void {
    this.store.set(ITEM_PREFIX + item.key, item);
  }

  private complete(item: QueueItem): void {
    this.store.set(DONE_PREFIX + item.key, item.path);
    this.remove(item.key);
  }

  private remove(key: string): void {
    this.store.delete(ITEM_PREFIX + key);
    this.store.delete(BODY_PREFIX + key);
  }
}
