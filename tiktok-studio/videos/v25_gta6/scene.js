import { boot } from '../../lib/engine.js';
import { seq, stack, receipt, hbars, cta, at } from '../../lib/beats.js';

boot(async () => seq([
  { fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'GTA 6 · SORTIE LE 19 NOVEMBRE', y: 228, at: -1 },
    { kind: 'sprite', name: 'gamebox', cx: 540, by: 700, size: 460, at: -1, rot: -4 },
    { kind: 'logo', name: 'rockstargames', cx: 770, cy: 370, size: 140, at: -1 },
    { kind: 'num', html: '79,99<span class="u">€</span>', y: 730, size: 170, color: 'gold', at: -1 },
    { kind: 'head', html: 'COMBIEN POUR<br><span class="a">ROCKSTAR</span> ?', y: 950, size: 104, at: -1 },
  ], { sfxIn: false }) },
  { at: 'loop', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'COMBIEN DE JEUX<br>POUR <span class="g">REMBOURSER</span> ?', y: 290, size: 100, at: 'loop' },
    { kind: 'sprite', name: 'controller', cx: 540, by: 1040, size: 560, at: at('loop', .4) },
  ]) },
  { at: 'pre', fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'AVANT MÊME LA SORTIE', y: 280, at: 'pre', color: 'cream' },
    { kind: 'num', html: '+ 1<span class="u">MILLIARD $</span>', y: 330, size: 170, color: 'mint', at: at('pre', .6) },
    { kind: 'mono', html: 'DE PRÉCOMMANDES · ESTIMATION', y: 530, at: at('pre', 1.0) },
    { kind: 'sprite', name: 'billsbig', cx: 540, by: 1080, size: 560, at: at('pre', .8) },
  ]) },
  { at: 'ticket', fn: (a, b) => receipt(a, b, { lab: ['01', 'VOTRE TICKET'], title: 'GTA 6 · VERSION NUMÉRIQUE', y: 320,
    rows: [
      { at: 'ticket', label: 'PRIX PAYÉ', value: 79.99, sign: '', color: '#10261F' },
      { at: 'tva', label: 'TVA 20 %', sub: 'POUR L’ÉTAT', value: 13.33 },
      { at: 'sony2', label: 'SONY OU MICROSOFT', sub: '≈ 30 % DU PRIX HORS TAXE', value: 20 },
    ], total: { at: 'reste', label: 'TAKE-TWO', value: 46.66, color: 'mint' },
    stamp: { at: 'moins', html: '58 % DU PRIX', color: 'mint' },
    notes: [{ kind: 'logo', name: 'playstation', at: 'sony', cx: 1012, cy: 640, size: 100 }, { kind: 'logo', name: 'taketwointeractivesoftware', at: 'reste', cx: 68, cy: 760, size: 100 }],
    foot: 'CALCUL INDICATIF · HORS FRAIS DE DISTRIBUTION ET DE MARKETING' }) },
  { at: 'budget', fn: (a, b) => hbars(a, b, { lab: ['02', 'LE BUDGET'], head: 'UN JEU <span class="r">HORS DE PRIX</span>', headAt: 'budget', max: 1000, y0: 540, gapY: 230,
    rows: [
      { at: 'gta5', n: 'GTA 5', nSize: 60, value: 265, display: '265 M$', color: 'cream', per: 'DÉVELOPPEMENT · 2013' },
      { at: 'gta6', n: 'GTA 6', nSize: 60, value: 1000, display: '+ 1 MD $', color: 'red', per: 'ESTIMATION DES ANALYSTES' },
    ], foot: 'BUDGET NON OFFICIEL · ROCKSTAR N’A PUBLIÉ AUCUN CHIFFRE' }) },
  { at: 'calc', fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: '1 MILLIARD ÷ 47 € PAR JEU', y: 280, at: 'calc', color: 'cream' },
    { kind: 'num', html: '≈ 20<span class="u">MILLIONS</span>', y: 340, size: 170, color: 'red', at: 'calc2' },
    { kind: 'mono', html: 'D’EXEMPLAIRES, JUSTE POUR REMBOURSER', y: 550, at: at('calc2', .4) },
    ...[0, 1, 2, 3, 4].map(i => ({ kind: 'sprite', name: 'gamebox', cx: 160 + i * 190, by: 1000, size: 230, at: at('calc2', .5 + i * .12), sfx: false })),
  ]) },
  { at: 'twist', fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'SAUF QUE GTA 5 S’EST VENDU À', y: 270, at: 'twist', color: 'cream' },
    { kind: 'num', html: '235<span class="u">MILLIONS</span>', y: 320, size: 170, color: 'mint', at: at('twist', .8) },
    { kind: 'mono', html: 'D’EXEMPLAIRES · CHIFFRE TAKE-TWO', y: 530, at: at('twist', 1.2) },
    { kind: 'row', icon: 'up', iconColor: 'mint', html: 'GTA ONLINE', sub: 'ACHATS DANS LE JEU, CHAQUE ANNÉE', y: 640, h: 170, size: 50, at: 'online' },
    { kind: 'sprite', name: 'controller', cx: 540, by: 1170, size: 340, at: at('online', .4) },
  ]) },
  { at: 'action', fn: (a, b) => stack(a, b, [
    { kind: 'logo', name: 'taketwointeractivesoftware', cx: 540, cy: 320, size: 150, at: 'action' },
    { kind: 'head', html: 'ET L’ACTION <span class="a">TAKE-TWO</span> ?', y: 420, size: 84, at: 'action' },
    { kind: 'num', html: '18<span class="u">$</span>', x: 40, w: 440, y: 590, size: 150, color: 'cream', at: 'ttwo' },
    { kind: 'mono', html: '2013 · SORTIE DE GTA 5', x: 40, w: 440, y: 760, at: 'ttwo' },
    { kind: 'head', html: '→', x: 400, w: 180, y: 620, size: 100, at: 'ttwo2', color: 'var(--muted)' },
    { kind: 'num', html: '≈ 220<span class="u">$</span>', x: 580, w: 460, y: 590, size: 150, color: 'mint', at: 'ttwo2' },
    { kind: 'mono', html: 'AUJOURD’HUI', x: 580, w: 460, y: 760, at: 'ttwo2' },
    { kind: 'chip', html: '× 12', style: 'gold', y: 860, size: 100, at: 'x12', anim: 'stamp', sfx: 'stamp' },
  ], { foot: 'LES PERFORMANCES PASSÉES NE PRÉJUGENT PAS DES PERFORMANCES FUTURES' }) },
  { at: 'cta', fn: (a, b) => cta(a, b, { top: 'GTA 6', sprites: [{ name: 'gamebox', cx: 400, by: 900, size: 420 }, { name: 'controller', cx: 730, by: 900, size: 420 }], logos: [{ name: 'rockstargames', cx: 540, cy: 380, size: 130 }], head: 'VOUS L’AVEZ<br><span class="a">PRÉCOMMANDÉ</span> ?', headY: 960, headSize: 96, follow: 'follow' }) },
]));
