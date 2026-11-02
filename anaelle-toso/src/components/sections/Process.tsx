"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "@/lib/gsap";
import type { ProcessContent } from "@/lib/content";
import { SectionHeader } from "@/components/ui/SectionHeader";

const ICONS: Record<string, React.ReactNode> = {
  phone: <path d="M 14 8 h 8 l 3 9 -5 3 a 22 22 0 0 0 10 10 l 3 -5 9 3 v 8 a 3 3 0 0 1 -3 3 C 22 39, 9 26, 11 11 a 3 3 0 0 1 3 -3 Z" />,
  calendar: <path d="M 8 12 h 32 v 28 H 8 Z M 8 20 h 32 M 16 6 v 10 M 32 6 v 10 M 15 28 h 4 M 22 28 h 4 M 29 28 h 4 M 15 34 h 4" />,
  truck: <path d="M 4 30 V 14 h 24 v 16 M 28 20 h 8 l 6 6 v 4 h -4 M 4 30 h 6 M 18 30 h 12 M 14 34 a 4 4 0 1 0 0.1 0 M 34 34 a 4 4 0 1 0 0.1 0" />,
  halter: <path d="M 12 8 C 6 20, 10 34, 22 40 C 34 34, 40 22, 34 10 M 12 8 L 34 10 M 13 24 h 22 M 22 40 v 6" />,
  exam: <path d="M 6 24 C 12 12, 36 12, 42 24 C 36 36, 12 36, 6 24 Z M 24 18 a 6 6 0 1 0 0.1 0 M 24 4 v 6 M 24 38 v 6" />,
  care: <path d="M 24 42 C 10 32, 4 24, 6 16 C 8 8, 18 6, 24 14 C 30 6, 40 8, 42 16 C 44 24, 38 32, 24 42 Z" />,
  advice: <path d="M 6 8 h 36 v 22 H 20 l -8 8 v -8 H 6 Z M 14 16 h 20 M 14 22 h 12" />,
};

export function Process({ content, index = "07" }: { content: ProcessContent; index?: string }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const track = root.current!.querySelector<HTMLElement>("[data-track]")!;
        const pinEl = root.current!.querySelector<HTMLElement>("[data-pin]")!;
        const bar = root.current!.querySelector<HTMLElement>("[data-bar]")!;
        const van = root.current!.querySelector<HTMLElement>("[data-van]")!;
        const panels = gsap.utils.toArray<HTMLElement>("[data-step]", track);
        const distance = () => track.scrollWidth - window.innerWidth;
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: pinEl,
            start: "top top",
            end: () => "+=" + distance(),
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
        tl.to(track, { x: () => -distance() }, 0)
          .fromTo(bar, { scaleX: 0 }, { scaleX: 1 }, 0)
          .fromTo(van, { left: "0%" }, { left: "100%" }, 0);
        panels.forEach((p) => {
          const num = p.querySelector("[data-num]");
          gsap.fromTo(
            num,
            { yPercent: 40, opacity: 0.2 },
            {
              yPercent: 0,
              opacity: 1,
              ease: "none",
              scrollTrigger: { trigger: p, containerAnimation: tl, start: "left 90%", end: "left 40%", scrub: true },
            },
          );
        });
      });
      mm.add("(max-width: 767px) and (prefers-reduced-motion: no-preference)", () => {
        const line = root.current!.querySelector<HTMLElement>("[data-vline]");
        if (line)
          gsap.fromTo(line, { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: line.parentElement, start: "top 70%", end: "bottom 70%", scrub: true } });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="deroulement" aria-labelledby="deroulement-title" className="relative bg-forest">
      <div data-pin className="relative md:flex md:h-[100svh] md:flex-col md:justify-center md:overflow-hidden">
        <div className="section-y md:py-0">
          <SectionHeader index={index} label="Déroulement" title={content.title} intro={content.intro} provisional={content.provisional} titleId="deroulement-title" />
        </div>

        {/* Piste horizontale (ordinateur) / chronologie verticale (mobile) */}
        <div className="relative md:mt-14">
          <ol data-track className="container-x relative grid gap-12 pb-24 md:flex md:w-max md:gap-6 md:pb-0">
            <span data-vline className="absolute bottom-24 left-[calc(var(--gutter)+19px)] top-2 w-px origin-top bg-line-strong md:hidden" aria-hidden="true" />
            {content.steps.map((s, i) => (
              <li key={s.title} data-step className="relative grid grid-cols-[40px_1fr] gap-5 md:block md:w-[min(30rem,34vw)] md:shrink-0">
                <span className="relative z-10 grid h-10 w-10 place-items-center rounded-full border border-line-strong bg-ink md:hidden" aria-hidden="true">
                  <span className="label tabular-nums">{i + 1}</span>
                </span>
                <div className="md:h-full md:rounded-[12px] md:border md:border-line md:p-8">
                  <div className="flex items-start justify-between">
                    <span data-num className="hidden font-serif text-[clamp(4rem,7vw,7.5rem)] leading-[0.8] text-sand md:block">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <svg viewBox="0 0 48 48" className="h-9 w-9 text-cream/80 md:h-11 md:w-11" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      {ICONS[s.motif] ?? ICONS.advice}
                    </svg>
                  </div>
                  {s.image && (
                    <div className="relative mt-6 aspect-[16/10] overflow-hidden rounded-[8px]">
                      <Image src={s.image} alt={s.title} fill sizes="(min-width: 768px) 30vw, 90vw" className="object-cover" />
                    </div>
                  )}
                  <h3 className="heading-sm mt-6 md:mt-10">{s.title}</h3>
                  <p className="body mt-4 text-cream/70">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>

          {/* Progression avec le camion */}
          <div className="container-x mt-10 hidden md:block" aria-hidden="true">
            <div className="relative h-px bg-line">
              <div data-bar className="absolute inset-0 origin-left bg-cream" />
              <div data-van className="absolute -top-[13px] -translate-x-full">
                <svg viewBox="0 0 48 26" className="h-[24px] w-[44px] text-cream" fill="currentColor">
                  <path d="M 2 18 V 5 c 0 -1 1 -2 2 -2 h 26 c 2 0 3 1 4 2 l 6 7 c 1 0 4 1 5 3 v 3 c 0 1 -1 2 -2 2 H 4 c -1 0 -2 -1 -2 -2 Z" />
                  <circle cx="12" cy="21" r="4" fill="#0d0a07" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="36" cy="21" r="4" fill="#0d0a07" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
