import { boot, cue } from '../../lib/engine.js';
import { seq, stack, splitbar, chart, cta, at, path } from '../../lib/beats.js';

// cumulative cost (€) by horse age: bought at 6 (6 000 €), 500 €/month until 20, 300 €/month until 28, two vet bills
const cost = x => { if (x < 6) return 0; let c = 6000; const w = Math.min(x, 20) - 6; c += w * 6000; if (x > 20) c += (x - 20) * 3600; if (x >= 12) c += 4000; if (x >= 23) c += 4000; return c; };

boot(async () => seq([
  { fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'UN CHEVAL · TOUTE SA VIE', y: 228, at: -1 },
    { kind: 'sprite', name: 'horse', cx: 540, by: 720, size: 520, at: -1 },
    { kind: 'num', html: '30<span class="u">ANS</span>', y: 740, size: 170, color: 'gold', at: -1 },
    { kind: 'head', html: 'PLUS CHER QU’UN<br><span class="r">APPARTEMENT</span> ?', y: 950, size: 100, at: 'appart' },
  ], { sfxIn: false }) },
  { at: 'loop', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'UNE PARTIE DE SA VIE<br>À LAQUELLE <span class="g">PERSONNE</span><br>NE PENSE', y: 300, size: 96, at: 'loop' },
    { kind: 'sprite', name: 'horse_grey', cx: 540, by: 1120, size: 460, at: at('loop', .5), dim: 'loop2' },
  ]) },
  { at: 'achat', fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'L’ACHAT', y: 270, at: 'achat', color: 'cream' },
    { kind: 'num', html: '≈ 6 000<span class="u">€</span>', y: 320, size: 170, color: 'gold', at: 'achat' },
    { kind: 'mono', html: 'PRIX MOYEN D’UN CHEVAL DE LOISIR', y: 520, at: at('achat', .5) },
    { kind: 'sprite', name: 'horse', cx: 540, by: 1100, size: 460, at: at('achat', .3) },
  ], { lab: ['01', 'L’ARRIVÉE'], foot: 'OBSERVATOIRE DE LA FILIÈRE ÉQUINE · ESTIMATION' }) },
  { at: 'travail', fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'DE 6 À 20 ANS', y: 270, at: 'arrive', color: 'cream' },
    { kind: 'sprite', name: 'saddle', cx: 540, by: 660, size: 360, at: 'travail' },
    { kind: 'num', html: '≈ 500<span class="u">€/MOIS</span>', y: 690, size: 130, color: 'cream', at: 'mois' },
    { kind: 'mono', html: 'PENSION · MARÉCHAL · VÉTÉRINAIRE · ASSURANCE', y: 850, at: at('mois', .4) },
    { kind: 'chip', html: '14 ANS = 84 000 €', style: 'red', y: 930, size: 70, at: 'total14', anim: 'stamp', sfx: 'stamp' },
  ], { lab: ['02', 'LES ANNÉES DE TRAVAIL'] }) },
  { at: 'twist', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'SAUF <span class="g">QUE…</span>', y: 280, size: 120, at: 'twist' },
    { kind: 'mono', html: 'IL NE S’ARRÊTE PAS DE VIVRE QUAND IL ARRÊTE DE TRAVAILLER', y: 450, size: 22, at: at('twist', .8), color: 'cream' },
    { kind: 'sprite', name: 'horse_grey', cx: 540, by: 960, size: 460, at: 'ans' },
    { kind: 'chip', html: 'JUSQU’À 25-30 ANS', style: 'gold', y: 1000, size: 60, at: at('ans', .6), anim: 'stamp', sfx: 'stamp' },
  ]) },
  { at: 'retraite', fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'LA RETRAITE · DE 20 À 28 ANS', y: 270, at: 'retraite', color: 'cream' },
    { kind: 'num', html: '≈ 300<span class="u">€/MOIS</span>', y: 320, size: 130, color: 'cream', at: 'retraite' },
    { kind: 'mono', html: 'PRÉ + SOINS D’UN CHEVAL ÂGÉ', y: 480, at: at('retraite', .5) },
    { kind: 'sprite', name: 'horse_grey', cx: 540, by: 900, size: 380, at: at('retraite', .3) },
    { kind: 'chip', html: '8 ANS ≈ 29 000 €', style: 'red', y: 940, size: 66, at: 'huit', anim: 'stamp', sfx: 'stamp' },
    { kind: 'row', icon: 'heart', iconColor: 'red', html: 'UNE COLIQUE OPÉRÉE', sub: 'À CHAQUE FOIS', right: '3-5 000 €', rColor: 'red', rSize: 50, y: 1060, h: 140, size: 42, at: 'colique' },
  ], { lab: ['03', 'LA RETRAITE'] }) },
  { at: 'total', fn: (a, b) => chart(a, b, { lab: ['04', 'LE TOTAL'], head: 'DE 6 À 28 ANS', x: [6, 28], y: [0, 140000],
    xticks: [6, 12, 20, 28], xfmt: v => v + ' ANS', yticks: [0, 35000, 70000, 105000, 140000], yfmt: v => v ? (v / 1000) + ' k€' : '0',
    series: [{ at: 'total', color: 'gold', fn: cost, dur: 2.0, width: 10, fill: true, from: 6, to: 28 }],
    marks: [
      { at: at('total', .9), x: 20, y: cost(20), html: 'FIN DU TRAVAIL', color: 'cream', style: 'dark', dx: -760, dy: -110, vline: true },
      { at: at('total', 2.0), x: 28, y: cost(28), html: '≈ 127 000 €', color: 'gold', style: 'gold', dx: -780, dy: -110, size: 46 },
    ],
    notes: [{ at: 'inflation', html: 'AVEC L’INFLATION : ≈ 160 000 €', style: 'red', y: 1150, size: 46 }] }) },
  { at: 'place', fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'LE MÊME ARGENT, PLACÉ CHAQUE MOIS À 5 %', y: 280, at: 'place', color: 'cream' },
    { kind: 'odo', to: 230000, digits: 6, prefix: '+&nbsp;', y: 340, size: 150, color: 'mint', at: 'place2' },
    { kind: 'head', html: 'UN MAUVAIS<br><span class="r">PLACEMENT</span> ?', y: 600, size: 100, at: 'pasprix' },
    { kind: 'chip', html: 'FINANCIÈREMENT, OUI', style: 'red', y: 830, size: 56, at: 'oui', anim: 'stamp', sfx: 'stamp' },
    { kind: 'mono', html: 'MAIS PERSONNE N’ACHÈTE UN CHEVAL POUR L’ARGENT', y: 960, at: 'passion', color: 'cream' },
  ], { foot: 'SIMULATION · RENDEMENT CONSTANT DE 5 %, NON GARANTI' }) },
  { at: 'conseil', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'MON <span class="a">CONSEIL</span>', y: 280, size: 110, at: 'conseil' },
    { kind: 'row', icon: 'heart', iconColor: 'mint', html: 'PENSEZ À SA RETRAITE', sub: 'DÈS LE PREMIER JOUR', y: 460, h: 170, size: 48, at: at('conseil', .5) },
    { kind: 'row', icon: 'up', iconColor: 'gold', html: 'UNE PETITE ÉPARGNE', sub: 'POUR SES VIEUX JOURS', y: 650, h: 170, size: 48, at: 'cagnotte' },
    { kind: 'sprite', name: 'horse_grey', cx: 540, by: 1160, size: 300, at: at('cagnotte', .4) },
  ]) },
  { at: 'cta', fn: (a, b) => cta(a, b, { top: 'UN CHEVAL · TOUTE SA VIE', sprites: [{ name: 'horse', cx: 540, by: 900, size: 540 }], head: 'VOTRE CHEVAL<br>A <span class="a">QUEL ÂGE</span> ?', headY: 960, headSize: 100, follow: 'follow' }) },
]));
