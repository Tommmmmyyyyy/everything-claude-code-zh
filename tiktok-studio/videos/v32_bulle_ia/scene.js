import { boot, cue } from '../../lib/engine.js';
import { seq, stack, hbars, chart, cta, at, path } from '../../lib/beats.js';

// stylised Cisco share price ($): the March 2000 peak and October 2002 trough are real, the rest is approximate
const cisco = path([[1998, 15], [1999, 32], [1999.9, 54], [2000.23, 80], [2000.6, 62], [2000.99, 38], [2001.3, 17], [2001.9, 19], [2002.3, 15], [2002.78, 8.6], [2003.5, 19]]);

boot(async () => seq([
  { fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'INTELLIGENCE ARTIFICIELLE', y: 228, at: -1 },
    { kind: 'logo', name: 'nvidia', cx: 260, cy: 420, size: 200, at: -1 },
    { kind: 'logo', name: 'openai', cx: 540, cy: 420, size: 200, at: -1 },
    { kind: 'logo', name: 'anthropic', cx: 820, cy: 420, size: 200, at: -1 },
    { kind: 'num', html: '+ DE 8 000<span class="u">MILLIARDS $</span>', y: 580, size: 110, color: 'gold', at: -1 },
    { kind: 'head', html: '<span class="r">BULLE</span> OU<br><span class="a">RÉVOLUTION</span> ?', y: 800, size: 116, at: -1 },
  ], { sfxIn: false }) },
  { at: 'loop', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'LE CHIFFRE QUE<br>LES INVESTISSEURS<br><span class="g">REGARDENT</span>', y: 300, size: 96, at: 'loop' },
    { kind: 'num', html: '?', y: 690, size: 340, color: 'gold', at: 'loop2', anim: 'pop' },
  ]) },
  { at: 'nvidia', fn: (a, b) => hbars(a, b, { lab: ['01', 'EN BOURSE'], head: 'LEUR <span class="g">VALEUR</span>', max: 6800, y0: 470, gapY: 200,
    rows: [
      { at: 'nv2', n: '', value: 5500, display: '≈ 5 500 MD $', vSize: 46, color: 'mint', per: 'NVIDIA · LES PUCES DE L’IA' },
      { at: 'oa2', n: '', value: 1250, display: '≈ 1 250 MD $', vSize: 46, color: 'cream', per: 'OPENAI · CHATGPT' },
      { at: 'anth', n: '', value: 1400, display: '≈ 1 400 MD $', vSize: 46, color: 'cream', per: 'ANTHROPIC · CLAUDE' },
    ], notes: [
      { kind: 'logo', name: 'nvidia', at: 'nvidia', cx: 190, cy: 535, size: 110 },
      { kind: 'logo', name: 'openai', at: 'openai', cx: 190, cy: 735, size: 110 },
      { kind: 'logo', name: 'anthropic', at: 'anth', cx: 190, cy: 935, size: 110 },
      { at: 'cac', html: 'NVIDIA = 2 × LE CAC 40', style: 'gold', y: 1095, size: 46 },
    ], foot: 'VALORISATIONS D’OCTOBRE-NOVEMBRE 2026' }) },
  { at: 'ratio', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'VALEUR ÷ <span class="a">VENTES</span>', y: 290, size: 116, at: 'ratio' },
    { kind: 'mono', html: '= COMBIEN D’ANNÉES DE VENTES VOUS PAYEZ', y: 450, at: 'r2', color: 'cream' },
    { kind: 'logo', name: 'openai', cx: 540, cy: 620, size: 140, at: 'oa3' },
    { kind: 'num', html: '≈ 50<span class="u">MD $ / AN</span>', y: 720, size: 100, color: 'cream', at: 'oa3' },
    { kind: 'mono', html: 'DE VENTES · ESTIMATION', y: 840, at: at('oa3', .4) },
    { kind: 'chip', html: '× 25', style: 'gold', y: 920, size: 120, at: 'x25', anim: 'stamp', sfx: 'stamp' },
  ], { lab: ['02', 'LE CHIFFRE CLÉ'] }) },
  { at: 'cisco', fn: (a, b) => chart(a, b, { lab: ['03', 'LA BULLE INTERNET'], head: 'CISCO, <span class="r">EN 2000</span>', x: [1998, 2003.6], y: [0, 90],
    xticks: [1998, 1999, 2000, 2001, 2002, 2003], xfmt: v => String(v), yticks: [0, 30, 60, 90], yfmt: v => v + ' $',
    series: [{ at: 'cisco', color: 'red', fn: cisco, dur: Math.max(3, cue('moins89') - cue('cisco') + .6), width: 9 }],
    marks: [
      { at: at('cisco', 1.2), x: 2000.23, y: 80, html: '≈ 30 × SES VENTES', color: 'cream', style: 'dark', dx: -540, dy: -100, vline: false },
      { at: 'moins89', x: 2002.78, y: 8.6, html: '− 89 %', color: 'red', style: 'red', dx: -540, dy: -120, vline: false, size: 52 },
    ],
    notes: [{ kind: 'logo', name: 'cisco', at: 'cisco', cx: 930, cy: 300, size: 110 }, { at: 'nasdaq', html: 'NASDAQ : − 78 %', style: 'red', x: 230, y: 560, size: 50 }],
    foot: 'COURBE SIMPLIFIÉE · MARS 2000 → OCTOBRE 2002' }) },
  { at: 'diff', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'SAUF <span class="a">QUE…</span>', y: 270, size: 110, at: 'diff' },
    { kind: 'logo', name: 'anthropic', cx: 300, cy: 520, size: 130, at: 'd2' },
    { kind: 'num', html: '× 14', x: 380, w: 600, y: 440, size: 170, color: 'mint', at: 'd2' },
    { kind: 'mono', html: 'CHIFFRE D’AFFAIRES EN UN AN', y: 640, at: at('d2', .4), color: 'cream' },
    { kind: 'row', icon: 'check', iconColor: 'mint', html: 'SI ÇA CONTINUE', sub: 'CES PRIX PEUVENT SE JUSTIFIER', y: 730, h: 160, size: 46, at: 'd3' },
    { kind: 'row', icon: 'cross', iconColor: 'red', html: 'SINON', sub: 'LA CHUTE PEUT ÊTRE VIOLENTE', y: 910, h: 160, size: 46, at: 'd4' },
  ]) },
  { at: 'lecon', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'PERSONNE<br>NE <span class="g">SAIT</span>', y: 300, size: 140, at: 'lecon' },
    { kind: 'mono', html: 'UNE BULLE SE RECONNAÎT APRÈS', y: 600, at: 'l2', color: 'cream' },
    { kind: 'chip', html: 'PAS TOUS SES ŒUFS DANS LE MÊME PANIER', style: 'mint', y: 690, size: 44, at: 'l3', anim: 'stamp', sfx: 'stamp' },
    { kind: 'sprite', name: 'coinpile', cx: 540, by: 1140, size: 360, at: at('l3', .3) },
  ], { foot: 'PAS UN CONSEIL D’INVESTISSEMENT' }) },
  { at: 'cta', fn: (a, b) => cta(a, b, { top: 'INTELLIGENCE ARTIFICIELLE', logos: [{ name: 'nvidia', cx: 290, cy: 620, size: 190 }, { name: 'openai', cx: 540, cy: 620, size: 190 }, { name: 'anthropic', cx: 790, cy: 620, size: 190 }], head: 'BULLE OU RÉVOLUTION ?<br>VOUS EN PENSEZ <span class="a">QUOI</span> ?', headY: 960, headSize: 84, follow: 'follow' }) },
]));
