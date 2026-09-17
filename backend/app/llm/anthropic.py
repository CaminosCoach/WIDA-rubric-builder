"""Anthropic Claude adapter.

Structured output is done by forcing a single tool call whose input_schema is
the rubric schema — the most reliable way to get schema-valid JSON out of the
Messages API.
"""

from typing import Any, Dict

import httpx

from .base import LLMError, LLMProvider

API_URL = "https://api.anthropic.com/v1/messages"
API_VERSION = "2023-06-01"
TOOL_NAME = "emit_rubric"


class AnthropicProvider(LLMProvider):
    name = "anthropic"

    def generate_json(self, system: str, user: str,
                      schema: Dict[str, Any]) -> Dict[str, Any]:
        payload = {
            "model": self.model,
            "max_tokens": self.max_output_tokens,
            "temperature": self.temperature,
            "system": system,
            "messages": [{"role": "user", "content": user}],
            "tools": [{
                "name": TOOL_NAME,
                "description": "Return the completed WIDA-aligned rubric.",
                "input_schema": schema,
            }],
            "tool_choice": {"type": "tool", "name": TOOL_NAME},
        }

        try:
            response = httpx.post(
                API_URL,
                json=payload,
                headers={
                    "x-api-key": self.api_key,
                    "anthropic-version": API_VERSION,
                    "content-type": "application/json",
                },
                timeout=self.timeout,
            )
        except httpx.RequestError as exc:
            raise LLMError("Could not reach Anthropic: %s" % exc, provider=self.name)

        if response.status_code >= 400:
            raise LLMError(
                "Anthropic returned %s: %s"
                % (response.status_code, _error_detail(response)),
                provider=self.name,
                status=502 if response.status_code >= 500 else 400,
            )

        body = response.json()
        if body.get("stop_reason") == "max_tokens":
            raise LLMError(
                "Claude hit the output token limit before finishing the rubric. "
                "Raise LLM_MAX_OUTPUT_TOKENS and try again.",
                provider=self.name,
            )

        for block in body.get("content") or []:
            if block.get("type") == "tool_use" and block.get("name") == TOOL_NAME:
                return block.get("input") or {}

        raise LLMError(
            "Claude did not call the rubric tool; no structured output returned.",
            provider=self.name,
        )


def _error_detail(response: httpx.Response) -> str:
    try:
        return (response.json().get("error") or {}).get("message", response.text[:300])
    except ValueError:
        return response.text[:300]
