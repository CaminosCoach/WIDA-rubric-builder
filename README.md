# Rubric Builder — WIDA-Aligned Language Rubrics

A six-step wizard that collects a teacher's unit brief and generates a complete
WIDA-aligned end-of-unit rubric with an LLM, then exports it to Word or PDF.

---

## Quick start

```bash
# 1. Install
python3 -m venv .venv
.venv/bin/pip install -r backend/requirements.txt

# 2. Configure — copy the template and paste in your key
cp .env.example .env
#    then edit .env and set GEMINI_API_KEY=...
#    Get a key at https://aistudio.google.com/apikey

# 3. Run
./run.sh
```

Then open **http://127.0.0.1:8000**.

The server serves both the API and the frontend, so there is only one thing to
start and no CORS to configure.

---

## What it does

A teacher answers six steps — learning goals, the task, standards, unit
context, and the WIDA levels present in their classroom — and the app sends
that brief to an LLM, which writes the rubric.

The generated document has eight sections:

| # | Section | Generated |
|---|---------|-----------|
| — | Task & context summary | From the form (not the model — see below) |
| 01 | Content objectives | LLM |
| 02 | Interpretive & expressive language objectives | LLM |
| 03 | Interpretive / Process rubric (6 levels × 3 dimensions) | LLM |
| 04 | Expressive / Product rubric (6 levels × 3 dimensions) | LLM |
| 05 | Content evidence checklist | LLM |
| 06 | Scaffolds & supports | LLM |
| 07 | Assumptions & implementation notes | LLM |

**The header is deliberately not model-generated.** Anchor text, unit,
standards, and EL counts are verbatim echoes of what the teacher typed. Asking
the model to restate them adds a chance it says "11 English Learners" when the
teacher entered 12, with no upside. Those fields are copied straight from the
brief in [`backend/app/services/validate.py`](backend/app/services/validate.py).

---

## Project layout

```
.
├── run.sh                       Start the server
├── .env.example                 Config template — copy to .env
│
├── frontend/                    Static; no build step, no bundler
│   ├── index.html               Page shell and markup
│   ├── css/
│   │   ├── tokens.css           Colour variables, reset, typography
│   │   ├── builder.css          Wizard: header, stepper, fields, draft card
│   │   ├── output.css           Generated document, tables, overlay
│   │   └── responsive.css       Breakpoints
│   └── js/
│       ├── main.js              Entry point: step state, view switching
│       ├── config.js            API endpoint URLs
│       ├── state.js             The teacher's answers + derived helpers
│       ├── api.js               Every backend call
│       ├── data/
│       │   ├── standards.js     Georgia ELA standards tree
│       │   └── steps.js         Step definitions and option lists
│       ├── ui/                  One module per step, plus draft/toast/stepper
│       ├── output/              Rubric renderer and the two exports
│       └── util/html.js         HTML escaping
│
├── backend/
│   ├── requirements.txt
│   └── app/
│       ├── main.py              FastAPI app; serves API + frontend
│       ├── config.py            Environment settings
│       ├── models.py            Request/response models
│       ├── schema.py            The rubric JSON contract
│       ├── routes/              rubric.py · documents.py · export.py
│       ├── services/
│       │   ├── prompt.py        Brief → system + user prompt
│       │   ├── validate.py      Repairs and normalizes model output
│       │   ├── extraction.py    PDF/DOCX/TXT → plain text
│       │   └── docx_export.py   Rubric → real .docx
│       └── llm/                 Swappable providers (see below)
│
└── legacy/
    └── wida-rubric-builder.original.html   The original single file, kept for reference
```

---

## Switching LLM providers

Three adapters ship: **Gemini** (default), **Anthropic Claude**, and **OpenAI**.
Switch by editing one line in `.env`:

```bash
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
```

No code changes. `GET /api/rubric/providers` reports which ones have a key.

### Adding a fourth provider

Nothing above `app/llm/` knows which vendor answered. Adding one is two steps:

1. Write `app/llm/yourprovider.py` subclassing `LLMProvider` and implementing
   `generate_json(system, user, schema) -> dict`.
2. Add one line to `PROVIDERS` in [`app/llm/registry.py`](backend/app/llm/registry.py).

Each adapter is responsible for translating the shared JSON Schema in
`schema.py` into its own structured-output dialect — Gemini uses
`responseSchema`, Claude a forced tool call, OpenAI strict `json_schema`. The
helpers for that (`strictify`, `without_keys`) live in `app/llm/base.py`.

---

## Where the rubric quality lives

Almost all of it is in
[`backend/app/services/prompt.py`](backend/app/services/prompt.py). That file
holds the WIDA framing, the rule that content and language are never averaged,
the level-by-level progression guidance, and a worked example used purely to
calibrate tone and specificity. **If the output isn't right, edit that file
first** — it will move the results far more than changing models will.

`LLM_TEMPERATURE` in `.env` controls variation: lower is more consistent
between runs, higher is more varied wording.

### The vocabulary ladder

The example terms printed under each Word/Phrase descriptor are **not** chosen by
the model row by row — that produced `culture` at levels 1, 2, 3 and 5, because
nothing stopped it.

Instead the model first returns `vocabularyLadder`: 18 terms ranked from most
concrete to most abstract. The teacher's own words sit in the upper half; the
lower rungs are mined from the anchor text, so an Entering student's examples are
words they can attach to a picture rather than the unit's academic targets.
[`validate.py`](backend/app/services/validate.py) then cuts that ladder into six
non-overlapping bands and assigns each level's terms by position.

Because the bands don't overlap, **a term cannot appear at two levels of the same
table** — that is a structural guarantee, not a prompt instruction. Each level's
two tables take different slices of its band: interpretive the upper one,
expressive the lower, since students recognize vocabulary before they can produce
it.

The model does the semantic judgment (which word is more abstract); the code does
the assignment. To change how many terms print per level, edit `_examples_for`;
to change the ladder length, edit `LADDER_RUNGS` in
[`schema.py`](backend/app/schema.py) — it must stay divisible by 6.

---

## Exports

- **Word** — built server-side by `python-docx` as a genuine `.docx`, with real
  tables and shaded level cells.
- **PDF** — rendered client-side by html2pdf from the page itself, so the PDF
  matches what's on screen.

---

## API

| Method | Path | Purpose |
|--------|------|---------|
| `GET`  | `/api/health` | Status, active provider, whether a key is set |
| `GET`  | `/api/rubric/providers` | Available adapters and their config state |
| `POST` | `/api/rubric/generate` | Brief in, rubric JSON out |
| `POST` | `/api/documents/extract` | Upload a file, get its text |
| `GET`  | `/api/documents/supported` | Allowed extensions and size limit |
| `POST` | `/api/export/docx` | Rubric JSON in, `.docx` out |

Interactive docs while the server is running: http://127.0.0.1:8000/docs

---

## Uploaded documents

Attaching an existing rubric, an exemplar, or the anchor text now means
something: the file is uploaded, its text extracted server-side, and that text
included in the prompt. PDF, DOCX, and plain text are supported, and DOCX table
cells are read (existing rubrics are nearly always tables).

Scanned PDFs are images and will fail with a message saying so — they would
need OCR, which isn't wired up.

Text is trimmed to `MAX_EXTRACTED_CHARS` (default 40,000) before being sent.

---

## Notes and limits

- The guided standards picker covers **Georgia ELA** only. Other subjects fall
  back to typing codes manually; the standards tree is in
  `frontend/js/data/standards.js`.
- The wizard ships with a filled-in Lewis & Clark example so the flow can be
  tried immediately. Clear those defaults in `frontend/js/state.js` before real
  use.
- Generation takes roughly 20–60 seconds. The overlay stays up, and a failure
  leaves a retry button rather than dropping back to a blank screen.
- Output is a locally developed instructional tool, **not** an official WIDA
  assessment or ACCESS score. A teacher should read every descriptor before use.
- `.env` is gitignored. Keep it that way — the key stays server-side and is
  never sent to the browser.
