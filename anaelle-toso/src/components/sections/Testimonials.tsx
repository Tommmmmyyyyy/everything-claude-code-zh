"use client";

import { useRef } from "react";
import Image from "next/image";
import type { SiteContent, TestimonialsContent } from "@/lib/content";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ButtonLink } from "@/components/ui/Button";
import { SHOW_PLACEHOLDERS } from "@/lib/config";

/** Témoignages réels uniquement. Sans témoignage, une invitation à partager son expérience est affichée. */
export function Testimonials({ content, site }: { content: TestimonialsContent; site: SiteContent }) {
  const track = useRef<HTMLUListElement>(null);
  const scroll = (d: number) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector("li");
    el.scrollBy({ left: d * ((card?.clientWidth ?? 400) + 24), behavior: "smooth" });
  };
  const shareHref = content.reviewUrl || (site.contact.email ? `mailto:${site.contact.email}?subject=${encodeURIComponent("Mon témoignage")}` : null);

  return (
    <section id="avis" aria-labelledby="avis-title" className="relative section-y overflow-hidden bg-forest">
      <SectionHeader index="13" label="Témoignages" title={content.title} titleId="avis-title" align="left" />

      {content.items.length > 0 ? (
        <>
          <ul
            ref={track}
            className="mt-14 flex snap-x snap-mandatory gap-6 overflow-x-auto px-[var(--gutter)] pb-6 [scrollbar-width:none] md:mt-20"
            aria-label="Témoignages de propriétaires"
            data-lenis-prevent
          >
            {content.items.map((t, i) => (
              <li key={i} className="w-[min(86vw,34rem)] shrink-0 snap-start">
                <figure className="flex h-full flex-col justify-between rounded-[12px] border border-line p-7 md:p-10">
                  <blockquote className="font-serif text-[clamp(1.5rem,2.2vw,2.1rem)] leading-[1.12]">« {t.text} »</blockquote>
                  <figcaption className="mt-10 flex items-center gap-4">
                    {t.image && (
                      <span className="relative h-14 w-14 overflow-hidden rounded-full">
                        <Image src={t.image} alt={t.horse ? `${t.horse}, le cheval de ${t.name}` : ""} fill sizes="56px" className="object-cover" />
                      </span>
                    )}
                    <span>
                      <span className="label block">{t.name}</span>
                      <span className="mt-1 block text-[0.85rem] text-cream/55">
                        {[t.horse && `avec ${t.horse}`, t.source, t.date].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
          <div className="container-x mt-6 flex gap-3">
            <button type="button" onClick={() => scroll(-1)} className="label rounded-[22.5px] border border-line-strong px-4 py-2.5 hover:border-cream" aria-label="Témoignage précédent">
              ←
            </button>
            <button type="button" onClick={() => scroll(1)} className="label rounded-[22.5px] border border-line-strong px-4 py-2.5 hover:border-cream" aria-label="Témoignage suivant">
              →
            </button>
          </div>
        </>
      ) : (
        <div className="container-x mt-14 md:mt-20">
          <div className="grid gap-10 rounded-[12px] border border-dashed border-line-strong p-8 md:grid-cols-12 md:p-14" data-reveal="up">
            <span className="font-serif text-[7rem] leading-[0.6] text-sand md:col-span-2" aria-hidden="true">
              “
            </span>
            <div className="md:col-span-7">
              <p className="heading-sm">Les premiers témoignages arrivent.</p>
              <p className="body mt-4 max-w-lg text-cream/70">
                Vous m&apos;avez déjà confié votre cheval&nbsp;? Votre retour aidera d&apos;autres propriétaires à franchir le pas. Seuls des avis réels, publiés avec l&apos;accord de leurs auteurs, figurent ici.
              </p>
            </div>
            <div className="flex items-end md:col-span-3 md:justify-end">
              {shareHref ? (
                <ButtonLink href={shareHref} variant="ghost" target={content.reviewUrl ? "_blank" : undefined} rel={content.reviewUrl ? "noopener noreferrer" : undefined}>
                  Partager mon expérience
                </ButtonLink>
              ) : (
                SHOW_PLACEHOLDERS && <span className="ph-tag">Lien d&apos;avis à renseigner</span>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
