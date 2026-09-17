/* Where the API lives.
   Empty string means "same origin as this page", which is the case when the
   FastAPI server serves the frontend. Point this at http://127.0.0.1:8000 if
   you ever serve the frontend from a separate dev server. */
export const API_BASE = '';

export const ENDPOINTS = {
  health:     `${API_BASE}/api/health`,
  providers:  `${API_BASE}/api/rubric/providers`,
  generate:   `${API_BASE}/api/rubric/generate`,
  extract:    `${API_BASE}/api/documents/extract`,
  exportDocx: `${API_BASE}/api/export/docx`
};
