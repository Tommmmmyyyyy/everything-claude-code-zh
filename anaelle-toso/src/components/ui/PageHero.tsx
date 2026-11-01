import type { ReactNode } from "react";
import { siteAsset } from "@/lib/config";

type Tone = "ink" | "forest" | "leather";

const TONES: Record<Tone, string> = {
  ink: "radial-gradient(ellipse at 80% 20%, #1f1710 0%, #0d0a07 60%)",
  forest: "radial-gradient(ellipse at 75% 30%, #1d3326 0%, #101c14 55%, #0b120d 100%)",
  leather: "radial-gradient(ellipse at 70% 25%, #4a2e1b 0%, #24170e 45%, #0d0a07 100%)",
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
          <div className="absolute inset-0 mix-blend-soft-light" style={{ background: "linear-gradient(200deg, rgba(240,180,110,0.45), rgba(13,10,7,0.5))" }} />
          <div className="absolute inset-0 md:[background:linear-gradient(to_right,var(--color-ink)_0%,rgba(13,10,7,0.35)_45%,rgba(13,10,7,0.05)_100%)] max-md:[background:linear-gradient(to_top,var(--color-ink)_8%,rgba(13,10,7,0.55)_55%,rgba(13,10,7,0.25)_100%)]" />
        </div>
      )}
      {art && <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">{art}</div>}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="grain" />
      </div>

      <div className="container-x">
        <div className="flex items-center gap-4">
          <span className="label tabular-nums text-cream/50">({index})</span>
          <span className="label">{label}</span>
          <span className="rule-dashed max-w-[220px] flex-1" data-reveal="line" aria-hidden="true" />
        </div>
        <h1 className="display mt-8 max-w-[14ch] md:mt-10" data-reveal="lines">
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
