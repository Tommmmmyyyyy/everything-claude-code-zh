"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Flip } from "gsap/Flip";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { lockScroll } from "@/lib/lenis";
import type { GalleryContent, GalleryItem } from "@/lib/content";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { PhotoSlot } from "@/components/ui/PhotoSlot";

if (typeof window !== "undefined") gsap.registerPlugin(Flip);

const ASPECT: Record<GalleryItem["layout"], string> = {
  hero: "aspect-[4/5]",
  tall: "aspect-[3/4]",
  wide: "aspect-[4/3]",
  square: "aspect-square",
};

export function Gallery({ content }: { content: GalleryContent }) {
  const root = useRef<HTMLElement>(null);
  const grid = useRef<HTMLUListElement>(null);
  const [filter, setFilter] = useState<string>("all");
  const [lightbox, setLightbox] = useState<number | null>(null);
  const items = content.items.map((it, i) => ({ ...it, i }));
  const visible = items.filter((it) => filter === "all" || it.category === filter);
  const catLabel = (id: string) => content.categories.find((c) => c.id === id)?.label ?? id;

  /* Révélation des vignettes au défilement */
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const cells = gsap.utils.toArray<HTMLElement>("[data-cell]", grid.current);
      gsap.set(cells, { clipPath: "inset(100% 0% 0% 0%)" });
      ScrollTrigger.batch(cells, {
        start: "top 90%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, stagger: 0.12, ease: "expo.inOut", overwrite: true }),
      });
    },
    { scope: root },
  );

  const changeFilter = (f: string) => {
    if (f === filter) return;
    const cells = gsap.utils.toArray<HTMLElement>("[data-cell]", grid.current);
    const state = Flip.getState(cells);
    setFilter(f);
    requestAnimationFrame(() => {
      gsap.set(cells, { clipPath: "inset(0% 0% 0% 0%)" });
      Flip.from(state, {
        duration: prefersReducedMotion() ? 0 : 0.9,
        ease: "expo.inOut",
        absolute: true,
        stagger: 0.03,
        onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.8, ease: "expo.out" }),
        onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.92, duration: 0.5 }),
        onComplete: () => ScrollTrigger.refresh(),
      });
    });
  };

  /* Visionneuse plein écran */
  const dialog = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const pos = lightbox !== null ? visible.findIndex((v) => v.i === lightbox) : -1;
  const current = pos >= 0 ? visible[pos] : null;
  const go = (d: number) => {
    if (pos < 0) return;
    const next = visible[(pos + d + visible.length) % visible.length];
    setLightbox(next.i);
  };
  const goRef = useRef(go);
  useEffect(() => {
    goRef.current = go;
  });

  const isOpen = lightbox !== null;
  useEffect(() => {
    if (!isOpen) return;
    lockScroll(true);
    return () => lockScroll(false);
  }, [isOpen]);

  useEffect(() => {
    if (lightbox === null) return;
    const el = dialog.current!;
    el.querySelector<HTMLElement>("[data-close]")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightbox(null);
        lastFocus.current?.focus();
      }
      if (e.key === "ArrowRight") goRef.current(1);
      if (e.key === "ArrowLeft") goRef.current(-1);
      if (e.key === "Tab") {
        const f = Array.from(el.querySelectorAll<HTMLElement>("button"));
        const i = f.indexOf(document.activeElement as HTMLElement);
        if (e.shiftKey && i <= 0) {
          e.preventDefault();
          f[f.length - 1].focus();
        } else if (!e.shiftKey && i === f.length - 1) {
          e.preventDefault();
          f[0].focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [lightbox]);

  const close = () => {
    setLightbox(null);
    lastFocus.current?.focus();
  };

  /* Balayage tactile */
  const touchX = useRef<number | null>(null);

  return (
    <section ref={root} id="galerie" aria-labelledby="galerie-title" className="relative section-y bg-ink">
      <SectionHeader index="09" label="Galerie" title={content.title} intro={content.intro} titleId="galerie-title" />

      <div className="container-x mt-12 md:mt-16">
        <div role="group" aria-label="Filtrer la galerie" className="flex flex-wrap gap-2">
          {[{ id: "all", label: "Tout" }, ...content.categories].map((c) => {
            const count = c.id === "all" ? items.length : items.filter((i) => i.category === c.id).length;
            const on = filter === c.id;
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={on}
                onClick={() => changeFilter(c.id)}
                className={`label rounded-[22.5px] border px-4 py-2.5 transition-colors duration-300 ${on ? "border-cream bg-cream text-ink" : "border-line-strong text-cream/80 hover:border-cream"}`}
              >
                {c.label} <sup className="ml-0.5 tabular-nums opacity-60">{count}</sup>
              </button>
            );
          })}
        </div>

        <ul ref={grid} className="mt-10 columns-1 gap-4 sm:columns-2 md:mt-14 md:columns-3 md:gap-6">
          {items.map((it) => {
            const shown = filter === "all" || it.category === filter;
            return (
              <li key={it.i} data-cell className={`mb-4 break-inside-avoid md:mb-6 ${shown ? "" : "hidden"}`}>
                <button
                  type="button"
                  onClick={(e) => {
                    lastFocus.current = e.currentTarget;
                    setLightbox(it.i);
                  }}
                  className="group relative block w-full overflow-hidden rounded-[12px] text-left"
                  data-cursor="Ouvrir"
                  aria-label={`Agrandir : ${it.src ? it.alt || it.caption : `emplacement photo — ${it.caption}`}`}
                >
                  <div className={`relative ${ASPECT[it.layout]} transition-transform duration-[1.2s] ease-[var(--ease-expo)] group-hover:scale-[1.04]`}>
                    {it.src ? (
                      <Image src={it.src} alt={it.alt} fill sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                    ) : (
                      <PhotoSlot src={null} alt="" motif={it.motif} hint={it.caption} className="absolute inset-0" />
                    )}
                  </div>
                  <span className="label absolute left-4 top-4 rounded-[22.5px] bg-ink/60 px-3 py-1.5 text-cream/80 backdrop-blur-sm">{catLabel(it.category)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {current && (
        <div
          ref={dialog}
          role="dialog"
          aria-modal="true"
          aria-label={`Visionneuse — ${current.caption}`}
          className="fixed inset-0 z-[120] flex animate-[fadeup_0.4s_var(--ease-expo)] flex-col bg-ink/95 backdrop-blur-md"
          data-lenis-prevent
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
            touchX.current = null;
          }}
        >
          <div className="container-x flex h-[72px] items-center justify-between">
            <span className="label tabular-nums text-cream/60">
              {String(pos + 1).padStart(2, "0")} / {String(visible.length).padStart(2, "0")} — {catLabel(current.category)}
            </span>
            <button type="button" data-close onClick={close} className="label rounded-[22.5px] border border-line-strong px-4 py-2.5 hover:border-cream">
              Fermer
            </button>
          </div>
          <div className="container-x relative flex min-h-0 flex-1 items-center justify-center pb-6">
            <div key={current.i} className="relative h-full w-full max-w-6xl animate-[fadeup_0.5s_var(--ease-expo)] overflow-hidden rounded-[12px]">
              {current.src ? (
                <Image src={current.src} alt={current.alt} fill sizes="100vw" className="object-contain" />
              ) : (
                <PhotoSlot src={null} alt="" motif={current.motif} hint={current.caption} className="absolute inset-0" />
              )}
            </div>
          </div>
          <div className="container-x flex items-center justify-between gap-4 pb-6">
            <button type="button" onClick={() => go(-1)} className="label rounded-[22.5px] border border-line-strong px-4 py-2.5 hover:border-cream" aria-label="Image précédente">
              ← Préc.
            </button>
            <p className="text-center text-cream/75">{current.src ? current.alt || current.caption : current.caption}</p>
            <button type="button" onClick={() => go(1)} className="label rounded-[22.5px] border border-line-strong px-4 py-2.5 hover:border-cream" aria-label="Image suivante">
              Suiv. →
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
