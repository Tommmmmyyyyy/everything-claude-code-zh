import { boot } from '../../lib/engine.js';
import { seq, stack, hbars, cta, at } from '../../lib/beats.js';

boot(async () => seq([
  { fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'DEAUVILLE · AOÛT 2026', y: 228, at: -1 },
    { kind: 'sprite', name: 'foal', cx: 540, by: 720, size: 520, at: -1 },
    { kind: 'num', html: '4 600 000<span class="u">€</span>', y: 740, size: 130, color: 'gold', at: -1 },
    { kind: 'head', html: 'POUR UN POULAIN<br>QUI N’A <span class="r">JAMAIS COURU</span>', y: 900, size: 88, at: 'jamais' },
  ], { sfxIn: false }) },
  { at: 'loop', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'POURQUOI ?<br>ET ÇA <span class="a">RAPPORTE</span> ?', y: 300, size: 120, at: 'loop' },
    { kind: 'sprite', name: 'gavel', cx: 540, by: 1080, size: 440, at: at('loop', .4) },
  ]) },
  { at: 'arqana', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'LES VENTES<br><span class="g">ARQANA</span>', y: 280, size: 116, at: 'arqana' },
    { kind: 'mono', html: 'CHAQUE MOIS D’AOÛT, À DEAUVILLE', y: 520, at: at('arqana', .5), color: 'cream' },
    { kind: 'sprite', name: 'foal', cx: 540, by: 1000, size: 400, at: 'yearling' },
    { kind: 'chip', html: 'YEARLING = PUR-SANG D’UN AN', style: 'gold', y: 1040, size: 46, at: at('yearling', .4) },
  ], { lab: ['01', 'LE MARCHÉ'] }) },
  { at: 'record', fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'FILS DE L’ÉTALON WOOTTON BASSETT', y: 280, at: 'record', color: 'cream' },
    { kind: 'odo', to: 4600000, digits: 7, y: 330, size: 130, color: 'gold', at: at('record', .6) },
    { kind: 'chip', html: 'RECORD ABSOLU', style: 'red', y: 510, size: 64, at: 'record2', anim: 'stamp', sfx: 'stamp' },
    { kind: 'mono', html: 'RECORD PRÉCÉDENT, EN 2025 : 3 M€', y: 640, at: 'avant' },
    { kind: 'sprite', name: 'gavel', cx: 540, by: 1120, size: 380, at: at('record', .4) },
  ], { foot: 'VENTE DE YEARLINGS D’AOÛT · ARQANA · 17 AOÛT 2026' }) },
  { at: 'total', fn: (a, b) => stack(a, b, [
    { kind: 'num', html: '66<span class="u">M€</span>', x: 40, w: 500, y: 280, size: 140, color: 'mint', at: 'total' },
    { kind: 'mono', html: 'SUR TOUTE LA VENTE', x: 40, w: 500, y: 440, at: 'total' },
    { kind: 'num', html: '10', x: 540, w: 500, y: 280, size: 140, color: 'cream', at: 'dix' },
    { kind: 'mono', html: 'POULAINS À + D’1 M€', x: 540, w: 500, y: 440, at: 'dix' },
    { kind: 'num', html: '≈ 280 000<span class="u">€</span>', y: 540, size: 110, color: 'gold', at: 'moyenne' },
    { kind: 'mono', html: 'LE PRIX MOYEN', y: 680, at: at('moyenne', .3) },
    { kind: 'chip', html: 'LE MÊME JOUR : 20 000 €', style: 'ghost', y: 790, size: 52, at: 'ecart' },
    { kind: 'chip', html: '230 FOIS MOINS', style: 'red', y: 900, size: 64, at: 'x230', anim: 'stamp', sfx: 'stamp' },
  ], { lab: ['02', 'LES CHIFFRES'] }) },
  { at: 'pourquoi', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'CE QU’ON <span class="g">ACHÈTE</span>', y: 280, size: 104, at: 'pourquoi' },
    { kind: 'row', icon: 'heart', iconColor: 'cream', html: 'LE PÈRE · LA MÈRE', y: 440, h: 140, size: 44, at: at('pourquoi', .5) },
    { kind: 'row', icon: 'check', iconColor: 'cream', html: 'LA MORPHOLOGIE', y: 595, h: 140, size: 44, at: at('pourquoi', 1.3) },
    { kind: 'row', icon: 'up', iconColor: 'gold', html: 'L’ESPOIR', y: 750, h: 140, size: 44, at: 'espoir' },
    { kind: 'row', icon: 'rules', iconColor: 'mint', html: 'LE FUTUR ÉTALON', sub: 'CHAQUE SAILLIE SE PAIE TRÈS CHER', y: 905, h: 150, size: 44, at: 'etalon' },
  ], { lab: ['03', 'POURQUOI'] }) },
  { at: 'twist', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'SAUF <span class="r">QUE…</span>', y: 280, size: 120, at: 'twist' },
    { kind: 'mono', html: 'LA PLUPART NE GAGNERONT JAMAIS DE GRANDE COURSE', y: 450, size: 22, at: at('twist', .6), color: 'cream' },
    { kind: 'chip', html: 'UN PARI À PLUSIEURS MILLIONS', style: 'red', y: 540, size: 56, at: 'pari', anim: 'stamp', sfx: 'stamp' },
    { kind: 'mono', html: 'ACHETEURS : IRLANDE · GOLFE · ÉTATS-UNIS', y: 700, at: 'ach2', color: 'cream' },
    { kind: 'sprite', name: 'foal', cx: 540, by: 1160, size: 380, at: at('pari', .3) },
  ]) },
  { at: 'cta', fn: (a, b) => cta(a, b, { top: 'DEAUVILLE', sprites: [{ name: 'foal', cx: 470, by: 900, size: 500 }, { name: 'gavel', cx: 820, by: 900, size: 300 }], head: 'VOUS METTRIEZ COMBIEN<br>POUR UN <span class="a">POULAIN</span> ?', headY: 960, headSize: 86, follow: 'follow' }) },
]));
