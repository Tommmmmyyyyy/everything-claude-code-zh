import { boot, cue, clamp, ease } from '../../lib/engine.js';
import { seq, stack, waterfall, hbars, cta, at } from '../../lib/beats.js';

boot(async () => seq([
  { fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'L’ASTUCE QUE PERSONNE NE CONNAÎT', y: 228, at: -1 },
    { kind: 'num', html: '72', y: 330, size: 460, color: 'mint', at: -1, pulse: 'r72' },
    { kind: 'head', html: 'LA RÈGLE<br>DES <span class="a">72</span>', y: 900, size: 120, at: -1 },
  ], { sfxIn: false }) },
  { at: 'q', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'EN COMBIEN DE TEMPS<br>VOTRE ARGENT <span class="a">DOUBLE</span> ?', y: 290, size: 84, at: 'q' },
    { kind: 'num', html: '72 <span style="color:var(--muted)">÷</span> TAUX', y: 600, size: 150, color: 'gold', at: 'div' },
    { kind: 'mono', html: '= ANNÉES POUR DOUBLER', y: 800, at: at('div', .6) },
    { kind: 'sprite', name: 'coinstack', cx: 540, by: 1180, size: 260, at: at('div', .6) },
  ]) },
  { at: 't2', fn: (a, b) => hbars(a, b, { lab: ['01', 'TEMPS POUR DOUBLER'], max: 36, y0: 320, gapY: 210, unitLabel: '', foot: 'RÈGLE APPROXIMATIVE · INTÉRÊTS COMPOSÉS',
    rows: [{ at: 't2', n: '2 %', value: 36, display: '36 ANS', color: 'red' },
      { at: 't4', n: '4 %', value: 18, display: '18 ANS', color: 'gold' },
      { at: 't6', n: '6 %', value: 12, display: '12 ANS', color: 'cream' },
      { at: 't8', n: '8 %', value: 9, display: '9 ANS', color: 'mint' }] }) },
  { at: 'inv', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'ÇA MARCHE AUSSI<br>DANS L’AUTRE <span class="r">SENS</span>', y: 290, size: 96, at: 'inv' },
    { kind: 'mono', html: 'INFLATION : 3 % PAR AN', y: 590, at: 'infl' },
    { kind: 'num', html: '72 ÷ 3 = 24<span class="u">ANS</span>', y: 640, size: 120, color: 'cream', at: 'half' },
    { kind: 'chip', html: 'POUVOIR D’ACHAT ÷ 2', style: 'red', y: 830, size: 50, at: 'pouv', anim: 'stamp', rot: -4, rot2: -2 },
  ]) },
  { at: 'credit', fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'UNE DETTE À 20 % PAR AN', y: 330, at: 'credit' },
    { kind: 'head', html: 'CRÉDIT <span class="r">RENOUVELABLE</span>', y: 380, size: 80, at: 'credit' },
    { kind: 'num', html: '72 ÷ 20 ≈ 3,6<span class="u">ANS</span>', y: 560, size: 120, color: 'red', at: 'cred2' },
    { kind: 'mono', html: 'POUR DOUBLER CE QUE VOUS DEVEZ', y: 730, at: at('cred2', .5) },
  ]) },
  { at: 'concl', fn: (a, b) => stack(a, b, [
    { kind: 'num', html: '72', y: 330, size: 460, color: 'mint', at: 'concl' },
    { kind: 'head', html: 'L’OUTIL FINANCIER<br>LE PLUS <span class="a">SIMPLE</span>', y: 900, size: 92, at: 'outil' },
  ]) },
  { at: 'cta', fn: (a, b) => cta(a, b, { top: 'LA RÈGLE DES 72', sprites: [{ name: 'coinstack', cx: 540, by: 900, size: 420 }], head: 'PARTAGEZ-LA À QUELQU’UN<br>QUI NE LA <span class="a">CONNAÎT</span> PAS', headY: 990, headSize: 74, sub: 'ENVOYEZ-LA À UN AMI ↗' }) },
]));
