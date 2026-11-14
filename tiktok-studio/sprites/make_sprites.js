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
  ['bank', 'bank', { elev: 14, az: 22 }],
  ['apartment', 'apartment', { elev: 16, az: 28 }],
  ['deed', 'deed', { elev: 48, az: -10 }],
  ['sofa', 'sofa', { elev: 16, az: 24 }],
  ['tshirt', 'tshirt', { elev: 8, az: 12 }],
  ['sneaker', 'sneaker', { elev: 24, az: 40 }],
  ['parcel', 'parcel', { elev: 20, az: 26 }],
  ['lamp', 'lamp', { elev: 10, az: 18 }],
  ['phone', 'phone', { elev: 10, az: -16 }],
  ['washer', 'washer', { elev: 12, az: 20 }],
  ['burger', 'burger', { elev: 18, az: 0 }],
  ['bottle', 'bottle', { elev: 10, az: 0 }],
  ['blocks', 'blocks', { elev: 14, az: 10 }],
  ['solarhouse', 'solarhouse', { elev: 20, az: 34 }],
  ['mattress', 'mattress', { elev: 30, az: 24 }],
  ['passbook', 'passbook', { elev: 50, az: -12 }],
  ['globe', 'globe', { elev: 10, az: 60 }],
  ['rocket', 'rocket', { elev: 10, az: 15 }],
  ['controller', 'controller', { elev: 22, az: 0 }],
  ['console', 'console', { elev: 10, az: 32 }],
  ['gamebox', 'gamebox', { elev: 10, az: 20 }],
  ['btc', 'btc', { elev: 6, rotY: -0.45, shadow: false }],
  ['pricetag', 'pricetag', { elev: 12, az: 10, shadow: false }],
  ['shopbag', 'shopbag', { elev: 14, az: 28 }],
  ['popcorn', 'popcorn', { elev: 16, az: 10 }],
  ['chip', 'chip', { elev: 40, az: 25 }],
  ['trophy', 'trophy', { elev: 10, az: 15 }],
  ['gift', 'gift', { elev: 18, az: 30 }],
  ['horse_grey', 'horsev', { col: 0xCFC9C0, mane: 0x8C8780, muzzle: 0xB9B2A8, blanket: 0x2E6E8E, halter: 0xF4B740, elev: 8, az: 20 }],
  ['pony', 'horsev', { col: 0xF2EDE4, mane: 0xD8C9B0, legs: .7, body: .95, head: 1.15, legW: 1.25, halter: 0xFF5A4E, elev: 10, az: 22 }],
  ['racehorse', 'horsev', { col: 0x3A2214, mane: 0x15100C, cloth: 0x1FCB8A, legs: 1.1, body: .95, socks: true, halter: 0xF4F1EA, elev: 8, az: 20 }],
  ['foal', 'horsev', { col: 0xC57B47, mane: 0x6B3F22, legs: 1.25, body: .78, head: .95, legW: .8, blaze: true, halter: 0xF4B740, elev: 8, az: 18 }],
  ['saddle', 'saddle', { elev: 18, az: 30 }],
  ['helmet', 'helmet', { elev: 22, az: 25 }],
  ['horseshoe', 'horseshoe', { elev: 6, rotY: -0.35 }],
  ['stable', 'stable', { elev: 16, az: 24 }],
  ['trailer', 'trailer', { elev: 16, az: 32 }],
  ['gavel', 'gavel', { elev: 20, az: 25 }],
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
