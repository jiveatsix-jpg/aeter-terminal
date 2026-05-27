/* ═══════════════════════════════════════════════
   MODE — Mode Switching, Dynamic Field Rendering
   ═══════════════════════════════════════════════ */

import { MODE_CFG, MODE_FIELDS, NOTAS_LABELS } from './config.js';
import { state, setMode, notify } from './state.js';
import { updateLiveHash, populateDatalist } from './utilities.js';
import { refreshPreviewCanvas } from './canvas.js';

/* ── CHANGE MODE ── */
export function changeMode(mode) {
  if (!MODE_CFG[mode]) return;
  setMode(mode);
  const sel = document.getElementById('mode-select');
  if (sel) sel.value = mode;

  /* update badge */
  const badge = document.getElementById('mode-badge');
  if (badge) {
    const mc = MODE_CFG[mode];
    badge.textContent = mc.badge;
    badge.style.color = mc.color;
  }

  /* re-render fields */
  renderFields(mode);

  /* update palette accent if default */
  if (!state.palette) {
    const mc = MODE_CFG[mode];
    document.documentElement.style.setProperty('--c-accent', mc.color);
  }

  updateLiveHash();
  refreshPreviewCanvas();
}

/* ── RENDER DYNAMIC FIELDS ── */
export function renderFields(mode) {
  const container = document.getElementById('fields-container');
  if (!container) return;
  const fields = MODE_FIELDS[mode] || [];
  const mc = MODE_CFG[mode];
  const accent = mc ? mc.color : '#33ff00';

  container.innerHTML = fields.map(f => {
    const label = f.label;
    const isCombo = f.type === 'combo';
    return `<div class="field-group">
      <div class="field-label" style="color:${accent}">${label}</div>
      ${isCombo
        ? `<div class="combo-wrap"><input type="text" id="${f.id}" class="combo-input" list="${f.list}" placeholder="// ${label.toLowerCase()}"><datalist id="${f.list}"></datalist></div>`
        : `<input type="text" id="${f.id}" placeholder="// ${label.toLowerCase()}">`
      }
    </div>`;
  }).join('');

  /* wire field events */
  fields.forEach(f => {
    const el = document.getElementById(f.id);
    if (el) el.addEventListener('input', () => { updateLiveHash(); refreshPreviewCanvas(); });
    /* populate datalist if combo */
    if (f.type === 'combo' && f.list) {
      populateDatalist(f.list, getSuggestions(f.list));
    }
  });

  /* render notes */
  const notesLabel = NOTAS_LABELS[mode] || 'NOTES';
  const notesContainer = document.getElementById('notas-container');
  if (notesContainer) {
    notesContainer.innerHTML = `<div class="field-group" style="border-bottom:none">
      <div class="field-label" style="color:${accent}">${notesLabel}</div>
      <textarea id="f-notas" placeholder="// ${notesLabel.toLowerCase()}"></textarea>
    </div>`;
    const notasEl = document.getElementById('f-notas');
    if (notasEl) notasEl.addEventListener('input', () => { updateLiveHash(); refreshPreviewCanvas(); });
  }

  /* update palette bar button accent */
  const sel = document.getElementById('mode-select');
  if (sel) sel.style.borderColor = accent;
}

function getSuggestions(listId) {
  const map = {
    'dl-cat-texto':['Manifesto','Letter','Treatise','Report','Proclamation','Chronicle','Scripture','Codex','Transcript','Poem','Speech','Contract'],
    'dl-sector':    ['Sector-7G','Alpha','Beta','Gamma','Delta','Epsilon','Outer-Rim','Core','Unknown'],
    'dl-campo':     ['Painter','Sculptor','Architect','Writer','Composer','Performer','Artisan'],
    'dl-formato':   ['Painting','Sculpture','Architecture','Textile','Ceramic','Weapon','Tool','Instrument','Vessel','Device','Armor','Jewelry','Furniture','Coin','Game','Machine'],
    'dl-cat-soft':  ['Utility','Database','AI','Editor','Simulator','Communicator','OS','Compiler','Game','Security','Analytics','Automation'],
  };
  return map[listId] || [];
}

/* ── INIT ── */
export function initModeSystem() {
  const sel = document.getElementById('mode-select');
  if (!sel) return;

  /* populate mode select */
  sel.innerHTML = Object.entries(MODE_CFG).map(([key,cfg]) =>
    `<option value="${key}" style="color:${cfg.color}">${cfg.label}</option>`
  ).join('');

  sel.addEventListener('change', () => changeMode(sel.value));

  /* restore from session */
  const saved = sessionStorage.getItem('aether-mode');
  changeMode(saved || 'TEXTO');
}
