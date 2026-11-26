"""Minimal WebDAV client for the sync server (PROPFIND, GET, PUT) over urllib."""

import base64
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from dataclasses import dataclass

from summarizer.tls import SSL_CONTEXT

DAV = "{DAV:}"
TIMEOUT_S = 120


@dataclass(frozen=True, slots=True)
class Entry:
    name: str
    is_dir: bool


class WebDavError(RuntimeError):
    pass


def parse_propfind(xml_body: bytes, folder_path: str, base_path: str = "/") -> list[Entry]:
    """Children of `folder_path` in a Depth: 1 PROPFIND response (the folder itself excluded).

    `base_path` is the path part of the server URL, for servers mounted below the root.
    """
    root = ET.fromstring(xml_body)
    own = "/" + "/".join(p for p in (base_path.strip("/"), folder_path.strip("/")) if p)
    entries: list[Entry] = []
    for response in root.iter(f"{DAV}response"):
        href = response.findtext(f"{DAV}href") or ""
        path = urllib.parse.unquote(urllib.parse.urlsplit(href).path).rstrip("/")
        if path == own.rstrip("/") or not path:
            continue
        is_dir = response.find(f".//{DAV}resourcetype/{DAV}collection") is not None
        entries.append(Entry(name=path.rsplit("/", 1)[-1], is_dir=is_dir))
    return sorted(entries, key=lambda e: e.name)


class WebDav:
    def __init__(self, base_url: str, username: str, password: str) -> None:
        self._base = base_url if base_url.endswith("/") else base_url + "/"
        token = base64.b64encode(f"{username}:{password}".encode()).decode()
        self._auth = f"Basic {token}"

    def _url(self, path: str) -> str:
        segments = [urllib.parse.quote(s, safe="") for s in path.strip("/").split("/") if s]
        return self._base + "/".join(segments)

    def _request(
        self,
        method: str,
        path: str,
        body: bytes | None = None,
        headers: dict[str, str] | None = None,
    ) -> tuple[int, bytes]:
        request = urllib.request.Request(
            self._url(path),
            data=body,
            method=method,
            headers={"Authorization": self._auth, **(headers or {})},
        )
        try:
            with urllib.request.urlopen(
                request, timeout=TIMEOUT_S, context=SSL_CONTEXT
            ) as response:
                return response.status, response.read()
        except urllib.error.HTTPError as err:
            return err.code, err.read()

    def listdir(self, path: str) -> list[Entry]:
        """Files and folders directly inside `path`; empty if it doesn't exist."""
        status, body = self._request("PROPFIND", path.rstrip("/") + "/", headers={"Depth": "1"})
        if status == 404:
            return []
        if status != 207:
            raise WebDavError(f"PROPFIND {path} returned HTTP {status}")
        return parse_propfind(body, path, urllib.parse.urlsplit(self._base).path)

    def get(self, path: str) -> bytes | None:
        """File contents, or None if it doesn't exist."""
        status, body = self._request("GET", path)
        if status == 404:
            return None
        if status != 200:
            raise WebDavError(f"GET {path} returned HTTP {status}")
        return body

    def put(self, path: str, body: bytes, content_type: str) -> None:
        status, _ = self._request("PUT", path, body, {"Content-Type": content_type})
        if status not in (201, 204):
            raise WebDavError(f"PUT {path} returned HTTP {status}")
