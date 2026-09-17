#!/usr/bin/env bash
# Start the Rubric Builder. Serves the API and the frontend on one port.
set -euo pipefail

cd "$(dirname "$0")"

PYTHON=".venv/bin/python"
if [ ! -x "$PYTHON" ]; then
  echo "No virtualenv found. Create one first:"
  echo "  python3 -m venv .venv"
  echo "  .venv/bin/pip install -r backend/requirements.txt"
  exit 1
fi

if [ ! -f .env ] && [ ! -f backend/.env ]; then
  echo "Warning: no .env file. Copy the template and add your API key:"
  echo "  cp .env.example .env"
  echo
fi

HOST="${HOST:-127.0.0.1}"
PORT="${PORT:-8000}"

echo "Rubric Builder → http://${HOST}:${PORT}"
echo "API docs       → http://${HOST}:${PORT}/docs"
echo

cd backend
exec "../$PYTHON" -m uvicorn app.main:app --host "$HOST" --port "$PORT" --reload
