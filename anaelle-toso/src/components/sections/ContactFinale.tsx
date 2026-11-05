import Image from "next/image";
import type { SiteContent, ZoneContent } from "@/lib/content";
import { ButtonLink } from "@/components/ui/Button";
import { SocialIcon } from "./Social";
import { SHOW_PLACEHOLDERS } from "@/lib/config";

function Item({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div data-spotlight className="glass rounded-[16px] p-4">
      <p className="label text-cream/45">{label}</p>
      <div className="mt-2 text-[1rem] [overflow-wrap:anywhere]">{children}</div>
    </div>
  );
}

const Missing = ({ children }: { children: string }) => (SHOW_PLACEHOLDERS ? <span className="ph-tag">{children}</span> : <span className="text-cream/40">—</span>);

/** Dernière scène : grand portrait de cheval au soleil couchant, invitation au contact. */
export function ContactFinale({ site, zone, index = "15" }: { site: SiteContent; zone: ZoneContent; index?: string }) {
  const c = site.contact;
  return (
    <section id="contact" aria-labelledby="contact-title" className="relative overflow-hidden bg-ink">
      {/* Grand cheval à contre-jour */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 72% 55%, #3fe0b0 0%, #127a63 16%, #0a3329 38%, #040806 72%)" }} />
        <div className="absolute inset-y-0 right-0 w-full overflow-hidden md:w-[66%] md:[mask-image:linear-gradient(to_right,transparent,black_38%)]">
          <div data-parallax="0.08" className="absolute inset-[-8%_0]">
            <Image
              src="/images/contact/cheval-pas-dane.jpg"
              alt=""
              fill
              sizes="(min-width: 768px) 62vw, 100vw"
              className="object-cover object-[35%_40%] [filter:saturate(0.8)_contrast(1.1)_brightness(0.85)]"
            />
          </div>
          <div className="absolute inset-0 opacity-55 mix-blend-color" style={{ background: "linear-gradient(200deg, rgba(40,140,110,0.6), rgba(4,24,16,0.7))" }} />
          <div className="hud-corners absolute inset-6" />
        </div>
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(4,8,6,0.97) 0%, rgba(4,8,6,0.88) 38%, rgba(4,8,6,0.2) 70%, rgba(4,8,6,0.05) 100%), linear-gradient(to top, rgba(4,8,6,0.9), rgba(4,8,6,0) 45%)" }} />
        <div className="absolute inset-0 overflow-hidden">
          <div className="grain" />
        </div>
      </div>

      <div className="container-x relative flex min-h-[100svh] flex-col justify-between gap-16 pb-12 pt-[calc(var(--header-h)+8vh)]">
        <div>
          <div className="flex items-center gap-3">
            <span className="label inline-flex h-6 items-center rounded-full border border-line-strong px-2.5 tabular-nums text-sand">{index}</span>
            <span className="label">Contact</span>
          </div>
          <h2 id="contact-title" className="display mt-10 max-w-[12ch]" data-reveal="lines">
            Prenons soin de leur <em className="italic text-sand">sourire.</em>
          </h2>
          <div className="mt-12 flex flex-wrap gap-3" data-reveal="up" data-delay="0.2">
            <ButtonLink href="/rendez-vous" variant="filled">
              Demander un rendez-vous
            </ButtonLink>
            <ButtonLink href="/contact" variant="ghost" icon={false}>
              Contacter Anaëlle
            </ButtonLink>
          </div>
        </div>

        <div className="grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-3" data-reveal="stagger">
          {(c.phone || SHOW_PLACEHOLDERS) && (
            <Item label="Téléphone">{c.phone ? <a className="link-u" href={`tel:${c.phone.replace(/\s/g, "")}`}>{c.phoneDisplay || c.phone}</a> : <Missing>À renseigner</Missing>}</Item>
          )}
          {(c.email || SHOW_PLACEHOLDERS) && (
            <Item label="E-mail">{c.email ? <a className="link-u" href={`mailto:${c.email}`}>{c.email}</a> : <Missing>À renseigner</Missing>}</Item>
          )}
          {c.addressLocality && <Item label="Basée à">{c.addressLocality}</Item>}
          <Item label="Zone">{zone.main.label ?? <Missing>À renseigner</Missing>}</Item>
          <Item label="Instagram">
            {site.social.instagram ? (
              <a className="link-u inline-flex items-center gap-2" href={site.social.instagram} target="_blank" rel="noopener noreferrer">
                <SocialIcon id="instagram" className="h-4 w-4" /> {site.social.instagramHandle ? `@${site.social.instagramHandle}` : "Instagram"}
              </a>
            ) : (
              <Missing>À renseigner</Missing>
            )}
          </Item>
          {(site.social.facebook || SHOW_PLACEHOLDERS) && <Item label="Facebook">
            {site.social.facebook ? (
              <a className="link-u inline-flex items-center gap-2" href={site.social.facebook} target="_blank" rel="noopener noreferrer">
                <SocialIcon id="facebook" className="h-4 w-4" /> Facebook
              </a>
            ) : (
              <Missing>À renseigner</Missing>
            )}
          </Item>}
        </div>
      </div>
    </section>
  );
}
