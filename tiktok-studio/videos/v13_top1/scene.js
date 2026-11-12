import { boot, cue, clamp, ease } from '../../lib/engine.js';
import { seq, stack, waterfall, hbars, cta, at } from '../../lib/beats.js';

boot(async () => seq([
  { fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'FRANCE · REVENUS', y: 228, at: -1 },
    { kind: 'sprite', name: 'goldbars', cx: 540, by: 900, size: 600, at: -1 },
    { kind: 'head', html: 'LES <span class="g">1 %</span> LES PLUS RICHES :<br>À PARTIR DE COMBIEN ?', y: 1040, size: 84, at: -1 },
  ], { sfxIn: false }) },
  { at: 'devine', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'DEVINEZ<br><span class="a">AVANT</span> LA RÉPONSE', y: 480, size: 130, at: 'devine' },
    { kind: 'num', html: '?', y: 780, size: 260, color: 'gold', at: at('devine', .5), anim: 'pop' },
  ]) },
  { at: 'med', fn: (a, b) => hbars(a, b, { head: '<span style="font-size:.62em">PAR MOIS, APRÈS IMPÔTS<br>PERSONNE SEULE</span>', headAt: 'med', max: 7512, y0: 560, gapY: 210, unitLabel: 'PAR MOIS',
    foot: 'SOURCES : INSEE (MÉDIANE 2024) · OBSERVATOIRE DES INÉGALITÉS',
    rows: [{ at: 'medv', n: 'MILIEU', nSize: 46, sub: 'MÉDIANE', value: 2228, display: '2 228 €', color: 'cream' },
      { at: 'richev', n: 'RICHE', nSize: 46, sub: '2 × LA<br>MÉDIANE', value: 4456, display: '4 456 €', color: 'gold' },
      { at: 'topv', n: 'TOP 1 %', nSize: 46, sub: '', value: 7512, display: '≈ 7 500 €', color: 'mint' }] }) },
  { at: 'couple', fn: (a, b) => stack(a, b, [
    { kind: 'chip', html: 'ATTENTION : PERSONNE SEULE', style: 'ghost', y: 260, size: 38, at: 'couple' },
    { kind: 'head', html: 'COUPLE + 2 ENFANTS', y: 410, size: 92, at: 'fam' },
    { kind: 'mono', html: '× ≈ 2,1 (UNITÉS DE CONSOMMATION)', y: 530, at: 'famv' },
    { kind: 'odo', to: 15775, digits: 5, y: 600, size: 190, color: 'mint', at: 'famr' },
    { kind: 'mono', html: 'PAR MOIS POUR LE FOYER', y: 820, at: at('famr', .4) },
  ]) },
  { at: 'surpr', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'SE SENTIR RICHE<br><span class="r">≠</span> ÊTRE RICHE', y: 420, size: 120, at: 'surpr' },
    { kind: 'chip', html: 'BEAUCOUP SONT DÉJÀ EN HAUT DE L’ÉCHELLE', style: 'mint', y: 760, size: 34, at: 'surpr2' },
  ]) },
  { at: 'cta', fn: (a, b) => cta(a, b, { top: 'LES 1 % LES PLUS RICHES', sprites: [{ name: 'goldbars', cx: 540, by: 900, size: 560 }], head: 'VOUS AVIEZ DEVINÉ<br><span class="a">COMBIEN</span> ?', headY: 990, headSize: 108 }) },
]));
