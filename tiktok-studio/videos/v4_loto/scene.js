import { boot, scene, cue, h, svg, tf, A, anim, clamp, lerp, ease, prog, Odo, count, fmt, sfx, TL } from '../../lib/engine.js';
import { box, text, obj, label, panel, burst, pulse } from '../../lib/kit.js';

const C = n => cue(n);
const MINT = '#2EE6A0', GOLD = '#F4B740', RED = '#FF5A4E';
const R = .05 / 12, WK = 2.2 * 52 / 12;
const FV = y => WK * (Math.pow(1 + R, y * 12) - 1) / R;
const PAID = y => 114.4 * y;

// lottery ball sprite with a number on its white disc
function ball(parent, color, num, { cx, by, w, z = 3 }) {
  const g = obj(parent, 'ball_' + color, { cx, by, w, z });
  const n = h('div', 'abs', String(num), { left: 0, right: 0, top: (w * .385) + 'px', textAlign: 'center', fontFamily: 'var(--fHead)', fontWeight: 800, fontVariationSettings: "'wdth' 90", fontSize: (w * .17) + 'px', color: '#07140F', lineHeight: 1 });
  g.appendChild(n); return g;
}
// generic grid ticket (no brand)
function ticket(parent, { x, y, s = 1, rot = -6 }) {
  const t = h('div', 'abs', '', { left: x + 'px', top: y + 'px', width: '500px', height: '640px', borderRadius: '26px', background: 'var(--cream)', boxShadow: '0 40px 80px rgba(0,0,0,.5)', transformOrigin: '50% 50%' });
  t.appendChild(h('div', 'abs', 'GRILLE', { left: '34px', top: '26px', fontFamily: 'var(--fHead)', fontWeight: 900, fontVariationSettings: "'wdth' 75", fontSize: '46px', color: '#07140F' }));
  t.appendChild(h('div', 'mono abs', '5 NUMÉROS + 1 N° CHANCE', { left: '36px', top: '84px', fontSize: '16px', color: 'rgba(7,20,15,.55)' }));
  const picks = new Set([7, 19, 23, 34, 41]);
  for (let i = 1; i <= 49; i++) {
    const c = (i - 1) % 7, r = Math.floor((i - 1) / 7);
    const cell = h('div', 'abs', String(i), { left: (34 + c * 62) + 'px', top: (122 + r * 56) + 'px', width: '54px', height: '48px', borderRadius: '10px', textAlign: 'center', lineHeight: '48px', fontFamily: 'var(--fMono)', fontSize: '18px', color: 'rgba(7,20,15,.7)', background: picks.has(i) ? 'var(--mint)' : 'rgba(7,20,15,.07)', fontWeight: picks.has(i) ? 700 : 400 });
    t.appendChild(cell);
  }
  for (let i = 1; i <= 10; i++) {
    const cell = h('div', 'abs', String(i), { left: (34 + (i - 1) * 43.5) + 'px', top: '532px', width: '38px', height: '38px', borderRadius: '50%', textAlign: 'center', lineHeight: '38px', fontFamily: 'var(--fMono)', fontSize: '15px', color: 'rgba(7,20,15,.7)', background: i === 3 ? 'var(--gold)' : 'rgba(7,20,15,.07)' });
    t.appendChild(cell);
  }
  t.appendChild(h('div', 'mono abs', 'N° CHANCE', { left: '36px', top: '590px', fontSize: '15px', color: 'rgba(7,20,15,.55)' }));
  parent.appendChild(t); t.base = { s, r: rot }; return t;
}

boot(async () => {
  const SB = C('line:l2') - .3, SC = C('line:l5') - .3, SD = C('line:l8') - .3, SE = C('line:l9') - .3, SF = C('warn') - .3,
    SG = C('plaisir') - .3, SH = C('temps') - .3, SI = C('cta') - .35;

  // ================= A. HOOK =================
  scene(0, SB, (root) => {
    const top = text(root, 'UN TICKET PAR SEMAINE', { cls: 'mono', y: 228, size: 28 });
    const tk = ticket(root, { x: 290, y: 330, s: .92, rot: -7 });
    const balls = [['gold', 7, 170, 560, 200], ['mint', 23, 900, 470, 190], ['coral', 41, 880, 930, 170], ['cream', 19, 200, 1000, 160]].map(([c, n, x, y, w]) => ball(root, c, n, { cx: x, by: y, w, z: 4 }));
    const h1 = text(root, 'TOUTE VOTRE <span class="a">VIE</span>,<br>ÇA COÛTE <span class="g">COMBIEN</span> ?', { y: 1040, size: 104 });
    sfx('pop', C('ticket'), .6); sfx('pop', C('vie'), .6); sfx('whoosh', C('combien') - .1, .5);
    return t => {
      const out = SB - .12;
      A(top, t, -1, out, { type: 'fade' });
      A(tk, t, -1, out, { type: 'pop', float: 5, base: { s: tk.base.s * pulse(t, C('ticket'), .05, .4), r: tk.base.r + Math.sin(t * .9) * 1.5 } });
      balls.forEach((b, i) => A(b, t, -1, out, { type: 'pop', float: 10, phase: i * 1.7, base: { r: Math.sin(t * .7 + i) * 8 } }));
      A(h1, t, -1, out, { type: 'up', base: { s: pulse(t, C('combien'), .05, .45) } });
    };
  });

  // ================= B. LE COÛT =================
  scene(SB, SC, (root, t0) => {
    const lab = label(root, '01', 'LE COÛT');
    const tk = ticket(root, { x: 60, y: 300, s: .5, rot: -8 });
    tk.style.transformOrigin = '0 0';
    const price = text(root, '2,20<span class="u">€</span>', { cls: 'num', x: 420, y: 330, w: 620, align: 'left', size: 150, color: 'var(--gold)' });
    const pl = text(root, 'LA GRILLE', { cls: 'mono', x: 426, y: 500, w: 600, align: 'left', size: 24, style: { color: 'var(--cream)' } });
    const yr = text(root, '× 52 <span style="color:var(--muted)">=</span> 114<span class="u">€</span><span class="u" style="color:var(--muted)">/AN</span>', { cls: 'num', y: 680, size: 96, style: { color: 'var(--cream)' } });
    const br = text(root, '<span class="chip ghost" style="font-size:40px">UNE BROUTILLE ?</span>', { cls: 'abs', y: 810 });
    const y40 = text(root, '× 40 ANS', { cls: 'mono', y: 690, size: 30, style: { color: 'var(--gold)' } });
    const odo = new Odo(root, { maxDigits: 4, style: { position: 'absolute', top: '740px', left: 0, right: 0, textAlign: 'center', fontSize: '200px', color: 'var(--gold)' } });
    const ol = text(root, 'DÉPENSÉS EN GRILLES', { cls: 'mono', y: 960, size: 26, style: { color: 'var(--cream)' } });
    const coins = obj(root, 'coinpile', { cx: 540, by: 1230, w: 300 });
    sfx('whoosh', t0 + .05, .5); sfx('pop', C('g220'), .8); sfx('pop', C('an'), .7); sfx('stamp', C('brout'), .7); sfx('whoosh', C('y40') - .1, .5); sfx('rise', C('tot') - .3, .5, 1.2); sfx('ding', C('tot') + .9, .9);
    return t => {
      const out = SC - .12, mid = C('y40') - .1;
      A(lab, t, t0, out, { type: 'fade' });
      A(tk, t, t0 + .05, out, { type: 'pop', base: { s: .5, r: -8 } });
      A(price, t, C('g220') - .05, out, { type: 'left', base: { s: pulse(t, C('g220') + .1, .05, .4) } }); A(pl, t, C('g220') + .2, out, { type: 'fade' });
      A(yr, t, C('an') - .05, mid, { type: 'up' }); A(br, t, C('brout'), mid, { type: 'stamp', rot: -5, rot2: -3 });
      A(y40, t, C('y40'), out, { type: 'up' });
      A(odo.el, t, C('tot') - .35, out, { type: 'up', base: { s: pulse(t, C('tot') + .9, .06, .45) } });
      odo.at(t, tt => count(tt, C('tot') - .3, 1.2, 0, 4576, ease.outQuart));
      A(ol, t, C('tot') + .3, out, { type: 'fade' });
      A(coins, t, C('tot') + .1, out, { type: 'pop', float: 4 });
    };
  });

  // ================= C. LES CHANCES =================
  scene(SC, SD, (root, t0) => {
    const lab = label(root, '02', 'VOS CHANCES');
    const balls = [['cream', 7], ['gold', 19], ['mint', 23], ['coral', 34], ['cream', 41]].map(([c, n], i) => ball(root, c, n, { cx: 200 + i * 170, by: 460, w: 150 }));
    const o1 = text(root, '1 CHANCE SUR', { cls: 'mono', y: 520, size: 28, style: { color: 'var(--cream)' } });
    const o2 = text(root, '19<i class="sp"></i>068<i class="sp"></i>840', { cls: 'num', y: 565, size: 140 });
    const o3 = text(root, 'À CHAQUE TIRAGE', { cls: 'mono', y: 715, size: 24 });
    const g1 = text(root, '2<i class="sp"></i>080 <span class="u" style="color:var(--cream)">GRILLES EN 40 ANS</span>', { cls: 'num', y: 800, size: 92, color: 'var(--gold)' });
    const r1 = text(root, 'AU MOINS UNE FOIS LE GROS LOT :', { cls: 'mono', y: 955, size: 24, style: { color: 'var(--cream)' } });
    const r2 = text(root, '≈ 1 SUR 9<i class="sp"></i>000', { cls: 'head', y: 995, size: 150, color: 'var(--mint)' });
    sfx('whoosh', t0 + .05, .5); [0, 1, 2, 3, 4].forEach(i => sfx('pop', C('jack') + .1 + i * .12, .45)); sfx('stamp', C('odds') + .1, .8); sfx('pop', C('grids'), .7); sfx('ding', C('n9k') + .4, .9);
    return t => {
      const out = SD - .12;
      A(lab, t, t0, out, { type: 'fade' });
      balls.forEach((b, i) => A(b, t, C('jack') + .1 + i * .12, out, { type: 'pop', float: 6, phase: i, base: { r: Math.sin(t * 1.3 + i) * 10 } }));
      A(o1, t, C('odds') - .05, out, { type: 'fade' }); A(o2, t, C('odds') + .05, out, { type: 'blur', base: { s: pulse(t, C('odds') + .4, .05, .4) } }); A(o3, t, C('odds') + .4, out, { type: 'fade' });
      A(g1, t, C('grids') - .05, out, { type: 'up' });
      A(r1, t, C('chance'), out, { type: 'fade' }); A(r2, t, C('n9k') + .3, out, { type: 'stamp', rot: -3, rot2: -1 });
    };
  });

  // ================= D. LA FOULE =================
  scene(SD, SE, (root, t0) => {
    const head = text(root, '9<i class="sp"></i>000 JOUEURS COMME VOUS', { cls: 'mono', y: 250, size: 30, style: { color: 'var(--cream)' } });
    const cv = h('canvas', 'abs', '', { left: '90px', top: '320px', width: '900px', height: '810px' }); cv.width = 900; cv.height = 810; root.appendChild(cv);
    const g = cv.getContext('2d');
    const COLS = 100, ROWS = 90, CS = 9, WIN = 4521;
    const winX = (WIN % COLS) * CS + 4, winY = Math.floor(WIN / COLS) * CS + 4;
    const ring = svg('svg', { width: 900, height: 810, viewBox: '0 0 900 810' }); Object.assign(ring.style, { position: 'absolute', left: '90px', top: '320px', overflow: 'visible' });
    const rc = svg('circle', { cx: winX, cy: winY, r: 44, fill: 'none', stroke: GOLD, 'stroke-width': 7 }); ring.appendChild(rc); root.appendChild(ring);
    const win = text(root, '<span class="chip gold" style="font-size:38px">1 GAGNANT</span>', { cls: 'abs', x: winX + 90 - 150, y: 320 + winY - 120, w: 300, z: 6 });
    const lose = text(root, '8<i class="sp"></i>999 ONT PAYÉ <span class="r">4<i class="sp"></i>576 €</span> CHACUN', { cls: 'head', y: 1150, size: 58 });
    sfx('whoosh', t0 + .05, .5); sfx('fill', C('crowd') + .1, .4, 1.6); sfx('ding', C('one') + .05, 1); sfx('sparkle', C('one') + .2, .7); sfx('stamp', C('others') + .3, .7);
    let lastKey = '';
    return t => {
      const out = SE - .12;
      A(head, t, C('crowd') - .05, out, { type: 'fade' });
      const appear = clamp((t - C('crowd') - .1) / 1.6), lose_p = prog(t, C('others'), .9, ease.linear), win_p = prog(t, C('one'), .4);
      const o = 1 - prog(t, out, .3);
      cv.style.opacity = o; ring.style.opacity = o * win_p * (1 - lose_p * .2);
      const key = [appear, lose_p, win_p].map(v => v.toFixed(3)).join('|');
      if (key !== lastKey) {
        lastKey = key; g.clearRect(0, 0, 900, 810);
        const n = Math.floor(appear * COLS * ROWS);
        for (let i = 0; i < n; i++) {
          const x = (i % COLS) * CS, y = Math.floor(i / COLS) * CS;
          if (i === WIN) continue;
          const red = (i / (COLS * ROWS)) < lose_p;
          g.fillStyle = red ? 'rgba(255,90,78,.5)' : `rgba(226,242,234,${(.32 - .14 * win_p).toFixed(3)})`;
          g.fillRect(x + 1, y + 1, 7, 7);
        }
        if (n > WIN) { g.save(); if (win_p > 0) { g.shadowColor = GOLD; g.shadowBlur = 24 * win_p; } g.fillStyle = win_p > 0 ? GOLD : 'rgba(226,242,234,.32)'; const s = 7 + win_p * 17; g.fillRect(winX - s / 2, winY - s / 2, s, s); g.restore(); }
      }
      rc.setAttribute('r', 44 + 12 * Math.sin(t * 4) * win_p);
      A(win, t, C('one') + .1, out, { type: 'pop' });
      A(lose, t, C('others') + .3, out, { type: 'up' });
    };
  });

  // ================= E. ET SI ON PLAÇAIT ? =================
  scene(SE, SF, (root, t0) => {
    const lab = label(root, '03', 'ET SI ON PLAÇAIT ?', { y: 200 });
    const odo = new Odo(root, { maxDigits: 5, style: { position: 'absolute', top: '250px', left: 0, right: 0, textAlign: 'center', color: 'var(--mint)', fontSize: '150px' } });
    const sub = text(root, '', { cls: 'mono', y: 418, size: 24 });
    const Pn = panel(root, { x: 50, y: 488, w: 980, hgt: 690 });
    Pn.style.transform = 'perspective(1800px) rotateX(7deg) rotateZ(-1.2deg)';
    const W = 980, H = 690, px0 = 120, px1 = 870, py0 = 590, py1 = 70, maxV = 16000;
    const X = y => px0 + (px1 - px0) * y / 40, Y = v => py0 - (py0 - py1) * v / maxV;
    const s = svg('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }); s.style.overflow = 'visible'; Pn.appendChild(s);
    s.appendChild(svg('defs')).innerHTML = `<filter id="gl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
    for (const v of [4000, 8000, 12000, 16000]) {
      s.appendChild(svg('line', { x1: px0, x2: px1, y1: Y(v), y2: Y(v), stroke: 'rgba(226,242,234,.08)', 'stroke-width': 2 }));
      const tt = svg('text', { x: px0 - 16, y: Y(v) + 7, 'text-anchor': 'end', fill: 'rgba(226,242,234,.45)', 'font-size': 20 }); tt.textContent = (v / 1000) + ' k€'; s.appendChild(tt);
    }
    s.appendChild(svg('line', { x1: px0, x2: px1, y1: py0, y2: py0, stroke: 'rgba(226,242,234,.35)', 'stroke-width': 2 }));
    for (const y of [0, 10, 20, 30, 40]) { const tt = svg('text', { x: X(y), y: py0 + 42, 'text-anchor': 'middle', fill: 'rgba(226,242,234,.55)', 'font-size': 22 }); tt.textContent = y ? y + (y === 40 ? ' ANS' : '') : 'AUJ.'; s.appendChild(tt); }
    const ttl = svg('text', { x: px0, y: 44, fill: 'rgba(226,242,234,.5)', 'font-size': 20, 'letter-spacing': 3 }); ttl.textContent = '2,20 € PAR SEMAINE · 40 ANS'; s.appendChild(ttl);
    const pg = svg('path', { fill: 'none', stroke: GOLD, 'stroke-width': 6, 'stroke-linecap': 'round' }); s.appendChild(pg);
    const pm = svg('path', { fill: 'none', stroke: MINT, 'stroke-width': 8, 'stroke-linecap': 'round', filter: 'url(#gl)' }); s.appendChild(pm);
    const dm = svg('circle', { r: 12, fill: MINT }), dg = svg('circle', { r: 9, fill: GOLD }); s.appendChild(dm); s.appendChild(dg);
    const lm = svg('text', { fill: MINT, 'font-size': 28, 'font-weight': 700, 'text-anchor': 'end' }), lg = svg('text', { fill: GOLD, 'font-size': 24, 'font-weight': 700, 'text-anchor': 'end' }); s.appendChild(lm); s.appendChild(lg);
    const x3 = text(root, '<span class="chip mint" style="font-size:56px;padding:10px 24px">× 3,2</span>', { cls: 'abs', x: 640, y: 560, w: 360, z: 6 });
    const foot = text(root, 'SIMULATION · 5 %/AN CONSTANT · AVANT FRAIS ET IMPÔTS', { cls: 'foot', y: 1222 });
    const yrs = tt => lerp(0, 40, ease.inOutSine(clamp((tt - C('inv') - .3) / (C('fv') + .8 - C('inv') - .3))));
    sfx('whoosh', t0 + .05, .5); sfx('draw', C('inv') + .3, .45, C('fv') + .5 - C('inv')); sfx('ding', C('fv') + .8, 1); sfx('stamp', C('x3') + .1, .9);
    return t => {
      const out = SF - .12, y = yrs(t);
      A(lab, t, t0, out, { type: 'fade' }); A(Pn, t, t0 + .1, out, { type: 'up', dist: 80 }); A(foot, t, t0 + .4, out, { type: 'fade' });
      A(odo.el, t, t0 + .1, out, { type: 'up', base: { s: pulse(t, C('fv') + .8, .07, .5) } }); odo.at(t, tt => FV(yrs(tt)));
      sub.innerHTML = `<span style="color:var(--mint)">PLACÉ À 5 %</span>&nbsp;&nbsp;·&nbsp;&nbsp;<span style="color:var(--gold)">MISÉ ${fmt(PAID(y))} €</span>`;
      A(sub, t, t0 + .2, out, { type: 'fade' });
      let a = '', b = ''; const n = 120;
      for (let i = 0; i <= n; i++) { const yi = y * i / n; a += (i ? 'L' : 'M') + X(yi).toFixed(1) + ' ' + Y(FV(yi)).toFixed(1); b += (i ? 'L' : 'M') + X(yi).toFixed(1) + ' ' + Y(PAID(yi)).toFixed(1); }
      pm.setAttribute('d', a); pg.setAttribute('d', b);
      dm.setAttribute('cx', X(y)); dm.setAttribute('cy', Y(FV(y))); dg.setAttribute('cx', X(y)); dg.setAttribute('cy', Y(PAID(y)));
      const lo = prog(t, C('fv') + .7, .4);
      lm.setAttribute('x', X(y) - 20); lm.setAttribute('y', Y(FV(y)) - 20); lm.textContent = '≈ 14 500 €'; lm.setAttribute('opacity', lo);
      lg.setAttribute('x', X(y) - 20); lg.setAttribute('y', Y(PAID(y)) + 40); lg.textContent = '4 576 € MISÉS'; lg.setAttribute('opacity', lo);
      A(x3, t, C('x3') + .1, out, { type: 'stamp', rot: -6, rot2: -3 });
    };
  });

  // ================= F. ATTENTION =================
  scene(SF, SG, (root, t0) => {
    const st = text(root, '<span class="chip red" style="font-size:60px;padding:12px 26px">⚠<i class="sp"></i>SIMULATION</span>', { cls: 'abs', y: 420 });
    const r = box(root, { x: 70, y: 640, w: 940, hgt: 260 });
    r.appendChild(h('div', 'panel', '', { inset: 0, borderRadius: '26px' }));
    const icon = svg('svg', { width: 130, height: 130, viewBox: '0 0 110 110' }); Object.assign(icon.style, { position: 'absolute', left: '40px', top: '65px' });
    icon.innerHTML = `<circle cx="55" cy="55" r="52" fill="rgba(255,90,78,.14)"/><path d="M22 70 L42 48 L56 62 L72 36 L88 52" fill="none" stroke="#FF5A4E" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`;
    r.appendChild(icon);
    r.appendChild(h('div', 'head abs', 'UN RENDEMENT DE 5 %<br>N’EST JAMAIS GARANTI', { left: '200px', top: '70px', fontSize: '60px', width: '720px' }));
    sfx('stamp', C('warn') + .05, .9); sfx('pop', C('w1'), .6);
    return t => {
      const out = SG - .12;
      A(st, t, C('warn'), out, { type: 'stamp', rot: -3, rot2: -2 }); A(r, t, C('w1') - .05, out, { type: 'left' });
    };
  });

  // ================= G. PLAISIR / PLAN =================
  scene(SG, SH, (root, t0) => {
    const rows = [['plaisir', 'JOUER POUR LE PLAISIR', MINT, '<path d="M28 56 L46 74 L82 36" fill="none" stroke="#2EE6A0" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>', 'rgba(46,230,160,.15)'],
      ['plan', 'UN PLAN POUR DEVENIR RICHE', RED, '<path d="M34 34 L76 76 M76 34 L34 76" stroke="#FF5A4E" stroke-width="10" stroke-linecap="round"/>', 'rgba(255,90,78,.15)']].map(([c, txt, col, ic, bg], i) => {
      const r = box(root, { x: 70, y: 470 + i * 290, w: 940, hgt: 240 });
      r.appendChild(h('div', 'panel', '', { inset: 0, borderRadius: '26px' }));
      const sv = svg('svg', { width: 140, height: 140, viewBox: '0 0 110 110' }); Object.assign(sv.style, { position: 'absolute', left: '40px', top: '50px' });
      sv.innerHTML = `<circle cx="55" cy="55" r="52" fill="${bg}"/>` + ic; r.appendChild(sv);
      r.appendChild(h('div', 'head abs', txt, { left: '210px', top: '82px', fontSize: '62px', width: '700px', color: i ? '#fff' : '#fff' }));
      return { r, c };
    });
    const strike = h('div', 'abs', '', { left: '280px', top: '882px', height: '10px', width: '0px', borderRadius: '5px', background: 'var(--red)', zIndex: 5 }); root.appendChild(strike);
    sfx('whoosh', t0 + .05, .5); sfx('pop', C('plaisir') + .1, .7); sfx('stamp', C('plan') + .2, .8);
    return t => {
      const out = SH - .12;
      rows.forEach(({ r, c }) => A(r, t, C(c), out, { type: 'left' }));
      strike.style.width = (prog(t, C('plan') + 1.3, .5) * 660) + 'px'; strike.style.opacity = 1 - prog(t, out, .3);
    };
  });

  // ================= H. LE TEMPS =================
  scene(SH, SI, (root, t0) => {
    const hg = obj(root, 'hourglass', { cx: 540, by: 900, w: 520 });
    const head = text(root, 'LE VRAI GROS LOT,<br>C’EST LE <span class="a">TEMPS</span>', { y: 960, size: 104 });
    const bb = burst(root, { cx: 540, cy: 640, n: 12, r0: 160, r1: 380, color: 'var(--gold)' });
    sfx('whoosh', t0 + .05, .5); sfx('sparkle', C('temps') + .6, .8);
    return t => {
      const out = SI - .12;
      A(hg, t, t0 + .1, out, { type: 'pop', float: 6 }); A(head, t, C('temps') + .1, out, { type: 'up' }); bb(t, C('temps') + .6);
    };
  });

  // ================= I. CTA =================
  scene(SI, TL.duration + 1, (root, t0) => {
    const top = text(root, 'LOTO OU PLACEMENT ?', { cls: 'mono', y: 228, size: 28 });
    const balls = [['gold', 7, 300, 760, 230], ['mint', 23, 540, 700, 270], ['coral', 41, 780, 760, 230]].map(([c, n, x, y, w]) => ball(root, c, n, { cx: x, by: y, w }));
    const head = text(root, 'ET VOUS,<br>VOUS <span class="a">JOUEZ</span> ?', { y: 860, size: 130 });
    const sub = text(root, 'RÉPONDEZ EN COMMENTAIRE ↓', { cls: 'mono', y: 1150, size: 24, style: { color: 'var(--cream)' } });
    sfx('whoosh', t0 + .05, .6); [0, 1, 2].forEach(i => sfx('pop', t0 + .15 + i * .12, .6));
    return t => {
      A(top, t, t0, Infinity, { type: 'fade' });
      balls.forEach((b, i) => A(b, t, t0 + .15 + i * .12, Infinity, { type: 'pop', float: 8, phase: i * 2, base: { r: Math.sin(t + i) * 8 } }));
      A(head, t, t0 + .3, Infinity, { type: 'up' }); A(sub, t, t0 + .9, Infinity, { type: 'fade' });
    };
  });
});
