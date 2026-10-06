---
name: local-llm
description: Conventions for calling local LLMs through Ollama from Python or TypeScript — endpoints, configuration, streaming, structured output, and testing. Use when code talks to a local model or the user mentions Ollama, llama.cpp, "local LLM", or running a model offline.
---

# Local LLMs via Ollama

Ollama is the local model runtime for this repo. Hosted Claude is a separate concern; the bundled
`claude-api` skill covers it.

## Facts to verify, not assume

Ollama moves fast. Before writing integration code, check the installed version and the API
docs, and prefer what they say over this file:

- `ollama --version`, `ollama list` (installed models), `ollama ps` (loaded models)
- API reference: <https://github.com/ollama/ollama/blob/main/docs/api.md>
- Default server: `http://localhost:11434`, overridable with `OLLAMA_HOST`

## Conventions

- Configure through the environment, loaded from `.env`: `OLLAMA_HOST` (default
  `http://localhost:11434`) and `OLLAMA_MODEL`. Never hard-code a model name in logic; pass it in
  or read it from config, with the default in one place.
- Python: use the OpenAI-compatible endpoint (`/v1/chat/completions`, `/v1/embeddings`) with
  `httpx` (installed) and Pydantic models for request and response shapes, so swapping to a hosted
  provider is a URL change. Use Ollama's native `/api/chat` or `/api/embed` only for features the
  compatible layer lacks (e.g. `keep_alive`, model options). Ask before adding the `ollama` or
  `openai` SDK.
- TypeScript: `fetch` against the same endpoints; a typed client module per project.
- Timeouts: first-token latency can be tens of seconds while a model loads. Set a connect timeout
  of a few seconds and a read timeout of 120 s or more, and stream (`"stream": true`) for anything
  user-facing.
- Structured output: request JSON with a schema (`format` in the native API, `response_format` in
  the compatible API) and validate with Pydantic. Retry once on validation failure, then fail
  loudly.
- Embeddings and chat use different models; don't assume one model does both.
- Fail clearly when the server is down: catch the connection error and tell the user to run
  `ollama serve` or check `OLLAMA_HOST`.

## Testing

- Unit tests must not need a running Ollama. Inject the transport (`httpx.MockTransport`) or the
  client, and assert on request shape and response parsing.
- Put real-model checks behind a pytest marker (`@pytest.mark.ollama`) that is skipped unless
  `OLLAMA_HOST` responds, and keep them to a smoke test.
