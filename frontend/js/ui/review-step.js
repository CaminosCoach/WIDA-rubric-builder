/* Step 6 — the assembled brief, with a jump-back link on each group. */

import { LEVEL_LABELS } from '../data/steps.js';
import { state, combinedStandards } from '../state.js';

/* Set by main.js so an Edit link can move the wizard. */
let goToStep = () => {};
export function setStepNavigator(fn) { goToStep = fn; }

export function renderReviewStep(wrap) {
  reviewGroups().forEach(group => {
    const el = document.createElement('div');
    el.className = 'review-group';

    const head = document.createElement('div');
    head.className = 'review-group-head';
    head.innerHTML = `<h4>${group.title}</h4>`;

    const edit = document.createElement('button');
    edit.className = 'edit-link';
    edit.type = 'button';
    edit.textContent = 'Edit';
    edit.addEventListener('click', () => goToStep(group.stepIndex));
    head.appendChild(edit);
    el.appendChild(head);

    const rows = document.createElement('div');
    rows.className = 'review-rows';
    group.rows.forEach(([key, value]) => {
      const row = document.createElement('div');
      row.className = 'rrow';
      row.innerHTML = `<div class="rk">${key}</div><div class="rv">${value || '—'}</div>`;
      rows.appendChild(row);
    });
    el.appendChild(rows);

    wrap.appendChild(el);
  });
}

/* An attachment reads as its filename plus how much text we actually got —
   a teacher should be able to see at a glance that the file was read. */
function attachmentLabel(attachment) {
  if (!attachment || !attachment.name) return '—';
  if (!attachment.text) return `${attachment.name} (no text read)`;
  return `${attachment.name} — ${attachment.text.length.toLocaleString()} characters read`;
}

function reviewGroups() {
  return [
    { title: "Learning goal", stepIndex: 0, rows: [
      ["End-of-unit product", state.discourse],
      ["Sentence structures", state.sentence],
      ["Key vocabulary", state.words]
    ]},
    { title: "Task & product", stepIndex: 1, rows: [
      ["Instructions", state.instructions],
      ["Focusing question", state.focusingQuestion],
      ["Existing rubric", attachmentLabel(state.existingRubric)],
      ["Exemplar", attachmentLabel(state.exemplar)]
    ]},
    { title: "Standards", stepIndex: 2, rows: [
      ["Subject / Grade", `${state.subjectArea} · ${state.gradeLevel}`],
      ["Standards selected", combinedStandards().join(', ') || '—']
    ]},
    { title: "Unit context", stepIndex: 3, rows: [
      ["Curriculum", state.curriculumName],
      ["Module / unit", state.moduleUnit],
      ["Anchor text", state.anchorText],
      ["Anchor text file", attachmentLabel(state.anchorTextFile)],
      ["Prerequisite skills", state.prerequisiteSkills],
      ["Skills to acquire", state.skillsAcquired]
    ]},
    { title: "Student language proficiency", stepIndex: 4, rows: [
      ["Total English Learners", state.totalELs || '—'],
      ["Levels represented", [1, 2, 3, 4, 5, 6]
        .filter(n => state.levelCounts[n] > 0)
        .map(n => `${LEVEL_LABELS[n]}: ${state.levelCounts[n]}`)
        .join(' · ') || '—']
    ]}
  ];
}
