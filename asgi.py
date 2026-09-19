"""Vercel entrypoint.

Vercel auto-detects a FastAPI instance named `app` in a root-level `asgi.py`,
so this file exists only to put `backend/` on the import path and re-export the
real application. It mirrors what run.sh does locally (`cd backend`, then
`uvicorn app.main:app`), which keeps one import path for both environments.

Nothing else belongs in here. The app itself lives in backend/app/main.py.
"""

import os
import sys

_BACKEND = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
if _BACKEND not in sys.path:
    sys.path.insert(0, _BACKEND)

from app.main import app  # noqa: E402

__all__ = ["app"]
