"use client";

import type Lenis from "lenis";

let instance: Lenis | null = null;

export function setLenis(l: Lenis | null) {
  instance = l;
}

export function getLenis() {
  return instance;
}

/** Défilement vers une cible (sélecteur, élément ou position), avec ou sans Lenis. */
export function scrollToTarget(target: string | HTMLElement | number, opts: { offset?: number; immediate?: boolean } = {}) {
  const lenis = instance;
  if (lenis) {
    // position absolue calculée depuis la page réelle : après un changement de page, la
    // position interne de Lenis peut encore être celle de la page précédente
    let dest: number | string | HTMLElement = target;
    if (typeof target !== "number") {
      const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
      if (!el) return;
      dest = el.getBoundingClientRect().top + window.scrollY + (opts.offset ?? 0);
    }
    lenis.scrollTo(dest, { offset: typeof target === "number" ? (opts.offset ?? 0) : 0, immediate: opts.immediate, force: true, duration: 1.25, easing: (t) => 1 - Math.pow(1 - t, 4) });
    return;
  }
  if (typeof target === "number") {
    window.scrollTo({ top: target });
    return;
  }
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY + (opts.offset ?? 0);
    window.scrollTo({ top });
  }
}

export function lockScroll(lock: boolean) {
  if (instance) {
    if (lock) instance.stop();
    else instance.start();
  }
  document.documentElement.style.overflow = lock ? "hidden" : "";
}
