/* Every call to the backend goes through here. */

import { ENDPOINTS } from './config.js';

/* FastAPI puts the human-readable reason in `detail`; surface that rather
   than a bare status code, since these messages are shown to teachers. */
async function readError(response, fallback) {
  try {
    const body = await response.json();
    if (typeof body.detail === 'string') return body.detail;
    if (Array.isArray(body.detail) && body.detail.length) {
      return body.detail.map(d => d.msg || JSON.stringify(d)).join('; ');
    }
  } catch (err) {
    /* Non-JSON error body — fall through to the generic message. */
  }
  return `${fallback} (HTTP ${response.status})`;
}

export async function checkHealth() {
  const response = await fetch(ENDPOINTS.health);
  if (!response.ok) throw new Error(await readError(response, 'Server not reachable'));
  return response.json();
}

/* Uploads one file and returns { name, text, characters, truncated }. */
export async function extractDocument(file) {
  const form = new FormData();
  form.append('file', file);

  const response = await fetch(ENDPOINTS.extract, { method: 'POST', body: form });
  if (!response.ok) throw new Error(await readError(response, 'Could not read that file'));
  return response.json();
}

/* Sends the brief and returns { rubric, provider, model }. */
export async function generateRubric(brief, provider) {
  const response = await fetch(ENDPOINTS.generate, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ brief, provider: provider || null })
  });
  if (!response.ok) throw new Error(await readError(response, 'Rubric generation failed'));
  return response.json();
}

/* Returns a Blob of a real .docx, built server-side by python-docx. */
export async function exportDocx(rubric, gradeLevel) {
  const response = await fetch(ENDPOINTS.exportDocx, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rubric, gradeLevel })
  });
  if (!response.ok) throw new Error(await readError(response, 'Word export failed'));
  return response.blob();
}
