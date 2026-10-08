import { createHash, timingSafeEqual } from "node:crypto";
import type { IncomingMessage, RequestListener, ServerResponse } from "node:http";
import { normalizePath } from "./paths.ts";
import type { Entry, Storage } from "./storage.ts";

export interface AppConfig {
  user: string;
  pass: string;
  /** Behind Heroku's router: trust X-Forwarded-* and refuse plain HTTP. */
  behindProxy: boolean;
  maxBodyBytes?: number;
  maxAuthFailures?: number;
  authWindowMs?: number;
}

const ALLOW = "OPTIONS, GET, HEAD, PUT, DELETE, PROPFIND, MKCOL";

class HttpError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function createApp(config: AppConfig, storage: Storage): RequestListener {
  const maxBody = config.maxBodyBytes ?? 5 * 1024 * 1024;
  const maxFailures = config.maxAuthFailures ?? 10;
  const windowMs = config.authWindowMs ?? 15 * 60 * 1000;
  const expected = digest(`${config.user}:${config.pass}`);
  const failures = new Map<string, { count: number; resetAt: number }>();
  // GitHub has no modification times; report a stable one so clients rely on ETags.
  const startedAt = new Date().toUTCString();

  function clientIp(req: IncomingMessage): string {
    if (config.behindProxy) {
      // Heroku's router appends the real client IP as the last entry.
      const forwarded = req.headers["x-forwarded-for"];
      const last = (Array.isArray(forwarded) ? forwarded.join(",") : forwarded)?.split(",").pop();
      if (last) return last.trim();
    }
    return req.socket.remoteAddress ?? "unknown";
  }

  function isAuthorized(req: IncomingMessage): boolean {
    const header = req.headers.authorization ?? "";
    const match = /^Basic\s+(\S+)$/i.exec(header);
    if (!match?.[1]) return false;
    const supplied = Buffer.from(match[1], "base64").toString("utf8");
    return timingSafeEqual(digest(supplied), expected);
  }

  async function handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
    if (config.behindProxy && req.headers["x-forwarded-proto"] !== "https") {
      throw new HttpError(403, "HTTPS required");
    }

    const ip = clientIp(req);
    const now = Date.now();
    const record = failures.get(ip);
    if (record && record.resetAt <= now) failures.delete(ip);
    if ((failures.get(ip)?.count ?? 0) >= maxFailures) {
      throw new HttpError(429, "Too many failed logins; try again later");
    }
    if (!isAuthorized(req)) {
      const current = failures.get(ip) ?? { count: 0, resetAt: now + windowMs };
      current.count += 1;
      failures.set(ip, current);
      res.setHeader("WWW-Authenticate", 'Basic realm="Tampermonkey sync", charset="UTF-8"');
      throw new HttpError(401, "Authentication required");
    }
    failures.delete(ip);

    const urlPath = new URL(req.url ?? "/", "http://localhost").pathname;
    const path = normalizePath(urlPath);
    if (path === null) throw new HttpError(400, "Invalid path");

    switch (req.method) {
      case "OPTIONS":
        res.writeHead(200, { DAV: "1", Allow: ALLOW, "Content-Length": 0 }).end();
        return;
      case "GET":
      case "HEAD": {
        const data = await storage.read(path);
        if (data === null) throw new HttpError(404, "Not found");
        res.writeHead(200, {
          "Content-Type": "application/octet-stream",
          "Content-Length": data.length,
        });
        res.end(req.method === "GET" ? data : undefined);
        return;
      }
      case "PUT": {
        if (path === "") throw new HttpError(405, "Cannot PUT the root");
        const body = await readBody(req, maxBody);
        const created = await storage.write(path, body);
        res.writeHead(created ? 201 : 204).end();
        return;
      }
      case "DELETE": {
        if (path === "") throw new HttpError(405, "Cannot DELETE the root");
        const found = await storage.lookup(path);
        if (found?.type === "dir") throw new HttpError(405, "Deleting folders is not supported");
        if (!(await storage.remove(path))) throw new HttpError(404, "Not found");
        res.writeHead(204).end();
        return;
      }
      case "MKCOL": {
        // Git has no empty folders; folders appear implicitly when a file is written into them.
        await drain(req);
        const found = await storage.lookup(path);
        if (found) throw new HttpError(405, "Already exists");
        res.writeHead(201).end();
        return;
      }
      case "PROPFIND": {
        await drain(req);
        const found = await storage.lookup(path);
        if (!found) throw new HttpError(404, "Not found");
        const depth = req.headers.depth === "0" ? 0 : 1;
        const base = path === "" ? "/" : `/${path.split("/").map(encodeURIComponent).join("/")}`;
        const responses: string[] = [];
        if (found.type === "file") {
          responses.push(propResponse(base, found.entry, startedAt));
        } else {
          const self = base.endsWith("/") ? base : `${base}/`;
          responses.push(
            propResponse(self, { name: "", isDir: true, size: 0, etag: "" }, startedAt),
          );
          if (depth === 1) {
            for (const child of found.children) {
              const href = `${self}${encodeURIComponent(child.name)}${child.isDir ? "/" : ""}`;
              responses.push(propResponse(href, child, startedAt));
            }
          }
        }
        const xml =
          `<?xml version="1.0" encoding="utf-8"?>\n` +
          `<D:multistatus xmlns:D="DAV:">${responses.join("")}</D:multistatus>`;
        res.writeHead(207, {
          "Content-Type": "application/xml; charset=utf-8",
          "Content-Length": Buffer.byteLength(xml),
        });
        res.end(xml);
        return;
      }
      default:
        res.setHeader("Allow", ALLOW);
        throw new HttpError(405, "Method not allowed");
    }
  }

  return (req, res) => {
    handle(req, res).catch((err: unknown) => {
      const status = err instanceof HttpError ? err.status : 502;
      const message = err instanceof HttpError ? err.message : "Storage backend error";
      if (!(err instanceof HttpError)) console.error(`${req.method} ${req.url}:`, err);
      if (res.headersSent) {
        res.destroy();
        return;
      }
      res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" }).end(message);
    });
  };
}

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

async function readBody(req: IncomingMessage, limit: number): Promise<Buffer> {
  const declared = Number(req.headers["content-length"]);
  if (declared > limit) throw new HttpError(413, "Payload too large");
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req as AsyncIterable<Buffer>) {
    size += chunk.length;
    if (size > limit) throw new HttpError(413, "Payload too large");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function drain(req: IncomingMessage): Promise<void> {
  await readBody(req, 64 * 1024);
}

function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, (c) => `&#${c.charCodeAt(0)};`);
}

function propResponse(href: string, entry: Entry, lastModified: string): string {
  const props = entry.isDir
    ? "<D:resourcetype><D:collection/></D:resourcetype>"
    : "<D:resourcetype/>" +
      `<D:getcontentlength>${entry.size}</D:getcontentlength>` +
      `<D:getetag>"${escapeXml(entry.etag)}"</D:getetag>`;
  return (
    `<D:response><D:href>${escapeXml(href)}</D:href><D:propstat><D:prop>` +
    `${props}<D:getlastmodified>${lastModified}</D:getlastmodified>` +
    `</D:prop><D:status>HTTP/1.1 200 OK</D:status></D:propstat></D:response>`
  );
}
