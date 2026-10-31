"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { markIntroDone } from "@/lib/intro";
import { lockScroll } from "@/lib/lenis";

const KEY = "at-intro-seen";

/** Rideau d'ouverture : bref, une seule fois par session, ignoré si mouvement réduit. */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const el = root.current;
    let seen = false;
    try {
      seen = sessionStorage.getItem(KEY) === "1";
    } catch {
      /* stockage indisponible */
    }
    if (!el || seen || prefersReducedMotion()) {
      setGone(true);
      markIntroDone();
      return;
    }
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* stockage indisponible */
    }

    lockScroll(true);
    const counter = el.querySelector<HTMLElement>("[data-counter]")!;
    const n = { v: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        lockScroll(false);
        setGone(true);
      },
    });
    tl.from(el.querySelectorAll("[data-pl-in]"), { yPercent: 110, duration: 1, stagger: 0.08, ease: "expo.out" })
      .to(n, {
        v: 100,
        duration: 1.3,
        ease: "power2.inOut",
        onUpdate: () => {
          counter.textContent = String(Math.round(n.v)).padStart(3, "0");
        },
      }, 0.1)
      .fromTo(el.querySelector("[data-pl-bar]"), { scaleX: 0 }, { scaleX: 1, duration: 1.3, ease: "power2.inOut" }, 0.1)
      .to(el.querySelectorAll("[data-pl-in]"), { yPercent: -110, duration: 0.7, stagger: 0.04, ease: "expo.in" }, ">-0.05")
      .add(() => markIntroDone(), ">-0.15")
      .to(el.querySelector("[data-pl-top]"), { yPercent: -100, duration: 1.1, ease: "expo.inOut" }, "<")
      .to(el.querySelector("[data-pl-bottom]"), { yPercent: 100, duration: 1.1, ease: "expo.inOut" }, "<");

    return () => {
      tl.kill();
      lockScroll(false);
    };
  }, []);

  if (gone) return null;

  return (
    <div ref={root} data-preloader className="fixed inset-0 z-[150]" aria-hidden="true">
      <div data-pl-top className="absolute inset-x-0 top-0 h-1/2 bg-ink" />
      <div data-pl-bottom className="absolute inset-x-0 bottom-0 h-1/2 bg-ink" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 text-cream">
        <div className="overflow-hidden">
          <p data-pl-in className="font-serif text-[clamp(2.4rem,6vw,4.5rem)] leading-none">
            Anaëlle <em className="italic text-sand">Toso</em>
          </p>
        </div>
        <div className="flex w-[min(320px,70vw)] items-center gap-4">
          <div className="overflow-hidden">
            <span data-pl-in className="micro block text-cream/60">Dentisterie équine</span>
          </div>
          <span className="relative h-px flex-1 bg-line">
            <span data-pl-bar className="absolute inset-0 origin-left bg-cream" />
          </span>
          <div className="overflow-hidden">
            <span data-pl-in data-counter className="micro block tabular-nums text-cream/60">
              000
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
