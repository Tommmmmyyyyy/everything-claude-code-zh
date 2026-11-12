import { boot } from '../../lib/engine.js';
import { seq, stack, chart, cta, at } from '../../lib/beats.js';

// cumulative savings after x years: 468 €/yr self-consumption (+3 %/yr price, −0.5 %/yr output) + 14 €/yr surplus
const save = x => { let s = 0; const n = Math.floor(x); for (let y = 0; y < n; y++) s += 468 * Math.pow(1.03 * .995, y) + 14; return s + (x - n) * (468 * Math.pow(1.03 * .995, n) + 14); };
let pb = 0; while (save(pb) < 7000) pb += .05;

boot(async () => seq([
  { fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'PANNEAUX SOLAIRES · 2026', y: 228, at: -1 },
    { kind: 'sprite', name: 'solarhouse', cx: 540, by: 760, size: 540, at: -1 },
    { kind: 'head', html: 'BONNE AFFAIRE<br>OU <span class="r">ARNAQUE</span> ?', y: 810, size: 108, at: -1 },
    { kind: 'chip', html: 'AVEC LES RÈGLES DE 2026', style: 'gold', y: 1060, size: 48, at: 'calc' },
  ], { sfxIn: false }) },
  { at: 'install', fn: (a, b) => stack(a, b, [
    { kind: 'odo', to: 7000, digits: 4, prefix: '≈&nbsp;', y: 280, size: 180, color: 'gold', at: 'install' },
    { kind: 'mono', html: '3 KWC POSÉS · ENVIRON 8 PANNEAUX', y: 490, at: at('install', .4), color: 'cream' },
    { kind: 'num', html: '3 600<span class="u">KWH/AN</span>', y: 600, size: 130, color: 'mint', at: 'prod' },
    { kind: 'mono', html: 'PRODUITS CHAQUE ANNÉE', y: 750, at: at('prod', .3) },
    { kind: 'chip', html: '+ AU SUD · − AU NORD', style: 'ghost', y: 830, size: 44, at: 'region' },
    { kind: 'sprite', name: 'solarhouse', cx: 540, by: 1170, size: 300, at: at('install', .7) },
  ], { lab: ['01', 'L’INSTALLATION'] }) },
  { at: 'auto', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'CE QUE VOUS CONSOMMEZ<br>EN <span class="g">JOURNÉE</span>', y: 270, size: 80, at: 'auto' },
    { kind: 'num', html: '0,20<span class="u">€/KWH</span>', y: 460, size: 130, color: 'cream', at: 'prix' },
    { kind: 'mono', html: 'QUE VOUS N’ACHETEZ PLUS', y: 610, at: at('prix', .3) },
    { kind: 'odo', to: 470, digits: 3, prefix: '≈&nbsp;', y: 700, size: 200, color: 'mint', at: 'eco' },
    { kind: 'mono', html: 'D’ÉCONOMIE PAR AN', y: 930, at: at('eco', .4), color: 'cream' },
  ], { lab: ['02', 'L’AUTOCONSOMMATION'], foot: 'HYPOTHÈSE : 65 % DE LA PRODUCTION CONSOMMÉE SUR PLACE · TARIF BLEU AOÛT 2026' }) },
  { at: 'twist', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'ET LE <span class="g">SURPLUS</span> ?', y: 290, size: 120, at: 'twist' },
    { kind: 'mono', html: 'RACHAT EDF OA · DEPUIS JUIN 2026', y: 470, at: 'rachat', color: 'cream' },
    { kind: 'num', html: '1,1<span class="u">CENTIME</span>', y: 540, size: 190, color: 'red', at: 'cent', anim: 'stamp', sfx: 'stamp' },
    { kind: 'mono', html: 'LE KWH', y: 760, at: at('cent', .3) },
  ], { lab: ['03', 'LE PIÈGE'] }) },
  { at: 'absurde', fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'VOUS VENDEZ', x: 40, w: 500, y: 300, at: 'absurde', color: 'cream' },
    { kind: 'num', html: '0,01<span class="u">€</span>', x: 40, w: 500, y: 350, size: 140, color: 'red', at: 'absurde' },
    { kind: 'mono', html: 'EN JOURNÉE', x: 40, w: 500, y: 510, at: 'absurde' },
    { kind: 'mono', html: 'VOUS RACHETEZ', x: 540, w: 500, y: 300, at: 'soir', color: 'cream' },
    { kind: 'num', html: '0,20<span class="u">€</span>', x: 540, w: 500, y: 350, size: 140, color: 'gold', at: 'soir' },
    { kind: 'mono', html: 'LE SOIR', x: 540, w: 500, y: 510, at: 'soir' },
    { kind: 'chip', html: 'LE SURPLUS : ≈ 14 € PAR AN', style: 'red', y: 640, size: 58, at: 'quatorze', anim: 'stamp', sfx: 'stamp' },
    { kind: 'sprite', name: 'solarhouse', cx: 540, by: 1150, size: 360, at: at('absurde', .3) },
  ], { foot: 'LE KWH, PRIX TTC ARRONDIS' }) },
  { at: 'payback', fn: (a, b) => chart(a, b, { lab: ['04', 'RENTABLE ?'], head: 'REMBOURSÉ EN <span class="a">13-15 ANS</span>', headAt: 'payback', x: [0, 30], y: [0, 24000],
    xticks: [0, 10, 20, 30], xfmt: v => v + ' ANS', yticks: [0, 7000, 14000, 21000], yfmt: v => v ? fmt_k(v) : '0',
    series: [
      { at: 'payback', color: 'gold', fn: () => 7000, dur: .9, width: 6 },
      { at: at('payback', .4), color: 'mint', fn: save, dur: 2.0, width: 10, fill: true },
    ],
    marks: [
      { at: at('payback', 2.3), x: pb, y: 7000, html: 'RENTABILISÉ', color: 'gold', style: 'gold', dx: -540, dy: -120 },
      { at: 'gain2', x: 30, y: save(30), html: '≈ 20 000 € ÉCONOMISÉS', color: 'mint', style: 'mint', dx: -820, dy: -110 },
    ],
    legend: [{ html: 'INSTALLATION : 7 000 €', color: 'gold' }, { html: 'ÉCONOMIES CUMULÉES', color: 'mint' }],
    foot: 'PRIX DE L’ÉLECTRICITÉ +3 %/AN · PANNEAUX −0,5 %/AN · SANS AIDES', }) },
  { at: 'regle', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'LA RÈGLE <span class="g">D’OR</span>', y: 270, size: 110, at: 'regle' },
    { kind: 'sprite', name: 'washer', cx: 540, by: 720, size: 400, at: 'machines' },
    { kind: 'mono', html: 'LAVE-LINGE · LAVE-VAISSELLE · CHAUFFE-EAU', y: 750, at: at('machines', .3), color: 'cream' },
    { kind: 'chip', html: 'EN PLEIN SOLEIL', style: 'gold', y: 810, size: 60, at: at('machines', 1.4), anim: 'stamp', sfx: 'stamp' },
    { kind: 'head', html: 'PLUS VOUS CONSOMMEZ À <span class="g">MIDI</span>,<br>PLUS C’EST RENTABLE', y: 960, size: 64, at: 'plus' },
  ]) },
  { at: 'arnaq', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'FUYEZ LES PANNEAUX<br><span class="r">« GRATUITS »</span>', y: 290, size: 100, at: 'arnaq' },
    { kind: 'row', icon: 'check', iconColor: 'mint', html: 'PLUSIEURS DEVIS', sub: 'INSTALLATEURS CERTIFIÉS RGE', y: 560, h: 180, size: 48, at: 'rge' },
    { kind: 'sprite', name: 'deed', cx: 540, by: 1130, size: 380, at: at('rge', .4) },
  ]) },
  { at: 'cta', fn: (a, b) => cta(a, b, { top: 'PANNEAUX SOLAIRES', sprites: [{ name: 'solarhouse', cx: 540, by: 900, size: 560 }], head: 'VOUS EN AVEZ<br>SUR VOTRE <span class="a">TOIT</span> ?', headY: 960, headSize: 96, follow: 'follow' }) },
]));
function fmt_k(v) { return (v / 1000) + ' k€'; }
