import { boot, scene, cue, h, svg, tf, A, anim, clamp, lerp, ease, prog, Odo, count, fmt, sfx, ticker, TL } from '../../lib/engine.js';
import { box, text, obj, label, panel, burst, pulse } from '../../lib/kit.js';

// ---------- data (6 %/an, capitalisation mensuelle, 200 €/mois) ----------
const r = .06 / 12, M = 200;
const annuity = m => M * (Math.pow(1 + r, m) - 1) / r;
const L35 = annuity(120);
const LEA = a => a <= 25 ? 0 : a <= 35 ? annuity((a - 25) * 12) : L35 * Math.pow(1 + r, (a - 35) * 12);
const HUGO = a => a <= 35 ? 0 : annuity((a - 35) * 12);
const kf = (t, frames, fn = ease.inOutSine) => {
  if (t <= frames[0][0]) return frames[0][1];
  for (let i = 1; i < frames.length; i++) { const [t1, v1] = frames[i], [t0, v0] = frames[i - 1]; if (t <= t1) return lerp(v0, v1, fn(clamp((t - t0) / Math.max(1e-6, t1 - t0)))); }
  return frames[frames.length - 1][1];
};
const MINT = '#2EE6A0', GOLD = '#F4B740';

boot(async () => {
  const C = n => cue(n);
  const HUD_IN = C('line:l3') - .55, HUD_OUT = C('line:l13') - .35, CTA = C('cta') - .35;
  const SB = HUD_IN, SD = C('hyp') - .3, SE = C('at35') - .3, SF = C('egal') - .3, SG = HUD_OUT, SH = C('warn') - .3, SI = C('best1') - .3;

  // =============== persistent pawns + HUD ===============
  const hud = document.getElementById('hud');
  const P = [
    { name: 'LÉA', spr: 'pawn_mint', col: 'mint', bigX: 320, smallX: 150, colX: 290 },
    { name: 'HUGO', spr: 'pawn_gold', col: 'gold', bigX: 760, smallX: 650, colX: 790 },
  ];
  const BIG = { by: 930, w: 420 }, SMALL = { by: 345, w: 130 };
  for (const p of P) {
    p.el = obj(hud, p.spr, { cx: p.bigX, by: BIG.by, w: BIG.w, z: 3 });
    p.chipBig = text(hud, `<span class="chip ${p.col}" style="font-size:46px;padding:9px 22px">${p.name}</span>`, { cls: 'abs', x: p.bigX - 200, y: 950, w: 400 });
    p.chipSmall = text(hud, `<span class="chip ${p.col}" style="font-size:34px">${p.name}</span>`, { cls: 'abs', x: p.smallX + 70, y: 240, w: 300, align: 'left' });
    p.lab = text(hud, 'VERSÉ', { cls: 'mono', x: p.smallX + 72, y: 300, w: 330, align: 'left', size: 22 });
    p.odo = new Odo(hud, { maxDigits: 6, style: { position: 'absolute', left: (p.smallX + 68) + 'px', top: '330px', width: '360px', textAlign: 'left', fontSize: '74px', color: `var(--${p.col})` } });
  }
  const divider = h('div', 'abs', '', { left: '539px', top: '230px', width: '2px', height: '220px', background: 'rgba(226,242,234,.18)' }); hud.appendChild(divider);
  // HUD value logic per phase
  const fillL = [C('lpay'), C('stop')], fillH = [C('h35') + .4, C('h65') + .9];
  const ageAt = t => kf(t, [[C('at35') + .05, 25], [C('l33k') + .2, 35], [C('lrest') + .1, 35], [C('work') + 2.0, 45], [C('hclimb'), 45], [C('end:l10') - .5, 63.58], [C('at65') + .1, 63.58], [C('at65') + 1.0, 65]], ease.inOutSine);
  const hudVal = (i, t) => {
    if (t < SE) {
      if (i === 0) return lerp(0, 24000, clamp((t - fillL[0]) / (fillL[1] - fillL[0])));
      return lerp(0, 72000, clamp((t - fillH[0]) / (fillH[1] - fillH[0])));
    }
    const a = ageAt(t); return i === 0 ? LEA(a) : HUGO(a);
  };
  ticker(t => {
    // pawn morph big <-> small
    const toSmall = prog(t, HUD_IN, .8, ease.inOutCubic) * (1 - prog(t, HUD_OUT, .5, ease.inCubic));
    const atCta = t >= CTA;
    P.forEach((p, i) => {
      const k = toSmall;
      const s = lerp(1, SMALL.w / BIG.w, k);
      const dx = lerp(0, p.smallX - p.bigX, k), dy = lerp(0, SMALL.by - BIG.by, k);
      let o = 1, pop = 1;
      if (t < HUD_IN) { const e = anim(t, -1, Infinity, { type: 'pop' }); pop = e.s; }
      if (t >= HUD_OUT) o = 1 - prog(t, HUD_OUT, .4);
      if (atCta) { const e = anim(t, CTA + .1 + i * .12, Infinity, { type: 'pop' }); o = e.o; pop = e.s; }
      const bump = pulse(t, C(i ? 'hugo' : 'lea'), .1, .45);
      const fl = Math.sin(t * 1.3 + i) * (k > .5 ? 2 : 6);
      tf(p.el, { x: dx, y: dy + fl, s: s * pop * bump, o });
      A(p.chipBig, t, i ? C('hugo') : C('lea'), HUD_IN, { type: 'up' });
      A(p.chipSmall, t, HUD_IN + .5, HUD_OUT, { type: 'left', dist: 30 });
      const phaseE = t >= SE;
      p.lab.textContent = phaseE ? 'PATRIMOINE' : 'VERSÉ';
      A(p.lab, t, HUD_IN + .6, HUD_OUT, { type: 'fade' });
      p.odo.at(t, tt => hudVal(i, tt));
      const pul = i === 0 ? pulse(t, C('l24k'), .12, .5) * pulse(t, C('l197') + .1, .1, .5) : pulse(t, C('h72k'), .12, .5) * pulse(t, C('h201') + .1, .1, .5);
      A(p.odo.el, t, HUD_IN + .7, HUD_OUT, { type: 'fade', base: { s: pul } });
      p.odo.el.style.transformOrigin = '0% 60%';
    });
    A(divider, t, HUD_IN + .6, HUD_OUT, { type: 'fade' });
  });

  // =============== A. HOOK ===============
  scene(0, SB, (root) => {
    const top = text(root, 'MÊME SOMME · MÊME PLACEMENT', { cls: 'mono', y: 228, size: 26 });
    const l = text(root, '200<span class="u">€</span><span class="u" style="font-size:.3em;color:var(--muted)">/MOIS</span>', { cls: 'num', x: 60, y: 300, w: 520, size: 96, color: 'var(--mint)' });
    const eq = text(root, '=', { cls: 'num', y: 300, size: 96, style: { color: 'var(--cream)' } });
    const rr = text(root, '200<span class="u">€</span><span class="u" style="font-size:.3em;color:var(--muted)">/MOIS</span>', { cls: 'num', x: 500, y: 300, w: 520, size: 96, color: 'var(--gold)' });
    const h1 = text(root, 'QUI FINIT<br>LE PLUS <span class="a">RICHE</span> ?', { y: 1040, size: 120 });
    const h2 = text(root, 'UNE SEULE<br>DIFFÉRENCE…', { y: 1040, size: 120 });
    const h3 = text(root, 'QUAND ILS<br><span class="a">COMMENCENT</span>', { y: 1040, size: 120 });
    const hg = obj(root, 'hourglass', { cx: 540, by: 900, w: 300, z: 4 });
    sfx('pop', C('lea') + .05, .6); sfx('pop', C('hugo') + .05, .6); sfx('pop', C('m200'), .6); sfx('whoosh', C('diff') - .1, .6); sfx('pop', C('quand'), .8);
    return t => {
      const out = SB - .12;
      A(top, t, -1, out, { type: 'fade' });
      A(l, t, C('m200') - .05, out, { type: 'up' }); A(eq, t, C('m200') + .1, out, { type: 'pop' }); A(rr, t, C('m200') + .2, out, { type: 'up' });
      A(h1, t, -1, C('diff') - .2, { type: 'up', dout: .25 });
      A(h2, t, C('diff'), C('quand') - .15, { type: 'up', dout: .2 });
      A(h3, t, C('quand'), out, { type: 'up' });
      A(hg, t, C('quand') - .05, out, { type: 'pop', float: 5 });
    };
  });

  // =============== B+C. LA FRISE ===============
  scene(SB, SD, (root, t0) => {
    const Pn = panel(root, { x: 50, y: 560, w: 980, hgt: 620 });
    const W = 980, H = 620, x0 = 130, x1 = 930;
    const X = a => x0 + (x1 - x0) * (a - 25) / 40;
    const s = svg('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }); s.style.overflow = 'visible'; Pn.appendChild(s);
    const ttl = svg('text', { x: 40, y: 60, fill: 'rgba(226,242,234,.5)', 'font-size': 22, 'letter-spacing': 3 }); ttl.textContent = 'VERSEMENTS · 200 € / MOIS'; s.appendChild(ttl);
    const rowY = [215, 410], th = 100;
    for (const a of [25, 35, 45, 55, 65]) {
      s.appendChild(svg('line', { x1: X(a), x2: X(a), y1: 120, y2: 540, stroke: 'rgba(226,242,234,.07)', 'stroke-width': 2 }));
      const tt = svg('text', { x: X(a), y: 580, 'text-anchor': 'middle', fill: 'rgba(226,242,234,.55)', 'font-size': 24 }); tt.textContent = a + (a === 65 ? ' ANS' : ''); s.appendChild(tt);
    }
    const mk = (a0, n, y, col) => { const arr = []; const w = (X(a0 + n / 12) - X(a0)) / n; for (let i = 0; i < n; i++) { const rr = svg('rect', { x: X(a0) + i * w, y: y - th / 2, width: Math.max(1.2, w * .55), height: th, rx: 1, fill: col, opacity: 0 }); s.appendChild(rr); arr.push(rr); } return arr; };
    const tl = mk(25, 120, rowY[0], MINT), thg = mk(35, 360, rowY[1], GOLD);
    const rl = svg('text', { x: 40, y: rowY[0] + 9, fill: MINT, 'font-size': 26, 'font-weight': 700 }); rl.textContent = 'LÉA'; s.appendChild(rl);
    const rh = svg('text', { x: 40, y: rowY[1] + 9, fill: GOLD, 'font-size': 26, 'font-weight': 700 }); rh.textContent = 'HUGO'; s.appendChild(rh);
    // stop + dashed rest
    const dash = svg('line', { x1: X(35) + 14, x2: X(65), y1: rowY[0], y2: rowY[0], stroke: 'rgba(226,242,234,.35)', 'stroke-width': 4, 'stroke-dasharray': '6 12', opacity: 0 }); s.appendChild(dash);
    const zero = svg('text', { x: X(50), y: rowY[0] - 22, 'text-anchor': 'middle', fill: 'rgba(226,242,234,.6)', 'font-size': 24, opacity: 0 }); zero.textContent = '0 € / MOIS'; s.appendChild(zero);
    const stop = text(Pn, '<span class="chip red" style="font-size:30px">STOP</span>', { cls: 'abs', x: X(35) - 100, y: rowY[0] - 106, w: 200 });
    const m25 = text(Pn, '<span class="chip mint" style="font-size:28px">25 ANS</span>', { cls: 'abs', x: X(25) - 100, y: rowY[0] + 62, w: 200 });
    const m35 = text(Pn, '<span class="chip gold" style="font-size:28px">35 ANS</span>', { cls: 'abs', x: X(35) - 100, y: rowY[1] + 62, w: 200 });
    const m65 = text(Pn, '<span class="chip gold" style="font-size:28px">65 ANS</span>', { cls: 'abs', x: X(65) - 140, y: rowY[1] + 62, w: 200 });
    const tot = text(root, '24<i class="sp"></i>000<span class="u">€</span> <span style="font-size:.4em;color:var(--muted)">AU TOTAL</span>', { cls: 'num', x: 0, y: 830, w: 1080, size: 76, color: 'var(--mint)', z: 5 });
    const x3 = text(root, '×3', { cls: 'num', x: 700, y: 530, w: 300, size: 150, color: 'var(--gold)', z: 6 });
    const T = { l25: C('l25'), pay: C('lpay'), stop: C('stop'), tj: C('tjrs'), l24: C('l24k'), h35: C('h35'), h65: C('h65'), h72: C('h72k'), x3: C('x3') };
    sfx('whoosh', t0 + .2, .6); sfx('pop', T.l25 + .1, .6); sfx('fill', fillL[0], .5, fillL[1] - fillL[0]); sfx('stamp', T.stop, .9); sfx('ding', T.l24 + .05, .7);
    sfx('pop', T.h35 + .1, .6); sfx('fill', fillH[0], .5, fillH[1] - fillH[0]); sfx('pop', T.h65 + .05, .6); sfx('ding', T.h72 + .05, .7); sfx('stamp', T.x3, 1);
    return t => {
      const out = SD - .12;
      A(Pn, t, t0 + .3, out, { type: 'up', dist: 70 });
      const nl = Math.floor(clamp((t - fillL[0]) / (fillL[1] - fillL[0])) * 120);
      tl.forEach((e, i) => e.setAttribute('opacity', i < nl ? 1 : .08));
      const nh = Math.floor(clamp((t - fillH[0]) / (fillH[1] - fillH[0])) * 360);
      thg.forEach((e, i) => e.setAttribute('opacity', i < nh ? 1 : .08));
      A(m25, t, T.l25 + .1, out, { type: 'up' }); A(stop, t, T.stop, out, { type: 'stamp', rot: -6, rot2: -4 });
      dash.setAttribute('opacity', prog(t, T.tj, .5)); zero.setAttribute('opacity', prog(t, T.tj + .2, .5));
      A(m35, t, T.h35 + .1, out, { type: 'up' }); A(m65, t, T.h65 + .05, out, { type: 'up' });
      A(tot, t, T.l24 - .05, T.h35 - .2, { type: 'up' });
      A(x3, t, T.x3, out, { type: 'stamp', rot: 8, rot2: 5 });
    };
  });

  // =============== D. HYPOTHÈSE ===============
  scene(SD, SE, (root, t0) => {
    const coin = obj(root, 'coin', { cx: 540, by: 720, w: 250 });
    const big = text(root, '6<span class="u">%</span>', { cls: 'num', y: 735, size: 210, color: 'var(--cream)', z: 4 });
    const s1 = text(root, 'PAR AN · EN MOYENNE', { cls: 'mono', y: 965, size: 28, style: { color: 'var(--cream)' } });
    const s2 = text(root, '<span class="chip mint" style="font-size:44px">GAINS RÉINVESTIS</span>', { cls: 'abs', y: 1030 });
    const hyp = text(root, 'HYPOTHÈSE', { cls: 'mono', y: 470, size: 26, style: { color: 'var(--mint)' } });
    sfx('whoosh', t0 + .05, .6); sfx('pop', C('hyp') + .1, .8); sfx('pop', C('reinv'), .6);
    return t => {
      const out = SE - .12;
      A(hyp, t, t0 + .1, out, { type: 'fade' });
      A(coin, t, t0 + .15, out, { type: 'pop', float: 5 });
      A(big, t, C('hyp') + .1, out, { type: 'pop' });
      A(s1, t, C('hyp') + .5, out, { type: 'up' }); A(s2, t, C('reinv') - .05, out, { type: 'up' });
    };
  });

  // =============== E. LA COURBE ===============
  scene(SE, SF, (root, t0) => {
    const Pn = panel(root, { x: 40, y: 540, w: 1000, hgt: 650 });
    Pn.style.transform = 'perspective(1800px) rotateX(6deg)';
    const W = 1000, H = 650, x0 = 130, x1 = 900, y0 = 560, y1 = 80, maxV = 220000;
    const X = a => x0 + (x1 - x0) * (a - 25) / 40, Y = v => y0 - (y0 - y1) * v / maxV;
    const s = svg('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }); s.style.overflow = 'visible'; Pn.appendChild(s);
    s.appendChild(svg('defs')).innerHTML = `<filter id="gl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
    for (const v of [50000, 100000, 150000, 200000]) {
      s.appendChild(svg('line', { x1: x0, x2: x1, y1: Y(v), y2: Y(v), stroke: 'rgba(226,242,234,.08)', 'stroke-width': 2 }));
      const tt = svg('text', { x: x0 - 16, y: Y(v) + 7, 'text-anchor': 'end', fill: 'rgba(226,242,234,.45)', 'font-size': 20 }); tt.textContent = (v / 1000) + ' k€'; s.appendChild(tt);
    }
    s.appendChild(svg('line', { x1: x0, x2: x1, y1: y0, y2: y0, stroke: 'rgba(226,242,234,.35)', 'stroke-width': 2 }));
    for (const a of [25, 35, 45, 55, 65]) { const tt = svg('text', { x: X(a), y: y0 + 42, 'text-anchor': 'middle', fill: 'rgba(226,242,234,.55)', 'font-size': 22 }); tt.textContent = a + (a === 65 ? ' ANS' : ''); s.appendChild(tt); }
    const ttl = svg('text', { x: x0, y: 46, fill: 'rgba(226,242,234,.5)', 'font-size': 20, 'letter-spacing': 3 }); ttl.textContent = 'PATRIMOINE · SIMULATION 6 %/AN'; s.appendChild(ttl);
    const band = svg('rect', { x: X(25), y: y1 - 10, width: X(35) - X(25), height: y0 - y1 + 10, fill: 'rgba(46,230,160,.07)' }); s.appendChild(band);
    const bandT = svg('text', { x: (X(25) + X(35)) / 2, y: y0 - 16, 'text-anchor': 'middle', fill: 'rgba(46,230,160,.6)', 'font-size': 18, 'letter-spacing': 2 }); bandT.textContent = 'LÉA VERSE'; s.appendChild(bandT);
    const cl = svg('path', { fill: 'none', stroke: MINT, 'stroke-width': 8, 'stroke-linecap': 'round', filter: 'url(#gl)' }); s.appendChild(cl);
    const ch = svg('path', { fill: 'none', stroke: GOLD, 'stroke-width': 8, 'stroke-linecap': 'round', filter: 'url(#gl)' }); s.appendChild(ch);
    const dl = svg('circle', { r: 12, fill: MINT }), dh = svg('circle', { r: 12, fill: GOLD }); s.appendChild(dl); s.appendChild(dh);
    const ll = svg('text', { fill: MINT, 'font-size': 28, 'font-weight': 700 }), lh = svg('text', { fill: GOLD, 'font-size': 28, 'font-weight': 700 }); s.appendChild(ll); s.appendChild(lh);
    // crossing marker
    const cx = X(63.58), cy = Y(LEA(63.58));
    const vline = svg('line', { x1: cx, x2: cx, y1: cy, y2: y0, stroke: 'rgba(243,236,223,.7)', 'stroke-width': 3, 'stroke-dasharray': '5 8', opacity: 0 }); s.appendChild(vline);
    const ring = svg('circle', { cx, cy, r: 26, fill: 'none', stroke: '#F3ECDF', 'stroke-width': 4, opacity: 0 }); s.appendChild(ring);
    const crossChip = text(Pn, '<span class="chip" style="font-size:34px">64 ANS</span>', { cls: 'abs', x: cx - 230, y: cy - 110, w: 200, z: 5 });
    const foot = text(root, 'SIMULATION · 6 %/AN CONSTANT · AVANT FRAIS ET IMPÔTS', { cls: 'foot', y: 1222 });
    const T = { at35: C('at35'), l33: C('l33k'), hz: C('hzero'), lr: C('lrest'), work: C('work'), hc: C('hclimb'), cross: C('cross'), at65: C('at65'), l197: C('l197'), h201: C('h201') };
    const crossT = C('end:l10') - .5;
    sfx('whoosh', t0 + .1, .6); sfx('draw', T.at35 + .05, .5, T.l33 + .2 - T.at35); sfx('ding', T.l33 + .2, .6); sfx('pop', T.hz, .7);
    sfx('draw', T.lr + .1, .45, T.work + 2 - T.lr); sfx('rise', T.hc, .55, crossT - T.hc); sfx('stamp', crossT, .9); sfx('pop', T.l197, .6); sfx('ding', T.h201 + .1, .8);
    return t => {
      const out = SF - .12;
      A(Pn, t, t0 + .1, out, { type: 'up', dist: 70 }); A(foot, t, t0 + .5, out, { type: 'fade' });
      const a = ageAt(t);
      let pl = '', ph = '';
      const n = 120;
      for (let i = 0; i <= n; i++) {
        const ai = 25 + (a - 25) * i / n;
        pl += (i ? 'L' : 'M') + X(ai).toFixed(1) + ' ' + Y(LEA(ai)).toFixed(1);
      }
      if (a > 35) for (let i = 0; i <= n; i++) { const ai = 35 + (a - 35) * i / n; ph += (i ? 'L' : 'M') + X(ai).toFixed(1) + ' ' + Y(HUGO(ai)).toFixed(1); }
      cl.setAttribute('d', pl); ch.setAttribute('d', ph || 'M0 0');
      ch.setAttribute('opacity', a > 35 ? 1 : 0);
      dl.setAttribute('cx', X(a)); dl.setAttribute('cy', Y(LEA(a)));
      const hzOn = t >= T.hz - .05;
      const ha = Math.max(a, 35);
      dh.setAttribute('cx', X(ha)); dh.setAttribute('cy', Y(HUGO(ha))); dh.setAttribute('opacity', hzOn ? 1 : 0);
      dh.setAttribute('r', 12 * pulse(t, T.hz, .6, .5));
      // labels
      const lOn = clamp((t - T.l33 - .1) / .3) * (1 - clamp((t - T.lr) / .3)) + clamp((t - T.l197) / .3);
      const hOn = clamp((t - T.hz) / .3) * (1 - clamp((t - T.lr) / .3)) + clamp((t - T.h201) / .3);
      ll.textContent = '≈ ' + fmt(Math.round(LEA(a) / 100) * 100) + ' €'; lh.textContent = '≈ ' + fmt(Math.round(HUGO(ha) / 100) * 100) + ' €';
      if (a < 50) { ll.setAttribute('x', X(a) + 22); ll.setAttribute('y', Y(LEA(a)) - 16); ll.setAttribute('text-anchor', 'start'); lh.setAttribute('x', X(ha) + 22); lh.setAttribute('y', Y(HUGO(ha)) - 14); lh.setAttribute('text-anchor', 'start'); }
      else { ll.setAttribute('x', X(a) - 24); ll.setAttribute('y', Y(LEA(a)) + 46); ll.setAttribute('text-anchor', 'end'); lh.setAttribute('x', X(a) - 24); lh.setAttribute('y', Y(HUGO(a)) - 22); lh.setAttribute('text-anchor', 'end'); }
      if (t < T.lr) lh.textContent = '0 €';
      ll.setAttribute('opacity', clamp(lOn)); lh.setAttribute('opacity', clamp(hOn));
      const cp = prog(t, crossT, .35);
      vline.setAttribute('opacity', cp * (1 - prog(t, T.l197 - .3, .3))); ring.setAttribute('opacity', cp * (1 - prog(t, T.l197 - .3, .3)));
      ring.setAttribute('r', 26 * pulse(t, crossT, .5, .6));
      A(crossChip, t, crossT, T.l197 - .3, { type: 'stamp', rot: -5, rot2: -3 });
      band.setAttribute('opacity', prog(t, t0 + .4, .5)); bandT.setAttribute('opacity', prog(t, t0 + .4, .5));
    };
  });

  // =============== F. PRESQUE ÉGALITÉ ===============
  scene(SF, SG, (root, t0) => {
    const head = text(root, 'PRESQUE <span class="a">ÉGALITÉ</span>', { y: 560, size: 92 });
    const maxV = 200903, HMAX = 470, base = 1170, bw = 300;
    const mkBar = (cx, total, paid, col, hatch) => {
      const g = box(root, { x: cx - bw / 2, y: base - HMAX, w: bw, hgt: HMAX });
      const ht = HMAX * total / maxV, hp = HMAX * paid / maxV;
      const segI = h('div', 'abs', '', { left: 0, width: bw + 'px', bottom: hp + 'px', height: (ht - hp) + 'px', borderRadius: '16px 16px 0 0', background: `repeating-linear-gradient(45deg, ${col} 0 14px, ${hatch} 14px 28px)` });
      const segP = h('div', 'abs', '', { left: 0, width: bw + 'px', bottom: 0, height: hp + 'px', background: 'var(--cream)', borderRadius: '0 0 6px 6px' });
      g.appendChild(segI); g.appendChild(segP);
      const lp = h('div', 'mono abs', `VERSÉ<br><b style="color:var(--ink);font-size:30px;letter-spacing:.02em">${fmt(paid)} €</b>`, { left: 0, width: bw + 'px', bottom: (hp / 2 - 30) + 'px', textAlign: 'center', color: 'rgba(7,20,15,.6)', fontSize: '20px', lineHeight: '1.2' });
      const li = h('div', 'mono abs', `INTÉRÊTS<br><b style="color:var(--ink);font-size:30px;letter-spacing:.02em">${fmt(total - paid)} €</b>`, { left: 0, width: bw + 'px', bottom: (hp + (ht - hp) / 2 - 30) + 'px', textAlign: 'center', color: 'rgba(7,20,15,.65)', fontSize: '20px', lineHeight: '1.2' });
      g.appendChild(lp); g.appendChild(li);
      g.style.transformOrigin = '50% 100%';
      return { g, segP, lp };
    };
    const bl = mkBar(290, LEA(65), 24000, '#2EE6A0', '#22c98a');
    const bh = mkBar(790, HUGO(65), 72000, '#F4B740', '#e3a42e');
    const moins = text(root, '<span class="chip red" style="font-size:40px">3× MOINS VERSÉ</span>', { cls: 'abs', x: 40, y: 1180 - 175, w: 500, z: 6 });
    sfx('whoosh', t0 + .05, .6); sfx('rise', t0 + .3, .45, 1.0); sfx('stamp', C('moins') + .9, .9);
    return t => {
      const out = SG - .12;
      A(head, t, t0 + .1, out, { type: 'up' });
      for (const [b, d] of [[bl, 0], [bh, .15]]) {
        const p = prog(t, t0 + .3 + d, .9, ease.outQuart);
        tf(b.g, { sy: p, o: clamp(p * 4) * (1 - prog(t, out, .3)) });
      }
      A(moins, t, C('moins') + .9, out, { type: 'stamp', rot: -6, rot2: -4 });
    };
  });

  // =============== G. POURQUOI ===============
  scene(SG, SH, (root, t0) => {
    const q = text(root, 'POURQUOI ?', { cls: 'mono', y: 228, size: 30, style: { color: 'var(--mint)' } });
    const head = text(root, 'LE <span class="a">TEMPS</span> COMPTE<br>PLUS QUE LE MONTANT', { y: 290, size: 96 });
    const hg = obj(root, 'hourglass', { cx: 400, by: 1060, w: 520 });
    const coins = obj(root, 'coinstack_s', { cx: 820, by: 1040, w: 230 });
    const vs = text(root, '>', { cls: 'num', x: 560, y: 780, w: 160, size: 130, style: { color: 'var(--muted)' } });
    const big = new Odo(root, { maxDigits: 2, suffix: '<span class="u">+</span>', style: { position: 'absolute', top: '560px', left: 0, right: 0, textAlign: 'center', color: 'var(--mint)', fontSize: '300px' } });
    const bs = text(root, 'ANS POUR GROSSIR', { cls: 'head', y: 880, size: 84 });
    const bs2 = text(root, 'CHAQUE EURO DE LÉA A EU', { cls: 'mono', y: 500, size: 28, style: { color: 'var(--mint)' } });
    const T = { tps: C('temps'), mt: C('montant'), gr: C('grossir'), y30: C('y30') };
    sfx('whoosh', t0 + .05, .6); sfx('pop', T.tps + .5, .7); sfx('pop', T.mt, .5); sfx('whoosh', T.gr - .1, .5); sfx('rise', T.gr + .2, .5, T.y30 - T.gr - .2); sfx('ding', T.y30, .8);
    return t => {
      const out = SH - .3, mid = T.gr - .15;
      A(q, t, t0 + .05, mid, { type: 'fade' });
      A(head, t, T.tps - .1, mid, { type: 'up' });
      A(hg, t, T.tps + .5, mid, { type: 'pop', float: 5 });
      A(coins, t, T.mt, mid, { type: 'pop', float: 4, phase: 2 }); A(vs, t, T.mt + .1, mid, { type: 'fade' });
      A(big.el, t, T.gr + .15, out, { type: 'up', base: { s: pulse(t, T.y30 + .05, .08, .45) } }); big.at(t, tt => count(tt, T.gr + .2, T.y30 - T.gr - .2, 0, 30, ease.outCubic)); A(bs, t, T.y30 + .2, out, { type: 'up' }); A(bs2, t, T.gr + .05, out, { type: 'fade' });
    };
  });

  // =============== H. ATTENTION ===============
  scene(SH, SI, (root, t0) => {
    const st = text(root, '<span class="chip red" style="font-size:60px;padding:12px 26px">⚠<i class="sp"></i>SIMULATION</span>', { cls: 'abs', y: 300 });
    const rows = [['w1', 'LES MARCHÉS MONTENT<br>ET BAISSENT', 'zig'], ['w2', 'FRAIS ET IMPÔTS<br>EN PLUS', 'minus']].map(([c, a, ic], i) => {
      const r = box(root, { x: 70, y: 520 + i * 290, w: 940, hgt: 250 });
      r.appendChild(h('div', 'panel', '', { inset: 0, borderRadius: '26px' }));
      const icon = svg('svg', { width: 130, height: 130, viewBox: '0 0 110 110' }); Object.assign(icon.style, { position: 'absolute', left: '40px', top: '60px' });
      icon.innerHTML = `<circle cx="55" cy="55" r="52" fill="rgba(255,90,78,.14)"/>` + (ic === 'zig' ? `<path d="M22 70 L42 48 L56 62 L72 36 L88 52" fill="none" stroke="#FF5A4E" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>` : `<path d="M30 55 L80 55" stroke="#FF5A4E" stroke-width="9" stroke-linecap="round"/>`);
      r.appendChild(icon);
      r.appendChild(h('div', 'head abs', a, { left: '200px', top: '68px', fontSize: '62px', width: '720px' }));
      return { r, c };
    });
    sfx('stamp', C('warn') + .05, .9); rows.forEach(({ c }) => sfx('pop', C(c), .6));
    return t => {
      const out = SI - .12;
      A(st, t, C('warn'), out, { type: 'stamp', rot: -3, rot2: -2 });
      rows.forEach(({ r, c }) => A(r, t, C(c) - .05, out, { type: 'left' }));
    };
  });

  // =============== I. LE MEILLEUR MOMENT ===============
  scene(SI, CTA, (root, t0) => {
    const m1 = text(root, 'LE MEILLEUR MOMENT POUR COMMENCER', { cls: 'mono', y: 300, size: 26 });
    const a1 = text(root, 'IL Y A 10 ANS', { cls: 'head', y: 350, size: 130, style: { color: 'var(--cream)' } });
    const m2 = text(root, 'LE DEUXIÈME MEILLEUR', { cls: 'mono', y: 640, size: 26, style: { color: 'var(--mint)' } });
    const a2 = text(root, 'MAINTENANT.', { cls: 'head', y: 700, size: 156, color: 'var(--mint)' });
    const coins = obj(root, 'coinstack', { cx: 540, by: 1170, w: 300 });
    const bb = burst(root, { cx: 540, cy: 780, n: 14, r0: 200, r1: 470 });
    sfx('whoosh', C('best1'), .6); sfx('pop', C('best2') + .4, .8); sfx('sparkle', C('best2') + 1.2, .8);
    return t => {
      const out = CTA - .3, b2 = C('best2');
      A(m1, t, C('best1') + .05, out, { type: 'fade' });
      A(a1, t, C('best1') + .5, out, { type: 'up' });
      a1.style.opacity = (+a1.style.opacity * lerp(1, .35, prog(t, b2, .5))).toFixed(3);
      A(m2, t, b2, out, { type: 'fade' }); A(a2, t, b2 + 1.2, out, { type: 'pop', base: { s: pulse(t, b2 + 1.6, .05, .4) } });
      bb(t, b2 + 1.2);
      A(coins, t, b2 + 1.5, out, { type: 'pop', float: 4 });
    };
  });

  // =============== J. CTA ===============
  scene(CTA, TL.duration + 1, (root, t0) => {
    const top = text(root, 'LÉA OU HUGO ?', { cls: 'mono', y: 228, size: 28 });
    const head = text(root, 'ET VOUS, VOUS AVEZ<br>COMMENCÉ À <span class="a">QUEL ÂGE</span> ?', { y: 1010, size: 86 });
    const sub = text(root, 'RÉPONDEZ EN COMMENTAIRE ↓', { cls: 'mono', y: 1196, size: 24, style: { color: 'var(--cream)' } });
    sfx('whoosh', t0 + .05, .6); sfx('pop', t0 + .15, .6); sfx('pop', t0 + .3, .6);
    return t => {
      A(top, t, t0, Infinity, { type: 'fade' });
      A(head, t, t0 + .3, Infinity, { type: 'up' }); A(sub, t, t0 + .9, Infinity, { type: 'fade' });
    };
  });
});
