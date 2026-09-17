"""Google Gemini adapter — the default provider.

Uses the Generative Language REST API directly rather than the SDK, so that
all three adapters share one HTTP client and no vendor SDK can drift out from
under us.
"""

from typing import Any, Dict

import httpx

from .base import LLMError, LLMProvider, parse_json_response, without_keys

API_ROOT = "https://generativelanguage.googleapis.com/v1beta"

# responseSchema supports only a subset of JSON Schema; anything else 400s.
UNSUPPORTED_KEYWORDS = ("additionalProperties", "$schema", "default", "examples")


class GeminiProvider(LLMProvider):
    name = "gemini"

    def generate_json(self, system: str, user: str,
                      schema: Dict[str, Any]) -> Dict[str, Any]:
        url = "%s/models/%s:generateContent" % (API_ROOT, self.model)
        payload = {
            "systemInstruction": {"parts": [{"text": system}]},
            "contents": [{"role": "user", "parts": [{"text": user}]}],
            "generationConfig": {
                "responseMimeType": "application/json",
                "responseSchema": without_keys(schema, UNSUPPORTED_KEYWORDS),
                "temperature": self.temperature,
                "maxOutputTokens": self.max_output_tokens,
            },
        }

        try:
            response = httpx.post(
                url,
                json=payload,
                headers={
                    "x-goog-api-key": self.api_key,
                    "content-type": "application/json",
                },
                timeout=self.timeout,
            )
        except httpx.RequestError as exc:
            raise LLMError("Could not reach Gemini: %s" % exc, provider=self.name)

        if response.status_code >= 400:
            raise LLMError(
                "Gemini returned %s: %s"
                % (response.status_code, _error_detail(response)),
                provider=self.name,
                status=502 if response.status_code >= 500 else 400,
            )

        body = response.json()
        candidates = body.get("candidates") or []
        if not candidates:
            blocked = (body.get("promptFeedback") or {}).get("blockReason")
            raise LLMError(
                "Gemini returned no candidates%s."
                % (" (blocked: %s)" % blocked if blocked else ""),
                provider=self.name,
            )

        candidate = candidates[0]
        if candidate.get("finishReason") == "MAX_TOKENS":
            raise LLMError(
                "Gemini hit the output token limit before finishing the rubric. "
                "Raise LLM_MAX_OUTPUT_TOKENS and try again.",
                provider=self.name,
            )

        parts = (candidate.get("content") or {}).get("parts") or []
        text = "".join(p.get("text", "") for p in parts)
        return parse_json_response(text, self.name)


def _error_detail(response: httpx.Response) -> str:
    try:
        return (response.json().get("error") or {}).get("message", response.text[:300])
    except ValueError:
        return response.text[:300]
