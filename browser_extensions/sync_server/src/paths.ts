// Conservative allow-list per path segment; Tampermonkey uses UUID-like names plus extensions.
const SEGMENT = /^[A-Za-z0-9._\-@()+ ]{1,200}$/;

/**
 * Turns a request URL path into a normalized storage path ("" for the root),
 * or null if it is malformed or tries to escape the root.
 */
export function normalizePath(urlPath: string): string | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    return null;
  }
  const segments = decoded.split("/").filter((s) => s !== "");
  for (const segment of segments) {
    if (segment === "." || segment === ".." || !SEGMENT.test(segment)) return null;
  }
  return segments.join("/");
}
