import { boot } from '../../lib/engine.js';
import { seq, stack, receipt, hbars, cta, at } from '../../lib/beats.js';

boot(async () => seq([
  { fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'GTA 6 + PS5', y: 228, at: -1 },
    { kind: 'sprite', name: 'console', cx: 380, by: 740, size: 480, at: -1 },
    { kind: 'sprite', name: 'controller', cx: 740, by: 760, size: 400, at: -1 },
    { kind: 'head', html: 'LE VRAI COÛT<br>SUR <span class="a">5 ANS</span>', y: 820, size: 116, at: -1 },
    { kind: 'chip', html: 'RÉPONSE SURPRENANTE… DANS LES DEUX SENS', style: 'gold', y: 1080, size: 38, at: 'spoil' },
  ], { sfxIn: false }) },
  { at: 'ps5', fn: (a, b) => receipt(a, b, { lab: ['01', 'LA FACTURE'], title: 'GTA 6 + PS5 · SUR 5 ANS', y: 300, dec: 2,
    rows: [
      { at: 'ps5b', label: 'PS5 STANDARD', sub: 'DEPUIS LA HAUSSE D’AVRIL 2026', value: 649.99, sign: '', color: '#10261F' },
      { at: 'jeu', label: 'GTA 6', value: 79.99, sign: '', color: '#10261F' },
      { at: 'plus5', label: 'PLAYSTATION PLUS', sub: '71,99 € × 5 ANS', value: 359.95, sign: '', color: '#10261F' },
      { at: 'ach5', label: 'ACHATS DANS LE JEU', sub: 'HYPOTHÈSE : 10 € PAR MOIS', value: 600, sign: '', color: '#D9443A' },
    ], total: { at: 'total', label: 'TOTAL', value: 1689.93, color: 'red' },
    notes: [
      { at: 'astuce', html: 'À L’ANNÉE : 72 € AU LIEU DE 120 €', style: 'gold', y: 960, size: 44, until: 'total' },
      { at: 'mois', html: '≈ 28 € PAR MOIS', style: 'red', y: 960, size: 64 },
    ] }) },
  { at: 'twist', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'LE PRIX D’UNE<br><span class="a">HEURE DE JEU</span>', y: 290, size: 104, at: 'heure' },
    { kind: 'mono', html: '1 HEURE PAR JOUR × 5 ANS', y: 520, at: 'h1', color: 'cream' },
    { kind: 'num', html: '1 825<span class="u">HEURES</span>', y: 570, size: 140, color: 'cream', at: 'h2' },
    { kind: 'num', html: '0,93<span class="u">€ / HEURE</span>', y: 770, size: 150, color: 'mint', at: 'h3', anim: 'stamp', sfx: 'stamp' },
  ]) },
  { at: 'cine', fn: (a, b) => hbars(a, b, { lab: ['02', 'COMPARONS'], head: 'ET LE <span class="g">CINÉMA</span> ?', max: 5.65, y0: 520, gapY: 230,
    rows: [
      { at: 'cine', n: 'CINÉMA', nSize: 50, value: 5.65, display: '5,65 € / H', color: 'red', per: '11,30 € POUR 2 H' },
      { at: 'cine2', n: 'PS5', nSize: 60, value: 0.93, display: '0,93 € / H', color: 'mint', per: '1 H / JOUR · 5 ANS' },
    ], notes: [{ at: 'x6', html: '6 FOIS PLUS CHER', style: 'red', y: 1000, size: 64 }, { kind: 'sprite', name: 'popcorn', at: at('cine', .4), cx: 900, by: 470, size: 200, sfx: 'pop', anim: 'pop' }],
    foot: 'PRIX MOYEN D’UNE PLACE ACHETÉE À L’UNITÉ · ENQUÊTE UFC-QUE CHOISIR 2026' }) },
  { at: 'sans', fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'SANS LES ACHATS DANS LE JEU', y: 280, at: 'sans', color: 'cream' },
    { kind: 'num', html: '≈ 1 090<span class="u">€</span>', y: 330, size: 160, color: 'cream', at: 'sans2' },
    { kind: 'num', html: '< 0,60<span class="u">€ / HEURE</span>', y: 540, size: 150, color: 'mint', at: 'sans3', anim: 'stamp', sfx: 'stamp' },
    { kind: 'sprite', name: 'controller', cx: 540, by: 1110, size: 460, at: at('sans', .3) },
  ]) },
  { at: 'lecon', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'CE N’EST PAS LA CONSOLE<br>QUI <span class="a">COÛTE CHER</span>', y: 300, size: 84, at: 'lecon' },
    { kind: 'chip', html: 'CE SONT LES PETITES DÉPENSES RÉPÉTÉES', style: 'red', y: 520, size: 42, at: 'lecon2', anim: 'stamp', sfx: 'stamp' },
    { kind: 'sprite', name: 'coinpile', cx: 540, by: 1120, size: 440, at: at('lecon2', .3) },
  ]) },
  { at: 'cta', fn: (a, b) => cta(a, b, { top: 'GTA 6 + PS5', sprites: [{ name: 'console', cx: 400, by: 900, size: 460 }, { name: 'controller', cx: 740, by: 900, size: 380 }], head: 'VOUS JOUEZ COMBIEN<br>D’<span class="a">HEURES</span> PAR SEMAINE ?', headY: 960, headSize: 84, follow: 'follow' }) },
]));
