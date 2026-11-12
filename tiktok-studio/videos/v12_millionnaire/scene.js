import { boot, cue, clamp, ease } from '../../lib/engine.js';
import { seq, stack, waterfall, hbars, cta, at } from '../../lib/beats.js';

boot(async () => seq([
  { fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: '1 000 000 € À 65 ANS', y: 228, at: -1 },
    { kind: 'sprite', name: 'goldbars', cx: 540, by: 920, size: 620, at: -1 },
    { kind: 'head', html: 'MILLIONNAIRE À 65 ANS :<br>COMBIEN PAR <span class="a">MOIS</span> ?', y: 1040, size: 84, at: -1, pulse: 'combien' },
  ], { sfxIn: false }) },
  { at: 'hyp', fn: (a, b) => stack(a, b, [
    { kind: 'chip', html: 'HYPOTHÈSE : 6 % PAR AN', style: 'mint', y: 420, size: 56, at: 'hyp', anim: 'stamp', rot: -3, rot2: -1 },
    { kind: 'mono', html: 'RENDEMENT MOYEN · GAINS RÉINVESTIS', y: 560, at: 'reinv' },
    { kind: 'sprite', name: 'coinstack', cx: 540, by: 1010, size: 340, at: 'hyp' },
  ]) },
  { at: 'a25', fn: (a, b) => hbars(a, b, { lab: ['01', 'À PLACER CHAQUE MOIS'], max: 6102, y0: 320, gapY: 210, unitLabel: 'PAR MOIS',
    foot: 'SIMULATION · 6 %/AN CONSTANT · OBJECTIF 1 000 000 € À 65 ANS',
    rows: [{ at: 'a25', n: '25', sub: 'ANS', value: 502, display: '502 €', color: 'mint' },
      { at: 'a35', n: '35', sub: 'ANS', value: 996, display: '996 €', color: 'cream' },
      { at: 'a45', n: '45', sub: 'ANS', value: 2164, display: '2 164 €', color: 'gold' },
      { at: 'a55', n: '55', sub: 'ANS', value: 6102, display: '6 102 €', color: 'red' }] }) },
  { at: 'x12', fn: (a, b) => stack(a, b, [
    { kind: 'num', html: '×12', y: 330, size: 320, color: 'red', at: 'x12', anim: 'stamp', rot: -4, rot2: -2 },
    { kind: 'mono', html: 'POUR AVOIR ATTENDU 30 ANS', y: 690, at: at('x12', .4) },
    { kind: 'sprite', name: 'hourglass', cx: 540, by: 1180, size: 380, at: at('x12', .3) },
  ]) },
  { at: 'warn', fn: (a, b) => stack(a, b, [
    { kind: 'chip', html: '⚠ ATTENTION', style: 'red', y: 250, size: 50, at: 'warn', anim: 'stamp', rot: -3, rot2: -2 },
    { kind: 'mono', html: '1 000 000 € DANS 40 ANS, AVEC 2 % D’INFLATION', y: 400, at: 'infl' },
    { kind: 'odo', to: 452890, digits: 6, prefix: '≈', y: 450, size: 150, color: 'gold', at: at('infl', .6), sfx: 'rise' },
    { kind: 'mono', html: 'EN EUROS D’AUJOURD’HUI', y: 620, at: at('infl', 1.0) },
    { kind: 'row', icon: 'zig', iconColor: 'red', html: '6 % N’EST JAMAIS GARANTI', y: 780, at: 'sim' },
  ]) },
  { at: 'concl', fn: (a, b) => stack(a, b, [
    { kind: 'sprite', name: 'hourglass', cx: 540, by: 880, size: 520, at: 'concl' },
    { kind: 'head', html: 'LE <span class="a">TEMPS</span> FAIT<br>LE GROS DU TRAVAIL', y: 940, size: 92, at: 'temps' },
  ]) },
  { at: 'cta', fn: (a, b) => cta(a, b, { top: 'MILLIONNAIRE À 65 ANS', sprites: [{ name: 'goldbars', cx: 540, by: 920, size: 580 }], head: 'VOUS AVEZ<br><span class="a">QUEL ÂGE</span>, VOUS ?', headY: 975, headSize: 96 }) },
]));
