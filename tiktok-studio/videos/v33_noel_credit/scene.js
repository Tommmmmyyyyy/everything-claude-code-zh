import { boot, cue } from '../../lib/engine.js';
import { seq, stack, receipt, chart, cta, at } from '../../lib/beats.js';

boot(async () => seq([
  { fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'NOËL À CRÉDIT', y: 228, at: -1 },
    { kind: 'sprite', name: 'gift', cx: 540, by: 700, size: 460, at: -1 },
    { kind: 'head', html: 'PAYÉ EN<br><span class="r">PLUSIEURS FOIS</span> ?', y: 760, size: 110, at: -1 },
    { kind: 'chip', html: 'NOUVELLES RÈGLES DEPUIS LE 20 NOVEMBRE', style: 'gold', y: 1040, size: 40, at: 'change' },
  ], { sfxIn: false }) },
  { at: 'loop', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'ÇA PEUT COÛTER<br><span class="r">CHER</span>', y: 300, size: 130, at: 'loop' },
    { kind: 'chip', html: 'FAISONS LE CALCUL', style: 'gold', y: 590, size: 60, at: 'loop2' },
    { kind: 'sprite', name: 'card', cx: 540, by: 1060, size: 470, at: at('loop', .3) },
  ]) },
  { at: 'regle', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: '3 OU 4 FOIS<br>= UN <span class="r">VRAI CRÉDIT</span>', y: 280, size: 100, at: 'regle' },
    { kind: 'row', icon: 'rules', iconColor: 'gold', html: 'VÉRIFICATION', sub: 'DE VOTRE CAPACITÉ À REMBOURSER', y: 510, h: 160, size: 46, at: 'solva' },
    { kind: 'row', icon: 'check', iconColor: 'mint', html: 'DROIT DE RÉTRACTATION', y: 690, h: 160, size: 46, at: 'retract' },
    { kind: 'row', icon: 'minus', iconColor: 'red', html: 'PETITS DÉCOUVERTS', sub: 'MOINS DE 200 € AUSSI', y: 870, h: 160, size: 46, at: 'decouvert' },
    { kind: 'mono', html: 'OBJECTIF : ÉVITER L’EMPILEMENT DES PETITS CRÉDITS', y: 1070, size: 22, at: 'objectif', color: 'cream' },
  ], { lab: ['01', 'LES NOUVELLES RÈGLES'] }) },
  { at: 'budget', fn: (a, b) => stack(a, b, [
    { kind: 'num', html: '43<span class="u">%</span>', y: 290, size: 220, color: 'mint', at: 'b43' },
    { kind: 'mono', html: 'DES FRANÇAIS : 200 € OU MOINS POUR NOËL', y: 530, at: at('b43', .4), color: 'cream' },
    { kind: 'chip', html: 'MAIS BEAUCOUP DÉPASSENT', style: 'red', y: 620, size: 54, at: 'beaucoup', anim: 'stamp', sfx: 'stamp' },
    { kind: 'sprite', name: 'gift', cx: 540, by: 1140, size: 380, at: at('b43', .6) },
  ], { foot: 'BAROMÈTRE HAVAS MARKET / YOUGOV, OCTOBRE 2026' }) },
  { at: 'calcul', fn: (a, b) => receipt(a, b, { lab: ['02', 'LE CALCUL'], title: 'CADEAUX PAYÉS À CRÉDIT', y: 320,
    rows: [
      { at: 'calcul', label: 'CADEAUX DE NOËL', value: 500, sign: '', color: '#10261F' },
      { at: 'mens', label: '12 MENSUALITÉS', sub: '≈ 45,45 € PAR MOIS · TAUX ≈ 18 %', value: 545.40, sign: '', color: '#10261F' },
    ], total: { at: 'cout', label: 'INTÉRÊTS', value: 45.40, sign: '+', color: 'red' },
    notes: [{ kind: 'mono', at: 'taux', html: 'TAUX MOYEN DES CRÉDITS ≤ 3 000 € ≈ 18 %', y: 880, size: 22 }],
    foot: 'CRÉDIT RENOUVELABLE · TAUX EFFECTIF MOYEN BANQUE DE FRANCE, 4ᵉ TRIMESTRE 2026' }) },
  { at: 'mars', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'EN <span class="r">MARS</span>, VOUS PAYEZ<br>ENCORE DÉCEMBRE', y: 280, size: 88, at: 'mars' },
    { kind: 'num', html: '4 × 4', y: 500, size: 150, color: 'cream', at: 'cumul2' },
    { kind: 'mono', html: 'ACHATS EN 4 FOIS', y: 660, at: 'cumul2' },
    { kind: 'num', html: '= 16', y: 720, size: 170, color: 'red', at: at('cumul2', 1.2) },
    { kind: 'mono', html: 'PRÉLÈVEMENTS À SUIVRE', y: 910, at: at('cumul2', 1.4), color: 'cream' },
    { kind: 'chip', html: 'LE VRAI PIÈGE', style: 'red', y: 1010, size: 50, at: 'cumul', anim: 'stamp', sfx: 'stamp' },
  ]) },
  { at: 'astuce', fn: (a, b) => chart(a, b, { lab: ['03', 'MON ASTUCE'], head: '<span class="a">25 €</span> PAR MOIS, DÈS JANVIER', headAt: 'a1', x: [0, 12], y: [0, 320],
    xticks: [0, 3, 6, 9, 12], xfmt: v => ['JANV.', 'AVR.', 'JUIL.', 'OCT.', 'DÉC.'][v / 3], yticks: [0, 100, 200, 300], yfmt: v => v + ' €',
    series: [{ at: 'a1', color: 'mint', fn: x => 25 * x, dur: 2.2, width: 10, fill: true }],
    marks: [{ at: 'a2', x: 12, y: 300, html: '300 € EN DÉCEMBRE', color: 'mint', style: 'mint', dx: -780, dy: -100 }],
    notes: [{ at: 'a3', html: '0 € D’INTÉRÊTS', style: 'gold', x: -220, y: 560, size: 54 }] }) },
  { at: 'cadeau', fn: (a, b) => stack(a, b, [
    { kind: 'sprite', name: 'gift', cx: 540, by: 720, size: 460, at: 'cadeau' },
    { kind: 'head', html: 'LE PLUS BEAU CADEAU :<br>UNE ANNÉE <span class="a">SANS DETTE</span>', y: 780, size: 84, at: at('cadeau', .4) },
  ]) },
  { at: 'cta', fn: (a, b) => cta(a, b, { top: 'NOËL À CRÉDIT', sprites: [{ name: 'gift', cx: 400, by: 900, size: 420 }, { name: 'card', cx: 740, by: 900, size: 380 }], head: 'VOS CADEAUX : <span class="a">COMPTANT</span><br>OU EN <span class="r">PLUSIEURS FOIS</span> ?', headY: 960, headSize: 80, follow: 'follow' }) },
]));
