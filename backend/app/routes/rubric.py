"""POST /api/rubric/generate — the brief goes in, the rubric comes out."""

from fastapi import APIRouter, HTTPException

from ..config import settings
from ..llm import LLMError, available_providers, get_provider
from ..models import GenerateRequest, GenerateResponse
from ..schema import RUBRIC_SCHEMA
from ..services.prompt import build_system_prompt, build_user_prompt
from ..services.validate import normalize_rubric

router = APIRouter(prefix="/api/rubric", tags=["rubric"])


@router.get("/providers")
def providers():
    """Which adapters exist, and which of them have a key configured."""
    return {
        "active": settings.provider,
        "providers": [
            {
                "name": name,
                "model": settings.model_for(name),
                "configured": bool(settings.api_key_for(name)),
            }
            for name in available_providers()
        ],
    }


@router.post("/generate", response_model=GenerateResponse)
def generate(request: GenerateRequest):
    brief = request.brief

    if not brief.focusingQuestion.strip() and not brief.discourse.strip():
        raise HTTPException(
            status_code=400,
            detail="The brief needs at least a focusing question or an "
                   "end-of-unit product before a rubric can be built.",
        )

    try:
        provider = get_provider(request.provider)
    except LLMError as exc:
        raise HTTPException(status_code=exc.status, detail=exc.message)

    try:
        raw = provider.generate_json(
            system=build_system_prompt(),
            user=build_user_prompt(brief),
            schema=RUBRIC_SCHEMA,
        )
    except LLMError as exc:
        raise HTTPException(status_code=exc.status, detail=exc.message)

    return GenerateResponse(
        rubric=normalize_rubric(raw, brief),
        provider=provider.name,
        model=provider.model,
    )
