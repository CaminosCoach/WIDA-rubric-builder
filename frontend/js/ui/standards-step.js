/* Step 3 — subject, grade, and two ways of adding standards.

   Both paths feed the same chip list at the bottom: typed codes live in
   state.manualStandards, browsed ones in state.selectedStandards, and
   combinedStandards() merges them. */

import { ELA_STANDARDS } from '../data/standards.js';
import { GRADE_OPTIONS, SUBJECT_OPTIONS } from '../data/steps.js';
import { state, combinedStandards } from '../state.js';
import { updateDraft } from './draft.js';

const ELA = "English Language Arts/Literacy";

export function renderStandardsStep(wrap) {
  wrap.innerHTML = '';

  wrap.appendChild(buildSubjectGradeRow(wrap));
  wrap.appendChild(buildMethodToggle(wrap));

  const isELA = state.subjectArea === ELA;
  if (!isELA) {
    const note = document.createElement('div');
    note.className = 'subject-note';
    note.textContent = `The guided picker currently covers English Language Arts/Literacy standards. For ${state.subjectArea}, type standard codes or keywords directly below.`;
    wrap.appendChild(note);
  }

  if (state.standardsMethod === 'type' || !isELA) {
    renderManualStandards(wrap);
  } else {
    renderBrowsePicker(wrap);
  }

  wrap.appendChild(buildChips(wrap));
}

function buildSubjectGradeRow(wrap) {
  const row = document.createElement('div');
  row.className = 'field-row';

  const subject = document.createElement('div');
  subject.className = 'field';
  subject.innerHTML = `<label class="q">Subject area</label>`;
  subject.appendChild(buildOptionSelect(SUBJECT_OPTIONS, state.subjectArea, value => {
    state.subjectArea = value;
    updateDraft();
    renderStandardsStep(wrap); // the picker only covers ELA, so re-render
  }));
  row.appendChild(subject);

  const grade = document.createElement('div');
  grade.className = 'field';
  grade.innerHTML = `<label class="q">Grade level</label>`;
  grade.appendChild(buildOptionSelect(GRADE_OPTIONS, state.gradeLevel, value => {
    state.gradeLevel = value;
    updateDraft();
  }));
  row.appendChild(grade);

  return row;
}

function buildOptionSelect(options, selected, onChange) {
  const select = document.createElement('select');
  options.forEach(option => {
    const el = document.createElement('option');
    el.value = option;
    el.textContent = option;
    if (option === selected) el.selected = true;
    select.appendChild(el);
  });
  select.addEventListener('change', e => onChange(e.target.value));
  return select;
}

function buildMethodToggle(wrap) {
  const field = document.createElement('div');
  field.className = 'field';
  field.innerHTML = `<label class="q">How would you like to add standards?</label>
    <div class="hint">Type standard codes directly, or browse Georgia's domain → big idea → standard structure.</div>`;

  const toggle = document.createElement('div');
  toggle.className = 'method-toggle';

  [['type', 'Type them in'], ['browse', 'Browse by domain']].forEach(([method, label]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'method-btn' + (state.standardsMethod === method ? ' active' : '');
    button.textContent = label;
    button.addEventListener('click', () => {
      state.standardsMethod = method;
      renderStandardsStep(wrap);
    });
    toggle.appendChild(button);
  });

  field.appendChild(toggle);
  return field;
}

function renderManualStandards(wrap) {
  const field = document.createElement('div');
  field.className = 'field';
  field.innerHTML = `<label class="q">Standard codes</label>
    <div class="hint">Start typing a standard code or a few words from the standard. Up to five.</div>`;

  const datalist = document.createElement('datalist');
  datalist.id = 'std-suggestions';
  if (state.subjectArea === ELA) {
    eachStandard((standard) => {
      const option = document.createElement('option');
      option.value = `${standard.code} — ${standard.title}`;
      datalist.appendChild(option);
    });
  }
  field.appendChild(datalist);

  state.manualStandards.forEach((value, index) => {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = value;
    input.setAttribute('list', 'std-suggestions');
    input.placeholder = `Standard ${index + 1}`;
    input.style.marginBottom = '8px';
    input.addEventListener('input', e => {
      state.manualStandards[index] = e.target.value;
      updateDraft();
    });
    field.appendChild(input);
  });

  wrap.appendChild(field);
}

function renderBrowsePicker(wrap) {
  const field = document.createElement('div');
  field.className = 'field';
  field.innerHTML = `<label class="q">Browse Georgia's ELA standards</label>
    <div class="hint">Domain → Big Idea → Standard. Sourced from Georgia's K–12 ELA Standards (GA DOE).</div>`;

  const row = document.createElement('div');
  row.className = 'picker-row';

  const domainSelect = buildPickerSelect(
    'Select a domain…',
    Object.keys(ELA_STANDARDS).map(d => ({ value: d, label: `Domain: ${d}` })),
    state.browseDomain,
    false,
    value => {
      state.browseDomain = value;
      state.browseBigIdea = '';
      state.browseStandardCode = '';
      renderStandardsStep(wrap);
    }
  );
  row.appendChild(domainSelect);

  const bigIdeas = state.browseDomain
    ? Object.keys(ELA_STANDARDS[state.browseDomain].bigIdeas).map(b => ({ value: b, label: b }))
    : [];
  row.appendChild(buildPickerSelect(
    'Select a big idea…', bigIdeas, state.browseBigIdea, !state.browseDomain,
    value => {
      state.browseBigIdea = value;
      state.browseStandardCode = '';
      renderStandardsStep(wrap);
    }
  ));
  field.appendChild(row);

  let standardsList = [];
  if (state.browseDomain && state.browseBigIdea) {
    standardsList = ELA_STANDARDS[state.browseDomain].bigIdeas[state.browseBigIdea].standards;
  }

  const standardSelect = buildPickerSelect(
    'Select a standard…',
    standardsList.map(s => ({ value: s.code, label: `${s.code} — ${s.title}` })),
    state.browseStandardCode,
    !state.browseBigIdea,
    value => {
      state.browseStandardCode = value;
      renderStandardsStep(wrap);
    }
  );
  standardSelect.style.marginBottom = '12px';
  field.appendChild(standardSelect);

  const chosen = standardsList.find(s => s.code === state.browseStandardCode);
  if (chosen) field.appendChild(buildSubskillBox(chosen, wrap));

  wrap.appendChild(field);
}

function buildPickerSelect(placeholder, options, selected, disabled, onChange) {
  const select = document.createElement('select');
  select.disabled = disabled;

  const blank = document.createElement('option');
  blank.value = '';
  blank.textContent = placeholder;
  select.appendChild(blank);

  options.forEach(option => {
    const el = document.createElement('option');
    el.value = option.value;
    el.textContent = option.label;
    if (option.value === selected) el.selected = true;
    select.appendChild(el);
  });

  select.addEventListener('change', e => onChange(e.target.value));
  return select;
}

function buildSubskillBox(standard, wrap) {
  const box = document.createElement('div');
  box.className = 'subskill-box';
  box.innerHTML = `<div class="std-title">${standard.code} — ${standard.title}</div>
    <ul>${standard.subskills.map(s => `<li>${s}</li>`).join('')}</ul>`;

  const alreadyAdded = state.selectedStandards.some(s => s.code === standard.code);
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn-add';
  button.textContent = alreadyAdded ? 'Already added' : 'Add this standard';
  button.disabled = alreadyAdded;
  button.addEventListener('click', () => {
    state.selectedStandards.push(standard);
    updateDraft();
    renderStandardsStep(wrap);
  });

  box.appendChild(button);
  return box;
}

function buildChips(wrap) {
  const field = document.createElement('div');
  field.className = 'field';
  field.innerHTML = `<label class="q">Standards for this rubric</label>`;

  const combined = combinedStandards();
  if (!combined.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-note';
    empty.textContent = 'No standards added yet.';
    field.appendChild(empty);
    return field;
  }

  const chips = document.createElement('div');
  chips.className = 'std-chips';

  combined.forEach(code => {
    const chip = document.createElement('span');
    chip.className = 'std-chip';
    chip.innerHTML = `<span class="code">${code}</span>`;

    const remove = document.createElement('button');
    remove.className = 'rm';
    remove.type = 'button';
    remove.innerHTML = '&times;';
    remove.addEventListener('click', () => {
      /* A code can come from either source, so clear it from both. */
      state.manualStandards = state.manualStandards.map(s => s.trim() === code ? '' : s);
      state.selectedStandards = state.selectedStandards.filter(s => s.code !== code);
      updateDraft();
      renderStandardsStep(wrap);
    });

    chip.appendChild(remove);
    chips.appendChild(chip);
  });

  field.appendChild(chips);
  return field;
}

function eachStandard(callback) {
  Object.values(ELA_STANDARDS).forEach(domain => {
    Object.values(domain.bigIdeas).forEach(bigIdea => {
      bigIdea.standards.forEach(callback);
    });
  });
}
