/* ═══════════════════════════════════════════════
   CANVAS — Text/Image Rendering, PNG Export, Preview
   Replicates original drawCanvas + buildRows system
   ═══════════════════════════════════════════════ */

import { MODE_CFG, FONT_SIZE, LINE_H, PAD_X, PAD_Y, NOTAS_LABELS, LOGO } from './config.js';
import { state } from './state.js';

/* ── LIVE DATA (last generated output) ── */
let lastData = null;

/* ── COLOUR PALETTE LOOKUP ── */
export function getPal() {
  /* returns { primary, accent, highlight, warn, dim, bg, border } */
  const p = state.palette;
  import('./config.js').then(m => {
    const pal = m.PALETTES[p] || m.PALETTES[''];
    Object.assign(cachedPal, pal);
  });
  return cachedPal;
}
const cachedPal = { primary:'#33ff00', accent:'#00ccff', highlight:'#ff00ff', warn:'#ffff00', dim:'#1a7a00', bg:'#000400', border:'#144414' };

/* ── HASH (FNV-1a) ── */
export function generateHash(a, b) {
  const mode = state.mode;
  const s = (String(a) + String(b) + mode).toUpperCase();
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  const hex = (h >>> 0).toString(16).toUpperCase().padStart(8, '0');
  const p1 = s.replace(/[^A-Z0-9]/g, '').substring(0, 4).padEnd(4, 'X');
  return `${p1}-${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
}

/* ── WRAP TEXT BY PIXEL WIDTH ── */
function wrapTextPx(ctx, text, maxPx, fontSize) {
  ctx.font = `${fontSize}px 'Press Start 2P', monospace`;
  if (!text) return ['N/A'];
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w;
    if (ctx.measureText(test).width > maxPx && cur) { lines.push(cur); cur = w; }
    else { cur = test; }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : ['N/A'];
}

/* ── COLLECT FIELDS ── */
function collectFields() {
  const el = id => document.getElementById(id);
  const val = id => { const e = el(id); return e ? e.value.trim() || 'N/A' : 'N/A'; };
  const mode = state.mode;
  const fields = {};
  if (mode === 'ARTIST') {
    fields['NAME']    = val('f-nombre');
    fields['REGION']  = val('f-sector');
    fields['COUNTRY'] = val('f-pais');
    fields['FIELD']   = val('f-campo');
  } else if (mode === 'SOFTWARE') {
    fields['APP NAME']  = val('f-nombre');
    fields['VERSION']   = val('f-version');
    fields['CATEGORY']  = val('f-cat');
    fields['PURPOSE']   = val('f-prop');
    fields['REGION']    = val('f-sector');
  } else {
    fields['TITLE']    = val('f-titulo');
    fields['MAKER']    = val('f-autor');
    fields['CATEGORY'] = val('f-cat');
    if (mode === 'ARTEFACTO') fields['FORMAT'] = val('f-formato');
    fields['DATE']     = val('f-fecha');
    fields['REGION']   = val('f-sector');
  }
  return fields;
}

/* ── BUILD ROWS ── */
function buildRows(ctx, data, innerW) {
  const pal = getPal();
  const mcol = pal.accent;
  const valMaxPx = innerW - ctx.measureText('PURPOSE      : ').width - 12;

  function buildField(label, value) {
    const labelStr = label.padEnd(13, ' ') + ': ';
    const wrapped = wrapTextPx(ctx, value || 'N/A', Math.max(60, valMaxPx), FONT_SIZE);
    return wrapped.map((l, i) => ({
      text: i === 0 ? labelStr + l : ' '.repeat(labelStr.length) + l,
      color: pal.primary, labelEnd: i === 0 ? labelStr.length : -1,
    }));
  }

  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const rows = [];

  rows.push({ top: true });
  rows.push({ empty: true });
  for (const l of LOGO) rows.push({ logo: true, text: l, fontSize: 19, color: mcol });
  rows.push({ empty: true });
  rows.push({ text: '[ AETHER PROJECT ]', color: mcol, center: true, glow: true, fontSize: FONT_SIZE + 1 });
  rows.push({ text: 'MULTIMODULE ASSET INDEXER :: v3.2.0', color: pal.accent, center: true, fontSize: 12 });
  rows.push({ empty: true });
  rows.push({ mid: true, color: mcol });

  /* Mode badge */
  const mc = MODE_CFG[state.mode];
  rows.push({ text: `MODE     :  ${state.mode}`, color: mcol, glow: true, fontSize: 12 });
  rows.push({ text: `TYPE     :  ${mc ? mc.label : 'RECORD'}`, color: pal.dim, fontSize: 12 });
  if (data.assetId) rows.push({ text: `ID       :  ${data.assetId}`, color: pal.warn, glow: true, fontSize: 12 });
  rows.push({ text: `HASH_ID  >  [${data.hash}]`, color: mcol, glow: true, fontSize: 12 });
  if (data.fileHash && data.fileHash !== 'N/A') {
    const fhPrefix = 'FHASH    :  ';
    const fhIndent = ' '.repeat(fhPrefix.length);
    const fhChunks = data.fileHash.match(/.{1,32}/g) || [];
    rows.push({ text: fhPrefix + (fhChunks[0] || ''), color: pal.primary, fontSize: 12 });
    for (let i = 1; i < fhChunks.length; i++) rows.push({ text: fhIndent + fhChunks[i], color: pal.primary, fontSize: 12 });
  }
  rows.push({ text: `INDEXED  >  ${now} UTC`, color: pal.dim, fontSize: 12 });
  rows.push({ mid: true, color: mcol });

  /* Mode-specific fields */
  const modeLabel = `[ ${mc ? mc.label : 'DATA'} ]`;
  rows.push({ text: modeLabel, color: pal.accent, center: true });
  rows.push({ divider: true });

  const fieldsData = data.fields || {};
  for (const [k, v] of Object.entries(fieldsData)) {
    for (const r of buildField(k, v)) rows.push(r);
  }
  rows.push({ mid: true, color: mcol });

  /* Notes */
  rows.push({ text: '[ OPERATIVE_NOTES ]', color: pal.accent, center: true });
  rows.push({ divider: true });
  for (const l of wrapTextPx(ctx, data.notas, innerW - 8, FONT_SIZE)) rows.push({ text: l, color: '#c8c8c8' });

  /* Link (skip if ARTIST or empty) */
  if (data.enlace && data.enlace !== 'N/A' && state.mode !== 'ARTIST') {
    rows.push({ mid: true, color: mcol });
    rows.push({ text: '[ ACTIVE_LINK ]', color: pal.accent, center: true });
    rows.push({ divider: true });
    for (const l of wrapTextPx(ctx, data.enlace, innerW - 8, FONT_SIZE)) rows.push({ text: l, color: mcol, glow: true });
  }

  rows.push({ mid: true, color: mcol });
  rows.push({ text: 'AETHER PROJECT  >  ASSET INDEXING SYSTEM', color: pal.dim, center: true, fontSize: 12 });
  rows.push({ text: 'STATUS: ASSET REGISTERED  >  NODO: UNKNOWN', color: pal.dim, center: true, fontSize: 12 });
  rows.push({ empty: true });
  rows.push({ bot: true, color: mcol });

  return rows;
}

/* ── DRAW CANVAS ── */
export function drawCanvas(data) {
  if (!data) return;
  lastData = data;
  const pal = getPal();
  const canvas = document.getElementById('output-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const wrap = document.getElementById('view-editor') || canvas.parentElement;
  const canvasW = Math.max((wrap.clientWidth || 680) - 28, 560);
  const innerW = canvasW - PAD_X * 2 - 24;

  ctx.font = `${FONT_SIZE}px 'Press Start 2P', monospace`;

  const rows = buildRows(ctx, data, innerW);

  /* Height pass */
  let totalH = PAD_Y * 2;
  for (const r of rows) {
    if (r.top || r.bot)         totalH += 2;
    else if (r.mid)             totalH += 8;
    else if (r.divider)         totalH += 7;
    else if (r.empty)           totalH += Math.round(LINE_H * 0.5);
    else if (r.logo)            totalH += Math.round(LINE_H * 1.1);
    else                        totalH += LINE_H;
  }

  canvas.width = canvasW; canvas.height = totalH;
  ctx.fillStyle = pal.bg; ctx.fillRect(0, 0, canvasW, totalH);
  /* Scanlines */
  for (let y = 0; y < totalH; y += 4) { ctx.fillStyle = 'rgba(0,0,0,0.11)'; ctx.fillRect(0, y + 2, canvasW, 2); }

  const BX = PAD_X, BX2 = canvasW - PAD_X, BW = BX2 - BX;
  const mcol = pal.accent;

  function vlines(y1, y2) {
    ctx.strokeStyle = pal.border; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(BX, y1); ctx.lineTo(BX, y2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(BX2, y1); ctx.lineTo(BX2, y2); ctx.stroke();
  }
  function glow(c, b) { ctx.shadowColor = c; ctx.shadowBlur = b || 8; }
  function ng() { ctx.shadowBlur = 0; }

  let cy = PAD_Y;
  const TX = BX + 21;

  for (const r of rows) {
    const rc = r.color || mcol;
    if (r.top || r.bot) {
      glow(mcol, 8);
      ctx.strokeStyle = mcol; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(BX, cy); ctx.lineTo(BX2, cy); ctx.stroke();
      ng(); cy += 2;
    } else if (r.mid) {
      cy += 3;
      glow(mcol, 5);
      ctx.strokeStyle = mcol; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(BX, cy); ctx.lineTo(BX2, cy); ctx.stroke();
      ng(); cy += 5;
    } else if (r.divider) {
      ctx.strokeStyle = pal.dim; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(TX, cy); ctx.lineTo(BX2 - 14, cy); ctx.stroke();
      cy += 7;
    } else if (r.empty) {
      const lh = Math.round(LINE_H * 0.5);
      vlines(cy, cy + lh); cy += lh;
    } else if (r.logo) {
      const lh = Math.round(LINE_H * 1.1);
      const fs = r.fontSize || FONT_SIZE;
      ctx.font = `${fs}px 'Press Start 2P', monospace`;
      const tw = ctx.measureText(r.text).width;
      vlines(cy, cy + lh);
      glow(mcol, 14);
      ctx.fillStyle = mcol; ctx.fillText(r.text, BX + (BW - tw) / 2, cy + lh - 4); ng();
      cy += lh;
    } else {
      const lh = LINE_H;
      vlines(cy, cy + lh);
      const fs = r.fontSize || FONT_SIZE;
      const ff = r.fontFamily || "'Press Start 2P',monospace";
      ctx.font = `${fs}px ${ff}`;
      if (r.center) {
        const tw = ctx.measureText(r.text).width;
        if (r.glow) glow(rc, 10);
        ctx.fillStyle = rc; ctx.fillText(r.text, BX + (BW - tw) / 2, cy + lh - 5); ng();
      } else if (r.labelEnd > 0) {
        const lbl = r.text.slice(0, r.labelEnd);
        const val = r.text.slice(r.labelEnd);
        ctx.fillStyle = pal.accent; ctx.fillText(lbl, TX, cy + lh - 5);
        const lw = ctx.measureText(lbl).width;
        if (r.glow) glow(rc, 8);
        ctx.fillStyle = rc; ctx.fillText(val, TX + lw, cy + lh - 5); ng();
      } else {
        if (r.glow) glow(rc, 8);
        ctx.fillStyle = rc; ctx.fillText(r.text, TX, cy + lh - 5); ng();
      }
      cy += lh;
    }
  }
}

/* ── GENERATE OUTPUT (matches original generate) ── */
export function generateAsset() {
  const fields = collectFields();
  const notasEl = document.getElementById('f-notas');
  const notas = notasEl ? notasEl.value.trim() : '';
  const enlaceEl = document.getElementById('f-enlace');
  const enlace = enlaceEl ? enlaceEl.value.trim() : '';

  /* Use first two field values for hash */
  const vals = Object.values(fields);
  const hash = generateHash(vals[0] || 'VOID', vals[1] || '0000');

  /* Update hash display */
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
  const liveHash = document.getElementById('live-hash');
  if (liveHash) liveHash.textContent = hash;

  const fileHashEl = document.getElementById('f-file-hash');
  const fileHash = fileHashEl ? fileHashEl.value.trim() || '' : '';

  const data = { mode: state.mode, fields, notas, enlace, hash, assetId: '', fileHash };
  lastData = data;

  drawCanvas(data);
}

/* ── EXPORT PNG (3x scale, matches original) ── */
export function exportPNG(filename) {
  if (!lastData) {
    /* If nothing generated yet, generate first */
    generateAsset();
  }
  const srcCanvas = document.getElementById('output-canvas');
  if (!srcCanvas) return;
  const w = srcCanvas.width, h = srcCanvas.height;
  const bigCanvas = document.createElement('canvas');
  bigCanvas.width = w * 3; bigCanvas.height = h * 3;
  const bctx = bigCanvas.getContext('2d');
  bctx.imageSmoothingEnabled = false;
  bctx.drawImage(srcCanvas, 0, 0, w * 3, h * 3);

  const a = document.createElement('a');
  a.download = filename || `AETER_${lastData.mode}_${lastData.hash || Date.now()}.png`;
  a.href = bigCanvas.toDataURL('image/png');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/* ── EXPORT BBCODE (from last generated data) ── */
export function exportBBCODE() {
  if (!lastData) generateAsset();
  const pal = getPal();
  const mc = MODE_CFG[lastData.mode || state.mode];
  const colorHex = mc ? mc.color : '#33ff00';
  const fields = lastData.fields || {};
  let lines = `[color=${colorHex}][font=Courier New]`;
  lines += `\n  /\\  | ____|_   _| | | | ____|  _ \\`;
  lines += `\n /  \\ |  _|   | |  | |_| |  _| | |_)`;
  lines += `\n/  \\ \\| |___  | |  |  _  | |___|  _ <`;
  lines += `\n/__/ \\_\\____| |_|  |_| |_|_____|_| \\_\\`;
  lines += `\n`;
  lines += `\n[ AETHER PROJECT ]`;
  lines += `\nMODE: ${lastData.mode || state.mode}`;
  lines += `\nHASH: ${lastData.hash}`;
  lines += `\n`;
  for (const [k, v] of Object.entries(fields)) {
    if (v && v !== 'N/A') lines += `\n${k}: ${v}`;
  }
  if (lastData.notas) lines += `\n\nNOTES:\n${lastData.notas}`;
  lines += `\n[/font][/color]`;

  navigator.clipboard.writeText(lines).then(() => {
    const toast = document.getElementById('toast');
    if (toast) { toast.textContent = 'BBCODE COPIED'; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 1500); }
  }).catch(() => {
    const blob = new Blob([lines], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'aether_bbcode.txt';
    a.click();
  });
  return lines;
}

/* ── REFRESH PREVIEW CANVAS (forge tab, simplified) ── */
export function refreshPreviewCanvas() {
  const cvs = document.getElementById('btn-preview-canvas');
  if (!cvs) return;
  /* Just draw the standard output into the preview */
  const data = lastData || { mode: state.mode, fields: collectFields(), notas: '', enlace: '', hash: '----', assetId: '', fileHash: '' };
  if (!lastData) {
    /* Use minimal data for preview */
    const pal = getPal();
    const mc = MODE_CFG[state.mode];
    const ctx = cvs.getContext('2d');
    const w = 560, h = 120;
    cvs.width = w; cvs.height = h;
    ctx.fillStyle = pal.bg; ctx.fillRect(0, 0, w, h);
    ctx.font = `${FONT_SIZE}px 'Press Start 2P', monospace`;
    ctx.fillStyle = pal.dim;
    ctx.fillText('> GENERATE TO PREVIEW', PAD_X + 12, 46);
    return;
  }
  /* Copy output-canvas to preview canvas */
  const src = document.getElementById('output-canvas');
  if (src && src.width > 0) {
    cvs.width = src.width;
    cvs.height = src.height;
    const ctx = cvs.getContext('2d');
    ctx.drawImage(src, 0, 0);
  }
}

/* ── GET LAST DATA (for other modules) ── */
export function getLastData() { return lastData; }
