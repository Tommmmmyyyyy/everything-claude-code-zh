import { boot } from '../../lib/engine.js';
import { seq, stack, chart, cta, at } from '../../lib/beats.js';

const fv = x => { const r = Math.pow(1.05, 1 / 12) - 1, n = x * 12; return 50 * (Math.pow(1 + r, n) - 1) / r; };

boot(async () => seq([
  { fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'UN ENFANT · DE 0 À 18 ANS', y: 228, at: -1 },
    { kind: 'sprite', name: 'blocks', cx: 540, by: 720, size: 480, at: -1 },
    { kind: 'head', html: 'ÇA COÛTE<br><span class="a">COMBIEN</span> ?', y: 780, size: 120, at: -1, until: 'chiffre' },
    { kind: 'odo', to: 180000, digits: 6, prefix: '≈&nbsp;', y: 790, size: 170, color: 'gold', at: at('chiffre', .45) },
    { kind: 'mono', html: 'SELON LES ESTIMATIONS', y: 990, at: at('chiffre', .5), color: 'cream' },
  ], { sfxIn: false }) },
  { at: 'loop', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'UN POSTE AUQUEL<br><span class="g">PERSONNE</span><br>NE PENSE', y: 300, size: 110, at: 'loop' },
    { kind: 'num', html: '?', y: 680, size: 380, color: 'gold', at: at('loop', .6), anim: 'pop' },
  ]) },
  { at: 'mois', fn: (a, b) => stack(a, b, [
    { kind: 'num', html: '830<span class="u">€</span>', y: 330, size: 230, color: 'cream', at: 'mois' },
    { kind: 'mono', html: 'PAR MOIS, PENDANT 18 ANS', y: 580, at: at('mois', .4), color: 'cream' },
    { kind: 'sprite', name: 'bottle', cx: 540, by: 1120, size: 420, at: at('mois', .8) },
  ]) },
  { at: 'bebe', fn: (a, b) => stack(a, b, [
    { kind: 'sprite', name: 'bottle', cx: 540, by: 610, size: 380, at: 'bebe' },
    { kind: 'row', icon: 'heart', iconColor: 'gold', html: 'LES COUCHES', sub: 'SUR 2 À 3 ANS', right: '2-3 000 €', rSize: 54, y: 650, h: 170, size: 48, at: 'couches' },
    { kind: 'row', icon: 'home', iconColor: 'gold', html: 'LA GARDE', sub: 'CRÈCHE OU NOUNOU · APRÈS AIDES', right: '300-600 €', rSize: 54, y: 840, h: 170, size: 48, at: 'garde' },
    { kind: 'mono', html: 'PAR MOIS', x: 690, w: 330, y: 1020, at: at('garde', .3) },
  ], { lab: ['01', 'LES PREMIÈRES ANNÉES'] }) },
  { at: 'ecole', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'L’<span class="a">ÉCOLE</span>', y: 280, size: 120, at: 'ecole' },
    { kind: 'row', icon: 'rules', iconColor: 'cream', html: 'CANTINE · FOURNITURES', y: 470, h: 160, size: 46, at: 'cantine' },
    { kind: 'row', icon: 'sun', iconColor: 'gold', html: 'SPORT · MUSIQUE', sub: 'ET LES VACANCES…', y: 650, h: 160, size: 46, at: 'activites' },
    { kind: 'sprite', name: 'blocks', cx: 540, by: 1150, size: 300, at: at('activites', .4) },
  ], { lab: ['02', 'ENSUITE'] }) },
  { at: 'ado', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'L’ADOLESCENCE<br><span class="r">LA PLUS CHÈRE</span>', y: 280, size: 100, at: 'ado' },
    { kind: 'row', icon: 'up', iconColor: 'red', html: 'MANGE COMME UN ADULTE', y: 520, h: 160, size: 46, at: 'ado2' },
    { kind: 'row', icon: 'up', iconColor: 'red', html: 'TÉLÉPHONE · MARQUES', sub: 'ET LES SORTIES', y: 700, h: 160, size: 46, at: 'tel' },
    { kind: 'sprite', name: 'phone', cx: 540, by: 1160, size: 300, at: at('tel', .4) },
  ], { lab: ['03', 'PUIS'] }) },
  { at: 'twist', fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'LE POSTE QU’ON OUBLIE…', y: 270, at: 'twist', color: 'cream' },
    { kind: 'sprite', name: 'apartment', cx: 540, by: 760, size: 460, at: 'logement' },
    { kind: 'head', html: 'LE <span class="g">LOGEMENT</span>', y: 800, size: 120, at: 'logement', anim: 'stamp', sfx: 'stamp' },
    { kind: 'mono', html: 'UNE CHAMBRE EN PLUS · PENDANT 18 ANS', y: 940, at: 'chambre', color: 'cream' },
    { kind: 'chip', html: 'LOYER OU CRÉDIT PLUS ÉLEVÉ', style: 'red', y: 1010, size: 54, at: 'loyer' },
  ]) },
  { at: 'aides', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'ET LES <span class="a">AIDES</span> ?', y: 280, size: 120, at: 'aides' },
    { kind: 'row', icon: 'cross', iconColor: 'red', html: 'ALLOCATIONS FAMILIALES', sub: 'SEULEMENT DÈS LE 2ᵉ ENFANT', y: 480, h: 180, size: 46, at: 'af' },
    { kind: 'row', icon: 'check', iconColor: 'mint', html: 'DEMI-PART FISCALE', sub: 'MOINS D’IMPÔTS, SI VOUS EN PAYEZ', y: 690, h: 180, size: 46, at: 'parts' },
  ]) },
  { at: 'conseil', fn: (a, b) => chart(a, b, { lab: ['04', 'MON CONSEIL'], head: '<span class="a">50 €</span> PAR MOIS', headAt: 'cinquante', x: [0, 18], y: [0, 20000],
    xticks: [0, 6, 12, 18], xfmt: v => v + ' ANS', yticks: [0, 5000, 10000, 15000, 20000], yfmt: v => v ? (v / 1000) + ' k€' : '0',
    series: [
      { at: 'cinquante', color: 'cream', fn: x => 600 * x, dur: 1.4, width: 7 },
      { at: 'cinq', color: 'mint', fn: fv, dur: 1.8, width: 10, fill: true },
    ],
    marks: [{ at: at('dix8', 1.2), x: 18, y: fv(18), html: '+ DE 17 000 € À 18 ANS', color: 'mint', style: 'mint', dx: -780, dy: -70 }],
    legend: [{ html: 'VERSÉ : 10 800 €', color: 'cream' }, { html: 'AVEC 5 % PAR AN', color: 'mint', at: 'cinq' }],
  }) },
  { at: 'fin', fn: (a, b) => stack(a, b, [
    { kind: 'sprite', name: 'blocks', cx: 540, by: 700, size: 460, at: 'fin' },
    { kind: 'head', html: 'UN ENFANT COÛTE CHER…', y: 770, size: 70, at: 'fin' },
    { kind: 'head', html: 'MAIS CE QU’IL RAPPORTE,<br>AUCUN <span class="a">TABLEUR</span><br>NE SAIT LE CALCULER', y: 880, size: 76, at: 'fin2' },
  ]) },
  { at: 'cta', fn: (a, b) => cta(a, b, { top: 'UN ENFANT · DE 0 À 18 ANS', sprites: [{ name: 'bottle', cx: 380, by: 900, size: 440 }, { name: 'blocks', cx: 700, by: 900, size: 420 }], head: 'VOUS AVEZ COMBIEN<br>D’<span class="a">ENFANTS</span> ?', headY: 960, headSize: 92, follow: 'follow' }) },
]));
