import type { Metadata } from "next";
import { gallery, site, social } from "@/lib/content";
import { fetchInstagramPosts } from "@/lib/instagram";
import { PageHero } from "@/components/ui/PageHero";
import { Gallery } from "@/components/sections/Gallery";
import { Social } from "@/components/sections/Social";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Galerie",
  description: `Chevaux, écuries, interventions : quelques images du quotidien de ${site.identity.fullName}, ${site.identity.profession.toLowerCase()}.`,
  alternates: { canonical: "/galerie" },
};

export default async function Galerie() {
  const instagram = await fetchInstagramPosts(6);
  const photos = gallery.items.filter((i) => i.src).length;
  return (
    <>
      <PageHero index="01" label="Galerie" title={gallery.title} intro={gallery.intro} tone="leather" compact art={<Viewfinder />}>
        <p className="label flex flex-wrap items-center gap-x-4 gap-y-2 text-cream/55">
          <span>
            <span className="tabular-nums text-cream">{String(photos).padStart(2, "0")}</span> photographies
          </span>
          <span className="h-1 w-1 rounded-full bg-cream/30" aria-hidden="true" />
          <span>
            <span className="tabular-nums text-cream">{String(gallery.categories.length).padStart(2, "0")}</span> thèmes
          </span>
          <span className="h-1 w-1 rounded-full bg-cream/30" aria-hidden="true" />
          <span>Enrichie au fil des visites</span>
        </p>
      </PageHero>
      <Gallery content={gallery} header={false} />
      <Social site={site} content={social} posts={instagram} index="02" />
    </>
  );
}

/** Motif de viseur photographique (aucune image : les photos sont juste en dessous). */
function Viewfinder() {
  const ticks = Array.from({ length: 72 }, (_, i) => i);
  return (
    <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full text-cream" fill="none" stroke="currentColor">
      <defs>
        <radialGradient id="vf-glow" cx="0.72" cy="0.5" r="0.4">
          <stop offset="0" stopColor="#7ef7c6" stopOpacity="0.16" />
          <stop offset="1" stopColor="#7ef7c6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1000" height="600" fill="url(#vf-glow)" stroke="none" />
      {/* cadre du viseur */}
      <g strokeOpacity="0.28" strokeWidth="1.2">
        <path d="M 540 110 h -50 v 50 M 890 110 h 50 v 50 M 540 490 h -50 v -50 M 890 490 h 50 v -50" />
      </g>
      {/* bague de mise au point, en rotation lente */}
      <g style={{ transformOrigin: "715px 300px" }} className="motion-safe:animate-[spin_90s_linear_infinite]">
        {ticks.map((i) => {
          const a = (i / ticks.length) * Math.PI * 2;
          const r1 = 112;
          const r2 = i % 6 === 0 ? 124 : 118;
          return (
            <line
              key={i}
              x1={(715 + Math.cos(a) * r1).toFixed(1)}
              y1={(300 + Math.sin(a) * r1).toFixed(1)}
              x2={(715 + Math.cos(a) * r2).toFixed(1)}
              y2={(300 + Math.sin(a) * r2).toFixed(1)}
              strokeOpacity={i % 6 === 0 ? 0.35 : 0.16}
            />
          );
        })}
      </g>
      <g strokeOpacity="0.22">
        <circle cx="715" cy="300" r="70" strokeDasharray="3 7" />
        <circle cx="715" cy="300" r="4" />
        <path d="M 695 300 h 12 M 723 300 h 12 M 715 280 v 12 M 715 308 v 12" />
      </g>
      <g strokeOpacity="0.1">
        <path d="M 490 300 h 120 M 820 300 h 120" strokeDasharray="2 8" />
      </g>
    </svg>
  );
}
