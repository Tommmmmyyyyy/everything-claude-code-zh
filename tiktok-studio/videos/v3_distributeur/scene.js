import { boot, scene, cue, h, svg, tf, A, anim, clamp, lerp, ease, prog, Odo, count, fmt, sfx, TL } from '../../lib/engine.js';
import { box, text, obj, label, panel, burst, pulse } from '../../lib/kit.js';

const C = n => cue(n);
const MINT = '#2EE6A0', GOLD = '#F4B740', RED = '#FF5A4E', CREAM = '#F3ECDF';
const kf = (t, frames, fn = ease.inOutCubic) => {
  if (t <= frames[0][0]) return frames[0][1];
  for (let i = 1; i < frames.length; i++) { const [t1, v1] = frames[i], [t0, v0] = frames[i - 1]; if (t <= t1) return lerp(v0, v1, fn(clamp((t - t0) / Math.max(1e-6, t1 - t0)))); }
  return frames[frames.length - 1][1];
};
const FOOT = 'HYPOTHÈSES INDICATIVES · MICRO-ENTREPRISE · VARIE SELON L’EMPLACEMENT';

boot(async () => {
  const SB = C('line:l3') - .3, SC = C('line:l4') - .3, SD = C('line:l6') - .3, SE = C('line:l8') - .3, SF = C('line:l13') - .3,
    SG = C('line:l14') - .3, SH = C('line:l15') - .3, SI = C('line:l16') - .3, SJ = C('cta') - .35;

  // ================= A. HOOK =================
  scene(0, SB, (root) => {
    const top = text(root, 'REVENU PASSIF ?', { cls: 'mono', y: 228, size: 28 });
    const m = obj(root, 'vending', { cx: 540, by: 1000, w: 640 });
    const coins = [0, 1, 2, 3].map(i => obj(root, 'coin', { cx: 470, by: 900, w: 120, z: 3 }));
    const zz = text(root, 'z<span style="font-size:.75em">z</span><span style="font-size:.55em">z</span>', { cls: 'head', x: 690, y: 330, w: 300, align: 'left', size: 110, style: { color: 'rgba(243,236,223,.85)' } });
    const h1 = text(root, 'UN DISTRIBUTEUR,<br>ÇA RAPPORTE <span class="a">COMBIEN</span> ?', { y: 1050, size: 88 });
    const h2 = text(root, 'FAISONS LE<br><span class="a">CALCUL</span>', { y: 1040, size: 110 });
    sfx('pop', C('dist'), .6); sfx('sparkle', C('dist') + .4, .5); sfx('whoosh', C('calc') - .1, .6);
    return t => {
      const out = SB - .12;
      A(top, t, -1, out, { type: 'fade' });
      A(m, t, -1, out, { type: 'pop', float: 6 });
      coins.forEach((c, i) => {
        const ph = ((t * .55 + i / 4) % 1);
        const x = lerp(-60, -260 + i * 150, ph), y = -ph * 520 + ph * ph * 380;
        tf(c, { x, y: y - 40, s: .6 + ph * .5, r: ph * 300, o: Math.sin(Math.PI * ph) * (1 - prog(t, out, .3)) });
      });
      const zp = prog(t, C('dort'), .5);
      tf(zz, { y: -Math.sin(t * 1.6) * 12, o: zp * (1 - prog(t, out, .3)), s: lerp(.7, 1, ease.outBack(zp)) });
      A(h1, t, -1, C('calc') - .15, { type: 'up', dout: .2 });
      A(h2, t, C('calc'), out, { type: 'up' });
    };
  });

  // ================= B. ACHAT =================
  scene(SB, SC, (root, t0) => {
    const lab = label(root, '01', 'L’ACHAT');
    const m = obj(root, 'vending', { cx: 320, by: 1120, w: 560 });
    const l1 = text(root, 'MACHINE NEUVE', { cls: 'mono', x: 560, y: 520, w: 460, align: 'left', size: 26, style: { color: 'var(--cream)' } });
    const odo = new Odo(root, { maxDigits: 4, style: { position: 'absolute', left: '560px', top: '565px', width: '480px', textAlign: 'left', fontSize: '128px', color: 'var(--gold)' } });
    const l2 = text(root, 'SNACKS + BOISSONS', { cls: 'mono', x: 562, y: 715, w: 460, align: 'left', size: 24 });
    const tag = text(root, '<span class="chip ghost" style="font-size:34px">OCCASION : ≈ 2 000 À 3 000 €</span>', { cls: 'abs', x: 560, y: 790, w: 500, align: 'left' });
    const foot = text(root, 'PRIX INDICATIFS · VARIENT SELON LE MODÈLE', { cls: 'foot', y: 1222 });
    sfx('whoosh', t0 + .05, .5); sfx('rise', C('m5k') - .3, .5, 1.0); sfx('ding', C('m5k') + .7, .8);
    return t => {
      const out = SC - .12;
      A(lab, t, t0, out, { type: 'fade' });
      A(m, t, t0 + .05, out, { type: 'pop', float: 5 });
      A(l1, t, t0 + .3, out, { type: 'left', dist: 40 });
      A(odo.el, t, C('m5k') - .35, out, { type: 'up', base: { s: pulse(t, C('m5k') + .7, .06, .4) } }); odo.el.style.transformOrigin = '0 50%';
      odo.at(t, tt => count(tt, C('m5k') - .3, 1.0, 0, 5000, ease.outQuart));
      A(l2, t, C('m5k') + .2, out, { type: 'fade' });
      A(tag, t, C('m5k') + 1.2, out, { type: 'up' });
      A(foot, t, t0 + .4, out, { type: 'fade' });
    };
  });

  // ================= C. MARGE =================
  scene(SC, SD, (root, t0) => {
    const lab = label(root, '02', 'LA MARGE');
    const can = obj(root, 'can', { cx: 540, by: 820, w: 420 });
    const buy = text(root, '<div class="mono" style="font-size:24px;color:var(--cream)">ACHAT</div><div class="num" style="font-size:104px">0,60<span class="u">€</span></div>', { cls: 'abs', x: 40, y: 430, w: 330, align: 'center' });
    const sell = text(root, '<div class="mono" style="font-size:24px;color:var(--gold)">VENTE</div><div class="num" style="font-size:104px;color:var(--gold)">1,50<span class="u">€</span></div>', { cls: 'abs', x: 710, y: 430, w: 330, align: 'center' });
    const mg = text(root, '+0,90<span class="u">€</span>', { cls: 'num', y: 860, size: 170, color: 'var(--mint)' });
    const mgl = text(root, 'DE MARGE PAR VENTE', { cls: 'mono', y: 1045, size: 26, style: { color: 'var(--cream)' } });
    const st = text(root, '<span class="chip gold" style="font-size:46px;padding:10px 22px">60 % DE MARGE !</span>', { cls: 'abs', x: 600, y: 330, w: 460, align: 'left', z: 6 });
    sfx('whoosh', t0 + .05, .5); sfx('pop', C('buy'), .7); sfx('pop', C('sell'), .7); sfx('ding', C('marge') + .1, .8); sfx('stamp', C('enorme'), .9);
    return t => {
      const out = SD - .12;
      A(lab, t, t0, out, { type: 'fade' });
      A(can, t, t0 + .05, out, { type: 'pop', float: 6 });
      can.style.transform += ` rotate(${Math.sin(t * 1.2) * 3}deg)`;
      A(buy, t, C('buy') - .05, out, { type: 'right' }); A(sell, t, C('sell') - .05, out, { type: 'left' });
      A(mg, t, C('marge') - .05, out, { type: 'pop', base: { s: pulse(t, C('enorme'), .06, .45) } }); A(mgl, t, C('marge') + .2, out, { type: 'fade' });
      A(st, t, C('enorme'), out, { type: 'stamp', rot: 8, rot2: 5 });
    };
  });

  // ================= D. VOLUME =================
  scene(SD, SE, (root, t0) => {
    const lab = label(root, '03', 'LES VENTES');
    const off = obj(root, 'office', { cx: 250, by: 700, w: 380 });
    const n25 = text(root, '25', { cls: 'num', x: 470, y: 330, w: 560, align: 'left', size: 210, color: 'var(--gold)' });
    const n25l = text(root, 'VENTES / JOUR', { cls: 'mono', x: 478, y: 555, w: 560, align: 'left', size: 28, style: { color: 'var(--cream)' } });
    const cal = box(root, { x: 140, y: 740, w: 800, hgt: 230 });
    const cells = [];
    for (let i = 0; i < 30; i++) {
      const wk = i % 7 >= 5;
      const e = h('div', 'abs', '', { left: (i % 10) * 80 + 'px', top: Math.floor(i / 10) * 76 + 'px', width: '68px', height: '64px', borderRadius: '12px', background: 'rgba(226,242,234,.07)' });
      e.wk = wk; cal.appendChild(e); cells.push(e);
    }
    const calL = text(root, '22 JOURS DE TRAVAIL PAR MOIS', { cls: 'mono', y: 705, size: 22 });
    const ca = new Odo(root, { maxDigits: 3, style: { position: 'absolute', top: '1000px', left: 0, right: 0, textAlign: 'center', fontSize: '150px', color: 'var(--cream)' } });
    const cal2 = text(root, 'DE CHIFFRE D’AFFAIRES PAR MOIS', { cls: 'mono', y: 1165, size: 24 });
    const fillT = C('line:l7');
    sfx('whoosh', t0 + .05, .5); sfx('pop', C('loc'), .6); sfx('pop', C('v25'), .8); sfx('fill', fillT, .5, 1.2); sfx('rise', C('ca') - .3, .45, 1.0); sfx('ding', C('ca') + .7, .8);
    return t => {
      const out = SE - .12;
      A(lab, t, t0, out, { type: 'fade' });
      A(off, t, C('loc') - .1, out, { type: 'pop', float: 4 });
      A(n25, t, C('v25') - .05, out, { type: 'pop' }); A(n25l, t, C('v25') + .15, out, { type: 'fade' });
      A(cal, t, fillT - .1, out, { type: 'fade' }); A(calL, t, fillT, out, { type: 'fade' });
      const k = clamp((t - fillT) / 1.2);
      let n = 0;
      cells.forEach((e, i) => { const on = !e.wk && n < 22 && i / 30 <= k; if (!e.wk && i / 30 <= k) n++; e.style.background = on ? 'var(--gold)' : (e.wk ? 'rgba(226,242,234,.04)' : 'rgba(226,242,234,.10)'); });
      A(ca.el, t, C('ca') - .35, out, { type: 'up', base: { s: pulse(t, C('ca') + .7, .06, .4) } });
      ca.at(t, tt => count(tt, C('ca') - .3, 1.0, 0, 825, ease.outQuart));
      A(cal2, t, C('ca') + .2, out, { type: 'fade' });
    };
  });

  // ================= E. WATERFALL =================
  scene(SE, SF, (root, t0) => {
    const lab = label(root, '04', 'CE QU’IL RESTE', { y: 200 });
    const sub = text(root, 'CHIFFRE D’AFFAIRES', { cls: 'mono', y: 412, size: 24, style: { color: 'var(--cream)' } });
    const odo = new Odo(root, { maxDigits: 3, style: { position: 'absolute', top: '245px', left: 0, right: 0, textAlign: 'center', fontSize: '150px', color: 'var(--cream)' } });
    const P = panel(root, { x: 50, y: 470, w: 980, hgt: 720 });
    const s = svg('svg', { width: 980, height: 720, viewBox: '0 0 980 720' }); s.style.overflow = 'visible'; P.appendChild(s);
    const steps = [
      { k: null, v: 825, lab: ['CHIFFRE', 'D’AFFAIRES'], col: CREAM },
      { k: 'ach', v: -330, lab: ['PRODUITS', 'ACHETÉS'], col: RED },
      { k: 'comm', v: -83, lab: ['COMMISSION', 'EMPLACEMENT'], col: RED },
      { k: 'fix', v: -80, lab: ['ÉLEC · CB', 'ASSURANCE'], col: RED },
      { k: 'per', v: -126, lab: ['PERTES +', 'COTISATIONS'], col: RED },
      { k: 'reste', v: 206, lab: ['IL VOUS', 'RESTE'], col: MINT, final: true },
    ];
    const y0 = 600, sc = 500 / 825, bw = 118, gap = 36, x0 = 60;
    let run = 0;
    const bars = steps.map((st, i) => {
      const top = st.final ? st.v : (st.v > 0 ? run + st.v : run);
      const bot = st.final ? 0 : (st.v > 0 ? run : run + st.v);
      if (!st.final) run += st.v;
      const x = x0 + i * (bw + gap);
      const r = svg('rect', { x, width: bw, rx: 8, fill: st.col, opacity: 0 }); s.appendChild(r);
      const val = svg('text', { x: x + bw / 2, 'text-anchor': 'middle', fill: st.col, 'font-size': 30, 'font-weight': 700 }); val.textContent = (st.v > 0 ? '' : '−') + Math.abs(st.v) + ' €'; s.appendChild(val);
      const l1 = svg('text', { x: x + bw / 2, y: y0 + 40, 'text-anchor': 'middle', fill: 'rgba(226,242,234,.6)', 'font-size': 16, 'letter-spacing': 1 }); l1.textContent = st.lab[0]; s.appendChild(l1);
      const l2 = svg('text', { x: x + bw / 2, y: y0 + 62, 'text-anchor': 'middle', fill: 'rgba(226,242,234,.6)', 'font-size': 16, 'letter-spacing': 1 }); l2.textContent = st.lab[1]; s.appendChild(l2);
      let link = null;
      if (i < steps.length - 1) { link = svg('line', { x1: x + bw, x2: x + bw + gap, stroke: 'rgba(226,242,234,.3)', 'stroke-width': 2, 'stroke-dasharray': '4 5', opacity: 0 }); s.appendChild(link); }
      return { ...st, x, top, bot, r, val, l1, l2, link, end: st.final ? st.v : run };
    });
    s.appendChild(svg('line', { x1: 40, x2: 940, y1: y0, y2: y0, stroke: 'rgba(226,242,234,.35)', 'stroke-width': 2 }));
    const foot = text(root, FOOT, { cls: 'foot', y: 1222 });
    const T = Object.fromEntries(steps.filter(x => x.k).map(x => [x.k, C(x.k)]));
    const remaining = tt => kf(tt, [[T.ach, 825], [T.ach + .8, 495], [T.comm, 495], [T.comm + .8, 412], [T.fix, 412], [T.fix + .8, 332], [T.per, 332], [T.per + .8, 206]], ease.outCubic);
    sfx('whoosh', t0 + .05, .5); ['ach', 'comm', 'fix', 'per'].forEach(k => sfx('pop', T[k] + .05, .7)); sfx('ding', T.reste + .2, 1); sfx('sparkle', T.reste + .5, .6);
    return t => {
      const out = SF - .12;
      A(lab, t, t0, out, { type: 'fade' }); A(P, t, t0 + .1, out, { type: 'up', dist: 70 }); A(foot, t, t0 + .4, out, { type: 'fade' });
      A(odo.el, t, t0 + .1, out, { type: 'up', base: { s: pulse(t, T.reste + .2, .08, .5) } });
      odo.at(t, remaining);
      odo.el.style.color = t >= T.reste ? 'var(--mint)' : (t >= T.ach ? 'var(--cream)' : 'var(--cream)');
      sub.textContent = t >= T.ach ? 'IL RESTE' : 'CHIFFRE D’AFFAIRES'; sub.style.color = t >= T.reste ? 'var(--mint)' : 'var(--cream)';
      A(sub, t, t0 + .2, out, { type: 'fade' });
      bars.forEach((b, i) => {
        const tb = b.k ? T[b.k] : t0 + .3;
        const p = prog(t, tb, .6, ease.outQuart);
        const yTop = y0 - b.top * sc, yBot = y0 - b.bot * sc;
        let y1, hgt;
        if (b.v > 0 || b.final) { hgt = (yBot - yTop) * p; y1 = yBot - hgt; }
        else { hgt = (yBot - yTop) * p; y1 = yTop; }
        b.r.setAttribute('y', y1); b.r.setAttribute('height', Math.max(0, hgt)); b.r.setAttribute('opacity', p > 0 ? 1 : 0);
        if (b.final) b.r.setAttribute('filter', 'drop-shadow(0 0 18px rgba(46,230,160,.6))');
        b.val.setAttribute('y', (b.v > 0 || b.final ? yTop : yBot + (hgt > 60 ? -hgt / 2 : 0)) - 14 + (b.v < 0 && hgt > 60 ? hgt / 2 + 46 : 0));
        if (b.v < 0) b.val.setAttribute('y', yBot + 36);
        b.val.setAttribute('opacity', clamp((t - tb - .3) / .3));
        b.l1.setAttribute('opacity', p); b.l2.setAttribute('opacity', p);
        if (b.link) { const ly = y0 - b.end * sc; b.link.setAttribute('y1', ly); b.link.setAttribute('y2', ly); const nk = bars[i + 1].k; b.link.setAttribute('opacity', clamp((t - (nk ? T[nk] : 0) + .1) / .3) * .9); }
      });
    };
  });

  // ================= F. PAYBACK =================
  scene(SF, SG, (root, t0) => {
    const lab = label(root, '05', 'RENTABILITÉ');
    const big = text(root, '≈ 2 ANS', { cls: 'head', y: 290, size: 190, color: 'var(--gold)' });
    const bl = text(root, 'JUSTE POUR REMBOURSER LA MACHINE', { cls: 'mono', y: 480, size: 26, style: { color: 'var(--cream)' } });
    const grid = box(root, { x: 90, y: 590, w: 900, hgt: 220 });
    const segs = [];
    for (let i = 0; i < 24; i++) {
      const e = h('div', 'abs', '', { left: (i % 12) * 75 + 'px', top: Math.floor(i / 12) * 110 + 'px', width: '64px', height: '86px', borderRadius: '12px', background: 'rgba(226,242,234,.08)' });
      const n = h('div', 'mono abs', String(i + 1), { left: 0, right: 0, top: '30px', textAlign: 'center', fontSize: '20px', color: 'rgba(226,242,234,.5)' });
      e.appendChild(n); grid.appendChild(e); segs.push({ e, n });
    }
    const gl = text(root, '1 CASE = 1 MOIS · ≈ 200 € ÉCONOMISÉS', { cls: 'mono', y: 835, size: 22 });
    const odo = new Odo(root, { maxDigits: 4, style: { position: 'absolute', top: '905px', left: 0, right: 0, textAlign: 'center', fontSize: '110px', color: 'var(--mint)' } });
    const ol = text(root, 'REMBOURSÉS SUR 5 000 €', { cls: 'mono', y: 1030, size: 24 });
    const coins = obj(root, 'coinstack', { cx: 540, by: 1210, w: 170 });
    const T0 = C('pay'), T1 = C('y2') + .6;
    sfx('whoosh', t0 + .05, .5); sfx('fill', T0 + .2, .5, T1 - T0 - .2); sfx('stamp', C('y2'), .9);
    return t => {
      const out = SG - .12;
      A(lab, t, t0, out, { type: 'fade' });
      A(big, t, C('y2') - .1, out, { type: 'stamp', rot: -4, rot2: -2 }); A(bl, t, C('y2') + .2, out, { type: 'fade' });
      A(grid, t, t0 + .1, out, { type: 'fade' }); A(gl, t, t0 + .3, out, { type: 'fade' });
      const k = clamp((t - T0 - .2) / (T1 - T0 - .2));
      segs.forEach((sg, i) => { const on = i < k * 24; sg.e.style.background = on ? 'var(--mint)' : 'rgba(226,242,234,.08)'; sg.n.style.color = on ? 'var(--ink)' : 'rgba(226,242,234,.5)'; });
      A(odo.el, t, t0 + .2, out, { type: 'fade' }); odo.at(t, tt => 5000 * clamp((tt - T0 - .2) / (T1 - T0 - .2)));
      A(ol, t, t0 + .3, out, { type: 'fade' });
      A(coins, t, T1 - .3, out, { type: 'pop', float: 4 });
    };
  });

  // ================= G. EMPLACEMENT =================
  scene(SG, SH, (root, t0) => {
    const lab = label(root, '06', 'L’EMPLACEMENT');
    const head = text(root, 'TOUT DÉPEND DE<br>L’<span class="a">EMPLACEMENT</span>', { y: 270, size: 100 });
    const rows = [
      { k: 'v8', n: '8', v: 12, col: RED, lbl: '≈ 10 €', y: 600 },
      { k: 'emp', n: '25', v: 206, col: CREAM, lbl: '≈ 200 €', y: 790 },
      { k: 'v50', n: '50', v: 493, col: MINT, lbl: '≈ 500 €', y: 980 },
    ].map(r => {
      const g = box(root, { x: 70, y: r.y, w: 940, hgt: 160 });
      g.appendChild(h('div', 'num abs', r.n, { left: 0, top: '10px', width: '170px', textAlign: 'right', fontSize: '96px', color: r.col }));
      g.appendChild(h('div', 'mono abs', 'VENTES<br>/ JOUR', { left: '190px', top: '34px', fontSize: '20px', lineHeight: '1.3' }));
      const bar = h('div', 'abs', '', { left: '320px', top: '40px', height: '64px', borderRadius: '12px', background: r.col, width: '0px' });
      const val = h('div', 'num abs', r.lbl, { top: '34px', fontSize: '60px', color: r.col, whiteSpace: 'nowrap' });
      const per = h('div', 'mono abs', '/ MOIS', { top: '106px', fontSize: '18px' });
      g.appendChild(bar); g.appendChild(val); g.appendChild(per);
      return { ...r, g, bar, val, per };
    });
    const foot = text(root, FOOT, { cls: 'foot', y: 1222 });
    sfx('whoosh', t0 + .05, .5); rows.forEach(r => sfx('pop', C(r.k) + .05, .7));
    return t => {
      const out = SH - .12;
      A(lab, t, t0, out, { type: 'fade' }); A(head, t, C('emp') - .1, out, { type: 'up' }); A(foot, t, t0 + .4, out, { type: 'fade' });
      rows.forEach(r => {
        const tr = r.k === 'emp' ? C('emp') + .4 : C(r.k);
        A(r.g, t, tr, out, { type: 'left' });
        const w = Math.max(8, 400 * r.v / 493) * prog(t, tr + .15, .7, ease.outQuart);
        r.bar.style.width = w + 'px'; r.val.style.left = (340 + w) + 'px'; r.per.style.left = (346 + w) + 'px';
        if (r.k === 'v8') r.bar.style.width = Math.max(14, w) + 'px';
      });
    };
  });

  // ================= H. TEMPS =================
  scene(SH, SI, (root, t0) => {
    const head = text(root, 'SANS COMPTER<br>VOTRE <span class="g">TEMPS</span>', { y: 260, size: 112 });
    const icons = {
      box: '<rect x="18" y="26" width="40" height="34" rx="5" fill="none" stroke="#F4B740" stroke-width="6"/><path d="M18 38 H58 M38 26 V38" stroke="#F4B740" stroke-width="6"/>',
      wrench: '<path d="M52 18 a14 14 0 0 0 -17 17 L18 52 a5 5 0 0 0 7 7 L42 42 a14 14 0 0 0 17 -17 l-9 9 -8 -2 -2 -8 Z" fill="none" stroke="#F4B740" stroke-width="5" stroke-linejoin="round"/>',
      road: '<path d="M28 62 L36 14 M48 62 L40 14" stroke="#F4B740" stroke-width="6" stroke-linecap="round"/><path d="M38 22 V28 M38 36 V42 M38 50 V56" stroke="#F4B740" stroke-width="4" stroke-linecap="round"/>',
    };
    const rows = [['t1', 'RÉAPPROVISIONNER', '1 À 2 FOIS PAR SEMAINE', 'box'], ['t2', 'GÉRER LES PANNES', 'MONNAYEUR, FRIGO, LECTEUR CB', 'wrench'], ['t3', 'LES TRAJETS', 'CARBURANT ET TEMPS DE ROUTE', 'road']].map(([c, a, b, ic], i) => {
      const r = box(root, { x: 70, y: 560 + i * 210, w: 940, hgt: 180 });
      r.appendChild(h('div', 'panel', '', { inset: 0, borderRadius: '26px' }));
      const sv = svg('svg', { width: 110, height: 110, viewBox: '0 0 76 76' }); Object.assign(sv.style, { position: 'absolute', left: '34px', top: '35px' });
      sv.innerHTML = `<circle cx="38" cy="38" r="36" fill="rgba(244,183,64,.14)"/>` + icons[ic]; r.appendChild(sv);
      r.appendChild(h('div', 'head abs', a, { left: '176px', top: '42px', fontSize: '56px', width: '760px' }));
      r.appendChild(h('div', 'mono abs', b, { left: '178px', top: '108px', fontSize: '21px', width: '760px' }));
      return { r, c };
    });
    sfx('whoosh', t0 + .05, .5); rows.forEach(({ c }) => sfx('pop', C(c), .6));
    return t => {
      const out = SI - .12;
      A(head, t, C('time') - .1, out, { type: 'up' });
      rows.forEach(({ r, c }) => A(r, t, C(c) - .05, out, { type: 'left' }));
    };
  });

  // ================= I. CONCLUSION =================
  scene(SI, SJ, (root, t0) => {
    const q = text(root, 'REVENU <span id="pas">PASSIF</span> ?', { y: 300, size: 120 });
    const strike = h('div', 'abs', '', { left: '470px', top: '360px', height: '12px', width: '0px', borderRadius: '6px', background: 'var(--red)', zIndex: 5 }); root.appendChild(strike);
    const com = text(root, '<span class="chip gold" style="font-size:52px;padding:10px 24px">UN PETIT COMMERCE</span>', { cls: 'abs', y: 470 });
    const pin = svg('svg', { width: 220, height: 280, viewBox: '0 0 100 128' }); Object.assign(pin.style, { position: 'absolute', left: '430px', top: '610px', overflow: 'visible' });
    pin.innerHTML = `<ellipse cx="50" cy="122" rx="26" ry="6" fill="rgba(0,0,0,.35)"/><path d="M50 4 C26 4 10 22 10 44 C10 72 50 112 50 112 C50 112 90 72 90 44 C90 22 74 4 50 4 Z" fill="#2EE6A0"/><circle cx="50" cy="44" r="16" fill="#081A14"/>`;
    root.appendChild(pin);
    const v = text(root, 'CE QUE VOUS ACHETEZ,<br>C’EST UN <span class="a">EMPLACEMENT</span>', { y: 945, size: 88 });
    sfx('whoosh', t0 + .05, .5); sfx('stamp', C('commerce') - .2, .8); sfx('pop', C('vrai') + .2, .8); sfx('sparkle', C('vrai') + .6, .6);
    return t => {
      const out = SJ - .12;
      A(q, t, C('passif') - .05, out, { type: 'up' });
      if (!strike.placed) { const pa = q.querySelector('#pas').getBoundingClientRect(), rr = root.getBoundingClientRect(); if (pa.width > 0) { strike.placed = true; strike.sx = pa.left - rr.left - 6; strike.sw = pa.width + 12; strike.style.left = strike.sx + 'px'; strike.style.top = (pa.top - rr.top + pa.height * .5 - 6) + 'px'; } }
      strike.style.width = (prog(t, C('commerce') - .3, .35) * (strike.sw || 300)) + 'px'; strike.style.opacity = 1 - prog(t, out, .3);
      A(com, t, C('commerce'), out, { type: 'stamp', rot: -4, rot2: -2 });
      const pp = anim(t, C('vrai') + .1, out, { type: 'pop' }); pp.y += -Math.abs(Math.sin((t - C('vrai')) * 3)) * 26 * clamp(t - C('vrai')); tf(pin, pp);
      A(v, t, C('vrai') + .3, out, { type: 'up' });
    };
  });

  // ================= J. CTA =================
  scene(SJ, TL.duration + 1, (root, t0) => {
    const top = text(root, 'DISTRIBUTEUR AUTOMATIQUE', { cls: 'mono', y: 228, size: 26 });
    const m = obj(root, 'vending', { cx: 540, by: 940, w: 600 });
    const head = text(root, 'VOUS L’INSTALLERIEZ<br><span class="a">OÙ</span> ?', { y: 990, size: 104 });
    const sub = text(root, 'RÉPONDEZ EN COMMENTAIRE ↓', { cls: 'mono', y: 1196, size: 24, style: { color: 'var(--cream)' } });
    sfx('whoosh', t0 + .05, .6); sfx('pop', t0 + .2, .7);
    return t => {
      A(top, t, t0, Infinity, { type: 'fade' }); A(m, t, t0 + .1, Infinity, { type: 'pop', float: 6 });
      A(head, t, t0 + .25, Infinity, { type: 'up' }); A(sub, t, t0 + .9, Infinity, { type: 'fade' });
    };
  });
});
