/* ═══════════════════════════════════════════════
   LIBRARY — Record CRUD, Search, Sort, Import/Export
   ═══════════════════════════════════════════════ */

import { MODE_CFG } from './config.js';
import { state, setRecords, notify } from './state.js';
import { showToast, confirmAction, showProgress, updateLiveHash, saveTextFile } from './utilities.js';

const STORAGE_KEY = 'aether-db-v2';

/* ── PERSISTENCE ── */
export function loadRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  setRecords(records);
  updateCount();
}

/* ── UPDATE COUNTER ── */
export function updateCount() {
  const el = document.getElementById('lib-count');
  if (el) el.textContent = `${state.records.length} RECORDS`;
}

/* ── RENDER LIBRARY ── */
export function renderLibrary(filter, sort) {
  const container = document.getElementById('lib-list');
  if (!container) return;
  let items = [...state.records];
  const f = (filter || '').toLowerCase();
  if (f) items = items.filter(r =>
    (r.titulo||'').toLowerCase().includes(f) ||
    (r.nombre||'').toLowerCase().includes(f) ||
    (r.autor||'').toLowerCase().includes(f) ||
    (r.id||'').toLowerCase().includes(f) ||
    (r.cat||'').toLowerCase().includes(f)
  );
  if (sort === 'alpha') items.sort((a,b)=> (a.titulo||a.nombre||'').localeCompare(b.titulo||b.nombre||''));
  else if (sort === 'date') items.sort((a,b)=> (b.fecha||'').localeCompare(a.fecha||''));
  else if (sort === 'mode') items.sort((a,b)=> (a.mode||'').localeCompare(b.mode||''));
  else items.reverse();

  if (!items.length) {
    container.innerHTML = '<div class="lib-empty">// EMPTY — NO RECORDS FOUND</div>';
    return;
  }
  container.innerHTML = items.map((r,i) => {
    const label = r.titulo || r.nombre || 'UNTITLED';
    const cat = r.cat || r.formato || r.prop || r.campo || '—';
    const modeColor = (MODE_CFG[r.mode]||{}).color || '#33ff00';
    return `<div class="lib-item ${i===state.currentItemIdx?'active-item':''}" data-idx="${i}">
      <span class="lib-id">#${r.id||i}</span>
      <span class="lib-mode-badge" style="border-color:${modeColor};color:${modeColor}">${r.mode||'?'}</span>
      <div class="lib-info">
        <div class="lib-title">${label}</div>
        <div class="lib-meta">${r.autor||r.pais||r.version||''}</div>
      </div>
      <span class="lib-cat">${cat}</span>
      <div class="lib-actions">
        <button class="lib-btn lib-btn-load" data-idx="${i}" data-action="load">LOAD</button>
        <button class="lib-btn lib-btn-del" data-idx="${i}" data-action="del">DEL</button>
      </div>
    </div>`;
  }).join('');

  /* event delegation */
  container.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.idx, 10);
      if (btn.dataset.action === 'load') loadRecord(idx);
      else if (btn.dataset.action === 'del') deleteRecord(idx);
    });
  });
  container.querySelectorAll('.lib-item').forEach(item => {
    item.addEventListener('click', () => {
      const idx = parseInt(item.dataset.idx, 10);
      state.currentItemIdx = idx;
      renderLibrary(
        document.getElementById('lib-search')?.value || '',
        document.getElementById('lib-sort')?.value || ''
      );
    });
  });
}

/* ── LOAD RECORD INTO EDITOR ── */
export function loadRecord(idx) {
  const r = state.records[idx];
  if (!r) return;
  state.currentItemIdx = idx;
  const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
  setVal('f-titulo', r.titulo);
  setVal('f-autor', r.autor);
  setVal('f-cat', r.cat);
  setVal('f-fecha', r.fecha);
  setVal('f-sector', r.sector);
  setVal('f-nombre', r.nombre);
  setVal('f-pais', r.pais);
  setVal('f-campo', r.campo);
  setVal('f-formato', r.formato);
  setVal('f-version', r.version);
  setVal('f-prop', r.prop);
  setVal('f-notas', r.notas);

  /* switch mode if different */
  if (r.mode && r.mode !== state.mode) {
    const sel = document.getElementById('mode-select');
    if (sel) { sel.value = r.mode; sel.dispatchEvent(new Event('change')); }
  }
  updateLiveHash();
  showToast('RECORD LOADED');
  /* switch to editor tab */
  const tab = document.getElementById('tab-editor');
  if (tab) tab.click();
}

/* ── DELETE RECORD ── */
async function deleteRecord(idx) {
  const ok = await confirmAction(`DELETE RECORD #${state.records[idx]?.id||idx}?\nTHIS CANNOT BE UNDONE.`);
  if (!ok) return;
  state.records.splice(idx, 1);
  saveRecords(state.records);
  renderLibrary(
    document.getElementById('lib-search')?.value || '',
    document.getElementById('lib-sort')?.value || ''
  );
  showToast('RECORD DELETED');
}

/* ── EXPORT ALL ── */
export function exportAllRecords() {
  const json = JSON.stringify(state.records, null, 2);
  saveTextFile('aether_export.json', json);
  showToast('EXPORTED');
}

/* ── IMPORT RECORDS ── */
export function importRecords(jsonText) {
  try {
    const arr = JSON.parse(jsonText);
    if (!Array.isArray(arr)) throw new Error('Not array');
    const merged = [...state.records, ...arr];
    saveRecords(merged);
    renderLibrary(
      document.getElementById('lib-search')?.value || '',
      document.getElementById('lib-sort')?.value || ''
    );
    showToast(`IMPORTED ${arr.length} RECORDS`);
  } catch (e) {
    showToast('IMPORT ERROR: INVALID JSON');
    throw e;
  }
}

/* ── SEARCH / SORT BINDING ── */
export function initLibraryEvents() {
  const search = document.getElementById('lib-search');
  const sort   = document.getElementById('lib-sort');
  if (search) search.addEventListener('input', () => renderLibrary(search.value, sort?.value || ''));
  if (sort)   sort.addEventListener('change', () => renderLibrary(search?.value || '', sort.value));
}
