import { boot } from '../../lib/engine.js';
import { seq, stack, hbars, cta, at } from '../../lib/beats.js';

boot(async () => seq([
  { fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'LE CHEVAL LE PLUS CHER DE L’HISTOIRE', y: 228, at: -1 },
    { kind: 'sprite', name: 'racehorse', cx: 540, by: 720, size: 520, at: -1 },
    { kind: 'num', html: '70 000 000<span class="u">$</span>', y: 740, size: 120, color: 'gold', at: -1 },
    { kind: 'head', html: 'ET CE N’EST PAS<br>LE <span class="r">PLUS FOU</span>', y: 900, size: 96, at: 'fou' },
  ], { sfxIn: false }) },
  { at: 'loop', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: '3 CHEVAUX<br><span class="g">HORS DE PRIX</span>', y: 300, size: 120, at: 'loop' },
    { kind: 'chip', html: '+ CELUI QUI A COÛTÉ UNE FORTUNE', style: 'red', y: 580, size: 48, at: 'loop2', anim: 'stamp', sfx: 'stamp' },
    { kind: 'sprite', name: 'trophy', cx: 540, by: 1100, size: 400, at: at('loop', .4) },
  ]) },
  { at: 'trois', fn: (a, b) => stack(a, b, [
    { kind: 'num', html: 'Nº 3', y: 260, size: 120, color: 'cream', at: 'trois' },
    { kind: 'mono', html: 'SAUT D’OBSTACLES · 2013', y: 400, at: 'trois', color: 'cream' },
    { kind: 'sprite', name: 'horse_grey', cx: 540, by: 800, size: 400, at: 'pallou' },
    { kind: 'head', html: 'PALLOUBET D’HALONG', y: 820, size: 76, at: 'pallou' },
    { kind: 'num', html: '≈ 11<span class="u">M€</span>', y: 900, size: 130, color: 'gold', at: at('pallou', 1.2) },
    { kind: 'chip', html: 'RECORD POUR UN CHEVAL DE SPORT', style: 'gold', y: 1070, size: 44, at: 'sport' },
  ], { foot: 'MONTANT RAPPORTÉ PAR LA PRESSE SPÉCIALISÉE' }) },
  { at: 'deux', fn: (a, b) => stack(a, b, [
    { kind: 'num', html: 'Nº 2', y: 260, size: 120, color: 'cream', at: 'deux' },
    { kind: 'head', html: 'THE GREEN MONKEY', y: 400, size: 90, at: 'deux' },
    { kind: 'num', html: '425 000<span class="u">$</span>', x: 20, w: 480, y: 540, size: 90, color: 'cream', at: 'gm2' },
    { kind: 'mono', html: 'À 1 AN', x: 20, w: 480, y: 650, at: 'gm2' },
    { kind: 'head', html: '→', x: 450, w: 180, y: 545, size: 90, at: 'gm3', color: 'var(--muted)' },
    { kind: 'num', html: '16 M<span class="u">$</span>', x: 580, w: 460, y: 540, size: 90, color: 'gold', at: 'gm3' },
    { kind: 'mono', html: '7 MOIS PLUS TARD', x: 580, w: 460, y: 650, at: 'gm3' },
    { kind: 'chip', html: 'RECORD POUR UN 2 ANS', style: 'gold', y: 740, size: 50, at: 'gm4' },
    { kind: 'sprite', name: 'foal', cx: 540, by: 1170, size: 340, at: at('gm2', .3) },
  ]) },
  { at: 'twist', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'SAUF <span class="r">QUE…</span>', y: 280, size: 120, at: 'twist' },
    { kind: 'num', html: '3', x: 40, w: 500, y: 450, size: 170, color: 'cream', at: 'twist' },
    { kind: 'mono', html: 'COURSES', x: 40, w: 500, y: 640, at: 'twist' },
    { kind: 'num', html: '0', x: 540, w: 500, y: 450, size: 170, color: 'red', at: 'jamais' },
    { kind: 'mono', html: 'VICTOIRE', x: 540, w: 500, y: 640, at: 'jamais' },
    { kind: 'chip', html: 'GAINS : ≈ 10 000 $', style: 'red', y: 760, size: 64, at: 'gains', anim: 'stamp', sfx: 'stamp' },
    { kind: 'mono', html: 'POUR 16 MILLIONS INVESTIS', y: 890, at: at('gains', .5), color: 'cream' },
  ]) },
  { at: 'un', fn: (a, b) => stack(a, b, [
    { kind: 'num', html: 'Nº 1', y: 260, size: 120, color: 'gold', at: 'un' },
    { kind: 'head', html: 'FUSAICHI PEGASUS', y: 400, size: 90, at: 'un' },
    { kind: 'row', icon: 'cal', iconColor: 'cream', html: 'ACHETÉ À 1 AN', right: '4 M$', rSize: 56, y: 520, h: 150, size: 46, at: 'fp2' },
    { kind: 'row', icon: 'heart', iconColor: 'gold', html: 'KENTUCKY DERBY 2000', sub: 'LA COURSE LA PLUS CÉLÈBRE DES ÉTATS-UNIS', y: 685, h: 150, size: 46, at: 'derby' },
    { kind: 'row', icon: 'up', iconColor: 'mint', html: 'REVENDU COMME ÉTALON', right: '≈ 70 M$', rColor: 'mint', rSize: 56, y: 850, h: 150, size: 46, at: 'fp3' },
    { kind: 'sprite', name: 'trophy', cx: 540, by: 1190, size: 200, at: at('derby', .3) },
  ], { foot: 'MONTANT DE LA REVENTE SELON LES SOURCES : 60 À 70 M$' }) },
  { at: 'pourquoi', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'POURQUOI<br>UN TEL <span class="g">PRIX</span> ?', y: 280, size: 116, at: 'pourquoi' },
    { kind: 'row', icon: 'heart', iconColor: 'mint', html: 'CHAQUE SAILLIE SE PAIE', y: 520, h: 150, size: 46, at: 'saillies' },
    { kind: 'row', icon: 'up', iconColor: 'gold', html: 'DES CENTAINES PAR AN', sub: 'PARFOIS + DE 100 000 € CHACUNE', y: 685, h: 150, size: 46, at: 'centaines' },
    { kind: 'chip', html: 'LE PLUS CHER ≠ LE MEILLEUR', style: 'red', y: 930, size: 56, at: 'l1', anim: 'stamp', sfx: 'stamp' },
  ]) },
  { at: 'cta', fn: (a, b) => cta(a, b, { top: 'LE CHEVAL LE PLUS CHER', sprites: [{ name: 'racehorse', cx: 470, by: 900, size: 500 }, { name: 'trophy', cx: 820, by: 900, size: 300 }], head: 'LEQUEL VOUS A<br>LE PLUS <span class="a">SURPRIS</span> ?', headY: 960, headSize: 96, follow: 'follow' }) },
]));
