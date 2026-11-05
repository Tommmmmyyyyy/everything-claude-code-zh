"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP, prefersReducedMotion, isFinePointer } from "@/lib/gsap";
import { onIntroDone } from "@/lib/intro";
import { scramble } from "@/lib/scramble";
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
  base?: string;
  area?: string;
  lat?: number;
  lng?: number;
}

/**
 * Ouverture « instrument » : la photo est révélée par un faisceau de scanner,
 * le nom se cale caractère par caractère, les données s'affichent comme sur un écran de mesure.
 */
export function Hero({ firstName, lastName, tagline, subtitle, profession, diploma, video, image, imageMobile, imageAlt, base, area, lat, lng }: Props) {
  const root = useRef<HTMLElement>(null);
  const [school, title] = (diploma || "").split(" — ");
  const coords = lat && lng ? `${lat.toFixed(4)}° N · ${lng.toFixed(4)}° E` : null;
  const taglineMain = tagline.replace(/\s*en bonne santé\.?$/, "");
  const taglineEnd = tagline.endsWith("en bonne santé.") ? "en bonne santé." : "";

  useGSAP(
    () => {
      const el = root.current!;
      const reduce = prefersReducedMotion();
      const scene = el.querySelector<HTMLElement>("[data-hero-scene]")!;
      const beam = el.querySelector<HTMLElement>("[data-hero-beam]");
      const depthLayers = gsap.utils.toArray<HTMLElement>("[data-depth]", el);
      const nameLines = gsap.utils.toArray<HTMLElement>("[data-hero-name]", el);
      const fades = gsap.utils.toArray<HTMLElement>("[data-hero-fade]", el);
      const decodes = gsap.utils.toArray<HTMLElement>("[data-hero-decode]", el);
      const tag = el.querySelector<HTMLElement>("[data-hero-tagline]")!;

      el.classList.add("is-ready");
      if (reduce) return;

      /* Préparation */
      const splits = nameLines.map((line) => SplitText.create(line, { type: "chars", mask: "chars", charsClass: "hero-char", aria: "auto" }));
      const chars = splits.flatMap((s) => s.chars);
      const tagSplit = SplitText.create(tag, { type: "lines", mask: "lines", linesClass: "split-line", aria: "auto" });
      gsap.set(chars, { yPercent: 105, opacity: 0 });
      gsap.set(tagSplit.lines, { yPercent: 110, opacity: 0 });
      gsap.set(fades, { opacity: 0, y: 18 });
      gsap.set(scene, { clipPath: "inset(0% 100% 0% 0%)", scale: 1.12, transformOrigin: "60% 60%" });
      if (beam) gsap.set(beam, { xPercent: 0, left: "0%", opacity: 0 });

      /* Entrée en scène (après le rideau) : balayage du scanner, puis le texte */
      const stops: Array<() => void> = [];
      const intro = gsap.timeline({ paused: true });
      intro
        .to(scene, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "power3.inOut" }, 0)
        .to(scene, { scale: 1, duration: 3.4, ease: "expo.out" }, 0.1);
      if (beam) {
        intro
          .to(beam, { opacity: 1, duration: 0.2 }, 0)
          .to(beam, { left: "100%", duration: 1.6, ease: "power3.inOut" }, 0)
          .to(beam, { opacity: 0, duration: 0.4 }, 1.45);
      }
      intro
        .to(chars, { yPercent: 0, opacity: 1, duration: 1.4, stagger: 0.04, ease: "expo.out" }, 0.55)
        .to(tagSplit.lines, { yPercent: 0, opacity: 1, duration: 1.3, stagger: 0.1, ease: "expo.out" }, 0.8)
        .to(fades, { opacity: 1, y: 0, duration: 1.1, stagger: 0.06, ease: "expo.out" }, 1)
        .add(() => decodes.forEach((d, i) => stops.push(scramble(d, { duration: 0.8, delay: i * 0.06 }))), 1);
      const off = onIntroDone(() => intro.play());

      /* Parallaxe au mouvement de la souris */
      let removeMouse = () => {};
      if (isFinePointer()) {
        const setters = depthLayers.map((layer) => {
          const d = parseFloat(layer.dataset.depth || "0");
          return {
            d,
            x: gsap.quickTo(layer, "x", { duration: 1.6, ease: "power3" }),
            y: gsap.quickTo(layer, "y", { duration: 1.6, ease: "power3" }),
          };
        });
        const onMove = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          setters.forEach((s) => {
            s.x(-nx * s.d * 220);
            s.y(-ny * s.d * 110);
          });
        };
        el.addEventListener("pointermove", onMove);
        removeMouse = () => el.removeEventListener("pointermove", onMove);
      }

      /* Défilement : la scène s'enfonce, le nom monte et s'efface */
      const scroll = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
      });
      depthLayers.forEach((layer) => {
        const d = parseFloat(layer.dataset.depth || "0");
        scroll.to(layer, { yPercent: d * 55, ease: "none" }, 0);
      });
      scroll
        .to("[data-hero-namewrap]", { yPercent: -30, opacity: 0.1, ease: "none" }, 0)
        .to("[data-hero-copy]", { yPercent: -36, opacity: 0, ease: "none" }, 0)
        .to("[data-hero-panel]", { yPercent: -20, opacity: 0, ease: "none" }, 0)
        .to("[data-hero-shade]", { opacity: 1, ease: "none" }, 0);

      return () => {
        off();
        removeMouse();
        stops.forEach((s) => s());
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} id="accueil" aria-labelledby="hero-title" className="relative flex min-h-[100svh] flex-col overflow-hidden bg-ink">
      {/* Décor */}
      <div data-hero-scene className="absolute inset-0 will-change-transform">
        {video ? (
          <video className="absolute inset-0 h-full w-full object-cover" src={video} poster={image ?? undefined} autoPlay muted loop playsInline aria-label={imageAlt} />
        ) : image ? (
          <div data-depth="0.1" className="absolute inset-[-4%] will-change-transform">
            <picture>
              {imageMobile && <source media="(max-width: 767px)" srcSet={imageMobile} />}
              <img
                src={image}
                alt={imageAlt}
                className="absolute inset-0 h-full w-full object-cover object-[22%_58%] [filter:saturate(0.8)_contrast(1.1)_brightness(0.86)] max-md:object-[55%_62%]"
                fetchPriority="high"
              />
            </picture>
            {/* Étalonnage froid : ombres vert profond, hautes lumières menthe */}
            <div className="absolute inset-0 opacity-60 mix-blend-color" style={{ background: "linear-gradient(160deg, rgba(40,120,100,0.5), rgba(4,24,16,0.65) 60%)" }} />
            <div className="absolute inset-0 mix-blend-soft-light" style={{ background: "radial-gradient(ellipse at 70% 30%, rgba(150,255,215,0.55), rgba(4,8,6,0) 60%)" }} />
          </div>
        ) : (
          <HeroLandscape />
        )}
      </div>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(to bottom, rgba(4,8,6,0.82) 0%, rgba(4,8,6,0.1) 32%, rgba(4,8,6,0.05) 55%, rgba(4,8,6,0.94) 100%), radial-gradient(ellipse at 0% 50%, rgba(4,8,6,0.75), rgba(4,8,6,0) 55%)" }}
      />
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
      <div data-hero-shade className="pointer-events-none absolute inset-0 bg-ink opacity-0" />
      {/* Faisceau du scanner (entrée) */}
      <div
        data-hero-beam
        className="pointer-events-none absolute inset-y-0 z-[5] w-px -translate-x-1/2 bg-cognac opacity-0 shadow-[0_0_24px_4px_rgb(126_247_198/0.7),0_0_120px_30px_rgb(126_247_198/0.25)] max-md:hidden"
        aria-hidden="true"
      />
      {/* Cadre de viseur */}
      <div className="hud-corners pointer-events-none absolute inset-3 z-[4] md:inset-5" style={{ ["--hl" as string]: "22px" }} aria-hidden="true" />

      {/* Contenu */}
      <div className="container-x relative z-10 flex flex-1 flex-col pb-[clamp(16px,3vh,40px)] pt-[calc(var(--header-h)+5vh)]">
        <div className="flex items-start justify-between gap-10">
          <div data-hero-copy className="max-w-[min(640px,100%)]">
            <div data-hero-fade className="flex items-center gap-3">
              <span className="status-dot" aria-hidden="true" />
              <span data-hero-decode className="label text-cream/85">
                {profession}
              </span>
            </div>
            <h1 id="hero-title" className="sr-only">
              {firstName} {lastName}, {profession.toLowerCase()} — {tagline}
            </h1>
            <p data-hero-tagline className="heading mt-7 !text-[clamp(1.85rem,3.2vw,3.25rem)] text-cream" aria-hidden="true">
              {taglineMain} {taglineEnd && <em className="text-sand">{taglineEnd}</em>}
            </p>
            <p data-hero-fade className="body mt-6 max-w-md text-cream/70">
              {subtitle}
            </p>
            <div data-hero-fade className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/rendez-vous" variant="filled">
                Demander un rendez-vous
              </ButtonLink>
              <ButtonLink href="#approche" variant="ghost" icon={false}>
                Découvrir mon approche
              </ButtonLink>
            </div>
          </div>

          {/* Fiche « instrument » : uniquement des informations réelles */}
          <dl data-hero-panel className="glass hidden w-[300px] shrink-0 rounded-[18px] p-5 lg:block" aria-label="En bref">
            <div data-hero-fade className="flex items-center justify-between border-b border-line pb-3">
              <span className="micro text-cream/50">Profil</span>
              <span className="micro text-sand">● {(base || "").replace(/\s*\(.*\)$/, "")}</span>
            </div>
            {[
              ["Formation", school],
              ["Titre", title],
              ["Base", base],
              ["Secteur", area],
              ["Lieu de soin", "Écurie · Pré · Pension"],
            ]
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k} data-hero-fade className="grid grid-cols-[92px_1fr] gap-3 border-b border-line py-3 last:border-0 last:pb-0">
                  <dt data-hero-decode className="micro pt-[3px] text-cream/45">
                    {k}
                  </dt>
                  <dd className="text-[0.86rem] leading-snug text-cream/90">{v}</dd>
                </div>
              ))}
          </dl>
        </div>

        <div className="mt-auto">
          <div className="flex items-end justify-between gap-6 pb-[max(14px,2.4vw)]">
            <a data-hero-fade href="#le-camion" className="group flex items-center gap-4" data-cursor="Suivre">
              <span className="relative block h-12 w-px overflow-hidden bg-line-strong" aria-hidden="true">
                <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_2.2s_var(--ease-quart)_infinite] bg-cognac shadow-[0_0_8px_var(--color-cognac)]" />
              </span>
              <span className="label text-cream/75 transition-colors group-hover:text-cream">Suivre le camion</span>
            </a>
            {coords && (
              <p data-hero-fade className="micro hidden text-right text-cream/50 sm:block">
                <span data-hero-decode className="block text-cream/75">
                  {coords}
                </span>
                <span className="mt-1 block">{base}</span>
              </p>
            )}
          </div>
          <div data-hero-namewrap aria-hidden="true" className="border-t border-line pt-[max(10px,1.2vw)]">
            <p className="display-xl whitespace-nowrap uppercase max-md:hidden md:text-[clamp(3.5rem,10.4vw,15rem)]">
              <span data-hero-name className="inline-block">
                {firstName}
              </span>{" "}
              <span data-hero-name className="inline-block font-extralight text-sand">
                {lastName}
              </span>
            </p>
            <p className="display-xl text-[clamp(2.6rem,15vw,5rem)] uppercase leading-[0.9] md:hidden">
              <span data-hero-name className="block">
                {firstName}
              </span>
              <span data-hero-name className="block text-right font-extralight text-sand">
                {lastName}
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
