/* Generic field rendering for steps that declare a plain `fields` array. */

import { state } from '../state.js';
import { extractDocument } from '../api.js';
import { updateDraft } from './draft.js';
import { showToast } from './toast.js';

export function buildField(field) {
  const wrap = document.createElement('div');
  wrap.className = 'field';

  const label = document.createElement('label');
  label.className = 'q';
  label.textContent = field.q;
  wrap.appendChild(label);

  if (field.hint) {
    const hint = document.createElement('div');
    hint.className = 'hint';
    hint.textContent = field.hint;
    wrap.appendChild(hint);
  }

  const builders = {
    text: buildTextInput,
    number: buildNumberInput,
    textarea: buildTextarea,
    select: buildSelect,
    file: buildFileInput
  };

  const builder = builders[field.type];
  if (builder) wrap.appendChild(builder(field));

  return wrap;
}

function bind(el, key) {
  el.addEventListener('input', e => {
    state[key] = e.target.value;
    updateDraft();
  });
  return el;
}

function buildTextInput(field) {
  const input = document.createElement('input');
  input.type = 'text';
  input.value = state[field.key];
  return bind(input, field.key);
}

function buildNumberInput(field) {
  const input = document.createElement('input');
  input.type = 'number';
  input.min = '0';
  input.value = state[field.key];
  return bind(input, field.key);
}

function buildTextarea(field) {
  const textarea = document.createElement('textarea');
  textarea.value = state[field.key];
  return bind(textarea, field.key);
}

function buildSelect(field) {
  const select = document.createElement('select');
  field.options.forEach(option => {
    const el = document.createElement('option');
    el.value = option;
    el.textContent = option;
    if (option === state[field.key]) el.selected = true;
    select.appendChild(el);
  });
  select.addEventListener('change', e => {
    state[field.key] = e.target.value;
    updateDraft();
  });
  return select;
}

/* Uploads the file, stores both its name and the text the backend extracted.
   The text is what actually reaches the model — without it an attachment is
   just a filename the model can't read. */
function buildFileInput(field) {
  const attachment = state[field.key] || { name: '', text: '' };

  const box = document.createElement('div');
  box.className = 'upload';
  box.innerHTML =
    `<span class="fname">${attachment.name || 'No file attached'}</span>
     <label class="btn-mini">Choose file<input type="file" accept=".pdf,.docx,.txt,.md,.csv"></label>`;

  const nameEl = box.querySelector('.fname');
  const input = box.querySelector('input[type=file]');

  input.addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;

    nameEl.textContent = `Reading ${file.name}…`;

    try {
      const result = await extractDocument(file);
      state[field.key] = { name: result.name, text: result.text };
      nameEl.textContent = result.truncated
        ? `${result.name} — read, trimmed to ${result.characters.toLocaleString()} characters`
        : `${result.name} — ${result.characters.toLocaleString()} characters read`;
      showToast(`Read ${result.name}.`);
    } catch (err) {
      state[field.key] = { name: '', text: '' };
      nameEl.textContent = 'No file attached';
      showToast(err.message);
    }

    /* Reset so re-picking the same file fires `change` again. */
    input.value = '';
    updateDraft();
  });

  return box;
}
