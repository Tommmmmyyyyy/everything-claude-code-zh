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
    <section id="rendez-vous" aria-labelledby="rdv-title" className="theme-light relative section-y bg-ink">
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
          <div data-spotlight className="rounded-[18px] border border-line p-6 md:p-8">
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

      <div className={`container-x ${header || calendarSrc ? "mt-14 md:mt-16" : ""}`}>
        <RequestSteps />
      </div>

      <div className="container-x mt-10 md:mt-14">
        <BookingForm contactFallback={<ContactLines className="" />} />
      </div>
    </section>
  );
}

/** Rappel du fonctionnement : une demande de contact, puis un rappel d'Anaëlle. */
function RequestSteps() {
  const steps = [
    { n: "01", title: "Vous envoyez votre demande", text: "Quelques informations sur vous, votre cheval et votre écurie." },
    { n: "02", title: "Anaëlle vous recontacte", text: "Par téléphone ou par e-mail, selon votre préférence." },
    { n: "03", title: "Le rendez-vous est confirmé", text: "La date est fixée ensemble : rien n'est réservé automatiquement." },
  ];
  return (
    <ol aria-label="Comment se passe une demande de rendez-vous" className="grid gap-4 rounded-[18px] border border-line p-5 sm:grid-cols-3 sm:gap-6 md:p-7" data-reveal="up">
      {steps.map((s) => (
        <li key={s.n} className="flex gap-4">
          <span className="label grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line-strong tabular-nums text-sand">{s.n}</span>
          <span>
            <span className="block font-serif text-[1.25rem] leading-tight">{s.title}</span>
            <span className="mt-1 block text-[0.9rem] leading-relaxed text-cream/65">{s.text}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
