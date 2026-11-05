import type { ReactNode } from "react";
import { siteAsset } from "@/lib/config";

type Tone = "ink" | "forest" | "leather";

const TONES: Record<Tone, string> = {
  ink: "radial-gradient(ellipse at 80% 15%, #0f2a20 0%, #06100c 45%, #040806 75%)",
  forest: "radial-gradient(ellipse at 75% 25%, #0f3326 0%, #071710 50%, #040806 100%)",
  leather: "radial-gradient(ellipse at 70% 20%, #0c2a33 0%, #061317 45%, #040806 100%)",
};

interface Props {
  index: string;
  label: string;
  title: ReactNode;
  intro?: ReactNode;
  image?: string;
  imagePosition?: string;
  tone?: Tone;
  art?: ReactNode;
  children?: ReactNode;
  /** En-tête plus court (pages où le contenu doit apparaître vite). */
  compact?: boolean;
}

/** En-tête de page : même grammaire partout (index, étiquette, grand titre), une ambiance propre à chaque page. */
export function PageHero({ index, label, title, intro, image, imagePosition = "50% 50%", tone = "ink", art, children, compact = false }: Props) {
  return (
    <section className={`relative isolate flex flex-col justify-end overflow-hidden pb-14 pt-[calc(var(--header-h)+12vh)] md:pb-20 ${compact ? "min-h-[56svh] md:min-h-[62svh]" : "min-h-[72svh] md:min-h-[82svh]"}`} style={{ background: TONES[tone] }}>
      {image && (
        <div className="absolute inset-0 -z-10 md:left-auto md:w-[56%]" data-reveal="mask">
          <div data-reveal-inner className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={siteAsset(image)} alt="" className="h-full w-full object-cover" style={{ objectPosition: imagePosition }} fetchPriority="high" />
          </div>
          <div className="absolute inset-0 opacity-50 mix-blend-color" style={{ background: "linear-gradient(200deg, rgba(40,120,100,0.6), rgba(4,24,16,0.7))" }} />
          <div className="absolute inset-0 mix-blend-soft-light" style={{ background: "radial-gradient(ellipse at 70% 25%, rgba(150,255,215,0.4), rgba(4,8,6,0) 60%)" }} />
          <div className="absolute inset-0 md:[background:linear-gradient(to_right,var(--color-ink)_0%,rgba(4,8,6,0.4)_45%,rgba(4,8,6,0.05)_100%)] max-md:[background:linear-gradient(to_top,var(--color-ink)_8%,rgba(4,8,6,0.55)_55%,rgba(4,8,6,0.25)_100%)]" />
          <div className="hud-corners absolute inset-4 md:inset-6" />
        </div>
      )}
      {art && <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">{art}</div>}
      <div className="bg-grid pointer-events-none absolute inset-0 -z-10 opacity-70" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="grain" />
      </div>

      <div className="container-x">
        <div className="flex items-center gap-3">
          <span className="label inline-flex h-6 items-center rounded-full border border-line-strong px-2.5 tabular-nums text-sand">{index}</span>
          <span className="label" data-reveal="decode">
            {label}
          </span>
          <span className="relative h-px max-w-[220px] flex-1 bg-line" aria-hidden="true">
            <span className="absolute inset-0 origin-left bg-[linear-gradient(90deg,var(--color-cognac),transparent)]" data-reveal="line" />
          </span>
        </div>
        <h1 className="display mt-8 max-w-[16ch] md:mt-10" data-reveal="lines">
          {title}
        </h1>
        {intro && (
          <p className="body-lg mt-8 max-w-xl text-cream/75" data-reveal="up" data-delay="0.2">
            {intro}
          </p>
        )}
        {children && (
          <div className="mt-10 flex flex-wrap gap-3" data-reveal="up" data-delay="0.3">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
