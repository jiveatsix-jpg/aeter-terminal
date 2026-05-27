/* ═══════════════════════════════════════════════
   EXPORTS — Attach all public functions to window
   for onclick compatibility with existing HTML.
   ═══════════════════════════════════════════════ */

import { switchTab, applyPalette, showToast, confirmAction, saveTextFile, readTextFile, updateLiveHash, populateDatalist, renderLogo, calculateFileHash, clearFileHash, generateOutput, resetAllFields } from './utilities.js';
import { exportPNG, exportBBCODE, refreshPreviewCanvas, generateAsset, generateHash } from './canvas.js';
import { loadRecords, saveRecords, renderLibrary, exportAllRecords, importRecords, initLibraryEvents } from './library.js';
import { showSaveModal, showQfModal, showBulkModal, copyQFTemplate, copyBulkTemplate, viewBulkTemplate } from './modals.js';
import { syncSignature, copyBBCode, forgeExportPNG, forgeExportBB, forgeExportTXT, initForge, renderBtn, downloadBtn, copyBtnBBCode } from './forge.js';
import { captureMem, exportMem, importMem, persistSession } from './memory.js';
import { changeMode, initModeSystem } from './mode.js';
import { state, setMode, setPalette, setRecords } from './state.js';

/* ── EXPOSE EVERYTHING TO WINDOW ── */
const api = {
  /* tabs */
  switchTab,
  applyPalette,

  /* editor / records */
  showSaveModal,
  showQfModal,
  showBulkModal,
  exportAllRecords,
  importRecords,
  copyQFTemplate,
  copyBulkTemplate,
  viewBulkTemplate,
  generateOutput,
  resetAllFields,

  /* canvas / forge */
  exportPNG,
  exportBBCODE,
  refreshPreviewCanvas,
  generateAsset,
  generateHash,
  syncSignature,
  copyBBCode,
  forgeExportPNG,
  forgeExportBB,
  forgeExportTXT,
  downloadBtn,
  copyBtnBBCode,
  renderBtn,

  /* library */
  renderLibrary,
  loadRecords,
  saveRecords,

  /* memory */
  captureMem,
  exportMem,
  importMem,
  persistSession,

  /* mode */
  changeMode,

  /* misc exposed for edge cases */
  showToast,
  confirmAction,
  updateLiveHash,
  calculateFileHash,
  clearFileHash,
  populateDatalist,
  renderLogo,
  readTextFile,
  saveTextFile,

  /* state access (readonly) */
  getState: () => state,
};

/* Attach each fn to window */
for (const [key, fn] of Object.entries(api)) {
  window[key] = fn;
}
