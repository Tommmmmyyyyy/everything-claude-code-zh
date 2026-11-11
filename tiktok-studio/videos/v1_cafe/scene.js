import { boot, scene, cue, lineEnd, lineStart, h, svg, tf, A, anim, clamp, lerp, ease, prog, Odo, count, fmt, eur, sfx, ticker, TL } from '../../lib/engine.js';
import { box, text, obj, steam, label, panel, toggle, burst, pulse } from '../../lib/kit.js';

// ---------- data ----------
const R = .05 / 12, PM = 91.25;
const FV = years => { const m = years * 12; return PM * (Math.pow(1 + R, m) - 1) / R; };
const PAID = years => 1095 * years;
// keyframe interpolation
const kf = (t, frames, fn = ease.inOutSine) => {
  if (t <= frames[0][0]) return frames[0][1];
  for (let i = 1; i < frames.length; i++) {
    const [t1, v1] = frames[i], [t0, v0] = frames[i - 1];
    if (t <= t1) return lerp(v0, v1, fn(clamp((t - t0) / Math.max(1e-6, t1 - t0))));
  }
  return frames[frames.length - 1][1];
};

boot(async () => {
  // =============== 1. HOOK ===============
  const S2 = cue('e3') - .75;
  scene(0, S2, (root) => {
    const lab = text(root, 'LE VRAI PRIX D’UN CAFÉ', { cls: 'mono', y: 228, size: 26 });
    const price = text(root, '3<span class="u">€</span>', { cls: 'num', y: 285, size: 250, color: 'var(--gold)' });
    const perDay = text(root, '/ JOUR', { cls: 'mono', x: 668, y: 470, w: 300, align: 'left', size: 32, style: { color: 'var(--cream)' } });
    const cup = obj(root, 'cup', { cx: 540, by: 1040, w: 470 });
    const st = steam(cup, { cx: .47, top: .17, scale: .85 });
    const tag = text(root, '<span class="chip ghost" style="font-size:36px">ÇA N’A L’AIR DE RIEN…</span>', { cls: 'abs', x: 585, y: 612, w: 480, align: 'left', z: 4 });
    const head = text(root, 'COMBIEN SUR<br><span class="a">30 ANS</span> ?', { y: 1035, size: 118 });
    sfx('pop', cue('price') - .05, .8); sfx('pop', cue('rien'), .6); sfx('whoosh', cue('y30') - .1, .7);
    return t => {
      const out = S2 - .12;
      A(lab, t, -1, out, { type: 'fade' });
      const pp = pulse(t, cue('price') - .05, .16, .5);
      A(price, t, -1, out, { type: 'pop', base: { s: pp } });
      A(perDay, t, cue('price') + .1, out, { type: 'left', dist: 30 });
      A(cup, t, -1, out, { type: 'pop', float: 6 }); st(t);
      A(tag, t, cue('rien'), out, { type: 'stamp', rot: 9, rot2: 5 });
      const hp = pulse(t, cue('y30'), .07, .5) * pulse(t, cue('combien'), .05, .45);
      A(head, t, -1, out, { type: 'up', base: { s: hp } });
    };
  });

  // =============== 2. LE CALCUL ===============
  const S3 = cue('s10') - .45;
  scene(S2, S3, (root, t0) => {
    const lab = label(root, '01', 'LE CALCUL');
    const a = text(root, '3<span class="u">€</span>', { cls: 'num', x: 120, y: 300, w: 340, align: 'right', size: 150 });
    const b = text(root, '<span style="color:var(--muted)">×</span><i class="sp"></i>365', { cls: 'num', x: 480, y: 300, w: 480, align: 'left', size: 150 });
    const c = text(root, '=<i class="sp"></i>1<i class="sp"></i>095<span class="u">€</span>', { cls: 'num', y: 470, size: 160, color: 'var(--gold)' });
    const cap = text(root, 'PAR AN', { cls: 'mono', y: 650, size: 28, style: { color: 'var(--cream)' } });
    // 365 grid
    const G = box(root, { x: 85, y: 735, w: 910, hgt: 450 });
    const cols = 25, rows = 15, cs = 36.4;
    const cells = [];
    for (let i = 0; i < cols * rows; i++) {
      const e = h('div', 'abs', '', { left: (i % cols) * cs + 'px', top: Math.floor(i / cols) * 29 + 'px', width: '28px', height: '22px', borderRadius: '6px', background: 'rgba(226,242,234,.10)' });
      G.appendChild(e); cells.push(e);
    }
    const gl = text(root, '1 CASE = 1 CAFÉ', { cls: 'mono', y: 1188, size: 22 });
    const tA = cue('e3'), tB = cue('e365'), tC = cue('e1095');
    sfx('pop', tA, .7); sfx('pop', tB, .7); sfx('fill', tB + .1, .55, 1.6); sfx('ding', tC + .45, .7);
    return t => {
      const out = S3 - .12;
      A(lab, t, t0, out, { type: 'fade' });
      A(a, t, tA - .05, out, { type: 'pop' }); A(b, t, tB - .05, out, { type: 'pop' });
      A(c, t, tC + .4, out, { type: 'up', base: { s: pulse(t, tC + .9, .06, .4) } }); A(cap, t, tC + .55, out, { type: 'up' });
      A(G, t, t0 + .1, out, { type: 'fade' }); A(gl, t, tB, out, { type: 'fade' });
      const n = Math.floor(clamp((t - tB - .1) / 1.6) * 365);
      for (let i = 0; i < cells.length; i++) {
        const on = i < n;
        cells[i].style.background = on ? 'var(--gold)' : (i >= 365 ? 'rgba(226,242,234,.04)' : 'rgba(226,242,234,.10)');
      }
    };
  });

  // =============== 3+4. CUMUL -> POCHE -> VRAI COÛT ===============
  const S5 = cue('line:l7') - .35;
  scene(S3, S5, (root, t0) => {
    const lab = label(root, '02', 'LE CUMUL');
    const odo = new Odo(root, { maxDigits: 5, style: { position: 'absolute', top: '280px', left: 0, right: 0, textAlign: 'center', color: 'var(--gold)', fontSize: '176px' } });
    const sub = text(root, 'DÉPENSÉ EN CAFÉ', { cls: 'mono', y: 476, size: 26, style: { color: 'var(--cream)' } });
    const P = panel(root, { x: 70, y: 560, w: 940, hgt: 600 });
    const s = svg('svg', { width: 940, height: 600, viewBox: '0 0 940 600' }); P.appendChild(s);
    const bx0 = 70, bx1 = 890, by0 = 500, byTop = 70, maxV = 32850 * 1.08;
    s.appendChild(svg('line', { x1: bx0, x2: bx1, y1: by0, y2: by0, stroke: 'rgba(226,242,234,.3)', 'stroke-width': 2 }));
    const bars = [];
    for (let i = 1; i <= 30; i++) {
      const bw = (bx1 - bx0) / 30;
      const r = svg('rect', { x: bx0 + (i - 1) * bw + 4, width: bw - 8, rx: 4, fill: i === 10 ? '#F4B740' : 'rgba(244,183,64,.55)' });
      s.appendChild(r); bars.push(r);
    }
    for (const [yr, txt] of [[1, '1 AN'], [10, '10'], [20, '20'], [30, '30 ANS']]) {
      const x = bx0 + (yr - .5) * (bx1 - bx0) / 30;
      const tt = svg('text', { x, y: by0 + 46, 'text-anchor': 'middle', fill: 'rgba(226,242,234,.55)', 'font-size': 22, 'letter-spacing': '2' }); tt.textContent = txt; s.appendChild(tt);
    }
    const tag10 = svg('g', {}); s.appendChild(tag10);
    const t10 = svg('text', { 'text-anchor': 'middle', fill: '#F4B740', 'font-size': 30, 'font-weight': 700 }); t10.textContent = '≈ 11 000 €'; tag10.appendChild(t10);
    // poche / vrai coût
    const bills = obj(root, 'billsbig', { cx: 540, by: 900, w: 600 });
    const myst = new Odo(root, { maxDigits: 5, style: { position: 'absolute', top: '270px', left: 0, right: 0, textAlign: 'center', color: 'var(--mint)', fontSize: '176px' } });
    const chipPoche = text(root, '<span class="chip" style="font-size:44px">SORTI DE VOTRE POCHE</span>', { cls: 'abs', y: 520 });
    const stamp = text(root, '<span class="chip red" style="font-size:58px;padding:12px 24px">PAS LE VRAI COÛT</span>', { cls: 'abs', y: 330, z: 6 });
    const head = text(root, 'CE QUE CET ARGENT<br>AURAIT PU <span class="a">DEVENIR</span>', { y: 1010, size: 98 });
    const head0 = text(root, 'LE VRAI COÛT', { cls: 'mono', y: 955, size: 28, style: { color: 'var(--mint)' } });
    const bb = burst(root, { cx: 540, cy: 700, n: 12, r0: 140, r1: 360 });
    const T = { s10: cue('s10'), v10: cue('v10'), s30: cue('s30'), v30: cue('v30'), l5: cue('line:l5'), poche: cue('poche'), pas: cue('pas'), l6: cue('line:l6'), dev: cue('devenir') };
    const yrs = t => kf(t, [[T.s10, 0], [T.v10 + .5, 10], [T.s30, 10], [T.v30 + .6, 30]], ease.inOutCubic);
    sfx('whoosh', t0 + .05, .6); sfx('rise', T.s10, .5, T.v10 + .5 - T.s10); sfx('rise', T.s30, .55, T.v30 + .6 - T.s30); sfx('ding', T.v30 + .65, .8);
    sfx('whoosh', T.l5 - .1, .5); sfx('pop', T.poche - .1, .6); sfx('stamp', T.pas + .05, 1); sfx('whoosh', T.l6, .6); sfx('sparkle', T.dev + .3, .7);
    return t => {
      const chartOut = T.l5 - .05, numOut = T.l6 - .1;
      A(lab, t, t0, numOut, { type: 'fade' });
      const y = yrs(t);
      odo.at(t, tt => PAID(yrs(tt)));
      const numShift = prog(t, T.l5, .6, ease.inOutCubic);
      A(odo.el, t, t0 + .05, numOut, { type: 'up', base: { y: numShift * 60 } });
      A(sub, t, t0 + .1, chartOut, { type: 'up' });
      A(P, t, t0 + .1, chartOut, { type: 'up', dist: 70 });
      for (let i = 1; i <= 30; i++) {
        const k = clamp(y - (i - 1));
        const hh = (by0 - byTop) * (1095 * i / maxV) * ease.outCubic(k);
        bars[i - 1].setAttribute('y', by0 - hh); bars[i - 1].setAttribute('height', Math.max(0, hh));
      }
      const x10 = bx0 + 9.5 * (bx1 - bx0) / 30, y10 = by0 - (by0 - byTop) * (10950 / maxV) - 22;
      tag10.setAttribute('transform', `translate(${x10},${y10})`);
      tag10.setAttribute('opacity', clamp((t - T.v10) / .3) * (1 - clamp((t - T.s30) / .3) * .6));
      A(chipPoche, t, T.poche - .15, numOut, { type: 'up', base: { y: 0 } });
      A(stamp, t, T.pas + .05, numOut, { type: 'stamp', rot: -8, rot2: -5 });
      const bs = T.l5 + .2;
      A(bills, t, bs, S5 - .12, { type: 'pop', float: 5, base: { y: lerp(120, 0, prog(t, T.l6, .8, ease.inOutCubic)), s: lerp(.8, 1.08, prog(t, T.l6, 1.2, ease.inOutCubic)) } });
      myst.set(40000 + (t * 31357) % 50000, 900000);
      A(myst.el, t, T.l6 + .1, S5 - .12, { type: 'blur' });
      A(head0, t, T.l6 + .05, S5 - .12, { type: 'up' }); A(head, t, T.l6 + .15, S5 - .12, { type: 'up', base: { s: pulse(t, T.dev + .25, .05, .45) } });
      bb(t, T.dev + .3);
    };
  });

  // =============== 5. HYPOTHÈSE ===============
  const S6 = cue('line:l8') - .3;
  scene(S5, S6, (root, t0) => {
    const lab = label(root, '03', 'ET SI ON LE PLAÇAIT ?');
    const cup = obj(root, 'cup', { cx: 290, by: 700, w: 340 });
    const coins = obj(root, 'coinstack', { cx: 790, by: 700, w: 360 });
    const ar = svg('svg', { width: 240, height: 80, viewBox: '0 0 240 80' }); Object.assign(ar.style, { position: 'absolute', left: '420px', top: '480px', overflow: 'visible' });
    const arp = svg('path', { d: 'M10 40 L210 40', stroke: 'var(--mint)', 'stroke-width': 8, 'stroke-linecap': 'round', fill: 'none', 'stroke-dasharray': '4 18' });
    const arh = svg('path', { d: 'M190 18 L222 40 L190 62', stroke: 'var(--mint)', 'stroke-width': 8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', fill: 'none' });
    ar.appendChild(arp); ar.appendChild(arh); root.appendChild(ar);
    const eq1 = text(root, '1<i class="sp"></i>095<span class="u">€</span> <span style="color:var(--muted)">÷ 12</span>', { cls: 'num', y: 760, size: 92, style: { color: 'var(--cream)' } });
    const eq2 = text(root, '91,25<span class="u">€</span><span class="u" style="color:var(--muted)">/MOIS</span>', { cls: 'num', y: 870, size: 150, color: 'var(--mint)' });
    const r5 = text(root, '<span class="chip mint" style="font-size:64px;padding:10px 26px">5 % / AN</span>', { cls: 'abs', y: 1062 });
    const r5l = text(root, 'HYPOTHÈSE · RENDEMENT MOYEN', { cls: 'mono', y: 1170, size: 22 });
    const T = { pl: cue('place'), m: cue('m91'), r: cue('r5') };
    sfx('whoosh', t0 + .1, .5); sfx('swoosh', T.pl, .6); sfx('pop', T.pl + .35, .7); sfx('pop', T.m - .1, .6); sfx('ding', T.m + .5, .6); sfx('stamp', T.r, .7);
    return t => {
      const out = S6 - .12;
      A(lab, t, t0, out, { type: 'fade' });
      A(cup, t, t0 + .05, out, { type: 'pop', float: 5, base: { s: lerp(1, .85, prog(t, T.pl, .5)), r: lerp(0, -4, prog(t, T.pl, .5)) } });
      cup.style.opacity = (+cup.style.opacity * lerp(1, .45, prog(t, T.pl + .2, .5))).toFixed(3);
      A(coins, t, T.pl + .35, out, { type: 'pop', float: 5, phase: 1 });
      const ap = prog(t, T.pl, .5);
      ar.style.opacity = ap * (1 - prog(t, out, .3)); arp.setAttribute('stroke-dashoffset', -t * 40);
      A(eq1, t, T.m - .15, out, { type: 'up' });
      A(eq2, t, T.m + .45, out, { type: 'up', base: { s: pulse(t, T.m + .9, .05, .4) } });
      A(r5, t, T.r, out, { type: 'stamp', rot: -4, rot2: -2 }); A(r5l, t, T.r + .2, out, { type: 'fade' });
    };
  });

  // =============== 6. LA COURBE ===============
  const S7 = cue('line:l11') - .3;
  scene(S6, S7, (root, t0) => {
    const lab = label(root, '04', 'LA SIMULATION', { y: 200 });
    const odo = new Odo(root, { maxDigits: 5, style: { position: 'absolute', top: '250px', left: 0, right: 0, textAlign: 'center', color: 'var(--mint)', fontSize: '150px' } });
    const sub = text(root, '', { cls: 'mono', y: 418, size: 24 });
    const P = panel(root, { x: 50, y: 488, w: 980, hgt: 690 });
    P.style.transform = 'perspective(1800px) rotateX(7deg) rotateZ(-1.2deg)';
    const W = 980, H = 690, px0 = 120, px1 = 870, py0 = 590, py1 = 70, maxV = 80000;
    const X = yr => px0 + (px1 - px0) * yr / 30, Y = v => py0 - (py0 - py1) * v / maxV;
    const s = svg('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }); s.style.overflow = 'visible'; P.appendChild(s);
    const defs = svg('defs'); defs.innerHTML = `<pattern id="hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="14" height="14" fill="rgba(46,230,160,.10)"/><line x1="0" y1="0" x2="0" y2="14" stroke="rgba(46,230,160,.45)" stroke-width="3"/></pattern>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
    s.appendChild(defs);
    for (const v of [20000, 40000, 60000, 80000]) {
      s.appendChild(svg('line', { x1: px0, x2: px1, y1: Y(v), y2: Y(v), stroke: 'rgba(226,242,234,.08)', 'stroke-width': 2 }));
      const tt = svg('text', { x: px0 - 16, y: Y(v) + 7, 'text-anchor': 'end', fill: 'rgba(226,242,234,.45)', 'font-size': 20 }); tt.textContent = fmt(v / 1000) + ' k€'; s.appendChild(tt);
    }
    s.appendChild(svg('line', { x1: px0, x2: px1, y1: py0, y2: py0, stroke: 'rgba(226,242,234,.35)', 'stroke-width': 2 }));
    for (const yr of [0, 10, 20, 30]) { const tt = svg('text', { x: X(yr), y: py0 + 42, 'text-anchor': 'middle', fill: 'rgba(226,242,234,.55)', 'font-size': 22 }); tt.textContent = yr ? yr + ' ANS' : "AUJ."; s.appendChild(tt); }
    const tt0 = svg('text', { x: px0 + 4, y: 44, fill: 'rgba(226,242,234,.5)', 'font-size': 20, 'letter-spacing': 3 }); tt0.textContent = 'SIMULATION · RENDEMENT CONSTANT'; s.appendChild(tt0);
    const area = svg('path', { fill: 'url(#hatch)', opacity: 0 }); s.appendChild(area);
    const gold = svg('path', { fill: 'none', stroke: '#F4B740', 'stroke-width': 6, 'stroke-linecap': 'round' }); s.appendChild(gold);
    const mint = svg('path', { fill: 'none', stroke: '#2EE6A0', 'stroke-width': 8, 'stroke-linecap': 'round', filter: 'url(#glow)' }); s.appendChild(mint);
    const dotG = svg('circle', { r: 9, fill: '#F4B740' }); s.appendChild(dotG);
    const dotM = svg('circle', { r: 12, fill: '#2EE6A0', filter: 'url(#glow)' }); s.appendChild(dotM);
    const lblG = svg('text', { fill: '#F4B740', 'font-size': 26, 'font-weight': 700 }); s.appendChild(lblG);
    const lblM = svg('text', { fill: '#2EE6A0', 'font-size': 30, 'font-weight': 700 }); s.appendChild(lblM);
    const lblI = svg('text', { fill: '#2EE6A0', 'font-size': 24, 'letter-spacing': 4, 'font-weight': 700, 'text-anchor': 'middle' }); lblI.textContent = 'INTÉRÊTS'; s.appendChild(lblI);
    const snow = obj(P, 'snowball', { cx: 0, by: 0, w: 200, z: 5 });
    const foot = text(root, 'SIMULATION · 5 %/AN CONSTANT · AVANT FRAIS ET IMPÔTS', { cls: 'foot', y: 1222 });
    const T = { l8: cue('line:l8'), mini: cue('mini'), a10: cue('a10'), k14: cue('k14'), l9: cue('line:l9'), int: cue('interets'), snow: cue('snow'), l10: cue('line:l10'), k76: cue('k76') };
    const yrs = t => kf(t, [[T.l8 + .1, 0], [T.mini + .3, 4], [T.a10, 4], [T.k14 + .3, 10], [T.l9 + .3, 10], [T.snow + 1.3, 20], [T.l10 + .3, 20], [T.k76 + .6, 30]], ease.inOutSine);
    sfx('whoosh', t0 + .1, .6); sfx('draw', T.l8 + .1, .45, T.mini + .2 - T.l8); sfx('draw', T.a10, .45, T.k14 + .3 - T.a10); sfx('ding', T.k14 + .1, .6);
    sfx('draw', T.l9 + .3, .45, T.snow + 1 - T.l9); sfx('pop', T.snow, .8); sfx('rise', T.l10 + .3, .6, T.k76 + .6 - T.l10 - .3); sfx('ding', T.k76 + .6, 1);
    return t => {
      const out = S7 - .12;
      const y = yrs(t);
      A(lab, t, t0, out, { type: 'fade' });
      A(odo.el, t, t0 + .1, out, { type: 'up', base: { s: pulse(t, T.k76 + .6, .07, .5) } });
      odo.at(t, tt => FV(yrs(tt)));
      sub.innerHTML = `<span style="color:var(--mint)">PLACÉ À 5 %</span>&nbsp;&nbsp;·&nbsp;&nbsp;<span style="color:var(--gold)">VERSÉ ${fmt(PAID(y) / 1095 * 1095)} €</span>`;
      A(sub, t, t0 + .2, out, { type: 'fade' });
      A(P, t, t0 + .1, out, { type: 'up', dist: 80 });
      A(foot, t, t0 + .5, out, { type: 'fade' });
      // paths
      const n = Math.max(2, Math.ceil(y * 6));
      let dm = '', dg = '', top = [], bot = [];
      for (let i = 0; i <= n; i++) {
        const yr = y * i / n; const xm = X(yr), ym = Y(FV(yr)), yg = Y(PAID(yr));
        dm += (i ? 'L' : 'M') + xm.toFixed(1) + ' ' + ym.toFixed(1); dg += (i ? 'L' : 'M') + xm.toFixed(1) + ' ' + yg.toFixed(1);
        top.push(xm.toFixed(1) + ' ' + ym.toFixed(1)); bot.unshift(xm.toFixed(1) + ' ' + yg.toFixed(1));
      }
      mint.setAttribute('d', dm); gold.setAttribute('d', dg);
      area.setAttribute('d', 'M' + top.join(' L') + ' L' + bot.join(' L') + 'Z');
      area.setAttribute('opacity', prog(t, T.int, .6));
      const hx = X(y), hm = Y(FV(y)), hg = Y(PAID(y));
      dotM.setAttribute('cx', hx); dotM.setAttribute('cy', hm); dotG.setAttribute('cx', hx); dotG.setAttribute('cy', hg);
      const show10 = clamp((t - T.k14) / .3) * (1 - clamp((t - T.l9 - .2) / .3));
      const showEnd = clamp((t - T.k76 - .5) / .3);
      lblM.setAttribute('x', hx + 22); lblM.setAttribute('y', hm + 10); lblG.setAttribute('x', hx + 18); lblG.setAttribute('y', hg + 34);
      lblM.textContent = '≈ ' + fmt(Math.round(FV(y) / 100) * 100) + ' €'; lblG.textContent = fmt(PAID(y)) + ' €';
      if (y > 25) { lblM.setAttribute('x', hx - 18); lblM.setAttribute('text-anchor', 'end'); lblM.setAttribute('y', hm - 22); lblG.setAttribute('x', hx - 18); lblG.setAttribute('text-anchor', 'end'); }
      else { lblM.setAttribute('text-anchor', 'start'); lblG.setAttribute('text-anchor', 'start'); }
      const lo = Math.max(show10, showEnd); lblM.setAttribute('opacity', lo); lblG.setAttribute('opacity', lo);
      lblI.setAttribute('x', X(Math.max(8, y * .72))); lblI.setAttribute('y', (Y(FV(y * .72)) + Y(PAID(y * .72))) / 2 + 8);
      lblI.setAttribute('opacity', prog(t, T.int + .3, .5) * clamp((y - 14) / 3));
      // snowball rides the head of the curve
      const sw = lerp(120, 240, clamp((y - 12) / 18));
      const sp = clamp((t - T.snow + .05) / .35);
      Object.assign(snow.style, { left: (hx - sw / 2) + 'px', top: (hm - sw * .9) + 'px', width: sw + 'px', height: sw + 'px' });
      snow.img.style.transform = `rotate(${y * 60}deg)`; snow.img.style.transformOrigin = '50% 55%';
      tf(snow, { s: ease.outBack(sp), o: sp * (1 - prog(t, T.k76 + .2, .4)) });
    };
  });

  // =============== 7. LA MOITIÉ ===============
  const S8 = cue('warn') - .3;
  scene(S7, S8, (root, t0) => {
    const lab = label(root, '05', 'QUI A PAYÉ ?');
    const big = text(root, '57<span class="u">%</span>', { cls: 'num', y: 300, size: 260, color: 'var(--mint)' });
    const bl = text(root, 'DE LA SOMME FINALE<br>NE VIENT PAS DE VOUS', { cls: 'head', y: 590, size: 64, style: { color: 'var(--cream)' } });
    const bar = box(root, { x: 80, y: 820, w: 920, hgt: 120 });
    const g = h('div', 'abs', '', { left: 0, top: 0, height: '120px', borderRadius: '18px 0 0 18px', background: 'var(--gold)' });
    const m = h('div', 'abs', '', { top: 0, height: '120px', borderRadius: '0 18px 18px 0', background: 'repeating-linear-gradient(45deg, #2EE6A0 0 14px, #26cf8f 14px 28px)' });
    bar.appendChild(g); bar.appendChild(m);
    const gw = 920 * 32850 / 75944;
    const lg = text(root, `<div style="color:var(--gold)">VERSÉ PAR VOUS</div><div class="num" style="font-size:52px;color:#fff;margin-top:8px">32<i class="sp"></i>850<span class="u">€</span></div>`, { cls: 'mono', x: 80, y: 965, w: 440, align: 'left', size: 22 });
    const lm = text(root, `<div style="color:var(--mint)">INTÉRÊTS</div><div class="num" style="font-size:52px;color:#fff;margin-top:8px">43<i class="sp"></i>094<span class="u">€</span></div>`, { cls: 'mono', x: 560, y: 965, w: 440, align: 'right', size: 22 });
    const T = { m: cue('moitie'), c: cue('ceint') };
    sfx('whoosh', t0 + .1, .5); sfx('rise', t0 + .4, .4, 1.2); sfx('ding', T.c, .8);
    return t => {
      const out = S8 - .12;
      A(lab, t, t0, out, { type: 'fade' });
      A(big, t, t0 + .2, out, { type: 'pop', base: { s: pulse(t, T.c, .08, .5) } });
      A(bl, t, t0 + .45, out, { type: 'up' });
      A(bar, t, t0 + .3, out, { type: 'fade' });
      const p1 = prog(t, t0 + .4, .8, ease.outQuart), p2 = prog(t, t0 + 1.0, 1.0, ease.outQuart);
      g.style.width = (gw * p1) + 'px'; m.style.left = gw + 'px'; m.style.width = ((920 - gw) * p2) + 'px';
      m.style.boxShadow = `0 0 ${(40 * prog(t, T.c, .4) * (1 - prog(t, T.c + .6, .6))).toFixed(1)}px rgba(46,230,160,.9)`;
      A(lg, t, t0 + .8, out, { type: 'up' }); A(lm, t, t0 + 1.4, out, { type: 'up' });
    };
  });

  // =============== 8. ATTENTION ===============
  const S9 = cue('line:l13') - .3;
  scene(S8, S9, (root, t0) => {
    const st = text(root, '<span class="chip red" style="font-size:60px;padding:12px 26px">⚠<i class="sp"></i>SIMULATION</span>', { cls: 'abs', y: 250 });
    const rows = [
      ['w1', 'RENDEMENT CONSTANT', 'EN VRAI, ÇA MONTE ET ÇA BAISSE', 'zig'],
      ['w2', 'AVANT FRAIS ET IMPÔTS', 'LE RÉSULTAT NET SERA PLUS BAS', 'minus'],
      ['w3', 'LE CAFÉ AUSSI AUGMENTE', 'INFLATION : 3 € AUJOURD’HUI ≠ 3 € DEMAIN', 'up'],
    ].map(([c, a, b, ic], i) => {
      const y = 450 + i * 230;
      const r = box(root, { x: 70, y, w: 940, hgt: 200 });
      r.appendChild(h('div', 'panel', '', { inset: 0, borderRadius: '26px' }));
      const icon = svg('svg', { width: 110, height: 110, viewBox: '0 0 110 110' }); Object.assign(icon.style, { position: 'absolute', left: '36px', top: '45px' });
      icon.innerHTML = `<circle cx="55" cy="55" r="52" fill="rgba(255,90,78,.14)"/>` + (ic === 'zig' ? `<path d="M22 70 L42 48 L56 62 L72 36 L88 52" fill="none" stroke="#FF5A4E" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>` : ic === 'minus' ? `<path d="M30 55 L80 55" stroke="#FF5A4E" stroke-width="9" stroke-linecap="round"/>` : `<path d="M55 82 L55 30 M35 48 L55 28 L75 48" fill="none" stroke="#FF5A4E" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`);
      r.appendChild(icon);
      r.appendChild(h('div', 'head abs', a, { left: '176px', top: '52px', fontSize: '54px', width: '740px' }));
      r.appendChild(h('div', 'mono abs', b, { left: '178px', top: '118px', fontSize: '22px', width: '740px' }));
      return { r, c };
    });
    sfx('stamp', cue('warn') + .05, .9); rows.forEach(({ c }) => sfx('pop', cue(c), .6));
    return t => {
      const out = S9 - .12;
      A(st, t, cue('warn'), out, { type: 'stamp', rot: -3, rot2: -2 });
      rows.forEach(({ r, c }) => A(r, t, cue(c) - .05, out, { type: 'left' }));
    };
  });

  // =============== 9. FAUT-IL ARRÊTER ? ===============
  const S10 = cue('line:l14') - .3;
  scene(S9, S10, (root, t0) => {
    const head = text(root, 'FAUT-IL ARRÊTER<br>LE CAFÉ ?', { y: 250, size: 104 });
    const cup = obj(root, 'cup', { cx: 540, by: 1030, w: 470 });
    const stm = steam(cup, { cx: .47, top: .17, scale: .85 });
    const non = text(root, 'NON.', { cls: 'head', x: 610, y: 560, w: 420, align: 'left', size: 190, color: 'var(--mint)', z: 5 });
    const c1 = text(root, '<span class="chip ghost" style="font-size:40px">✓ VOUS LE VOYEZ</span>', { cls: 'abs', y: 1075 });
    const c2 = text(root, '<span class="chip mint" style="font-size:40px">✓ VOUS LE CHOISISSEZ</span>', { cls: 'abs', y: 1150 });
    const bb = burst(root, { cx: 760, cy: 610, n: 10, r0: 60, r1: 220 });
    sfx('whoosh', t0 + .05, .5); sfx('stamp', cue('non'), 1); sfx('pop', cue('voit'), .6); sfx('pop', cue('choisit'), .7);
    return t => {
      const out = S10 - .12;
      A(head, t, t0 + .05, out, { type: 'up' });
      A(cup, t, t0 + .1, out, { type: 'pop', float: 6 }); stm(t);
      A(non, t, cue('non') - .02, out, { type: 'stamp', rot: -10, rot2: -7 }); bb(t, cue('non'));
      A(c1, t, cue('voit'), out, { type: 'up' }); A(c2, t, cue('choisit'), out, { type: 'up' });
    };
  });

  // =============== 10-12. DÉPENSES INVISIBLES -> 25 000 € -> TRI ===============
  const S13 = cue('cta') - .35;
  scene(S10, S13, (root, t0) => {
    const T = { l14: cue('line:l14'), inv: cue('invis'), s1: cue('sub1'), s2: cue('sub2'), s3: cue('sub3'), x3: cue('x3'), pl: cue('plac'), k25: cue('k25'), pls: cue('plaisir'), tri: cue('tri'), garde: cue('garde') };
    const lab = label(root, '06', 'LE VRAI PIÈGE');
    const head = text(root, 'LES DÉPENSES<br><span class="a" id="inv">INVISIBLES</span>', { y: 290, size: 112 });
    const items = [['sub1', 'ABONNEMENT OUBLIÉ', 'play'], ['sub2', 'APPLI JAMAIS OUVERTE', 'grid'], ['sub3', 'OPTION DU FORFAIT', 'bars']];
    const list = box(root, { x: 70, y: 560, w: 940, hgt: 600 });
    const rows = items.map(([c, name, ic], i) => {
      const r = box(list, { x: 0, y: i * 150, w: 940, hgt: 132 });
      const bg = h('div', 'panel', '', { inset: 0, borderRadius: '24px' }); r.appendChild(bg);
      const icon = svg('svg', { width: 76, height: 76, viewBox: '0 0 76 76' }); Object.assign(icon.style, { position: 'absolute', left: '28px', top: '28px' });
      icon.innerHTML = `<rect width="76" height="76" rx="20" fill="rgba(243,236,223,.12)"/>` + (ic === 'play' ? `<path d="M30 24 L54 38 L30 52Z" fill="#F3ECDF"/>` : ic === 'grid' ? `<g fill="#F3ECDF"><rect x="20" y="20" width="15" height="15" rx="4"/><rect x="41" y="20" width="15" height="15" rx="4"/><rect x="20" y="41" width="15" height="15" rx="4"/><rect x="41" y="41" width="15" height="15" rx="4"/></g>` : `<g fill="#F3ECDF"><rect x="18" y="44" width="9" height="12" rx="2"/><rect x="31" y="36" width="9" height="20" rx="2"/><rect x="44" y="28" width="9" height="28" rx="2"/><rect x="57" y="20" width="0" height="0"/></g>`);
      r.appendChild(icon);
      const nm = h('div', 'head abs', name, { left: '128px', top: '30px', fontSize: '44px', width: '520px', textAlign: 'left' }); r.appendChild(nm);
      const pr = h('div', 'mono abs', '10 € / MOIS', { left: '130px', top: '84px', fontSize: '22px' }); r.appendChild(pr);
      const tg = toggle(r, { x: 812, y: 39, on: true });
      const strike = h('div', 'abs', '', { left: '124px', top: '56px', height: '5px', background: 'var(--red)', borderRadius: '3px', width: '0px' }); r.appendChild(strike);
      return { r, c, nm, tg, strike, bg };
    });
    // coffee row kept at the end
    const keep = box(list, { x: 0, y: 450, w: 940, hgt: 132 });
    keep.appendChild(h('div', 'panel', '', { inset: 0, borderRadius: '24px', boxShadow: 'inset 0 0 0 2.5px var(--mint), 0 30px 70px rgba(0,0,0,.45)' }));
    const kc = obj(keep, 'cup', { cx: 66, by: 122, w: 120 });
    keep.appendChild(h('div', 'head abs', 'VOTRE CAFÉ DU MATIN', { left: '128px', top: '30px', fontSize: '44px', width: '600px', textAlign: 'left' }));
    keep.appendChild(h('div', 'mono abs', '<span style="color:var(--mint)">♥ GARDÉ</span>', { left: '130px', top: '84px', fontSize: '22px' }));
    const ktg = toggle(keep, { x: 812, y: 39, on: true });
    // equation + 25 000
    const eq = text(root, '3 × 10<span class="u">€</span> <span style="color:var(--muted)">=</span> 30<span class="u">€</span><span class="u" style="color:var(--muted)">/MOIS</span>', { cls: 'num', y: 300, size: 104, style: { color: 'var(--cream)' } });
    const eqs = text(root, 'PLACÉS 30 ANS À 5 %/AN', { cls: 'mono', y: 440, size: 26 });
    const odo = new Odo(root, { maxDigits: 5, style: { position: 'absolute', top: '560px', left: 0, right: 0, textAlign: 'center', color: 'var(--mint)', fontSize: '200px' } });
    const coins = obj(root, 'coinpile', { cx: 540, by: 1160, w: 470 });
    const sans = text(root, '<span class="chip red" style="font-size:44px">SANS MÊME LE CAFÉ</span>', { cls: 'abs', y: 830, z: 6 });
    const head3 = text(root, 'FAITES LE TRI<br><span class="a">1 FOIS PAR AN</span>', { y: 290, size: 108 });
    const FV30 = 30 * (Math.pow(1 + R, 360) - 1) / R;
    const toggles = [T.tri + .25, T.tri + .65, T.tri + 1.05];
    sfx('whoosh', t0 + .05, .5); [T.s1, T.s2, T.s3].forEach(c => sfx('pop', c, .6));
    sfx('whoosh', T.x3 - .2, .6); sfx('pop', T.x3 + .05, .6); sfx('rise', T.k25 - .4, .55, 1.4); sfx('ding', T.k25 + 1.0, .9); sfx('stamp', T.pls, .8);
    sfx('whoosh', T.tri - .25, .6); toggles.forEach(tt => sfx('click', tt, .9)); sfx('sparkle', T.garde + .2, .7);
    return t => {
      const listOut = T.x3 - .2, listBack = T.tri - .25;
      A(lab, t, t0, listOut, { type: 'fade' });
      A(head, t, t0 + .05, listOut, { type: 'up' });
      const inv = head.querySelector('#inv');
      const ip = prog(t, T.inv, .3);
      inv.style.opacity = lerp(1, .22 + .1 * Math.sin(t * 9), ip * (1 - prog(t, T.inv + 1.1, .4)));
      // list visible in two windows: [l14 .. x3] and [tri .. end]
      const vis1 = anim(t, t0 + .1, listOut, { type: 'up' });
      const vis2 = anim(t, listBack, Infinity, { type: 'up' });
      const v = t < listBack ? vis1 : vis2;
      tf(list, { ...v, y: v.y + (t >= listBack ? lerp(0, -40, prog(t, listBack, .5)) : 0) });
      rows.forEach(({ r, c, tg, strike, nm }, i) => {
        if (t < listBack) A(r, t, cue(c) - .05, Infinity, { type: 'left' });
        else tf(r, {});
        const off = prog(t, toggles[i], .25, ease.inOutCubic);
        tg.set(1 - off);
        strike.style.width = (prog(t, toggles[i] + .1, .35) * 470) + 'px';
        nm.style.opacity = lerp(1, .45, off);
      });
      tf(keep, { ...anim(t, T.garde - .3, Infinity, { type: 'up' }) });
      kc.style.transform = `scale(${pulse(t, T.garde + .2, .12, .5)})`;
      // equation part
      const eqOut = listBack - .25;
      A(eq, t, T.x3 + .05, eqOut, { type: 'up' }); A(eqs, t, T.pl, eqOut, { type: 'fade' });
      A(odo.el, t, T.k25 - .45, eqOut, { type: 'up', base: { s: pulse(t, T.k25 + 1.0, .06, .45) } });
      odo.at(t, tt => count(tt, T.k25 - .4, 1.4, 0, FV30, ease.outQuart));
      A(coins, t, T.k25 - .2, eqOut, { type: 'pop', float: 5 });
      A(sans, t, T.pls, eqOut, { type: 'stamp', rot: -6, rot2: -4 });
      A(head3, t, listBack, Infinity, { type: 'up' });
      if (t > S13 - .12) { const q = prog(t, S13 - .12, .3); for (const el of [head3, list]) el.style.opacity = (+el.style.opacity * (1 - q)).toFixed(3); }
    };
  });

  // =============== 13. CTA ===============
  scene(S13, TL.duration + 1, (root, t0) => {
    const cup = obj(root, 'cup', { cx: 540, by: 900, w: 500 });
    const stm = steam(cup, { cx: .47, top: .17, scale: .95 });
    const head = text(root, 'ET VOUS, C’EST QUOI<br><span class="a">VOTRE CAFÉ</span> ?', { y: 960, size: 100 });
    const sub = text(root, 'RÉPONDEZ EN COMMENTAIRE ↓', { cls: 'mono', y: 1185, size: 24, style: { color: 'var(--cream)' } });
    const top = text(root, 'LE VRAI PRIX D’UN CAFÉ', { cls: 'mono', y: 228, size: 26 });
    sfx('whoosh', t0 + .05, .6); sfx('pop', t0 + .2, .7);
    return t => {
      A(top, t, t0, Infinity, { type: 'fade' });
      A(cup, t, t0 + .1, Infinity, { type: 'pop', float: 6 }); stm(t);
      A(head, t, t0 + .25, Infinity, { type: 'up' });
      A(sub, t, t0 + .9, Infinity, { type: 'fade' });
    };
  });
});
