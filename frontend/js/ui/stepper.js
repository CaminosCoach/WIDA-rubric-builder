/* The progress rail in the header. */

import { steps, STEP_LABELS } from '../data/steps.js';

export function renderStepper(currentStep) {
  const el = document.getElementById('stepper');
  el.innerHTML = steps.map((step, i) => {
    const cls = i === currentStep ? 'active' : (i < currentStep ? 'done' : '');
    const marker = i < currentStep ? '✓' : i + 1;
    return `<div class="step ${cls}"><span class="num">${marker}</span><span>${STEP_LABELS[i]}</span></div>`;
  }).join('');
}
