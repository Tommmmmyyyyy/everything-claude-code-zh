import { boot, cue, clamp, ease } from '../../lib/engine.js';
import { seq, stack, waterfall, hbars, cta, at } from '../../lib/beats.js';

boot(async () => seq([
  { fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'INVESTIR DANS UN PARKING', y: 228, at: -1 },
    { kind: 'sprite', name: 'car', cx: 540, by: 950, size: 640, at: -1 },
    { kind: 'head', html: 'UN PARKING À 15 000 €,<br>BONNE <span class="a">IDÉE</span> ?', y: 1040, size: 96, at: -1 },
  ], { sfxIn: false }) },
  { at: 'prix', fn: (a, b) => stack(a, b, [
    { kind: 'sprite', name: 'car', cx: 290, by: 760, size: 440, at: 'prix' },
    { kind: 'mono', html: 'UNE PLACE EN PROVINCE', x: 540, y: 380, w: 520, align: 'left', at: 'prix' },
    { kind: 'odo', to: 15000, digits: 5, x: 540, y: 420, w: 520, align: 'left', size: 120, color: 'gold', at: 'prix' },
    { kind: 'mono', html: 'AVEC LES FRAIS : 16 500 €', x: 542, y: 570, w: 520, align: 'left', at: 'not' },
    { kind: 'num', html: '80<span class="u">€</span><span class="u" style="color:var(--muted)">/MOIS</span>', y: 860, size: 130, color: 'cream', at: 'loyer' },
    { kind: 'chip', html: 'RENDEMENT AFFICHÉ : 6,4 %', style: 'gold', y: 1040, size: 40, at: 'brut' },
  ], { lab: ['01', 'L’ACHAT'] }) },
  { at: 'pros', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'LES <span class="a">AVANTAGES</span>', y: 270, size: 112, at: 'pros' },
    { kind: 'row', icon: 'check', html: 'PAS DE TRAVAUX', y: 520, at: 'p1' },
    { kind: 'row', icon: 'check', html: 'PRESQUE PAS D’USURE', y: 720, at: 'p2' },
    { kind: 'row', icon: 'check', html: 'IMPAYÉ : PLUS SIMPLE', sub: 'QU’AVEC UN LOGEMENT', y: 920, at: 'p3' },
  ]) },
  { at: 'ch', fn: (a, b) => waterfall(a, b, { lab: ['02', 'CE QU’IL RESTE'], title: ['LOYERS PAR AN', 'IL RESTE PAR AN'], foot: 'HYPOTHÈSES INDICATIVES · AVANT IMPÔTS',
    startBar: { value: 960, label: ['LOYERS', '12 MOIS'] },
    steps: [{ at: 'ch', value: 180, label: ['CHARGES', 'COPRO'] }, { at: at('ch', .7), value: 120, label: ['TAXE', 'FONCIÈRE'] }, { at: at('ch', 1.4), value: 80, label: ['1 MOIS', 'VIDE'] }],
    final: { at: 'net', value: 580, label: ['IL VOUS', 'RESTE'] } }) },
  { at: 'mois', fn: (a, b) => stack(a, b, [
    { kind: 'num', html: '≈ 48<span class="u">€</span><span class="u" style="color:var(--muted)">/MOIS</span>', y: 300, size: 170, color: 'mint', at: 'mois' },
    { kind: 'mono', html: 'RENDEMENT NET ≈ 3,5 %', y: 520, at: 'netp' },
    { kind: 'head', html: '≈ <span class="a">AUTANT</span> QU’UN STUDIO', y: 620, size: 76, at: 'comp' },
    { kind: 'sprite', name: 'car', cx: 330, by: 1040, size: 360, at: 'comp' },
    { kind: 'sprite', name: 'office', cx: 770, by: 1040, size: 330, at: 'comp' },
    { kind: 'chip', html: 'AVEC BEAUCOUP MOINS DE SOUCIS', style: 'mint', y: 1070, size: 38, at: 'moins' },
  ]) },
  { at: 'emp', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'LE SECRET :<br>L’<span class="a">EMPLACEMENT</span>', y: 280, size: 110, at: 'emp' },
    { kind: 'row', icon: 'home', iconColor: 'gold', html: 'PRÈS D’UNE GARE', y: 560, at: 'gare' },
    { kind: 'row', icon: 'home', iconColor: 'gold', html: 'EN CENTRE-VILLE', y: 760, at: at('gare', .8) },
    { kind: 'row', icon: 'home', iconColor: 'gold', html: 'IMPOSSIBLE DE SE GARER', y: 960, at: at('gare', 1.6) },
  ]) },
  { at: 'cta', fn: (a, b) => cta(a, b, { top: 'PARKING OU STUDIO ?', sprites: [{ name: 'car', cx: 540, by: 930, size: 600 }], head: 'PARKING<br>OU <span class="a">STUDIO</span> ?', headY: 990, headSize: 120 }) },
]));
