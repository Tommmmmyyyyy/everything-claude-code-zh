import { boot, cue, clamp, ease } from '../../lib/engine.js';
import { seq, stack, waterfall, hbars, cta, at } from '../../lib/beats.js';

const STEPS = [['p1', 4200], ['mar', 600], ['vet', 400], ['ass', 300], ['equ', 300], ['div', 200]];
const total = tt => STEPS.reduce((acc, [c, v]) => acc + v * ease.outCubic(clamp((tt - cue(c) - .2) / .8)), 0);
boot(async () => seq([
  { fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'LE VRAI BUDGET', y: 228, at: -1 },
    { kind: 'sprite', name: 'horse', cx: 540, by: 990, size: 660, at: -1 },
    { kind: 'head', html: 'UN CHEVAL, ÇA COÛTE<br><span class="g">COMBIEN</span> PAR AN ?', y: 1040, size: 90, at: -1 },
  ], { sfxIn: false }) },
  { at: 'p1', fn: (a, b) => stack(a, b, [
    { kind: 'odo', to: 6000, fn: total, digits: 4, y: 250, size: 160, color: 'gold', at: 'p1', sfx: 'rise', dur: 6 },
    { kind: 'mono', html: 'PAR AN', y: 430, at: at('p1', .3) },
    { kind: 'row', icon: 'home', iconColor: 'gold', html: 'PENSION EN BOX', sub: '≈ 350 € PAR MOIS', right: '4 200 €', y: 510, h: 108, size: 40, at: 'p1' },
    { kind: 'row', icon: 'cal', iconColor: 'gold', html: 'MARÉCHAL-FERRANT', sub: 'TOUTES LES 6 À 8 SEMAINES', right: '600 €', y: 626, h: 108, size: 40, at: 'mar' },
    { kind: 'row', icon: 'heart', iconColor: 'gold', html: 'VÉTÉRINAIRE', sub: 'VACCINS · DENTISTE · VERMIFUGES', right: '400 €', y: 742, h: 108, size: 40, at: 'vet' },
    { kind: 'row', icon: 'check', iconColor: 'gold', html: 'ASSURANCE', right: '300 €', y: 858, h: 108, size: 40, at: 'ass' },
    { kind: 'row', icon: 'box', iconColor: 'gold', html: 'MATÉRIEL', sub: 'SELLE · COUVERTURES', right: '300 €', y: 974, h: 108, size: 40, at: 'equ' },
    { kind: 'row', icon: 'up', iconColor: 'gold', html: 'PETITS EXTRAS', right: '200 €', y: 1090, h: 108, size: 40, at: 'div' },
  ], { lab: ['01', 'LE BUDGET'] }) },
  { at: 'tot', fn: (a, b) => stack(a, b, [
    { kind: 'num', html: '6 000<span class="u">€</span>', y: 290, size: 220, color: 'gold', at: 'tot', pulse: at('tot', .3) },
    { kind: 'mono', html: 'PAR AN, SANS PÉPIN', y: 530, at: at('tot', .3) },
    { kind: 'num', html: '500<span class="u">€</span><span class="u" style="color:var(--muted)">/MOIS</span>', y: 600, size: 110, color: 'cream', at: 'mois' },
    { kind: 'chip', html: 'IMPRÉVU : COLIQUE + CHIRURGIE', style: 'red', y: 820, size: 40, at: 'colique' },
    { kind: 'num', html: '3 000 À 5 000<span class="u">€</span>', y: 920, size: 100, color: 'red', at: at('colique', 1.2) },
    { kind: 'mono', html: 'D’UN SEUL COUP', y: 1050, at: at('colique', 1.5) },
  ]) },
  { at: 'vie', fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'UN CHEVAL VIT SOUVENT 25 ANS ET PLUS', y: 260, at: 'vie' },
    { kind: 'odo', to: 120000, digits: 6, y: 320, size: 170, color: 'gold', at: 'y20' },
    { kind: 'mono', html: 'SUR 20 ANS', y: 510, at: at('y20', .4) },
    { kind: 'sprite', name: 'house', cx: 540, by: 1020, size: 420, at: 'appart' },
    { kind: 'chip', html: 'LE PRIX D’UN PETIT APPARTEMENT', y: 1060, size: 40, at: 'appart' },
  ]) },
  { at: 'concl', fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'DEMANDEZ À UN CAVALIER', y: 260, at: 'concl' },
    { kind: 'sprite', name: 'horse', cx: 540, by: 900, size: 560, at: 'concl' },
    { kind: 'head', html: 'ÇA N’A PAS<br><span class="a">DE PRIX</span>.', y: 950, size: 120, at: 'nprix' },
  ]) },
  { at: 'cta', fn: (a, b) => cta(a, b, { top: 'LE BUDGET CHEVAL', sprites: [{ name: 'horse', cx: 540, by: 920, size: 580 }], head: 'VOTRE CHEVAL VOUS COÛTE<br><span class="g">COMBIEN</span> PAR MOIS ?', headY: 990, headSize: 80 }) },
]));
