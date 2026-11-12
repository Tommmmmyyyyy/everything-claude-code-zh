const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const { serve } = require('../lib/server.js');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'assets', 'sprites'); fs.mkdirSync(OUT, { recursive: true });
const LIST = [
  ['cup', 'cup', { az: 18, elev: 16 }],
  ['coin', 'coin', { rotY: -0.5, elev: 8, shadow: false }],
  ['coin_flat', 'coin', { elev: 62, rotY: 0.0 }],
  ['coinstack', 'coinstack', { n: 8, elev: 22 }],
  ['coinstack_s', 'coinstack', { n: 3, elev: 22 }],
  ['coinpile', 'coinpile', { elev: 26, az: 10 }],
  ['bills', 'bills', { elev: 20, az: 22 }],
  ['billsbig', 'billsbig', { elev: 22, az: 15 }],
  ['pawn_mint', 'pawn', { color: 'mint', elev: 14 }],
  ['pawn_gold', 'pawn', { color: 'gold', elev: 14 }],
  ['hourglass', 'hourglass', { elev: 14, az: 20 }],
  ['snowball', 'snowball', { elev: 14 }],
  ['card', 'card', { elev: 40, az: -18 }],
  ['house', 'house', { elev: 18, az: 28 }],
  ['vending', 'vending', { elev: 12, az: -22 }],
  ['can', 'can', { elev: 14, az: 0 }],
  ['ball_cream', 'ball', { color: 'cream', elev: 6 }],
  ['ball_gold', 'ball', { color: 'gold', elev: 6 }],
  ['ball_mint', 'ball', { color: 'mint', elev: 6 }],
  ['ball_coral', 'ball', { color: 'coral', elev: 6 }],
  ['office', 'office', { elev: 16, az: 30 }],
  ['horse', 'horse', { elev: 8, az: 20 }],
  ['hay', 'hay', { elev: 14, az: 35 }],
  ['fence', 'fence', { elev: 12, az: 15 }],
  ['car', 'car', { elev: 18, az: 35 }],
  ['foodtruck', 'foodtruck', { elev: 14, az: 30 }],
  ['laptop', 'laptop', { elev: 28, az: -15 }],
  ['goldbars', 'goldbars', { elev: 24, az: 20 }],
];
(async () => {
  const { srv, url } = await serve(ROOT);
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage(); p.on('console', m => console.log('page:', m.text())); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto(url + '/sprites/sprites.html'); await p.waitForFunction(() => window.ready === true, null, { timeout: 60000 });
  const only = process.argv.slice(2);
  for (const [file, name, opts] of LIST) {
    if (only.length && !only.includes(file)) continue;
    const t0 = Date.now();
    const data = await p.evaluate(([n, o]) => window.renderSprite(n, o), [name, opts]);
    fs.writeFileSync(path.join(OUT, file + '.png'), Buffer.from(data.split(',')[1], 'base64'));
    console.log(file, Date.now() - t0, 'ms');
  }
  await b.close(); srv.close();
})();
