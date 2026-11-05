"use client";

/**
 * Effet « décodage » : le texte apparaît en se stabilisant caractère par caractère,
 * comme un instrument qui se cale. Réservé aux textes courts (étiquettes, index) en
 * police à chasse fixe, pour que la largeur ne bouge pas pendant l'animation.
 */
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/#%+=";

export function scramble(el: HTMLElement, { duration = 0.9, delay = 0 }: { duration?: number; delay?: number } = {}) {
  const final = el.dataset.text ?? el.textContent ?? "";
  el.dataset.text = final;
  if (!el.getAttribute("aria-label") && !el.closest("[aria-hidden='true']")) el.setAttribute("aria-label", final);
  const chars = Array.from(final);
  const n = chars.length || 1;
  const t0 = performance.now() + delay * 1000;
  let raf = 0;
  let lastSwap = 0;
  let noise = chars.map(() => GLYPHS[(Math.random() * GLYPHS.length) | 0]);

  const tick = (t: number) => {
    const p = (t - t0) / (duration * 1000);
    if (p < 0) {
      raf = requestAnimationFrame(tick);
      return;
    }
    if (t - lastSwap > 55) {
      noise = chars.map(() => GLYPHS[(Math.random() * GLYPHS.length) | 0]);
      lastSwap = t;
    }
    let out = "";
    for (let i = 0; i < chars.length; i++) {
      const c = chars[i];
      const settle = 0.25 + (i / n) * 0.75;
      out += c === " " || p >= settle ? c : p >= settle - 0.5 ? noise[i] : " ";
    }
    el.textContent = out;
    if (p < 1) raf = requestAnimationFrame(tick);
    else el.textContent = final;
  };
  raf = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(raf);
    el.textContent = final;
  };
}
