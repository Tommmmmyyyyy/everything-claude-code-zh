import { boot } from '../../lib/engine.js';
import { seq, stack, splitbar, chart, cta, at } from '../../lib/beats.js';
import { panel } from '../../lib/kit.js';

const P = 250000, r = .0385 / 12, pmt = P * r / (1 - Math.pow(1 + r, -300));
const owed = x => { const k = x * 12; return Math.max(0, P * Math.pow(1 + r, k) - pmt * (Math.pow(1 + r, k) - 1) / r); };
const paid = x => pmt * 12 * x;
const card = (x, y, w, hgt, at_) => ({ kind: 'custom', at: at_, anim: 'up', build: root => ({ el: panel(root, { x, y, w, hgt }) }) });

boot(async () => seq([
  { fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'CRÉDIT IMMOBILIER · 25 ANS', y: 228, at: -1 },
    { kind: 'sprite', name: 'house', cx: 540, by: 700, size: 470, at: -1 },
    { kind: 'mono', html: 'VOUS EMPRUNTEZ', y: 735, at: -1, color: 'cream' },
    { kind: 'num', html: '250 000<span class="u">€</span>', y: 780, size: 150, color: 'gold', at: -1 },
    { kind: 'head', html: 'VOUS EN RENDEZ<br><span class="a">COMBIEN</span> ?', y: 960, size: 92, at: -1, until: 'rend' },
    { kind: 'mono', html: 'VOUS EN RENDEZ', y: 960, at: 'rend', color: 'cream' },
    { kind: 'num', html: '+ DE 400 000<span class="u">€</span>', y: 1010, size: 112, color: 'red', at: 'rend', anim: 'stamp' },
  ], { sfxIn: false }) },
  { at: 'loop', fn: (a, b) => stack(a, b, [
    { kind: 'sprite', name: 'hourglass', cx: 540, by: 820, size: 520, at: 'loop' },
    { kind: 'head', html: 'LE PIRE ARRIVE<br>LES <span class="r">10 PREMIÈRES</span> ANNÉES', y: 880, size: 92, at: at('loop', 1.6) },
  ]) },
  { at: 'taux', fn: (a, b) => stack(a, b, [
    { kind: 'num', html: '3,85<span class="u">%</span>', y: 290, size: 180, color: 'mint', at: 'taux' },
    { kind: 'mono', html: 'TAUX MOYEN SUR 25 ANS · HORS ASSURANCE', y: 490, at: at('taux', .4) },
    { kind: 'row', icon: 'cal', iconColor: 'cream', html: 'MENSUALITÉ', sub: 'CAPITAL + INTÉRÊTS', right: '1 299 €', rSize: 64, y: 600, at: 'mens' },
    { kind: 'row', icon: 'heart', iconColor: 'gold', html: 'ASSURANCE', sub: 'ENVIRON 0,30 % PAR AN', right: '≈ 60 €', rSize: 64, y: 800, at: 'ass' },
    { kind: 'sprite', name: 'coinstack', cx: 540, by: 1160, size: 220, at: at('ass', .4) },
  ], { lab: ['01', 'LE CRÉDIT'], foot: 'SIMULATION : 250 000 € SUR 25 ANS À 3,85 % · NOVEMBRE 2026' }) },
  { at: 'int', fn: (a, b) => splitbar(a, b, { lab: ['02', 'LE VRAI COÛT'], head: 'AU TOTAL : <span class="r">408 000 €</span>', total: 408442,
    rows: [
      { at: 'int', label: 'CAPITAL', sub: 'CE QUE VOUS AVEZ EMPRUNTÉ', value: 250000, display: '250 000', color: 'cream' },
      { at: at('int', .9), label: 'INTÉRÊTS', sub: 'POUR LA BANQUE', value: 139692, display: '139 700', color: 'red' },
      { at: 'assu', label: 'ASSURANCE', sub: 'SUR 25 ANS', value: 18750, display: '18 750', color: 'gold' },
    ], notes: [{ at: at('assu', 1.4), html: 'COÛT DU CRÉDIT ≈ 158 000 €', style: 'red', y: 1010, size: 56 }], foot: 'MENSUALITÉS × 300 MOIS + ASSURANCE · HORS FRAIS DE DOSSIER' }) },
  { at: 'first', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'VOTRE <span class="g">1ʳᵉ</span> MENSUALITÉ', y: 270, size: 84, at: 'first' },
    { kind: 'num', html: '1 299<span class="u">€</span>', y: 370, size: 120, color: 'cream', at: 'first' },
    { kind: 'sprite', name: 'bank', cx: 290, by: 840, size: 400, at: 'first2' },
    { kind: 'num', html: '802<span class="u">€</span>', x: 40, w: 500, y: 860, size: 140, color: 'red', at: 'first2' },
    { kind: 'mono', html: 'INTÉRÊTS → LA BANQUE', x: 40, w: 500, y: 1015, at: 'first2' },
    { kind: 'sprite', name: 'house', cx: 790, by: 840, size: 360, at: 'first3' },
    { kind: 'num', html: '497<span class="u">€</span>', x: 540, w: 500, y: 860, size: 140, color: 'mint', at: 'first3' },
    { kind: 'mono', html: 'CAPITAL → VOTRE MAISON', x: 540, w: 500, y: 1015, at: 'first3' },
    { kind: 'chip', html: '62 % POUR LA BANQUE', style: 'red', y: 1100, size: 46, at: at('first3', 1.4) },
  ], { lab: ['03', 'LE PIÈGE'] }) },
  { at: 'ten', fn: (a, b) => chart(a, b, { lab: ['04', '10 ANS PLUS TARD'], x: [0, 25], y: [0, 400000],
    xticks: [0, 5, 10, 15, 20, 25], xfmt: v => v + ' ANS', yticks: [0, 100000, 200000, 300000, 400000], yfmt: v => v ? (v / 1000) + ' k€' : '0',
    series: [
      { at: 'ten', color: 'red', fn: owed, dur: 1.4, width: 10 },
      { at: at('ten', .5), color: 'gold', fn: paid, dur: 1.4, width: 10 },
    ],
    marks: [
      { at: at('ten', 1.9), x: 10, y: paid(10), html: 'VERSÉ : 156 000 €', color: 'gold', style: 'gold', dy: -310, dx: -700 },
      { at: at('ten2', .5), x: 10, y: owed(10), html: 'ENCORE DÛ : 177 000 €', color: 'red', style: 'red', dy: -205, dx: -700 },
      { at: at('half', .3), x: 15.4, y: 125000, html: 'MOITIÉ REMBOURSÉE : 15 ANS ½', color: 'mint', style: 'mint', dy: 120, dx: -440 },
    ],
    legend: [{ html: 'TOTAL VERSÉ', color: 'gold' }, { html: 'CAPITAL ENCORE DÛ', color: 'red' }],
  }) },
  { at: 'vingt', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: '25 ANS <span class="a">OU</span> 20 ANS ?', y: 260, size: 96, at: 'vingt' },
    card(60, 400, 465, 470, 'vingt'), card(555, 400, 465, 470, at('vingt', .5)),
    { kind: 'mono', html: 'SUR 25 ANS', x: 60, w: 465, y: 430, at: 'vingt', color: 'cream' },
    { kind: 'num', html: '1 299<span class="u">€/MOIS</span>', x: 60, w: 465, y: 490, size: 84, color: 'cream', at: 'vingt' },
    { kind: 'mono', html: 'INTÉRÊTS', x: 60, w: 465, y: 640, at: 'vingt' },
    { kind: 'num', html: '139 700<span class="u">€</span>', x: 60, w: 465, y: 690, size: 84, color: 'red', at: 'vingt' },
    { kind: 'mono', html: 'SUR 20 ANS', x: 555, w: 465, y: 430, at: at('vingt', .5), color: 'cream' },
    { kind: 'num', html: '1 476<span class="u">€/MOIS</span>', x: 555, w: 465, y: 490, size: 84, color: 'gold', at: 'v2' },
    { kind: 'mono', html: 'INTÉRÊTS', x: 555, w: 465, y: 640, at: 'v3' },
    { kind: 'num', html: '104 200<span class="u">€</span>', x: 555, w: 465, y: 690, size: 84, color: 'mint', at: 'v3' },
    { kind: 'chip', html: '+ 177 € PAR MOIS', style: 'gold', y: 930, size: 48, at: at('v2', .4) },
    { kind: 'chip', html: '− 35 500 € D’INTÉRÊTS', style: 'mint', y: 1040, size: 62, at: at('v3', .6), anim: 'stamp', sfx: 'stamp' },
  ], { lab: ['05', 'L’ASTUCE'], foot: '20 ANS À 3,70 % · BAROMÈTRES DE NOVEMBRE 2026' }) },
  { at: 'tips', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'DEUX <span class="a">RÉFLEXES</span>', y: 280, size: 110, at: 'tips' },
    { kind: 'row', icon: 'check', iconColor: 'mint', html: 'CHANGEZ D’ASSURANCE', sub: 'POSSIBLE À TOUT MOMENT · LOI LEMOINE', y: 470, h: 180, size: 52, at: 'tip1' },
    { kind: 'row', icon: 'up', iconColor: 'gold', html: 'REMBOURSEZ EN AVANCE', sub: 'MÊME UN PEU · VÉRIFIEZ LES PÉNALITÉS', y: 680, h: 180, size: 52, at: 'tip2' },
    { kind: 'sprite', name: 'coinstack', cx: 540, by: 1150, size: 250, at: at('tip2', .4) },
  ]) },
  { at: 'cta', fn: (a, b) => cta(a, b, { top: 'CRÉDIT IMMOBILIER', sprites: [{ name: 'house', cx: 540, by: 900, size: 560 }], head: 'VOUS AVEZ EMPRUNTÉ<br>SUR <span class="a">COMBIEN</span> D’ANNÉES ?', headY: 960, headSize: 82, follow: 'follow' }) },
]));
