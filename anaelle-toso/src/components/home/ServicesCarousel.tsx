"use client";

import Image from "next/image";
import type { ServicesContent } from "@/lib/content";
import { Carousel } from "@/components/ui/Carousel";
import { ServiceDiagram } from "@/components/sections/Services";
import { siteAsset, siteHref } from "@/lib/config";

/** Carrousel des soins : chaque carte mène à la fiche détaillée. */
export function ServicesCarousel({ content, linkBase = "/prestations", aside }: { content: ServicesContent; linkBase?: string; aside?: React.ReactNode }) {
  return (
    <Carousel label="Les prestations" itemClass="w-[80vw] sm:w-[44vw] lg:w-[29vw]" aside={aside}>
      {content.items.map((s, i) => (
        <a
          key={s.id}
          href={siteHref(`${linkBase}#fiche-${s.id}`)}
          className="group flex h-full flex-col overflow-hidden rounded-[18px] border border-line bg-ink-2 transition-colors duration-500 hover:border-cream/50"
          data-cursor="Découvrir"
          draggable={false}
        >
          <span className="relative block aspect-[4/3] overflow-hidden bg-forest">
            {s.image ? (
              <Image src={siteAsset(s.image)} alt={s.imageAlt} fill sizes="(min-width: 1024px) 30vw, 80vw" className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-expo)] group-hover:scale-[1.06]" />
            ) : (
              <>
                <span className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100" style={{ background: "radial-gradient(circle at 50% 55%, rgba(192,122,67,0.28), transparent 65%)" }} aria-hidden="true" />
                <span className="absolute inset-0 p-6 opacity-70 transition-[opacity,transform] duration-[1s] ease-[var(--ease-expo)] group-hover:scale-[1.07] group-hover:opacity-100">
                  <ServiceDiagram kind={s.diagram} />
                </span>
              </>
            )}
            <span className="label absolute left-4 top-4 tabular-nums text-cream/70">{String(i + 1).padStart(2, "0")}</span>
          </span>
          <span className="flex flex-1 flex-col p-6">
            <span className="label text-sand">{s.kicker}</span>
            <span className="mt-3 font-serif text-[clamp(1.6rem,2.2vw,2.1rem)] leading-[1.02]">{s.title}</span>
            <span className="mt-3 line-clamp-3 text-[0.92rem] leading-relaxed text-cream/65">{s.description}</span>
            <span className="label mt-auto flex items-center gap-3 pt-6 text-cream/80">
              Voir la fiche
              <span className="btn-icon transition-transform duration-500 group-hover:translate-x-1" aria-hidden="true">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M1 5h8M5.5 1.5 9 5 5.5 8.5" stroke="currentColor" strokeWidth="1.2" />
                </svg>
              </span>
            </span>
          </span>
        </a>
      ))}
    </Carousel>
  );
}
