"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { ButtonLink } from "@/components/ui/Button";
import { DentalArch } from "@/components/illustrations/anatomy";
import type { AnchorId, MouthScene } from "./mouth-scene";

/* Chapitres du voyage (progression de défilement) */
const CHAPTERS = [
  { n: "01", from: 0.1, to: 0.24, title: "Les incisives", text: "Douze incisives, six en haut, six en bas, coupent l'herbe au pâturage. Leur forme évolue avec l'âge." },
  { n: "02", from: 0.24, to: 0.4, title: "Les barres et la dent de loup", text: "Derrière les incisives, un espace sans dents : les barres, où repose le mors. Juste devant la première dent jugale peut se trouver une petite dent de loup." },
  { n: "03", from: 0.4, to: 0.49, title: "Prémolaires et molaires", text: "Trois prémolaires et trois molaires par demi-mâchoire : vingt-quatre dents jugales à couronne très longue, qui broient les fibres." },
  { n: "04", from: 0.49, to: 0.69, title: "Les pointes d'émail", text: "La mâchoire du haut est plus large que celle du bas. Les dents s'usent en biais : des pointes se forment côté joue en haut, côté langue en bas." },
  { n: "05", from: 0.69, to: 0.8, title: "Les tables dentaires", text: "La surface de mastication : des replis d'émail, plus durs que la dentine, forment des crêtes qui broient les fibres." },
  { n: "06", from: 0.8, to: 0.92, title: "Les surdents", text: "Une dent qui n'est pas usée par son opposée dépasse : crochet à l'avant de l'arcade, rampe à l'arrière." },
] as const;

const LABELS: { id: AnchorId; text: string; short?: string; win: [number, number, number, number]; side: "l" | "r" }[] = [
  { id: "incisives", text: "Incisives", win: [0.12, 0.15, 0.22, 0.25], side: "r" },
  { id: "barres", text: "Barres", win: [0.27, 0.29, 0.33, 0.35], side: "r" },
  { id: "loup", text: "Dent de loup", win: [0.33, 0.35, 0.39, 0.42], side: "r" },
  { id: "premolaires", text: "Prémolaires", win: [0.41, 0.435, 0.47, 0.5], side: "r" },
  { id: "molaires", text: "Molaires", win: [0.41, 0.435, 0.47, 0.5], side: "r" },
  { id: "pointes-haut", text: "Pointes d'émail · côté joue", short: "Côté joue", win: [0.56, 0.58, 0.64, 0.665], side: "l" },
  { id: "pointes-bas", text: "Pointes d'émail · côté langue", short: "Côté langue", win: [0.56, 0.58, 0.64, 0.665], side: "r" },
  { id: "tables", text: "Table dentaire", win: [0.72, 0.74, 0.775, 0.79], side: "r" },
  { id: "crochet", text: "Crochet", win: [0.825, 0.845, 0.9, 0.92], side: "r" },
  { id: "rampe", text: "Rampe", win: [0.825, 0.845, 0.9, 0.92], side: "l" },
];

const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

type Mode = "pending" | "webgl" | "static" | "fallback";

/**
 * Troisième animation signature — « L'anatomie en mouvement ».
 * La lampe frontale s'allume, la caméra entre dans la bouche et la traverse jusqu'aux molaires,
 * puis ressort pour ouvrir sur les prestations.
 */
export function MouthJourney({ index = "06" }: { index?: string }) {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("pending");

  useEffect(() => {
    const section = root.current!;
    const canvas = canvasRef.current!;
    const holder = stage.current!;
    const reduce = prefersReducedMotion();
    let scene: MouthScene | null = null;
    let disposed = false;
    let raf = 0;
    let target = 0;
    let current = 0;
    let st: ScrollTrigger | null = null;
    let ro: ResizeObserver | null = null;
    const chapters = Array.from(section.querySelectorAll<HTMLElement>("[data-mj-chapter]"));
    const dots = Array.from(section.querySelectorAll<HTMLElement>("[data-mj-dot]"));
    const intro = section.querySelector<HTMLElement>("[data-mj-intro]");
    const outro = section.querySelector<HTMLElement>("[data-mj-outro]");
    const bar = section.querySelector<HTMLElement>("[data-mj-progress]");
    const hint = section.querySelector<HTMLElement>("[data-mj-hint]");
    const labelEls = Array.from(labelsRef.current?.querySelectorAll<HTMLElement>("[data-mj-label]") ?? []);

    const paintOverlay = (p: number) => {
      let active = -1;
      CHAPTERS.forEach((c, i) => {
        if (p >= c.from && p < c.to) active = i;
      });
      chapters.forEach((el, i) => el.classList.toggle("is-active", i === active));
      dots.forEach((el, i) => el.classList.toggle("is-active", i <= active));
      if (intro) {
        const o = 1 - smooth(0.05, 0.1, p);
        intro.style.opacity = String(o);
        intro.style.transform = `translate3d(0, ${(-40 * (1 - o)).toFixed(1)}px, 0)`;
        intro.style.visibility = o < 0.01 ? "hidden" : "visible";
      }
      if (hint) hint.style.opacity = String(1 - smooth(0.01, 0.04, p));
      if (outro) {
        const o = smooth(0.92, 0.98, p);
        outro.style.opacity = String(o);
        outro.style.transform = `translate3d(0, ${(30 * (1 - o)).toFixed(1)}px, 0)`;
        outro.style.visibility = o < 0.01 ? "hidden" : "visible";
        outro.style.pointerEvents = o > 0.5 ? "auto" : "none";
      }
      if (bar) bar.style.transform = `scaleX(${p.toFixed(4)})`;
    };

    const paintLabels = (p: number) => {
      if (!scene) return;
      labelEls.forEach((el, i) => {
        const L = LABELS[i];
        const [a, b, c, d] = L.win;
        const o = smooth(a, b, p) * (1 - smooth(c, d, p));
        const pr = scene!.project(L.id);
        const show = o > 0.01 && pr.visible;
        el.style.opacity = show ? String(o) : "0";
        el.style.visibility = show ? "visible" : "hidden";
        if (show) {
          // l'étiquette bascule de côté si elle sortait du cadre
          const w = holder.clientWidth;
          const side = L.side === "l" && pr.x < 300 ? "r" : L.side === "r" && pr.x > w - 300 ? "l" : L.side;
          if (el.dataset.side !== side) el.dataset.side = side;
          el.style.transform = `translate3d(${pr.x.toFixed(1)}px, ${pr.y.toFixed(1)}px, 0)`;
        }
      });
    };

    let last = 0;
    const frame = (now: number) => {
      raf = 0;
      if (!scene || disposed) return;
      // lissage indépendant de la cadence d'affichage
      const dt = last ? Math.min(0.25, (now - last) / 1000) : 1 / 60;
      last = now;
      const d = target - current;
      current = Math.abs(d) < 0.0004 ? target : current + d * (1 - Math.exp(-dt / 0.11));
      scene.setProgress(current);
      scene.render();
      paintOverlay(current);
      paintLabels(current);
      if (current !== target) raf = requestAnimationFrame(frame);
      else last = 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const size = () => {
      if (!scene) return;
      const r = holder.getBoundingClientRect();
      scene.resize(r.width, r.height);
      scene.setProgress(current);
      scene.render();
      paintLabels(current);
    };

    const start = async () => {
      const mod = await import("./mouth-scene");
      if (disposed) return;
      if (!mod.hasWebGL()) {
        setMode("fallback");
        return;
      }
      try {
        scene = mod.createMouthScene(canvas, { mobile: window.innerWidth < 768 });
      } catch {
        setMode("fallback");
        return;
      }
      ro = new ResizeObserver(size);
      ro.observe(holder);
      size();
      if (reduce) {
        // Image fixe : coupe des arcades, sans défilement animé
        current = target = 0.6;
        scene.setProgress(current);
        size();
        setMode("static");
        return;
      }
      setMode("webgl");
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
      target = st.progress;
      current = target;
      kick();
    };

    // Chargement paresseux : la scène 3D n'est construite qu'à l'approche de la section
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
    paintOverlay(0);

    return () => {
      disposed = true;
      io.disconnect();
      ro?.disconnect();
      st?.kill();
      if (raf) cancelAnimationFrame(raf);
      scene?.dispose();
    };
  }, []);

  const still = mode === "static" || mode === "fallback";

  return (
    <section
      ref={root}
      id="anatomie-en-mouvement"
      aria-labelledby="mj-title"
      className={`relative bg-ink ${still ? "" : "h-[460vh] md:h-[560vh]"}`}
    >
      <div className={still ? "relative" : "sticky top-0 h-[100svh] overflow-hidden"}>
        {/* Scène */}
        <div
          ref={stage}
          className={still ? "relative mx-auto aspect-[4/3] w-full max-w-6xl md:aspect-[16/8]" : "absolute inset-0"}
          style={{ background: "radial-gradient(ellipse at 50% 55%, #1c140d 0%, #0d0a07 70%)" }}
        >
          <canvas ref={canvasRef} className={`absolute inset-0 h-full w-full ${mode === "fallback" ? "hidden" : ""}`} aria-hidden="true" />
          {mode === "fallback" && (
            <div className="absolute inset-0 grid place-items-center p-8 text-cream/80">
              <DentalArch highlight="molaires" className="h-full max-h-[420px] w-full" />
            </div>
          )}
          <div ref={labelsRef} className="pointer-events-none absolute inset-0" aria-hidden="true">
            {LABELS.map((l) => (
              <div key={l.id} data-mj-label data-side={l.side} className="group invisible absolute left-0 top-0 opacity-0 will-change-transform">
                <span className="absolute -left-[5px] -top-[5px] h-2.5 w-2.5 rounded-full bg-sand shadow-[0_0_0_4px_rgba(217,196,160,0.18),0_0_18px_rgba(255,170,90,0.6)]" />
                <span className="absolute left-2 top-0 h-px w-10 border-t border-dashed border-cream/60 group-data-[side=l]:left-auto group-data-[side=l]:right-2 md:w-16" />
                <span className="label absolute -top-[13px] left-12 whitespace-nowrap rounded-full border border-cream/25 bg-ink/70 px-3 py-1.5 text-[10px] text-cream backdrop-blur-sm group-data-[side=l]:left-auto group-data-[side=l]:right-12 md:left-[4.5rem] md:text-[11px] md:group-data-[side=l]:left-auto md:group-data-[side=l]:right-[4.5rem]">
                  <span className="md:hidden">{l.short ?? l.text}</span>
                  <span className="max-md:hidden">{l.text}</span>
                </span>
              </div>
            ))}
          </div>
          {/* lisibilité des légendes */}
          {!still && <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%]" style={{ background: "linear-gradient(to top, rgba(13,10,7,0.78), rgba(13,10,7,0))" }} aria-hidden="true" />}
          {/* vignettage + grain */}
          <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 52%, rgba(8,6,4,0.75))" }} aria-hidden="true" />
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="grain" />
          </div>
        </div>

        {still ? (
          <StillContent index={index} />
        ) : (
          <>
            {/* En-tête */}
            <div className="pointer-events-none absolute inset-x-0 top-0 pt-[calc(var(--header-h,72px)+3vh)]">
              <div className="container-x flex items-center gap-4">
                <span className="label text-cream/60">({index})</span>
                <span className="label">L&apos;anatomie en mouvement</span>
                <span className="rule-dashed flex-1" aria-hidden="true" />
                <ol className="flex items-center gap-2" aria-hidden="true">
                  {CHAPTERS.map((c) => (
                    <li key={c.n} data-mj-dot className="h-1.5 w-1.5 rounded-full bg-cream/25 transition-colors duration-500 [&.is-active]:bg-sand" />
                  ))}
                </ol>
              </div>
            </div>

            {/* Ouverture */}
            <div data-mj-intro className="pointer-events-none absolute inset-0 flex items-center">
              <div className="container-x">
                <p className="label text-sand">Voyage au cœur de la bouche</p>
                <h2 id="mj-title" className="display mt-6 max-w-[13ch]">
                  Entrez dans la bouche <em className="italic text-sand">du cheval.</em>
                </h2>
                <p className="body-lg mt-6 max-w-md text-cream/70">La lampe frontale s&apos;allume. Faites défiler&nbsp;: la caméra traverse la bouche, des incisives aux molaires.</p>
              </div>
            </div>

            {/* Chapitres */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 pb-10 md:pb-14">
              <div className="container-x grid">
                {CHAPTERS.map((c) => (
                  <article
                    key={c.n}
                    data-mj-chapter
                    className="col-start-1 row-start-1 max-w-md rounded-[12px] bg-ink/55 p-5 opacity-0 backdrop-blur-[6px] transition-[opacity,transform] duration-700 [transform:translateY(16px)] md:bg-transparent md:p-0 md:backdrop-blur-0 [&.is-active]:opacity-100 [&.is-active]:[transform:none]"
                  >
                    <p className="label text-sand">
                      {c.n} — {c.title}
                    </p>
                    <p className="mt-3 text-[0.98rem] leading-relaxed text-cream/85 md:text-[1.05rem]">{c.text}</p>
                  </article>
                ))}
              </div>
            </div>

            <p data-mj-hint className="label pointer-events-none absolute bottom-8 right-[var(--gutter)] flex items-center gap-3 text-cream/55">
              Défiler
              <span className="relative h-8 w-px overflow-hidden bg-line-strong" aria-hidden="true">
                <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_1.8s_var(--ease-expo)_infinite] bg-cream" />
              </span>
            </p>

            {/* Sortie : ouverture sur les prestations */}
            <div data-mj-outro className="invisible absolute inset-0 flex items-center opacity-0" style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(13,10,7,0.82), rgba(13,10,7,0.2) 70%)" }}>
              <div className="container-x">
                <p className="label text-sand">Et pour chacune de ces structures</p>
                <p className="display mt-6 max-w-[12ch]">
                  Un soin <em className="italic text-sand">adapté.</em>
                </p>
                <div className="mt-10 flex flex-wrap gap-3">
                  <ButtonLink href="/prestations" variant="cream">
                    Découvrir les prestations
                  </ButtonLink>
                  <ButtonLink href="/prestations#dentition" variant="ghost" icon={false}>
                    Explorer l&apos;anatomie
                  </ButtonLink>
                </div>
              </div>
            </div>

            <p className="micro pointer-events-none absolute bottom-3 left-[var(--gutter)] text-cream/35 max-md:hidden">Modèle simplifié, à visée pédagogique.</p>

            <div className="absolute inset-x-0 bottom-0 h-px bg-line" aria-hidden="true">
              <div data-mj-progress className="h-full origin-left scale-x-0 bg-cream" />
            </div>
          </>
        )}
      </div>
    </section>
  );
}

/** Version sans animation (mouvements réduits ou WebGL indisponible). */
function StillContent({ index }: { index: string }) {
  return (
    <div className="container-x section-y">
      <div className="flex items-center gap-4">
        <span className="label text-cream/50">({index})</span>
        <span className="label">L&apos;anatomie en mouvement</span>
        <span className="rule-dashed flex-1" aria-hidden="true" />
      </div>
      <h2 id="mj-title" className="heading mt-8 max-w-3xl">
        Au cœur de la bouche <em className="italic text-sand">du cheval.</em>
      </h2>
      <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {CHAPTERS.map((c) => (
          <li key={c.n} className="border-t border-dashed border-line-strong pt-5">
            <p className="label text-sand">
              {c.n} — {c.title}
            </p>
            <p className="body mt-3 text-cream/75">{c.text}</p>
          </li>
        ))}
      </ol>
      <div className="mt-12 flex flex-wrap gap-3">
        <ButtonLink href="/prestations" variant="cream">
          Découvrir les prestations
        </ButtonLink>
      </div>
      <p className="micro mt-6 text-cream/40">Modèle simplifié, à visée pédagogique.</p>
    </div>
  );
}
