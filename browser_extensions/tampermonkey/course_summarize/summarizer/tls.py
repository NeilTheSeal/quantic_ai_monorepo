"""TLS settings for the urllib requests (WebDAV, CDN downloads).

python.org's macOS builds ship OpenSSL with an empty CA store, so urllib's default context
rejects every certificate. truststore verifies against the operating system's trust store
(Keychain on macOS, the system bundle on Linux), the same way the Anthropic SDK's HTTP client
already does, so no per-machine certificate setup is needed.
"""

import ssl

import truststore

SSL_CONTEXT: ssl.SSLContext = truststore.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
