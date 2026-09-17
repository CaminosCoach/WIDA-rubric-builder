/* Entry point: owns which step is showing, which view is visible, and the
   one call that turns the brief into a rubric. */

import { steps } from './data/steps.js';
import { buildBrief, setGenerated } from './state.js';
import { generateRubric, checkHealth } from './api.js';

import { renderStepper } from './ui/stepper.js';
import { buildField } from './ui/fields.js';
import { renderStandardsStep } from './ui/standards-step.js';
import { renderProficiencyStep } from './ui/proficiency-step.js';
import { renderReviewStep, setStepNavigator } from './ui/review-step.js';
import { updateDraft } from './ui/draft.js';
import { showToast, showOverlay, hideOverlay, showOverlayError } from './ui/toast.js';

import { renderRubric } from './output/render.js';
import { registerExportHandlers } from './output/export.js';

let currentStep = 0;

/* ---------------------------------------------------------------- steps */

function renderStep() {
  const step = steps[currentStep];

  document.getElementById('step-eyebrow').textContent = step.eyebrow;
  document.getElementById('step-title').textContent = step.title;
  document.getElementById('step-sub').textContent = step.sub;

  const wrap = document.getElementById('step-fields');
  wrap.innerHTML = '';

  const customRenderers = {
    standards: renderStandardsStep,
    proficiency: renderProficiencyStep,
    review: renderReviewStep
  };

  if (step.custom) {
    customRenderers[step.custom](wrap);
  } else {
    step.fields.forEach(field => wrap.appendChild(buildField(field)));
  }

  document.getElementById('btn-back').disabled = (currentStep === 0);
  document.getElementById('btn-next').textContent =
    currentStep === steps.length - 1 ? 'Build my rubric' : 'Next';

  renderStepper(currentStep);
}

function goToStep(index) {
  currentStep = Math.max(0, Math.min(index, steps.length - 1));
  renderStep();
  window.scrollTo({ top: 0 });
}

/* ---------------------------------------------------------------- views */

function showBuilder(stepIndex) {
  document.getElementById('output-view').style.display = 'none';
  document.getElementById('builder-view').style.display = 'grid';
  goToStep(stepIndex);
}

function showOutput() {
  document.getElementById('builder-view').style.display = 'none';
  document.getElementById('output-view').style.display = 'block';
  window.scrollTo({ top: 0 });
}

/* ------------------------------------------------------------ generate */

async function buildRubric() {
  showOverlay('Sending your brief to the language model…');

  try {
    const payload = await generateRubric(buildBrief());
    setGenerated(payload);
    renderRubric(payload.rubric);
    hideOverlay();
    showOutput();
    showToast(`Rubric built with ${payload.model}.`);
  } catch (err) {
    console.error('Generation failed:', err);
    showOverlayError(err.message, buildRubric);
  }
}

/* ---------------------------------------------------------------- wire */

function registerNavHandlers() {
  document.getElementById('btn-next').addEventListener('click', () => {
    if (currentStep < steps.length - 1) goToStep(currentStep + 1);
    else buildRubric();
  });

  document.getElementById('btn-back').addEventListener('click', () => {
    if (currentStep > 0) goToStep(currentStep - 1);
  });

  /* Back to edit returns to Review, since that's where Build was pressed. */
  document.getElementById('btn-back-to-builder')
    .addEventListener('click', () => showBuilder(steps.length - 1));

  document.getElementById('btn-restart')
    .addEventListener('click', () => showBuilder(0));
}

/* A missing API key is the one failure worth catching before a teacher has
   filled in six steps, so check it on load rather than at generate time. */
async function warnIfUnconfigured() {
  try {
    const health = await checkHealth();
    if (!health.keyConfigured) {
      showToast(`No API key set for ${health.provider} — add one to backend/.env.`);
    }
  } catch (err) {
    showToast('Backend not reachable. Start it with: uvicorn app.main:app --reload');
  }
}

setStepNavigator(goToStep);
registerNavHandlers();
registerExportHandlers();
renderStep();
updateDraft();
warnIfUnconfigured();
