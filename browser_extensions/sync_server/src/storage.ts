export interface Entry {
  name: string;
  isDir: boolean;
  size: number;
  etag: string;
}

export type Lookup = { type: "file"; entry: Entry } | { type: "dir"; children: Entry[] };

/** Paths are normalized, slash-separated, relative to the storage root ("" is the root). */
export interface Storage {
  lookup(path: string): Promise<Lookup | null>;
  read(path: string): Promise<Buffer | null>;
  /** Returns true if the file was created, false if it was overwritten. */
  write(path: string, data: Buffer): Promise<boolean>;
  /** Returns false if there was nothing to delete. */
  remove(path: string): Promise<boolean>;
}

interface GitHubItem {
  type: string;
  name: string;
  size: number;
  sha: string;
}

export interface GitHubConfig {
  token: string;
  repo: string;
  branch: string;
  prefix: string;
}

/** Stores files in a GitHub repo through the Contents API; every write is one commit. */
export class GitHubStorage implements Storage {
  private readonly config: GitHubConfig;
  // Writes are serialized: concurrent commits to one branch fail with 409 on stale SHAs.
  private writeQueue: Promise<unknown> = Promise.resolve();

  constructor(config: GitHubConfig) {
    this.config = config;
  }

  async lookup(path: string): Promise<Lookup | null> {
    const res = await this.request("GET", path);
    if (res.status === 404) {
      // The prefix folder doesn't exist until the first upload; present it as empty.
      return path === "" ? { type: "dir", children: [] } : null;
    }
    await assertOk(res);
    const body = (await res.json()) as GitHubItem | GitHubItem[];
    if (Array.isArray(body)) {
      return { type: "dir", children: body.filter(isFileOrDir).map(toEntry) };
    }
    return isFileOrDir(body) && body.type === "file" ? { type: "file", entry: toEntry(body) } : null;
  }

  async read(path: string): Promise<Buffer | null> {
    if (path === "") return null;
    const res = await this.request("GET", path, undefined, "application/vnd.github.raw+json");
    if (res.status === 404) return null;
    await assertOk(res);
    // A directory comes back as a JSON listing even with the raw media type.
    if (res.headers.get("content-type")?.includes("application/json")) {
      const body: unknown = await res.json();
      if (Array.isArray(body)) return null;
      return Buffer.from(JSON.stringify(body));
    }
    return Buffer.from(await res.arrayBuffer());
  }

  write(path: string, data: Buffer): Promise<boolean> {
    return this.serialize(async () => {
      const sha = await this.fileSha(path);
      const res = await this.request("PUT", path, {
        message: `Sync ${path}`,
        content: data.toString("base64"),
        branch: this.config.branch,
        ...(sha ? { sha } : {}),
      });
      await assertOk(res);
      return sha === null;
    });
  }

  remove(path: string): Promise<boolean> {
    return this.serialize(async () => {
      const sha = await this.fileSha(path);
      if (sha === null) return false;
      const res = await this.request("DELETE", path, {
        message: `Delete ${path}`,
        sha,
        branch: this.config.branch,
      });
      await assertOk(res);
      return true;
    });
  }

  private async fileSha(path: string): Promise<string | null> {
    const found = await this.lookup(path);
    return found?.type === "file" ? found.entry.etag : null;
  }

  private serialize<T>(fn: () => Promise<T>): Promise<T> {
    const result = this.writeQueue.then(fn, fn);
    this.writeQueue = result.catch(() => undefined);
    return result;
  }

  private request(
    method: string,
    path: string,
    body?: object,
    accept = "application/vnd.github+json",
  ): Promise<Response> {
    const { repo, branch, prefix, token } = this.config;
    const fullPath = [prefix, path].filter(Boolean).join("/");
    const encoded = fullPath.split("/").map(encodeURIComponent).join("/");
    const query = method === "GET" ? `?ref=${encodeURIComponent(branch)}` : "";
    return fetch(`https://api.github.com/repos/${repo}/contents/${encoded}${query}`, {
      method,
      headers: {
        Accept: accept,
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  }
}

function isFileOrDir(item: GitHubItem): boolean {
  return item.type === "file" || item.type === "dir";
}

function toEntry(item: GitHubItem): Entry {
  return { name: item.name, isDir: item.type === "dir", size: item.size, etag: item.sha };
}

async function assertOk(res: Response): Promise<void> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API ${res.status}: ${text.slice(0, 300)}`);
  }
}
