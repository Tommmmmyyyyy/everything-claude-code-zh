// Deterministic motion-graphics runtime: everything is a pure function of time t (seconds).
export let TL = null;
export const SFX = [];
const scenes = [];
const tickers = [];

// ---------- math / easing ----------
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, k) => a + (b - a) * k;
export const ease = {
  linear: x => x,
  inCubic: x => x * x * x,
  outCubic: x => 1 - Math.pow(1 - x, 3),
  outQuart: x => 1 - Math.pow(1 - x, 4),
  outQuint: x => 1 - Math.pow(1 - x, 5),
  outExpo: x => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
  inOutCubic: x => (x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  inOutSine: x => -(Math.cos(Math.PI * x) - 1) / 2,
  outBack: (x, s = 1.7) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2),
  outElastic: x => (x <= 0 ? 0 : x >= 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - .75) * (2 * Math.PI) / 3) + 1),
};
export const prog = (t, t0, dur = .5, fn = ease.outCubic) => fn(clamp((t - t0) / dur));

// ---------- timeline ----------
export async function loadTimeline(url) { TL = await (await fetch(url)).json(); return TL; }
export function cue(name, dt = 0) {
  if (!(name in TL.cues)) throw new Error('missing cue ' + name);
  return TL.cues[name] + dt;
}
export const lineEnd = id => TL.cues['end:' + id];
export const lineStart = id => TL.cues['line:' + id];

// ---------- DOM ----------
export function h(tag, cls = '', html = '', style = {}) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (html) el.innerHTML = html;
  Object.assign(el.style, style);
  return el;
}
export function svg(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  return el;
}
export function sprite(parent, name, { x, y, w, z = 1 }) {
  // x,y = center-bottom anchor in stage px, w = width
  const el = h('img', 'sprite'); el.src = `../../assets/sprites/${name}.png`;
  Object.assign(el.style, { left: (x - w / 2) + 'px', top: (y - w * .82) + 'px', width: w + 'px', height: w + 'px', zIndex: z });
  parent.appendChild(el); return el;
}
export function tf(el, { x = 0, y = 0, s = 1, sx = 1, sy = 1, r = 0, o = 1, blur = 0 } = {}) {
  el.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${(s * sx).toFixed(4)}, ${(s * sy).toFixed(4)}) rotate(${r.toFixed(2)}deg)`;
  el.style.opacity = clamp(o).toFixed(3);
  el.style.filter = blur > .05 ? `blur(${blur.toFixed(2)}px)` : 'none';
  el.style.visibility = o <= .001 ? 'hidden' : 'visible';
}
// Standard enter / exit envelope -> transform params
export function anim(t, t0, t1 = Infinity, o = {}) {
  const type = o.type || 'up', din = o.din ?? .45, dout = o.dout ?? .3;
  const p = clamp((t - t0) / din), q = clamp((t - t1) / dout);
  const r = { x: 0, y: 0, s: 1, o: 1, blur: 0, r: 0 };
  if (t < t0) { r.o = 0; return r; }
  if (type === 'pop') { r.s = lerp(o.from ?? .4, 1, ease.outBack(p, o.back ?? 1.8)); r.o = clamp(p * 3); }
  else if (type === 'up') { const e = ease.outQuart(p); r.y = (1 - e) * (o.dist ?? 46); r.o = e; r.blur = (1 - e) * 8; }
  else if (type === 'down') { const e = ease.outQuart(p); r.y = -(1 - e) * (o.dist ?? 46); r.o = e; r.blur = (1 - e) * 8; }
  else if (type === 'left') { const e = ease.outQuart(p); r.x = (1 - e) * (o.dist ?? 80); r.o = e; r.blur = (1 - e) * 8; }
  else if (type === 'right') { const e = ease.outQuart(p); r.x = -(1 - e) * (o.dist ?? 80); r.o = e; r.blur = (1 - e) * 8; }
  else if (type === 'blur') { const e = ease.outCubic(p); r.blur = (1 - e) * 22; r.o = e; r.s = lerp(1.08, 1, e); }
  else if (type === 'fade') { r.o = ease.outCubic(p); }
  else if (type === 'stamp') { r.s = lerp(1.9, 1, ease.outQuart(p)); r.o = clamp(p * 4); r.r = lerp(o.rot ?? -6, o.rot2 ?? -3, ease.outQuart(p)); }
  if (q > 0) { const e = ease.inCubic(q); r.o *= 1 - e; if (o.outType === 'down') r.y += e * 40; else { r.y -= e * (o.outDist ?? 30); r.blur += e * 10; } r.s *= 1 - e * .04; }
  // gentle float while visible
  if (o.float) r.y += Math.sin((t - t0) * 1.4 + (o.phase || 0)) * o.float;
  return r;
}
export const A = (el, t, t0, t1, o = {}) => { const r = anim(t, t0, t1, o); if (o.base) { r.x += o.base.x || 0; r.y += o.base.y || 0; r.s *= o.base.s ?? 1; r.r += o.base.r || 0; } tf(el, r); return r; };

// ---------- formatting ----------
const NB = ' ';
export function fmt(n, dec = 0) {
  const neg = n < 0; n = Math.abs(n);
  let [i, d] = n.toFixed(dec).split('.');
  i = i.replace(/\B(?=(\d{3})+(?!\d))/g, NB);
  return (neg ? '−' : '') + i + (d ? ',' + d : '');
}
export const eur = (n, dec = 0) => `${fmt(n, dec)}<span class="u">€</span>`;

// ---------- odometer number ----------
export class Odo {
  constructor(parent, { cls = 'num', suffix = '<span class="u">€</span>', prefix = '', maxDigits = 7, style = {} } = {}) {
    this.el = h('div', cls, '', style); parent.appendChild(this.el);
    if (prefix) this.el.appendChild(h('span', 'p', prefix));
    this.box = h('span', '', '', { display: 'inline-flex', alignItems: 'baseline' }); this.el.appendChild(this.box);
    this.cols = [];
    for (let k = maxDigits - 1; k >= 0; k--) {
      const cell = h('span', '', '', { display: 'inline-block', height: '1em', overflow: 'hidden', lineHeight: '1em', verticalAlign: 'baseline', position: 'relative' });
      const strip = h('span', '', '', { display: 'block' });
      strip.innerHTML = '0123456789'.split('').concat(['0']).map(d => `<span style="display:block;height:1em">${d}</span>`).join('');
      cell.appendChild(strip);
      const sep = h('span', '', '', { display: 'inline-block', width: '.22em' });
      this.box.appendChild(cell); if (k % 3 === 0 && k > 0) this.box.appendChild(sep);
      this.cols.push({ k, cell, strip, sep: (k % 3 === 0 && k > 0) ? sep : null });
    }
    if (suffix) this.el.insertAdjacentHTML('beforeend', suffix);
  }
  set(v, speed = 0) {
    v = Math.max(0, v); const vi = Math.round(v);
    const nd = Math.max(1, String(Math.floor(vi)).length);
    for (const c of this.cols) {
      const show = c.k < nd;
      c.cell.style.display = show ? 'inline-block' : 'none';
      if (c.sep) c.sep.style.display = c.k < nd ? 'inline-block' : 'none';
      if (!show) continue;
      const pk = Math.pow(10, c.k);
      let pos;
      if (speed < 1e-6) pos = Math.floor(vi / pk) % 10;
      else {
        const lower = (v / pk) % 1; // fraction of lower digits
        pos = Math.floor(v / pk) % 10 + (c.k === 0 ? lower : clamp((lower - .85) / .15));
      }
      c.strip.style.transform = `translateY(${(-pos).toFixed(4)}em)`;
      const blur = clamp(speed / pk / 30, 0, 1) * 7;
      c.strip.style.filter = blur > .2 ? `blur(${blur.toFixed(1)}px)` : 'none';
    }
  }
  // drive from a value function f(t)
  at(t, f) { const v = f(t), v2 = f(t - 1 / 30); this.set(v, Math.abs(v - v2) * 30); }
}
// count helper: value from a to b over [t0, t0+d]
export const count = (t, t0, d, a, b, fn = ease.outCubic) => lerp(a, b, fn(clamp((t - t0) / d)));

// ---------- captions ----------
export function buildCaptions(root) {
  const groups = [];
  for (const ln of TL.lines) {
    let cur = [];
    const flush = () => { if (cur.length) groups.push(cur); cur = []; };
    const W = ln.words;
    W.forEach((w, i) => {
      const chars = cur.reduce((a, x) => a + x.display.length + 1, 0);
      let rest = 0;
      for (let j = i; j < W.length; j++) { rest++; if (/[,.;:?!…]$/.test(W[j].display)) break; }
      const tooLong = cur.length >= 4 || chars + w.display.length > 24;
      const tailOk = rest === 1 && w.display.length <= 6 && chars + w.display.length <= 30;
      if (cur.length && tooLong && !tailOk) flush();
      cur.push(w);
      if (/[,.;:?!…]$/.test(w.display)) flush();
    });
    flush();
  }
  const els = groups.map(g => {
    const el = h('div', 'cap'); root.appendChild(el);
    const ws = g.map(w => {
      const esc = x => x.replace(/ /g, '&nbsp;').replace(/\u202F/g, '&#8239;');
      let core = w.display, tail = '';
      if (w.hl) { const m = core.match(/^(.*?)([,.;:?!…]+)$/); if (m) { core = m[1]; tail = m[2]; } }
      const s = h('span', 'w' + (w.hl ? ' hl' : ''), esc(core)); el.appendChild(s);
      if (tail) { const p = h('span', 'w', tail); el.appendChild(p); s.tail = p; }
      el.appendChild(document.createTextNode(' ')); return s; });
    return { el, ws, g };
  });
  els.forEach((e, i) => {
    const first = e.g[0], last = e.g[e.g.length - 1];
    e.t0 = first.start - .06;
    const next = els[i + 1];
    const hold = last.end + .55;
    e.t1 = next ? Math.min(next.g[0].start - .06, Math.max(hold, last.end + .1)) : last.end + 1.2;
    if (next && next.g[0].start - .06 - last.end < .8) e.t1 = next.g[0].start - .06;
  });
  return t => {
    for (const e of els) {
      const on = t >= e.t0 && t < e.t1;
      e.el.style.display = on ? 'block' : 'none';
      if (!on) continue;
      const p = ease.outCubic(clamp((t - e.t0) / .12));
      e.el.style.opacity = p; e.el.style.transform = `translateY(${(1 - p) * 14}px)`;
      e.ws.forEach((s, i) => { const on = t >= e.g[i].start - .03; s.classList.toggle('on', on); if (s.tail) s.tail.classList.toggle('on', on); });
    }
  };
}

// ---------- scenes ----------
export function scene(t0, t1, build, { pre = .1, post = .5 } = {}) {
  const root = h('div', 'abs', '', { inset: '0' });
  document.getElementById('stage').appendChild(root);
  const update = build(root, t0, t1);
  scenes.push({ t0: t0 - pre, t1: t1 + post, root, update });
}
export const ticker = f => tickers.push(f);
export const sfx = (name, at, gain = 1, dur = 0) => SFX.push({ name, at: +at.toFixed(3), gain, dur });

// ---------- background ----------
export function setupBackground() {
  const grain = document.getElementById('grain');
  const c = document.createElement('canvas'); c.width = 540; c.height = 960; const g = c.getContext('2d');
  const im = g.createImageData(540, 960); let s = 1234567;
  const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  for (let i = 0; i < im.data.length; i += 4) { const v = 100 + rnd() * 155; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
  g.putImageData(im, 0, 0);
  grain.style.backgroundImage = `url(${c.toDataURL()})`; grain.style.backgroundSize = '1080px 1920px';
  const glow = document.getElementById('glow');
  ticker(t => { glow.style.transform = `translate(${Math.sin(t * .23) * 120}px, ${Math.cos(t * .17) * 160}px)`; });
}

export function renderFrame(t) {
  for (const f of tickers) f(t);
  for (const s of scenes) {
    const on = t >= s.t0 && t <= s.t1;
    s.root.style.display = on ? 'block' : 'none';
    if (on) s.update(t);
  }
}

export async function boot(main) {
  await loadTimeline('build/timeline.json');
  setupBackground();
  await main();
  ticker(buildCaptions(document.getElementById('caps')));
  await document.fonts.ready;
  await Promise.all([...document.images].map(i => i.decode().catch(() => { })));
  window.DURATION = TL.duration;
  window.SFX = SFX;
  window.renderFrame = renderFrame;
  renderFrame(0);
  window.ready = true;
}
