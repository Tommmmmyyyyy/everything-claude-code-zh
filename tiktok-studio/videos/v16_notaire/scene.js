import { boot } from '../../lib/engine.js';
import { seq, stack, splitbar, hbars, cta, at } from '../../lib/beats.js';

boot(async () => seq([
  { fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'FRAIS DE NOTAIRE', y: 228, at: -1 },
    { kind: 'sprite', name: 'apartment', cx: 540, by: 690, size: 450, at: -1 },
    { kind: 'mono', html: 'UN APPARTEMENT À', y: 725, at: -1, color: 'cream' },
    { kind: 'num', html: '250 000<span class="u">€</span>', y: 770, size: 140, color: 'gold', at: -1 },
    { kind: 'head', html: 'LE NOTAIRE EN<br>GARDE <span class="a">COMBIEN</span> ?', y: 950, size: 96, at: -1, until: 'bill' },
    { kind: 'num', html: '+ 20 000<span class="u">€</span>', y: 950, size: 140, color: 'red', at: at('bill', .3), anim: 'stamp', sfx: 'stamp' },
    { kind: 'mono', html: 'DE FRAIS DE NOTAIRE', y: 1105, at: at('bill', .3), color: 'cream' },
  ], { sfxIn: false }) },
  { at: 'loop', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'IL GARDE<br><span class="g">TOUT</span> ?', y: 290, size: 130, at: 'loop' },
    { kind: 'sprite', name: 'deed', cx: 540, by: 1000, size: 600, at: at('loop', .3) },
    { kind: 'chip', html: 'ATTENDEZ DE VOIR SA VRAIE PART', style: 'gold', y: 1090, size: 46, at: 'loop2' },
  ]) },
  { at: 'dep', fn: (a, b) => splitbar(a, b, { lab: ['01', 'OÙ VONT VOS 20 000 €'], head: 'QUI TOUCHE <span class="a">QUOI</span> ?', total: 19920, y: 480,
    rows: [
      { at: 'dep', label: 'DÉPARTEMENT', sub: 'DROITS DE MUTATION', value: 12500, display: '12 500', color: 'red' },
      { at: 'com', label: 'COMMUNE', sub: 'TAXE COMMUNALE', value: 3000, display: '3 000', color: 'gold' },
      { at: 'etat', label: 'ÉTAT', sub: 'TVA · FRAIS D’ASSIETTE · CSI', value: 1025, display: '≈ 1 000', color: 'cream' },
      { at: 'deb', label: 'DÉBOURS', sub: 'DOCUMENTS · FORMALITÉS', value: 1000, display: '≈ 1 000', color: '#7FA89A' },
      { at: 'not2', label: 'LE NOTAIRE', sub: 'SA RÉMUNÉRATION (HT)', value: 2395, display: '≈ 2 400', color: 'mint' },
    ], focus: { at: 'not3', idx: 4, html: 'À PEINE 12 %', style: 'mint' },
    foot: 'BIEN ANCIEN À 250 000 € · DÉPARTEMENT AU TAUX MAXIMAL · ESTIMATION' }) },
  { at: 'impot', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'C’EST SURTOUT<br>UN <span class="r">IMPÔT</span>', y: 280, size: 120, at: 'impot' },
    { kind: 'sprite', name: 'bank', cx: 540, by: 880, size: 440, at: at('impot', .3) },
    { kind: 'chip', html: '2025 : 5,81 % → 6,32 %', style: 'red', y: 940, size: 62, at: 'hausse', anim: 'stamp', sfx: 'stamp' },
    { kind: 'mono', html: 'DANS LA PLUPART DES DÉPARTEMENTS', y: 1050, at: at('hausse', .4), color: 'cream' },
  ]) },
  { at: 'neuf', fn: (a, b) => hbars(a, b, { lab: ['02', 'ANCIEN OU NEUF'], head: 'DANS LE <span class="a">NEUF</span> ?', max: 10, y0: 520, gapY: 260,
    rows: [
      { at: 'neuf', n: '≈ 8 %', nSize: 70, sub: 'ANCIEN', value: 8, display: '20 000 €', vSize: 50, color: 'red', per: 'SUR 250 000 €' },
      { at: 'neuf2', n: '2-3 %', nSize: 70, sub: 'NEUF', value: 2.5, display: '≈ 6 000 €', vSize: 50, color: 'mint', per: 'SUR 250 000 €' },
    ], foot: 'DANS LE NEUF, LA TVA EST DÉJÀ DANS LE PRIX' }) },
  { at: 'astuce', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'MON <span class="a">ASTUCE</span>', y: 270, size: 110, at: 'astuce' },
    { kind: 'sprite', name: 'sofa', cx: 540, by: 700, size: 500, at: 'meubles' },
    { kind: 'mono', html: 'CUISINE ÉQUIPÉE · MEUBLES · ÉLECTROMÉNAGER', y: 720, at: at('meubles', .3), color: 'cream' },
    { kind: 'mono', html: 'CHIFFRÉS À PART DANS L’ACTE', y: 762, at: at('meubles', 1.5) },
    { kind: 'num', html: '− 630<span class="u">€</span>', y: 840, size: 170, color: 'mint', at: 'meubles2' },
    { kind: 'mono', html: 'DE FRAIS POUR 10 000 € DE MEUBLES', y: 1035, at: at('meubles2', .3), color: 'cream' },
  ], { foot: 'À LEUR JUSTE VALEUR : UN PRIX GONFLÉ PEUT ÊTRE REDRESSÉ' }) },
  { at: 'primo', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'PREMIER <span class="a">ACHAT</span> ?', y: 280, size: 110, at: 'primo' },
    { kind: 'sprite', name: 'house', cx: 540, by: 760, size: 420, at: at('primo', .3) },
    { kind: 'num', html: '− 1 300<span class="u">€</span>', y: 800, size: 170, color: 'mint', at: 'primo2' },
    { kind: 'mono', html: 'VOUS ÉCHAPPEZ À LA HAUSSE DE 2025', y: 995, at: at('primo2', .3), color: 'cream' },
  ], { foot: 'RÉSIDENCE PRINCIPALE · PRIMO-ACCÉDANTS · SUR 250 000 €' }) },
  { at: 'bank', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'DERNIER <span class="r">PIÈGE</span>', y: 280, size: 110, at: 'bank' },
    { kind: 'row', icon: 'cross', iconColor: 'red', html: 'LA BANQUE NE LES FINANCE PAS', sub: 'OU RAREMENT', y: 470, h: 180, size: 46, at: 'bank2' },
    { kind: 'row', icon: 'check', iconColor: 'mint', html: 'PRÉVOYEZ-LES EN APPORT', sub: '≈ 8 % DU PRIX DANS L’ANCIEN', y: 680, h: 180, size: 46, at: at('bank2', 1.4) },
    { kind: 'sprite', name: 'coinpile', cx: 540, by: 1150, size: 300, at: at('bank2', 1.8) },
  ]) },
  { at: 'cta', fn: (a, b) => cta(a, b, { top: 'FRAIS DE NOTAIRE', sprites: [{ name: 'deed', cx: 540, by: 880, size: 560 }], head: 'VOUS SAVIEZ QUE LE NOTAIRE<br>GARDAIT <span class="a">SI PEU</span> ?', headY: 950, headSize: 74, follow: 'follow' }) },
]));
