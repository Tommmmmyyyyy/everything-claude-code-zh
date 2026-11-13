import { boot, cue } from '../../lib/engine.js';
import { seq, stack, chart, cta, at, path } from '../../lib/beats.js';

// stylised bitcoin price ($): highs and lows quoted in the video are real, intermediate points are approximate
const btc = path([[2017.0, 1000], [2017.96, 19800], [2018.95, 3200], [2019.5, 11000], [2020.2, 5800], [2020.96, 29000], [2021.3, 60000], [2021.55, 31000], [2021.86, 69000], [2022.89, 15500], [2023.9, 42000], [2024.2, 73000], [2024.6, 55000], [2024.96, 96000], [2025.4, 105000], [2025.76, 126000], [2026.3, 90000], [2026.6, 78000], [2026.87, 67500]]);

boot(async () => seq([
  { fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'BITCOIN', y: 228, at: -1 },
    { kind: 'sprite', name: 'btc', cx: 540, by: 680, size: 460, at: -1 },
    { kind: 'num', html: '− 46<span class="u">%</span>', y: 690, size: 200, color: 'red', at: -1 },
    { kind: 'mono', html: 'DEPUIS SON RECORD', y: 910, at: -1, color: 'cream' },
    { kind: 'num', html: '126 000<span class="u">$</span>', x: 40, w: 500, y: 980, size: 80, color: 'var(--muted)', at: 'chiffres' },
    { kind: 'mono', html: 'OCTOBRE 2025', x: 40, w: 500, y: 1075, at: 'chiffres' },
    { kind: 'num', html: '67 500<span class="u">$</span>', x: 540, w: 500, y: 980, size: 80, color: 'red', at: 'now' },
    { kind: 'mono', html: 'AUJOURD’HUI', x: 540, w: 500, y: 1075, at: 'now' },
  ], { sfxIn: false }) },
  { at: 'mille', fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'INVESTIS AU SOMMET', y: 280, at: 'mille', color: 'cream' },
    { kind: 'num', html: '1 000<span class="u">€</span>', x: 20, w: 440, y: 350, size: 120, color: 'cream', at: 'mille' },
    { kind: 'head', html: '→', x: 430, w: 140, y: 360, size: 90, at: at('mille', 1.2), color: 'var(--muted)' },
    { kind: 'num', html: '≈ 560<span class="u">€</span>', x: 560, w: 500, y: 350, size: 120, color: 'red', at: at('mille', 1.2) },
    { kind: 'sprite', name: 'btc', cx: 540, by: 1080, size: 460, at: at('mille', .4) },
  ], { foot: 'EN EUROS, VARIATION DU DOLLAR INCLUSE · ESTIMATION' }) },
  { at: 'pourquoi', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'POURQUOI ÇA BOUGE<br><span class="g">AUTANT</span> ?', y: 280, size: 100, at: 'pourquoi' },
    { kind: 'row', icon: 'cross', iconColor: 'red', html: 'NI BÉNÉFICES', y: 500, h: 150, size: 50, at: 'pq2' },
    { kind: 'row', icon: 'cross', iconColor: 'red', html: 'NI DIVIDENDES', y: 670, h: 150, size: 50, at: at('pq2', .9) },
    { kind: 'chip', html: 'LE PRIX = CE QUE LES ACHETEURS PAIENT', style: 'gold', y: 880, size: 42, at: 'pq3', anim: 'stamp', sfx: 'stamp' },
  ]) },
  { at: 'loop', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'C’EST LA <span class="r">FIN</span> ?', y: 320, size: 130, at: 'loop' },
    { kind: 'mono', html: 'REGARDEZ LES FOIS PRÉCÉDENTES', y: 500, at: 'loop2', color: 'cream' },
    { kind: 'sprite', name: 'btc', cx: 540, by: 1080, size: 440, at: at('loop', .4), rot: -8 },
  ]) },
  { at: 'y2017', fn: (a, b) => chart(a, b, { lab: ['01', 'L’HISTORIQUE'], x: [2017, 2027], y: [0, 140000],
    xticks: [2017, 2019, 2021, 2023, 2025, 2027], xfmt: v => String(v), yticks: [0, 35000, 70000, 105000, 140000], yfmt: v => v ? (v / 1000) + ' k$' : '0',
    series: [{ at: 'y2017', color: 'gold', fn: btc, dur: Math.max(4, cue('ans') - cue('y2017') + .5), width: 8 }],
    marks: [
      { at: 'y2017', x: 2017.96, y: 19800, html: '≈ 20 000 $', color: 'cream', style: 'dark', dx: -540, dy: -110, vline: false },
      { at: 'p84', x: 2018.95, y: 3200, html: '− 84 %', color: 'red', style: 'red', dx: -540, dy: -100, vline: false, size: 44 },
      { at: 'y2021', x: 2021.86, y: 69000, html: '69 000 $', color: 'cream', style: 'dark', dx: -540, dy: -110, vline: false },
      { at: 'p77', x: 2022.89, y: 15500, html: '− 77 %', color: 'red', style: 'red', dx: -540, dy: -110, vline: false, size: 44 },
      { at: 'remonte', x: 2024.2, y: 73000, html: 'NOUVEAU RECORD', color: 'mint', style: 'mint', dx: -400, dy: -120, vline: false },
    ],
    foot: 'COURBE SIMPLIFIÉE · PLUS HAUTS ET PLUS BAS EN DOLLARS' }) },
  { at: 'maths', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'LE PIÈGE DES <span class="g">%</span>', y: 270, size: 100, at: 'maths' },
    { kind: 'num', html: '− 50<span class="u">%</span>', y: 400, size: 170, color: 'red', at: 'm1' },
    { kind: 'num', html: '+ 100<span class="u">%</span>', y: 600, size: 170, color: 'mint', at: 'm2' },
    { kind: 'mono', html: 'POUR REVENIR AU DÉPART', y: 800, at: at('m2', .4), color: 'cream' },
    { kind: 'chip', html: 'AUJOURD’HUI : + 87 % POUR LE RECORD', style: 'gold', y: 890, size: 46, at: 'now2', anim: 'stamp', sfx: 'stamp' },
  ]) },
  { at: 'passe', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'LE PASSÉ NE<br><span class="r">GARANTIT RIEN</span>', y: 290, size: 110, at: 'passe' },
    { kind: 'row', icon: 'cross', iconColor: 'red', html: 'PEUT NE JAMAIS REVENIR', y: 540, h: 160, size: 48, at: 'p2' },
    { kind: 'row', icon: 'rules', iconColor: 'gold', html: 'PLACEMENT TRÈS RISQUÉ', y: 720, h: 160, size: 48, at: 'p3' },
  ]) },
  { at: 'regle', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'LA RÈGLE <span class="g">D’OR</span>', y: 280, size: 110, at: 'regle' },
    { kind: 'row', icon: 'check', iconColor: 'mint', html: 'CE QUE VOUS POUVEZ PERDRE', sub: 'ET PAS PLUS', y: 470, h: 170, size: 46, at: 'r1' },
    { kind: 'row', icon: 'cal', iconColor: 'mint', html: 'PETIT À PETIT', sub: 'CHAQUE MOIS, PAS AU SOMMET', y: 660, h: 170, size: 46, at: 'r2' },
    { kind: 'sprite', name: 'btc', cx: 540, by: 1150, size: 280, at: at('r2', .4) },
  ]) },
  { at: 'cta', fn: (a, b) => cta(a, b, { top: 'BITCOIN', sprites: [{ name: 'btc', cx: 540, by: 900, size: 500 }], head: 'VOUS EN AVEZ ACHETÉ ?<br>À <span class="a">QUEL PRIX</span> ?', headY: 960, headSize: 90, follow: 'follow' }) },
]));
