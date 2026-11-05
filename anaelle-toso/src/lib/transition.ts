"use client";

import { gsap, prefersReducedMotion } from "./gsap";

/**
 * Rideau de transition entre les pages.
 * cover() recouvre l'écran puis exécute la navigation ; uncover() le relève sur la nouvelle page.
 * En navigation « dure » (export statique), un drapeau de session permet de démarrer la nouvelle page recouverte.
 */
let curtain: HTMLElement | null = null;
let covered = false;
const FLAG = "at-nav";

export function registerCurtain(el: HTMLElement | null) {
  curtain = el;
}

/** Faisceau lumineux qui accompagne le bord du rideau (de bas en haut). */
function sweepEdge(duration: number, delay = 0) {
  const edge = document.querySelector<HTMLElement>("[data-curtain-edge]");
  if (!edge) return;
  gsap.killTweensOf(edge);
  gsap.fromTo(
    edge,
    { y: window.innerHeight, autoAlpha: 1 },
    { y: 0, duration, delay, ease: "expo.inOut", onComplete: () => gsap.to(edge, { autoAlpha: 0, duration: 0.25 }) },
  );
}

export function cover(label: string, then: () => void) {
  const el = curtain;
  if (!el || prefersReducedMotion()) {
    then();
    return;
  }
  try {
    sessionStorage.setItem(FLAG, "1");
  } catch {
    /* stockage indisponible */
  }
  const lab = el.querySelector<HTMLElement>("[data-curtain-label]");
  if (lab) lab.textContent = label;
  covered = true;
  gsap.killTweensOf(el);
  gsap.set(el, { visibility: "visible" });
  sweepEdge(0.42);
  gsap
    .timeline({ onComplete: then })
    .fromTo(el, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.42, ease: "expo.inOut" })
    .fromTo(el.querySelectorAll("[data-curtain-in]"), { yPercent: 110 }, { yPercent: 0, duration: 0.4, stagger: 0.04, ease: "expo.out" }, 0.12);
}

export function uncover() {
  const el = curtain;
  let flagged = false;
  try {
    flagged = sessionStorage.getItem(FLAG) === "1";
    sessionStorage.removeItem(FLAG);
  } catch {
    /* stockage indisponible */
  }
  document.documentElement.classList.remove("nav-in");
  if (!el || (!covered && !flagged)) return;
  covered = false;
  gsap.killTweensOf(el);
  gsap.set(el, { visibility: "visible", clipPath: "inset(0% 0% 0% 0%)" });
  // relevé après le premier affichage de la nouvelle page (aucun flash de contenu non stylé)
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      sweepEdge(0.58, 0.12);
      gsap
        .timeline({ onComplete: () => gsap.set(el, { visibility: "hidden", clearProps: "willChange" }) })
        .to(el.querySelectorAll("[data-curtain-in]"), { yPercent: -110, duration: 0.22, stagger: 0.025, ease: "expo.in" })
        .to(el, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.58, ease: "expo.inOut" }, ">-0.1");
    }),
  );
  // filet de sécurité : le rideau ne doit jamais rester devant la page
  window.setTimeout(() => {
    if (!covered && el.style.visibility !== "hidden") {
      gsap.killTweensOf(el);
      gsap.set(el, { visibility: "hidden", clipPath: "inset(0% 0% 100% 0%)" });
    }
  }, 1800);
}

export function isCovered() {
  return covered;
}
