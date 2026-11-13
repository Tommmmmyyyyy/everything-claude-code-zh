import { boot, cue } from '../../lib/engine.js';
import { seq, stack, chart, cta, at } from '../../lib/beats.js';

// days from 1 October: 100 € in October, 150 € from 3 November, back to 100 € on Black Friday (27 November = day 57)
const price = x => x < 33 ? 100 : x < 57 ? 150 : 100;

boot(async () => seq([
  { fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'BLACK FRIDAY · 27 NOVEMBRE', y: 228, at: -1 },
    { kind: 'sprite', name: 'pricetag', cx: 560, by: 700, size: 500, at: -1 },
    { kind: 'num', html: '− 50<span class="u">%</span>', y: 700, size: 200, color: 'red', at: -1 },
    { kind: 'head', html: 'VRAIE PROMO<br>OU <span class="r">ARNAQUE</span> ?', y: 930, size: 100, at: -1 },
    { kind: 'chip', html: '1 PROMO SUR 3 TROMPEUSE', style: 'red', y: 1150, size: 44, at: at('faux', .8) },
  ], { sfxIn: false }) },
  { at: 'loop', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'LA TECHNIQUE<br>DES <span class="r">VENDEURS</span>', y: 300, size: 110, at: 'loop' },
    { kind: 'sprite', name: 'shopbag', cx: 540, by: 1080, size: 480, at: at('loop', .3) },
  ]) },
  { at: 'date', fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'VENDREDI', y: 270, at: 'date', color: 'cream' },
    { kind: 'num', html: '27 NOV.', y: 310, size: 160, color: 'gold', at: 'date' },
    { kind: 'num', html: '27<span class="u">%</span>', y: 560, size: 180, color: 'mint', at: 'record' },
    { kind: 'mono', html: 'DES FRANÇAIS Y FERONT L’ESSENTIEL', y: 770, at: at('record', .4), color: 'cream' },
    { kind: 'mono', html: 'DE LEURS ACHATS DE NOËL', y: 806, at: at('record', .4), color: 'cream' },
    { kind: 'chip', html: 'RECORD', style: 'gold', y: 880, size: 64, at: 'rec2', anim: 'stamp', sfx: 'stamp' },
    { kind: 'sprite', name: 'shopbag', cx: 540, by: 1170, size: 220, at: at('rec2', .3) },
  ], { foot: 'BAROMÈTRE HAVAS MARKET / YOUGOV, OCTOBRE 2026' }) },
  { at: 'tech', fn: (a, b) => chart(a, b, { lab: ['01', 'LA TECHNIQUE'], head: 'LE PRIX D’UN <span class="g">CASQUE</span>', x: [0, 60], y: [0, 180],
    xticks: [0, 31, 57], xfmt: v => ({ 0: '1ᵉʳ OCT.', 31: '1ᵉʳ NOV.', 57: 'BLACK FRIDAY' })[v], yticks: [0, 50, 100, 150], yfmt: v => v + ' €',
    series: [{ at: 't1', color: 'cream', fn: price, dur: Math.max(3, cue('t4') - cue('t1') + .6), width: 10 }],
    marks: [
      { at: at('t1', .6), x: 15, y: 100, html: '100 € EN OCTOBRE', color: 'cream', style: 'dark', dx: -540, dy: -110, vline: false },
      { at: 't2', x: 44, y: 150, html: '150 € DÉBUT NOVEMBRE', color: 'red', style: 'red', dx: -700, dy: -110, vline: false },
      { at: 't4', x: 58, y: 100, html: '« − 33 % » = 100 €', color: 'gold', style: 'gold', dx: -860, dy: 50 },
    ],
    notes: [{ at: 't5', html: 'LE MÊME PRIX QU’EN OCTOBRE !', style: 'red', y: 1130, size: 46 }] }) },
  { at: 'loi', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'LA LOI <span class="a">L’INTERDIT</span>', y: 290, size: 110, at: 'loi' },
    { kind: 'row', icon: 'rules', iconColor: 'mint', html: 'DEPUIS 2022', sub: 'RÉDUCTION SUR LE PRIX LE PLUS BAS DES 30 DERNIERS JOURS', y: 480, h: 190, size: 52, at: 'loi2' },
    { kind: 'sprite', name: 'deed', cx: 540, by: 1100, size: 380, at: at('loi2', .4) },
  ], { foot: 'ARTICLE L112-1-1 DU CODE DE LA CONSOMMATION' }) },
  { at: 'faille', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'SAUF <span class="r">QUE…</span>', y: 290, size: 120, at: 'faille' },
    { kind: 'row', icon: 'cross', iconColor: 'red', html: 'LE « PRIX CONSEILLÉ »', y: 480, h: 160, size: 48, at: 'faille2' },
    { kind: 'row', icon: 'cross', iconColor: 'red', html: 'COMPARÉ À D’AUTRES SITES', y: 660, h: 160, size: 48, at: at('faille2', 1.2) },
    { kind: 'chip', html: 'PAS DE RÈGLE DES 30 JOURS', style: 'red', y: 880, size: 54, at: 'faille3', anim: 'stamp', sfx: 'stamp' },
  ]) },
  { at: 'astuce', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'MON <span class="a">ASTUCE</span>', y: 280, size: 110, at: 'astuce' },
    { kind: 'row', icon: 'check', iconColor: 'mint', html: 'NOTEZ LE PRIX AUJOURD’HUI', y: 470, h: 160, size: 46, at: 'a1' },
    { kind: 'row', icon: 'clock', iconColor: 'mint', html: 'HISTORIQUE DES PRIX', sub: 'AVEC UN OUTIL DE SUIVI', y: 650, h: 160, size: 46, at: 'a2' },
    { kind: 'row', icon: 'cross', iconColor: 'red', html: 'FAUSSE BAISSE ? ON PASSE', y: 830, h: 160, size: 46, at: 'a3' },
  ]) },
  { at: 'budget', fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'BUDGET MOYEN DU WEEK-END', y: 280, at: 'budget', color: 'cream' },
    { kind: 'num', html: '≈ 150<span class="u">€</span>', y: 330, size: 200, color: 'gold', at: 'b1' },
    { kind: 'head', html: 'LA MEILLEURE PROMO :<br>UN ACHAT <span class="a">DÉJÀ PRÉVU</span>', y: 680, size: 80, at: 'cash' },
    { kind: 'sprite', name: 'shopbag', cx: 540, by: 1160, size: 280, at: at('cash', .4) },
  ], { foot: 'ÉTUDE SHOPIFY · WEEK-END DU 27 AU 29 NOVEMBRE 2026' }) },
  { at: 'cta', fn: (a, b) => cta(a, b, { top: 'BLACK FRIDAY', sprites: [{ name: 'pricetag', cx: 420, by: 900, size: 420 }, { name: 'shopbag', cx: 740, by: 900, size: 400 }], head: 'LA PIRE FAUSSE PROMO<br>QUE VOUS AYEZ <span class="r">VUE</span> ?', headY: 960, headSize: 84, follow: 'follow' }) },
]));
