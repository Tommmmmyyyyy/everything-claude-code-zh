"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, SplitText, prefersReducedMotion, isFinePointer } from "@/lib/gsap";
import { setLenis, scrollToTarget } from "@/lib/lenis";

/**
 * Chef d'orchestre des animations globales :
 * - défilement fluide (Lenis) synchronisé avec ScrollTrigger ;
 * - révélations déclaratives via l'attribut data-reveal ;
 * - parallaxe déclarative via data-parallax ;
 * - boutons magnétiques via data-magnetic ;
 * - ancres internes.
 * Tout est désactivé lorsque prefers-reduced-motion est actif.
 */
export function Experience() {
  useEffect(() => {
    const reduce = prefersReducedMotion();
    let lenis: Lenis | null = null;
    const cleanups: Array<() => void> = [];

    /* ── Défilement fluide ─────────────────────────────── */
    if (!reduce) {
      lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.95, touchMultiplier: 1.4 });
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

    /* ── Ancres internes (/#section ou #section) — phase de capture : passe avant next/link ── */
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || !href.includes("#")) return;
      const url = new URL(href, window.location.href);
      if (url.pathname !== window.location.pathname || !url.hash) return;
      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;
      e.preventDefault();
      scrollToTarget(target, { immediate: reduce });
      history.replaceState(null, "", url.hash);
      // Accessibilité : déplacer le focus vers la section ciblée
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    };
    document.addEventListener("click", onClick, true);
    cleanups.push(() => document.removeEventListener("click", onClick, true));

    /* ── Révélations ───────────────────────────────────── */
    const ctx = gsap.context(() => {
      const els = gsap.utils.toArray<HTMLElement>("[data-reveal]");
      if (reduce) {
        els.forEach((el) => el.classList.add("is-in"));
        return;
      }

      els.forEach((el) => {
        const type = el.dataset.reveal;
        const delay = parseFloat(el.dataset.delay || "0");
        const start = el.dataset.start || "top 86%";
        const st = { trigger: el, start, once: true };

        switch (type) {
          case "lines":
          case "chars":
          case "words": {
            el.classList.add("is-in");
            const kind = type;
            SplitText.create(el, {
              type: kind === "chars" ? "lines,words,chars" : kind === "words" ? "lines,words" : "lines",
              mask: kind === "chars" ? "chars" : "lines",
              linesClass: "split-line",
              autoSplit: true,
              aria: "auto",
              onSplit(self) {
                const targets = kind === "chars" ? self.chars : kind === "words" ? self.words : self.lines;
                return gsap.from(targets, {
                  yPercent: 110,
                  duration: kind === "chars" ? 1.2 : 1.25,
                  stagger: kind === "chars" ? 0.025 : kind === "words" ? 0.03 : 0.09,
                  delay,
                  ease: "expo.out",
                  scrollTrigger: st,
                });
              },
            });
            break;
          }
          case "scrub-words": {
            el.classList.add("is-in");
            SplitText.create(el, {
              type: "words",
              autoSplit: true,
              aria: "auto",
              onSplit(self) {
                return gsap.fromTo(
                  self.words,
                  { opacity: 0.16 },
                  {
                    opacity: 1,
                    ease: "none",
                    stagger: 0.1,
                    scrollTrigger: { trigger: el, start: "top 78%", end: "bottom 45%", scrub: true },
                  },
                );
              },
            });
            break;
          }
          case "mask": {
            el.classList.add("is-in");
            const inner = el.querySelector<HTMLElement>("[data-reveal-inner]");
            const tl = gsap.timeline({ scrollTrigger: st, delay });
            tl.fromTo(
              el,
              { clipPath: "inset(100% 0% 0% 0%)" },
              { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "expo.inOut" },
            );
            if (inner) tl.fromTo(inner, { scale: 1.35 }, { scale: 1, duration: 2, ease: "expo.out" }, 0.1);
            break;
          }
          case "line": {
            el.classList.add("is-in");
            gsap.fromTo(
              el,
              { scaleX: 0, transformOrigin: el.dataset.origin || "0% 50%" },
              { scaleX: 1, duration: 1.6, delay, ease: "expo.inOut", scrollTrigger: st },
            );
            break;
          }
          case "stagger": {
            el.classList.add("is-in");
            gsap.from(el.children, {
              y: 48,
              opacity: 0,
              duration: 1.2,
              stagger: 0.08,
              delay,
              scrollTrigger: st,
            });
            break;
          }
          case "fade": {
            el.classList.add("is-in");
            gsap.from(el, { opacity: 0, duration: 1.6, delay, ease: "power2.out", scrollTrigger: st });
            break;
          }
          case "none":
            el.classList.add("is-in");
            break;
          case "up":
          default: {
            el.classList.add("is-in");
            gsap.from(el, { y: 56, opacity: 0, duration: 1.3, delay, scrollTrigger: st });
          }
        }
      });

      /* Parallaxe déclarative */
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        const speed = parseFloat(el.dataset.parallax || "0.15");
        gsap.fromTo(
          el,
          { yPercent: -speed * 100 },
          {
            yPercent: speed * 100,
            ease: "none",
            scrollTrigger: {
              trigger: el.parentElement || el,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      });
    });
    cleanups.push(() => ctx.revert());

    /* ── Boutons magnétiques ───────────────────────────── */
    if (!reduce && isFinePointer()) {
      const magnets = gsap.utils.toArray<HTMLElement>("[data-magnetic]");
      magnets.forEach((el) => {
        const strength = parseFloat(el.dataset.magnetic || "0.3") || 0.3;
        const xTo = gsap.quickTo(el, "x", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
        const yTo = gsap.quickTo(el, "y", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          xTo((e.clientX - (r.left + r.width / 2)) * strength);
          yTo((e.clientY - (r.top + r.height / 2)) * strength);
        };
        const leave = () => {
          xTo(0);
          yTo(0);
        };
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", leave);
        cleanups.push(() => {
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerleave", leave);
        });
      });
    }

    /* ── Recalcul après chargement des polices et images ── */
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh);
    cleanups.push(() => window.removeEventListener("load", refresh));

    /* Ancre présente dans l'URL au chargement */
    if (window.location.hash) {
      const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
      if (target) setTimeout(() => scrollToTarget(target, { immediate: true }), 400);
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
