/* ═══════════════════════════════════════════════
   FORGE — Button Preview, Download, BBCode Export
   Matches original renderBtn / downloadBtn / copyBtnBBCode
   ═══════════════════════════════════════════════ */

import { MODE_CFG } from './config.js';
import { state } from './state.js';
import { showToast } from './utilities.js';

/* ── GET FORGE PALETTE ── */
function getForgePal() {
  const p = state.palette;
  /* lazy import to avoid circular deps */
  const PALETTES = {
    '':          {primary:'#33ff00',accent:'#00ccff',dim:'#1a7a00',bg:'#000400'},
    'pal-amber': {primary:'#ffb000',accent:'#ff6600',dim:'#7a4a00',bg:'#040100'},
    'pal-ice':   {primary:'#00ffee',accent:'#0088ff',dim:'#006655',bg:'#000308'},
    'pal-blood': {primary:'#ff2244',accent:'#ff8800',dim:'#880022',bg:'#040000'},
    'pal-ghost': {primary:'#cccccc',accent:'#888888',dim:'#444444',bg:'#020202'},
    'pal-toxic': {primary:'#aaff00',accent:'#ff00aa',dim:'#447700',bg:'#010300'},
    'pal-deep':  {primary:'#4488ff',accent:'#00ffcc',dim:'#1a3366',bg:'#000210'},
    'pal-solar': {primary:'#ffcc00',accent:'#ff8800',dim:'#886600',bg:'#040200'},
    'pal-matrix':{primary:'#00ff41',accent:'#008f11',dim:'#003300',bg:'#020102'},
    'pal-neon':  {primary:'#ff00ff',accent:'#00ffff',dim:'#880088',bg:'#030003'},
    'pal-rust':  {primary:'#ff6622',accent:'#ffaa44',dim:'#882200',bg:'#040100'},
  };
  return PALETTES[p] || PALETTES[''];
}

/* ── RENDER BUTTON ── */
export function renderBtn() {
  const pal    = getForgePal();
  const label  = (document.getElementById('fg-label')?.value || 'DOWNLOAD').toUpperCase();
  const sub    = (document.getElementById('fg-sub')?.value || '').toUpperCase();
  const url    = document.getElementById('fg-url')?.value || '';
  const style  = document.getElementById('fg-style')?.value || 'solid';
  const W      = parseInt(document.getElementById('fg-size')?.value || 600);
  const H      = 114;

  const canvas = document.getElementById('btn-preview-canvas');
  if (!canvas) return;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);

  /* Background */
  ctx.fillStyle = pal.bg;
  ctx.fillRect(0, 0, W, H);

  /* Scanlines */
  for (let y = 0; y < H; y += 4) {
    ctx.fillStyle = 'rgba(0,0,0,0.10)';
    ctx.fillRect(0, y + 2, W, 2);
  }

  if (style === 'solid') {
    ctx.fillStyle = pal.primary + '1a';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = pal.primary;
    ctx.fillRect(0, 0, 6, H);
    ctx.fillStyle = pal.accent;
    ctx.fillRect(W - 6, 0, 6, H);
  } else if (style === 'outline') {
    ctx.strokeStyle = pal.primary; ctx.lineWidth = 1.5;
    ctx.strokeRect(1, 1, W - 2, H - 2);
    const cs = 21;
    ctx.strokeStyle = pal.accent; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, cs); ctx.lineTo(0, 0); ctx.lineTo(cs, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W - cs, 0); ctx.lineTo(W, 0); ctx.lineTo(W, cs); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, H - cs); ctx.lineTo(0, H); ctx.lineTo(cs, H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W - cs, H); ctx.lineTo(W, H); ctx.lineTo(W, H - cs); ctx.stroke();
  } else {
    ctx.strokeStyle = pal.dim; ctx.lineWidth = 0.5;
    ctx.strokeRect(0.5, 0.5, W - 1, H - 1);
    ctx.strokeStyle = pal.primary; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, H - 1); ctx.lineTo(W, H - 1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(W, 0); ctx.stroke();
  }

  /* Download icon (left) */
  const ix = 45, iy = H / 2;
  ctx.strokeStyle = pal.accent; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(ix, iy - 11); ctx.lineTo(ix, iy + 3); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(ix - 6, iy - 3); ctx.lineTo(ix, iy + 5); ctx.lineTo(ix + 6, iy - 3); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(ix - 8, iy + 9); ctx.lineTo(ix + 8, iy + 9); ctx.stroke();

  /* Main label */
  ctx.font = `15px 'Press Start 2P', monospace`;
  ctx.fillStyle = pal.primary;
  ctx.shadowColor = pal.primary; ctx.shadowBlur = 8;
  ctx.fillText(label, 87, H / 2 - (sub ? 9 : 0));
  ctx.shadowBlur = 0;

  /* Sublabel */
  if (sub) {
    ctx.font = `12px 'Share Tech Mono', monospace`;
    ctx.fillStyle = pal.dim;
    ctx.fillText(sub, 88, H / 2 + 18);
  }

  /* URL right-aligned */
  if (url) {
    const shortUrl = url.replace(/^https?:\/\//, '').slice(0, 32) + (url.replace(/^https?:\/\//, '').length > 32 ? '…' : '');
    ctx.font = `10px 'Share Tech Mono', monospace`;
    ctx.fillStyle = pal.accent + 'bb';
    ctx.textAlign = 'right';
    ctx.fillText('↗ ' + shortUrl, W - 21, H / 2 + 8);
    ctx.textAlign = 'left';
  }

  /* AETER tag bottom right */
  ctx.font = `9px 'Press Start 2P', monospace`;
  ctx.fillStyle = pal.dim;
  ctx.textAlign = 'right';
  ctx.fillText('AETER▮', W - 15, H - 10);
  ctx.textAlign = 'left';
}

/* ── DOWNLOAD BUTTON PNG ── */
export function downloadBtn() {
  const canvas = document.getElementById('btn-preview-canvas');
  if (!canvas) { showToast('OPEN BTN FORGE FIRST'); return; }
  const label = (document.getElementById('fg-label')?.value || 'BUTTON').replace(/\s+/g, '_').toUpperCase();
  const a = document.createElement('a');
  a.download = `AETER_BTN_${label}_${Date.now()}.png`;
  a.href = canvas.toDataURL('image/png');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast('BUTTON PNG DOWNLOADED');
}

/* ── COPY BUTTON BBCODE ── */
export function copyBtnBBCode() {
  const url = document.getElementById('fg-url')?.value || '';
  const label = document.getElementById('fg-label')?.value || 'DOWNLOAD';
  if (!url) { showToast('ADD A URL FIRST'); return; }
  const bb = url ? `[url=${url}][ ${label.toUpperCase()} >> ${url} ][/url]` : label;
  navigator.clipboard.writeText(bb).then(() => showToast('BBCODE COPIED')).catch(() => showToast('COPY ERROR'));
}

/* ── LEGACY ALIASES (for onclick compat) ── */
export function forgeExportPNG() { downloadBtn(); }
export function forgeExportBB()  { copyBtnBBCode(); }
export function forgeExportTXT() {
  /* export button info as TXT */
  const label = document.getElementById('fg-label')?.value || 'BUTTON';
  const url = document.getElementById('fg-url')?.value || '';
  const txt = `AETER BTN FORGE EXPORT\nLabel: ${label}\nURL: ${url}\nStyle: ${document.getElementById('fg-style')?.value || 'solid'}\nDate: ${new Date().toISOString()}`;
  const blob = new Blob([txt], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `AETER_BTN_${label.replace(/\s+/g, '_')}.txt`;
  a.click();
  showToast('TXT EXPORTED');
}

/* ── SYNC SIGNATURE ── */
export function syncSignature() {
  /* Copy current editor data into forge fields */
  const el = id => document.getElementById(id);
  const val = id => { const e = el(id); return e ? e.value : ''; };
  const sig = `${val('f-titulo') || val('f-nombre')}|${val('f-autor')}|${val('f-cat') || val('f-formato')}|${val('f-fecha')}|${val('f-sector')}`;
  const sigField = document.getElementById('forge-sig');
  if (sigField) sigField.value = sig;
  showToast('SIGNATURE SYNCED');
}

/* ── COPY BBCODE (from editor data, for forge button) ── */
export function copyBBCode() {
  const url = document.getElementById('fg-url')?.value || '';
  const label = document.getElementById('fg-label')?.value || 'DOWNLOAD';
  if (!url) { showToast('ADD A URL FIRST'); return; }
  copyBtnBBCode();
}

/* ── INIT FORGE ── */
export function initForge() {
  /* Wire forge input events to trigger re-render */
  ['fg-label','fg-sub','fg-url','fg-style','fg-size'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => renderBtn());
  });
  /* Initial render */
  renderBtn();
}
