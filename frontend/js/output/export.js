/* The two export buttons.

   Word goes through the backend, which builds a real .docx with python-docx.
   PDF stays client-side: html2pdf screenshots the rendered document, so what
   a teacher sees is what they get. */

import { exportDocx } from '../api.js';
import { state, generated } from '../state.js';
import { showToast } from '../ui/toast.js';

export function registerExportHandlers() {
  document.getElementById('btn-export-word').addEventListener('click', exportWord);
  document.getElementById('btn-export-pdf').addEventListener('click', exportPDF);
}

function filenameFor(extension) {
  const grade = (state.gradeLevel || 'Rubric').replace(/\s+/g, '_');
  return `WIDA_Rubric_${grade}_${Date.now()}.${extension}`;
}

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 200);
}

async function exportWord() {
  if (!generated.rubric) {
    showToast('Build a rubric first.');
    return;
  }

  showToast('Generating Word document…');
  try {
    const blob = await exportDocx(generated.rubric, state.gradeLevel);
    download(blob, filenameFor('docx'));
    showToast('Word document downloaded.');
  } catch (err) {
    console.error('Word export error:', err);
    showToast(err.message);
  }
}

function exportPDF() {
  if (!generated.rubric) {
    showToast('Build a rubric first.');
    return;
  }

  showToast('Generating PDF — this may take a moment…');

  const source = document.getElementById('out-doc');

  /* Render from a clone so the visible page is untouched, and at a fixed
     width so the PDF doesn't inherit the current window size. */
  const clone = source.cloneNode(true);
  clone.style.width = '780px';
  clone.style.padding = '0';
  clone.style.background = '#fff';
  clone.style.position = 'absolute';
  clone.style.left = '-9999px';

  /* Sticky headers capture as floating bars mid-page, so pin them down. */
  clone.querySelectorAll('thead th').forEach(th => { th.style.position = 'static'; });

  document.body.appendChild(clone);

  const options = {
    margin:      [0.5, 0.5, 0.5, 0.5],
    filename:    filenameFor('pdf'),
    image:       { type: 'jpeg', quality: 0.96 },
    html2canvas: { scale: 2, useCORS: true, logging: false, width: 780 },
    jsPDF:       { unit: 'in', format: 'letter', orientation: 'portrait' },
    pagebreak:   { mode: ['avoid-all', 'css', 'legacy'] }
  };

  window.html2pdf().set(options).from(clone).save()
    .then(() => {
      clone.remove();
      showToast('PDF downloaded.');
    })
    .catch(err => {
      console.error('PDF export error:', err);
      clone.remove();
      showToast('PDF export failed — see console for details.');
    });
}
