/* ═══════════════════════════════════════════════
   MEMORY — Aether Memory Capture, Export, Import
   ═══════════════════════════════════════════════ */

import { state } from './state.js';
import { showToast, showProgress, readTextFile, saveTextFile, confirmAction } from './utilities.js';

const MEM_KEY = 'aether-memory-v1';

export function loadMem() {
  try {
    const raw = localStorage.getItem(MEM_KEY);
    state.mem = raw ? JSON.parse(raw) : [];
  } catch { state.mem = []; }
  updateMemCount();
}

export function saveMemToStore() {
  localStorage.setItem(MEM_KEY, JSON.stringify(state.mem));
  updateMemCount();
}

function updateMemCount() {
  const el = document.getElementById('mem-count');
  if (el) el.textContent = `${state.mem.length} FRAGMENTS`;
}

/* ── CAPTURE CURRENT STATE AS MEMORY ── */
export function captureMem() {
  const el = id => document.getElementById(id);
  const val = id => { const e = el(id); return e ? e.value : ''; };
  const entry = {
    ts: new Date().toISOString(),
    mode: state.mode,
    titulo: val('f-titulo'),
    autor:  val('f-autor'),
    cat:    val('f-cat'),
    fecha:  val('f-fecha'),
    sector: val('f-sector'),
    nombre: val('f-nombre'),
    pais:   val('f-pais'),
    campo:  val('f-campo'),
    formato:val('f-formato'),
    version:val('f-version'),
    prop:   val('f-prop'),
    notas:  val('f-notas'),
    palette: state.palette,
  };
  state.mem.push(entry);
  saveMemToStore();
  showToast('MEMORY CAPTURED');
}

/* ── EXPORT MEMORY ── */
export function exportMem() {
  const json = JSON.stringify(state.mem, null, 2);
  saveTextFile('aether_memory.json', json);
  showToast('MEMORY EXPORTED');
}

/* ── IMPORT MEMORY ── */
export async function importMem() {
  const result = await readTextFile();
  if (!result) return;
  try {
    const arr = JSON.parse(result.text);
    if (!Array.isArray(arr)) throw new Error('Not array');
    const merged = [...state.mem, ...arr];
    state.mem = merged;
    saveMemToStore();
    showToast(`IMPORTED ${arr.length} FRAGMENTS`);
  } catch (e) {
    showToast('IMPORT ERROR: INVALID FILE');
  }
}

/* ── PERSIST SESSION (legacy support) ── */
export function persistSession() {
  /* save last used mode and palette */
  sessionStorage.setItem('aether-mode', state.mode);
  /* records already persisted in library */
  showToast('SESSION PERSISTED');
}
