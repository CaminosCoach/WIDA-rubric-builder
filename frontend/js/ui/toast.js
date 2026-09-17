/* Transient status messages, and the blocking overlay used while the model
   is working. Generation takes tens of seconds, so it needs more than a toast. */

let toastTimer = null;

export function showToast(message) {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

export function showOverlay(note) {
  const overlay = document.getElementById('gen-overlay');
  const noteEl = document.getElementById('gen-note');
  noteEl.className = 'gen-note';
  noteEl.textContent = note;
  removeRetry();
  overlay.classList.add('show');
}

export function hideOverlay() {
  document.getElementById('gen-overlay').classList.remove('show');
  removeRetry();
}

/* Leaves the overlay up with the failure and a retry button, so a failed
   generation doesn't drop the teacher back to a blank screen. */
export function showOverlayError(message, onRetry) {
  const overlay = document.getElementById('gen-overlay');
  const noteEl = document.getElementById('gen-note');
  const box = overlay.querySelector('.gen-box');

  overlay.querySelector('.gen-spinner').style.display = 'none';
  box.querySelector('.gen-title').textContent = 'Could not build the rubric';
  noteEl.className = 'gen-note error';
  noteEl.textContent = message;

  removeRetry();
  const retry = document.createElement('button');
  retry.className = 'gen-retry';
  retry.type = 'button';
  retry.textContent = 'Try again';
  retry.addEventListener('click', () => {
    overlay.querySelector('.gen-spinner').style.display = '';
    box.querySelector('.gen-title').textContent = 'Building your rubric';
    removeRetry();
    onRetry();
  });
  box.appendChild(retry);

  overlay.classList.add('show');
}

function removeRetry() {
  const existing = document.querySelector('.gen-retry');
  if (existing) existing.remove();
}
