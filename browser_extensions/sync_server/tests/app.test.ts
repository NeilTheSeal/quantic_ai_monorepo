import assert from "node:assert/strict";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { after, before, test } from "node:test";
import { createApp } from "../src/app.ts";
import type { Lookup, Storage } from "../src/storage.ts";

class MemoryStorage implements Storage {
  readonly files = new Map<string, Buffer>();

  async lookup(path: string): Promise<Lookup | null> {
    const file = this.files.get(path);
    if (file) return { type: "file", entry: { name: path, isDir: false, size: file.length, etag: "x" } };
    const prefix = path === "" ? "" : `${path}/`;
    const names = new Map<string, boolean>();
    for (const key of this.files.keys()) {
      if (!key.startsWith(prefix)) continue;
      const [head, ...rest] = key.slice(prefix.length).split("/");
      if (head) names.set(head, rest.length > 0);
    }
    if (names.size === 0 && path !== "") return null;
    const children = [...names].map(([name, isDir]) => ({ name, isDir, size: 0, etag: "x" }));
    return { type: "dir", children };
  }
  async read(path: string): Promise<Buffer | null> {
    return this.files.get(path) ?? null;
  }
  async write(path: string, data: Buffer): Promise<boolean> {
    const created = !this.files.has(path);
    this.files.set(path, data);
    return created;
  }
  async remove(path: string): Promise<boolean> {
    return this.files.delete(path);
  }
}

const storage = new MemoryStorage();
let server: Server;
let base: string;
const auth = { Authorization: `Basic ${Buffer.from("neil:correct-horse-battery").toString("base64")}` };

before(async () => {
  const app = createApp(
    { user: "neil", pass: "correct-horse-battery", behindProxy: false, maxBodyBytes: 1024, maxAuthFailures: 3 },
    storage,
  );
  server = createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

after(() => {
  server.close();
});

test("PUT, GET, PROPFIND, DELETE round trip", async () => {
  let res = await fetch(`${base}/Tampermonkey/sync/abc.user.js`, { method: "PUT", headers: auth, body: "// hi" });
  assert.equal(res.status, 201);
  res = await fetch(`${base}/Tampermonkey/sync/abc.user.js`, { method: "PUT", headers: auth, body: "// hi2" });
  assert.equal(res.status, 204);

  res = await fetch(`${base}/Tampermonkey/sync/abc.user.js`, { headers: auth });
  assert.equal(await res.text(), "// hi2");

  res = await fetch(`${base}/Tampermonkey/sync/`, { method: "PROPFIND", headers: { ...auth, Depth: "1" } });
  assert.equal(res.status, 207);
  const xml = await res.text();
  assert.match(xml, /<D:href>\/Tampermonkey\/sync\/<\/D:href>/);
  assert.match(xml, /<D:href>\/Tampermonkey\/sync\/abc.user.js<\/D:href>/);

  res = await fetch(`${base}/Tampermonkey/sync/abc.user.js`, { method: "DELETE", headers: auth });
  assert.equal(res.status, 204);
  res = await fetch(`${base}/Tampermonkey/sync/abc.user.js`, { headers: auth });
  assert.equal(res.status, 404);
});

test("root PROPFIND works on empty storage and MKCOL succeeds", async () => {
  let res = await fetch(`${base}/`, { method: "PROPFIND", headers: { ...auth, Depth: "0" } });
  assert.equal(res.status, 207);
  res = await fetch(`${base}/newdir`, { method: "MKCOL", headers: auth });
  assert.equal(res.status, 201);
});

test("rejects traversal and oversized bodies", async () => {
  let res = await fetch(`${base}/a%2F..%2F..%2Fsecret`, { headers: auth });
  assert.equal(res.status, 400);
  res = await fetch(`${base}/big.json`, { method: "PUT", headers: auth, body: "x".repeat(2048) });
  assert.equal(res.status, 413);
});

test("requires auth on every method and locks out after repeated failures", async () => {
  for (const method of ["GET", "PROPFIND", "PUT"]) {
    const res = await fetch(`${base}/x`, { method });
    assert.equal(res.status, 401, method);
  }
  // 3 failures reach maxAuthFailures=3, so even valid creds are refused now.
  const res = await fetch(`${base}/`, { method: "PROPFIND", headers: auth });
  assert.equal(res.status, 429);
});
