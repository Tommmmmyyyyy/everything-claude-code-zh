import { boot, cue } from '../../lib/engine.js';
import { seq, stack, chart, cta, at, path } from '../../lib/beats.js';

// stylised path of the SPCX share price since the IPO (days after 12 June 2026, $); key points are real, the rest is smoothed
const spcx = path([[0, 135], [1, 161], [4, 225], [12, 196], [26, 172], [45, 131], [62, 112], [80, 105], [100, 118], [120, 129], [140, 136], [150, 142], [153, 140]]);

boot(async () => seq([
  { fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: '12 JUIN 2026 · NASDAQ', y: 228, at: -1 },
    { kind: 'sprite', name: 'rocket', cx: 540, by: 700, size: 500, at: -1 },
    { kind: 'num', html: '75<span class="u">MILLIARDS $</span>', y: 720, size: 150, color: 'gold', at: -1 },
    { kind: 'mono', html: 'LEVÉS · RECORD HISTORIQUE', y: 900, at: -1, color: 'cream' },
    { kind: 'head', html: 'ACHETER LE<br><span class="a">PREMIER JOUR</span> ?', y: 970, size: 96, at: -1 },
  ], { sfxIn: false }) },
  { at: 'loop', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'ILS ONT GAGNÉ<br>DE L’<span class="a">ARGENT</span> ?', y: 300, size: 110, at: 'loop' },
    { kind: 'chip', html: 'PAS SI SIMPLE', style: 'gold', y: 590, size: 70, at: 'loop2', anim: 'stamp', sfx: 'stamp' },
    { kind: 'sprite', name: 'coinpile', cx: 540, by: 1120, size: 420, at: at('loop', .5) },
  ]) },
  { at: 'intro', fn: (a, b) => chart(a, b, { lab: ['01', 'L’ACTION SPACEX'], x: [0, 155], y: [80, 240],
    xticks: [0, 30, 61, 92, 122, 153], xfmt: v => ['JUIN', 'JUIL.', 'AOÛT', 'SEPT.', 'OCT.', 'NOV.'][[0, 30, 61, 92, 122, 153].indexOf(v)], yticks: [100, 135, 180, 225], yfmt: v => v + ' $',
    series: [
      { at: 'intro', color: 'gold', fn: () => 135, dur: .8, width: 5 },
      { at: 'j1', color: 'mint', fn: spcx, dur: Math.max(4, cue('now') - cue('j1') + .5), width: 10 },
    ],
    marks: [
      { at: 'intro', x: 0, y: 135, html: 'INTRO : 135 $', color: 'gold', style: 'gold', dx: -400, dy: 40 },
      { at: 'pct', x: 1, y: 161, html: '+ 19 % LE 1ᵉʳ JOUR', color: 'mint', style: 'mint', dx: -380, dy: -110 },
      { at: 'peak', x: 4, y: 225, html: 'SOMMET : 225 $', color: 'cream', style: 'dark', dx: -300, dy: -40 },
      { at: 'low', x: 80, y: 105, html: 'PLUS BAS : 105 $', color: 'red', style: 'red', dx: -540, dy: 40 },
      { at: 'now', x: 153, y: 140, html: 'AUJOURD’HUI ≈ 140 $', color: 'mint', style: 'mint', dx: -760, dy: -110 },
    ],
    legend: [{ html: 'COURS DE L’ACTION', color: 'mint' }, { html: 'PRIX D’INTRODUCTION', color: 'gold' }],
    foot: 'TRACÉ SIMPLIFIÉ ENTRE LES POINTS CLÉS · COURS EN DOLLARS' }) },
  { at: 'calc', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'FAISONS LES <span class="g">COMPTES</span>', y: 280, size: 100, at: 'calc' },
    { kind: 'row', icon: 'check', iconColor: 'mint', html: 'AU PRIX D’INTRO', sub: '135 $', right: '+ 4 %', rColor: 'mint', rSize: 64, y: 450, h: 170, size: 48, at: 'c1' },
    { kind: 'row', icon: 'cross', iconColor: 'red', html: 'LE PREMIER SOIR', sub: '161 $', right: '− 13 %', rColor: 'red', rSize: 64, y: 640, h: 170, size: 48, at: 'c2' },
    { kind: 'row', icon: 'cross', iconColor: 'red', html: 'AU SOMMET', sub: '225 $', right: '− 38 %', rColor: 'red', rSize: 64, y: 830, h: 170, size: 48, at: 'c3' },
  ], { foot: 'PERFORMANCE AU COURS DE ≈ 140 $, HORS FRAIS' }) },
  { at: 'piege', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'LE <span class="r">PROBLÈME</span>', y: 290, size: 120, at: 'piege' },
    { kind: 'row', icon: 'cross', iconColor: 'red', html: 'PRIX D’INTRODUCTION', sub: 'RAREMENT POUR LES PARTICULIERS', y: 480, h: 180, size: 48, at: at('piege', .6) },
    { kind: 'row', icon: 'up', iconColor: 'red', html: 'ILS ACHÈTENT APRÈS', sub: 'PLUS CHER', y: 690, h: 180, size: 48, at: 'piege2' },
  ]) },
  { at: 'fb', fn: (a, b) => stack(a, b, [
    { kind: 'mono', html: 'FACEBOOK · 2012', y: 270, at: 'fb', color: 'cream' },
    { kind: 'num', html: '38<span class="u">$</span>', x: 40, w: 440, y: 330, size: 140, color: 'cream', at: 'fb2' },
    { kind: 'mono', html: 'PRIX D’INTRO', x: 40, w: 440, y: 485, at: 'fb2' },
    { kind: 'head', html: '→', x: 390, w: 180, y: 350, size: 90, at: 'fb3', color: 'var(--muted)' },
    { kind: 'num', html: '17,55<span class="u">$</span>', x: 580, w: 460, y: 330, size: 140, color: 'red', at: 'fb3' },
    { kind: 'mono', html: '4 MOIS PLUS TARD', x: 580, w: 460, y: 485, at: 'fb3' },
    { kind: 'chip', html: '− 54 %', style: 'red', y: 560, size: 64, at: at('fb3', 1.2), anim: 'stamp', sfx: 'stamp' },
    { kind: 'mono', html: 'ET CEUX QUI ONT GARDÉ ?', y: 720, at: 'fb4', color: 'cream' },
    { kind: 'num', html: '+ DE 600<span class="u">$</span>', y: 770, size: 150, color: 'mint', at: 'fb5' },
    { kind: 'chip', html: '× 15', style: 'gold', y: 960, size: 90, at: 'x15', anim: 'stamp', sfx: 'stamp' },
  ], { foot: 'FACEBOOK EST DEVENU META · LES PERFORMANCES PASSÉES NE PRÉJUGENT PAS DE L’AVENIR' }) },
  { at: 'lecon', fn: (a, b) => stack(a, b, [
    { kind: 'head', html: 'LE PREMIER JOUR,<br>ON PAIE <span class="r">L’EMBALLEMENT</span>', y: 300, size: 92, at: 'lecon' },
    { kind: 'chip', html: 'L’ENTREPRISE + LE TEMPS', style: 'mint', y: 560, size: 60, at: 'lecon2', anim: 'stamp', sfx: 'stamp' },
    { kind: 'sprite', name: 'hourglass', cx: 540, by: 1120, size: 440, at: at('lecon2', .3) },
  ]) },
  { at: 'cta', fn: (a, b) => cta(a, b, { top: 'SPACEX · NASDAQ', sprites: [{ name: 'rocket', cx: 540, by: 900, size: 540 }], head: 'VOUS AURIEZ ACHETÉ<br>LE <span class="a">PREMIER JOUR</span> ?', headY: 960, headSize: 90, follow: 'follow' }) },
]));
