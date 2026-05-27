/* ═══════════════════════════════════════════════
   STATE — Shared Application State
   ═══════════════════════════════════════════════ */

export const state = {
  mode:     'TEXTO',
  palette:  '',
  records:  [],
  hashMap:  {},
  mem:      [],
  editId:   null,
  saveFile: null,
  currentItemIdx: -1,
};

/* ── Notify listeners on state change ── */
const listeners = [];

export function subscribe(fn) {
  listeners.push(fn);
}

export function notify() {
  listeners.forEach(fn => fn(state));
}

/* ── Convenience helpers ── */
export function setMode(m) {
  state.mode = m;
  notify();
}

export function setPalette(p) {
  state.palette = p;
  notify();
}

export function setRecords(records) {
  state.records = records;
  state.currentItemIdx = -1;
  notify();
}

export function getCurrentRecord() {
  if (state.currentItemIdx < 0 || state.currentItemIdx >= state.records.length) return null;
  return state.records[state.currentItemIdx];
}
