"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion, smoothstep } from "@/lib/gsap";
import { Van } from "@/components/illustrations/Van";
import { ButtonLink } from "@/components/ui/Button";
import {
  C_END,
  C_SWITCH,
  ENTRANCE_C,
  EXIT_C,
  ForegroundLayer,
  FarLayer,
  GroundLayer,
  H,
  GROUND,
  InteriorFloor,
  InteriorWall,
  MidLayer,
  NearLayer,
  OFFSET,
  SPEED,
  layerWidth,
} from "./journey/world";

const CHAPTERS = [
  {
    n: "01",
    label: "La route",
    title: "Chaque rendez-vous commence sur la route.",
    text: "Mon camion est mon cabinet itinérant : le matériel voyage avec moi, partout dans la Somme.",
  },
  {
    n: "02",
    label: "L'écurie",
    title: "J'entre dans le quotidien de vos chevaux.",
    text: "L'allée, les boxes, les habitudes de chacun : je prends le temps d'observer avant d'intervenir.",
  },
  {
    n: "03",
    label: "La pâture",
    title: "Au box ou au pré, là où ils vivent.",
    text: "Examiner un cheval dans un environnement qu'il connaît, c'est déjà respecter son confort.",
  },
  {
    n: "04",
    label: "L'intervention",
    title: "Faire connaissance, puis prendre soin.",
    text: "Un examen attentif, des gestes mesurés, des explications claires pour vous.",
  },
];

const TRUCK_X = -250; // centre du camion, en unités, par rapport au centre de l'écran
const TRUCK_W = 600;
const TRUCK_H = (TRUCK_W * 300) / 640;
const WHEEL_R = (41 * TRUCK_W) / 640;

interface Props {
  livery: string;
  liverySub: string;
  truckImage: string | null;
  truckImageAlt: string;
  index?: string;
}

export function TruckJourney({ livery, liverySub, truckImage, truckImageAlt, index = "03" }: Props) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = root.current!;
      const stage = section.querySelector<HTMLElement>("[data-stage]")!;
      const camera = section.querySelector<HTMLElement>("[data-camera]")!;
      const layers = gsap.utils.toArray<HTMLElement>("[data-layer]", section).map((el) => ({
        el,
        s: parseFloat(el.dataset.speed || "1"),
      }));
      const scenes = {
        road: gsap.utils.toArray<SVGGElement>("[data-scene='road']", section),
        pasture: gsap.utils.toArray<SVGGElement>("[data-scene='pasture']", section),
      };
      const skyDay = section.querySelector<HTMLElement>("[data-sky='day']")!;
      const sun = section.querySelector<HTMLElement>("[data-sun]")!;
      const clipA = section.querySelector<HTMLElement>("[data-clip-a]")!;
      const clipAInner = section.querySelector<HTMLElement>("[data-clip-a-inner]")!;
      const clipB = section.querySelector<HTMLElement>("[data-clip-b]")!;
      const clipBInner = section.querySelector<HTMLElement>("[data-clip-b-inner]")!;
      const interiorTint = section.querySelector<HTMLElement>("[data-interior-tint]")!;
      const truck = section.querySelector<HTMLElement>("[data-truck]")!;
      const truckBody = truck.querySelector<SVGGElement>("[data-body]");
      const wheels = gsap.utils.toArray<SVGGElement>("[data-wheel]", truck);
      const beam = truck.querySelector<SVGGElement>("[data-beam]");
      const door = truck.querySelector<SVGGElement>("[data-door]");
      const examLight = section.querySelector<SVGCircleElement>("[data-examlight]");
      const chapters = gsap.utils.toArray<HTMLElement>("[data-chapter]", section);
      const dots = gsap.utils.toArray<HTMLElement>("[data-dot]", section);
      const progress = section.querySelector<HTMLElement>("[data-progress]")!;
      const cta = section.querySelector<HTMLElement>("[data-cta]")!;

      let u = 1;
      let W = 0;
      let Hpx = 0;
      const measure = () => {
        W = stage.clientWidth;
        Hpx = stage.clientHeight;
        u = Math.min(Hpx / H, W / 1040);
        stage.style.setProperty("--u", String(u));
      };
      measure();

      const state = { c: 0, zoom: 1, door: 0, cta: 0, t: 0 };
      let currentScene = "road";
      let currentChapter = -1;

      const render = () => {
        const { c, zoom } = state;
        // Couches en parallaxe
        for (const { el, s } of layers) {
          el.style.transform = `translate3d(${(-OFFSET - c * s) * u}px,0,0)`;
        }
        // Bascule de décor, masquée par l'intérieur de l'écurie
        const scene = c > C_SWITCH ? "pasture" : "road";
        if (scene !== currentScene) {
          currentScene = scene;
          gsap.set(scenes.road, { opacity: scene === "road" ? 1 : 0 });
          gsap.set(scenes.pasture, { opacity: scene === "pasture" ? 1 : 0 });
          skyDay.style.opacity = scene === "pasture" ? "1" : "0";
        }
        // Fenêtre de l'intérieur : entre le chambranle d'entrée et celui de sortie
        const entranceX = ENTRANCE_C * SPEED.fg - c * SPEED.fg; // unités écran
        const exitX = EXIT_C * SPEED.fg - c * SPEED.fg;
        const L = Math.max(-10, Math.min(W + 10, W / 2 + entranceX * u));
        const R = Math.max(-10, Math.min(W + 10, W / 2 + exitX * u));
        clipA.style.transform = `translate3d(${L}px,0,0)`;
        clipAInner.style.transform = `translate3d(${-L}px,0,0)`;
        clipB.style.transform = `translate3d(${R - W}px,0,0)`;
        clipBInner.style.transform = `translate3d(${W - R}px,0,0)`;
        // Ambiance intérieure : le camion est-il dans l'écurie ?
        const truckFront = TRUCK_X + TRUCK_W / 2;
        const inside = smoothstep(truckFront + 200, truckFront - 200, entranceX) * smoothstep(truckFront - 400, truckFront, exitX);
        interiorTint.style.opacity = String(inside * 0.55);
        truck.style.filter = `brightness(${1 - inside * 0.28}) sepia(${inside * 0.35})`;
        if (beam) beam.setAttribute("opacity", String(inside));
        // Roues et suspension
        const deg = (c / (2 * Math.PI * WHEEL_R)) * 360;
        wheels.forEach((w) => w.setAttribute("transform", `rotate(${deg % 360})`));
        const moving = 1 - smoothstep(C_END - 300, C_END, c);
        const bump = (Math.sin(c * 0.045) * 1.1 + Math.sin(c * 0.017 + 1) * 1.4) * moving;
        if (truckBody) truckBody.setAttribute("transform", `translate(0 ${bump.toFixed(2)})`);
        if (door) door.setAttribute("transform", `translate(${-118 * state.door} 0)`);
        if (examLight) examLight.setAttribute("opacity", String(smoothstep(0.4, 1, state.cta)));
        // Soleil
        sun.style.transform = `translate3d(${-c * 0.02 * u}px, ${(c > C_SWITCH ? -120 : 0) * u}px, 0)`;
        // Caméra (zoom final sur la scène d'intervention)
        camera.style.transform = `scale(${zoom})`;
        // Chapitres
        const idx = state.t >= 10.2 ? 3 : c < ENTRANCE_C - 150 ? 0 : c < EXIT_C ? 1 : 2;
        if (idx !== currentChapter) {
          currentChapter = idx;
          chapters.forEach((el, i) => el.classList.toggle("is-active", i === idx));
          dots.forEach((el, i) => el.classList.toggle("is-active", i <= idx));
        }
        progress.style.transform = `scaleX(${Math.min(1, state.t / 14)})`;
        cta.style.opacity = String(state.cta);
        cta.style.visibility = state.cta > 0.02 ? "visible" : "hidden";
        cta.style.transform = `translate3d(0, ${(1 - state.cta) * 30}px, 0)`;
      };

      const setOrigin = () => {
        // Point de fuite du zoom : la scène d'intervention, à droite du camion
        camera.style.transformOrigin = `${W / 2 + 230 * u}px ${Hpx - (H - GROUND + 140) * u}px`;
      };
      setOrigin();

      if (prefersReducedMotion()) {
        state.c = C_END;
        state.t = 14;
        state.door = 1;
        state.cta = 1;
        render();
        const onResize = () => {
          measure();
          setOrigin();
          render();
        };
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
      }

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        onUpdate: render,
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => "+=" + window.innerHeight * 6.5,
          pin: true,
          scrub: 0.9,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefresh: () => {
            measure();
            setOrigin();
            render();
          },
        },
      });
      tl.to(state, { t: 14, duration: 14 }, 0)
        .to(state, { c: C_END - 700, duration: 10 }, 0)
        .to(state, { c: C_END, duration: 1.6, ease: "power2.out" }, 10)
        .to(state, { door: 1, duration: 1.2, ease: "power2.inOut" }, 11.4)
        .to(state, { zoom: 1.4, duration: 2.2, ease: "power2.inOut" }, 11.6)
        .to(state, { cta: 1, duration: 1.4, ease: "power2.out" }, 12.6);

      render();
      return () => {
        ScrollTrigger.getAll().forEach((st) => st.trigger === section && st.kill());
      };
    },
    { scope: root },
  );

  const layer = (s: number, children: React.ReactNode, extra = "") => (
    <div
      data-layer
      data-speed={s}
      className={`absolute bottom-0 left-1/2 will-change-transform ${extra}`}
      style={{ width: `calc(var(--u) * ${layerWidth(s)}px)`, height: `calc(var(--u) * ${H}px)` }}
    >
      {children}
    </div>
  );

  return (
    <section
      ref={root}
      id="le-camion"
      aria-labelledby="camion-title"
      className="relative h-[100svh] overflow-hidden bg-ink"
    >
      <h2 id="camion-title" className="sr-only">
        Le camion d&apos;Anaëlle : sur la route de vos chevaux
      </h2>
      <div data-stage className="absolute inset-0" style={{ ["--u" as string]: 1 }}>
        <div data-camera className="absolute inset-0 will-change-transform">
          {/* Ciels */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, #b8763f 0px, #d79a5a calc(var(--u) * 250px), #8c5a33 calc(var(--u) * 340px), #3b2c1e calc(var(--u) * 460px), #18160f calc(var(--u) * 640px), #0b0d0a calc(var(--u) * 980px))",
            }}
          />
          <div
            data-sky="day"
            className="absolute inset-0 opacity-0 transition-opacity duration-700"
            style={{
              background:
                "linear-gradient(to top, #e7cf9c 0px, #e2c48c calc(var(--u) * 260px), #a9a678 calc(var(--u) * 380px), #4f5c45 calc(var(--u) * 560px), #1c271d calc(var(--u) * 820px), #0e150f calc(var(--u) * 1100px))",
            }}
          />
          <div
            data-sun
            className="absolute left-[62%] rounded-full"
            style={{
              bottom: "calc(var(--u) * 330px)",
              width: "calc(var(--u) * 150px)",
              height: "calc(var(--u) * 150px)",
              background: "radial-gradient(circle, #fff2d6 0 34%, rgba(255,226,170,0.45) 36%, rgba(255,210,140,0) 70%)",
            }}
          />

          {layer(SPEED.far, <FarLayer />)}
          {layer(SPEED.mid, <MidLayer />)}
          {layer(SPEED.near, <NearLayer />)}
          {layer(SPEED.ground, <GroundLayer />)}

          {/* Intérieur de l'écurie, découpé entre les chambranles */}
          <div data-clip-a className="absolute inset-y-0 left-0 w-[200%] overflow-hidden will-change-transform">
            <div data-clip-a-inner className="absolute inset-y-0 left-0 w-1/2 will-change-transform">
              <div data-clip-b className="absolute inset-y-0 -left-full w-[200%] overflow-hidden will-change-transform">
                <div data-clip-b-inner className="absolute inset-y-0 left-1/2 w-1/2 will-change-transform">
                  <div className="absolute inset-0" style={{ background: "linear-gradient(#0c0805, #1d140c 60%, #120c07)" }} />
                  {layer(SPEED.near, <InteriorWall />)}
                  {layer(SPEED.ground, <InteriorFloor />)}
                </div>
              </div>
            </div>
          </div>

          {/* Le camion */}
          <div
            data-truck
            className="absolute left-1/2"
            style={{
              width: `calc(var(--u) * ${TRUCK_W}px)`,
              height: `calc(var(--u) * ${TRUCK_H}px)`,
              bottom: `calc(var(--u) * ${H - GROUND - 10 * (TRUCK_W / 640)}px)`,
              transform: `translateX(calc(var(--u) * ${TRUCK_X - TRUCK_W / 2}px))`,
            }}
          >
            {truckImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={truckImage} alt={truckImageAlt} className="h-full w-full object-contain object-bottom" />
            ) : (
              <Van livery={livery} sub={liverySub} idSuffix="journey" />
            )}
          </div>

          {layer(SPEED.fg, <ForegroundLayer />)}
          <div data-interior-tint className="pointer-events-none absolute inset-0 opacity-0" style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(255,190,110,0.08), rgba(13,10,7,0.55))" }} />
        </div>

        {/* Vignettage et grain */}
        <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 60%, transparent 55%, rgba(8,6,4,0.65))" }} />
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="grain" />
        </div>

        {/* Récit */}
        <div className="pointer-events-none absolute inset-x-0 top-0 pt-[calc(var(--header-h,72px)+3vh)]">
          <div className="container-x flex items-center gap-4">
            <span className="label text-cream/60">({index})</span>
            <span className="label">Sur la route de vos chevaux</span>
            <span className="rule-dashed flex-1" aria-hidden="true" />
            <ol className="flex items-center gap-2" aria-hidden="true">
              {CHAPTERS.map((c) => (
                <li key={c.n} data-dot className="h-1.5 w-1.5 rounded-full bg-cream/25 transition-colors duration-500 [&.is-active]:bg-cream" />
              ))}
            </ol>
          </div>
          <div className="container-x relative mt-8 grid md:mt-12">
            {CHAPTERS.map((c) => (
              <article
                key={c.n}
                data-chapter
                className="col-start-1 row-start-1 max-w-xl opacity-0 transition-[opacity,transform] duration-700 [transform:translateY(16px)] [&.is-active]:opacity-100 [&.is-active]:[transform:none]"
              >
                <p className="label text-sand">
                  {c.n} — {c.label}
                </p>
                <h3 className="heading-sm mt-4 md:text-[clamp(2rem,3.2vw,3.2rem)]">{c.title}</h3>
                <p className="body mt-4 max-w-md text-cream/75">{c.text}</p>
              </article>
            ))}
          </div>
        </div>

        {/* Invitation finale */}
        <div data-cta className="invisible absolute inset-x-0 top-[40%] opacity-0 md:top-[calc(var(--header-h)+3vh+56px)]">
          <div className="container-x flex flex-col items-start gap-6 md:items-end md:text-right">
            <p className="heading max-w-md">Votre cheval est le prochain sur ma route&nbsp;?</p>
            <ButtonLink href="/rendez-vous" variant="cream">
              Prendre rendez-vous
            </ButtonLink>
          </div>
        </div>

        {/* Progression */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-line" aria-hidden="true">
          <div data-progress className="h-full origin-left scale-x-0 bg-cream" />
        </div>
      </div>
    </section>
  );
}
