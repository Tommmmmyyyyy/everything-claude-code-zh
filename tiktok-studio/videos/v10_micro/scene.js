import { boot, cue, clamp, ease } from '../../lib/engine.js';
import { seq, stack, waterfall, hbars, cta, at } from '../../lib/beats.js';

boot(async () => seq([
  { fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'MICRO-ENTREPRISE', y: 228, at: -1 },
    { kind: 'sprite', name: 'laptop', cx: 540, by: 930, size: 600, at: -1 },
    { kind: 'head', html: '1 000 € FACTURÉS,<br>IL VOUS RESTE <span class="a">COMBIEN</span> ?', y: 1040, size: 88, at: -1, pulse: 'combien' },
  ], { sfxIn: false }) },
  { at: 'cot', fn: (a, b) => waterfall(a, b, { lab: ['01', 'LE CALCUL'], title: ['FACTURÉ', 'IL VOUS RESTE'], foot: 'PRESTATIONS DE SERVICES (BIC) · TAUX 2026 · VERSEMENT LIBÉRATOIRE',
    startBar: { value: 1000, label: ['FACTURÉ', ''] },
    steps: [{ at: 'cotv', value: 212, label: ['COTISATIONS', '≈ 21 %'] }, { at: 'impv', value: 17, label: ['IMPÔT', '≈ 2 %'] }, { at: 'fraisv', value: 100, label: ['VOS', 'FRAIS'] }],
    final: { at: 'reste', value: 671, label: ['IL VOUS', 'RESTE'] } }) },
  { at: 'pas', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'ET CE N’EST<br><span class="r">PAS TOUT</span>', y: 260, size: 104, at: 'pas' },
    { kind: 'row', icon: 'cross', iconColor: 'red', html: 'PAS DE CONGÉS PAYÉS', y: 540, at: 'c1' },
    { kind: 'row', icon: 'cross', iconColor: 'red', html: 'PAS DE CHÔMAGE', sub: 'SI VOUS ARRÊTEZ', y: 740, at: 'c2' },
    { kind: 'row', icon: 'cross', iconColor: 'red', html: 'PAS FACTURÉ = 0 €', sub: 'LES JOURS SANS CLIENT', y: 940, at: 'c3' },
  ]) },
  { at: 'besoin', fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'POUR VOUS VERSER', y: 270, at: 'besoin' },
    { kind: 'num', html: '2 000<span class="u">€/MOIS</span>', y: 310, size: 120, color: 'mint', at: 'besoin' },
    { kind: 'mono', html: 'IL FAUT FACTURER', y: 500, at: 'fact' },
    { kind: 'odo', to: 3000, digits: 4, y: 540, size: 200, color: 'gold', at: 'fact' },
    { kind: 'chip', html: 'ET PLUS SI VOUS NE FACTUREZ PAS TOUS LES JOURS', style: 'ghost', y: 800, size: 28, at: 'taux' },
    { kind: 'head', html: 'FIXEZ VOS PRIX<br>AVEC CE <span class="a">CALCUL</span>', y: 920, size: 84, at: 'prix' },
  ]) },
  { at: 'cta', fn: (a, b) => cta(a, b, { top: 'MICRO-ENTREPRISE', sprites: [{ name: 'laptop', cx: 540, by: 930, size: 580 }], head: 'VOUS FACTUREZ<br><span class="a">COMBIEN</span>, VOUS ?', headY: 990, headSize: 104 }) },
]));
