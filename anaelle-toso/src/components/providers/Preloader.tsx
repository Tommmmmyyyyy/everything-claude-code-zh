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
      <div data-pl-top className="absolute inset-x-0 top-0 h-1/2 border-b border-line bg-ink" />
      <div data-pl-bottom className="absolute inset-x-0 bottom-0 h-1/2 bg-ink" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-7 text-cream">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-80" />
        <div className="overflow-hidden">
          <div data-pl-in className="flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-[14px] border border-line-strong bg-[linear-gradient(145deg,rgb(126_247_198/0.2),rgb(99_216_255/0.05))] font-serif text-[1rem] tracking-[-0.04em] shadow-[0_0_34px_-6px_rgb(126_247_198/0.7)]">
              AT
            </span>
            <p className="font-serif text-[clamp(1.9rem,4.6vw,3.6rem)] font-light leading-none tracking-[-0.05em]">
              Anaëlle <em className="font-extralight text-sand">Toso</em>
            </p>
          </div>
        </div>
        <div className="relative flex w-[min(380px,78vw)] items-center gap-4">
          <div className="overflow-hidden">
            <span data-pl-in className="micro block text-cream/55">Dentisterie équine</span>
          </div>
          <span className="relative h-px flex-1 bg-line">
            <span data-pl-bar className="absolute inset-0 origin-left bg-cognac shadow-[0_0_10px_var(--color-cognac)]" />
          </span>
          <div className="overflow-hidden">
            <span data-pl-in data-counter className="micro block tabular-nums text-sand">
              000
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
