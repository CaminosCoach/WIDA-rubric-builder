"""POST /api/export/docx — a generated rubric in, a real Word file out."""

from typing import Any, Dict

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel

from ..services.docx_export import build_docx, build_filename

router = APIRouter(prefix="/api/export", tags=["export"])

DOCX_MIME = ("application/vnd.openxmlformats-officedocument"
             ".wordprocessingml.document")


class DocxRequest(BaseModel):
    rubric: Dict[str, Any]
    gradeLevel: str = ""


@router.post("/docx")
def export_docx(request: DocxRequest):
    if not request.rubric:
        raise HTTPException(status_code=400, detail="No rubric to export.")

    meta = request.rubric.get("meta") or {}

    try:
        data = build_docx(request.rubric, meta)
    except Exception as exc:  # noqa: BLE001 - surface the reason to the user
        raise HTTPException(
            status_code=500,
            detail="Could not build the Word document: %s" % exc,
        )

    filename = build_filename(request.gradeLevel)
    return Response(
        content=data,
        media_type=DOCX_MIME,
        headers={"Content-Disposition": 'attachment; filename="%s"' % filename},
    )
