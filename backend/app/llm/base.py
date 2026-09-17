"""The provider contract.

Every adapter takes the same three things — a system prompt, a user prompt,
and a JSON Schema — and returns a parsed dict matching that schema. Nothing
above this layer knows which vendor answered.
"""

import copy
import json
import re
from typing import Any, Dict


class LLMError(RuntimeError):
    """Raised for anything the caller should see as a generation failure."""

    def __init__(self, message: str, provider: str = "", status: int = 502):
        super().__init__(message)
        self.message = message
        self.provider = provider
        self.status = status


class LLMProvider:
    """Base class for provider adapters.

    Subclasses implement generate_json(). Keeping this a class rather than a
    bare function gives each adapter a place to hold its key, model, and any
    vendor-specific request shaping.
    """

    name = "base"

    def __init__(self, api_key: str, model: str, temperature: float,
                 max_output_tokens: int, timeout: float):
        if not api_key:
            raise LLMError(
                "No API key configured for provider '%s'. Set the matching "
                "key in your .env file." % self.name,
                provider=self.name,
                status=500,
            )
        self.api_key = api_key
        self.model = model
        self.temperature = temperature
        self.max_output_tokens = max_output_tokens
        self.timeout = timeout

    def generate_json(self, system: str, user: str,
                      schema: Dict[str, Any]) -> Dict[str, Any]:
        raise NotImplementedError


def parse_json_response(text: str, provider: str) -> Dict[str, Any]:
    """Parse model output that is supposed to be JSON.

    Structured-output modes normally return clean JSON, but a model that falls
    back to prose will wrap it in a ```json fence. Strip that before giving up.
    """
    if not text or not text.strip():
        raise LLMError("Model returned an empty response.", provider=provider)

    cleaned = text.strip()
    fenced = re.match(r"^```(?:json)?\s*(.*?)\s*```$", cleaned, re.DOTALL)
    if fenced:
        cleaned = fenced.group(1)

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        # Last resort: the outermost {...} span.
        start, end = cleaned.find("{"), cleaned.rfind("}")
        if start != -1 and end > start:
            try:
                return json.loads(cleaned[start:end + 1])
            except json.JSONDecodeError:
                pass
        raise LLMError(
            "Model did not return valid JSON. First 200 characters: %s"
            % cleaned[:200],
            provider=provider,
        )


def _walk_schema(node: Any, visit) -> Any:
    """Recurse through a JSON Schema, calling visit() on each schema node.

    Deliberately schema-aware rather than a blind dict walk: the values under
    `properties` are *property names*, not keywords, so a name that collides
    with a JSON Schema keyword must survive. A naive walker would delete a
    property called "examples", "items" or "required" as if it were the
    keyword of that name.
    """
    if isinstance(node, list):
        return [_walk_schema(item, visit) for item in node]
    if not isinstance(node, dict):
        return node

    result = visit(dict(node))

    if isinstance(result.get("properties"), dict):
        result["properties"] = {
            name: _walk_schema(subschema, visit)
            for name, subschema in result["properties"].items()
        }
    if "items" in result:
        result["items"] = _walk_schema(result["items"], visit)
    for keyword in ("anyOf", "oneOf", "allOf"):
        if keyword in result:
            result[keyword] = _walk_schema(result[keyword], visit)

    return result


def strictify(schema: Dict[str, Any]) -> Dict[str, Any]:
    """Return a copy with additionalProperties:false on every object.

    OpenAI's strict json_schema mode requires it, and requires `required` to
    name every property; the other providers do not care either way.
    """
    def visit(node: Dict[str, Any]) -> Dict[str, Any]:
        if isinstance(node.get("properties"), dict):
            node["additionalProperties"] = False
            node["required"] = list(node["properties"].keys())
        return node

    return _walk_schema(copy.deepcopy(schema), visit)


def without_keys(schema: Dict[str, Any], drop: tuple) -> Dict[str, Any]:
    """Return a copy with the given JSON Schema keywords removed.

    Gemini's responseSchema accepts only a subset of JSON Schema and rejects
    unknown keywords outright. Property *names* matching `drop` are preserved.
    """
    def visit(node: Dict[str, Any]) -> Dict[str, Any]:
        return {k: v for k, v in node.items() if k not in drop}

    return _walk_schema(copy.deepcopy(schema), visit)
