// WebDAV client for the sync server, over GM_xmlhttpRequest. That request runs in the
// extension, not the page, so the server's CORS policy and Quantic's CSP don't apply; the
// server's host has to be listed in the script's @connect header instead.

import type { DavClient } from "./queue.ts";

export interface SyncConfig {
  /** Server root with a trailing slash, e.g. `https://example.herokuapp.com/`. */
  baseUrl: string;
  username: string;
  password: string;
}

const REQUEST_TIMEOUT_MS = 60_000;

export function isSyncConfig(value: unknown): value is SyncConfig {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.baseUrl === "string" &&
    typeof v.username === "string" &&
    typeof v.password === "string"
  );
}

/** An https URL with a trailing slash, or null when the input isn't one. */
export function normalizeBaseUrl(input: string): string | null {
  let url: URL;
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

/** `courses/a b/x.json` under the base URL, each segment percent-encoded. */
export function resolvePath(baseUrl: string, path: string): string {
  const encoded = path
    .split("/")
    .filter((segment) => segment.length > 0)
    .map(encodeURIComponent)
    .join("/");
  return baseUrl + encoded;
}

/** Base64 of the UTF-8 bytes (plain `btoa` throws on non-Latin-1 characters). */
export function basicAuth(username: string, password: string): string {
  const bytes = new TextEncoder().encode(`${username}:${password}`);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return `Basic ${btoa(binary)}`;
}

function request(
  method: "HEAD" | "PUT",
  url: string,
  authorization: string,
  body?: string,
): Promise<number> {
  return new Promise((resolve, reject) => {
    const headers: Record<string, string> = { Authorization: authorization };
    if (body !== undefined) headers["Content-Type"] = "application/json; charset=utf-8";
    GM_xmlhttpRequest({
      method,
      url,
      headers,
      ...(body === undefined ? {} : { data: body }),
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
        reject(new Error(`${method} timed out after ${REQUEST_TIMEOUT_MS / 1000} s`));
      },
    });
  });
}

export function createGmDavClient(config: SyncConfig): DavClient {
  const authorization = basicAuth(config.username, config.password);
  return {
    head: (path) => request("HEAD", resolvePath(config.baseUrl, path), authorization),
    put: (path, body) => request("PUT", resolvePath(config.baseUrl, path), authorization, body),
  };
}
