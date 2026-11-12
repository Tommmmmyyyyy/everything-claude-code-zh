import { boot } from '../../lib/engine.js';
import { seq, stack, chart, cta, at } from '../../lib/beats.js';
import { panel } from '../../lib/kit.js';

const fv = x => { const r = Math.pow(1.05, 1 / 12) - 1, n = x * 12; return 25 * (Math.pow(1 + r, n) - 1) / r; };
const card = (x, y, w, hgt, at_) => ({ kind: 'custom', at: at_, anim: 'up', build: root => ({ el: panel(root, { x, y, w, hgt }) }) });

boot(async () => seq([
  { fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'SMARTPHONE', y: 228, at: -1 },
    { kind: 'sprite', name: 'phone', cx: 540, by: 720, size: 500, at: -1 },
    { kind: 'head', html: 'UN NOUVEAU<br><span class="a">TOUS LES 2 ANS</span> ?', y: 760, size: 100, at: -1 },
    { kind: 'num', html: '− 20 000<span class="u">€</span>', y: 975, size: 130, color: 'red', at: -1 },
  ], { sfxIn: false }) },
  { at: 'actu', fn: (a, b) => stack(a, b, [
    { kind: 'chip', html: '20 NOVEMBRE 2026', style: 'red', y: 290, size: 64, at: 'actu', anim: 'stamp', sfx: 'stamp' },
    { kind: 'head', html: 'PAYER EN 3 OU 4 FOIS<br>= UN <span class="r">VRAI CRÉDIT</span>', y: 430, size: 88, at: at('actu', .8) },
    { kind: 'row', icon: 'rules', iconColor: 'gold', html: 'VÉRIFICATION', sub: 'DE VOTRE CAPACITÉ À REMBOURSER', y: 680, h: 180, size: 48, at: 'solva' },
    { kind: 'sprite', name: 'card', cx: 540, by: 1150, size: 330, at: at('solva', .4) },
  ], { lab: ['!', 'NOUVELLE RÈGLE'] }) },
  { at: 'prix', fn: (a, b) => stack(a, b, [
    { kind: 'sprite', name: 'phone', cx: 540, by: 620, size: 380, at: 'prix' },
    { kind: 'num', html: '1 200<span class="u">€</span>', y: 640, size: 130, color: 'cream', at: 'prix' },
    { kind: 'mono', html: 'EN 24 FOIS · TAEG ≈ 15 %', y: 790, at: 'p24', color: 'cream' },
    { kind: 'num', html: '≈ 58<span class="u">€/MOIS</span>', y: 840, size: 100, color: 'gold', at: 'mens' },
    { kind: 'chip', html: 'TOTAL : 1 382 €', style: 'ghost', y: 980, size: 50, at: 'total' },
    { kind: 'chip', html: '+ 182 € DE CRÉDIT', style: 'red', y: 1070, size: 56, at: 'cout', anim: 'stamp', sfx: 'stamp' },
  ], { lab: ['01', 'LE CALCUL'] }) },
  { at: 'cycle', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'ET DEUX ANS<br><span class="g">PLUS TARD</span> ?', y: 280, size: 110, at: 'cycle' },
    ...[0, 1, 2, 3, 4].map(i => ({ kind: 'sprite', name: 'phone', cx: 140 + i * 200, by: 820, size: 230, at: at('neuf', i * .35) })),
    ...[0, 1, 2, 3, 4].map(i => ({ kind: 'mono', html: String(2026 + 2 * i), x: 40 + i * 200, w: 200, y: 840, at: at('neuf', i * .35), sfx: false })),
    { kind: 'chip', html: '50 € PAR MOIS… POUR TOUJOURS', style: 'red', y: 960, size: 56, at: 'forever', anim: 'stamp', sfx: 'stamp' },
  ]) },
  { at: 'twist', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'GARDEZ-LE <span class="a">4 ANS</span>', y: 270, size: 110, at: 'twist' },
    card(60, 430, 465, 400, 'twist'), card(555, 430, 465, 400, 'moitie'),
    { kind: 'mono', html: 'TOUS LES 2 ANS', x: 60, w: 465, y: 470, at: 'twist', color: 'cream' },
    { kind: 'num', html: '50<span class="u">€/MOIS</span>', x: 60, w: 465, y: 560, size: 120, color: 'red', at: 'twist' },
    { kind: 'mono', html: 'TOUS LES 4 ANS', x: 555, w: 465, y: 470, at: 'moitie', color: 'cream' },
    { kind: 'num', html: '25<span class="u">€/MOIS</span>', x: 555, w: 465, y: 560, size: 120, color: 'mint', at: 'moitie' },
    { kind: 'chip', html: '25 € D’ÉCART CHAQUE MOIS', style: 'gold', y: 900, size: 56, at: 'diff', anim: 'stamp', sfx: 'stamp' },
  ], { foot: 'TÉLÉPHONE À 1 200 €, HORS REVENTE' }) },
  { at: 'place', fn: (a, b) => chart(a, b, { lab: ['02', 'PLACÉS 30 ANS'], head: '<span class="a">25 €</span> PAR MOIS À 5 %', x: [0, 30], y: [0, 24000],
    xticks: [0, 10, 20, 30], xfmt: v => v + ' ANS', yticks: [0, 8000, 16000, 24000], yfmt: v => v ? (v / 1000) + ' k€' : '0',
    series: [
      { at: 'place', color: 'cream', fn: x => 300 * x, dur: 1.4, width: 7 },
      { at: at('place', .6), color: 'mint', fn: fv, dur: 2.0, width: 10, fill: true },
    ],
    marks: [
      { at: 'res', x: 30, y: fv(30), html: '+ DE 20 000 €', color: 'mint', style: 'mint', dx: -760, dy: -110, size: 44 },
      { at: 'verse', x: 30, y: 9000, html: 'VERSÉ : 9 000 €', color: 'cream', style: 'dark', dx: -760, dy: 30 },
    ],
    legend: [{ html: 'VERSÉ', color: 'cream' }, { html: 'AVEC LES INTÉRÊTS', color: 'mint' }],
    foot: 'SIMULATION · RENDEMENT CONSTANT DE 5 %, NON GARANTI' }) },
  { at: 'credit', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'ET <span class="a">SANS</span> LE CRÉDIT', y: 300, size: 110, at: 'credit' },
    { kind: 'num', html: '+ 182<span class="u">€</span>', y: 480, size: 220, color: 'mint', at: 'credit2' },
    { kind: 'mono', html: 'GARDÉS À CHAQUE ACHAT', y: 730, at: at('credit2', .3), color: 'cream' },
    { kind: 'sprite', name: 'coinstack', cx: 540, by: 1120, size: 300, at: at('credit2', .5) },
  ]) },
  { at: 'astuce', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'MON <span class="a">ASTUCE</span>', y: 270, size: 110, at: 'astuce' },
    { kind: 'row', icon: 'check', iconColor: 'mint', html: 'UNE BONNE COQUE', y: 460, h: 160, size: 48, at: 'coque' },
    { kind: 'row', icon: 'check', iconColor: 'mint', html: 'BATTERIE NEUVE À 3 ANS', y: 640, h: 160, size: 48, at: at('coque', 1.0) },
    { kind: 'row', icon: 'check', iconColor: 'mint', html: 'OU RECONDITIONNÉ', y: 820, h: 160, size: 48, at: 'recond' },
  ]) },
  { at: 'cta', fn: (a, b) => cta(a, b, { top: 'SMARTPHONE', sprites: [{ name: 'phone', cx: 540, by: 900, size: 520 }], head: 'VOUS GARDEZ VOTRE TÉLÉPHONE<br><span class="a">COMBIEN</span> DE TEMPS ?', headY: 960, headSize: 70, follow: 'follow' }) },
]));
