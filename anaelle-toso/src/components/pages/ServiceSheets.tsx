import Image from "next/image";
import type { ServicesContent } from "@/lib/content";
import { ServiceDiagram } from "@/components/sections/Services";
import { ButtonLink } from "@/components/ui/Button";
import { siteAsset, SHOW_PLACEHOLDERS } from "@/lib/config";

/** Fiches détaillées des soins (page Prestations), une composition par soin. */
export function ServiceSheets({ content }: { content: ServicesContent }) {
  return (
    <section aria-label="Fiches des prestations" className="theme-light relative bg-ink">
      {content.items.map((s, i) => {
        const flip = i % 2 === 1;
        return (
          <article key={s.id} id={`fiche-${s.id}`} className="container-x scroll-mt-24 border-t border-dashed border-line-strong py-20 md:py-28" aria-labelledby={`fiche-${s.id}-titre`}>
            <div className="grid gap-10 md:grid-cols-12 md:items-center md:gap-6">
              <div className={`md:col-span-6 ${flip ? "md:order-2 md:col-start-7" : ""}`}>
                <div data-reveal="mask" className="relative aspect-[4/3] overflow-hidden rounded-[12px] border border-line bg-forest">
                  <div data-reveal-inner className="absolute inset-0">
                    {s.image ? (
                      <Image src={siteAsset(s.image)} alt={s.imageAlt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
                    ) : (
                      <>
                        <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 55%, rgba(192,122,67,0.18), transparent 60%)" }} />
                        <div className="absolute inset-0 p-8 md:p-12">
                          <ServiceDiagram kind={s.diagram} />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className={`md:col-span-5 ${flip ? "md:order-1 md:col-start-1" : "md:col-start-8"}`}>
                <p className="flex items-baseline gap-4" data-reveal="up">
                  <span className="font-serif text-[clamp(3.5rem,6vw,5.5rem)] leading-[0.8] text-sand/40">{String(i + 1).padStart(2, "0")}</span>
                  <span className="label text-sand">{s.kicker}</span>
                </p>
                <h2 id={`fiche-${s.id}-titre`} className="heading mt-6" data-reveal="lines">
                  {s.title}
                </h2>
                <p className="body-lg mt-6 text-cream/80" data-reveal="up">
                  {s.description}
                </p>
                <ul className="mt-6 grid gap-2.5" data-reveal="stagger">
                  {s.details.map((d) => (
                    <li key={d} className="flex items-baseline gap-3 text-cream/70">
                      <span className="h-1 w-1 shrink-0 translate-y-[-2px] rounded-full bg-sand" aria-hidden="true" />
                      {d}
                    </li>
                  ))}
                </ul>
                <div className="mt-9 flex flex-wrap items-center gap-4" data-reveal="up">
                  <ButtonLink href={`/rendez-vous?type=${s.id === "suivi" ? "suivi" : "premier-rdv"}`} variant="ghost">
                    Demander ce soin
                  </ButtonLink>
                  {s.price ? <span className="label text-sand">{s.price}</span> : SHOW_PLACEHOLDERS && <span className="ph-tag">Tarif à renseigner</span>}
                </div>
              </div>
            </div>
          </article>
        );
      })}
      <div className="container-x grid gap-6 border-t border-dashed border-line-strong py-14 md:grid-cols-12">
        <p className="micro text-cream/45 md:col-span-2">Cadre réglementaire</p>
        <p className="text-[0.95rem] leading-relaxed text-cream/65 md:col-span-6">{content.regulatoryNote}</p>
        {content.pricingNote && <p className="text-[0.95rem] leading-relaxed text-cream/65 md:col-span-4">{content.pricingNote}</p>}
      </div>
    </section>
  );
}
