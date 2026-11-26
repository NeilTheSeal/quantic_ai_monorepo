"""Narrowing helpers for the untyped JSON the Quantic API returns."""

type JsonObject = dict[str, object]


def obj(value: object) -> JsonObject:
    """The value if it is a JSON object, else an empty one."""
    if isinstance(value, dict):
        return {str(k): v for k, v in value.items()}
    return {}


def arr(value: object) -> list[object]:
    """The value if it is a JSON array, else an empty list."""
    return list(value) if isinstance(value, list) else []


def text(value: object) -> str | None:
    """The value stripped if it is a non-blank string, else None."""
    if isinstance(value, str) and value.strip():
        return value.strip()
    return None


def objs(value: object) -> list[JsonObject]:
    """The JSON objects in an array, skipping anything else."""
    return [obj(item) for item in arr(value) if isinstance(item, dict)]
