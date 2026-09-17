/* The live document card on the right of the builder. */

import { state, combinedStandards, vocabularyList } from '../state.js';
import { escapeHTML } from '../util/html.js';

export function updateDraft() {
  document.getElementById('d-title').textContent =
    `${state.gradeLevel} End-of-Unit WIDA-Aligned Rubric`;

  const unit = [state.curriculumName, state.moduleUnit].filter(Boolean).join(' · ')
    || 'Unit not yet named';
  document.getElementById('d-meta').textContent =
    `${state.gradeLevel} · ${state.subjectArea} · ${unit}`;

  setText('d-fq', state.focusingQuestion);
  setText('d-discourse', state.discourse);
  setText('d-sentence', state.sentence);

  setTags('d-words', vocabularyList(), 'Not yet entered');
  setTags('d-standards', combinedStandards(), 'None selected', 'mono');
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (value && value.trim()) {
    el.textContent = value;
    el.classList.remove('empty');
  } else {
    el.textContent = 'Not yet entered';
    el.classList.add('empty');
  }
}

function setTags(id, values, emptyLabel, extraClass = '') {
  const el = document.getElementById(id);
  el.innerHTML = values.length
    ? values.map(v => `<span class="draft-tag ${extraClass}">${escapeHTML(v)}</span>`).join('')
    : `<span class="v empty">${emptyLabel}</span>`;
}
