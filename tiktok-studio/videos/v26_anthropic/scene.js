import { boot } from '../../lib/engine.js';
import { seq, stack, hbars, cta, at } from '../../lib/beats.js';

boot(async () => seq([
  { fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'INTRODUCTION EN BOURSE', y: 228, at: -1 },
    { kind: 'sprite', name: 'chip', cx: 540, by: 690, size: 470, at: -1 },
    { kind: 'mono', html: 'UNE ENTREPRISE CRÉÉE EN 2021', y: 720, at: -1, color: 'cream' },
    { kind: 'num', html: '≈ 1 400<span class="u">MILLIARDS $</span>', y: 770, size: 120, color: 'gold', at: -1 },
    { kind: 'head', html: 'POUR UNE ENTREPRISE<br>DE <span class="a">5 ANS</span> ?', y: 940, size: 92, at: -1 },
  ], { sfxIn: false }) },
  { at: 'loop', fn: (a, b) => hbars(a, b, { lab: ['01', 'À QUOI ÇA CORRESPOND'], head: 'LA MOITIÉ DU <span class="a">CAC 40</span>', max: 3400, y0: 520, gapY: 230,
    rows: [
      { at: 'loop', n: 'CAC 40', nSize: 52, value: 2770, display: '≈ 2 770 MD $', vSize: 42, color: 'cream', per: 'LES 40 RÉUNIES' },
      { at: at('loop', 1.2), n: 'ANTHROPIC', nSize: 36, value: 1400, display: '≈ 1 400 MD $', vSize: 42, color: 'mint', per: 'VALORISATION VISÉE' },
    ], notes: [{ at: 'loop2', html: 'ET POURTANT, DÉFICITAIRE', style: 'red', y: 1010, size: 52 }],
    foot: 'CAC 40 ≈ 2 470 MD € AU 5 NOVEMBRE 2026 · 1 € ≈ 1,12 $' }) },
  { at: 'qui', fn: (a, b) => stack(a, b, [
    { kind: 'sprite', name: 'chip', cx: 540, by: 650, size: 430, at: 'qui' },
    { kind: 'head', html: 'ANTHROPIC', y: 690, size: 130, at: 'qui' },
    { kind: 'mono', html: 'CRÉATEUR DE L’IA CLAUDE · CONCURRENT DE CHATGPT', y: 830, at: 'rival', color: 'cream' },
    { kind: 'chip', html: '≈ 19 NOVEMBRE · NASDAQ · « ANT »', style: 'gold', y: 920, size: 48, at: 'quand', pulse: 'ticker' },
  ]) },
  { at: 'prix', fn: (a, b) => stack(a, b, [
    { kind: 'num', html: '70 – 78<span class="u">$</span>', y: 290, size: 170, color: 'cream', at: 'prix' },
    { kind: 'mono', html: 'PAR ACTION · FOURCHETTE ANNONCÉE', y: 500, at: at('prix', .4) },
    { kind: 'num', html: 'JUSQU’À 64<span class="u">MD $</span>', y: 590, size: 110, color: 'mint', at: 'leve' },
    { kind: 'mono', html: 'LEVÉS EN BOURSE', y: 730, at: at('leve', .3) },
    { kind: 'chip', html: '2ᵉ PLUS GROSSE INTRODUCTION DE L’HISTOIRE', style: 'gold', y: 820, size: 42, at: 'record', anim: 'stamp', sfx: 'stamp' },
    { kind: 'sprite', name: 'rocket', cx: 540, by: 1170, size: 300, at: at('record', .4) },
  ], { lab: ['02', 'LE PRIX'], foot: 'PRIX DÉFINITIF FIXÉ LA VEILLE DE LA COTATION' }) },
  { at: 'lvmh', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: '≈ 6 FOIS <span class="g">LVMH</span>', y: 290, size: 120, at: 'lvmh' },
    ...[0, 1, 2, 3, 4, 5].map(i => ({ kind: 'sprite', name: 'office', cx: 220 + (i % 3) * 320, by: i < 3 ? 720 : 1060, size: 280, at: at('lvmh', .3 + i * .12), sfx: i === 0 ? 'pop' : false })),
  ], { foot: 'LVMH ≈ 200 MD € EN BOURSE (13 NOVEMBRE 2026)' }) },
  { at: 'ca', fn: (a, b) => hbars(a, b, { lab: ['03', 'LE CHIFFRE D’AFFAIRES'], head: 'IL <span class="a">EXPLOSE</span>', max: 20, y0: 520, gapY: 230,
    rows: [
      { at: 'ca1', n: 'S1 2025', nSize: 56, value: 1.16, display: '1,2 MD $', color: 'cream', per: 'PREMIER SEMESTRE' },
      { at: 'ca2', n: 'S1 2026', nSize: 56, value: 16.3, display: '16,3 MD $', color: 'mint', per: 'PREMIER SEMESTRE' },
    ], notes: [{ at: 'x14', html: '× 14 EN UN AN', style: 'gold', y: 1000, size: 72 }],
    foot: 'SOURCE : DOCUMENT D’INTRODUCTION EN BOURSE (S-1)' }) },
  { at: 'perte', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'MAIS <span class="r">DÉFICITAIRE</span>', y: 290, size: 120, at: 'perte' },
    { kind: 'sprite', name: 'chip', cx: 540, by: 820, size: 460, at: 'perte2' },
    { kind: 'mono', html: 'PUCES · CENTRES DE DONNÉES · ÉNERGIE', y: 860, at: at('perte2', .3), color: 'cream' },
  ]) },
  { at: 'twist', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'FAUT-IL<br><span class="g">ACHETER</span> ?', y: 280, size: 120, at: 'twist' },
    { kind: 'chip', html: 'LE PIÈGE : LE PREMIER JOUR', style: 'red', y: 530, size: 50, at: 'piege', anim: 'stamp', sfx: 'stamp' },
    { kind: 'row', icon: 'rules', iconColor: 'gold', html: 'PRIX D’INTRODUCTION', sub: 'SURTOUT POUR LES GRANDS INVESTISSEURS', y: 650, h: 170, size: 46, at: 'piege2' },
    { kind: 'row', icon: 'up', iconColor: 'red', html: 'LES PARTICULIERS', sub: 'ACHÈTENT APRÈS, SOUVENT PLUS CHER', y: 840, h: 170, size: 46, at: 'piege3' },
  ]) },
  { at: 'spacex', fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'L’EXEMPLE SPACEX', y: 270, at: 'spacex', color: 'cream' },
    { kind: 'sprite', name: 'rocket', cx: 540, by: 660, size: 400, at: 'spacex' },
    { kind: 'num', html: '+ 19<span class="u">%</span>', x: 40, w: 500, y: 700, size: 140, color: 'mint', at: at('spacex', .5) },
    { kind: 'mono', html: 'LE PREMIER JOUR', x: 40, w: 500, y: 860, at: at('spacex', .5) },
    { kind: 'num', html: '< 135<span class="u">$</span>', x: 540, w: 500, y: 700, size: 140, color: 'red', at: 'spacex2' },
    { kind: 'mono', html: 'UN MOIS PLUS TARD', x: 540, w: 500, y: 860, at: 'spacex2' },
  ]) },
  { at: 'lecon', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'ENTREPRISE GÉNIALE<br>≠ <span class="g">ACTION PAS CHÈRE</span>', y: 330, size: 92, at: 'lecon' },
    { kind: 'chip', html: 'CECI N’EST PAS UN CONSEIL D’INVESTISSEMENT', style: 'ghost', y: 600, size: 40, at: 'disc' },
  ]) },
  { at: 'cta', fn: (a, b) => cta(a, b, { top: 'ANTHROPIC · NASDAQ', sprites: [{ name: 'chip', cx: 540, by: 900, size: 520 }], head: 'VOUS ACHÈTERIEZ<br>UNE ACTION <span class="a">ANTHROPIC</span> ?', headY: 960, headSize: 80, follow: 'follow' }) },
]));
