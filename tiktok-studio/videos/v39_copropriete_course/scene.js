import { boot } from '../../lib/engine.js';
import { seq, stack, hbars, cta, at } from '../../lib/beats.js';

boot(async () => seq([
  { fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'CHEVAL DE COURSE', y: 228, at: -1 },
    { kind: 'sprite', name: 'racehorse', cx: 540, by: 720, size: 520, at: -1 },
    { kind: 'head', html: 'PROPRIÉTAIRE<br>POUR <span class="a">QUELQUES €</span> ?', y: 770, size: 104, at: -1 },
    { kind: 'chip', html: 'PAS BESOIN D’ÊTRE MILLIARDAIRE', style: 'gold', y: 1010, size: 46, at: 'part' },
  ], { sfxIn: false }) },
  { at: 'loop', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'COMBIEN ÇA <span class="r">COÛTE</span>,<br>COMBIEN ÇA <span class="a">RAPPORTE</span>', y: 310, size: 90, at: 'loop2' },
    { kind: 'sprite', name: 'trophy', cx: 540, by: 1100, size: 420, at: at('loop', .3) },
  ]) },
  { at: 'cout', fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'UN CHEVAL À L’ENTRAÎNEMENT', y: 280, at: 'cout', color: 'cream' },
    { kind: 'num', html: '≈ 1 640<span class="u">€/MOIS</span>', y: 330, size: 130, color: 'red', at: 'cout' },
    { kind: 'num', html: '≈ 20 000<span class="u">€/AN</span>', y: 520, size: 110, color: 'cream', at: 'an' },
    { kind: 'mono', html: 'SANS LE VÉTÉRINAIRE NI LES DÉPLACEMENTS', y: 660, at: at('an', .6) },
    { kind: 'sprite', name: 'racehorse', cx: 540, by: 1150, size: 380, at: at('cout', .5) },
  ], { lab: ['01', 'LE COÛT'], foot: 'MOYENNE NATIONALE DES PENSIONS D’ENTRAÎNEMENT · FRANCE GALOP' }) },
  { at: 'groupe', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'L’ÉCURIE<br>DE <span class="a">GROUPE</span>', y: 280, size: 116, at: 'groupe' },
    ...[0, 1, 2, 3, 4].map(i => ({ kind: 'sprite', name: i % 2 ? 'pawn_gold' : 'pawn_mint', cx: 220 + i * 160, by: 720, size: 170, at: at('parts', i * .1), sfx: i ? false : 'pop' })),
    { kind: 'num', html: '5<span class="u">% D’UN CHEVAL</span>', y: 760, size: 110, color: 'gold', at: 'cinq' },
    { kind: 'chip', html: '≈ 4 À 5 € PAR JOUR', style: 'mint', y: 900, size: 64, at: 'jour', anim: 'stamp', sfx: 'stamp' },
    { kind: 'mono', html: '+ VOTRE PART DU PRIX D’ACHAT', y: 1020, at: 'achat', color: 'cream' },
  ], { lab: ['02', 'LA SOLUTION'] }) },
  { at: 'gains', fn: (a, b) => hbars(a, b, { lab: ['03', 'ET LES GAINS ?'], head: 'SUR <span class="g">100 €</span> DÉPENSÉS', headAt: 'cent', max: 100, y0: 520, gapY: 230,
    rows: [
      { at: 'cent', n: 'FRAIS', nSize: 56, value: 100, display: '100 €', color: 'red', per: 'PENSION, VÉTO, TRANSPORT' },
      { at: at('cent', .8), n: 'GAINS', nSize: 56, value: 55, display: '≈ 55 €', color: 'mint', per: 'EN MOYENNE' },
    ], notes: [{ at: 'twist', html: 'EN MOYENNE, ON PERD', style: 'red', y: 1000, size: 60 }, { at: 'jackpot', kind: 'mono', html: 'CERTAINS CHEVAUX RAPPORTENT DES CENTAINES DE MILLIERS D’EUROS… L’EXCEPTION', y: 1110, size: 20 }],
    foot: 'TAUX DE COUVERTURE MOYEN DES FRAIS PAR LES GAINS · FRANCE GALOP' }) },
  { at: 'vivre', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'CE QUE VOUS ACHETEZ<br><span class="a">VRAIMENT</span>', y: 280, size: 96, at: 'vivre' },
    { kind: 'row', icon: 'check', iconColor: 'mint', html: 'LE ROND DE PRÉSENTATION', y: 490, h: 150, size: 44, at: 'v1' },
    { kind: 'row', icon: 'check', iconColor: 'mint', html: 'LES ÉCHANGES AVEC L’ENTRAÎNEUR', y: 655, h: 150, size: 44, at: 'v2' },
    { kind: 'row', icon: 'heart', iconColor: 'gold', html: 'VOS COULEURS EN TÊTE', y: 820, h: 150, size: 44, at: 'v3' },
    { kind: 'chip', html: 'VÉRIFIEZ QUI GÈRE + TOUS LES FRAIS', style: 'ghost', y: 1020, size: 40, at: 'verif' },
  ]) },
  { at: 'lecon', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'UN <span class="a">LOISIR</span>,<br>PAS UN <span class="r">PLACEMENT</span>', y: 300, size: 110, at: 'lecon' },
    { kind: 'mono', html: 'À BUDGÉTER COMME UN ABONNEMENT', y: 560, at: 'lecon2', color: 'cream' },
    { kind: 'sprite', name: 'racehorse', cx: 540, by: 1130, size: 440, at: at('lecon', .4) },
  ]) },
  { at: 'cta', fn: (a, b) => cta(a, b, { top: 'CHEVAL DE COURSE', sprites: [{ name: 'racehorse', cx: 540, by: 900, size: 540 }], head: 'VOUS METTRIEZ COMBIEN<br>DANS UN <span class="a">CHEVAL DE COURSE</span> ?', headY: 960, headSize: 78, follow: 'follow' }) },
]));
