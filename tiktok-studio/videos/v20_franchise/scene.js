import { boot } from '../../lib/engine.js';
import { seq, stack, waterfall, hbars, cta, at } from '../../lib/beats.js';

const pawns = (at0, gone) => Array.from({ length: 10 }, (_, i) => ({ kind: 'sprite', name: i === 9 ? 'pawn_gold' : 'pawn_mint', cx: 160 + (i % 5) * 190, by: i < 5 ? 700 : 940, size: 190, at: at(at0, i * .06), ...(i === 9 && gone ? { until: gone } : {}) }));

boot(async () => seq([
  { fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'FRANCHISE DE BURGERS', y: 228, at: -1 },
    { kind: 'sprite', name: 'burger', cx: 540, by: 720, size: 500, at: -1 },
    { kind: 'num', html: '2 000 000<span class="u">€</span>', y: 750, size: 124, color: 'gold', at: -1 },
    { kind: 'mono', html: 'DE CHIFFRE D’AFFAIRES PAR AN', y: 890, at: -1, color: 'cream' },
    { kind: 'head', html: 'POURQUOI ILS GAGNENT<br><span class="r">SI PEU</span> ?', y: 960, size: 84, at: -1 },
  ], { sfxIn: false }) },
  { at: 'loop', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'PERDEZ <span class="r">1 CLIENT SUR 10</span>', y: 290, size: 84, at: 'loop' },
    ...pawns('loop', at('loop2', .6)),
    { kind: 'chip', html: '… ET TOUT BASCULE', style: 'red', y: 1060, size: 60, at: at('loop2', .6), anim: 'stamp', sfx: 'stamp' },
  ]) },
  { at: 'invest', fn: (a, b) => stack(a, b, [
    { kind: 'odo', to: 900000, digits: 6, y: 280, size: 160, color: 'gold', at: 'invest' },
    { kind: 'mono', html: 'D’INVESTISSEMENT · GRANDE ENSEIGNE', y: 470, at: at('invest', .4), color: 'cream' },
    { kind: 'num', html: '300 000<span class="u">€</span>', y: 570, size: 110, color: 'cream', at: 'apport' },
    { kind: 'mono', html: 'D’APPORT PERSONNEL', y: 700, at: 'apport' },
    { kind: 'sprite', name: 'office', cx: 540, by: 1160, size: 380, at: at('invest', .6) },
  ], { lab: ['01', 'L’ENTRÉE'] }) },
  { at: 'ca', fn: (a, b) => stack(a, b, [
    { kind: 'num', html: '550', x: 40, w: 500, y: 320, size: 160, color: 'gold', at: 'ca' },
    { kind: 'mono', html: 'CLIENTS / JOUR', x: 40, w: 500, y: 500, at: 'ca' },
    { kind: 'num', html: '10<span class="u">€</span>', x: 540, w: 500, y: 320, size: 160, color: 'cream', at: at('ca', 1.3) },
    { kind: 'mono', html: 'TICKET MOYEN', x: 540, w: 500, y: 500, at: at('ca', 1.3) },
    { kind: 'odo', to: 2000000, digits: 7, y: 620, size: 150, color: 'mint', at: 'ca2' },
    { kind: 'mono', html: 'DE CHIFFRE D’AFFAIRES PAR AN', y: 800, at: at('ca2', .4), color: 'cream' },
    { kind: 'sprite', name: 'burger', cx: 540, by: 1160, size: 300, at: at('ca2', .6) },
  ], { lab: ['02', 'LES VENTES'] }) },
  { at: 'mat', fn: (a, b) => waterfall(a, b, { lab: ['03', 'CE QU’IL RESTE'], title: ['CHIFFRE D’AFFAIRES', 'IL VOUS RESTE PAR AN'], digits: 7, odoSize: 128,
    barFmt: v => Math.round(v / 1000) + ' k€', foot: 'HYPOTHÈSES INDICATIVES · REDEVANCES 9 % + PUB 5 % · AVANT IMPÔTS',
    startBar: { value: 2000000, label: ['CHIFFRE', 'D’AFF.'] },
    steps: [{ at: 'mat', value: 600000, label: ['INGRÉ-', 'DIENTS'] }, { at: 'sal', value: 640000, label: ['SALAIRES', ''] }, { at: 'redev2', value: 280000, label: ['REDEV.', '14 %'] }, { at: 'loyer', value: 240000, label: ['LOYER', 'ÉNERGIE'] }, { at: 'credit', value: 102000, label: ['CRÉDIT', ''] }],
    final: { at: 'reste', value: 138000, label: ['IL', 'RESTE'] } }) },
  { at: 'ok', fn: (a, b) => hbars(a, b, { lab: ['04', 'QUI GAGNE LE PLUS'], head: 'ET LA <span class="r">MARQUE</span> ?', headAt: 'marque', max: 360, y0: 520, gapY: 220,
    rows: [
      { at: 'ok', n: 'VOUS', nSize: 46, value: 138, display: '140 000 €', vSize: 50, color: 'mint', per: 'PAR AN, AVANT IMPÔTS' },
      { at: at('marque', .5), n: 'MARQUE', nSize: 46, value: 280, display: '280 000 €', vSize: 50, color: 'red', per: 'SANS PRENDRE DE RISQUE' },
    ] }) },
  { at: 'twist', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'LE <span class="r">PIÈGE</span>', y: 280, size: 130, at: 'twist' },
    ...pawns('twist', at('moins', .4)).map(p => ({ ...p, by: p.by + 60 })),
    { kind: 'chip', html: '− 10 % DE CHIFFRE D’AFFAIRES', style: 'red', y: 1100, size: 52, at: 'moins2', anim: 'stamp', sfx: 'stamp' },
  ]) },
  { at: 'chute', fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'VOTRE BÉNÉFICE', y: 260, at: 'chute', color: 'cream' },
    { kind: 'num', html: '140 000<span class="u">€</span>', y: 310, size: 120, color: 'var(--muted)', at: 'chute' },
    { kind: 'head', html: '↓', y: 450, size: 120, at: at('chute', .6), color: 'var(--red)' },
    { kind: 'num', html: '26 000<span class="u">€</span>', y: 570, size: 190, color: 'red', at: at('chute', 1.6) },
    { kind: 'chip', html: '− 80 %', style: 'red', y: 800, size: 110, at: 'chute2', anim: 'stamp', sfx: 'stamp' },
    { kind: 'row', icon: 'rules', iconColor: 'cream', html: 'LOYER · SALAIRES · CRÉDIT', sub: 'EUX, NE BAISSENT PAS', y: 990, h: 170, size: 46, at: 'why' },
  ], { foot: 'SIMULATION SIMPLIFIÉE · AVANT IMPÔTS' }) },
  { at: 'cta', fn: (a, b) => cta(a, b, { top: 'FRANCHISE DE BURGERS', sprites: [{ name: 'burger', cx: 540, by: 900, size: 520 }], head: 'VOUS PRÉFÉREZ ÊTRE LA <span class="r">MARQUE</span><br>OU LE <span class="a">FRANCHISÉ</span> ?', headY: 960, headSize: 76, follow: 'follow' }) },
]));
