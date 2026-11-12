import { boot } from '../../lib/engine.js';
import { seq, stack, hbars, cta, at } from '../../lib/beats.js';

const grid = [
  { name: 'mattress', cx: 290, by: 870, size: 280, lab: 'LE MATELAS', cue: 'matelas' },
  { name: 'passbook', cx: 790, by: 870, size: 260, lab: 'LE LIVRET A', cue: 'livret' },
  { name: 'globe', cx: 290, by: 1150, size: 260, lab: 'LA BOURSE', cue: 'bourse' },
  { name: 'goldbars', cx: 790, by: 1150, size: 280, lab: 'L’OR', cue: 'or' },
];

boot(async () => seq([
  { fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'AN 2000 → AUJOURD’HUI', y: 228, at: -1 },
    { kind: 'num', html: '100<span class="u">€</span>', y: 280, size: 200, color: 'gold', at: -1 },
    { kind: 'head', html: 'LEQUEL VOUS REND<br>LE <span class="a">PLUS RICHE</span> ?', y: 480, size: 66, at: -1 },
    ...grid.flatMap(g => [
      { kind: 'sprite', name: g.name, cx: g.cx, by: g.by, size: g.size, at: -1, pulse: g.cue },
      { kind: 'mono', html: g.lab, x: g.cx - 250, w: 500, y: g.by + 8, at: -1, color: 'cream', pulse: g.cue, sfx: false },
    ]),
  ], { sfxIn: false }) },
  { at: 'loop', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'LE DERNIER<br>RÉSULTAT VA VOUS<br><span class="g">SURPRENDRE</span>', y: 330, size: 110, at: 'loop' },
    { kind: 'sprite', name: 'goldbars', cx: 540, by: 1120, size: 360, at: at('loop', .5), base: { s: 1 }, dim: at('loop', .5) },
  ]) },
  { at: 'infl', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'D’ABORD, L’<span class="r">INFLATION</span>', y: 280, size: 84, at: 'infl' },
    { kind: 'num', html: '100<span class="u">€</span>', x: 40, w: 500, y: 430, size: 150, color: 'cream', at: 'infl2' },
    { kind: 'mono', html: 'EN 2000', x: 40, w: 500, y: 600, at: 'infl2' },
    { kind: 'num', html: '≈ 150<span class="u">€</span>', x: 540, w: 500, y: 430, size: 150, color: 'red', at: at('infl2', 1.5) },
    { kind: 'mono', html: 'AUJOURD’HUI', x: 540, w: 500, y: 600, at: at('infl2', 1.5) },
    { kind: 'mono', html: 'POUR ACHETER LA MÊME CHOSE', y: 680, at: at('infl2', 2.2), color: 'cream' },
    { kind: 'sprite', name: 'bills', cx: 540, by: 1120, size: 380, at: at('infl2', .3) },
  ], { foot: 'CONVERTISSEUR DE POUVOIR D’ACHAT INSEE' }) },
  { at: 'mat', fn: (a, b) => stack(a, b, [
    { kind: 'sprite', name: 'mattress', cx: 540, by: 620, size: 460, at: 'mat' },
    { kind: 'mono', html: 'LE MATELAS', y: 270, at: 'mat', color: 'cream' },
    { kind: 'num', html: '100<span class="u">€</span>', y: 680, size: 190, color: 'cream', at: 'mat2', until: 'mat3' },
    { kind: 'num', html: '≈ 65<span class="u">€</span>', y: 680, size: 190, color: 'red', at: 'mat3', anim: 'stamp', sfx: 'stamp' },
    { kind: 'mono', html: 'EN POUVOIR D’ACHAT', y: 900, at: at('mat3', .3), color: 'cream' },
  ], { lab: ['01', 'LE MATELAS'] }) },
  { at: 'liv', fn: (a, b) => stack(a, b, [
    { kind: 'sprite', name: 'passbook', cx: 540, by: 640, size: 420, at: 'liv' },
    { kind: 'odo', to: 160, digits: 3, prefix: '≈&nbsp;', y: 680, size: 190, color: 'cream', at: 'liv2' },
    { kind: 'chip', html: 'À PEINE MIEUX QUE L’INFLATION', style: 'ghost', y: 920, size: 48, at: 'liv3' },
  ], { lab: ['02', 'LE LIVRET A'], foot: 'ESTIMATION · TAUX DU LIVRET A DE 2000 À 2026' }) },
  { at: 'bou', fn: (a, b) => stack(a, b, [
    { kind: 'sprite', name: 'globe', cx: 540, by: 640, size: 420, at: 'bou' },
    { kind: 'mono', html: 'UN FONDS SUR LES GRANDES ENTREPRISES DU MONDE', y: 650, at: at('bou', .6), color: 'cream' },
    { kind: 'odo', to: 500, digits: 3, prefix: '≈&nbsp;', y: 700, size: 190, color: 'mint', at: 'bou2' },
    { kind: 'chip', html: 'MALGRÉ LES KRACHS : 2001 · 2008 · 2020', style: 'red', y: 940, size: 46, at: 'krach' },
  ], { lab: ['03', 'LA BOURSE'], foot: 'MSCI WORLD EN EUROS, DIVIDENDES RÉINVESTIS · ≈ 6,6 %/AN DEPUIS FIN 2000' }) },
  { at: 'gold', fn: (a, b) => stack(a, b, [
    { kind: 'sprite', name: 'goldbars', cx: 540, by: 620, size: 440, at: 'gold' },
    { kind: 'mono', html: 'L’ONCE D’OR', y: 270, at: 'gold', color: 'cream' },
    { kind: 'num', html: '300<span class="u">€</span>', x: 40, w: 440, y: 660, size: 130, color: 'cream', at: 'gold2' },
    { kind: 'mono', html: 'EN 2000', x: 40, w: 440, y: 800, at: 'gold2' },
    { kind: 'head', html: '→', y: 660, size: 120, at: 'gold3', color: 'var(--muted)' },
    { kind: 'num', html: '3 500<span class="u">€</span>', x: 560, w: 480, y: 660, size: 130, color: 'gold', at: 'gold3' },
    { kind: 'mono', html: 'AUJOURD’HUI', x: 560, w: 480, y: 800, at: 'gold3' },
    { kind: 'odo', to: 1200, digits: 4, prefix: '≈&nbsp;', y: 870, size: 170, color: 'gold', at: 'res' },
    { kind: 'chip', html: '× 12', style: 'gold', y: 1080, size: 80, at: 'x12', anim: 'stamp', sfx: 'stamp' },
  ], { lab: ['04', 'L’OR'] }) },
  { at: 'twist', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'TOUT DANS L’OR ?<br><span class="r">PAS SI VITE</span>', y: 280, size: 100, at: 'twist' },
    { kind: 'row', icon: 'cross', iconColor: 'red', html: 'DE 1980 À 2000', sub: 'L’OR A PERDU PLUS DE LA MOITIÉ DE SA VALEUR', y: 520, h: 180, size: 50, at: 'gold4' },
    { kind: 'chip', html: 'LE PASSÉ NE PRÉDIT PAS L’AVENIR', style: 'ghost', y: 780, size: 46, at: 'passe' },
  ]) },
  { at: 'lecon', fn: (a, b) => hbars(a, b, { lab: ['05', 'LA VRAIE LEÇON'], head: 'VOS 100 € <span class="a">AUJOURD’HUI</span>', max: 1200, y0: 430, gapY: 180,
    rows: [
      { at: 'lecon', n: 'MATELAS', nSize: 40, value: 65, display: '65 €', color: 'red', per: 'EN POUVOIR D’ACHAT' },
      { at: at('lecon', .3), n: 'LIVRET A', nSize: 40, value: 160, display: '160 €', color: 'cream' },
      { at: at('lecon', .6), n: 'BOURSE', nSize: 40, value: 500, display: '500 €', color: 'mint' },
      { at: at('lecon', .9), n: 'OR', nSize: 40, value: 1200, display: '1 200 €', color: 'gold' },
    ], foot: 'L’ARGENT QUI DORT PERD DE LA VALEUR · PERFORMANCES PASSÉES' }) },
  { at: 'cta', fn: (a, b) => cta(a, b, { top: 'AN 2000 → AUJOURD’HUI', sprites: [{ name: 'mattress', cx: 330, by: 900, size: 400 }, { name: 'goldbars', cx: 760, by: 900, size: 380 }], head: 'VOUS AURIEZ CHOISI<br><span class="a">QUOI</span> EN 2000 ?', headY: 960, headSize: 92, follow: 'follow' }) },
]));
