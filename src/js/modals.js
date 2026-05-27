/* ═══════════════════════════════════════════════
   MODALS — Save, Quick Fill, Bulk Import
   ═══════════════════════════════════════════════ */

import { MODE_CFG, MODE_FIELDS, NOTAS_LABELS } from './config.js';
import { state, setRecords } from './state.js';
import { showToast, updateLiveHash, showProgress } from './utilities.js';
import { saveRecords, renderLibrary } from './library.js';

/* ── AI TEMPLATES ── */
const QF_SAMPLE_TEMPLATES = {
  TEXTO: `## TEXTO
Title: <title>
Maker: <author>
Category: <category from list>
Date: <YYYY-MM-DD>
Region: <region from list>

Notes:
<your notes here>`,

  ARTIST: `## ARTIST
Name: <artist name>
Region: <region from list>
Country: <country>
Field: <field from list>

Notes:
<your notes here>`,

  ARTEFACTO: `## ARTEFACTO
Title: <title>
Format: <format from list>
Maker: <author>
Category: <category from list>
Date: <YYYY-MM-DD>
Region: <region from list>

Notes:
<impact / description>`,

  SOFTWARE: `## SOFTWARE
App Name: <name>
Version: <version>
Category: <category from list>
Purpose: <purpose>
Region: <region from list>

Notes:
<your notes here>`,
};

const BULK_TEMPLATES = {
  TEXTO: `## TEXTO
Title: The Title
Maker: Author Name
Category: [LIBRO]
Date: 2024-01-01
Region: South America

Notes:
Description of the text.`,
  ARTIST: `## ARTIST
Name: Artist Name
Region: Western Europe
Country: France
Field: ART-PICT

Notes:
Artist biography.`,
  ARTEFACTO: `## ARTEFACTO
Title: Artifact Name
Format: Painting
Maker: Artist Name
Category: [BIO-AR]
Date: 1900
Region: Western Europe

Notes:
Cultural significance.`,
  SOFTWARE: `## SOFTWARE
App Name: Software Name
Version: 1.0.0
Category: AI-ENGINE
Purpose: Natural language processing
Region: North America

Notes:
Technical description.`,
};

/* ── GATHER CURRENT FORM DATA ── */
function gatherFormData() {
  const el = id => document.getElementById(id);
  const val = id => { const e = el(id); return e ? e.value : ''; };
  return {
    mode:    state.mode,
    titulo:  val('f-titulo'),
    autor:   val('f-autor'),
    cat:     val('f-cat'),
    fecha:   val('f-fecha'),
    sector:  val('f-sector'),
    nombre:  val('f-nombre'),
    pais:    val('f-pais'),
    campo:   val('f-campo'),
    formato: val('f-formato'),
    version: val('f-version'),
    prop:    val('f-prop'),
    notas:   val('f-notas'),
  };
}

/* ── SHOW SAVE MODAL ── */
export function showSaveModal() {
  const modal = document.getElementById('save-modal');
  const title = document.getElementById('save-title');
  const nameInp = document.getElementById('save-name');
  const catInp  = document.getElementById('save-cat');
  const catList = document.getElementById('dl-cat-texto');
  const confirm = document.getElementById('save-confirm');
  const cancel  = document.getElementById('save-cancel');
  if (!modal || !nameInp) return;

  const data = gatherFormData();
  const mc = MODE_CFG[state.mode];
  if (title) {
    title.textContent = `${mc ? mc.label : state.mode} — SAVE RECORD`;
    title.style.color = mc ? mc.color : '#33ff00';
  }
  nameInp.value = data.titulo || data.nombre || '';
  if (catInp) {
    catInp.value = data.cat || data.formato || data.campo || data.prop || '';
  }

  /* populate category datalist */
  const catSuggestions = {
    TEXTO:     ['Manifesto','Letter','Treatise','Report','Proclamation','Chronicle','Scripture','Codex','Transcript','Poem','Speech','Contract'],
    ARTIST:    ['Painter','Sculptor','Architect','Writer','Composer','Performer','Artisan'],
    ARTEFACTO: ['Painting','Sculpture','Architecture','Textile','Ceramic','Weapon','Tool','Instrument','Vessel','Device','Armor','Jewelry','Furniture','Coin','Game','Machine'],
    SOFTWARE:  ['Utility','Database','AI','Editor','Simulator','Communicator','OS','Compiler','Game','Security','Analytics','Automation'],
  };
  if (catList) {
    const opts = catSuggestions[state.mode] || [];
    catList.innerHTML = opts.map(o => `<option value="${o}">`).join('');
  }

  modal.classList.add('show');

  const cleanup = () => {
    modal.classList.remove('show');
    confirm.removeEventListener('click', onConfirm);
    cancel.removeEventListener('click', onCancel);
    window.removeEventListener('keydown', onKey);
  };
  const onConfirm = () => {
    const name = nameInp.value.trim();
    if (!name) { showToast('NAME REQUIRED'); return; }
    const data = gatherFormData();
    data.titulo = data.titulo || name;
    data.nombre = data.nombre || name;
    if (catInp) {
      data.cat = data.cat || catInp.value;
    }
    const id = state.records.length > 0
      ? Math.max(...state.records.map(r => parseInt(r.id,10)||0)) + 1
      : 1;
    data.id = id;
    const newRecords = [...state.records, data];
    saveRecords(newRecords);
    renderLibrary(
      document.getElementById('lib-search')?.value || '',
      document.getElementById('lib-sort')?.value || ''
    );
    showToast('RECORD SAVED');
    cleanup();
  };
  const onCancel = () => cleanup();
  const onKey = (e) => { if (e.key === 'Escape') onCancel(); };
  confirm.addEventListener('click', onConfirm);
  cancel.addEventListener('click', onCancel);
  window.addEventListener('keydown', onKey);
  nameInp.focus();
}

/* ── SHOW QUICK FILL MODAL ── */
export function showQfModal() {
  const modal = document.getElementById('qf-modal');
  const textarea = document.getElementById('qf-text');
  const parseBtn = document.getElementById('qf-parse');
  const cancelBtn = document.getElementById('qf-cancel');
  if (!modal) return;
  textarea.value = '';
  /* populate AI template view */
  const tplView = document.getElementById('qf-template-view');
  if (tplView) {
    const tpl = QF_SAMPLE_TEMPLATES[state.mode] || QF_SAMPLE_TEMPLATES.TEXTO;
    tplView.value = tpl;
  }
  modal.classList.add('show');
  const cleanup = () => {
    modal.classList.remove('show');
    parseBtn.removeEventListener('click', onParse);
    cancelBtn.removeEventListener('click', onCancel);
    window.removeEventListener('keydown', onKey);
  };
  const onParse = () => {
    const raw = textarea.value;
    if (!raw.trim()) { showToast('EMPTY INPUT'); return; }
    try {
      const parsed = parseQuickFill(raw);
      applyParsed(parsed);
      showToast('FIELDS FILLED');
      cleanup();
    } catch (e) {
      showToast(`PARSE ERROR: ${e.message}`);
    }
  };
  const onCancel = () => cleanup();
  const onKey = (e) => { if (e.key === 'Escape') onCancel(); };
  parseBtn.addEventListener('click', onParse);
  cancelBtn.addEventListener('click', onCancel);
  window.addEventListener('keydown', onKey);
  textarea.focus();
}

function parseQuickFill(raw) {
  const result = {};
  const lines = raw.split('\n').filter(l => l.trim());
  for (const line of lines) {
    const idx = line.indexOf(':');
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim().toUpperCase();
    const val = line.slice(idx + 1).trim();
    result[key] = val;
  }
  return result;
}

function applyParsed(parsed) {
  const MAP = {
    TITLE:'f-titulo', NAME:'f-nombre', MAKER:'f-autor', AUTHOR:'f-autor',
    CATEGORY:'f-cat', CAT:'f-cat', DATE:'f-fecha', REGION:'f-sector',
    COUNTRY:'f-pais', FIELD:'f-campo', FORMAT:'f-formato',
    VERSION:'f-version', PURPOSE:'f-prop', NOTES:'f-notas',
    NOTE:'f-notas', SECTOR:'f-sector',
  };
  for (const [key, val] of Object.entries(parsed)) {
    const id = MAP[key];
    if (!id) continue;
    const el = document.getElementById(id);
    if (el) el.value = val;
  }
  updateLiveHash();
}

/* ── BULK IMPORT MODAL ── */
export function showBulkModal() {
  const modal = document.getElementById('bulk-modal');
  const textarea = document.getElementById('bulk-text');
  const importBtn = document.getElementById('bulk-import');
  const cancelBtn = document.getElementById('bulk-cancel');
  if (!modal) return;
  textarea.value = '';
  renderBulkPreview([]);
  modal.classList.add('show');

  const cleanup = () => {
    modal.classList.remove('show');
    importBtn.removeEventListener('click', onImport);
    cancelBtn.removeEventListener('click', onCancel);
    window.removeEventListener('keydown', onKey);
  };
  const onImport = async () => {
    const raw = textarea.value;
    if (!raw.trim()) { showToast('EMPTY INPUT'); return; }
    const records = parseBulk(raw);
    if (!records.length) { showToast('NO RECORDS PARSED'); return; }
    const merged = [...state.records, ...records];
    saveRecords(merged);
    renderLibrary(
      document.getElementById('lib-search')?.value || '',
      document.getElementById('lib-sort')?.value || ''
    );
    showToast(`IMPORTED ${records.length} RECORDS`);
    cleanup();
  };
  const onCancel = () => cleanup();
  const onKey = (e) => { if (e.key === 'Escape') onCancel(); };
  importBtn.addEventListener('click', onImport);
  cancelBtn.addEventListener('click', onCancel);
  window.addEventListener('keydown', onKey);

  /* live preview */
  textarea.addEventListener('input', () => {
    const recs = parseBulk(textarea.value);
    renderBulkPreview(recs);
  });
}

function parseBulk(raw) {
  const blocks = raw.split(/(?=^##|\n##)/m).filter(b => b.trim());
  let idCounter = state.records.length > 0
    ? Math.max(...state.records.map(r => parseInt(r.id,10)||0)) + 1
    : 1;
  return blocks.map(block => {
    const lines = block.split('\n').filter(l => l.trim());
    const rec = { mode:'TEXTO', id: idCounter++ };
    for (const line of lines) {
      if (line.startsWith('##')) {
        const modeMatch = line.match(/##\s*(\w+)/);
        if (modeMatch && MODE_CFG[modeMatch[1]]) rec.mode = modeMatch[1];
        continue;
      }
      const idx = line.indexOf(':');
      if (idx < 0) continue;
      const key = line.slice(0, idx).trim().toUpperCase();
      const val = line.slice(idx + 1).trim();
      const MAP = {
        TITLE:'titulo', NAME:'nombre', MAKER:'autor', AUTHOR:'autor',
        CATEGORY:'cat', CAT:'cat', DATE:'fecha', REGION:'sector',
        COUNTRY:'pais', FIELD:'campo', FORMAT:'formato',
        VERSION:'version', PURPOSE:'prop', NOTES:'notas',
        NOTE:'notas',
      };
      const prop = MAP[key];
      if (prop) rec[prop] = val;
    }
    return rec;
  });
}

function renderBulkPreview(records) {
  const area = document.getElementById('bulk-preview-area');
  if (!area) return;
  if (!records.length) {
    area.textContent = '// PARSED RECORDS WILL APPEAR HERE';
    return;
  }
  area.textContent = records.map((r,i) =>
    `[${i+1}] #${r.id} | ${r.mode} | ${r.titulo || r.nombre || 'UNTITLED'}`
  ).join('\n');
}

export function copyQFTemplate() {
  const tpl = QF_SAMPLE_TEMPLATES[state.mode] || QF_SAMPLE_TEMPLATES.TEXTO;
  navigator.clipboard.writeText(tpl).then(() => {
    showToast('TEMPLATE COPIED');
  }).catch(() => {
    /* fallback */
    const blob = new Blob([tpl], {type:'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `aether_template_${state.mode}.txt`;
    a.click();
    showToast('TEMPLATE SAVED');
  });
}

export function copyBulkTemplate(mode) {
  const tpl = BULK_TEMPLATES[mode] || BULK_TEMPLATES.TEXTO;
  navigator.clipboard.writeText(tpl).then(() => {
    showToast('TEMPLATE COPIED');
  }).catch(() => {
    const blob = new Blob([tpl], {type:'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `aether_bulk_template_${mode}.txt`;
    a.click();
    showToast('TEMPLATE SAVED');
  });
}

export function viewBulkTemplate(mode) {
  const preview = document.getElementById('bulk-template-view');
  if (!preview) return;
  preview.value = BULK_TEMPLATES[mode] || BULK_TEMPLATES.TEXTO;
}


