import { boot, cue, clamp, ease } from '../../lib/engine.js';
import { seq, stack, waterfall, hbars, cta, at } from '../../lib/beats.js';

boot(async () => seq([
  { fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'FOOD TRUCK', y: 228, at: -1 },
    { kind: 'sprite', name: 'foodtruck', cx: 540, by: 950, size: 660, at: -1 },
    { kind: 'head', html: 'ÇA RAPPORTE <span class="a">COMBIEN</span><br>À LA FIN DU MOIS ?', y: 1040, size: 92, at: -1 },
  ], { sfxIn: false }) },
  { at: 'camion', fn: (a, b) => stack(a, b, [
    { kind: 'sprite', name: 'foodtruck', cx: 540, by: 760, size: 520, at: 'camion' },
    { kind: 'odo', to: 40000, digits: 5, y: 790, size: 140, color: 'gold', at: at('camion', .3) },
    { kind: 'mono', html: 'D’OCCASION, AMÉNAGÉ', y: 950, at: at('camion', .6) },
    { kind: 'num', html: '≈ 740<span class="u">€/MOIS</span>', y: 1010, size: 90, color: 'cream', at: 'credv' },
    { kind: 'mono', html: 'CRÉDIT SUR 5 ANS', y: 1125, at: 'credit' },
  ], { lab: ['01', 'LE CAMION'] }) },
  { at: 'repas', fn: (a, b) => stack(a, b, [
    { kind: 'num', html: '50', x: 40, y: 330, w: 330, size: 150, color: 'gold', at: 'repas' },
    { kind: 'mono', html: 'REPAS / JOUR', x: 40, y: 500, w: 330, at: 'repas' },
    { kind: 'num', html: '12<span class="u">€</span>', x: 375, y: 330, w: 330, size: 150, color: 'cream', at: at('repas', 1.0) },
    { kind: 'mono', html: 'LE REPAS', x: 375, y: 500, w: 330, at: at('repas', 1.0) },
    { kind: 'num', html: '20', x: 710, y: 330, w: 330, size: 150, color: 'cream', at: 'jours' },
    { kind: 'mono', html: 'JOURS / MOIS', x: 710, y: 500, w: 330, at: 'jours' },
    { kind: 'odo', to: 12000, digits: 5, y: 640, size: 190, color: 'mint', at: 'ca' },
    { kind: 'mono', html: 'DE CHIFFRE D’AFFAIRES PAR MOIS', y: 860, at: at('ca', .4) },
  ], { lab: ['02', 'LES VENTES'] }) },
  { at: 'mat', fn: (a, b) => waterfall(a, b, { lab: ['03', 'CE QU’IL RESTE'], title: ['CHIFFRE D’AFFAIRES', 'IL RESTE PAR MOIS'], foot: 'HYPOTHÈSES INDICATIVES · MICRO-ENTREPRISE (VENTE) · PAR MOIS',
    startBar: { value: 12000, label: ['CHIFFRE', 'D’AFFAIRES'] },
    steps: [{ at: 'mat', value: 3600, label: ['INGRÉ-', 'DIENTS'] }, { at: 'emp', value: 2000, label: ['EMPLAC.', 'GAZ…'] }, { at: 'ass', value: 400, label: ['ASSUR.', 'ENTRETIEN'] }, { at: 'cot', value: 1476, label: ['COTIS.', '12,3 %'] }, { at: 'cred', value: 740, label: ['CRÉDIT', 'CAMION'] }],
    final: { at: 'reste', value: 3784, label: ['IL', 'RESTE'] } }) },
  { at: 'heures', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'SAUF QUE…', y: 260, size: 104, at: 'heures' },
    { kind: 'row', icon: 'clock', iconColor: 'gold', html: 'COURSES · PRÉPARATION', y: 460, h: 150, size: 46, at: at('heures', .5) },
    { kind: 'row', icon: 'clock', iconColor: 'gold', html: 'SERVICE · NETTOYAGE', y: 630, h: 150, size: 46, at: at('heures', 1.6) },
    { kind: 'num', html: '60<span class="u">H / SEMAINE</span>', y: 850, size: 130, color: 'red', at: 'h60' },
  ]) },
  { at: 'horaire', fn: (a, b) => stack(a, b, [
    { kind: 'num', html: '≈ 14,50<span class="u">€/H</span>', y: 290, size: 170, color: 'gold', at: 'horaire' },
    { kind: 'mono', html: 'RAPPORTÉ À VOS HEURES', y: 500, at: at('horaire', .4) },
    { kind: 'row', icon: 'rain', iconColor: 'cream', html: 'PLUIE, JANVIER…', sub: 'LES CLIENTS NE VIENNENT PAS', y: 600, at: 'meteo' },
    { kind: 'head', html: 'UN <span class="a">MÉTIER</span>,<br>PAS UN PLACEMENT', y: 880, size: 92, at: 'metier' },
  ]) },
  { at: 'cta', fn: (a, b) => cta(a, b, { top: 'FOOD TRUCK', sprites: [{ name: 'foodtruck', cx: 540, by: 930, size: 620 }], head: 'VOUS IRIEZ MANGER<br>DANS <span class="a">QUEL</span> FOOD TRUCK ?', headY: 990, headSize: 80 }) },
]));
