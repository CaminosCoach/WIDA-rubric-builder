/* Renders a generated rubric into the output document.

   Everything here reads from the JSON the backend returned — the shape is
   defined once in backend/app/schema.py. The only content invented on this
   side is presentational: section numbers, headings, and bolding the teacher's
   vocabulary where it appears in the Word/Phrase column. */

import { RUBRIC_SECTIONS } from '../data/steps.js';
import { vocabularyList } from '../state.js';
import { escapeHTML, escapeRegExp } from '../util/html.js';

export function renderRubric(rubric) {
  const meta = rubric.meta || {};
  const doc = document.getElementById('out-doc');

  doc.innerHTML = [
    renderHeader(rubric, meta),
    renderContentObjectives(rubric.contentObjectives),
    renderLanguageObjectives(rubric.languageObjectives),
    renderRubricSection('interpretive-rubric', '03', 'Interpretive / Process rubric',
                        rubric.interpretiveRubric),
    renderRubricSection('expressive-rubric', '04', 'Expressive / Product rubric',
                        rubric.expressiveRubric),
    renderContentEvidence(rubric.contentEvidence),
    renderScaffolds(rubric.scaffolds),
    renderAssumptions(rubric.assumptions)
  ].join('');

  populateJumpMenu();
}

function section(id, number, title, note, body) {
  return `
    <section class="out-section" id="${id}">
      <div class="sec-head"><span class="sec-num">${number}</span><h2 class="sec-title">${escapeHTML(title)}</h2></div>
      ${note ? `<p class="sec-note">${escapeHTML(note)}</p>` : ''}
      ${body}
    </section>`;
}

function renderHeader(rubric, meta) {
  const items = [
    ['Anchor text', meta.anchorText],
    ['Unit', meta.unit],
    ['Standards', meta.standards],
    ['English Learners', meta.englishLearners]
  ];

  return `
    <div class="out-header" id="task-summary">
      <div class="out-kicker">${escapeHTML(meta.kicker)}</div>
      <h1 class="out-h1">${escapeHTML(rubric.title)}</h1>
      <p class="out-fq"><b>Focusing question:</b> ${escapeHTML(meta.focusingQuestion)}</p>
      <div class="out-meta-row">
        ${items.map(([label, value]) => `
          <div class="out-meta-item">
            <div class="lbl">${label}</div>
            <div class="val">${escapeHTML(value || '—')}</div>
          </div>`).join('')}
      </div>
    </div>`;
}

function renderContentObjectives(data = {}) {
  const items = (data.items || []).map(item => `
    <li>
      <span class="co-left">${escapeHTML(item.label)}</span>
      <span class="co-right">${escapeHTML(item.detail)}</span>
    </li>`).join('');

  return section('content-objectives', '01', 'Content objectives', data.note,
                 `<ul class="content-obj-list">${items}</ul>`);
}

function renderLanguageObjectives(data = {}) {
  const column = (col = {}) => `
    <div class="obj-col">
      <h4>${escapeHTML(col.heading)}</h4>
      <div class="obj-dim"><div class="dname">Discourse</div><div class="dtext">${escapeHTML(col.discourse)}</div></div>
      <div class="obj-dim"><div class="dname">Sentence</div><div class="dtext">${escapeHTML(col.sentence)}</div></div>
      <div class="obj-dim"><div class="dname">Word/Phrase</div><div class="dtext">${escapeHTML(col.word)}</div></div>
    </div>`;

  const body = `<div class="obj-grid">${column(data.interpretive)}${column(data.expressive)}</div>`;
  return section('language-objectives', '02',
                 'Interpretive & expressive language objectives', data.note, body);
}

function renderRubricSection(id, number, title, data = {}) {
  const vocabulary = vocabularyList();

  const rows = (data.rows || []).map(row => {
    const examples = (row.examples || []).filter(Boolean);
    const exampleNote = examples.length
      ? `<span class="ex-note">e.g., ${examples.map(e => `<b>${escapeHTML(e)}</b>`).join(', ')}</span>`
      : '';

    return `
      <tr class="lvl${row.level}">
        <td><span class="lvl-chip"><span class="lvl-dot mono">${escapeHTML(row.level)}</span><span class="lvl-name">${escapeHTML(row.name)}</span></span></td>
        <td>${escapeHTML(row.discourse)}</td>
        <td>${escapeHTML(row.sentence)}</td>
        <td>${boldVocabulary(row.word, vocabulary)}${exampleNote}</td>
      </tr>`;
  }).join('');

  const body = `
    <div class="table-scroll">
      <table class="rubric">
        <thead>
          <tr>
            <th>Level</th>
            <th>Discourse — Organization &amp; cohesion</th>
            <th>Sentence — Grammatical complexity</th>
            <th>Word/Phrase — Precision</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;

  return section(id, number, title, data.note, body);
}

function renderContentEvidence(data = {}) {
  const items = (data.items || [])
    .map(item => `<li><span class="box"></span>${escapeHTML(item)}</li>`).join('');
  return section('content-evidence', '05', 'Content evidence checklist', data.note,
                 `<ul class="evidence-list">${items}</ul>`);
}

function renderScaffolds(data = {}) {
  const bands = (data.bands || []).map(band => `
    <div class="scaffold-band">
      <div class="band-lvl">${escapeHTML(band.label)}</div>
      <ul>${(band.items || []).map(i => `<li>${escapeHTML(i)}</li>`).join('')}</ul>
    </div>`).join('');

  return section('scaffolds', '06', 'Scaffolds & supports', data.note,
                 `<div class="scaffold-bands">${bands}</div>`);
}

function renderAssumptions(data = {}) {
  const items = (data.items || []).map(item => `
    <li><span class="tag">${escapeHTML(item.tag)}</span>${escapeHTML(item.note)}</li>`).join('');
  return section('assumptions', '07', 'Assumptions & implementation notes', '',
                 `<ul class="assumption-list">${items}</ul>`);
}

/* Bolds the teacher's vocabulary wherever it appears in a descriptor.
   Runs on already-escaped text, so the <b> tags it adds are the only markup. */
function boldVocabulary(text, vocabulary) {
  let out = escapeHTML(text);
  vocabulary.forEach(word => {
    if (!word) return;
    const escaped = escapeRegExp(escapeHTML(word));
    out = out.replace(new RegExp(`(${escaped})`, 'ig'), '<b>$1</b>');
  });
  return out;
}

/* Fills the "Jump to" menu and keeps it in step with the scroll position.
   Re-generating replaces the whole document, so the previous observer and its
   stale section references are torn down first. */
let jumpObserver = null;

function populateJumpMenu() {
  const select = document.getElementById('jump-select');
  select.innerHTML = RUBRIC_SECTIONS
    .map(s => `<option value="${s.id}">${s.label}</option>`).join('');

  if (!select.dataset.bound) {
    select.addEventListener('change', e => {
      const target = document.getElementById(e.target.value);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    select.dataset.bound = 'true';
  }

  const sections = RUBRIC_SECTIONS
    .map(s => document.getElementById(s.id))
    .filter(Boolean);

  if (jumpObserver) jumpObserver.disconnect();
  jumpObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) select.value = entry.target.id;
    });
  }, { rootMargin: '-90px 0px -70% 0px', threshold: 0 });

  sections.forEach(s => jumpObserver.observe(s));
}
