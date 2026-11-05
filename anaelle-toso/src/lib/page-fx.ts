"use client";

import { gsap, ScrollTrigger, SplitText, prefersReducedMotion, isFinePointer } from "./gsap";
import { scramble } from "./scramble";

/**
 * Effets déclaratifs d'une page : révélations (data-reveal), parallaxe (data-parallax),
 * boutons magnétiques (data-magnetic). Appelé à chaque arrivée sur une page ; renvoie le nettoyage.
 */
export function setupPageFX(): () => void {
  const reduce = prefersReducedMotion();
  const cleanups: Array<() => void> = [];
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
                opacity: 0,
                duration: kind === "chars" ? 1.2 : 1.35,
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
        case "decode": {
          el.classList.add("is-in");
          let stop = () => {};
          ScrollTrigger.create({
            trigger: el,
            start,
            once: true,
            onEnter: () => {
              stop = scramble(el, { duration: parseFloat(el.dataset.duration || "0.9"), delay });
            },
          });
          cleanups.push(() => stop());
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


  /* ── Halo qui suit le pointeur sur les cartes ─────── */
  if (!reduce && isFinePointer()) {
    gsap.utils.toArray<HTMLElement>("[data-spotlight]").forEach((el) => {
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      };
      el.addEventListener("pointermove", move);
      cleanups.push(() => el.removeEventListener("pointermove", move));
    });
  }

  requestAnimationFrame(() => ScrollTrigger.refresh());
  /* ── Grain argentique : animé seulement lorsqu'il est à l'écran ── */
  if (!reduce && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => e.target.classList.toggle("is-live", e.isIntersecting)), { rootMargin: "10% 0px" });
    document.querySelectorAll(".grain").forEach((g) => io.observe(g));
    cleanups.push(() => io.disconnect());
  }

  return () => cleanups.forEach((fn) => fn());
}
