import { boot } from '../../lib/engine.js';
import { seq, stack, splitbar, cta, at } from '../../lib/beats.js';

boot(async () => seq([
  { fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'PRIX DE L’ARC DE TRIOMPHE', y: 228, at: -1 },
    { kind: 'sprite', name: 'racehorse', cx: 540, by: 720, size: 520, at: -1 },
    { kind: 'num', html: '≈ 2,9<span class="u">M€</span>', y: 740, size: 170, color: 'gold', at: -1 },
    { kind: 'head', html: 'EN MOINS DE<br><span class="a">3 MINUTES</span>', y: 950, size: 100, at: 'minutes' },
  ], { sfxIn: false }) },
  { at: 'loop', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'COMBIEN A-T-IL<br><span class="r">COÛTÉ</span> AVANT ?', y: 300, size: 110, at: 'loop' },
    { kind: 'sprite', name: 'trophy', cx: 540, by: 1100, size: 420, at: at('loop', .4) },
  ]) },
  { at: 'arc', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'LA COURSE LA PLUS<br><span class="g">RICHE</span> D’EUROPE', y: 280, size: 100, at: 'arc' },
    { kind: 'mono', html: 'CHAQUE OCTOBRE · PARISLONGCHAMP', y: 500, at: 'arc2', color: 'cream' },
    { kind: 'head', html: 'DARYZ', y: 600, size: 140, at: 'daryz', color: 'var(--gold)' },
    { kind: 'mono', html: 'AUX COULEURS DE L’AGA KHAN', y: 760, at: at('daryz', .4) },
    { kind: 'chip', html: '2ᵉ VICTOIRE DE SUITE', style: 'mint', y: 850, size: 60, at: 'double', anim: 'stamp', sfx: 'stamp' },
    { kind: 'sprite', name: 'racehorse', cx: 540, by: 1180, size: 300, at: at('daryz', .3) },
  ], { lab: ['01', 'L’ARC'] }) },
  { at: 'dotation', fn: (a, b) => splitbar(a, b, { lab: ['02', 'LES 5 MILLIONS'], head: 'QUI TOUCHE <span class="g">QUOI</span> ?', total: 5000000, y: 470,
    rows: [
      { at: 'premier', label: '1ᵉʳ', sub: 'LE VAINQUEUR', value: 2857000, display: '2 857 000', color: 'gold' },
      { at: 'deuxieme', label: '2ᵉ', value: 1143000, display: '1 143 000', color: 'cream' },
      { at: at('deuxieme', .6), label: '3ᵉ', value: 571500, display: '571 500', color: '#7FA89A' },
      { at: at('deuxieme', 1.1), label: '4ᵉ', value: 285500, display: '285 500', color: '#5E8A7C' },
      { at: 'cinquieme', label: '5ᵉ', value: 143000, display: '143 000', color: 'mint' },
    ], foot: 'ALLOCATIONS 2026 · UNE PARTIE REVIENT À L’ENTRAÎNEUR ET AU JOCKEY' }) },
  { at: 'cout', fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'UN CHEVAL À L’ENTRAÎNEMENT', y: 270, at: 'pension', color: 'cream' },
    { kind: 'num', html: '≈ 1 640<span class="u">€/MOIS</span>', y: 320, size: 120, color: 'red', at: 'pension' },
    { kind: 'mono', html: '≈ 20 000 € PAR AN · MOYENNE FRANÇAISE', y: 470, at: 'an' },
    { kind: 'num', html: '145<span class="u">ANS</span>', y: 560, size: 200, color: 'gold', at: 'x145' },
    { kind: 'mono', html: 'DE PENSION, REMBOURSÉS EN UNE COURSE', y: 790, at: 'd2', color: 'cream' },
  ], { lab: ['03', 'LE CALCUL'] }) },
  { at: 'twist', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'SAUF QUE C’EST<br>L’<span class="r">EXCEPTION</span>', y: 290, size: 104, at: 'twist' },
    { kind: 'row', icon: 'minus', iconColor: 'red', html: 'EN MOYENNE', sub: 'LES GAINS REMBOURSENT ≈ LA MOITIÉ DES FRAIS', y: 520, h: 170, size: 48, at: 'moy' },
    { kind: 'row', icon: 'up', iconColor: 'mint', html: 'LE VRAI JACKPOT', sub: 'DEVENIR ÉTALON', y: 710, h: 170, size: 48, at: 'etalon' },
    { kind: 'sprite', name: 'horseshoe', cx: 540, by: 1160, size: 280, at: at('etalon', .4) },
  ]) },
  { at: 'lecon', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'UN SPORT DE<br><span class="a">PASSION</span>', y: 300, size: 120, at: 'lecon' },
    { kind: 'mono', html: 'QUELQUES GAGNANTS FONT RÊVER TOUS LES AUTRES', y: 560, at: 'lecon2', color: 'cream' },
    { kind: 'sprite', name: 'trophy', cx: 540, by: 1110, size: 420, at: at('lecon', .4) },
  ]) },
  { at: 'cta', fn: (a, b) => cta(a, b, { top: 'ARC DE TRIOMPHE', sprites: [{ name: 'racehorse', cx: 470, by: 900, size: 500 }, { name: 'trophy', cx: 820, by: 900, size: 300 }], head: 'VOUS AVEZ DÉJÀ VU<br>L’<span class="a">ARC DE TRIOMPHE</span> ?', headY: 960, headSize: 86, follow: 'follow' }) },
]));
