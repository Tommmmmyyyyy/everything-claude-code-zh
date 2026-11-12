import { boot } from '../../lib/engine.js';
import { seq, stack, receipt, cta, at } from '../../lib/beats.js';

boot(async () => seq([
  { fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'DROPSHIPPING', y: 228, at: -1 },
    { kind: 'sprite', name: 'lamp', cx: 540, by: 660, size: 430, at: -1 },
    { kind: 'num', html: '6<span class="u">€</span>', x: 20, w: 400, y: 700, size: 140, color: 'red', at: -1 },
    { kind: 'mono', html: 'ACHETÉE EN CHINE', x: 20, w: 400, y: 870, at: -1 },
    { kind: 'head', html: '→', x: 340, w: 200, y: 715, size: 110, at: -1, color: 'var(--muted)' },
    { kind: 'num', html: '29,90<span class="u">€</span>', x: 500, w: 560, y: 700, size: 140, color: 'mint', at: -1 },
    { kind: 'mono', html: 'REVENDUE EN LIGNE', x: 500, w: 560, y: 870, at: -1 },
    { kind: 'chip', html: '× 5 LE PRIX ?', style: 'gold', y: 960, size: 80, at: 'x5', anim: 'stamp', sfx: 'stamp' },
    { kind: 'mono', html: 'LA PROMESSE DES FORMATIONS', y: 1100, at: 'formation', color: 'cream' },
  ], { sfxIn: false }) },
  { at: 'loop', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'COMBIEN IL VOUS<br><span class="a">RESTE</span> VRAIMENT ?', y: 290, size: 100, at: 'loop' },
    { kind: 'sprite', name: 'parcel', cx: 540, by: 1040, size: 540, at: at('loop', .3) },
  ]) },
  { at: 'principe', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'LE PRINCIPE', y: 270, size: 110, at: 'principe' },
    { kind: 'sprite', name: 'laptop', cx: 200, by: 760, size: 300, at: 'principe' },
    { kind: 'mono', html: 'VOTRE<br>BOUTIQUE', x: 50, w: 300, y: 790, at: 'principe', color: 'cream' },
    { kind: 'sprite', name: 'parcel', cx: 540, by: 760, size: 270, at: 'fourn' },
    { kind: 'mono', html: 'LE<br>FOURNISSEUR', x: 390, w: 300, y: 790, at: 'fourn', color: 'cream' },
    { kind: 'sprite', name: 'house', cx: 880, by: 760, size: 270, at: at('fourn', .9) },
    { kind: 'mono', html: 'LE<br>CLIENT', x: 730, w: 300, y: 790, at: at('fourn', .9), color: 'cream' },
    { kind: 'chip', html: 'VOUS NE TOUCHEZ JAMAIS LE PRODUIT', style: 'ghost', y: 1000, size: 42, at: at('fourn', 1.8) },
  ]) },
  { at: 'produit', fn: (a, b) => receipt(a, b, { lab: ['01', 'UNE COMMANDE'], title: 'TICKET · 1 LAMPE VENDUE', y: 300,
    rows: [
      { at: 'produit', label: 'PRIX DE VENTE', value: 29.90, sign: '+', color: '#12A86F' },
      { at: at('produit', 1.0), label: 'PRODUIT + LIVRAISON', value: 9 },
      { at: 'pub', label: 'PUBLICITÉ', sub: 'POUR DÉCROCHER UNE VENTE', value: 12 },
      { at: 'frais', label: 'FRAIS', sub: 'PAIEMENT · BOUTIQUE · REMBOURSEMENTS', value: 3 },
      { at: 'cotis', label: 'COTISATIONS & TAXES', value: 4 },
    ], total: { at: 'reste2', label: 'IL RESTE', value: 1.90, color: 'red' },
    stamp: { at: at('reste2', .7), html: '− DE 2 € !', color: 'red' },
    foot: 'HYPOTHÈSES INDICATIVES · COÛT PUB MOYEN 8 À 15 $ PAR COMMANDE' }) },
  { at: 'smic', fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'POUR VOUS VERSER', y: 270, at: 'smic', color: 'cream' },
    { kind: 'num', html: '1 500<span class="u">€/MOIS</span>', y: 320, size: 120, color: 'gold', at: 'smic' },
    { kind: 'odo', to: 790, digits: 3, prefix: '≈&nbsp;', suffix: '', y: 520, size: 210, color: 'red', at: 'ventes' },
    { kind: 'mono', html: 'COMMANDES PAR MOIS', y: 760, at: at('ventes', .3), color: 'cream' },
    { kind: 'chip', html: '26 PAR JOUR, TOUS LES JOURS', style: 'red', y: 850, size: 56, at: 'jour', anim: 'stamp', sfx: 'stamp' },
    { kind: 'sprite', name: 'parcel', cx: 540, by: 1170, size: 240, at: at('jour', .5) },
  ]) },
  { at: 'delai', fn: (a, b) => stack(a, b, [
    { kind: 'sprite', name: 'parcel', cx: 540, by: 640, size: 440, at: 'delai', rot: 8 },
    { kind: 'head', html: '<span class="r">3 SEMAINES</span><br>DE LIVRAISON', y: 680, size: 100, at: at('delai', .4) },
    { kind: 'row', icon: 'cross', iconColor: 'red', html: 'LE CLIENT VOUS APPELLE', sub: 'PAS LE FOURNISSEUR', y: 930, h: 170, size: 46, at: 'sav' },
  ]) },
  { at: 'abandon', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'LA PLUPART<br><span class="r">FERMENT</span>', y: 290, size: 130, at: 'abandon' },
    { kind: 'mono', html: 'DÈS LA PREMIÈRE ANNÉE', y: 545, at: at('abandon', .4), color: 'cream' },
    { kind: 'sprite', name: 'laptop', cx: 540, by: 1050, size: 470, at: at('abandon', .2), dim: at('abandon', 1.2) },
  ], { foot: 'SELON LES ACTEURS DU SECTEUR : 80 À 90 % D’ABANDON LA 1ʳᵉ ANNÉE' }) },
  { at: 'twist', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'QUI GAGNE<br><span class="g">VRAIMENT</span> ?', y: 280, size: 130, at: 'twist' },
    { kind: 'sprite', name: 'billsbig', cx: 540, by: 930, size: 520, at: 'vendeurs' },
    { kind: 'chip', html: 'CEUX QUI VENDENT LES FORMATIONS', style: 'gold', y: 1000, size: 50, at: at('vendeurs', .5), anim: 'stamp', sfx: 'stamp' },
  ]) },
  { at: 'cta', fn: (a, b) => cta(a, b, { top: 'DROPSHIPPING', sprites: [{ name: 'parcel', cx: 540, by: 900, size: 520 }], head: 'VOUS AVEZ DÉJÀ ACHETÉ<br>EN <span class="a">DROPSHIPPING</span> ?', headY: 960, headSize: 80, follow: 'follow' }) },
]));
