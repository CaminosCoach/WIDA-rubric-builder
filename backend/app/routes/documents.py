"""POST /api/documents/extract — uploaded file in, plain text out."""

from fastapi import APIRouter, File, HTTPException, UploadFile

from ..config import settings
from ..models import ExtractResponse
from ..services.extraction import (SUPPORTED_EXTENSIONS, ExtractionError,
                                   extract_text)

router = APIRouter(prefix="/api/documents", tags=["documents"])


@router.get("/supported")
def supported():
    return {"extensions": list(SUPPORTED_EXTENSIONS),
            "maxBytes": settings.max_upload_bytes}


@router.post("/extract", response_model=ExtractResponse)
async def extract(file: UploadFile = File(...)):
    data = await file.read()

    if not data:
        raise HTTPException(status_code=400, detail="That file is empty.")

    if len(data) > settings.max_upload_bytes:
        raise HTTPException(
            status_code=413,
            detail="That file is %.1f MB; the limit is %.0f MB."
                   % (len(data) / 1_048_576, settings.max_upload_bytes / 1_048_576),
        )

    try:
        text, truncated = extract_text(
            file.filename or "", data, settings.max_extracted_chars)
    except ExtractionError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return ExtractResponse(
        name=file.filename or "",
        text=text,
        characters=len(text),
        truncated=truncated,
    )
