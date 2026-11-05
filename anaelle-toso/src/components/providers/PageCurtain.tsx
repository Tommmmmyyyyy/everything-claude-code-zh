"use client";

import { useEffect, useRef } from "react";
import { registerCurtain } from "@/lib/transition";

/** Rideau de transition entre les pages : écran d'instrument, monogramme et nom de la page. */
export function PageCurtain() {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    registerCurtain(el.current);
    return () => registerCurtain(null);
  }, []);
  return (
    <>
    <div data-curtain-edge aria-hidden="true" className="pointer-events-none invisible fixed inset-x-0 top-0 z-[161] h-px bg-cognac shadow-[0_0_18px_3px_rgb(126_247_198/0.65),0_0_80px_16px_rgb(126_247_198/0.18)]" />
    <div ref={el} data-curtain aria-hidden="true" className="invisible fixed inset-0 z-[160] flex flex-col items-center justify-center gap-5 bg-ink" style={{ clipPath: "inset(0% 0% 0% 0%)" }}>
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-80" />
      <div className="relative overflow-hidden">
        <p data-curtain-in className="flex items-center gap-3 font-serif text-[clamp(1.6rem,4vw,2.8rem)] font-light leading-none tracking-[-0.05em] text-cream">
          <span className="grid h-10 w-10 place-items-center rounded-[18px] border border-line-strong font-serif text-[0.85rem] shadow-[0_0_26px_-6px_rgb(126_247_198/0.7)]">AT</span>
          Anaëlle <em className="font-extralight text-sand">Toso</em>
        </p>
      </div>
      <div className="relative flex items-center gap-3 overflow-hidden">
        <span data-curtain-in className="block h-px w-10 bg-cognac shadow-[0_0_8px_var(--color-cognac)]" />
        <span data-curtain-in data-curtain-label className="micro block text-cream/60" />
      </div>
    </div>
    </>
  );
}
