// Usage:
//   node render.js videos/v1_cafe --stills 0.5,3,10        -> build/stills/*.png
//   node render.js videos/v1_cafe [--workers 4] [--fps 30]  -> build/frames/*.jpg + build/sfx.json
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const { serve } = require('./lib/server.js');
const ROOT = __dirname;
const args = process.argv.slice(2);
const vdir = args[0];
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const FPS = +opt('fps', 30), WORKERS = +opt('workers', 4);
const LAUNCH = { args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--font-render-hinting=none'] };

async function openPage(browser, url) {
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  p.on('pageerror', e => console.log('PAGE ERROR', e.message));
  p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('console:', m.text()); });
  await p.goto(url); await p.waitForFunction(() => window.ready === true, null, { timeout: 120000 });
  return p;
}

(async () => {
  const { srv, url } = await serve(ROOT);
  const pageUrl = `${url}/${vdir}/index.html`;
  const build = path.join(ROOT, vdir, 'build');
  const browser = await chromium.launch(LAUNCH);
  const stills = opt('stills', null);
  if (stills) {
    const p = await openPage(browser, pageUrl);
    const out = path.join(build, 'stills'); fs.mkdirSync(out, { recursive: true });
    for (const s of stills.split(',')) {
      const t = parseFloat(s);
      await p.evaluate(t => window.renderFrame(t), t);
      await p.screenshot({ path: path.join(out, `t${t.toFixed(2).padStart(6, '0')}.png`) });
    }
    console.log('stills done'); await browser.close(); srv.close(); return;
  }
  const p0 = await openPage(browser, pageUrl);
  const dur = await p0.evaluate(() => window.DURATION);
  const sfx = await p0.evaluate(() => window.SFX);
  fs.writeFileSync(path.join(build, 'sfx.json'), JSON.stringify(sfx, null, 1));
  const N = Math.ceil(dur * FPS);
  const from = +opt('from', 0), to = Math.min(N, +opt('to', N));
  const fdir = path.join(build, 'frames'); fs.mkdirSync(fdir, { recursive: true });
  const pages = [p0]; for (let i = 1; i < WORKERS; i++) pages.push(await openPage(browser, pageUrl));
  let next = from, done = 0; const t0 = Date.now();
  await Promise.all(pages.map(async p => {
    while (next < to) {
      const f = next++;
      await p.evaluate(t => window.renderFrame(t), f / FPS);
      await p.screenshot({ path: path.join(fdir, `${String(f).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 96 });
      if (++done % 150 === 0) console.log(`${done}/${to - from} frames  ${((Date.now() - t0) / done).toFixed(0)} ms/frame`);
    }
  }));
  console.log('frames done', N, 'in', ((Date.now() - t0) / 1000).toFixed(0), 's');
  await browser.close(); srv.close();
})();
