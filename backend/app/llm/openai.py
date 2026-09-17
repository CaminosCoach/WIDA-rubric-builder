"""OpenAI adapter.

Uses Chat Completions with strict json_schema response formatting, which needs
additionalProperties:false and a complete `required` list on every object —
that is what strictify() in base.py produces.
"""

from typing import Any, Dict

import httpx

from .base import LLMError, LLMProvider, parse_json_response, strictify

API_URL = "https://api.openai.com/v1/chat/completions"


class OpenAIProvider(LLMProvider):
    name = "openai"

    def generate_json(self, system: str, user: str,
                      schema: Dict[str, Any]) -> Dict[str, Any]:
        payload = {
            "model": self.model,
            "temperature": self.temperature,
            "max_tokens": self.max_output_tokens,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            "response_format": {
                "type": "json_schema",
                "json_schema": {
                    "name": "wida_rubric",
                    "strict": True,
                    "schema": strictify(schema),
                },
            },
        }

        try:
            response = httpx.post(
                API_URL,
                json=payload,
                headers={
                    "authorization": "Bearer %s" % self.api_key,
                    "content-type": "application/json",
                },
                timeout=self.timeout,
            )
        except httpx.RequestError as exc:
            raise LLMError("Could not reach OpenAI: %s" % exc, provider=self.name)

        if response.status_code >= 400:
            raise LLMError(
                "OpenAI returned %s: %s"
                % (response.status_code, _error_detail(response)),
                provider=self.name,
                status=502 if response.status_code >= 500 else 400,
            )

        body = response.json()
        choices = body.get("choices") or []
        if not choices:
            raise LLMError("OpenAI returned no choices.", provider=self.name)

        choice = choices[0]
        if choice.get("finish_reason") == "length":
            raise LLMError(
                "OpenAI hit the output token limit before finishing the rubric. "
                "Raise LLM_MAX_OUTPUT_TOKENS and try again.",
                provider=self.name,
            )

        content = (choice.get("message") or {}).get("content") or ""
        return parse_json_response(content, self.name)


def _error_detail(response: httpx.Response) -> str:
    try:
        return (response.json().get("error") or {}).get("message", response.text[:300])
    except ValueError:
        return response.text[:300]
