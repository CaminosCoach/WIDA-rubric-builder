"""FastAPI entry point.

Serves the JSON API under /api and the static frontend at /, so the whole app
runs from one origin and one command in local development.
"""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import settings
from .routes import documents, export, rubric

app = FastAPI(
    title="WIDA Rubric Builder API",
    description="Generates WIDA-aligned language rubrics from a teacher's brief.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",") if o.strip()],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(rubric.router)
app.include_router(documents.router)
app.include_router(export.router)


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "provider": settings.provider,
        "model": settings.model_for(),
        "keyConfigured": bool(settings.api_key_for()),
    }


# Mounted last so /api routes win. The frontend lives outside the backend
# package, one level up from backend/.
_FRONTEND_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "frontend",
)

if os.path.isdir(_FRONTEND_DIR):
    app.mount("/", StaticFiles(directory=_FRONTEND_DIR, html=True), name="frontend")
