"use client";

import Image from "next/image";
import type { TestimonialsContent } from "@/lib/content";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ButtonLink } from "@/components/ui/Button";
import { Carousel } from "@/components/ui/Carousel";
import { siteAsset } from "@/lib/config";

export function Stars({ value, className = "h-4 w-4" }: { value: number; className?: string }) {
  return (
    <span className="flex gap-1 text-sand" role="img" aria-label={`Note : ${value} sur 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} viewBox="0 0 20 20" className={className} aria-hidden="true">
          <path d="M10 1.6l2.5 5.3 5.8.7-4.3 4 1.1 5.7L10 14.5l-5.1 2.8 1.1-5.7-4.3-4 5.8-.7z" fill={n <= value ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.1" />
        </svg>
      ))}
    </span>
  );
}

/** Témoignages réels uniquement (validés avant publication). Sans témoignage : invitation à en laisser un. */
export function Testimonials({ content, index = "07", id = "temoignages" }: { content: TestimonialsContent; index?: string; id?: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="theme-light relative section-y overflow-hidden bg-ink">
      <SectionHeader index={index} label="Témoignages" title={content.title} titleId={`${id}-title`} align="left" />

      {content.items.length > 0 ? (
        <Carousel
          label="Témoignages de propriétaires"
          className="mt-14 md:mt-20"
          itemClass="w-[86vw] sm:w-[60vw] lg:w-[40vw]"
          aside={
            <ButtonLink href="/contact#avis" variant="ghost" icon={false}>
              Laisser un avis
            </ButtonLink>
          }
        >
          {content.items.map((t, i) => (
            <figure key={i} className="flex h-full flex-col justify-between rounded-[12px] border border-line bg-ink/40 p-7 md:p-10">
              <div>
                {t.rating ? <Stars value={t.rating} /> : null}
                <blockquote className="mt-6 font-serif text-[clamp(1.45rem,2vw,2rem)] leading-[1.15]">« {t.text} »</blockquote>
              </div>
              <figcaption className="mt-10 flex items-center gap-4">
                {t.image && (
                  <span className="relative h-14 w-14 overflow-hidden rounded-full">
                    <Image src={siteAsset(t.image)} alt={t.horse ? `${t.horse}, le cheval de ${t.name}` : ""} fill sizes="56px" className="object-cover" />
                  </span>
                )}
                <span>
                  <span className="label block">{t.name}</span>
                  <span className="mt-1 block text-[0.85rem] text-cream/55">{[t.horse && `avec ${t.horse}`, t.source, t.date].filter(Boolean).join(" · ")}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </Carousel>
      ) : (
        <div className="container-x mt-14 md:mt-20">
          <div className="grid gap-10 rounded-[12px] border border-dashed border-line-strong p-8 md:grid-cols-12 md:p-14" data-reveal="up">
            <span className="font-serif text-[7rem] leading-[0.6] text-sand md:col-span-2" aria-hidden="true">
              “
            </span>
            <div className="md:col-span-7">
              <p className="heading-sm">Les premiers avis arrivent.</p>
              <p className="body mt-4 max-w-lg text-cream/70">
                Vous m&apos;avez déjà confié votre cheval ? Votre retour aidera d&apos;autres propriétaires. Chaque avis est relu avant publication : seuls des témoignages réels figurent ici.
              </p>
            </div>
            <div className="flex items-end md:col-span-3 md:justify-end">
              <ButtonLink href="/contact#avis" variant="ghost">
                Laisser un avis
              </ButtonLink>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
