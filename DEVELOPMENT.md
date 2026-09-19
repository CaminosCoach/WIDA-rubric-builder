# Developer guide

[Back to README](README.md)

## Generation flow

The frontend collects answers in [state.js](frontend/js/state.js) and sends
the brief to `POST /api/rubric/generate`. The backend builds prompts, calls the
selected provider, and normalizes the rubric for rendering and export.

| File | Responsibility |
|------|----------------|
| [models.py](backend/app/models.py) | Request and response models |
| [schema.py](backend/app/schema.py) | JSON Schema sent to providers |
| [prompt.py](backend/app/services/prompt.py) | WIDA framing, progression guidance, and calibration example |
| [validate.py](backend/app/services/validate.py) | Normalization and brief-derived metadata |
| [render.js](frontend/js/output/render.js) | Browser rendering |
| [docx_export.py](backend/app/services/docx_export.py) | Word document generation |

For rubric wording and instructional guidance, start with `prompt.py`.
`LLM_TEMPERATURE` controls generation variation. Check normalization and rendering
when investigating missing rows or vocabulary examples.

## Vocabulary assignment

The schema requests a `vocabularyLadder` of 18 terms, ordered from concrete to
abstract. The prompt asks for teacher vocabulary toward the upper end and
concrete terms from the supplied anchor text where available.

In `validate.py`, `_ladder` removes case-insensitive duplicates and appends
missing teacher vocabulary. `_bands` partitions the resulting list across six
levels. `_examples_for` selects lower terms for expressive examples and upper
terms for interpretive examples.

Normal three-term bands keep examples separate across levels. This is not an
unconditional guarantee: short ladders can share terms, and a one-term band can
borrow an interpretive example from the next level. The model determines the
semantic ordering.

`LADDER_RUNGS` in `schema.py` controls the requested ladder length. Keep it
divisible by six for equal initial bands. `_examples_for` controls the number
of examples printed per row.

## Adding a provider

1. Add an adapter under `backend/app/llm/` subclassing `LLMProvider` and
   implementing `generate_json(system, user, schema) -> dict`.
2. Register it in `PROVIDERS` in [registry.py](backend/app/llm/registry.py).
3. Add key and model settings in [config.py](backend/app/config.py), including
   the mappings in `api_key_for` and `model_for`.

Each adapter translates the shared schema into its provider's request format.
Existing implementations use Gemini `responseSchema`, an Anthropic forced tool
call, and OpenAI strict `json_schema`. Schema helpers live in
[base.py](backend/app/llm/base.py).

## Documents and exports

[extraction.py](backend/app/services/extraction.py) reads PDF text, DOCX
paragraphs and tables, and plain-text files. It trims extracted text according
to `MAX_EXTRACTED_CHARS`. OCR is not implemented.

Word export uses `python-docx` on the server. PDF export uses `html2pdf` in the
browser to capture the rendered document.

## API

| Method | Path | Purpose |
|--------|------|---------|
| `GET`  | `/api/health` | Status, active provider, whether a key is set |
| `GET`  | `/api/rubric/providers` | Available adapters and their config state |
| `POST` | `/api/rubric/generate` | Brief in, rubric JSON out |
| `POST` | `/api/documents/extract` | Upload a file, get its text |
| `GET`  | `/api/documents/supported` | Allowed extensions and size limit |
| `POST` | `/api/export/docx` | Rubric JSON in, `.docx` out |

Interactive documentation is available at `/docs` on the running app.
