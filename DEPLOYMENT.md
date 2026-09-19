# Vercel deployment guide

[Back to README](README.md)

The README contains deployment steps and provider environment variables.

## Deployment files

| File | Purpose |
|------|---------|
| [asgi.py](asgi.py) | Adds `backend/` to the import path and exports the FastAPI `app` |
| [requirements.txt](requirements.txt) | Dependencies for the Python application |
| [vercel.json](vercel.json) | Requests a 300-second function duration and excludes legacy files, docs, the virtualenv, and Python caches from the function bundle |

The backend requirements file references the root dependency list. Vercel
recognizes root-level `asgi.py` as a FastAPI entry point. See
[FastAPI on Vercel](https://vercel.com/docs/frameworks/backend/fastapi).

## Frontend and API serving

[main.py](backend/app/main.py) registers `/api` routes before mounting
`frontend/` at `/`, so API routes take priority over the static mount.
Locally, uvicorn serves both.

Vercel promotes eligible FastAPI static mounts to its CDN at build time.
Static files behind middleware remain on the function, so middleware can
change how assets are served. See Vercel's
[static serving announcement](https://vercel.com/changelog/fastapi-frontends-and-static-files-served-from-the-cdn).

Leave `CORS_ORIGINS` unset: the frontend and API share an origin. The app only
attaches CORS middleware when allowed origins are configured.

## Uploads and request duration

Leave `MAX_UPLOAD_BYTES` unset to keep the application's 4 MiB upload limit.
Vercel limits function request and response payloads to 4.5 MB; multipart
uploads also include request overhead. Raising the application limit does not
raise the platform limit. Requests rejected at the platform boundary never
reach the app's error handling. See
[Vercel function limits](https://vercel.com/docs/functions/limitations).

Generation is synchronous. The repository requests a 300-second function
duration, while `LLM_REQUEST_TIMEOUT` defaults to 180 seconds for provider
requests. Check the deployed function's effective limits when investigating
timeouts; the configured duration does not guarantee completion.

## Access and verification

The app does not implement authentication or rate limiting for generation.
Restrict deployment access before sharing a URL that can spend provider credits.

After deployment, check `/api/health`, generate a sample rubric, and try the
upload and export flows. The health endpoint does not make a provider request;
a configured key alone does not confirm that the key and model work together.
