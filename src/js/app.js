/* ═══════════════════════════════════════════════
   APP — Entry Point
   Imports all CSS, initializes modules,
   attaches event handlers, restores state.
   ═══════════════════════════════════════════════ */

/* ── CSS ── */
import '../styles/main.css';

/* ── JS Modules ── */
import { state, setRecords, subscribe } from './state.js';
import { applyPalette, switchTab, showToast, resetAllFields } from './utilities.js';
import { loadRecords, renderLibrary, updateCount, initLibraryEvents } from './library.js';
import { initModeSystem } from './mode.js';
import { initForge } from './forge.js';
import { loadMem } from './memory.js';
import { generateAsset } from './canvas.js';
import './exports.js';

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  /* 1. Restore state */
  const records = loadRecords();
  setRecords(records);
  updateCount();
  loadMem();

  /* 2. Restore palette */
  const savedPalette = sessionStorage.getItem('aether-palette');
  if (savedPalette) applyPalette(savedPalette);

  /* 3. Init subsystems */
  initModeSystem();
  initForge();
  initLibraryEvents();

  /* 4. Restore tab */
  const params = new URLSearchParams(window.location.search);
  const tab = params.get('tab') || 'editor';
  switchTab(tab);

  /* 5. Draw idle state on output canvas */
  resetAllFields();

  /* 6. Render library */
  renderLibrary('', '');

  /* 7. Wire global keyboard shortcuts */
  document.addEventListener('keydown', e => {
    if ((e.key === 's' && (e.ctrlKey || e.metaKey)) || (e.ctrlKey && e.key === 's')) {
      e.preventDefault();
      /* intercept Ctrl+S to show save modal if on editor */
      const editor = document.getElementById('view-editor');
      if (editor && editor.style.display !== 'none') {
        window.showSaveModal();
      }
    }
    if (e.ctrlKey && e.key === 'Enter') {
      /* Ctrl+Enter to generate */
      generateAsset();
    }
    if (e.key === 'Escape') {
      /* close any open modal */
      document.querySelectorAll('.show').forEach(el => {
        if (el.id.endsWith('-modal')) el.classList.remove('show');
      });
    }
  });

  /* 8. Log startup */
  showToast('AETHER TERMINAL ONLINE', 800);
});
