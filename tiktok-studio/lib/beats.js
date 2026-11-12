// Declarative "beats": every video is a list of reusable scene templates driven by voice cues.
import { scene, cue, h, svg, tf, A, anim, clamp, lerp, ease, prog, Odo, count, fmt, sfx, TL } from './engine.js';
import { box, text, obj, label, panel, burst, pulse } from './kit.js';

export const MINT = '#2EE6A0', GOLD = '#F4B740', RED = '#FF5A4E', CREAM = '#F3ECDF';
const COLS = { mint: 'var(--mint)', gold: 'var(--gold)', red: 'var(--red)', cream: 'var(--cream)', white: '#fff', muted: 'var(--muted)' };
const col = c => COLS[c] || c || '#fff';

// time spec: number | 'cue' | ['cue', dt]
export function T(x) {
  if (x == null) return 0;
  if (typeof x === 'number') return x;
  if (Array.isArray(x)) return cue(x[0]) + (x[1] || 0);
  return cue(x);
}
const OUT = .12;

const ICONS = {
  zig: c => `<path d="M22 70 L42 48 L56 62 L72 36 L88 52" fill="none" stroke="${c}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`,
  minus: c => `<path d="M30 55 L80 55" stroke="${c}" stroke-width="9" stroke-linecap="round"/>`,
  up: c => `<path d="M55 82 L55 30 M35 48 L55 28 L75 48" fill="none" stroke="${c}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`,
  check: c => `<path d="M28 56 L46 74 L82 36" fill="none" stroke="${c}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`,
  cross: c => `<path d="M34 34 L76 76 M76 34 L34 76" stroke="${c}" stroke-width="10" stroke-linecap="round"/>`,
  clock: c => `<circle cx="55" cy="55" r="26" fill="none" stroke="${c}" stroke-width="7"/><path d="M55 40 V56 L66 63" fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round"/>`,
  cal: c => `<rect x="30" y="34" width="50" height="44" rx="7" fill="none" stroke="${c}" stroke-width="7"/><path d="M30 48 H80 M42 28 V38 M68 28 V38" stroke="${c}" stroke-width="7" stroke-linecap="round"/>`,
  sun: c => `<circle cx="55" cy="55" r="14" fill="${c}"/><path d="M55 25 V33 M55 77 V85 M25 55 H33 M77 55 H85 M34 34 L40 40 M70 70 L76 76 M76 34 L70 40 M34 76 L40 70" stroke="${c}" stroke-width="6" stroke-linecap="round"/>`,
  rain: c => `<path d="M35 58 a14 14 0 0 1 6 -27 a18 18 0 0 1 34 6 a11 11 0 0 1 -2 21 Z" fill="none" stroke="${c}" stroke-width="6" stroke-linejoin="round"/><path d="M42 68 L38 78 M56 68 L52 78 M70 68 L66 78" stroke="${c}" stroke-width="6" stroke-linecap="round"/>`,
  box: c => `<rect x="30" y="38" width="50" height="40" rx="6" fill="none" stroke="${c}" stroke-width="7"/><path d="M30 52 H80 M55 38 V52" stroke="${c}" stroke-width="7"/>`,
  home: c => `<path d="M28 56 L55 32 L82 56 M36 50 V80 H74 V50" fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`,
  heart: c => `<path d="M55 80 C30 62 26 48 34 38 C42 29 52 33 55 41 C58 33 68 29 76 38 C84 48 80 62 55 80 Z" fill="${c}"/>`,
  rules: c => `<rect x="34" y="26" width="42" height="56" rx="6" fill="none" stroke="${c}" stroke-width="7"/><path d="M44 42 H66 M44 54 H66 M44 66 H58" stroke="${c}" stroke-width="6" stroke-linecap="round"/>`,
};
function iconSvg(name, c, size = 120) {
  const s = svg('svg', { width: size, height: size, viewBox: '0 0 110 110' });
  const bg = c === RED ? 'rgba(255,90,78,.15)' : c === MINT ? 'rgba(46,230,160,.15)' : c === GOLD ? 'rgba(244,183,64,.15)' : 'rgba(243,236,223,.12)';
  s.innerHTML = `<circle cx="55" cy="55" r="52" fill="${bg}"/>` + (ICONS[name] || ICONS.check)(c);
  return s;
}

// ---------- element factory for the generic "stack" beat ----------
function makeItem(root, it) {
  const y = it.y ?? 600, x = it.x ?? 0, w = it.w ?? 1080, align = it.align || 'center';
  let el, odo = null, extra = null;
  switch (it.kind) {
    case 'head': el = text(root, it.html, { y, x, w, align, size: it.size || 100, color: it.color ? col(it.color) : undefined, z: it.z }); break;
    case 'mono': el = text(root, it.html, { cls: 'mono', y, x, w, align, size: it.size || 26, style: { color: col(it.color || 'cream') }, z: it.z }); break;
    case 'num': el = text(root, it.html, { cls: 'num', y, x, w, align, size: it.size || 150, color: col(it.color || 'white'), z: it.z }); break;
    case 'chip': el = text(root, `<span class="chip ${it.style || ''}" style="font-size:${it.size || 44}px;padding:${Math.round((it.size || 44) * .22)}px ${Math.round((it.size || 44) * .5)}px">${it.html}</span>`, { cls: 'abs', y, x, w, align, z: it.z ?? 6 }); break;
    case 'odo': {
      odo = new Odo(root, { maxDigits: it.digits || 6, prefix: it.prefix || '', suffix: it.suffix ?? '<span class="u">€</span>', style: { position: 'absolute', top: y + 'px', left: x + 'px', width: w + 'px', textAlign: align, fontSize: (it.size || 170) + 'px', color: col(it.color || 'gold') } });
      el = odo.el; break;
    }
    case 'sprite': el = obj(root, it.name, { cx: it.cx ?? 540, by: it.by ?? 900, w: it.size || 500, z: it.z ?? 2 }); break;
    case 'row': {
      el = box(root, { x: 70, y, w: 940, hgt: it.h || 170 });
      el.appendChild(h('div', 'panel', '', { inset: 0, borderRadius: '26px' }));
      const ic = iconSvg(it.icon || 'check', it.iconColor ? col(it.iconColor).replace('var(--mint)', MINT) : MINT, (it.h || 170) * .62);
      Object.assign(ic.style, { position: 'absolute', left: '30px', top: ((it.h || 170) * .19) + 'px' }); el.appendChild(ic);
      el.appendChild(h('div', 'head abs', it.html, { left: ((it.h || 170) * .62 + 56) + 'px', top: it.sub ? ((it.h || 170) * .22) + 'px' : ((it.h || 170) * .5 - (it.size || 50) * .55) + 'px', fontSize: (it.size || 50) + 'px', width: '700px' }));
      if (it.sub) el.appendChild(h('div', 'mono abs', it.sub, { left: ((it.h || 170) * .62 + 58) + 'px', top: ((it.h || 170) * .62) + 'px', fontSize: '21px', width: '700px' }));
      if (it.right) el.appendChild(h('div', 'num abs', it.right, { right: '34px', top: ((it.h || 170) * .5 - (it.rSize || 50) * .58) + 'px', fontSize: (it.rSize || 50) + 'px', color: col(it.rColor || 'gold'), whiteSpace: 'nowrap' }));
      break;
    }
    case 'custom': { const r = it.build(root); el = r.el; extra = r.update; break; }
  }
  return { it, el, odo, extra };
}

// generic beat: a stack of items appearing on cues
export function stack(start, end, items, { lab, foot, sfxIn = true } = {}) {
  scene(start, end, (root, t0) => {
    const L = lab ? label(root, lab[0], lab[1]) : null;
    const F = foot ? text(root, foot, { cls: 'foot', y: 1222 }) : null;
    const els = items.map(it => makeItem(root, it));
    if (sfxIn) sfx('whoosh', t0 + .05, .45);
    for (const { it } of els) {
      if (it.sfx === false) continue;
      const at = it.at == null ? t0 + .1 : T(it.at);
      const kind = it.sfx || (it.kind === 'odo' ? 'rise' : it.anim === 'stamp' ? 'stamp' : it.kind === 'chip' ? 'pop' : it.kind === 'sprite' ? 'pop' : (it.kind === 'num' || it.kind === 'row') ? 'pop' : null);
      if (kind === 'rise') { sfx('rise', at - .3, .45, it.dur || 1.1); sfx('ding', at + (it.dur || 1.1) - .3, .8); }
      else if (kind) sfx(kind, at, kind === 'stamp' ? .85 : .55);
    }
    return t => {
      const out = end - OUT;
      if (L) A(L, t, t0, out, { type: 'fade' });
      if (F) A(F, t, t0 + .3, out, { type: 'fade' });
      for (const { it, el, odo, extra } of els) {
        const at = it.at == null ? t0 + .1 : T(it.at);
        const until = it.until == null ? out : T(it.until) - .1;
        const base = { ...(it.base || {}) };
        if (it.pulse) base.s = (base.s ?? 1) * pulse(t, T(it.pulse), .07, .45);
        const r = anim(t, at - (it.kind === 'odo' ? .35 : 0), until, { type: it.anim || (it.kind === 'sprite' ? 'pop' : it.kind === 'chip' ? 'pop' : 'up'), float: it.float ?? (it.kind === 'sprite' ? 5 : 0), rot: it.rot, rot2: it.rot2, dist: it.dist });
        r.x += base.x || 0; r.y += base.y || 0; r.s *= base.s ?? 1; r.r += base.r || 0;
        if (it.dim) r.o *= lerp(1, .35, prog(t, T(it.dim), .4));
        tf(el, r);
        if (it.kind === 'odo') {
          el.style.transformOrigin = it.align === 'left' ? '0 50%' : '50% 50%';
          const from = it.from ?? 0, dur = it.dur || 1.1;
          const f = it.fn ? it.fn : (tt => count(tt, at - .3, dur, from, it.to, ease.outQuart));
          odo.at(t, f);
        }
        if (extra) extra(t, at, until);
      }
    };
  });
}

// waterfall: start value, negative steps, final remainder
export function waterfall(start, end, { lab, foot, title = ['', ''], unit = '€', startBar, steps, final, max, digits = 6, odoSize = 150, barFmt }) {
  scene(start, end, (root, t0) => {
    const L = lab ? label(root, lab[0], lab[1], { y: 200 }) : null;
    const sub = text(root, title[0], { cls: 'mono', y: 412, size: 24, style: { color: 'var(--cream)' } });
    const odo = new Odo(root, { maxDigits: digits, suffix: `<span class="u">${unit}</span>`, style: { position: 'absolute', top: (245 + (150 - odoSize) * .6) + 'px', left: 0, right: 0, textAlign: 'center', fontSize: odoSize + 'px', color: 'var(--cream)' } });
    const P = panel(root, { x: 50, y: 470, w: 980, hgt: 720 });
    const s = svg('svg', { width: 980, height: 720, viewBox: '0 0 980 720' }); s.style.overflow = 'visible'; P.appendChild(s);
    const all = [{ ...startBar, v: startBar.value, col: CREAM }, ...steps.map(x => ({ ...x, v: -Math.abs(x.value), col: RED })), { ...final, v: final.value, col: MINT, final: true }];
    const n = all.length, gap = 26, x0 = 50, bw = (880 - gap * (n - 1)) / n, y0 = 600, sc = 500 / (max || startBar.value);
    let run = 0;
    const bars = all.map((b, i) => {
      let top, bot;
      if (i === 0) { top = b.v; bot = 0; run = b.v; } else if (b.final) { top = b.v; bot = 0; } else { top = run; bot = run + b.v; run += b.v; }
      const x = x0 + i * (bw + gap);
      const r = svg('rect', { x, width: bw, rx: 8, fill: b.col, opacity: 0 }); s.appendChild(r);
      const val = svg('text', { x: x + bw / 2, 'text-anchor': 'middle', fill: b.col, 'font-size': n > 6 ? 24 : 28, 'font-weight': 700 }); val.textContent = (b.v < 0 ? '−' : '') + (barFmt ? barFmt(Math.abs(b.v)) : fmt(Math.abs(b.v)) + ' ' + unit); s.appendChild(val);
      const ls = (b.label || ['', '']).map((txt, k) => { const l = svg('text', { x: x + bw / 2, y: y0 + 38 + k * 22, 'text-anchor': 'middle', fill: 'rgba(226,242,234,.62)', 'font-size': n > 6 ? 14 : 16, 'letter-spacing': 1 }); l.textContent = txt; s.appendChild(l); return l; });
      return { ...b, x, top, bot, r, val, ls, end: b.final ? b.v : run };
    });
    s.appendChild(svg('line', { x1: 30, x2: 950, y1: y0, y2: y0, stroke: 'rgba(226,242,234,.35)', 'stroke-width': 2 }));
    const F = foot ? text(root, foot, { cls: 'foot', y: 1222 }) : null;
    const times = bars.map((b, i) => i === 0 ? (startBar.at ? T(startBar.at) : t0 + .3) : T(b.at));
    const frames = [[times[1] ?? t0, bars[0].v]];
    bars.forEach((b, i) => { if (i > 0 && !b.final) { frames.push([times[i], frames[frames.length - 1][1]]); frames.push([times[i] + .8, b.end]); } });
    const remaining = tt => {
      let v = frames[0][1];
      for (let i = 1; i < frames.length; i++) { const [ta, va] = frames[i - 1], [tb, vb] = frames[i]; if (tt >= tb) v = vb; else if (tt > ta) { v = lerp(va, vb, ease.outCubic((tt - ta) / Math.max(1e-6, tb - ta))); break; } else break; }
      return Math.max(0, v);
    };
    sfx('whoosh', t0 + .05, .45); bars.forEach((b, i) => { if (i > 0) sfx(b.final ? 'ding' : 'pop', times[i] + .05, b.final ? 1 : .65); });
    return t => {
      const out = end - OUT;
      if (L) A(L, t, t0, out, { type: 'fade' }); if (F) A(F, t, t0 + .4, out, { type: 'fade' });
      A(P, t, t0 + .1, out, { type: 'up', dist: 70 });
      const tf_ = times[times.length - 1];
      A(odo.el, t, t0 + .1, out, { type: 'up', base: { s: pulse(t, tf_ + .2, .08, .5) } });
      odo.at(t, remaining); odo.el.style.color = t >= tf_ ? 'var(--mint)' : 'var(--cream)';
      sub.textContent = t >= (times[1] ?? 1e9) ? title[1] : title[0]; sub.style.color = t >= tf_ ? 'var(--mint)' : 'var(--cream)';
      A(sub, t, t0 + .2, out, { type: 'fade' });
      bars.forEach((b, i) => {
        const p = prog(t, times[i], .6, ease.outQuart);
        const yTop = y0 - b.top * sc, yBot = y0 - b.bot * sc, hh = (yBot - yTop) * p;
        if (b.v > 0) { b.r.setAttribute('y', yBot - hh); } else { b.r.setAttribute('y', yTop); }
        b.r.setAttribute('height', Math.max(0, hh)); b.r.setAttribute('opacity', p > 0 ? 1 : 0);
        b.val.setAttribute('y', b.v > 0 ? yTop - 14 : yBot + 32); b.val.setAttribute('opacity', clamp((t - times[i] - .3) / .3));
        b.ls.forEach(l => l.setAttribute('opacity', p));
      });
    };
  });
}

// horizontal comparison bars
export function hbars(start, end, { lab, head, headAt, rows, max, foot, y0 = 560, gapY = 190, unitLabel = '' }) {
  scene(start, end, (root, t0) => {
    const L = lab ? label(root, lab[0], lab[1]) : null;
    const H = head ? text(root, head, { y: 270, size: 96 }) : null;
    const F = foot ? text(root, foot, { cls: 'foot', y: 1222 }) : null;
    const els = rows.map((r, i) => {
      const g = box(root, { x: 60, y: y0 + i * gapY, w: 960, hgt: 160 });
      g.appendChild(h('div', 'num abs', r.n, { left: 0, top: '8px', width: '200px', textAlign: 'right', fontSize: (r.nSize || 84) + 'px', color: col(r.color) }));
      g.appendChild(h('div', 'mono abs', r.sub || '', { left: '215px', top: '30px', fontSize: '19px', lineHeight: '1.3', width: '120px' }));
      const bar = h('div', 'abs', '', { left: '340px', top: '34px', height: '62px', borderRadius: '12px', background: col(r.color), width: '0px' });
      const val = h('div', 'num abs', r.display, { top: '28px', fontSize: (r.vSize || 56) + 'px', color: col(r.color), whiteSpace: 'nowrap' });
      const per = h('div', 'mono abs', r.per || unitLabel, { top: '100px', fontSize: '18px' });
      g.appendChild(bar); g.appendChild(val); g.appendChild(per);
      sfx('pop', T(r.at) + .05, .6);
      return { r, g, bar, val, per };
    });
    sfx('whoosh', t0 + .05, .45);
    return t => {
      const out = end - OUT;
      if (L) A(L, t, t0, out, { type: 'fade' }); if (H) A(H, t, headAt ? T(headAt) : t0 + .1, out, { type: 'up' }); if (F) A(F, t, t0 + .4, out, { type: 'fade' });
      els.forEach(({ r, g, bar, val, per }) => {
        const tr = T(r.at);
        A(g, t, tr, out, { type: 'left' });
        const w = Math.max(10, 380 * r.value / max) * prog(t, tr + .15, .7, ease.outQuart);
        bar.style.width = w + 'px'; val.style.left = (358 + w) + 'px'; per.style.left = (362 + w) + 'px';
      });
    };
  });
}

// CTA / statement with sprite(s)
export function cta(start, end, { top, sprites = [], head, headY = 1000, headSize = 100, sub = 'RÉPONDEZ EN COMMENTAIRE ↓', follow }) {
  scene(start, end, (root, t0) => {
    const tp = top ? text(root, top, { cls: 'mono', y: 228, size: 26 }) : null;
    const sps = sprites.map(sp => obj(root, sp.name, { cx: sp.cx ?? 540, by: sp.by ?? 940, w: sp.size || 560 }));
    const hd = text(root, head, { y: headY, size: headSize });
    const sb = sub ? text(root, sub, { cls: 'mono', y: 1196, size: 24, style: { color: 'var(--cream)' } }) : null;
    sfx('whoosh', t0 + .05, .6); sfx('pop', t0 + .2, .7);
    const fb = follow ? followButton(root, { y: 1150 }) : null;
    const tf0 = follow ? T(follow) : 1e9;
    if (fb) { sfx('pop', tf0 + .05, .7); sfx('click', tf0 + .75, .9); sfx('sparkle', tf0 + .8, .6); }
    return t => {
      const out = end - OUT;
      if (tp) A(tp, t, t0, out, { type: 'fade' });
      sps.forEach((s, i) => A(s, t, t0 + .1 + i * .1, out, { type: 'pop', float: 6, phase: i }));
      if (sb && !sb.placed && hd.offsetHeight > 0) { sb.placed = true; const bottom = headY + hd.offsetHeight + 14; if (bottom > 1196) sb.style.top = bottom + 'px'; }
      A(hd, t, t0 + .25, out, { type: 'up' }); if (sb) A(sb, t, t0 + .9, fb ? tf0 - .05 : out, { type: 'fade' });
      if (fb) { if (!fb.placed && hd.offsetHeight > 0) { fb.placed = true; const bottom = headY + hd.offsetHeight + 24; if (bottom > 1140) fb.el.style.top = bottom + 'px'; } fb.update(t, tf0, out); }
    };
  });
}

// run a list of beats: each {at: cue, fn: (start, end) => ...}
export function seq(list) {
  const starts = list.map((b, i) => i === 0 ? 0 : T(b.at) - .3);
  list.forEach((b, i) => b.fn(starts[i], i + 1 < list.length ? starts[i + 1] : TL.duration + 1));
}
export const at = (c, dt = 0) => [c, dt];


// animated "+ S'ABONNER" pill that gets pressed and turns into "✓ ABONNÉ"
export function followButton(root, { y = 1150 } = {}) {
  const el = box(root, { x: 0, y, w: 1080, hgt: 110, z: 8 });
  const pill = h('div', 'abs', '', { left: '50%', top: '0px', height: '104px', width: '470px', marginLeft: '-235px', borderRadius: '52px', background: 'var(--red)', boxShadow: '0 18px 50px rgba(255,90,78,.35)' });
  const lab = h('div', 'head abs', "+&nbsp;S’ABONNER", { left: 0, right: 0, top: '27px', textAlign: 'center', fontSize: '54px', color: '#fff' });
  const lab2 = h('div', 'head abs', '✓&nbsp;ABONNÉ', { left: 0, right: 0, top: '27px', textAlign: 'center', fontSize: '54px', color: 'var(--ink)', opacity: 0 });
  pill.appendChild(lab); pill.appendChild(lab2); el.appendChild(pill);
  const hand = h('div', 'abs', '', { left: '640px', top: '60px', width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(243,236,223,.9)', boxShadow: '0 10px 30px rgba(0,0,0,.35)' });
  el.appendChild(hand);
  const bst = burst(el, { cx: 540, cy: 52, n: 12, color: 'var(--mint)', r0: 120, r1: 300 });
  return { el, update(t, t0, out) {
    A(el, t, t0, out, { type: 'pop' });
    const press = t0 + .7;
    const k = clamp((t - press) / .12), back = clamp((t - press - .12) / .2);
    pill.style.transform = `scale(${1 - .08 * k + .08 * back})`;
    const on = t >= press + .06;
    pill.style.background = on ? 'var(--mint)' : 'var(--red)';
    pill.style.boxShadow = on ? '0 18px 50px rgba(46,230,160,.35)' : '0 18px 50px rgba(255,90,78,.35)';
    lab.style.opacity = on ? 0 : 1; lab2.style.opacity = on ? 1 : 0;
    // tap indicator: comes in, taps, leaves
    const hin = ease.outCubic(clamp((t - t0 - .2) / .45)), hout = clamp((t - press - .35) / .3);
    tf(hand, { x: lerp(160, 0, hin) + hout * 60, y: lerp(120, 0, hin) + hout * 60, s: 1 - .18 * k + .18 * back, o: t < t0 + .2 ? 0 : (1 - hout) * .95 });
    bst(t, press + .05);
  } };
}

// receipt: a paper ticket listing costs line by line, then a total and a stamp
export function receipt(start, end, { lab, title = 'TICKET', head, rows, total, stamp, dec = 2, unit = '€', foot, y = 330, w = 820, rowH = 84 }) {
  scene(start, end, (root, t0) => {
    const L = lab ? label(root, lab[0], lab[1]) : null;
    const H = head ? text(root, head.html, { y: head.y ?? 270, size: head.size || 70 }) : null;
    const F = foot ? text(root, foot, { cls: 'foot', y: 1222 }) : null;
    const top = head ? (head.below ?? y + 60) : y;
    const hgt = 120 + rows.length * rowH + 150;
    const x = (1080 - w) / 2;
    const paper = box(root, { x, y: top, w, hgt, z: 3 });
    const zig = []; const n = 22; for (let i = 0; i <= n; i++) zig.push(`${(i / n * 100).toFixed(2)}% ${i % 2 ? 'calc(100% - 18px)' : '100%'}`);
    Object.assign(paper.style, { background: '#F7F1E6', borderRadius: '18px 18px 0 0', clipPath: `polygon(0 0, 100% 0, ${zig.reverse().join(', ')})`, boxShadow: '0 40px 90px rgba(0,0,0,.45)' });
    const ink = '#10261F', muted = 'rgba(16,38,31,.55)';
    paper.appendChild(h('div', 'mono abs', title, { left: 0, right: 0, top: '38px', textAlign: 'center', fontSize: '24px', color: muted }));
    paper.appendChild(h('div', 'abs', '', { left: '40px', right: '40px', top: '92px', borderTop: `3px dashed rgba(16,38,31,.25)` }));
    const val = (v, sign) => (sign || '') + fmt(Math.abs(v), dec) + '&nbsp;' + unit;
    const els = rows.map((r, i) => {
      const e = box(paper, { x: 40, y: 112 + i * rowH, w: w - 80, hgt: rowH });
      e.appendChild(h('div', 'abs', r.label, { left: 0, top: '20px', fontFamily: 'var(--fText)', fontWeight: 700, fontSize: '36px', color: ink, letterSpacing: '-.01em' }));
      if (r.sub) e.appendChild(h('div', 'mono abs', r.sub, { left: 0, top: '62px', fontSize: '17px', color: muted }));
      e.appendChild(h('div', 'num abs', val(r.value, r.sign ?? '−'), { right: 0, top: '14px', fontSize: '48px', color: r.color ? col(r.color) : '#D9443A' }));
      sfx('click', T(r.at) + .02, .8);
      return { r, e };
    });
    const sep = h('div', 'abs', '', { left: '40px', right: '40px', top: (120 + rows.length * rowH) + 'px', borderTop: `3px dashed rgba(16,38,31,.25)` }); paper.appendChild(sep);
    const tot = box(paper, { x: 40, y: 132 + rows.length * rowH, w: w - 80, hgt: 110 });
    tot.appendChild(h('div', 'head abs', total.label, { left: 0, top: '30px', fontSize: '50px', color: ink }));
    const tv = h('div', 'num abs', val(total.value, total.sign ?? ''), { right: 0, top: '10px', fontSize: '86px', color: col(total.color || 'mint').replace('var(--mint)', '#12A86F') });
    tot.appendChild(tv);
    sfx('whoosh', t0 + .05, .45); sfx('ding', T(total.at) + .05, .9);
    let st = null;
    if (stamp) {
      st = text(root, stamp.html, { cls: 'head', y: stamp.y ?? top + hgt + 40, size: stamp.size || 74, z: 9, color: col(stamp.color || 'red') });
      Object.assign(st.style, { left: '50%', width: 'auto', marginLeft: '0', padding: '10px 26px 6px', border: `8px solid ${col(stamp.color || 'red')}`, borderRadius: '16px', whiteSpace: 'nowrap', transform: 'translateX(-50%)' });
      sfx('stamp', T(stamp.at) + .02, .9);
    }
    return t => {
      const out = end - OUT;
      if (L) A(L, t, t0, out, { type: 'fade' }); if (H) A(H, t, head.at ? T(head.at) : t0 + .05, out, { type: 'up' }); if (F) A(F, t, t0 + .4, out, { type: 'fade' });
      A(paper, t, t0 + .05, out, { type: 'up', dist: 160 });
      for (const { r, e } of els) { const p = prog(t, T(r.at), .28); e.style.opacity = p; e.style.transform = `translateX(${(1 - p) * -30}px)`; }
      const pt = prog(t, T(total.at), .35); tot.style.opacity = pt; sep.style.opacity = pt;
      tv.style.transform = `scale(${pulse(t, T(total.at) + .1, .12, .45)})`; tv.style.transformOrigin = '100% 50%';
      if (st) { const ts = T(stamp.at); const k = clamp((t - ts) / .18); const o = t < ts ? 0 : 1;
        st.style.opacity = o * (t > out ? clamp(1 - (t - out) / .12) : 1); st.style.transform = `translateX(-50%) rotate(-8deg) scale(${lerp(1.9, 1, ease.outBack ? ease.outBack(k) : k)})`; }
    };
  });
}

// split bar: where a total goes (stacked horizontal bar + legend rows)
export function splitbar(start, end, { lab, head, headAt, total, totalLabel, rows, focus, foot, y = 520, unit = '€', dec = 0, notes = [] }) {
  scene(start, end, (root, t0) => {
    const L = lab ? label(root, lab[0], lab[1]) : null;
    const H = head ? text(root, head, { y: 270, size: 84 }) : null;
    const F = foot ? text(root, foot, { cls: 'foot', y: 1222 }) : null;
    const tl = totalLabel ? text(root, totalLabel, { cls: 'mono', y: y - 52, size: 24, style: { color: 'var(--cream)' } }) : null;
    const track = box(root, { x: 70, y, w: 940, hgt: 110 });
    Object.assign(track.style, { borderRadius: '22px', background: 'rgba(255,255,255,.06)', boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,.1)', overflow: 'hidden' });
    let acc = 0;
    const segs = rows.map(r => { const sg = h('div', 'abs', '', { left: (acc / total * 940) + 'px', top: 0, height: '110px', width: '0px', background: col(r.color) }); acc += r.value; track.appendChild(sg); return sg; });
    const leg = rows.map((r, i) => {
      const e = box(root, { x: 70, y: y + 150 + i * 96, w: 940, hgt: 84 });
      e.appendChild(h('div', 'abs', '', { left: 0, top: '22px', width: '40px', height: '40px', borderRadius: '10px', background: col(r.color) }));
      e.appendChild(h('div', 'head abs', r.label, { left: '64px', top: r.sub ? '8px' : '20px', fontSize: '46px' }));
      if (r.sub) e.appendChild(h('div', 'mono abs', r.sub, { left: '66px', top: '54px', fontSize: '18px' }));
      e.appendChild(h('div', 'num abs', (r.display ?? fmt(r.value, dec)) + `<span class="u">${unit}</span>`, { right: 0, top: '10px', fontSize: '58px', color: col(r.color === 'cream' ? 'white' : r.color) }));
      sfx('pop', T(r.at) + .05, .55); return e;
    });
    sfx('whoosh', t0 + .05, .45);
    const nts = notes.map(n => { sfx(n.sfx || 'pop', T(n.at) + .03, .7); return { n, e: n.kind === 'sprite' ? obj(root, n.name, { cx: n.cx ?? 540, by: n.by, w: n.size || 300 }) : text(root, n.kind === 'mono' ? n.html : `<span class="chip ${n.style || 'mint'}" style="font-size:${n.size || 52}px;padding:12px 26px">${n.html}</span>`, { cls: n.kind === 'mono' ? 'mono' : 'abs', y: n.y, z: 7 }) }; });
    let fc = null;
    if (focus) { fc = text(root, `<span class="chip ${focus.style || 'mint'}" style="font-size:52px;padding:12px 26px">${focus.html}</span>`, { cls: 'abs', y: y - 130, z: 7 }); sfx('stamp', T(focus.at) + .02, .7); }
    return t => {
      const out = end - OUT;
      if (L) A(L, t, t0, out, { type: 'fade' }); if (H) A(H, t, headAt ? T(headAt) : t0 + .05, out, { type: 'up' }); if (F) A(F, t, t0 + .4, out, { type: 'fade' });
      if (tl) A(tl, t, t0 + .1, out, { type: 'fade' });
      A(track, t, t0 + .1, out, { type: 'up' });
      const tfc = focus ? T(focus.at) : 1e9;
      rows.forEach((r, i) => {
        const p = prog(t, T(r.at), .7, ease.outQuart);
        segs[i].style.width = (r.value / total * 940 * p) + 'px';
        const dim = focus && t >= tfc && i !== focus.idx ? lerp(1, .25, prog(t, tfc, .35)) : 1;
        segs[i].style.opacity = dim;
        A(leg[i], t, T(r.at), out, { type: 'left', base: { s: focus && i === focus.idx ? pulse(t, tfc, .06, .5) : 1 } });
        leg[i].style.opacity = (+leg[i].style.opacity || 0) * dim;
      });
      if (fc) A(fc, t, tfc, out, { type: 'stamp' });
      for (const { n, e } of nts) A(e, t, T(n.at), out, { type: n.anim || (n.kind === 'sprite' ? 'pop' : 'stamp'), float: n.kind === 'sprite' ? 5 : 0 });
    };
  });
}

// line chart: x/y axes, series drawn progressively, markers on cues
export function chart(start, end, { lab, head, headAt, x: [x0, x1], y: [y0, y1], xticks = [], yticks = [], xfmt = v => v, yfmt = v => fmt(v), series, marks = [], foot, box: bx = { x: 120, y: 440, w: 860, h: 640 }, legend = [] }) {
  scene(start, end, (root, t0) => {
    const L = lab ? label(root, lab[0], lab[1]) : null;
    const H = head ? text(root, head, { y: 270, size: 80 }) : null;
    const F = foot ? text(root, foot, { cls: 'foot', y: 1222 }) : null;
    const P = panel(root, { x: 40, y: bx.y - 50, w: 1000, hgt: bx.h + 130 });
    const s = svg('svg', { width: 1080, height: 1920, viewBox: '0 0 1080 1920' }); Object.assign(s.style, { position: 'absolute', left: 0, top: 0, overflow: 'visible' }); root.appendChild(s);
    const X = v => bx.x + (v - x0) / (x1 - x0) * bx.w, Y = v => bx.y + bx.h - (v - y0) / (y1 - y0) * bx.h;
    const axes = svg('g', {}); s.appendChild(axes);
    for (const v of yticks) { axes.appendChild(svg('line', { x1: bx.x, x2: bx.x + bx.w, y1: Y(v), y2: Y(v), stroke: 'rgba(226,242,234,.10)', 'stroke-width': 2 }));
      const tx = svg('text', { x: bx.x - 14, y: Y(v) + 7, 'text-anchor': 'end', fill: 'rgba(226,242,234,.5)', 'font-size': 20 }); tx.textContent = yfmt(v); axes.appendChild(tx); }
    for (const v of xticks) { const tx = svg('text', { x: X(v), y: bx.y + bx.h + 40, 'text-anchor': 'middle', fill: 'rgba(226,242,234,.5)', 'font-size': 20 }); tx.textContent = xfmt(v); axes.appendChild(tx); }
    axes.appendChild(svg('line', { x1: bx.x, x2: bx.x + bx.w, y1: Y(y0), y2: Y(y0), stroke: 'rgba(226,242,234,.35)', 'stroke-width': 2 }));
    const paths = series.map(sr => {
      const N = 160, pts = [], xa = sr.from ?? x0, xb = sr.to ?? x1; for (let i = 0; i <= N; i++) { const xv = xa + (xb - xa) * i / N; pts.push([X(xv), Y(sr.fn(xv))]); }
      const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('');
      let area = null;
      if (sr.fill) { area = svg('path', { d: d + `L${pts[N][0]} ${Y(y0)} L${pts[0][0]} ${Y(y0)} Z`, fill: col(sr.color), opacity: 0 }); s.appendChild(area); }
      const pth = svg('path', { d, fill: 'none', stroke: col(sr.color), 'stroke-width': sr.width || 9, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }); s.appendChild(pth);
      const len = pth.getTotalLength(); pth.setAttribute('stroke-dasharray', len); pth.setAttribute('stroke-dashoffset', len);
      const lb = sr.label ? svg('text', { 'text-anchor': sr.labelAnchor || 'end', fill: col(sr.color), 'font-size': 24, 'font-weight': 700, 'letter-spacing': 1.5 }) : null;
      if (lb) { lb.textContent = sr.label; const lp = sr.labelAt || [x1, sr.fn(x1)]; lb.setAttribute('x', X(lp[0]) + (sr.ldx ?? 0)); lb.setAttribute('y', Y(lp[1]) + (sr.ldy ?? -18)); s.appendChild(lb); }
      sfx('draw', T(sr.at) + .05, .5, sr.dur || 1.6);
      return { sr, pth, len, area, lb };
    });
    const mk = marks.map(m => {
      const g = svg('g', {}); s.appendChild(g);
      if (m.vline !== false) g.appendChild(svg('line', { x1: X(m.x), x2: X(m.x), y1: Y(y0), y2: Y(m.y), stroke: 'rgba(243,236,223,.45)', 'stroke-width': 3, 'stroke-dasharray': '8 8' }));
      g.appendChild(svg('circle', { cx: X(m.x), cy: Y(m.y), r: 16, fill: col(m.color || 'cream'), stroke: '#081A14', 'stroke-width': 5 }));
      const tb = text(root, `<span class="chip ${m.style || 'dark'}" style="font-size:${m.size || 34}px">${m.html}</span>`, { cls: 'abs', x: X(m.x) + (m.dx ?? -540), y: Y(m.y) + (m.dy ?? -100), w: 1080, align: 'center', z: 6 });
      sfx('pop', T(m.at) + .05, .7);
      return { m, g, tb };
    });
    const lg = legend.map((l, i) => { const e = text(root, `<span style="display:inline-block;width:26px;height:26px;border-radius:7px;background:${col(l.color)};vertical-align:-3px;margin-right:12px"></span>${l.html}`, { cls: 'mono', x: 0, y: bx.y + bx.h + 74, w: 1080, size: 22, style: { color: 'var(--cream)' } }); return { l, e }; });
    if (lg.length > 1) { const gap = 1080 / lg.length; lg.forEach(({ e }, i) => { e.style.left = (i * gap) + 'px'; e.style.width = gap + 'px'; }); }
    sfx('whoosh', t0 + .05, .45);
    return t => {
      const out = end - OUT;
      if (L) A(L, t, t0, out, { type: 'fade' }); if (H) A(H, t, headAt ? T(headAt) : t0 + .05, out, { type: 'up' }); if (F) A(F, t, t0 + .4, out, { type: 'fade' });
      A(P, t, t0 + .05, out, { type: 'up', dist: 60 });
      const fade = t > out ? clamp(1 - (t - out) / .12) : clamp((t - t0) / .3);
      s.style.opacity = fade;
      for (const { sr, pth, len, area, lb } of paths) {
        const p = prog(t, T(sr.at), sr.dur || 1.6, ease.inOutCubic || ease.outCubic);
        pth.setAttribute('stroke-dashoffset', (len * (1 - p)).toFixed(1));
        if (area) area.setAttribute('opacity', (p * (sr.fillOpacity ?? .12)).toFixed(3));
        if (lb) lb.setAttribute('opacity', clamp((t - T(sr.at) - (sr.dur || 1.6) * .8) / .3));
      }
      for (const { m, g, tb } of mk) { const p = prog(t, T(m.at), .35); g.setAttribute('opacity', p); A(tb, t, T(m.at), out, { type: 'pop' }); }
      for (const { l, e } of lg) A(e, t, l.at ? T(l.at) : t0 + .3, out, { type: 'fade' });
    };
  });
}
