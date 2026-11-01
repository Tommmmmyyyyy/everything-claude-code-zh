"use client";

import { useState } from "react";
import type { SiteContent } from "@/lib/content";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { BookingForm } from "@/components/booking/BookingForm";
import { ContactLines } from "@/components/layout/Header";

/** Prise de rendez-vous : formulaire de demande + réservation en ligne si un agenda est connecté. */
export function Booking({ site, index = "11", header = true }: { site: SiteContent; index?: string; header?: boolean }) {
  const calendar = site.booking.calendlyUrl || site.booking.googleAppointmentUrl;
  const provider = site.booking.calendlyUrl ? "Calendly" : "Google Agenda";
  const [showCal, setShowCal] = useState(false);

  const calendarSrc = (() => {
    if (!calendar) return null;
    if (site.booking.calendlyUrl) {
      const u = new URL(site.booking.calendlyUrl);
      u.searchParams.set("hide_gdpr_banner", "1");
      u.searchParams.set("background_color", "15100b");
      u.searchParams.set("text_color", "f4eadb");
      u.searchParams.set("primary_color", "c07a43");
      return u.toString();
    }
    return calendar;
  })();

  return (
    <section id="rendez-vous" aria-labelledby="rdv-title" className="relative section-y bg-forest">
      {header ? (
      <SectionHeader
        index={index}
        label="Rendez-vous"
        title={
          <>
            Prenons <em className="italic text-sand">rendez-vous.</em>
          </>
        }
        intro={
          <>
            Décrivez votre demande en quelques étapes : elle est transmise directement à Anaëlle, qui vous recontacte pour fixer ensemble la date
            {site.booking.responseDelay ? ` (${site.booking.responseDelay})` : ""}.
          </>
        }
        titleId="rdv-title"
      />
      ) : (
        <h2 id="rdv-title" className="sr-only">
          Demande de rendez-vous
        </h2>
      )}

      {calendarSrc && (
        <div className={`container-x ${header ? "mt-14" : ""}`}>
          <div className="rounded-[12px] border border-line p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="label text-sand">Réservation en ligne</p>
                <p className="mt-2 text-cream/75">Choisissez directement un créneau parmi les disponibilités réelles d&apos;Anaëlle.</p>
              </div>
              {!showCal && (
                <button type="button" onClick={() => setShowCal(true)} className="btn btn-ghost">
                  <span className="btn-label">
                    <span>Afficher l&apos;agenda</span>
                    <span aria-hidden="true">Afficher l&apos;agenda</span>
                  </span>
                </button>
              )}
            </div>
            {showCal ? (
              <iframe src={calendarSrc} title={`Agenda de réservation (${provider})`} className="mt-6 h-[720px] w-full rounded-[8px] border-0 bg-ink" loading="lazy" />
            ) : (
              <p className="micro mt-4 text-cream/40">L&apos;agenda est fourni par {provider} et ne se charge qu&apos;à votre demande (cookies tiers).</p>
            )}
          </div>
          <p className="label mt-10 text-center text-cream/45">— ou envoyez une demande —</p>
        </div>
      )}

      <div className={`container-x ${header || calendarSrc ? "mt-14 md:mt-20" : ""}`}>
        <BookingForm contactFallback={<ContactLines className="" />} />
      </div>
    </section>
  );
}
