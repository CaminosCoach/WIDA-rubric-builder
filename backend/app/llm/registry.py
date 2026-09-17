"""Provider lookup — the one place that maps a name to an adapter.

To add a provider: write an adapter in this package that subclasses
LLMProvider, then add one line to PROVIDERS. Nothing else in the codebase
changes.
"""

from typing import Dict, List, Optional, Type

from ..config import settings
from .anthropic import AnthropicProvider
from .base import LLMError, LLMProvider
from .gemini import GeminiProvider
from .openai import OpenAIProvider

PROVIDERS: Dict[str, Type[LLMProvider]] = {
    "gemini": GeminiProvider,
    "anthropic": AnthropicProvider,
    "openai": OpenAIProvider,
}


def available_providers() -> List[str]:
    return sorted(PROVIDERS.keys())


def get_provider(name: Optional[str] = None) -> LLMProvider:
    """Build the adapter for `name`, or for LLM_PROVIDER when name is omitted."""
    resolved = (name or settings.provider).lower()

    provider_cls = PROVIDERS.get(resolved)
    if provider_cls is None:
        raise LLMError(
            "Unknown provider '%s'. Available: %s."
            % (resolved, ", ".join(available_providers())),
            status=400,
        )

    return provider_cls(
        api_key=settings.api_key_for(resolved),
        model=settings.model_for(resolved),
        temperature=settings.temperature,
        max_output_tokens=settings.max_output_tokens,
        timeout=settings.request_timeout,
    )
