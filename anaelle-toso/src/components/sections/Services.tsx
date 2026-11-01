"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap, isFinePointer, prefersReducedMotion } from "@/lib/gsap";
import type { DiagramKey, ServicesContent } from "@/lib/content";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ButtonLink } from "@/components/ui/Button";
import { CrossSection, DentalArch, HooksProfile, MolarTable, WolfToothDetail } from "@/components/illustrations/anatomy";
import { HORSE_HEAD_DOOR } from "@/components/illustrations/silhouettes";
import { SHOW_PLACEHOLDERS } from "@/lib/config";

function FollowDiagram({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 240" className={className} fill="none" aria-hidden="true">
      <circle cx="160" cy="120" r="84" stroke="var(--color-cream)" strokeOpacity="0.25" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        return (
          <line
            key={i}
            x1={(160 + Math.cos(a) * 76).toFixed(2)}
            y1={(120 + Math.sin(a) * 76).toFixed(2)}
            x2={(160 + Math.cos(a) * 92).toFixed(2)}
            y2={(120 + Math.sin(a) * 92).toFixed(2)}
            stroke="var(--color-cream)"
            strokeOpacity={i % 3 === 0 ? 0.9 : 0.35}
            strokeWidth={i % 3 === 0 ? 2 : 1}
          />
        );
      })}
      <path d="M 160 36 A 84 84 0 1 1 76 120" stroke="var(--color-cognac)" strokeWidth="2.4" className="animate-[dash_3s_ease-in-out_infinite]" strokeDasharray="400" />
      <path d="M 146 92 C 146 80, 174 80, 174 92 L 172 140 C 170 152, 162 150, 160 138 C 158 150, 150 152, 148 140 Z" stroke="var(--color-cream)" strokeWidth="1.6" fill="rgba(244,234,219,0.12)" />
      <text x="160" y="226" textAnchor="middle" fill="var(--color-cream)" fillOpacity="0.6" fontSize="10" letterSpacing="1.4" fontFamily="var(--font-sans)">
        UN SUIVI DANS LE TEMPS
      </text>
    </svg>
  );
}

function AdviceDiagram({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 240" className={className} fill="none" aria-hidden="true">
      <g transform="translate(40 50) scale(0.62)">
        <path d={HORSE_HEAD_DOOR} fill="rgba(244,234,219,0.14)" />
      </g>
      <path d="M 178 46 H 296 V 104 H 222 L 204 122 V 104 H 178 Z" stroke="var(--color-cream)" strokeWidth="1.5" />
      <path d="M 194 66 H 280 M 194 82 H 254" stroke="var(--color-cream)" strokeOpacity="0.5" />
      <path d="M 196 132 H 300 V 182 H 284 V 198 L 268 182 H 196 Z" stroke="var(--color-cognac)" strokeWidth="1.5" />
      <path d="M 212 152 H 284 M 212 166 H 262" stroke="var(--color-cognac)" strokeOpacity="0.6" />
      <text x="160" y="226" textAnchor="middle" fill="var(--color-cream)" fillOpacity="0.6" fontSize="10" letterSpacing="1.4" fontFamily="var(--font-sans)">
        EXPLIQUER, RASSURER, ACCOMPAGNER
      </text>
    </svg>
  );
}

export function ServiceDiagram({ kind, className = "h-full w-full" }: { kind: DiagramKey; className?: string }) {
  switch (kind) {
    case "exam":
      return <DentalArch highlight="exam" className={className} />;
    case "follow":
      return <FollowDiagram className={className} />;
    case "tables":
      return <MolarTable className={className} />;
    case "points":
      return <CrossSection className={className} />;
    case "level":
      return <HooksProfile className={className} />;
    case "caps":
      return <DentalArch highlight="caps" className={className} />;
    case "wolf":
      return <WolfToothDetail className={className} />;
    case "advice":
      return <AdviceDiagram className={className} />;
  }
}

export function Services({ content }: { content: ServicesContent }) {
  const [open, setOpen] = useState<string | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const preview = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  /* Aperçu flottant qui suit le curseur (ordinateur) */
  useEffect(() => {
    const el = preview.current;
    const list = listRef.current;
    if (!el || !list || !isFinePointer() || prefersReducedMotion()) return;
    const xTo = gsap.quickTo(el, "x", { duration: 0.7, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.7, ease: "power3" });
    const rTo = gsap.quickTo(el, "rotation", { duration: 0.9, ease: "power3" });
    let lastX = 0;
    const move = (e: PointerEvent) => {
      xTo(e.clientX + 32);
      yTo(e.clientY - 120);
      rTo(Math.max(-8, Math.min(8, (e.clientX - lastX) * 0.4)));
      lastX = e.clientX;
    };
    list.addEventListener("pointermove", move);
    return () => list.removeEventListener("pointermove", move);
  }, []);

  useEffect(() => {
    const el = preview.current;
    if (!el) return;
    const show = hover !== null && open === null && isFinePointer();
    gsap.to(el, {
      clipPath: show ? "inset(0% 0% 0% 0%)" : "inset(50% 50% 50% 50%)",
      opacity: show ? 1 : 0,
      duration: 0.6,
      ease: "expo.out",
    });
  }, [hover, open]);

  const hovered = hover !== null ? content.items[hover] : null;

  return (
    <section id="prestations" aria-labelledby="prestations-title" className="relative section-y bg-ink">
      <SectionHeader index="05" label="Prestations" title={content.title} intro={content.intro} provisional={content.provisional} titleId="prestations-title" />

      <ul ref={listRef} className="container-x mt-16 md:mt-24" onPointerLeave={() => setHover(null)}>
        {content.items.map((s, i) => {
          const isOpen = open === s.id;
          return (
            <li key={s.id} className="relative" data-reveal="up" data-delay={String(i * 0.04)}>
              <span className="rule-dashed absolute inset-x-0 top-0" aria-hidden="true" />
              <h3>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`svc-${s.id}`}
                  id={`svc-btn-${s.id}`}
                  onClick={() => setOpen(isOpen ? null : s.id)}
                  onPointerEnter={() => setHover(i)}
                  className="group grid w-full grid-cols-[2.5rem_1fr_auto] items-baseline gap-4 py-6 text-left md:grid-cols-[4rem_1fr_16rem_3rem] md:py-9"
                >
                  <span className="label tabular-nums text-cream/45">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-serif text-[clamp(1.75rem,3.6vw,3.6rem)] leading-[0.98] transition-[transform,color] duration-700 ease-[var(--ease-expo)] group-hover:translate-x-3 md:group-hover:translate-x-6">
                    {s.title}
                  </span>
                  <span className="label hidden text-cream/55 md:block">{s.kicker}</span>
                  <span className="relative h-9 w-9 shrink-0 self-center rounded-full border border-line-strong transition-colors duration-500 group-hover:border-cream" aria-hidden="true">
                    <span className="absolute left-1/2 top-1/2 h-px w-3.5 -translate-x-1/2 -translate-y-1/2 bg-cream" />
                    <span className={`absolute left-1/2 top-1/2 h-3.5 w-px -translate-x-1/2 -translate-y-1/2 bg-cream transition-transform duration-500 ${isOpen ? "scale-y-0" : ""}`} />
                  </span>
                </button>
              </h3>
              <div
                id={`svc-${s.id}`}
                role="region"
                aria-labelledby={`svc-btn-${s.id}`}
                className={`grid transition-[grid-template-rows] duration-700 ease-[var(--ease-expo)] ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
              >
                <div className="overflow-hidden">
                  <div className="grid gap-8 pb-12 md:grid-cols-[4rem_1fr_1fr] md:gap-6">
                    <div className="hidden md:block" />
                    <div className="max-w-xl">
                      <p className="body-lg text-cream/85">{s.description}</p>
                      <ul className="mt-6 grid gap-2">
                        {s.details.map((d) => (
                          <li key={d} className="flex items-baseline gap-3 text-cream/70">
                            <span className="h-1 w-1 shrink-0 translate-y-[-2px] rounded-full bg-sand" aria-hidden="true" />
                            {d}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-8 flex flex-wrap items-center gap-4">
                        <ButtonLink href="/rendez-vous" variant="ghost">
                          Demander ce soin
                        </ButtonLink>
                        {s.price ? (
                          <span className="label text-sand">{s.price}</span>
                        ) : (
                          SHOW_PLACEHOLDERS && <span className="ph-tag">Tarif à renseigner</span>
                        )}
                      </div>
                    </div>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-[12px] border border-line bg-forest">
                      {s.image ? (
                        <Image src={s.image} alt={s.imageAlt} fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
                      ) : (
                        <div className="absolute inset-0 p-6">
                          <ServiceDiagram kind={s.diagram} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
        <li className="rule-dashed" aria-hidden="true" />
      </ul>

      <div className="container-x mt-14 grid gap-6 md:grid-cols-12">
        <p className="micro text-cream/45 md:col-span-2">Cadre réglementaire</p>
        <p className="text-[0.95rem] leading-relaxed text-cream/65 md:col-span-7">{content.regulatoryNote}</p>
        {content.pricingNote && <p className="text-[0.95rem] text-cream/65 md:col-span-3">{content.pricingNote}</p>}
      </div>

      {/* Aperçu flottant */}
      <div
        ref={preview}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-50 hidden h-[260px] w-[340px] overflow-hidden rounded-[12px] border border-line bg-forest opacity-0 md:block"
        style={{ clipPath: "inset(50% 50% 50% 50%)" }}
      >
        {hovered &&
          (hovered.image ? (
            <Image src={hovered.image} alt="" fill sizes="340px" className="object-cover" />
          ) : (
            <div className="absolute inset-0 p-5">
              <ServiceDiagram kind={hovered.diagram} />
            </div>
          ))}
        {hovered && (
          <span className="label absolute left-4 top-4 text-cream/70">{hovered.kicker}</span>
        )}
      </div>
    </section>
  );
}
