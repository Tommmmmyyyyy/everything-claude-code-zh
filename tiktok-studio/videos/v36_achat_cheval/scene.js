import { boot } from '../../lib/engine.js';
import { seq, stack, receipt, cta, at } from '../../lib/beats.js';

boot(async () => seq([
  { fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'ACHETER UN CHEVAL', y: 228, at: -1 },
    { kind: 'sprite', name: 'horse', cx: 540, by: 720, size: 520, at: -1 },
    { kind: 'num', html: '5 000<span class="u">€</span>', y: 740, size: 170, color: 'gold', at: -1 },
    { kind: 'head', html: 'VRAIMENT ?', y: 950, size: 110, at: 'vrai', color: 'var(--red)' },
  ], { sfxIn: false }) },
  { at: 'loop', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'LES FRAIS<br>AUXQUELS <span class="r">PERSONNE</span><br>NE PENSE', y: 300, size: 104, at: 'loop' },
    { kind: 'chip', html: '+ L’ERREUR QUI COÛTE CHER', style: 'gold', y: 680, size: 50, at: 'loop2', anim: 'stamp', sfx: 'stamp' },
    { kind: 'sprite', name: 'saddle', cx: 540, by: 1140, size: 360, at: at('loop', .4) },
  ]) },
  { at: 'visite', fn: (a, b) => receipt(a, b, { lab: ['01', 'LA VRAIE FACTURE'], title: 'ACHAT D’UN CHEVAL DE LOISIR', y: 300, dec: 0,
    rows: [
      { at: 'visite', label: 'LE CHEVAL', value: 5000, sign: '', color: '#10261F' },
      { at: 'radios', label: 'VISITE D’ACHAT + RADIOS', value: 600, sign: '+' },
      { at: 'trans2', label: 'TRANSPORT', value: 300, sign: '+' },
      { at: 'selle2', label: 'SELLE ADAPTÉE', value: 1500, sign: '+' },
      { at: 'equip', label: 'FILET · TAPIS · COUVERTURES', value: 500, sign: '+' },
      { at: 'premier', label: '1ᵉʳ MOIS', sub: 'PENSION · MARÉCHAL · VACCINS', value: 500, sign: '+' },
      { at: 'assur', label: 'ASSURANCE 1ʳᵉ ANNÉE', value: 350, sign: '+' },
    ], total: { at: 'total', label: 'TOTAL', value: 8750, color: 'red' },
    stamp: { at: 'pct', html: '+ 75 %', color: 'red', y: 1150 }, rowH: 76 }) },
  { at: 'piege', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'L’ERREUR <span class="r">CLASSIQUE</span>', y: 280, size: 100, at: 'piege' },
    { kind: 'row', icon: 'cross', iconColor: 'red', html: 'LE MOINS CHER', sub: 'POUR ÉCONOMISER', y: 450, h: 160, size: 48, at: 'piege2' },
    { kind: 'row', icon: 'heart', iconColor: 'red', html: 'PROBLÈME DE SANTÉ CACHÉ', sub: 'DES MILLIERS D’EUROS DE VÉTÉRINAIRE', y: 630, h: 160, size: 48, at: 'piege3' },
    { kind: 'sprite', name: 'horse', cx: 540, by: 1160, size: 340, at: at('piege3', .4), dim: at('piege3', 1.2) },
  ]) },
  { at: 'conseils', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'MES <span class="a">CONSEILS</span>', y: 280, size: 110, at: 'conseils' },
    { kind: 'row', icon: 'check', iconColor: 'mint', html: 'ESSAYEZ-LE PLUSIEURS FOIS', sub: 'DANS DIFFÉRENTES SITUATIONS', y: 450, h: 150, size: 44, at: 'c1' },
    { kind: 'row', icon: 'rules', iconColor: 'mint', html: 'SON CARNET DE SANTÉ', y: 615, h: 150, size: 44, at: 'c2' },
    { kind: 'row', icon: 'check', iconColor: 'mint', html: 'UN CONTRAT DE VENTE ÉCRIT', y: 780, h: 150, size: 44, at: 'c3' },
    { kind: 'chip', html: 'PRÉVOYEZ + 50 % DU PRIX', style: 'gold', y: 990, size: 56, at: 'budget', anim: 'stamp', sfx: 'stamp' },
  ], { foot: 'MONTANTS INDICATIFS · VARIENT SELON LA RÉGION ET LE CHEVAL' }) },
  { at: 'cta', fn: (a, b) => cta(a, b, { top: 'ACHETER UN CHEVAL', sprites: [{ name: 'horse', cx: 470, by: 900, size: 500 }, { name: 'saddle', cx: 820, by: 900, size: 280 }], head: 'VOUS AVEZ PAYÉ COMBIEN<br>VOTRE <span class="a">CHEVAL</span> ?', headY: 960, headSize: 84, follow: 'follow' }) },
]));
