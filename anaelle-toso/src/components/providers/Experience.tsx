"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { setLenis, scrollToTarget } from "@/lib/lenis";
import { cover } from "@/lib/transition";
import { DEMO } from "@/lib/config";
import { navLinks } from "@/lib/content";

/**
 * Socle persistant (dans la mise en page) :
 * - défilement fluide (Lenis) synchronisé avec ScrollTrigger ;
 * - ancres internes en défilement doux ;
 * - transitions entre pages : le rideau recouvre l'écran, puis la navigation a lieu.
 * Les effets propres à chaque page (révélations, parallaxe) sont gérés par le gabarit de page.
 */
export function Experience() {
  const router = useRouter();

  useEffect(() => {
    const reduce = prefersReducedMotion();
    let lenis: Lenis | null = null;
    const cleanups: Array<() => void> = [];

    if (!reduce) {
      lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.4 });
      setLenis(lenis);
      lenis.on("scroll", ScrollTrigger.update);
      const raf = (time: number) => lenis?.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      cleanups.push(() => {
        gsap.ticker.remove(raf);
        lenis?.destroy();
        setLenis(null);
      });
    }

    /* Phase de capture : passe avant next/link */
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;

      // 1. Ancre présente sur cette page : défilement doux
      if (url.hash) {
        const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
        if (target && (url.pathname === window.location.pathname || href.startsWith("#"))) {
          e.preventDefault();
          scrollToTarget(target, { immediate: reduce });
          history.replaceState(null, "", url.hash);
          if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
          target.focus({ preventScroll: true });
          return;
        }
      }

      // 2. Autre page du site : rideau, puis navigation
      if (url.pathname !== window.location.pathname) {
        e.preventDefault();
        const dest = url.pathname + url.search + url.hash;
        const page = navLinks.find((l) => {
          const p = l.href === "/" ? ["/", "/site.html"] : [l.href, l.href + ".html"];
          return p.includes(url.pathname);
        });
        cover(page?.label ?? "", () => {
          if (DEMO) window.location.href = url.href;
          else router.push(dest);
        });
      }
    };
    document.addEventListener("click", onClick, true);
    cleanups.push(() => document.removeEventListener("click", onClick, true));

    /* Préchargement au survol / au toucher : la page suivante est prête avant le clic */
    const warmed = new Set<string>();
    const warm = (e: Event) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      const href = a?.getAttribute("href");
      if (!a || !href || a.target === "_blank" || /^(mailto:|tel:|#)/.test(href)) return;
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname || warmed.has(url.pathname)) return;
      warmed.add(url.pathname);
      if (DEMO) {
        const l = document.createElement("link");
        l.rel = "prefetch";
        l.href = url.pathname;
        document.head.appendChild(l);
      } else {
        router.prefetch(url.pathname);
      }
    };
    document.addEventListener("pointerover", warm, { passive: true });
    document.addEventListener("touchstart", warm, { passive: true });
    document.addEventListener("focusin", warm);
    cleanups.push(() => {
      document.removeEventListener("pointerover", warm);
      document.removeEventListener("touchstart", warm);
      document.removeEventListener("focusin", warm);
    });

    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh);
    cleanups.push(() => window.removeEventListener("load", refresh));

    return () => cleanups.forEach((fn) => fn());
  }, [router]);

  return null;
}
