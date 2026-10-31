import type { SiteContent, ZoneContent } from "@/lib/content";
import { ButtonLink } from "@/components/ui/Button";
import { HORSE_HEAD_DOOR } from "@/components/illustrations/silhouettes";
import { SocialIcon } from "./Social";
import { SHOW_PLACEHOLDERS } from "@/lib/config";

function Item({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-dashed border-line-strong pt-4">
      <p className="label text-cream/45">{label}</p>
      <div className="mt-2 text-[1.05rem]">{children}</div>
    </div>
  );
}

const Missing = ({ children }: { children: string }) => (SHOW_PLACEHOLDERS ? <span className="ph-tag">{children}</span> : <span className="text-cream/40">—</span>);

/** Dernière scène : grand portrait de cheval au soleil couchant, invitation au contact. */
export function ContactFinale({ site, zone }: { site: SiteContent; zone: ZoneContent }) {
  const c = site.contact;
  const contactHref = c.email ? `mailto:${c.email}` : c.phone ? `tel:${c.phone.replace(/\s/g, "")}` : "#rendez-vous";
  return (
    <section id="contact" aria-labelledby="contact-title" className="relative overflow-hidden bg-ink">
      {/* Grand cheval à contre-jour */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 72% 58%, #e7b072 0%, #a5643a 18%, #3b2618 42%, #0d0a07 72%)" }} />
        <div data-parallax="0.12" className="absolute -right-[8%] bottom-0 h-[92%] w-[min(1100px,95vw)]">
          <svg viewBox="0 0 300 300" preserveAspectRatio="xMaxYMax meet" className="h-full w-full">
            <g transform="translate(300 0) scale(-1 1)">
              <path d={HORSE_HEAD_DOOR} fill="#0b0805" />
              <path d={HORSE_HEAD_DOOR} fill="none" stroke="#f3c48a" strokeOpacity="0.55" strokeWidth="1.2" />
              <path d="M 176 140 C 182 134, 194 134, 200 140 C 194 146, 182 146, 176 140 Z" fill="#2a1c12" />
              <path d="M 252 222 C 258 216, 266 220, 264 228" fill="none" stroke="#3b2618" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M 146 104 C 120 130, 96 160, 78 196 M 140 112 C 112 146, 92 178, 74 214 M 150 102 C 128 124, 108 150, 90 178" fill="none" stroke="#f3c48a" strokeOpacity="0.18" strokeWidth="1" />
            </g>
          </svg>
        </div>
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(13,10,7,0.92) 0%, rgba(13,10,7,0.55) 45%, rgba(13,10,7,0) 75%)" }} />
        <div className="absolute inset-0 overflow-hidden">
          <div className="grain" />
        </div>
      </div>

      <div className="container-x relative flex min-h-[100svh] flex-col justify-between gap-16 pb-12 pt-[calc(var(--header-h)+8vh)]">
        <div>
          <div className="flex items-center gap-4">
            <span className="label text-cream/50">(15)</span>
            <span className="label">Contact</span>
          </div>
          <h2 id="contact-title" className="display mt-10 max-w-[12ch]" data-reveal="lines">
            Prenons soin de leur <em className="italic text-sand">sourire.</em>
          </h2>
          <div className="mt-12 flex flex-wrap gap-3" data-reveal="up" data-delay="0.2">
            <ButtonLink href="#rendez-vous" variant="cream">
              Prendre rendez-vous
            </ButtonLink>
            <ButtonLink href={contactHref} variant="ghost" icon={false} data-booking-type={contactHref === "#rendez-vous" ? "information" : undefined}>
              Contacter Anaëlle
            </ButtonLink>
          </div>
        </div>

        <div className="grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-5" data-reveal="stagger">
          <Item label="Téléphone">{c.phone ? <a className="link-u" href={`tel:${c.phone.replace(/\s/g, "")}`}>{c.phoneDisplay || c.phone}</a> : <Missing>À renseigner</Missing>}</Item>
          <Item label="E-mail">{c.email ? <a className="link-u break-all" href={`mailto:${c.email}`}>{c.email}</a> : <Missing>À renseigner</Missing>}</Item>
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
          <Item label="Facebook">
            {site.social.facebook ? (
              <a className="link-u inline-flex items-center gap-2" href={site.social.facebook} target="_blank" rel="noopener noreferrer">
                <SocialIcon id="facebook" className="h-4 w-4" /> Facebook
              </a>
            ) : (
              <Missing>À renseigner</Missing>
            )}
          </Item>
        </div>
      </div>
    </section>
  );
}
