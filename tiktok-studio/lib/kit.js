// Reusable visual components built on the engine
import { h, svg, sprite, tf, A, anim, clamp, lerp, ease, prog, sfx } from './engine.js';

export function box(parent, { x = 0, y = 0, w = 1080, hgt = 0, cls = 'abs', z, origin } = {}) {
  const el = h('div', cls, '', { left: x + 'px', top: y + 'px', width: w + 'px' });
  if (hgt) el.style.height = hgt + 'px';
  if (z != null) el.style.zIndex = z;
  if (origin) el.style.transformOrigin = origin;
  parent.appendChild(el); return el;
}
export function text(parent, html, { cls = 'head', x = 0, y = 0, w = 1080, align = 'center', size, color, z, style = {} } = {}) {
  const el = h('div', cls + ' abs', html, { left: x + 'px', top: y + 'px', width: w + 'px', textAlign: align, ...style });
  if (size) el.style.fontSize = size + 'px';
  if (color) el.style.color = color;
  if (z != null) el.style.zIndex = z;
  parent.appendChild(el); return el;
}
// sprite wrapped in a positioned box so we can animate it as a whole; (cx, by) = center-x, bottom-y of object
export function obj(parent, name, { cx, by, w, z = 2 }) {
  const g = box(parent, { x: cx - w / 2, y: by - w * .86, w, hgt: w, z, origin: '50% 86%' });
  const img = h('img', '', '', { width: '100%', height: '100%', display: 'block' }); img.src = `../../assets/sprites/${name}.png`;
  g.appendChild(img); g.img = img; return g;
}
// steam above a cup sprite group
export function steam(group, { cx = .5, top = .02, scale = 1 } = {}) {
  const s = svg('svg', { viewBox: '0 0 200 220', width: 200 * scale, height: 220 * scale });
  Object.assign(s.style, { position: 'absolute', left: `calc(${cx * 100}% - ${100 * scale}px)`, top: `calc(${top * 100}% - ${210 * scale}px)`, overflow: 'visible' });
  const paths = [];
  [[60, 0], [100, .33], [140, .66]].forEach(([x, ph]) => {
    const p = svg('path', { fill: 'none', stroke: 'rgba(243,236,223,.55)', 'stroke-width': 9, 'stroke-linecap': 'round' });
    s.appendChild(p); paths.push({ p, x, ph });
  });
  group.appendChild(s);
  return t => {
    for (const { p, x, ph } of paths) {
      const k = ((t * .55 + ph) % 1);
      let d = ''; const n = 14;
      for (let i = 0; i <= n; i++) {
        const u = i / n; const yy = 200 - u * 170 - k * 25;
        const xx = x + Math.sin(u * 5.5 + t * 2.4 + ph * 6) * 13 * (0.4 + u);
        d += (i ? 'L' : 'M') + xx.toFixed(1) + ' ' + yy.toFixed(1);
      }
      p.setAttribute('d', d);
      p.setAttribute('opacity', (Math.sin(k * Math.PI) * .9).toFixed(3));
    }
  };
}
// section label "01 · LE CALCUL"
export function label(parent, num, txt, { y = 228 } = {}) {
  return text(parent, `<span style="color:var(--mint)">${num}</span>&nbsp;&nbsp;·&nbsp;&nbsp;${txt}`, { cls: 'mono', y, size: 26 });
}
// glass panel
export function panel(parent, { x, y, w, hgt, tilt = true }) {
  const el = h('div', 'panel', '', { left: x + 'px', top: y + 'px', width: w + 'px', height: hgt + 'px' });
  parent.appendChild(el); el.tilt = tilt; return el;
}
// toggle switch
export function toggle(parent, { x, y, on = true }) {
  const el = h('div', 'abs', '', { left: x + 'px', top: y + 'px', width: '96px', height: '54px', borderRadius: '27px', background: 'var(--mint)', transition: 'none' });
  const k = h('div', 'abs', '', { top: '6px', left: '48px', width: '42px', height: '42px', borderRadius: '50%', background: '#fff', boxShadow: '0 4px 10px rgba(0,0,0,.3)' });
  el.appendChild(k); parent.appendChild(el);
  el.set = (v) => { // v: 1 on, 0 off
    k.style.left = lerp(6, 48, v) + 'px';
    el.style.background = `rgba(${Math.round(lerp(58, 46, v))},${Math.round(lerp(74, 230, v))},${Math.round(lerp(66, 160, v))},1)`;
  };
  el.set(on ? 1 : 0); return el;
}
// sparkle burst (deterministic)
export function burst(parent, { cx, cy, n = 10, color = 'var(--mint)', r0 = 40, r1 = 170 }) {
  const els = [];
  for (let i = 0; i < n; i++) { const e = h('div', 'abs', '', { width: '14px', height: '14px', borderRadius: '50%', background: color, left: cx - 7 + 'px', top: cy - 7 + 'px' }); parent.appendChild(e); els.push(e); }
  return (t, t0) => {
    const p = clamp((t - t0) / .7);
    els.forEach((e, i) => {
      const a = i / n * Math.PI * 2 + .3; const r = lerp(r0, r1, ease.outCubic(p));
      tf(e, { x: Math.cos(a) * r, y: Math.sin(a) * r, s: (1 - p) * (i % 2 ? 1 : .6), o: t < t0 ? 0 : 1 - p * p });
    });
  };
}
export const pulse = (t, t0, amp = .12, d = .45) => (t < t0 || t > t0 + d) ? 1 : 1 + amp * Math.sin(Math.PI * (t - t0) / d);

// brand logo tile (app-icon style). SVG symbols from Simple Icons (CC0); trademarks belong to their owners.
export const LOGOS = {
  anthropic: { bg: '#191919', fg: '#F0EEE6' }, claude: { bg: '#D97757', fg: '#FFFFFF' },
  rockstargames: { bg: '#FCAF17', fg: '#111111' }, taketwointeractivesoftware: { bg: '#111111', fg: '#FFFFFF' },
  playstation: { bg: '#0070D1', fg: '#FFFFFF' }, playstation5: { bg: '#111111', fg: '#FFFFFF' },
  spacex: { bg: '#0B0B0B', fg: '#FFFFFF' }, meta: { bg: '#FFFFFF', fg: '#0467DF' }, facebook: { bg: '#0866FF', fg: '#FFFFFF' },
  nvidia: { bg: '#111111', fg: '#76B900' }, openai: { bg: '#FFFFFF', fg: '#111111' }, cisco: { bg: '#1BA0D7', fg: '#FFFFFF' },
};
export function logo(parent, name, { cx = 540, cy = 400, size = 200, bg, fg, z = 4 } = {}) {
  const st = LOGOS[name] || { bg: '#111111', fg: '#FFFFFF' };
  const el = box(parent, { x: cx - size / 2, y: cy - size / 2, w: size, hgt: size, z, origin: '50% 50%' });
  Object.assign(el.style, { borderRadius: (size * .24) + 'px', background: bg || st.bg, boxShadow: '0 26px 60px rgba(0,0,0,.45), inset 0 0 0 2px rgba(255,255,255,.14)', overflow: 'hidden' });
  const url = `../../assets/logos/${name}.svg`;
  const ic = h('div', 'abs', '', { left: (size * .2) + 'px', top: (size * .2) + 'px', width: (size * .6) + 'px', height: (size * .6) + 'px', background: fg || st.fg });
  for (const k of ['-webkit-mask', 'mask']) ic.style.setProperty(k, `url(${url}) center / contain no-repeat`);
  el.appendChild(ic);
  el.appendChild(h('div', 'abs', '', { inset: 0, background: 'linear-gradient(180deg, rgba(255,255,255,.20), rgba(255,255,255,0) 46%)' }));
  if (!document.querySelector(`img[data-logo="${name}"]`)) { const im = h('img', '', '', { position: 'absolute', width: '1px', height: '1px', opacity: 0 }); im.src = url; im.dataset.logo = name; document.body.appendChild(im); }
  return el;
}
