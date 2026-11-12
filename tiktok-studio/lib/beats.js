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
export function waterfall(start, end, { lab, foot, title = ['', ''], unit = '€', startBar, steps, final, max }) {
  scene(start, end, (root, t0) => {
    const L = lab ? label(root, lab[0], lab[1], { y: 200 }) : null;
    const sub = text(root, title[0], { cls: 'mono', y: 412, size: 24, style: { color: 'var(--cream)' } });
    const odo = new Odo(root, { maxDigits: 6, suffix: `<span class="u">${unit}</span>`, style: { position: 'absolute', top: '245px', left: 0, right: 0, textAlign: 'center', fontSize: '150px', color: 'var(--cream)' } });
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
      const val = svg('text', { x: x + bw / 2, 'text-anchor': 'middle', fill: b.col, 'font-size': n > 6 ? 24 : 28, 'font-weight': 700 }); val.textContent = (b.v < 0 ? '−' : '') + fmt(Math.abs(b.v)) + ' ' + unit; s.appendChild(val);
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
export function cta(start, end, { top, sprites = [], head, headY = 1000, headSize = 100, sub = 'RÉPONDEZ EN COMMENTAIRE ↓' }) {
  scene(start, end, (root, t0) => {
    const tp = top ? text(root, top, { cls: 'mono', y: 228, size: 26 }) : null;
    const sps = sprites.map(sp => obj(root, sp.name, { cx: sp.cx ?? 540, by: sp.by ?? 940, w: sp.size || 560 }));
    const hd = text(root, head, { y: headY, size: headSize });
    const sb = sub ? text(root, sub, { cls: 'mono', y: 1196, size: 24, style: { color: 'var(--cream)' } }) : null;
    sfx('whoosh', t0 + .05, .6); sfx('pop', t0 + .2, .7);
    return t => {
      const out = end - OUT;
      if (tp) A(tp, t, t0, out, { type: 'fade' });
      sps.forEach((s, i) => A(s, t, t0 + .1 + i * .1, out, { type: 'pop', float: 6, phase: i }));
      A(hd, t, t0 + .25, out, { type: 'up' }); if (sb) A(sb, t, t0 + .9, out, { type: 'fade' });
    };
  });
}

// run a list of beats: each {at: cue, fn: (start, end) => ...}
export function seq(list) {
  const starts = list.map((b, i) => i === 0 ? 0 : T(b.at) - .3);
  list.forEach((b, i) => b.fn(starts[i], i + 1 < list.length ? starts[i + 1] : TL.duration + 1));
}
export const at = (c, dt = 0) => [c, dt];
