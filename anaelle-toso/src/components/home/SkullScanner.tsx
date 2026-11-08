"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollTrigger, prefersReducedMotion, isFinePointer } from "@/lib/gsap";
import { ButtonLink } from "@/components/ui/Button";
import type { Landmark, SkullScene } from "./skull-scene";

/* Repères anatomiques, placés sur la photographie du crâne d'étude (1280 × 793 px), de l'avant vers l'arrière */
const MARKS: (Landmark & { title: string; short?: string; text: string; side: "l" | "r" })[] = [
  { id: "incisives", x: 100, y: 710, side: "r", title: "Incisives", text: "Douze incisives coupent l'herbe ; la forme de leurs tables évolue avec l'âge." },
  { id: "barres", x: 240, y: 694, side: "r", title: "Barres", text: "L'espace sans dents entre incisives et dents jugales : c'est là que repose le mors." },
  { id: "foramen", x: 415, y: 458, side: "l", title: "Foramen infra-orbitaire", short: "Foramen", text: "Le passage d'un nerf de la face : un repère anatomique précis." },
  { id: "premolaires", x: 432, y: 646, side: "r", title: "Prémolaires", text: "Trois par demi-mâchoire, parfois précédées d'une petite dent de loup." },
  { id: "molaires", x: 612, y: 596, side: "r", title: "Molaires", text: "Avec les prémolaires, elles broient les fibres : leurs tables travaillent toute la vie du cheval." },
  { id: "crete", x: 700, y: 470, side: "l", title: "Crête faciale", text: "Le relief osseux de la joue, que l'on palpe lors de l'examen externe." },
  { id: "orbite", x: 770, y: 330, side: "l", title: "Orbite", text: "La cavité de l'œil, fermée en arrière par une arcade osseuse." },
  { id: "atm", x: 1062, y: 352, side: "l", title: "Articulation temporo-mandibulaire", short: "ATM", text: "La charnière de la mâchoire, haute, en arrière de l'œil." },
];

const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
/* Le faisceau marque une pause sur chaque repère : position du faisceau selon la progression */
const SWEEP_A = 0.12;
const SWEEP_B = 0.82;
const KEYS: [number, number][] = [
  [SWEEP_A, 0],
  ...MARKS.map((m, i): [number, number] => [SWEEP_A + ((i + 1) * (SWEEP_B - SWEEP_A)) / (MARKS.length + 1), m.x / 1280 + 0.012]),
  [SWEEP_B, 1.02],
];
function scanAt(p: number) {
  if (p <= KEYS[0][0]) return KEYS[0][1] - 0.04 * (1 - p / SWEEP_A);
  for (let i = 0; i < KEYS.length - 1; i++) {
    const [p0, s0] = KEYS[i];
    const [p1, s1] = KEYS[i + 1];
    if (p <= p1) return s0 + (s1 - s0) * smooth(p0, p1, p);
  }
  return KEYS[KEYS.length - 1][1];
}

type Mode = "pending" | "webgl" | "static";

/**
 * Lecture d'un crâne réel : la photographie d'un crâne d'étude, en relief, parcourue par un
 * faisceau de scanner qui la révèle en radiographie et nomme les structures qu'il croise.
 */
export function SkullScanner({ index = "03" }: { index?: string }) {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<Mode>("pending");

  useEffect(() => {
    const section = root.current!;
    const holder = stage.current!;
    const canvas = canvasRef.current!;
    const reduce = prefersReducedMotion();
    const labels = Array.from(section.querySelectorAll<HTMLElement>("[data-sk-label]"));
    const panels = Array.from(section.querySelectorAll<HTMLElement>("[data-sk-panel]"));
    const readout = section.querySelector<HTMLElement>("[data-sk-readout]");
    const counter = section.querySelector<HTMLElement>("[data-sk-count]");
    const bar = section.querySelector<HTMLElement>("[data-sk-progress]");
    const intro = section.querySelector<HTMLElement>("[data-sk-intro]");
    const outro = section.querySelector<HTMLElement>("[data-sk-outro]");
    let scene: SkullScene | null = null;
    let disposed = false;
    let raf = 0;
    let target = 0;
    let current = 0;
    let px = 0;
    let py = 0;
    let tx = 0;
    let ty = 0;
    let last = 0;
    let st: ScrollTrigger | null = null;
    let ro: ResizeObserver | null = null;
    let active = -2;
    let panelOn = false;

    const paint = (p: number) => {
      if (!scene) return;
      const scan = scanAt(p);
      const band = smooth(0.06, 0.12, p) * (1 - smooth(0.84, 0.9, p));
      const xray = smooth(0.84, 0.92, p);
      scene.set({ reveal: smooth(0.0, 0.1, p), scan, band, xray, turn: -1 + 2 * smooth(0.04, 0.96, p), px, py });
      scene.render();
      // repères : apparaissent au passage du faisceau, le dernier croisé est mis en avant
      let cur = -1;
      const w = holder.clientWidth;
      labels.forEach((el, i) => {
        const m = MARKS[i];
        const pr = scene!.project(m.id);
        const passed = scan > pr.u + 0.004;
        if (passed) cur = i;
        const o = passed ? 1 : 0;
        el.style.opacity = String(o);
        el.style.visibility = o ? "visible" : "hidden";
        el.style.transform = `translate3d(${pr.x.toFixed(1)}px, ${pr.y.toFixed(1)}px, 0)`;
        const pill = el.querySelector<HTMLElement>("[data-sk-pill]");
        const need = (pill?.offsetWidth ?? 140) + 70;
        const side = m.side === "l" && pr.x - need < 8 ? "r" : m.side === "r" && pr.x + need > w - 8 ? "l" : m.side;
        if (el.dataset.side !== side) el.dataset.side = side;
      });
      if (xray > 0.5 && w >= 768) cur = MARKS.length;
      const showPanel = band > 0.5 && xray < 0.5;
      if (cur !== active || showPanel !== panelOn) {
        active = cur;
        panelOn = showPanel;
        labels.forEach((el, i) => el.classList.toggle("is-active", i === cur || cur === MARKS.length));
        panels.forEach((el, i) => el.classList.toggle("is-active", i === cur && showPanel));
        if (counter) counter.textContent = `${String(Math.max(0, Math.min(MARKS.length, cur + 1))).padStart(2, "0")} / ${String(MARKS.length).padStart(2, "0")}`;
      }
      if (readout) {
        const v = String(Math.round(Math.min(1, Math.max(0, scan)) * 100)).padStart(3, "0");
        if (readout.textContent !== v) readout.textContent = v;
      }
      if (bar) bar.style.transform = `scaleX(${p.toFixed(4)})`;
      if (intro) {
        const o = 1 - smooth(0.12, 0.2, p);
        intro.style.opacity = String(o);
        intro.style.visibility = o < 0.01 ? "hidden" : "visible";
      }
      if (outro) {
        const o = smooth(0.88, 0.95, p);
        outro.style.opacity = String(o);
        outro.style.transform = `translate3d(0, ${(24 * (1 - o)).toFixed(1)}px, 0)`;
        outro.style.visibility = o < 0.01 ? "hidden" : "visible";
        outro.style.pointerEvents = o > 0.5 ? "auto" : "none";
      }
    };

    const frame = (now: number) => {
      raf = 0;
      if (!scene || disposed) return;
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 1 / 60;
      last = now;
      const k = 1 - Math.exp(-dt / 0.14);
      const d = target - current;
      current = Math.abs(d) < 0.0003 ? target : current + d * k;
      px += (tx - px) * (1 - Math.exp(-dt / 0.35));
      py += (ty - py) * (1 - Math.exp(-dt / 0.35));
      paint(current);
      if (current !== target || Math.abs(tx - px) > 0.002 || Math.abs(ty - py) > 0.002) raf = requestAnimationFrame(frame);
      else last = 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const size = () => {
      if (!scene) return;
      const r = holder.getBoundingClientRect();
      scene.resize(r.width, r.height);
      paint(current);
    };
    const onPointer = (e: PointerEvent) => {
      const r = holder.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width) * 2 - 1;
      ty = ((e.clientY - r.top) / r.height) * 2 - 1;
      kick();
    };

    const start = async () => {
      const mod = await import("./skull-scene");
      if (disposed) return;
      try {
        scene = mod.createSkullScene(canvas, { mobile: window.innerWidth < 768, landmarks: MARKS, onReady: () => kick() });
      } catch {
        setMode("static");
        return;
      }
      ro = new ResizeObserver(size);
      ro.observe(holder);
      size();
      if (reduce) {
        current = target = 0.9;
        size();
        setMode("static");
        return;
      }
      setMode("webgl");
      if (isFinePointer()) section.addEventListener("pointermove", onPointer);
      st = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          target = self.progress;
          kick();
        },
        onRefresh: (self) => {
          target = self.progress;
          kick();
        },
      });
      target = current = st.progress;
      kick();
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          start();
        }
      },
      { rootMargin: "120% 0px" },
    );
    io.observe(section);

    return () => {
      disposed = true;
      io.disconnect();
      ro?.disconnect();
      st?.kill();
      section.removeEventListener("pointermove", onPointer);
      if (raf) cancelAnimationFrame(raf);
      scene?.dispose();
    };
  }, []);

  const still = mode === "static";

  return (
    <section ref={root} id="scanner" aria-labelledby="sk-title" className={`relative bg-ink ${still ? "" : "h-[330vh] md:h-[380vh]"}`}>
      <div className={still ? "relative" : "sticky top-0 h-[100svh] overflow-hidden"}>
        <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at 58% 52%, #0c2a22 0%, #061410 42%, #040806 75%)" }} aria-hidden="true" />
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-90" aria-hidden="true" />

        {/* Scène */}
        <div ref={stage} className={still ? "relative mx-auto aspect-[16/10] w-full max-w-6xl" : "absolute inset-0"}>
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            {MARKS.map((m) => (
              <div key={m.id} data-sk-label data-side={m.side} className="group invisible absolute left-0 top-0 opacity-0 transition-opacity duration-500 will-change-transform">
                <span className="absolute -left-[5px] -top-[5px] h-2.5 w-2.5 rounded-full border border-cognac bg-ink shadow-[0_0_14px_rgba(126,247,198,0.7)] group-[.is-active]:bg-cognac" />
                <span className="absolute left-2 top-0 h-px w-8 bg-[linear-gradient(90deg,rgba(126,247,198,0.9),rgba(126,247,198,0.2))] group-data-[side=l]:left-auto group-data-[side=l]:right-2 group-data-[side=l]:bg-[linear-gradient(270deg,rgba(126,247,198,0.9),rgba(126,247,198,0.2))] md:w-12" />
                <span
                  data-sk-pill
                  className="label absolute -top-[13px] left-10 whitespace-nowrap rounded-full max-md:opacity-0 max-md:group-[.is-active]:opacity-100 border border-[rgba(126,247,198,0.3)] bg-[rgba(4,8,6,0.8)] px-3 py-1.5 text-[10px] text-cream/70 transition-[color,border-color,box-shadow,opacity] duration-500 group-data-[side=l]:left-auto group-data-[side=l]:right-10 group-[.is-active]:border-cognac group-[.is-active]:text-cream group-[.is-active]:shadow-[0_0_24px_-6px_rgba(126,247,198,0.8)] md:left-[3.75rem] md:text-[11px] md:group-data-[side=l]:right-[3.75rem]"
                >
                  <span className="md:hidden">{m.short ?? m.title}</span>
                  <span className="max-md:hidden">{m.title}</span>
                </span>
              </div>
            ))}
          </div>
          <div className="hud-corners pointer-events-none absolute inset-4 md:inset-6" style={{ ["--hl" as string]: "20px" }} aria-hidden="true" />
        </div>

        {still ? (
          <div className="container-x section-y relative">
            <Header index={index} />
            <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {MARKS.map((m, i) => (
                <li key={m.id} className="rounded-[18px] border border-line bg-ink-2 p-5">
                  <p className="label text-sand">
                    {String(i + 1).padStart(2, "0")} — {m.title}
                  </p>
                  <p className="body mt-3 text-cream/75">{m.text}</p>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <>
            {/* En-tête */}
            <div className="pointer-events-none absolute inset-x-0 top-0 pt-[calc(var(--header-h,72px)+3vh)]">
              <div className="container-x flex items-center gap-3">
                <span className="label inline-flex h-6 items-center rounded-full border border-line-strong px-2.5 tabular-nums text-sand">{index}</span>
                <span className="label">Lecture du crâne</span>
                <span className="relative h-px flex-1 bg-line" aria-hidden="true">
                  <span className="absolute inset-0 origin-left bg-[linear-gradient(90deg,var(--color-cognac),transparent_70%)] opacity-70" />
                </span>
                <span className="micro tabular-nums text-cream/55" aria-hidden="true">
                  Scan <span data-sk-readout className="text-sand">000</span> % · <span data-sk-count>00 / 08</span>
                </span>
              </div>
            </div>

            {/* Ouverture */}
            <div data-sk-intro className="pointer-events-none absolute inset-x-0 top-[calc(var(--header-h,72px)+3vh+56px)]">
              <div className="container-x">
                <h2 id="sk-title" className="heading max-w-[17ch]">
                  Un crâne réel, lu <em className="text-sand">comme au scanner.</em>
                </h2>
                <p className="body mt-5 max-w-md text-cream/70">
                  Faites défiler : le faisceau parcourt un crâne d&apos;étude, des incisives à l&apos;articulation de la mâchoire, et nomme chaque structure qu&apos;il croise.
                </p>
              </div>
            </div>

            {/* Fiche de la structure lue */}
            <div className="pointer-events-none absolute inset-x-0 top-[calc(var(--header-h,72px)+3vh+56px)] max-md:bottom-0 max-md:top-auto max-md:pb-10">
              <div className="container-x">
                <div className="grid max-w-[380px]">
                  {MARKS.map((m, i) => (
                    <article
                      key={m.id}
                      data-sk-panel
                      className="glass col-start-1 row-start-1 rounded-[18px] p-5 opacity-0 transition-[opacity,transform] duration-300 [transform:translateY(10px)] [&.is-active]:opacity-100 [&.is-active]:duration-500 [&.is-active]:[transform:none]"
                    >
                      <p className="label flex items-center gap-2 text-sand">
                        <span className="status-dot" aria-hidden="true" />
                        {String(i + 1).padStart(2, "0")} — {m.title}
                      </p>
                      <p className="mt-3 text-[0.98rem] leading-relaxed text-cream/85">{m.text}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>

            {/* Sortie */}
            <div data-sk-outro className="invisible absolute inset-x-0 top-[calc(var(--header-h,72px)+3vh+56px)] opacity-0 max-md:bottom-0 max-md:top-auto max-md:pb-10">
              <div className="container-x flex flex-col items-start gap-6">
                <p className="heading max-w-[14ch]">
                  Chaque structure <em className="text-sand">compte.</em>
                </p>
                <div className="flex flex-wrap gap-3">
                  <ButtonLink href="/rendez-vous" variant="filled">
                    Demander un rendez-vous
                  </ButtonLink>
                  <ButtonLink href="/prestations#dentition" variant="ghost" icon={false}>
                    Explorer l&apos;anatomie
                  </ButtonLink>
                </div>
              </div>
            </div>

            <p className="micro pointer-events-none absolute bottom-3 left-[var(--gutter)] text-cream/35 max-md:hidden">
              Photographie d&apos;un crâne d&apos;étude réel — relief et radiographie simulés pour la lecture.
            </p>
            <div className="absolute inset-x-0 bottom-0 h-px bg-line" aria-hidden="true">
              <div data-sk-progress className="h-full origin-left scale-x-0 bg-cognac shadow-[0_0_10px_var(--color-cognac)]" />
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function Header({ index }: { index: string }) {
  return (
    <>
      <div className="flex items-center gap-3">
        <span className="label inline-flex h-6 items-center rounded-full border border-line-strong px-2.5 tabular-nums text-sand">{index}</span>
        <span className="label">Lecture du crâne</span>
        <span className="relative h-px flex-1 bg-line" aria-hidden="true" />
      </div>
      <h2 id="sk-title" className="heading mt-8 max-w-3xl">
        Un crâne réel, lu <em className="text-sand">comme au scanner.</em>
      </h2>
    </>
  );
}
