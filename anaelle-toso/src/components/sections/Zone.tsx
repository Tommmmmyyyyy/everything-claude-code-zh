"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ZoneContent } from "@/lib/content";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ButtonLink } from "@/components/ui/Button";
import { SHOW_PLACEHOLDERS } from "@/lib/config";

const ZoneMap = dynamic(() => import("./ZoneMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-forest-2" />,
});

export function Zone({ zone, index = "10" }: { zone: ZoneContent; index?: string }) {
  const configured = zone.main.lat != null && zone.main.lng != null;
  // La carte (Leaflet + tuiles) n'est chargée qu'à l'approche de la section.
  const mapBox = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const api = useRef<{ recenter: () => void } | null>(null);
  const onReady = useCallback((a: { recenter: () => void }) => {
    api.current = a;
  }, []);
  useEffect(() => {
    const el = mapBox.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="zone" aria-labelledby="zone-title" className="theme-light tone-white relative section-y bg-ink">
      <SectionHeader index={index} label="Zone d'intervention" title={zone.title} intro={zone.intro} titleId="zone-title" />

      <div className="container-x mt-16 grid gap-10 md:mt-24 md:grid-cols-12 md:gap-6">
        <div className="flex flex-col gap-10 md:col-span-4">
          {zone.main.baseLabel && (
            <div data-reveal="up">
              <p className="label text-cream/50">Ma base</p>
              <p className="heading-sm mt-3 flex items-center gap-3">
                <span className="relative inline-flex h-3 w-3" aria-hidden="true">
                  <span className="absolute inset-0 animate-ping rounded-full bg-cognac/60" />
                  <span className="relative h-3 w-3 rounded-full bg-cognac" />
                </span>
                {zone.main.baseLabel}
              </p>
            </div>
          )}
          <div data-reveal="up">
            <p className="label text-cream/50">Zone principale</p>
            {zone.main.label ? (
              <p className="heading-sm mt-3">
                {zone.main.label}
                {zone.main.radiusKm ? <span className="text-sand"> — environ {zone.main.radiusKm} km autour de ma base</span> : null}
              </p>
            ) : (
              SHOW_PLACEHOLDERS && <p className="mt-3"><span className="ph-tag">Zone principale à renseigner</span></p>
            )}
          </div>

          <div data-reveal="up" data-delay="0.05">
            <p className="label text-cream/50">Villes desservies</p>
            {zone.cities.length ? (
              <ul className="mt-4 flex flex-wrap gap-2">
                {zone.cities.map((c) => (
                  <li key={c.name} className="label rounded-[22.5px] border border-line-strong px-3.5 py-2">
                    {c.name}
                  </li>
                ))}
              </ul>
            ) : (
              SHOW_PLACEHOLDERS && <p className="mt-3"><span className="ph-tag">Liste des villes à renseigner</span></p>
            )}
          </div>

          <div data-reveal="up" data-delay="0.1">
            <p className="label text-cream/50">Déplacements possibles</p>
            {zone.travelNote || zone.extended.length ? (
              <p className="body mt-3 text-cream/75">
                {zone.travelNote}
                {zone.extended.length > 0 && (
                  <span className="mt-3 block text-[0.95rem] text-cream/60">Secteurs sur demande : {zone.extended.map((z) => z.name).join(", ")}.</span>
                )}
              </p>
            ) : (
              <p className="body mt-3 text-cream/75">
                Votre écurie se trouve hors de la zone indiquée ? Faites une demande de déplacement : je vous réponds au cas par cas.
              </p>
            )}
          </div>

          <div data-reveal="up" data-delay="0.15">
            <ButtonLink href="#rendez-vous" variant="filled" data-booking-type="deplacement">
              Demande de déplacement
            </ButtonLink>
          </div>
        </div>

        <div className="relative md:col-span-8" data-reveal="fade">
          <div ref={mapBox} className="map-dark relative aspect-[4/5] overflow-hidden rounded-[18px] border border-line bg-forest sm:aspect-[4/3]">
            {near ? <ZoneMap zone={zone} onReady={onReady} /> : <div className="h-full w-full bg-forest" />}
            {configured && (
              <>
                <button
                  type="button"
                  onClick={() => api.current?.recenter()}
                  className="label absolute left-4 top-4 z-[500] rounded-[22.5px] border border-line-strong bg-ink/80 px-4 py-2.5 backdrop-blur-sm transition-colors hover:border-cream"
                >
                  Recentrer sur la Somme
                </button>
                <ul className="micro pointer-events-none absolute bottom-4 left-4 z-[500] grid gap-2 rounded-[18px] border border-line bg-ink/80 p-4 text-cream/75 backdrop-blur-sm" aria-label="Légende">
                  <li className="flex items-center gap-2.5"><span className="h-2.5 w-2.5 rounded-full bg-cognac" />Ma base</li>
                  <li className="flex items-center gap-2.5"><span className="h-2.5 w-4 rounded-full border border-dashed border-cognac" />Zone principale</li>
                  <li className="flex items-center gap-2.5"><span className="h-2 w-2 rounded-full bg-cream" />Villes desservies</li>
                  <li className="flex items-center gap-2.5"><span className="h-2.5 w-4 rounded-full border border-dotted border-sand" />Sur demande</li>
                </ul>
                <p className="micro pointer-events-none absolute right-4 top-[92px] z-[500] hidden text-cream/45 md:block">Cliquez pour zoomer à la molette</p>
              </>
            )}
            {!configured && (
              <div className="pointer-events-none absolute inset-0 z-[500] flex items-end p-5 md:p-8">
                <div className="pointer-events-auto max-w-sm rounded-[18px] border border-line bg-ink/85 p-5 backdrop-blur-sm">
                  <p className="label text-sand">Carte en préparation</p>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-cream/75">
                    La zone d&apos;intervention sera affichée ici. En attendant, indiquez l&apos;adresse de votre écurie dans votre demande : je vous confirme si je peux me déplacer.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
