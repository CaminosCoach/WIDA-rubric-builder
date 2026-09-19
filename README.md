# Rubric Builder - WIDA-Aligned Language Rubrics

A six-step wizard that turns a teacher's unit brief into a WIDA-aligned
language rubric, with Word and PDF exports.

## What it does

Enter learning goals, task instructions, standards, unit context, and student
proficiency levels. The app generates content and language objectives,
interpretive and expressive rubrics, a content evidence checklist, scaffolds,
and implementation notes. Task metadata is copied from the teacher's brief.

Attach PDF, DOCX, or plain-text documents to include their extracted text.
Download the result as Word or export the displayed rubric to PDF.

## Deploy to Vercel

1. Import the repository into Vercel. Use the directory containing `asgi.py`,
   `requirements.txt`, and `vercel.json` as the project root.
2. Set these environment variables for the deployment:

   ```text
   LLM_PROVIDER=gemini
   GEMINI_API_KEY=your-api-key
   ```

3. Leave `CORS_ORIGINS` and `MAX_UPLOAD_BYTES` unset to use the app's defaults.
4. Deploy, then open `/api/health` on the deployment URL to check the provider
   and key configuration. Generate a rubric to verify the provider connection.

The generation endpoint has no authentication or rate limiting and uses your
provider account. Restrict access before sharing the deployment publicly.

See the [deployment guide](DEPLOYMENT.md) for hosting details and limits.

## Provider configuration

Set `LLM_PROVIDER` and its matching API key in Vercel's environment variables.
Override the model with the corresponding model variable when needed.

| Provider | `LLM_PROVIDER` | API key variable | Model variable |
|----------|----------------|------------------|----------------|
| Gemini (default) | `gemini` | `GEMINI_API_KEY` | `GEMINI_MODEL` |
| Anthropic | `anthropic` | `ANTHROPIC_API_KEY` | `ANTHROPIC_MODEL` |
| OpenAI | `openai` | `OPENAI_API_KEY` | `OPENAI_MODEL` |

Redeploy after changing deployment environment variables. Keep keys on the
server; do not put them in frontend files or commit them to Git.

## Local development

For macOS or Linux, run from the repository root:

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

Create a `.env` file in the repository root with the provider settings above,
then run `./run.sh`. Open **http://127.0.0.1:8000**. The same server serves the
frontend and API.


## Project and developer documentation

- `frontend/` - static HTML, CSS, and JavaScript; no frontend build step.
- `backend/` - FastAPI routes, provider adapters, and document services.
- `asgi.py`, `requirements.txt`, `vercel.json` - deployment entry point,
  dependencies, and function configuration.
- [Developer guide](DEVELOPMENT.md) - generation, vocabulary assignment,
  provider extensions, and API endpoints.
- [Deployment guide](DEPLOYMENT.md) - Vercel configuration and serving behavior.

Interactive API documentation is available at `/docs` on the running app.
