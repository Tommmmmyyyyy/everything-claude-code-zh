import type { Metadata } from "next";
import { site, testimonials, zone } from "@/lib/content";
import { PageHero } from "@/components/ui/PageHero";
import { SocialIcon } from "@/components/sections/Social";
import { Testimonials } from "@/components/sections/Testimonials";
import { ContactForm, ReviewForm } from "@/components/pages/ContactForms";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contacter ${site.identity.fullName}, ${site.identity.profession.toLowerCase()} : téléphone, e-mail, Instagram, Facebook, formulaire de contact et avis.`,
  alternates: { canonical: "/contact" },
};

export default function Contact() {
  const c = site.contact;
  const cards = [
    c.phone && { label: "Téléphone", value: c.phoneDisplay || c.phone, href: `tel:${c.phone.replace(/\s/g, "")}`, icon: "phone", note: "Appel ou SMS" },
    c.email && { label: "E-mail", value: c.email, href: `mailto:${c.email}`, icon: "mail", note: "Réponse personnelle" },
    site.social.instagram && { label: "Instagram", value: site.social.instagramHandle ? `@${site.social.instagramHandle}` : "Instagram", href: site.social.instagram, icon: "instagram", note: "Messages privés bienvenus", external: true },
    site.social.facebook && { label: "Facebook", value: "Anaëlle Toso", href: site.social.facebook, icon: "facebook", note: "Actualités et messages", external: true },
  ].filter(Boolean) as { label: string; value: string; href: string; icon: string; note: string; external?: boolean }[];

  return (
    <>
      <PageHero
        index="01"
        label="Contact"
        title={
          <>
            Parlons de votre <em className="italic text-sand">cheval.</em>
          </>
        }
        intro={`Basée à ${c.addressLocality}, j'interviens dans toute la ${zone.main.label ?? "région"}. Une question, une demande particulière, un retour après une visite : je vous lis avec attention.`}
        image="/images/contact/cheval-pas-dane.jpg"
        imagePosition="35% 40%"
        tone="leather"
      >
        <ButtonLink href="#ecrire" variant="cream">
          Écrire un message
        </ButtonLink>
        <ButtonLink href="#avis" variant="ghost" icon={false}>
          Laisser un avis
        </ButtonLink>
      </PageHero>

      <section aria-label="Coordonnées" className="relative bg-ink py-20 md:py-28">
        <ul className="container-x grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-reveal="stagger">
          {cards.map((k) => (
            <li key={k.label}>
              <a
                href={k.href}
                {...(k.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="group relative flex h-full flex-col justify-between gap-10 overflow-hidden rounded-[12px] border border-line bg-ink-2 p-6 transition-colors duration-500 hover:border-cream/50 md:p-7"
                data-cursor={k.external ? "Ouvrir" : undefined}
              >
                <span className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100" style={{ background: "radial-gradient(circle at 85% 0%, rgba(192,122,67,0.22), transparent 60%)" }} aria-hidden="true" />
                <span className="relative flex items-center justify-between">
                  <span className="label text-sand">{k.label}</span>
                  <span className="grid h-10 w-10 place-items-center rounded-full border border-line-strong transition-[transform,border-color] duration-500 group-hover:-rotate-12 group-hover:border-cream">
                    <CardIcon id={k.icon} />
                  </span>
                </span>
                <span className="relative">
                  <span className="block break-words font-serif text-[clamp(1.5rem,2vw,1.9rem)] leading-tight">{k.value}</span>
                  <span className="micro mt-2 block text-cream/50">{k.note}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section id="ecrire" aria-labelledby="ecrire-title" className="relative scroll-mt-20 bg-ink pb-24 md:pb-36">
        <div className="container-x grid gap-12 md:grid-cols-12 md:gap-6">
          <div className="md:col-span-4">
            <div className="flex items-center gap-4">
              <span className="label tabular-nums text-cream/50">(02)</span>
              <span className="label">Écrire</span>
              <span className="rule-dashed flex-1" data-reveal="line" aria-hidden="true" />
            </div>
            <h2 id="ecrire-title" className="heading mt-8" data-reveal="lines">
              Un message, <em className="italic text-sand">une question.</em>
            </h2>
            <p className="body mt-6 text-cream/70" data-reveal="up">
              Pour une demande de rendez-vous, le formulaire dédié est plus rapide&nbsp;: il recueille toutes les informations utiles sur votre cheval.
            </p>
            <div className="mt-8" data-reveal="up" data-delay="0.1">
              <ButtonLink href="/rendez-vous" variant="ghost">
                Demande de rendez-vous
              </ButtonLink>
            </div>
          </div>
          <div className="rounded-[12px] border border-line bg-ink-2/60 p-6 md:col-span-7 md:col-start-6 md:p-10">
            <ContactForm />
          </div>
        </div>
      </section>

      <section id="avis" aria-labelledby="avis-title" className="relative scroll-mt-20 overflow-hidden bg-forest py-24 md:py-36">
        <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at 15% 0%, rgba(217,196,160,0.1), transparent 55%)" }} aria-hidden="true" />
        <div className="container-x relative grid gap-12 md:grid-cols-12 md:gap-6">
          <div className="md:col-span-4">
            <div className="flex items-center gap-4">
              <span className="label tabular-nums text-cream/50">(03)</span>
              <span className="label">Votre avis</span>
              <span className="rule-dashed flex-1" data-reveal="line" aria-hidden="true" />
            </div>
            <h2 id="avis-title" className="heading mt-8" data-reveal="lines">
              Partagez votre <em className="italic text-sand">expérience.</em>
            </h2>
            <p className="body mt-6 text-cream/70" data-reveal="up">
              Votre retour aide d&apos;autres propriétaires à choisir en confiance. Chaque avis est relu par Anaëlle avant publication&nbsp;: seuls des témoignages réels figurent sur ce site.
            </p>
            <ol className="mt-8 grid gap-3 text-[0.92rem] text-cream/65" data-reveal="up" data-delay="0.1">
              {["Vous laissez votre avis", "Anaëlle le relit", "Il est publié sur le site"].map((s, i) => (
                <li key={s} className="flex items-center gap-3">
                  <span className="label grid h-7 w-7 place-items-center rounded-full border border-line-strong tabular-nums">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-[12px] border border-line bg-ink/40 p-6 md:col-span-7 md:col-start-6 md:p-10">
            <ReviewForm />
          </div>
        </div>
      </section>

      {testimonials.items.length > 0 && <Testimonials content={testimonials} index="04" />}
    </>
  );
}

function CardIcon({ id }: { id: string }) {
  if (id === "instagram" || id === "facebook") return <SocialIcon id={id} className="h-4 w-4" />;
  if (id === "phone")
    return (
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
        <path d="M5 2.5h3l1.3 4-2 1.3a10 10 0 0 0 5 5l1.3-2 4 1.3v3a2 2 0 0 1-2 2A15 15 0 0 1 3 4.5a2 2 0 0 1 2-2Z" />
      </svg>
    );
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
      <rect x="2.5" y="4.5" width="15" height="11" rx="1.5" />
      <path d="m3 5.5 7 5.5 7-5.5" />
    </svg>
  );
}
