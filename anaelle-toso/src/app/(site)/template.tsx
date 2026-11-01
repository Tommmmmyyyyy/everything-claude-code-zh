"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { getLenis, scrollToTarget } from "@/lib/lenis";
import { setupPageFX } from "@/lib/page-fx";
import { uncover } from "@/lib/transition";

/**
 * Gabarit remonté à chaque changement de page : retour en haut (ou vers l'ancre),
 * rideau relevé, apparition du contenu et effets de la page.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hash = window.location.hash;
    const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
    if (!target) {
      getLenis()?.scrollTo(0, { immediate: true, force: true });
    }
    uncover();
    const cleanup = setupPageFX();
    if (!prefersReducedMotion() && root.current) {
      // Opacité seule : une transformation casserait l'épinglage des sections animées.
      gsap.fromTo(root.current, { opacity: 0 }, { opacity: 1, duration: 0.7, delay: 0.1, ease: "power2.out", clearProps: "opacity" });
    }
    const t = target ? setTimeout(() => scrollToTarget(target, { immediate: true }), 350) : undefined;
    return () => {
      if (t) clearTimeout(t);
      cleanup();
    };
  }, []);

  return <div ref={root}>{children}</div>;
}
