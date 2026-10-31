"use client";

import { useEffect, useRef } from "react";
import { gsap, isFinePointer, prefersReducedMotion } from "@/lib/gsap";

/** Curseur personnalisé (ordinateur uniquement). Les éléments peuvent fournir data-cursor="Libellé". */
export function Cursor() {
  const root = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || !isFinePointer() || prefersReducedMotion()) return;
    document.documentElement.classList.add("has-cursor");
    el.hidden = false;

    const dot = el.querySelector<HTMLElement>(".cursor-dot")!;
    const ring = el.querySelector<HTMLElement>(".cursor-ring")!;
    const lab = label.current!;
    const dx = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3" });
    const dy = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3" });
    const rx = gsap.quickTo([ring, lab], "x", { duration: 0.55, ease: "power3" });
    const ry = gsap.quickTo([ring, lab], "y", { duration: 0.55, ease: "power3" });

    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      el.classList.remove("is-hidden");
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
    };
    const over = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      const labelled = t?.closest<HTMLElement>("[data-cursor]");
      const interactive = t?.closest("a, button, [role='button'], label, summary, input[type='checkbox'], input[type='radio']");
      if (labelled) {
        lab.textContent = labelled.dataset.cursor || "";
        el.classList.add("has-label");
        el.classList.remove("is-hover");
      } else {
        el.classList.remove("has-label");
        el.classList.toggle("is-hover", !!interactive);
      }
    };
    const leave = () => el.classList.add("is-hidden");

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", over, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div ref={root} className="cursor is-hidden" aria-hidden="true" hidden>
      <span className="cursor-ring" />
      <span className="cursor-dot" />
      <span ref={label} className="cursor-label" />
    </div>
  );
}
