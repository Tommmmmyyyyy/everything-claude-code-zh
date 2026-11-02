"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP, prefersReducedMotion, isFinePointer } from "@/lib/gsap";
import { onIntroDone } from "@/lib/intro";
import { HeroLandscape } from "@/components/illustrations/HeroLandscape";
import { ButtonLink } from "@/components/ui/Button";

interface Props {
  firstName: string;
  lastName: string;
  tagline: string;
  subtitle: string;
  profession: string;
  diploma?: string | null;
  video: string | null;
  image: string | null;
  imageMobile?: string | null;
  imageAlt: string;
}

export function Hero({ firstName, lastName, tagline, subtitle, profession, diploma, video, image, imageMobile, imageAlt }: Props) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const reduce = prefersReducedMotion();
      const scene = el.querySelector<HTMLElement>("[data-hero-scene]")!;
      const depthLayers = gsap.utils.toArray<HTMLElement>("[data-depth]", el);
      const nameLines = gsap.utils.toArray<HTMLElement>("[data-hero-name]", el);
      const fades = gsap.utils.toArray<HTMLElement>("[data-hero-fade]", el);
      const tag = el.querySelector<HTMLElement>("[data-hero-tagline]")!;

      el.classList.add("is-ready");
      if (reduce) return;

      /* Préparation */
      const splits = nameLines.map((line) => SplitText.create(line, { type: "chars", mask: "chars", charsClass: "hero-char", aria: "auto" }));
      const tagSplit = SplitText.create(tag, { type: "lines", mask: "lines", linesClass: "split-line", aria: "auto" });
      gsap.set(splits.flatMap((s) => s.chars), { yPercent: 115 });
      gsap.set(tagSplit.lines, { yPercent: 110 });
      gsap.set(fades, { opacity: 0, y: 24 });
      gsap.set(scene, { scale: 1.22, transformOrigin: "56% 64%" });
      const sun = el.querySelector("[data-sun]");
      if (sun) gsap.set(sun, { yPercent: 18 });

      /* Entrée en scène (après le rideau) */
      const intro = gsap.timeline({ paused: true });
      intro
        .to(scene, { scale: 1, duration: 3.2, ease: "expo.out" }, 0)
        .to(splits.flatMap((s) => s.chars), { yPercent: 0, duration: 1.5, stagger: 0.045, ease: "expo.out" }, 0.25)
        .to(tagSplit.lines, { yPercent: 0, duration: 1.3, stagger: 0.1, ease: "expo.out" }, 0.7)
        .to(fades, { opacity: 1, y: 0, duration: 1.2, stagger: 0.08, ease: "expo.out" }, 0.95);
      if (sun) intro.to(sun, { yPercent: 0, duration: 3.4, ease: "power3.out" }, 0);
      const off = onIntroDone(() => intro.play());

      /* Parallaxe au mouvement de la souris */
      let removeMouse = () => {};
      if (isFinePointer()) {
        const setters = depthLayers.map((layer) => {
          const d = parseFloat(layer.dataset.depth || "0");
          return {
            d,
            x: gsap.quickTo(layer, "x", { duration: 1.4, ease: "power3" }),
            y: gsap.quickTo(layer, "y", { duration: 1.4, ease: "power3" }),
          };
        });
        const onMove = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          setters.forEach((s) => {
            s.x(-nx * s.d * 260);
            s.y(-ny * s.d * 120);
          });
        };
        el.addEventListener("pointermove", onMove);
        removeMouse = () => el.removeEventListener("pointermove", onMove);
      }

      /* Défilement : les couches se séparent, le titre monte et s'efface */
      const scroll = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
      });
      depthLayers.forEach((layer) => {
        const d = parseFloat(layer.dataset.depth || "0");
        scroll.to(layer, { yPercent: d * 55, ease: "none" }, 0);
      });
      scroll
        .to("[data-hero-namewrap]", { yPercent: -35, opacity: 0.15, ease: "none" }, 0)
        .to("[data-hero-copy]", { yPercent: -40, opacity: 0, ease: "none" }, 0)
        .to("[data-hero-shade]", { opacity: 1, ease: "none" }, 0);

      return () => {
        off();
        removeMouse();
      };
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="accueil"
      aria-labelledby="hero-title"
      className="relative flex min-h-[100svh] flex-col overflow-hidden bg-ink"
    >
      {/* Décor */}
      <div data-hero-scene className="absolute inset-0 will-change-transform">
        {video ? (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src={video}
            poster={image ?? undefined}
            autoPlay
            muted
            loop
            playsInline
            aria-label={imageAlt}
          />
        ) : image ? (
          <div data-depth="0.1" className="absolute inset-[-4%] will-change-transform">
            <picture>
              {imageMobile && <source media="(max-width: 767px)" srcSet={imageMobile} />}
              <img src={image} alt={imageAlt} className="absolute inset-0 h-full w-full object-cover object-[22%_58%] max-md:object-[55%_62%]" fetchPriority="high" />
            </picture>
            {/* Étalonnage : lumière dorée et noirs chauds, accordés à la palette */}
            <div className="absolute inset-0 mix-blend-soft-light" style={{ background: "linear-gradient(160deg, rgba(240,180,110,0.55), rgba(122,75,42,0.35) 55%, rgba(13,10,7,0.6))" }} />
            <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 18% 22%, rgba(13,10,7,0.72), rgba(13,10,7,0) 58%)" }} />
          </div>
        ) : (
          <HeroLandscape />
        )}
      </div>
      <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(7,9,6,0.7) 0%, rgba(7,9,6,0) 34%, rgba(7,9,6,0) 60%, rgba(13,10,7,0.85) 100%)" }} />
      <div data-hero-shade className="pointer-events-none absolute inset-0 bg-ink opacity-0" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="grain" />
      </div>

      {/* Étiquette verticale (numéro de série) */}
      <p
        data-hero-fade
        className="micro absolute right-[var(--gutter)] top-[42%] hidden origin-center translate-x-1/2 -translate-y-1/2 rotate-90 whitespace-nowrap text-cream/60 lg:block"
        aria-hidden="true"
      >
        {firstName} {lastName} — {profession} — Bien-être équin
      </p>

      {/* Contenu */}
      <div className="container-x relative z-10 flex flex-1 flex-col pb-[clamp(16px,3vh,40px)] pt-[calc(var(--header-h)+4vh)]">
        <div data-hero-copy className="max-w-[min(560px,100%)]">
          <div data-hero-fade className="flex items-center gap-4">
            <span className="label text-cream/60">(01)</span>
            <span className="label">{profession}</span>
          </div>
          <h1 id="hero-title" className="sr-only">
            {firstName} {lastName}, {profession.toLowerCase()} — {tagline}
          </h1>
          <p data-hero-tagline className="mt-8 font-serif text-[clamp(2rem,3.4vw,3.4rem)] leading-[0.98] text-cream" aria-hidden="true">
            Le bien-être commence par une bouche <em className="italic text-sand">en bonne santé.</em>
          </p>
          <p data-hero-fade className="body mt-6 max-w-md text-cream/75">
            {subtitle}
          </p>
          <div data-hero-fade className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href="#approche" variant="ghost" icon={false}>
              Découvrir mon approche
            </ButtonLink>
            <ButtonLink href="/rendez-vous" variant="filled">
              Demander un rendez-vous
            </ButtonLink>
          </div>
        </div>

        <div className="mt-auto">
          <div className="flex items-end justify-between gap-6 pb-[max(16px,3.2vw)]">
            <a data-hero-fade href="#le-camion" className="group flex items-center gap-4" data-cursor="Suivre">
              <span className="relative block h-12 w-px overflow-hidden bg-line-strong" aria-hidden="true">
                <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_2.2s_var(--ease-quart)_infinite] bg-cream" />
              </span>
              <span className="label text-cream/80 transition-colors group-hover:text-cream">
                Suivre le camion
              </span>
            </a>
            <p data-hero-fade className="micro hidden max-w-[240px] text-right text-cream/60 sm:block lg:mr-10">
              {diploma ? (
                <>
                  <span className="block text-cream/85">{diploma.split(" — ")[0]}</span>
                  <span className="mt-1 block">{diploma.split(" — ")[1] ?? "Soins dentaires équins, à l'écurie comme au pré"}</span>
                </>
              ) : (
                <>Soins dentaires équins, à l&apos;écurie comme au pré</>
              )}
            </p>
          </div>
          <div data-hero-namewrap aria-hidden="true">
            <p className="display-xl whitespace-nowrap uppercase max-md:hidden md:text-[clamp(4rem,18.2vw,26rem)]">
              <span data-hero-name className="inline-block">{firstName}</span>{" "}
              <span data-hero-name className="inline-block italic text-sand">{lastName}</span>
            </p>
            <p className="display-xl uppercase leading-[0.82] md:hidden">
              <span data-hero-name className="block">{firstName}</span>
              <span data-hero-name className="block text-right italic text-sand">{lastName}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
