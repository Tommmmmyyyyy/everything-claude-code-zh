"use client";

import { useEffect, useRef } from "react";
import { registerCurtain } from "@/lib/transition";

/** Rideau de transition entre les pages (couleur encre, monogramme et nom de la page). */
export function PageCurtain() {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    registerCurtain(el.current);
    return () => registerCurtain(null);
  }, []);
  return (
    <div ref={el} data-curtain aria-hidden="true" className="invisible fixed inset-0 z-[160] flex flex-col items-center justify-center gap-5 bg-ink" style={{ clipPath: "inset(0% 0% 0% 0%)" }}>
      <div className="overflow-hidden">
        <p data-curtain-in className="font-serif text-[clamp(2rem,5vw,3.6rem)] leading-none text-cream">
          Anaëlle <em className="italic text-sand">Toso</em>
        </p>
      </div>
      <div className="flex items-center gap-3 overflow-hidden">
        <span data-curtain-in className="block h-px w-10 bg-cognac" />
        <span data-curtain-in data-curtain-label className="micro block text-cream/60" />
      </div>
    </div>
  );
}
