import { boot } from '../../lib/engine.js';
import { seq, stack, waterfall, cta, at } from '../../lib/beats.js';

boot(async () => seq([
  { fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'CENTRE ÉQUESTRE', y: 228, at: -1 },
    { kind: 'sprite', name: 'stable', cx: 540, by: 720, size: 540, at: -1 },
    { kind: 'head', html: 'COMBIEN IL VOUS<br><span class="a">RESTE</span> ?', y: 770, size: 110, at: -1 },
    { kind: 'chip', html: 'MOINS QUE VOUS NE CROYEZ', style: 'red', y: 1010, size: 50, at: 'loop2', anim: 'stamp', sfx: 'stamp' },
  ], { sfxIn: false }) },
  { at: 'invest', fn: (a, b) => stack(a, b, [
    { kind: 'odo', to: 300000, digits: 6, prefix: '≈&nbsp;', y: 280, size: 160, color: 'gold', at: 'inv2' },
    { kind: 'mono', html: 'TERRAIN · MANÈGE · BOXES · CAVALERIE', y: 470, at: at('inv2', .4), color: 'cream' },
    { kind: 'row', icon: 'heart', iconColor: 'mint', html: '200 CAVALIERS', sub: '≈ 600 € L’ANNÉE', y: 560, h: 150, size: 46, at: 'ca' },
    { kind: 'row', icon: 'sun', iconColor: 'gold', html: 'LES STAGES', y: 725, h: 150, size: 46, at: 'stages' },
    { kind: 'row', icon: 'home', iconColor: 'cream', html: '10 CHEVAUX EN PENSION', y: 890, h: 150, size: 46, at: 'pensions' },
    { kind: 'chip', html: '≈ 200 000 € PAR AN', style: 'mint', y: 1070, size: 60, at: 'ca2', anim: 'stamp', sfx: 'stamp' },
  ], { lab: ['01', 'LE PROJET'], foot: 'SIMULATION · HYPOTHÈSES INDICATIVES' }) },
  { at: 'nourr', fn: (a, b) => waterfall(a, b, { lab: ['02', 'CE QU’IL RESTE'], title: ['CHIFFRE D’AFFAIRES', 'IL VOUS RESTE PAR AN'], digits: 6, odoSize: 140,
    barFmt: v => Math.round(v / 1000) + ' k€', foot: 'SIMULATION · AVANT COTISATIONS ET IMPÔTS DU GÉRANT',
    startBar: { value: 202000, label: ['CHIFFRE', 'D’AFF.'] },
    steps: [{ at: 'nourr2', value: 45000, label: ['FOIN', 'PAILLE'] }, { at: 'soins', value: 30000, label: ['VÉTO', 'MARÉCHAL'] }, { at: 'sal', value: 72000, label: ['2 MONI-', 'TEURS'] }, { at: 'charges', value: 20000, label: ['ÉNERGIE', 'ASSUR.'] }, { at: 'credit', value: 22000, label: ['CRÉDIT', ''] }],
    final: { at: 'reste2', value: 13000, label: ['IL', 'RESTE'] } }) },
  { at: 'heures', fn: (a, b) => stack(a, b, [
    { kind: 'num', html: '≈ 1 080<span class="u">€/MOIS</span>', y: 280, size: 130, color: 'cream', at: 'heures' },
    { kind: 'mono', html: '60 À 70 HEURES PAR SEMAINE', y: 440, at: at('heures', .5), color: 'cream' },
    { kind: 'sprite', name: 'hay', cx: 540, by: 830, size: 340, at: 'dimanche' },
    { kind: 'mono', html: 'LES CHEVAUX MANGENT AUSSI LE DIMANCHE', y: 850, at: at('dimanche', .3) },
    { kind: 'chip', html: '< 4 € DE L’HEURE', style: 'red', y: 940, size: 80, at: 'heure', anim: 'stamp', sfx: 'stamp' },
  ]) },
  { at: 'tva', fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'BONNE NOUVELLE', y: 280, at: 'tva', color: 'cream' },
    { kind: 'num', html: '5,5<span class="u">% DE TVA</span>', y: 330, size: 150, color: 'mint', at: 'tva' },
    { kind: 'mono', html: 'SUR L’ÉQUITATION, DEPUIS 2024', y: 510, at: at('tva', .5) },
    { kind: 'row', icon: 'home', iconColor: 'mint', html: 'LES PENSIONS', y: 620, h: 150, size: 46, at: 'cles' },
    { kind: 'row', icon: 'sun', iconColor: 'mint', html: 'LES STAGES', y: 785, h: 150, size: 46, at: 'cles2' },
    { kind: 'row', icon: 'heart', iconColor: 'mint', html: 'LES ANNIVERSAIRES À PONEY', y: 950, h: 150, size: 46, at: at('cles2', 1.0) },
  ]) },
  { at: 'lecon', fn: (a, b) => stack(a, b, [
    { kind: 'sprite', name: 'stable', cx: 540, by: 700, size: 480, at: 'lecon' },
    { kind: 'head', html: 'D’ABORD UNE <span class="a">PASSION</span>', y: 760, size: 92, at: 'lecon' },
    { kind: 'mono', html: 'LE BUSINESS VIENT APRÈS', y: 880, at: 'lecon2', color: 'cream' },
  ]) },
  { at: 'cta', fn: (a, b) => cta(a, b, { top: 'CENTRE ÉQUESTRE', sprites: [{ name: 'stable', cx: 540, by: 900, size: 540 }], head: 'ENVOYEZ-LA À UN<br><span class="a">GÉRANT</span> DE CENTRE', headY: 960, headSize: 90, follow: 'follow' }) },
]));
