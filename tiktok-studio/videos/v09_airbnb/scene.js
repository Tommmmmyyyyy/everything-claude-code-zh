import { boot, cue, clamp, ease } from '../../lib/engine.js';
import { seq, stack, waterfall, hbars, cta, at } from '../../lib/beats.js';

boot(async () => seq([
  { fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'LE MÊME APPARTEMENT', y: 228, at: -1 },
    { kind: 'sprite', name: 'house', cx: 540, by: 960, size: 600, at: -1 },
    { kind: 'head', html: 'AIRBNB OU<br>LOCATION <span class="a">CLASSIQUE</span> ?', y: 1040, size: 100, at: -1 },
  ], { sfxIn: false }) },
  { at: 'cl', fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'À L’ANNÉE', x: 60, y: 290, w: 460, at: 'cl' },
    { kind: 'num', html: '750<span class="u">€/MOIS</span>', x: 60, y: 330, w: 460, size: 86, color: 'cream', at: 'cl' },
    { kind: 'num', html: '≈ 8 600<span class="u">€/AN</span>', x: 60, y: 450, w: 460, size: 60, color: 'cream', at: 'clan' },
    { kind: 'mono', html: 'AIRBNB', x: 560, y: 290, w: 460, color: 'gold', at: 'air' },
    { kind: 'num', html: '80<span class="u">€/NUIT</span>', x: 560, y: 330, w: 460, size: 86, color: 'gold', at: 'air' },
    { kind: 'mono', html: 'REMPLI 2 NUITS SUR 3', x: 560, y: 465, w: 460, at: 'occ' },
    { kind: 'odo', to: 18960, digits: 5, y: 600, size: 180, color: 'gold', at: 'ca' },
    { kind: 'mono', html: 'PAR AN EN AIRBNB', y: 800, at: at('ca', .4) },
    { kind: 'chip', html: 'PLUS DU DOUBLE !', style: 'gold', y: 880, size: 46, at: 'wow', anim: 'stamp', rot: -6, rot2: -3 },
    { kind: 'head', html: 'SAUF QUE…', y: 1020, size: 96, at: 'sauf' },
  ], { lab: ['01', 'LE MATCH'] }) },
  { at: 'com', fn: (a, b) => waterfall(a, b, { lab: ['02', 'CE QU’IL RESTE'], title: ['AIRBNB PAR AN', 'IL RESTE PAR AN'], foot: 'HYPOTHÈSES · 80 €/NUIT · 65 % D’OCCUPATION · SÉJOURS DE 3 NUITS',
    startBar: { value: 18960, label: ['NUITÉES', 'PAR AN'] },
    steps: [{ at: 'com', value: 2940, label: ['COMMISSION', 'AIRBNB 15,5 %'] }, { at: 'men', value: 2765, label: ['MÉNAGE', ''] }, { at: 'chg', value: 1800, label: ['ÉLEC · NET', 'ABONNEMENTS'] }, { at: 'use', value: 1000, label: ['LINGE', 'USURE'] }],
    final: { at: 'net', value: 10455, label: ['IL VOUS', 'RESTE'] } }) },
  { at: 'diff', fn: (a, b) => hbars(a, b, { lab: ['03', 'LE VERDICT'], head: 'SEULEMENT<br><span class="g">+1 800 €</span> PAR AN', headAt: 'diff', max: 10455, y0: 560, gapY: 200, unitLabel: 'PAR AN',
    rows: [{ at: at('diff', .2), n: 'CLASSIQUE', nSize: 40, sub: '', value: 8625, display: '8 600 €', color: 'cream' },
      { at: at('diff', .6), n: 'AIRBNB', nSize: 40, sub: 'SEUL', value: 10455, display: '10 500 €', color: 'gold' },
      { at: 'concv', n: 'AIRBNB', nSize: 40, sub: '+ CONCIER-<br>GERIE 20 %', value: 6664, display: '6 700 €', color: 'red' }] }) },
  { at: 'regle', fn: (a, b) => stack(a, b, [
    { kind: 'row', icon: 'rules', iconColor: 'gold', html: 'DE PLUS EN PLUS ENCADRÉ', sub: 'DANS BEAUCOUP DE VILLES', y: 400, at: 'regle' },
    { kind: 'head', html: 'AIRBNB RAPPORTE PLUS…', y: 680, size: 84, at: 'concl' },
    { kind: 'head', html: 'SI VOUS FAITES <span class="a">TOUT</span><br>VOUS-MÊME', y: 800, size: 96, at: 'seul' },
    { kind: 'sprite', name: 'house', cx: 540, by: 1200, size: 260, at: 'seul' },
  ]) },
  { at: 'cta', fn: (a, b) => cta(a, b, { top: 'AIRBNB OU CLASSIQUE ?', sprites: [{ name: 'house', cx: 540, by: 930, size: 580 }], head: 'VOUS, VOUS<br><span class="a">CHOISISSEZ</span> QUOI ?', headY: 990, headSize: 104 }) },
]));
