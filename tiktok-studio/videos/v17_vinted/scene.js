import { boot } from '../../lib/engine.js';
import { seq, stack, receipt, cta, at } from '../../lib/beats.js';

boot(async () => seq([
  { fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'VOS PLACARDS', y: 228, at: -1 },
    { kind: 'sprite', name: 'tshirt', cx: 350, by: 690, size: 400, at: -1, rot: -6 },
    { kind: 'sprite', name: 'sneaker', cx: 740, by: 690, size: 400, at: -1 },
    { kind: 'num', html: '320<span class="u">€</span>', y: 700, size: 220, color: 'gold', at: -1 },
    { kind: 'head', html: 'QUI DORMENT<br><span class="a">CHEZ VOUS</span>', y: 940, size: 100, at: -1 },
    { kind: 'chip', html: 'PAS SUR VOTRE COMPTE', style: 'red', y: 1140, size: 46, at: 'placard' },
  ], { sfxIn: false }) },
  { at: 'study', fn: (a, b) => stack(a, b, [
    { kind: 'num', html: '19', y: 270, size: 230, color: 'cream', at: 'study' },
    { kind: 'mono', html: 'OBJETS INUTILISÉS PAR FOYER', y: 510, at: at('study', .3), color: 'cream' },
    { kind: 'mono', html: 'ÉTUDE OPINIONWAY', y: 550, size: 20, at: at('study', .5) },
    { kind: 'num', html: '17<span class="u">%</span>', y: 650, size: 190, color: 'red', at: 'seuls' },
    { kind: 'mono', html: 'SEULEMENT LES REVENDENT', y: 860, at: at('seuls', .3), color: 'cream' },
    { kind: 'sprite', name: 'parcel', cx: 540, by: 1170, size: 260, at: at('seuls', .6) },
  ]) },
  { at: 'vinted', fn: (a, b) => stack(a, b, [
    { kind: 'sprite', name: 'phone', cx: 540, by: 700, size: 470, at: 'vinted' },
    { kind: 'chip', html: '0 € DE COMMISSION', style: 'mint', y: 760, size: 74, at: 'zero', anim: 'stamp', sfx: 'stamp' },
    { kind: 'mono', html: 'POUR LE VENDEUR', y: 880, at: at('zero', .3), color: 'cream' },
    { kind: 'row', icon: 'check', iconColor: 'cream', html: 'L’ACHETEUR PAIE', sub: 'LA PROTECTION · 0,70 € + 5 % DU PRIX', y: 960, h: 170, size: 46, at: 'acheteur' },
  ]) },
  { at: 'calc', fn: (a, b) => receipt(a, b, { lab: ['01', 'LE CALCUL'], title: 'VOTRE VIDE-DRESSING', dec: 0, y: 320,
    rows: [
      { at: 'jean', label: 'JEAN DE MARQUE', value: 15, sign: '+', color: '#12A86F' },
      { at: 'shoes', label: 'BASKETS PEU PORTÉES', value: 35, sign: '+', color: '#12A86F' },
      { at: 'manteau', label: 'MANTEAU D’HIVER', value: 40, sign: '+', color: '#12A86F' },
      { at: 'kids', label: 'VÊTEMENTS D’ENFANTS', sub: '10 PIÈCES DEVENUES TROP PETITES', value: 60, sign: '+', color: '#12A86F' },
    ], total: { at: at('kids', 2.2), label: 'DÉJÀ', value: 150, sign: '+' },
    foot: 'PRIX INDICATIFS DE SECONDE MAIN' }) },
  { at: 'impots', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'ET LES <span class="g">IMPÔTS</span> ?', y: 280, size: 110, at: 'impots' },
    { kind: 'row', icon: 'rules', iconColor: 'gold', html: 'LE FISC EST PRÉVENU', sub: 'DÈS 30 VENTES OU 2 000 € PAR AN', y: 470, h: 180, size: 48, at: 'dac7' },
    { kind: 'row', icon: 'check', iconColor: 'mint', html: 'VOS AFFAIRES PERSO', sub: 'PAS IMPOSABLES · SAUF OBJET > 5 000 €', y: 680, h: 180, size: 48, at: 'pastax' },
    { kind: 'sprite', name: 'deed', cx: 540, by: 1150, size: 320, at: at('dac7', .4) },
  ]) },
  { at: 'twist', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'SAUF <span class="r">QUE…</span>', y: 280, size: 130, at: 'twist' },
    { kind: 'row', icon: 'cross', iconColor: 'red', html: 'ACHETER POUR REVENDRE', sub: 'C’EST UNE ACTIVITÉ COMMERCIALE', y: 490, h: 180, size: 48, at: 'achat' },
    { kind: 'row', icon: 'rules', iconColor: 'gold', html: 'À DÉCLARER', sub: 'EN MICRO-ENTREPRISE PAR EXEMPLE', y: 700, h: 180, size: 48, at: 'pro' },
    { kind: 'sprite', name: 'parcel', cx: 540, by: 1150, size: 280, at: at('achat', .4) },
  ]) },
  { at: 'marge', fn: (a, b) => stack(a, b, [
    { kind: 'sprite', name: 'tshirt', cx: 540, by: 640, size: 420, at: 'marge', rot: -5 },
    { kind: 'num', html: '3<span class="u">€</span>', x: 40, w: 440, y: 680, size: 170, color: 'red', at: 'marge' },
    { kind: 'mono', html: 'EN VIDE-GRENIER', x: 40, w: 440, y: 880, at: 'marge' },
    { kind: 'head', html: '→', y: 690, size: 150, at: at('marge', 1.0), color: 'var(--muted)' },
    { kind: 'num', html: '25<span class="u">€</span>', x: 600, w: 440, y: 680, size: 170, color: 'mint', at: at('marge', 1.2) },
    { kind: 'mono', html: 'REVENDUE EN LIGNE', x: 600, w: 440, y: 880, at: at('marge', 1.2) },
    { kind: 'chip', html: 'UN VRAI PETIT COMMERCE', style: 'gold', y: 990, size: 54, at: 'marge2', anim: 'stamp', sfx: 'stamp' },
  ]) },
  { at: 'place', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'FAITES CE TRI<br><span class="a">CHAQUE ANNÉE</span>', y: 270, size: 100, at: 'place' },
    { kind: 'mono', html: '320 € PAR AN · PLACÉS À 5 % · 20 ANS', y: 490, at: at('place', 1.0), color: 'cream' },
    { kind: 'odo', to: 10580, digits: 5, y: 560, size: 190, color: 'mint', at: 'res' },
    { kind: 'sprite', name: 'coinpile', cx: 540, by: 1150, size: 360, at: at('res', .4) },
  ], { foot: 'SIMULATION · RENDEMENT CONSTANT DE 5 % PAR AN, NON GARANTI' }) },
  { at: 'cta', fn: (a, b) => cta(a, b, { top: 'VIDE-DRESSING', sprites: [{ name: 'sneaker', cx: 560, by: 900, size: 520 }], head: 'L’OBJET LE PLUS <span class="a">IMPROBABLE</span><br>QUE VOUS AYEZ VENDU ?', headY: 960, headSize: 76, follow: 'follow' }) },
]));
