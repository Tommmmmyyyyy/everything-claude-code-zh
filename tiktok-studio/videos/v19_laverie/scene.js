import { boot } from '../../lib/engine.js';
import { seq, stack, waterfall, cta, at } from '../../lib/beats.js';

boot(async () => seq([
  { fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'LAVERIE AUTOMATIQUE', y: 228, at: -1 },
    { kind: 'sprite', name: 'washer', cx: 540, by: 760, size: 520, at: -1 },
    { kind: 'head', html: 'LE BUSINESS<br><span class="a">PASSIF</span> PARFAIT ?', y: 810, size: 104, at: -1 },
    { kind: 'chip', html: 'PAS DE STOCK', style: 'ghost', x: -300, y: 1050, size: 36, at: 'hook' },
    { kind: 'chip', html: 'PAS DE SALARIÉ', style: 'ghost', y: 1050, size: 36, at: at('hook', .9) },
    { kind: 'chip', html: 'PAYÉ D’AVANCE', style: 'mint', x: 300, y: 1050, size: 36, at: 'cash' },
  ], { sfxIn: false }) },
  { at: 'loop', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'TOUT DÉPEND<br>D’UN <span class="g">DÉTAIL</span>', y: 290, size: 120, at: 'loop' },
    { kind: 'sprite', name: 'hourglass', cx: 540, by: 1080, size: 520, at: at('loop', .4) },
  ]) },
  { at: 'invest', fn: (a, b) => stack(a, b, [
    { kind: 'odo', to: 120000, digits: 6, y: 280, size: 170, color: 'gold', at: 'invest' },
    { kind: 'mono', html: 'POUR OUVRIR · MACHINES · SÈCHE-LINGE · TRAVAUX', y: 480, at: 'machines', color: 'cream' },
    { kind: 'num', html: '30 000<span class="u">€</span>', x: 40, w: 500, y: 580, size: 104, color: 'cream', at: 'apport' },
    { kind: 'mono', html: 'VOTRE APPORT', x: 40, w: 500, y: 705, at: 'apport' },
    { kind: 'num', html: '90 000<span class="u">€</span>', x: 540, w: 500, y: 580, size: 104, color: 'red', at: 'credit' },
    { kind: 'mono', html: 'CRÉDIT SUR 7 ANS', x: 540, w: 500, y: 705, at: 'credit' },
    { kind: 'chip', html: '≈ 1 270 € PAR MOIS', style: 'red', y: 800, size: 64, at: 'mens', anim: 'stamp', sfx: 'stamp' },
    { kind: 'sprite', name: 'bank', cx: 540, by: 1160, size: 300, at: at('mens', .4) },
  ], { lab: ['01', 'L’INVESTISSEMENT'] }) },
  { at: 'ca', fn: (a, b) => stack(a, b, [
    { kind: 'num', html: '25', x: 40, w: 330, y: 340, size: 130, color: 'gold', at: 'ca' },
    { kind: 'mono', html: 'LAVAGES / JOUR', x: 40, w: 330, y: 500, at: 'ca' },
    { kind: 'num', html: '5,50<span class="u">€</span>', x: 375, w: 330, y: 340, size: 108, color: 'cream', at: at('ca', 1.0) },
    { kind: 'mono', html: 'LE CYCLE', x: 375, w: 330, y: 500, at: at('ca', 1.0) },
    { kind: 'num', html: '30', x: 710, w: 330, y: 340, size: 130, color: 'cream', at: at('ca', 1.6) },
    { kind: 'mono', html: 'JOURS / MOIS', x: 710, w: 330, y: 500, at: at('ca', 1.6) },
    { kind: 'odo', to: 4000, digits: 4, prefix: '≈&nbsp;', y: 630, size: 200, color: 'mint', at: 'ca2' },
    { kind: 'mono', html: 'DE CHIFFRE D’AFFAIRES PAR MOIS', y: 860, at: at('ca2', .4), color: 'cream' },
    { kind: 'sprite', name: 'coinstack', cx: 540, by: 1160, size: 240, at: at('ca2', .6) },
  ], { lab: ['02', 'LES RECETTES'] }) },
  { at: 'loyer', fn: (a, b) => waterfall(a, b, { lab: ['03', 'CE QU’IL RESTE'], title: ['CHIFFRE D’AFFAIRES', 'IL VOUS RESTE PAR MOIS'], foot: 'HYPOTHÈSES INDICATIVES · AVANT IMPÔTS · PAR MOIS',
    startBar: { value: 4000, label: ['CHIFFRE', 'D’AFF.'] },
    steps: [{ at: 'loyer', value: 1000, label: ['LOYER', ''] }, { at: 'energie', value: 800, label: ['EAU', 'ÉNERGIE'] }, { at: 'entretien', value: 300, label: ['ENTRE-', 'TIEN'] }, { at: 'assur', value: 200, label: ['ASSUR.', 'ALARME'] }, { at: 'reste2', value: 1272, label: ['CRÉDIT', '7 ANS'] }],
    final: { at: at('reste2', 1.2), value: 428, label: ['IL', 'RESTE'] } }) },
  { at: 'twist', fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'LE DÉTAIL', y: 270, at: 'twist', color: 'cream' },
    { kind: 'sprite', name: 'bank', cx: 540, by: 780, size: 500, at: 'twist' },
    { kind: 'head', html: 'PENDANT <span class="r">7 ANS</span>,<br>C’EST LA BANQUE<br>QUI GAGNE', y: 830, size: 92, at: 'twist2' },
  ]) },
  { at: 'after', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'ET <span class="a">APRÈS</span> ?', y: 280, size: 120, at: 'after' },
    { kind: 'row', icon: 'clock', iconColor: 'red', html: 'ANNÉES 1 À 7', sub: 'LE CRÉDIT TOURNE', right: '≈ 430 €', rColor: 'red', rSize: 64, y: 470, h: 180, size: 48, at: 'after' },
    { kind: 'row', icon: 'up', iconColor: 'mint', html: 'À PARTIR DE LA 8ᵉ', sub: 'CRÉDIT REMBOURSÉ', right: '≈ 1 700 €', rColor: 'mint', rSize: 64, y: 680, h: 180, size: 48, at: 'after2' },
    { kind: 'chip', html: 'POUR ≈ 1 H DE PASSAGE PAR JOUR', style: 'gold', y: 920, size: 50, at: 'heure', anim: 'stamp', sfx: 'stamp' },
  ], { foot: 'PAR MOIS · AVANT IMPÔTS' }) },
  { at: 'empl', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'TOUT SE JOUE SUR<br>L’<span class="a">EMPLACEMENT</span>', y: 270, size: 96, at: 'empl' },
    { kind: 'row', icon: 'check', iconColor: 'mint', html: 'DES ÉTUDIANTS', y: 480, h: 150, size: 46, at: 'empl2' },
    { kind: 'row', icon: 'check', iconColor: 'mint', html: 'PETITS APPARTEMENTS', sub: 'SANS MACHINE À LAVER', y: 645, h: 150, size: 46, at: at('empl2', 1.3) },
    { kind: 'row', icon: 'check', iconColor: 'mint', html: 'AUCUN CONCURRENT', sub: 'DANS LA RUE', y: 810, h: 150, size: 46, at: at('empl2', 2.8) },
    { kind: 'row', icon: 'rules', iconColor: 'gold', html: 'AVANT IMPÔTS', sub: 'MACHINES À CHANGER EN 10-15 ANS', y: 975, h: 150, size: 46, at: 'impots' },
  ]) },
  { at: 'cta', fn: (a, b) => cta(a, b, { top: 'LAVERIE AUTOMATIQUE', sprites: [{ name: 'washer', cx: 540, by: 900, size: 520 }], head: 'VOUS OUVRIRIEZ<br>UNE <span class="a">LAVERIE</span> ?', headY: 960, headSize: 92, follow: 'follow' }) },
]));
