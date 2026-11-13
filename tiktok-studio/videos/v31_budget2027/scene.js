import { boot } from '../../lib/engine.js';
import { seq, stack, cta, at } from '../../lib/beats.js';

boot(async () => seq([
  { fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'BUDGET 2027 · ASSEMBLÉE NATIONALE', y: 228, at: -1 },
    { kind: 'num', html: '458', x: 40, w: 500, y: 290, size: 230, color: 'red', at: -1, pulse: 'hook' },
    { kind: 'mono', html: 'DÉPUTÉS CONTRE', x: 40, w: 500, y: 540, at: -1, color: 'cream' },
    { kind: 'num', html: '0', x: 540, w: 500, y: 290, size: 230, color: 'cream', at: -1, pulse: 'zero' },
    { kind: 'mono', html: 'POUR', x: 540, w: 500, y: 540, at: -1, color: 'cream' },
    { kind: 'chip', html: 'BUDGET REJETÉ', style: 'red', y: 640, size: 80, at: -1, anim: 'stamp' },
    { kind: 'sprite', name: 'bank', cx: 540, by: 1170, size: 380, at: -1 },
  ], { sfxIn: false }) },
  { at: 'loop', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'ET VOS<br><span class="g">IMPÔTS</span> ?', y: 300, size: 130, at: 'loop' },
    { kind: 'sprite', name: 'deed', cx: 540, by: 1080, size: 520, at: at('loop', .4) },
  ]) },
  { at: 'contenu', fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'CE QUE PRÉVOYAIT LE BUDGET', y: 280, at: 'contenu', color: 'cream' },
    { kind: 'num', html: '+ 2,1<span class="u">%</span>', y: 340, size: 200, color: 'mint', at: 'bareme' },
    { kind: 'mono', html: 'POUR LES TRANCHES DE L’IMPÔT', y: 570, at: at('bareme', .4), color: 'cream' },
    { kind: 'mono', html: 'COMME L’INFLATION', y: 610, at: at('bareme', .8) },
    { kind: 'sprite', name: 'coinstack', cx: 540, by: 1120, size: 320, at: at('bareme', .6) },
  ], { lab: ['01', 'LE PROJET'] }) },
  { at: 'pourquoi', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'POURQUOI C’EST <span class="g">IMPORTANT</span>', y: 280, size: 80, at: 'pourquoi' },
    { kind: 'row', icon: 'up', iconColor: 'mint', html: 'VOTRE SALAIRE', sub: 'SUIT L’INFLATION', right: '+ 2,1 %', rColor: 'mint', rSize: 64, y: 440, h: 170, size: 50, at: 'ex' },
    { kind: 'row', icon: 'minus', iconColor: 'red', html: 'LES TRANCHES', sub: 'NE BOUGENT PAS', right: '+ 0 %', rColor: 'red', rSize: 64, y: 630, h: 170, size: 50, at: at('ex', 1.2) },
    { kind: 'chip', html: 'PLUS D’IMPÔT… SANS ÊTRE PLUS RICHE', style: 'red', y: 870, size: 44, at: 'ex2', anim: 'stamp', sfx: 'stamp' },
  ]) },
  { at: 'chiffre', fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'SANS CETTE MISE À JOUR', y: 280, at: 'chiffre', color: 'cream' },
    { kind: 'num', html: '≈ 4<span class="u">MILLIARDS €</span>', y: 330, size: 170, color: 'red', at: 'quatre' },
    { kind: 'mono', html: 'D’IMPÔTS EN PLUS', y: 540, at: at('quatre', .4) },
    { kind: 'num', html: '20<span class="u">MILLIONS</span>', y: 640, size: 140, color: 'cream', at: 'vingt' },
    { kind: 'mono', html: 'DE FOYERS CONCERNÉS', y: 800, at: at('vingt', .3) },
  ], { foot: 'ESTIMATION DU GOUVERNEMENT · PROJET DE LOI DE FINANCES 2027' }) },
  { at: 'autres', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'CE QUI ÉTAIT <span class="a">PRÉVU</span> AUSSI', y: 280, size: 80, at: 'autres' },
    { kind: 'row', icon: 'minus', iconColor: 'gold', html: 'GEL DE PRESTATIONS', sub: 'CERTAINES ALLOCATIONS ET RETRAITES', y: 440, h: 170, size: 50, at: at('autres', .5) },
    { kind: 'row', icon: 'heart', iconColor: 'mint', html: 'DONS AUX PROCHES', sub: 'SANS IMPÔT', right: '50 000 €', rColor: 'mint', rSize: 56, y: 630, h: 170, size: 50, at: 'dons' },
    { kind: 'sprite', name: 'gift', cx: 540, by: 1160, size: 300, at: at('dons', .4) },
  ]) },
  { at: 'suite', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'ET <span class="g">MAINTENANT</span> ?', y: 280, size: 110, at: 'suite' },
    { kind: 'row', icon: 'cross', iconColor: 'red', html: '4 NOVEMBRE', sub: 'REJET À L’ASSEMBLÉE', y: 450, h: 160, size: 50, at: at('suite', .4) },
    { kind: 'row', icon: 'cal', iconColor: 'cream', html: '9 DÉCEMBRE', sub: 'VOTE PRÉVU AU SÉNAT', y: 630, h: 160, size: 50, at: 'senat' },
    { kind: 'row', icon: 'rules', iconColor: 'gold', html: 'ORDONNANCE ?', sub: 'SI RIEN N’EST ADOPTÉ À TEMPS', y: 810, h: 160, size: 50, at: 'ordo' },
    { kind: 'chip', html: 'UNE PREMIÈRE SOUS LA Vᵉ RÉPUBLIQUE', style: 'gold', y: 1020, size: 42, at: 'jamais', anim: 'stamp', sfx: 'stamp' },
  ], { lab: ['02', 'LA SUITE'] }) },
  { at: 'speciale', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'OU UNE<br><span class="g">LOI SPÉCIALE</span>', y: 280, size: 110, at: 'speciale' },
    { kind: 'row', icon: 'check', iconColor: 'mint', html: 'LES IMPÔTS SONT PERÇUS', y: 540, h: 160, size: 46, at: 'speciale2' },
    { kind: 'row', icon: 'cross', iconColor: 'red', html: 'TRANCHES PAS À JOUR', sub: 'PAS TOUT DE SUITE', y: 720, h: 160, size: 46, at: 'speciale3' },
    { kind: 'chip', html: 'FIN 2024 : RATTRAPÉES 2 MOIS PLUS TARD', style: 'ghost', y: 930, size: 40, at: 'rattrap' },
  ]) },
  { at: 'vous', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'POUR <span class="a">VOUS</span>', y: 280, size: 130, at: 'vous' },
    { kind: 'row', icon: 'check', iconColor: 'mint', html: 'FICHE DE PAIE', sub: 'PAS DE CHANGEMENT IMMÉDIAT EN JANVIER', y: 480, h: 170, size: 50, at: 'v1' },
    { kind: 'row', icon: 'cal', iconColor: 'gold', html: 'LA DÉCLARATION', sub: 'AU PRINTEMPS : TOUT SE JOUERA LÀ', y: 670, h: 170, size: 50, at: 'v2' },
    { kind: 'sprite', name: 'deed', cx: 540, by: 1160, size: 300, at: at('v2', .4) },
  ]) },
  { at: 'cta', fn: (a, b) => cta(a, b, { top: 'BUDGET 2027', sprites: [{ name: 'bank', cx: 540, by: 900, size: 520 }], head: 'LE BUDGET SERA-T-IL<br>VOTÉ <span class="a">À TEMPS</span> ?', headY: 960, headSize: 92, follow: 'follow' }) },
]));
