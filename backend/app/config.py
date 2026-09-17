"""Runtime configuration, read once from the environment.

Every setting has a sensible default so the app boots without a .env file;
only the provider API key is genuinely required, and it is validated lazily
so that the server still starts (and serves the frontend) without one.
"""

import os
from typing import Optional

from dotenv import load_dotenv

# Load backend/.env, then fall back to a .env at the repo root.
_HERE = os.path.dirname(os.path.abspath(__file__))
_BACKEND_DIR = os.path.dirname(_HERE)
_ROOT_DIR = os.path.dirname(_BACKEND_DIR)

load_dotenv(os.path.join(_BACKEND_DIR, ".env"))
load_dotenv(os.path.join(_ROOT_DIR, ".env"))


def _env(name: str, default: str = "") -> str:
    value = os.getenv(name)
    return default if value is None or value.strip() == "" else value.strip()


class Settings:
    """Plain settings object — no magic, easy to print and to test."""

    # Which adapter in app/llm/ handles generation: gemini | anthropic | openai
    provider: str = _env("LLM_PROVIDER", "gemini").lower()

    # Per-provider model + key. Only the active provider's key is required.
    gemini_api_key: str = _env("GEMINI_API_KEY")
    gemini_model: str = _env("GEMINI_MODEL", "gemini-3.6flash")

    anthropic_api_key: str = _env("ANTHROPIC_API_KEY")
    anthropic_model: str = _env("ANTHROPIC_MODEL", "claude-sonnet-5")

    openai_api_key: str = _env("OPENAI_API_KEY")
    openai_model: str = _env("OPENAI_MODEL", "gpt-4o")

    # Shared generation knobs.
    temperature: float = float(_env("LLM_TEMPERATURE", "0.4"))
    max_output_tokens: int = int(_env("LLM_MAX_OUTPUT_TOKENS", "32768"))
    request_timeout: float = float(_env("LLM_REQUEST_TIMEOUT", "180"))

    # Upload limits for document extraction.
    max_upload_bytes: int = int(_env("MAX_UPLOAD_BYTES", str(10 * 1024 * 1024)))
    max_extracted_chars: int = int(_env("MAX_EXTRACTED_CHARS", "40000"))

    # Comma-separated list; "*" allows any origin (fine for local dev).
    cors_origins: str = _env("CORS_ORIGINS", "*")

    host: str = _env("HOST", "127.0.0.1")
    port: int = int(_env("PORT", "8000"))

    def api_key_for(self, provider: Optional[str] = None) -> str:
        name = (provider or self.provider).lower()
        return {
            "gemini": self.gemini_api_key,
            "anthropic": self.anthropic_api_key,
            "openai": self.openai_api_key,
        }.get(name, "")

    def model_for(self, provider: Optional[str] = None) -> str:
        name = (provider or self.provider).lower()
        return {
            "gemini": self.gemini_model,
            "anthropic": self.anthropic_model,
            "openai": self.openai_model,
        }.get(name, "")


settings = Settings()
