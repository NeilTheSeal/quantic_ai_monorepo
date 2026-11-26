"""Downloads Quantic's public assets (images, PDFs) from their upload CDN."""

import urllib.request

from summarizer.tls import SSL_CONTEXT

TIMEOUT_S = 60
USER_AGENT = "course-summarize/0.1"
MAX_BYTES = 30 * 1024 * 1024


def download(url: str) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=TIMEOUT_S, context=SSL_CONTEXT) as response:
        data: bytes = response.read(MAX_BYTES + 1)
    if len(data) > MAX_BYTES:
        raise ValueError(f"{url} is larger than {MAX_BYTES // (1024 * 1024)} MB")
    return data
