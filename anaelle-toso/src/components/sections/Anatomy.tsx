"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import type { AnatomyContent, AnatomyItem } from "@/lib/content";
import {
  CrossSection,
  DentalArch,
  HEAD_OUTLINE,
  HooksProfile,
  IncisorsFront,
  LateralHighlights,
  MolarTable,
  SkullLateral,
  Speculum,
  TMJ,
  WolfToothDetail,
} from "@/components/illustrations/anatomy";

if (typeof window !== "undefined") gsap.registerPlugin(DrawSVGPlugin);

function Detail({ kind }: { kind: string }) {
  const cls = "h-full w-full";
  switch (kind) {
    case "incisors":
      return <IncisorsFront className={cls} />;
    case "arch-premolaires":
      return <DentalArch highlight="premolaires" className={cls} />;
    case "arch-molaires":
      return <DentalArch highlight="molaires" className={cls} />;
    case "molar-table":
      return <MolarTable className={cls} />;
    case "cross-section":
      return <CrossSection className={cls} />;
    case "hooks":
      return <HooksProfile className={cls} />;
    case "wolf":
      return <WolfToothDetail className={cls} />;
    default:
      return null;
  }
}

export function Anatomy({ content, index = "04" }: { content: AnatomyContent; index?: string }) {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState<AnatomyItem["id"]>("pointes");
  const [explorer, setExplorer] = useState(false);
  const current = content.items.find((i) => i.id === active) ?? content.items[0];

  useGSAP(
    () => {
      const el = root.current!;
      const cam = el.querySelector<SVGGElement>("[data-cam]")!;
      const exterior = el.querySelector<SVGPathElement>("[data-exterior]")!;
      const eye = el.querySelector<SVGElement>("[data-eye]")!;
      const draws = gsap.utils.toArray<SVGElement>("[data-skull] [data-draw], [data-mandible] [data-draw]", el);
      const teeth = gsap.utils.toArray<SVGElement>("[data-tooth], [data-teeth], [data-skull] rect, [data-mandible] rect", el);
      const mandible = el.querySelector<SVGGElement>("[data-mandible]")!;
      const speculum = el.querySelector<SVGGElement>("[data-speculum]")!;
      const specDraws = gsap.utils.toArray<SVGElement>("[data-draw]", speculum);
      const lamp = el.querySelector<SVGElement>("[data-lamp]")!;
      const hotspots = gsap.utils.toArray<SVGGElement>("[data-hotspot]", el);
      const intro = el.querySelector<HTMLElement>("[data-anat-intro]")!;
      const panel = el.querySelector<HTMLElement>("[data-anat-panel]")!;
      const plate = el.querySelector<HTMLElement>("[data-anat-plate]")!;
      // mobile : la planche occupe d'abord l'écran, puis se réduit quand l'explorateur apparaît
      const narrow = window.matchMedia("(max-width: 767px)").matches;

      const finalState = () => {
        gsap.set(cam, { attr: { transform: camTransform(1) } });
        gsap.set(exterior, { fillOpacity: 0, strokeOpacity: 0.28 });
        gsap.set(mandible, { rotation: -9, svgOrigin: `${TMJ.x} ${TMJ.y}` });
        gsap.set(speculum, { opacity: 1 });
        gsap.set(lamp, { opacity: 1 });
        gsap.set(hotspots, { opacity: 1, scale: 1, transformOrigin: "50% 50%" });
        gsap.set(eye, { opacity: 0.3 });
        gsap.set(intro, { autoAlpha: 0 });
        setExplorer(true);
      };

      if (prefersReducedMotion()) {
        finalState();
        return;
      }

      gsap.set(cam, { attr: { transform: camTransform(0) } });
      gsap.set(exterior, { fillOpacity: 1, strokeOpacity: 0.6 });
      gsap.set(draws, { drawSVG: "0%" });
      gsap.set(teeth, { opacity: 0 });
      gsap.set(speculum, { opacity: 0 });
      gsap.set(specDraws, { drawSVG: "0%" });
      gsap.set(lamp, { opacity: 0 });
      gsap.set(hotspots, { opacity: 0, scale: 0, transformOrigin: "50% 50%" });
      gsap.set(panel, { autoAlpha: 0, y: 30 });
      const textCol = el.querySelector<HTMLElement>("[data-anat-text]")!;
      if (narrow) {
        // la planche est limitée par la largeur : on l'agrandit (cadrée sur la bouche) et on décale le texte
        const lift = plate.getBoundingClientRect().height * 0.5;
        gsap.set(plate, { scale: 1.5, transformOrigin: "8% 0%" });
        gsap.set(textCol, { y: lift });
      }

      const camProxy = { p: 0 };
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => "+=" + window.innerHeight * 2.6,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          onUpdate: (self) => setExplorer(self.progress > 0.86),
        },
      });
      tl.to(camProxy, { p: 1, duration: 2.2, ease: "power2.inOut", onUpdate: () => cam.setAttribute("transform", camTransform(camProxy.p)) }, 0)
        .to(exterior, { fillOpacity: 0, strokeOpacity: 0.28, duration: 1.2 }, 0.6)
        .to(eye, { opacity: 0.3, duration: 1 }, 0.6)
        .to(draws, { drawSVG: "100%", duration: 1.4, stagger: 0.04 }, 0.8)
        .to(teeth, { opacity: 1, duration: 0.8, stagger: 0.01 }, 1.4)
        .to(intro, { autoAlpha: 0, y: -20, duration: 0.6 }, 2.4)
        .to(mandible, { rotation: -9, svgOrigin: `${TMJ.x} ${TMJ.y}`, duration: 0.9, ease: "power2.inOut" }, 2.5)
        .to(speculum, { opacity: 1, duration: 0.3 }, 2.9)
        .to(specDraws, { drawSVG: "100%", duration: 0.8, stagger: 0.05 }, 2.9)
        .to(lamp, { opacity: 1, duration: 0.6 }, 3.3)
        .to(hotspots, { opacity: 1, scale: 1, duration: 0.5, stagger: 0.06, ease: "back.out(2)" }, 3.5)
        .to(panel, { autoAlpha: 1, y: 0, duration: 0.6 }, 3.6)
        .to({}, { duration: 0.6 });
      if (narrow) tl.to(plate, { scale: 1, duration: 0.8, ease: "power2.inOut" }, 3.1).to(textCol, { y: 0, duration: 0.8, ease: "power2.inOut" }, 3.1);
    },
    { scope: root },
  );

  const select = (id: AnatomyItem["id"]) => setActive(id);

  return (
    <section
      ref={root}
      id="dentition"
      aria-labelledby="dentition-title"
      className="relative h-[100svh] overflow-hidden bg-forest"
      data-explorer={explorer ? "on" : "off"}
    >
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at 65% 55%, rgba(156,174,142,0.12), transparent 60%)" }} />

      <div className="container-x relative grid h-full grid-cols-[minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)] gap-4 pb-6 pt-[calc(var(--header-h)+2vh)] md:grid-cols-12 md:grid-rows-1 md:gap-6 md:pb-10">
        {/* Colonne texte */}
        <div data-anat-text className="relative z-10 flex min-w-0 flex-col md:col-span-5 lg:col-span-4">
          <div className="flex items-center gap-4">
            <span className="label text-cream/50">({index})</span>
            <span className="label">Anatomie</span>
            <span className="rule-dashed flex-1" aria-hidden="true" />
          </div>
          <h2 id="dentition-title" className="heading mt-4 max-md:text-[2rem] md:mt-10">
            {content.title}
          </h2>

          <div className="relative mt-4 flex-1 md:mt-8">
            <p data-anat-intro className="body absolute inset-x-0 top-0 max-w-sm text-cream/70">
              {content.intro}
            </p>

            {/* Explorateur */}
            <div data-anat-panel className="absolute inset-x-0 top-0" aria-live="polite">
              <div role="tablist" aria-label="Structures dentaires" className="flex gap-2 overflow-x-auto pb-2 md:flex-wrap md:overflow-visible" data-lenis-prevent>
                {content.items.map((it) => (
                  <button
                    key={it.id}
                    type="button"
                    role="tab"
                    id={`tab-${it.id}`}
                    aria-selected={active === it.id}
                    aria-controls="anat-detail"
                    onClick={() => select(it.id)}
                    onMouseEnter={() => select(it.id)}
                    className={`label shrink-0 rounded-[22.5px] border px-3.5 py-2 transition-colors duration-300 ${
                      active === it.id ? "border-cream bg-cream text-ink" : "border-line-strong text-cream/80 hover:border-cream"
                    }`}
                  >
                    {it.title.replace(/^Les /, "")}
                  </button>
                ))}
              </div>

              <div id="anat-detail" role="tabpanel" aria-labelledby={`tab-${current.id}`} className="mt-4 rounded-[12px] border border-line p-4 md:mt-6 md:p-5">
                <div key={current.id} className="grid grid-cols-[1fr_110px] gap-4 animate-[fadeup_0.6s_var(--ease-expo)] md:block">
                  <div>
                    <p className="label text-sand">{current.short}</p>
                    <h3 className="heading-sm mt-2">{current.title}</h3>
                    <p className="mt-3 text-[0.85rem] leading-relaxed text-cream/75 md:text-[0.95rem]">{current.text}</p>
                  </div>
                  <div className="h-[110px] md:mt-4 md:h-[150px] [@media(max-height:720px)]:hidden" aria-hidden="true">
                    <Detail kind={current.detail} />
                  </div>
                </div>
              </div>
              <p className="micro mt-3 text-cream/40 max-md:hidden">{content.note}</p>
            </div>
          </div>
        </div>

        {/* Planche anatomique */}
        <div data-anat-plate className="relative row-start-1 min-h-0 min-w-0 max-md:max-h-[34svh] md:col-span-7 md:row-start-auto lg:col-span-8">
          <svg viewBox="0 0 1000 620" className="h-full w-full" role="img" aria-labelledby="anat-svg-title">
            <title id="anat-svg-title">
              Schéma de la tête d&apos;un cheval en vue latérale : crâne, mâchoires, incisives, dents jugales, dent de loup et pas-d&apos;âne en place.
            </title>
            <defs>
              <radialGradient id="anatLamp">
                <stop offset="0" stopColor="#fff1cf" stopOpacity="0.55" />
                <stop offset="1" stopColor="#fff1cf" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="anatHead" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#2a3d2f" />
                <stop offset="1" stopColor="#15241a" />
              </linearGradient>
            </defs>
            <g data-cam>
              <path data-exterior d={HEAD_OUTLINE} fill="url(#anatHead)" stroke="var(--color-sage)" strokeWidth="1.5" />
              <g data-eye>
                <path d="M 668 200 C 680 188, 704 188, 716 200 C 704 212, 680 212, 668 200 Z" fill="#0d0a07" stroke="var(--color-sage)" strokeOpacity="0.6" />
                <path d="M 58 296 C 70 286, 92 290, 96 304" fill="none" stroke="var(--color-sage)" strokeOpacity="0.6" strokeWidth="2" />
              </g>
              <circle data-lamp cx="200" cy="400" r="200" fill="url(#anatLamp)" />
              <SkullLateral />
              <g data-hl-root data-active={active}>
                <LateralHighlights />
              </g>
              <Speculum />
              {content.items.map((it, i) => (
                <g
                  key={it.id}
                  data-hotspot
                  aria-hidden="true"
                  className="cursor-pointer"
                  onClick={() => select(it.id)}
                  onMouseEnter={() => select(it.id)}
                  data-cursor={it.title.replace(/^Les /, "")}
                >
                  <circle cx={it.hotspot[0]} cy={it.hotspot[1]} r="22" fill="transparent" />
                  <circle
                    cx={it.hotspot[0]}
                    cy={it.hotspot[1]}
                    r={active === it.id ? 9 : 6}
                    fill={active === it.id ? "var(--color-cognac)" : "var(--color-cream)"}
                    className="transition-all duration-300"
                  />
                  <circle cx={it.hotspot[0]} cy={it.hotspot[1]} r="14" fill="none" stroke="var(--color-cream)" strokeOpacity="0.6" className="animate-[pulse-ring_2.4s_ease-out_infinite]" style={{ transformOrigin: `${it.hotspot[0]}px ${it.hotspot[1]}px`, animationDelay: `${i * 0.3}s` }} />
                </g>
              ))}
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}

/** Caméra : du profil complet (p = 0) au gros plan sur la bouche (p = 1). */
function camTransform(p: number) {
  const e = Math.max(0, Math.min(1, p));
  const s0 = 0.9;
  const s1 = 1.3;
  const s = s0 + (s1 - s0) * e;
  // p = 0 : vue d'ensemble centrée ; p = 1 : la bouche (395, 345) ramenée au centre du cadre
  const tx0 = 500 - 500 * s0;
  const ty0 = 310 - 310 * s0;
  const tx1 = 500 - 395 * s1;
  const ty1 = 310 - 345 * s1;
  const tx = tx0 + (tx1 - tx0) * e;
  const ty = ty0 + (ty1 - ty0) * e;
  return `translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${s.toFixed(4)})`;
}
