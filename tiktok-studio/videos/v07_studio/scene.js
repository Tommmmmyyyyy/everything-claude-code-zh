import { boot, cue, clamp, ease } from '../../lib/engine.js';
import { seq, stack, waterfall, hbars, cta, at } from '../../lib/beats.js';

boot(async () => seq([
  { fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'INVESTISSEMENT LOCATIF', y: 228, at: -1 },
    { kind: 'sprite', name: 'office', cx: 540, by: 980, size: 600, at: -1 },
    { kind: 'head', html: 'UN STUDIO ÉTUDIANT,<br>ÇA RAPPORTE <span class="a">COMBIEN</span> ?', y: 1040, size: 88, at: -1 },
  ], { sfxIn: false }) },
  { at: 'prix', fn: (a, b) => stack(a, b, [
    { kind: 'sprite', name: 'office', cx: 270, by: 980, size: 460, at: 'prix' },
    { kind: 'mono', html: 'STUDIO · VILLE ÉTUDIANTE', x: 520, y: 400, w: 520, align: 'left', at: 'prix' },
    { kind: 'odo', to: 100000, digits: 6, x: 520, y: 440, w: 540, align: 'left', size: 110, color: 'gold', at: 'prix' },
    { kind: 'mono', html: '+ ≈ 8 000 € DE NOTAIRE', x: 522, y: 580, w: 520, align: 'left', at: 'not' },
    { kind: 'num', html: '450<span class="u">€</span><span class="u" style="color:var(--muted)">/MOIS</span>', x: 520, y: 680, w: 540, align: 'left', size: 100, color: 'cream', at: 'loyer' },
    { kind: 'chip', html: 'RENDEMENT AFFICHÉ : 5,4 %', style: 'gold', x: 520, y: 830, w: 540, align: 'left', size: 34, at: 'brut' },
  ], { lab: ['01', 'L’ACHAT'] }) },
  { at: 'vac', fn: (a, b) => waterfall(a, b, { lab: ['02', 'CE QU’IL RESTE'], title: ['LOYERS PAR AN', 'IL RESTE PAR AN'], foot: 'HYPOTHÈSES INDICATIVES · AVANT IMPÔTS',
    startBar: { value: 5400, label: ['LOYERS', '12 MOIS'] },
    steps: [{ at: 'vac', value: 450, label: ['1 MOIS', 'SANS LOCATAIRE'] }, { at: 'tf', value: 500, label: ['TAXE', 'FONCIÈRE'] }, { at: 'cop', value: 800, label: ['CHARGES', 'ASSUR. · TRAVAUX'] }],
    final: { at: 'net', value: 3650, label: ['IL VOUS', 'RESTE'] } }) },
  { at: 'netp', fn: (a, b) => stack(a, b, [
    { kind: 'num', html: '3,4<span class="u">%</span>', y: 280, size: 220, color: 'mint', at: 'netp' },
    { kind: 'mono', html: 'NET DE CHARGES', y: 520, at: at('netp', .3) },
    { kind: 'chip', html: 'AVANT IMPÔTS', style: 'red', y: 590, size: 40, at: 'avant' },
    { kind: 'num', html: '≈ 300<span class="u">€</span><span class="u" style="color:var(--muted)">/MOIS</span>', y: 760, size: 110, color: 'cream', at: 'mois' },
    { kind: 'mono', html: 'POUR 108 000 € INVESTIS', y: 900, at: at('mois', .5) },
  ]) },
  { at: 'plus', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'ALORS POURQUOI<br>TOUT LE MONDE EN <span class="a">ACHÈTE</span> ?', y: 260, size: 84, at: 'plus' },
    { kind: 'row', icon: 'home', html: 'LE LOCATAIRE REMBOURSE', sub: 'UNE BONNE PARTIE DU CRÉDIT', y: 540, at: 'credit' },
    { kind: 'row', icon: 'check', html: 'DANS 20 ANS', sub: 'LE STUDIO EST À VOUS', y: 740, at: 'patri' },
    { kind: 'head', html: 'PAS UNE MACHINE À CASH.<br>UNE MACHINE À <span class="a">PATRIMOINE</span>.', y: 980, size: 62, at: 'concl' },
  ]) },
  { at: 'cta', fn: (a, b) => cta(a, b, { top: 'STUDIO OU BOURSE ?', sprites: [{ name: 'office', cx: 380, by: 930, size: 480 }, { name: 'coinstack', cx: 760, by: 930, size: 300 }], head: 'VOUS PRÉFÉREZ LE STUDIO,<br>OU LA <span class="a">BOURSE</span> ?', headY: 990, headSize: 82 }) },
]));
