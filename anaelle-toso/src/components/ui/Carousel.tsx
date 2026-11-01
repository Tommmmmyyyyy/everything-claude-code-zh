"use client";

import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { prefersReducedMotion } from "@/lib/gsap";

interface Props {
  label: string;
  children: ReactNode;
  /** Largeur des éléments (classes Tailwind). */
  itemClass?: string;
  /** Effet de profondeur (rotation et échelle selon la distance au centre). */
  depth?: boolean;
  className?: string;
  /** Contenu affiché à côté des flèches (ex. lien « Tout voir »). */
  aside?: ReactNode;
}

/**
 * Carrousel accessible : flèches, glisser à la souris, défilement tactile natif, clavier,
 * accroche magnétique (scroll-snap) et effet de profondeur facultatif.
 */
export function Carousel({ label, children, itemClass = "w-[82vw] sm:w-[48vw] lg:w-[32vw]", depth = true, className = "", aside }: Props) {
  const track = useRef<HTMLUListElement>(null);
  const items = Children.toArray(children);
  const [index, setIndex] = useState(0);
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const lis = Array.from(el.children) as HTMLElement[];
    const box = el.getBoundingClientRect();
    const center = box.left + box.width / 2;
    let best = 0;
    let bestD = Infinity;
    const reduce = prefersReducedMotion();
    lis.forEach((li, i) => {
      const r = li.getBoundingClientRect();
      const c = r.left + r.width / 2;
      const d = (c - center) / (box.width / 2);
      if (Math.abs(r.left - box.left) < bestD) {
        bestD = Math.abs(r.left - box.left);
        best = i;
      }
      const card = li.firstElementChild as HTMLElement | null;
      if (card && depth && !reduce) {
        const t = Math.max(-1.4, Math.min(1.4, d));
        card.style.transform = `perspective(1400px) rotateY(${(-t * 7).toFixed(2)}deg) scale(${(1 - Math.min(Math.abs(t), 1) * 0.07).toFixed(3)})`;
        card.style.opacity = String(1 - Math.min(Math.abs(t), 1.2) * 0.32);
      }
    });
    setIndex((v) => (v === best ? v : best));
    const start = el.scrollLeft < 8;
    const end = el.scrollLeft + el.clientWidth > el.scrollWidth - 8;
    setEdges((e) => (e.start === start && e.end === end ? e : { start, end }));
  }, [depth]);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    // Glisser à la souris (le tactile utilise le défilement natif)
    let down = false;
    let moved = false;
    let startX = 0;
    let startLeft = 0;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      down = true;
      moved = false;
      startX = e.clientX;
      startLeft = el.scrollLeft;
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 5 && !moved) {
        moved = true;
        el.style.scrollSnapType = "none";
        el.style.cursor = "grabbing";
      }
      if (moved) el.scrollLeft = startLeft - dx;
    };
    const onUp = () => {
      if (!down) return;
      down = false;
      el.style.cursor = "";
      if (moved) {
        el.style.scrollSnapType = "";
        const lis = Array.from(el.children) as HTMLElement[];
        const left = el.scrollLeft;
        const nearest = lis.reduce((a, li) => (Math.abs(li.offsetLeft - el.offsetLeft - left) < Math.abs(a.offsetLeft - el.offsetLeft - left) ? li : a), lis[0]);
        el.scrollTo({ left: nearest.offsetLeft - el.offsetLeft, behavior: "smooth" });
      }
    };
    const onClick = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    };
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    el.addEventListener("click", onClick, true);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      el.removeEventListener("click", onClick, true);
    };
  }, [update]);

  const go = (dir: number) => {
    const el = track.current;
    if (!el) return;
    const lis = Array.from(el.children) as HTMLElement[];
    const next = lis[Math.max(0, Math.min(lis.length - 1, index + dir))];
    el.scrollTo({ left: next.offsetLeft - el.offsetLeft, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  return (
    <div className={className} role="region" aria-roledescription="carrousel" aria-label={label}>
      <ul
        ref={track}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            go(1);
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            go(-1);
          }
        }}
        className="flex cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-[var(--gutter)] pb-6 pt-2 [scrollbar-width:none] focus-visible:outline-none md:gap-6 [&::-webkit-scrollbar]:hidden"
        style={{ scrollPaddingInline: "var(--gutter)" }}
      >
        {items.map((child, i) => (
          <li key={i} className={`shrink-0 snap-start ${itemClass}`} role="group" aria-roledescription="diapositive" aria-label={`${i + 1} sur ${items.length}`}>
            <div className="h-full origin-center">{child}</div>
          </li>
        ))}
        <li aria-hidden="true" className="w-px shrink-0" />
      </ul>
      <div className="container-x mt-4 flex flex-wrap items-center gap-5">
        <div className="flex gap-2">
          <button type="button" onClick={() => go(-1)} disabled={edges.start} aria-label="Précédent" className="grid h-12 w-12 place-items-center rounded-full border border-line-strong transition-colors hover:border-cream disabled:opacity-30">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M13 7H1M6 2 1 7l5 5" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          </button>
          <button type="button" onClick={() => go(1)} disabled={edges.end} aria-label="Suivant" className="grid h-12 w-12 place-items-center rounded-full border border-line-strong transition-colors hover:border-cream disabled:opacity-30">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          </button>
        </div>
        <p className="label tabular-nums text-cream/55" aria-live="polite">
          {String(index + 1).padStart(2, "0")} <span className="text-cream/30">/ {String(items.length).padStart(2, "0")}</span>
        </p>
        <div className="relative h-px min-w-[80px] flex-1 bg-line" aria-hidden="true">
          <div className="absolute inset-y-0 left-0 bg-cream transition-[width] duration-500" style={{ width: `${((index + 1) / items.length) * 100}%` }} />
        </div>
        {aside}
      </div>
    </div>
  );
}
