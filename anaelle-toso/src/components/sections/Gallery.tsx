"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Flip } from "gsap/Flip";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { lockScroll } from "@/lib/lenis";
import type { GalleryContent, GalleryItem } from "@/lib/content";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { Carousel } from "@/components/ui/Carousel";
import { SHOW_PLACEHOLDERS, siteAsset } from "@/lib/config";

if (typeof window !== "undefined") gsap.registerPlugin(Flip);

const ASPECT: Record<GalleryItem["layout"], string> = {
  hero: "aspect-[4/5]",
  tall: "aspect-[3/4]",
  wide: "aspect-[4/3]",
  square: "aspect-square",
  landscape: "aspect-[3/2]",
};

export function Gallery({ content, index = "09", header = true }: { content: GalleryContent; index?: string; header?: boolean }) {
  const root = useRef<HTMLElement>(null);
  const grid = useRef<HTMLUListElement>(null);
  const [filter, setFilter] = useState<string>("all");
  const [view, setView] = useState<"carousel" | "mosaic">("carousel");
  const [lightbox, setLightbox] = useState<number | null>(null);
  // Seules les vraies photos sont affichées ; les emplacements vides ne servent qu'en mode « placeholders ».
  const items = content.items.map((it, i) => ({ ...it, i })).filter((it) => it.src || SHOW_PLACEHOLDERS);
  const visible = items.filter((it) => filter === "all" || it.category === filter);
  const catLabel = (id: string) => content.categories.find((c) => c.id === id)?.label ?? id;
  // Catégories encore sans photo : une vignette « à venir » leur réserve une place.
  const upcoming = content.categories.filter((c) => !items.some((it) => it.category === c.id && it.src));
  const upcomingVisible = upcoming.filter((c) => filter === "all" || c.id === filter);

  /* Révélation des vignettes au défilement */
  useGSAP(
    () => {
      if (prefersReducedMotion() || view !== "mosaic") return;
      const cells = gsap.utils.toArray<HTMLElement>("[data-cell]", grid.current);
      gsap.set(cells, { clipPath: "inset(100% 0% 0% 0%)" });
      ScrollTrigger.batch(cells, {
        start: "top 92%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, stagger: 0.12, ease: "expo.inOut", overwrite: true }),
      });
    },
    { scope: root, dependencies: [view] },
  );

  const changeFilter = (f: string) => {
    if (f === filter) return;
    if (view !== "mosaic" || !grid.current) {
      setFilter(f);
      return;
    }
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

  const open = (e: React.MouseEvent<HTMLElement>, i: number) => {
    lastFocus.current = e.currentTarget;
    setLightbox(i);
  };

  const photo = (it: (typeof items)[number], sizes: string, aspect: string) => (
    <button
      type="button"
      onClick={(e) => open(e, it.i)}
      className="group relative block w-full overflow-hidden rounded-[12px] text-left"
      data-cursor="Ouvrir"
      aria-label={`Agrandir : ${it.src ? it.alt || it.caption : `emplacement photo — ${it.caption}`}`}
    >
      <div className={`relative ${aspect} transition-transform duration-[1.2s] ease-[var(--ease-expo)] group-hover:scale-[1.04]`}>
        {it.src ? (
          <Image src={siteAsset(it.src)} alt={it.alt} fill sizes={sizes} className="object-cover" draggable={false} />
        ) : (
          <PhotoSlot src={null} alt="" motif={it.motif} hint={it.caption} className="absolute inset-0" />
        )}
      </div>
      <span className="label absolute left-4 top-4 rounded-[22.5px] bg-ink/75 px-3 py-1.5 text-cream/80">{catLabel(it.category)}</span>
      {it.caption && (
        <span className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-ink/85 to-transparent px-4 pb-4 pt-12 font-serif text-[1.3rem] leading-tight opacity-0 transition-[opacity,transform] duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
          {it.caption}
        </span>
      )}
    </button>
  );

  return (
    <section ref={root} id="galerie" aria-labelledby="galerie-title" className="relative section-y bg-ink">
      {header ? (
        <SectionHeader index={index} label="Galerie" title={content.title} intro={content.intro} titleId="galerie-title" />
      ) : (
        <h2 id="galerie-title" className="sr-only">
          {content.title}
        </h2>
      )}

      <div className={`container-x ${header ? "mt-12 md:mt-16" : ""}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
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
                  {c.label} <sup className="ml-0.5 tabular-nums opacity-60">{count || "à venir"}</sup>
                </button>
              );
            })}
          </div>
          <div role="group" aria-label="Affichage" className="flex rounded-[22.5px] border border-line-strong p-1">
            {(
              [
                ["carousel", "Carrousel"],
                ["mosaic", "Mosaïque"],
              ] as const
            ).map(([v, l]) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => setView(v)}
                className={`label rounded-[18px] px-3.5 py-2 transition-colors duration-300 ${view === v ? "bg-cream/12 text-cream" : "text-cream/55 hover:text-cream"}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {view === "carousel" ? (
        <div key={`c-${filter}`} className="mt-10 animate-[fadeup_0.7s_var(--ease-expo)] md:mt-14">
          <Carousel label="Galerie photo" itemClass="w-[84vw] sm:w-[60vw] lg:w-[40vw]">
            {[
              ...visible.map((it) => <div key={`p-${it.i}`}>{photo(it, "(min-width: 1024px) 40vw, 84vw", "aspect-[4/5]")}</div>),
              ...upcomingVisible.map((c) => (
                <div key={`u-${c.id}`}>
                  <UpcomingTile label={c.label} className="aspect-[4/5]" />
                </div>
              )),
            ]}
          </Carousel>
        </div>
      ) : (
        <div className="container-x">
          <ul ref={grid} className="mt-10 columns-1 gap-4 sm:columns-2 md:mt-14 md:columns-3 md:gap-6">
            {items.map((it) => {
              const shown = filter === "all" || it.category === filter;
              return (
                <li key={it.i} data-cell className={`mb-4 break-inside-avoid md:mb-6 ${shown ? "" : "hidden"}`}>
                  {photo(it, "(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw", ASPECT[it.layout])}
                </li>
              );
            })}
            {upcoming.map((c) => {
              const shown = filter === "all" || filter === c.id;
              return (
                <li key={`u-${c.id}`} data-cell className={`mb-4 break-inside-avoid md:mb-6 ${shown ? "" : "hidden"}`}>
                  <UpcomingTile label={c.label} className="aspect-[4/3]" />
                </li>
              );
            })}
          </ul>
        </div>
      )}

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
                <Image src={siteAsset(current.src)} alt={current.alt} fill sizes="100vw" className="object-contain" />
              ) : (
                <PhotoSlot src={null} alt="" motif={current.motif} hint={current.caption} className="absolute inset-0" />
              )}
            </div>
          </div>
          <div className="container-x flex items-center justify-between gap-4 pb-6">
            <button type="button" onClick={() => go(-1)} className="label rounded-[22.5px] border border-line-strong px-4 py-2.5 hover:border-cream" aria-label="Image précédente">
              ← Préc.
            </button>
            <p className="text-center text-cream/75">{current.caption || current.alt}</p>
            <button type="button" onClick={() => go(1)} className="label rounded-[22.5px] border border-line-strong px-4 py-2.5 hover:border-cream" aria-label="Image suivante">
              Suiv. →
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

/** Vignette réservée à une catégorie qui n'a pas encore de photo (aucune image générique). */
function UpcomingTile({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div className={`relative grid place-items-center overflow-hidden rounded-[12px] border border-dashed border-line-strong bg-[radial-gradient(ellipse_at_50%_35%,rgba(217,196,160,0.07),transparent_70%)] ${className}`}>
      <div className="grid justify-items-center gap-4 px-6 text-center">
        <svg viewBox="0 0 48 48" className="h-10 w-10 text-sand/70" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
          <path d="M 6 14 h 8 l 3 -4 h 14 l 3 4 h 8 v 24 H 6 Z" />
          <circle cx="24" cy="25" r="8" />
          <circle cx="24" cy="25" r="3" strokeDasharray="2 2" />
        </svg>
        <p className="font-serif text-[1.6rem] leading-tight">{label}</p>
        <p className="label text-cream/45">Photos à venir</p>
      </div>
      <span className="pointer-events-none absolute inset-3 rounded-[8px] border border-line" aria-hidden="true" />
    </div>
  );
}
