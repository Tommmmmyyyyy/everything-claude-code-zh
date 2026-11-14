import { boot } from '../../lib/engine.js';
import { seq, stack, receipt, cta, at } from '../../lib/beats.js';

boot(async () => seq([
  { fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'ÉQUITATION · UN AN', y: 228, at: -1 },
    { kind: 'sprite', name: 'pony', cx: 540, by: 720, size: 500, at: -1 },
    { kind: 'head', html: 'VOTRE ENFANT VEUT<br>FAIRE DU <span class="a">PONEY</span> ?', y: 770, size: 100, at: -1 },
    { kind: 'chip', html: 'LE VRAI BUDGET', style: 'gold', y: 1010, size: 56, at: 'prepare' },
  ], { sfxIn: false }) },
  { at: 'loop', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'ET LE MOMENT<br>OÙ ÇA <span class="r">EXPLOSE</span>', y: 300, size: 116, at: 'loop' },
    { kind: 'sprite', name: 'helmet', cx: 540, by: 1080, size: 420, at: at('loop', .4) },
  ]) },
  { at: 'ffe', fn: (a, b) => stack(a, b, [
    { kind: 'num', html: '+ 625 000', y: 290, size: 150, color: 'mint', at: 'ffe' },
    { kind: 'mono', html: 'LICENCIÉS EN FRANCE', y: 460, at: at('ffe', .4), color: 'cream' },
    { kind: 'num', html: '8 SUR 10', y: 560, size: 130, color: 'gold', at: 'filles' },
    { kind: 'mono', html: 'SONT DES CAVALIÈRES', y: 710, at: at('filles', .4), color: 'cream' },
    { kind: 'sprite', name: 'pony', cx: 540, by: 1160, size: 360, at: at('filles', .5) },
  ], { foot: 'FÉDÉRATION FRANÇAISE D’ÉQUITATION · 2025' }) },
  { at: 'licence', fn: (a, b) => receipt(a, b, { lab: ['01', 'LE BUDGET D’UNE ANNÉE'], title: 'UN ENFANT · UN COURS PAR SEMAINE', y: 300, dec: 0,
    rows: [
      { at: 'licence', label: 'LICENCE FFE (JEUNE)', value: 30, sign: '' , color: '#10261F' },
      { at: 'adhesion', label: 'ADHÉSION AU CLUB', value: 80, sign: '', color: '#10261F' },
      { at: 'forf2', label: 'FORFAIT ANNUEL', sub: 'SOUVENT ENTRE 400 ET 700 €', value: 550, sign: '', color: '#10261F' },
      { at: 'equip2', label: 'CASQUE · BOOTS · PANTALON', value: 200, sign: '', color: '#10261F' },
      { at: 'deux', label: '2 SEMAINES DE STAGE', value: 400, sign: '', color: '#10261F' },
    ], total: { at: 'total', label: 'PAR AN', value: 1260, color: 'red' },
    notes: [{ at: 'mois', html: '≈ 105 € PAR MOIS', style: 'red', y: 1060, size: 60 }],
    foot: 'MONTANTS INDICATIFS · VARIENT BEAUCOUP SELON LE CLUB' }) },
  { at: 'twist', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: '« ET SI J’AVAIS<br>MON <span class="g">PONEY</span> ? »', y: 280, size: 104, at: 'question' },
    { kind: 'row', icon: 'up', iconColor: 'gold', html: 'DEMI-PENSION', sub: 'EN PLUS DU FORFAIT', right: '+ 100 €/MOIS', rColor: 'gold', rSize: 48, y: 520, h: 170, size: 48, at: 'demi' },
    { kind: 'row', icon: 'up', iconColor: 'red', html: 'SON PONEY', sub: 'PENSION · SOINS · MATÉRIEL', right: 'MILLIERS €/AN', rColor: 'red', rSize: 40, y: 710, h: 170, size: 48, at: 'proprio' },
    { kind: 'sprite', name: 'pony', cx: 540, by: 1170, size: 300, at: at('proprio', .4) },
  ], { lab: ['02', 'LE VRAI SAUT'] }) },
  { at: 'astuces', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'MES <span class="a">ASTUCES</span>', y: 280, size: 110, at: 'astuces' },
    { kind: 'row', icon: 'cal', iconColor: 'mint', html: 'D’ABORD UN STAGE', sub: 'OU QUELQUES LEÇONS, AVANT L’ANNÉE', y: 460, h: 170, size: 46, at: 'a1' },
    { kind: 'row', icon: 'check', iconColor: 'mint', html: 'CASQUE NEUF', sub: 'LE RESTE D’OCCASION', y: 650, h: 170, size: 46, at: 'a2' },
    { kind: 'sprite', name: 'helmet', cx: 540, by: 1150, size: 300, at: at('a2', .4) },
  ]) },
  { at: 'cta', fn: (a, b) => cta(a, b, { top: 'ÉQUITATION', sprites: [{ name: 'pony', cx: 460, by: 900, size: 480 }, { name: 'helmet', cx: 820, by: 900, size: 260 }], head: 'VOUS AVEZ COMMENCÉ<br>À <span class="a">QUEL ÂGE</span> ?', headY: 960, headSize: 92, follow: 'follow' }) },
]));
