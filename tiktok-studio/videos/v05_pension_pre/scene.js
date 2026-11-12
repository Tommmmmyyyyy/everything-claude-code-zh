import { boot, cue, clamp, ease } from '../../lib/engine.js';
import { seq, stack, waterfall, hbars, cta, at } from '../../lib/beats.js';

const FOOT = 'HYPOTHÈSES INDICATIVES · 1 CHEVAL/HA · 170 €/MOIS · FOIN ≈ 200 €/T';
boot(async () => seq([
  { fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'PENSION AU PRÉ', y: 228, at: -1 },
    { kind: 'sprite', name: 'fence', cx: 760, by: 990, size: 420, at: -1, z: 1 },
    { kind: 'sprite', name: 'horse', cx: 420, by: 1000, size: 600, at: -1 },
    { kind: 'head', html: 'UN PRÉ + DES CHEVAUX,<br>ÇA RAPPORTE <span class="a">COMBIEN</span> ?', y: 1040, size: 86, at: -1, pulse: 'calc' },
  ], { sfxIn: false }) },
  { at: 'ha', fn: (a, b) => stack(a, b, [
    { kind: 'num', html: '5<span class="u">HECTARES</span>', y: 300, size: 150, color: 'mint', at: 'ha' },
    { kind: 'mono', html: 'DE PRAIRIE · ≈ 5 000 € L’HECTARE', y: 470, at: at('ha', .5) },
    { kind: 'sprite', name: 'fence', cx: 540, by: 830, size: 380, at: 'clot' },
    { kind: 'mono', html: '+ CLÔTURES · ABRI · EAU', y: 850, at: 'clot' },
    { kind: 'odo', to: 35000, digits: 5, y: 890, size: 150, color: 'gold', at: 'inv' },
    { kind: 'mono', html: 'INVESTIS AU TOTAL', y: 1060, at: at('inv', .4) },
  ], { lab: ['01', 'L’INVESTISSEMENT'] }) },
  { at: 'pens', fn: (a, b) => stack(a, b, [
    { kind: 'sprite', name: 'horse', cx: 290, by: 760, size: 440, at: 'pens' },
    { kind: 'num', html: '170<span class="u">€</span>', x: 520, y: 380, w: 520, align: 'left', size: 150, color: 'gold', at: 'pens' },
    { kind: 'mono', html: 'PAR MOIS ET PAR CHEVAL', x: 526, y: 550, w: 520, align: 'left', at: at('pens', .4) },
    { kind: 'head', html: '5 CHEVAUX × 12 MOIS', y: 820, size: 70, at: 'rev' },
    { kind: 'odo', to: 10200, digits: 5, y: 900, size: 160, color: 'cream', at: at('rev', .3) },
    { kind: 'mono', html: 'DE PENSIONS PAR AN', y: 1075, at: at('rev', .7) },
  ], { lab: ['02', 'LES REVENUS'] }) },
  { at: 'foin', fn: (a, b) => waterfall(a, b, { lab: ['03', 'CE QU’IL RESTE'], title: ['PENSIONS PAR AN', 'IL RESTE PAR AN'], foot: FOOT,
    startBar: { value: 10200, label: ['PENSIONS', '5 CHEVAUX'] },
    steps: [{ at: 'foin', value: 1200, label: ['FOIN', 'L’HIVER'] }, { at: 'ent', value: 1500, label: ['ENTRETIEN', 'EAU · ASSUR.'] }, { at: 'cot', value: 2250, label: ['COTISATIONS', '≈ 30 %'] }],
    final: { at: 'reste', value: 5250, label: ['IL VOUS', 'RESTE'] } }) },
  { at: 'mois', fn: (a, b) => stack(a, b, [
    { kind: 'odo', to: 440, digits: 3, y: 290, size: 210, color: 'mint', at: 'mois' },
    { kind: 'mono', html: 'PAR MOIS', y: 520, at: at('mois', .4) },
    { kind: 'num', html: '≈ 15<span class="u">%</span>', y: 620, size: 150, color: 'gold', at: 'rend' },
    { kind: 'mono', html: 'PAR AN SUR 35 000 € INVESTIS', y: 790, at: at('rend', .4) },
    { kind: 'chip', html: 'ET LE TERRAIN RESTE À VOUS', style: 'mint', y: 870, size: 42, at: 'terre' },
    { kind: 'sprite', name: 'hay', cx: 540, by: 1190, size: 250, at: 'terre' },
  ]) },
  { at: 'mais', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'MAIS <span class="r">ATTENTION</span>…', y: 270, size: 104, at: 'mais' },
    { kind: 'row', icon: 'cal', iconColor: 'gold', html: 'TOUS LES JOURS', sub: 'MATIN ET SOIR', y: 480, at: 'm1' },
    { kind: 'row', icon: 'heart', iconColor: 'gold', html: 'MÊME LE DIMANCHE', sub: 'ET MÊME À NOËL', y: 680, at: 'm2' },
    { kind: 'row', icon: 'clock', iconColor: 'gold', html: '365 HEURES PAR AN', sub: 'UNE HEURE PAR JOUR', y: 880, at: 'm3' },
  ]) },
  { at: 'heure', fn: (a, b) => stack(a, b, [
    { kind: 'num', html: '≈ 14<span class="u">€</span><span class="u" style="color:var(--muted)">/HEURE</span>', y: 290, size: 180, color: 'gold', at: 'heure' },
    { kind: 'mono', html: 'RAPPORTÉ À VOTRE TEMPS', y: 510, at: at('heure', .4) },
    { kind: 'head', html: 'UN BON PLACEMENT…<br>SI VOUS AIMEZ <span class="a">LES CHEVAUX</span>', y: 600, size: 78, at: 'concl' },
    { kind: 'sprite', name: 'horse', cx: 540, by: 1190, size: 420, at: 'concl' },
  ]) },
  { at: 'cta', fn: (a, b) => cta(a, b, { top: 'PENSION AU PRÉ', sprites: [{ name: 'horse', cx: 540, by: 930, size: 600 }], head: 'ET VOUS,<br>VOUS LE <span class="a">FERIEZ</span> ?', headY: 990, headSize: 108 }) },
]));
