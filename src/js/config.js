/* ═══════════════════════════════════════════════
   CONFIG — Constants, Mode Config, Palettes, Field Definitions
   ═══════════════════════════════════════════════ */

export const FONT_SIZE = 15;
export const LINE_H    = 30;
export const PAD_X     = 27;
export const PAD_Y     = 24;

export const MODE_CFG = {
  TEXTO:     { color:'#33ff00', label:'TEXT_RECORD',      badge:'TEXT — DOCUMENTARY RECORD'    },
  ARTIST:    { color:'#ff00ff', label:'ARTIST_PROFILE',   badge:'ARTIST — CREATOR PROFILE'     },
  ARTEFACTO: { color:'#ffff00', label:'ARTIFACT_FILE',    badge:'ARTIFACT — CULTURAL OBJECT'   },
  SOFTWARE:  { color:'#00ccff', label:'SOFTWARE_REGISTRY',badge:'SOFTWARE — SYSTEM APPLICATION'},
};

export const PALETTES = {
  '':          {primary:'#33ff00',accent:'#00ccff',highlight:'#ff00ff',warn:'#ffff00',dim:'#1a7a00',bg:'#000400',border:'#144414'},
  'pal-amber': {primary:'#ffb000',accent:'#ff6600',highlight:'#ff2200',warn:'#ffdd00',dim:'#7a4a00',bg:'#040100',border:'#442200'},
  'pal-ice':   {primary:'#00ffee',accent:'#0088ff',highlight:'#aa00ff',warn:'#00ffaa',dim:'#006655',bg:'#000308',border:'#003344'},
  'pal-blood': {primary:'#ff2244',accent:'#ff8800',highlight:'#ff00aa',warn:'#ffcc00',dim:'#880022',bg:'#040000',border:'#440010'},
  'pal-ghost': {primary:'#cccccc',accent:'#888888',highlight:'#ffffff',warn:'#aaaaaa',dim:'#444444',bg:'#020202',border:'#222222'},
  'pal-toxic': {primary:'#aaff00',accent:'#ff00aa',highlight:'#ffff00',warn:'#00ffaa',dim:'#447700',bg:'#010300',border:'#224400'},
  'pal-deep':  {primary:'#4488ff',accent:'#00ffcc',highlight:'#ff66ff',warn:'#88ccff',dim:'#1a3366',bg:'#000210',border:'#0a1a44'},
  'pal-solar': {primary:'#ffcc00',accent:'#ff8800',highlight:'#ff4400',warn:'#ffffff',dim:'#886600',bg:'#040200',border:'#443300'},
  'pal-matrix':{primary:'#00ff41',accent:'#008f11',highlight:'#00ff41',warn:'#003b00',dim:'#003300',bg:'#020102',border:'#003300'},
  'pal-neon':  {primary:'#ff00ff',accent:'#00ffff',highlight:'#ffff00',warn:'#ff88ff',dim:'#880088',bg:'#030003',border:'#440044'},
  'pal-rust':  {primary:'#ff6622',accent:'#ffaa44',highlight:'#ff2200',warn:'#ffddaa',dim:'#882200',bg:'#040100',border:'#441100'},
};

export const MODE_FIELDS = {
  TEXTO: [
    {id:'f-titulo',  label:'TITLE'},
    {id:'f-autor',   label:'MAKER'},
    {id:'f-cat',     label:'CATEGORY',  type:'combo', list:'dl-cat-texto'},
    {id:'f-fecha',   label:'DATE'},
    {id:'f-sector',  label:'REGION',    type:'combo', list:'dl-sector'},
  ],
  ARTIST: [
    {id:'f-nombre',  label:'NAME'},
    {id:'f-sector',  label:'REGION',    type:'combo', list:'dl-sector'},
    {id:'f-pais',    label:'COUNTRY'},
    {id:'f-campo',   label:'FIELD',     type:'combo', list:'dl-campo'},
  ],
  ARTEFACTO: [
    {id:'f-titulo',  label:'TITLE'},
    {id:'f-formato', label:'FORMAT',    type:'combo', list:'dl-formato'},
    {id:'f-autor',   label:'MAKER'},
    {id:'f-cat',     label:'CATEGORY',  type:'combo', list:'dl-cat-texto'},
    {id:'f-fecha',   label:'DATE'},
    {id:'f-sector',  label:'REGION',    type:'combo', list:'dl-sector'},
  ],
  SOFTWARE: [
    {id:'f-nombre',  label:'APP NAME'},
    {id:'f-version', label:'VERSION'},
    {id:'f-cat',     label:'CATEGORY',  type:'combo', list:'dl-cat-soft'},
    {id:'f-prop',    label:'PURPOSE'},
    {id:'f-sector',  label:'REGION',    type:'combo', list:'dl-sector'},
  ],
};

export const NOTAS_LABELS = {
  TEXTO:'OPERATIVE_NOTES', ARTIST:'OPERATIVE_NOTES', ARTEFACTO:'NOTES / IMPACT', SOFTWARE:'NOTES',
};

export const LOGO = [
  "  /\\  | ____|_   _| | | | ____|  _ \\",
  " /  \\ |  _|   | |  | |_| |  _| | |_)",
  "/  \\ \\| |___  | |  |  _  | |___|  _ <",
  "/__/ \\_\\____| |_|  |_| |_|_____|_| \\_\\",
];
