/* Step 5 — how many English Learners, and at which WIDA levels. */

import { LEVEL_LABELS } from '../data/steps.js';
import { state } from '../state.js';
import { updateDraft } from './draft.js';

export function renderProficiencyStep(wrap) {
  const total = document.createElement('div');
  total.className = 'field prof-total';
  total.innerHTML = `<label class="q">How many English Learners are in the classroom?</label>`;

  const totalInput = document.createElement('input');
  totalInput.type = 'number';
  totalInput.min = '0';
  totalInput.value = state.totalELs;
  totalInput.addEventListener('input', e => {
    state.totalELs = e.target.value;
    updateRunningTotal();
    updateDraft();
  });
  total.appendChild(totalInput);
  wrap.appendChild(total);

  const levels = document.createElement('div');
  levels.className = 'field';
  levels.innerHTML = `<label class="q">Levels represented and how many per level</label>
    <div class="hint">Enter a count for each WIDA level present in the classroom. Leave at 0 if not represented.</div>`;

  const table = document.createElement('div');
  table.className = 'prof-table';

  [1, 2, 3, 4, 5, 6].forEach(level => {
    const row = document.createElement('div');
    row.className = 'prof-row';

    const label = document.createElement('div');
    label.className = 'lvl-label';
    label.textContent = LEVEL_LABELS[level];

    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.value = state.levelCounts[level];
    input.addEventListener('input', e => {
      state.levelCounts[level] = parseInt(e.target.value || '0', 10);
      updateRunningTotal();
      updateDraft();
    });

    row.appendChild(label);
    row.appendChild(input);
    table.appendChild(row);
  });

  levels.appendChild(table);

  const running = document.createElement('div');
  running.id = 'prof-running';
  levels.appendChild(running);
  wrap.appendChild(levels);

  updateRunningTotal();
}

/* Flags the case where the per-level counts don't add up to the stated total —
   a warning, not a block, since a teacher may still be entering them. */
function updateRunningTotal() {
  const el = document.getElementById('prof-running');
  if (!el) return;

  const entered = Object.values(state.levelCounts)
    .reduce((sum, count) => sum + (parseInt(count, 10) || 0), 0);
  const total = parseInt(state.totalELs, 10) || 0;

  el.className = 'prof-running ' + (entered === total && total > 0 ? 'match' : 'mismatch');
  el.textContent = total
    ? `Entered so far: ${entered} of ${total} English Learners.`
    : `Entered so far: ${entered} English Learners across levels.`;
}
