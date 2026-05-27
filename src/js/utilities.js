/* ═══════════════════════════════════════════════
   UTILITIES — Toast, Log, Confirm, Progress, File Ops, Palette, Tabs, FTS
   ═══════════════════════════════════════════════ */

import { MODE_CFG, PALETTES, FONT_SIZE, LINE_H, PAD_X, PAD_Y, LOGO } from './config.js';
import { state, setPalette, notify } from './state.js';
import { refreshPreviewCanvas, generateAsset, generateHash } from './canvas.js';

/* ── TOAST ── */
export function showToast(msg, dur) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), dur || 1800);
}

/* ── PROGRESS ── */
export function showProgress(msg) {
  const el = document.getElementById('log');
  if (!el) return;
  el.textContent += `\n> ${msg}`;
  el.scrollTop = el.scrollHeight;
}

/* ── LOG (alias) ── */
export function log(msg) { showProgress(msg); }

/* ── CONFIRM ── */
export function confirmAction(msg) {
  return new Promise(resolve => {
    const modal = document.getElementById('confirm-modal');
    const msgEl = document.getElementById('confirm-msg');
    const yes   = document.getElementById('confirm-yes');
    const no    = document.getElementById('confirm-no');
    if (!modal || !msgEl || !yes || !no) { resolve(false); return; }
    msgEl.textContent = msg;
    modal.classList.add('show');
    const cleanup = () => { modal.classList.remove('show'); yes.removeEventListener('click',onY); no.removeEventListener('click',onN); };
    const onY = () => { cleanup(); resolve(true); };
    const onN = () => { cleanup(); resolve(false); };
    yes.addEventListener('click',onY);
    no.addEventListener('click',onN);
  });
}

/* ── FILE HELPERS ── */
export function saveTextFile(filename, content) {
  const blob = new Blob([content], {type:'text/plain;charset=utf-8'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

export function readTextFile() {
  return new Promise(resolve => {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = '.json,.txt,.csv,text/plain,application/json';
    inp.onchange = () => {
      const f = inp.files[0];
      if (!f) { resolve(null); return; }
      const r = new FileReader();
      r.onload = () => resolve({name:f.name,text:r.result});
      r.readAsText(f);
    };
    inp.click();
  });
}

/* ── PALETTE ── */
export function applyPalette(p) {
  setPalette(p);
  const vars = PALETTES[p] || PALETTES[''];
  if (!vars) return;
  const r = document.documentElement;
  Object.entries(vars).forEach(([k,v]) => r.style.setProperty(`--c-${k}`,v));
  if (p && p.startsWith('pal-')) {
    sessionStorage.setItem('aether-palette', p);
  } else {
    sessionStorage.removeItem('aether-palette');
  }
  /* re-render mode badge colors */
  const badge = document.getElementById('mode-badge');
  if (badge) {
    const mc = MODE_CFG[state.mode];
    if (mc) { badge.style.color = mc.color; }
  }
}

/* ── TAB SWITCHING ── */
export function switchTab(tab) {
  const views = ['view-editor','view-library','view-forge'];
  const tabs = ['tab-editor','tab-library','tab-forge'];
  views.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = (id === `view-${tab}`) ? 'flex' : 'none';
  });
  tabs.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('active', id === `tab-${tab}`);
  });
  const logEl = document.getElementById('log');
  if (logEl) logEl.scrollTop = logEl.scrollHeight;
}

/* ── GENERATE LIVE HASH ── */
export function updateLiveHash() {
  const h = document.getElementById('live-hash');
  if (!h) return;
  /* Use first two dynamic field values as hash seed (matches original) */
  const mode = state.mode;
  const fieldMap = {
    TEXTO:     ['f-titulo','f-autor'],
    ARTIST:    ['f-nombre','f-sector'],
    ARTEFACTO: ['f-titulo','f-autor'],
    SOFTWARE:  ['f-nombre','f-version'],
  };
  const ids = fieldMap[mode] || ['f-titulo','f-autor'];
  const v0 = document.getElementById(ids[0])?.value || '';
  const v1 = document.getElementById(ids[1])?.value || '';
  if (v0 || v1) {
    const hash = generateHash(v0 || 'VOID', v1 || '0000');
    h.textContent = hash;
    /* Format hash in status bar (16 chars per line) */
    const hashDisplay = document.getElementById('hash-display');
    if (hashDisplay) {
      const lines = hash.match(/.{1,16}/g) || [hash];
      const prefix = 'HASH_ID: ';
      let html = prefix + lines[0];
      for (let i = 1; i < lines.length; i++) {
        html += '<br>' + '&nbsp;'.repeat(prefix.length) + lines[i];
      }
      hashDisplay.innerHTML = html;
    }
  } else {
    h.textContent = '----·----·----';
  }
}

/* ── DATALIST POPULATE ── */
export function populateDatalist(id, values) {
  const dl = document.getElementById(id);
  if (!dl) return;
  dl.innerHTML = values.map(v => `<option value="${v}">`).join('');
}

/* ── FILE HASH (SHA-256) ── */
export async function calculateFileHash(event) {
  const file = event.target.files[0];
  if (!file) return;
  const hashEl = document.getElementById('f-file-hash');
  if (!hashEl) return;
  try {
    const buf = await file.arrayBuffer();
    const hashBuf = await crypto.subtle.digest('SHA-256', buf);
    const hashArr = Array.from(new Uint8Array(hashBuf));
    const hex = hashArr.map(b => b.toString(16).padStart(2,'0')).join('');
    hashEl.value = hex.toUpperCase();
    showProgress(`FILE HASHED: ${file.name}`);
  } catch (e) {
    hashEl.value = 'HASH_ERROR';
    showProgress(`HASH ERROR: ${e.message}`);
  }
}

export function clearFileHash() {
  const el = document.getElementById('f-file-hash');
  if (el) el.value = 'NO_FILE_HASHED';
  const inp = document.getElementById('f-file-integrity');
  if (inp) inp.value = '';
}

/* ── GENERATE OUTPUT ── */
export function generateOutput() {
  generateAsset();
  showProgress('OUTPUT GENERATED');
}

/* ── RESET ALL FIELDS ── */
export function resetAllFields() {
  const inputs = document.querySelectorAll('#fields-container input, #fields-container textarea, #notas-container input, #notas-container textarea');
  inputs.forEach(el => el.value = '');
  clearFileHash();
  updateLiveHash();
  /* Draw idle state on output canvas */
  const cvs = document.getElementById('output-canvas');
  if (cvs) {
    const pal = PALETTES[state.palette] || PALETTES[''];
    const ctx = cvs.getContext('2d');
    const wrap = document.getElementById('view-editor') || cvs.parentElement;
    cvs.width = Math.max((wrap.clientWidth || 680) - 28, 560); cvs.height = 80;
    ctx.fillStyle = pal.bg; ctx.fillRect(0, 0, cvs.width, cvs.height);
    ctx.font = `${FONT_SIZE}px 'Press Start 2P', monospace`;
    ctx.fillStyle = pal.dim || '#1a7a00';
    ctx.fillText('> SYSTEM READY. FILL IN THE FIELDS AND PRESS [GENERATE]', PAD_X + 12, 46);
  }
  showProgress('ALL FIELDS RESET');
}

/* ── GENERATE LOGO ── */
export function renderLogo(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width  = 560;
  canvas.height = 120;
  ctx.fillStyle = '#000';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.font = `${FONT_SIZE}px "Share Tech Mono", monospace`;
  ctx.textBaseline = 'top';
  const mc = MODE_CFG[state.mode];
  ctx.fillStyle = mc ? mc.color : '#33ff00';
  LOGO.forEach((l, i) => ctx.fillText(l, PAD_X, PAD_Y + i * LINE_H));
}
