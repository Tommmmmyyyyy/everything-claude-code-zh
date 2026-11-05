import { SiteLink as Link } from "@/components/ui/SiteLink";
import { navLinks, site, socialLinks } from "@/lib/content";
import { SocialIcon } from "@/components/sections/Social";

export function Footer() {
  const year = new Date().getFullYear();
  const socials = socialLinks().filter((s) => s.url);
  const c = site.contact;
  return (
    <footer className="relative overflow-hidden border-t border-line bg-ink">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="aurora -bottom-40 left-1/2 h-[380px] w-[900px] -translate-x-1/2 opacity-35" aria-hidden="true" />
      <div className="container-x relative grid gap-12 py-16 md:grid-cols-12 md:gap-6 md:py-20">
        <div className="md:col-span-4">
          <p className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-[13px] border border-line-strong bg-[linear-gradient(145deg,rgb(126_247_198/0.18),rgb(99_216_255/0.05))] font-serif text-[0.95rem] tracking-[-0.04em] shadow-[0_0_26px_-6px_rgb(126_247_198/0.6)]" aria-hidden="true">
              AT
            </span>
            <span className="font-serif text-[1.6rem] leading-none tracking-[-0.04em]">
              {site.identity.firstName} <em className="text-sand">{site.identity.lastName}</em>
            </span>
          </p>
          <p className="label mt-5 text-cream/55">{site.identity.profession}</p>
          {site.identity.diploma && <p className="mt-2 text-[0.85rem] text-cream/50">{site.identity.diploma}</p>}
          {socials.length > 0 && (
            <ul className="mt-8 flex gap-3">
              {socials.map((s) => (
                <li key={s.id}>
                  <a href={s.url!} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="grid h-10 w-10 place-items-center rounded-full border border-line-strong transition-colors hover:border-cognac hover:text-sand">
                    <SocialIcon id={s.id} className="h-4 w-4" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <nav aria-label="Plan du site" className="md:col-span-4">
          <p className="label text-cream/45">Navigation</p>
          <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="link-u text-cream/80 hover:text-cream">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="md:col-span-4">
          <p className="label text-cream/45">Coordonnées</p>
          <ul className="mt-4 grid gap-2 text-cream/80">
            {c.phone && (
              <li>
                <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="link-u">
                  {c.phoneDisplay || c.phone}
                </a>
              </li>
            )}
            {c.email && (
              <li>
                <a href={`mailto:${c.email}`} className="link-u">
                  {c.email}
                </a>
              </li>
            )}
            {c.addressLocality && <li>{c.addressLocality}</li>}
            <li>
              <Link href="/rendez-vous" className="link-u">
                Demande de rendez-vous
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <p className="container-x relative select-none whitespace-nowrap pb-2 font-serif text-[clamp(2.6rem,10.6vw,15rem)] font-extralight uppercase leading-[0.82] tracking-[-0.06em] text-transparent [background:linear-gradient(180deg,rgb(233_243_238/0.16),rgb(233_243_238/0.015)_85%)] [-webkit-background-clip:text] [background-clip:text]" aria-hidden="true">
        {site.identity.fullName}
      </p>
      <div className="container-x relative flex flex-col gap-4 border-t border-line py-6 text-[0.8rem] text-cream/50 md:flex-row md:items-center md:justify-between">
        <p>
          © {year} {site.legal.businessName ?? site.identity.fullName}. Tous droits réservés.
        </p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          <li>
            <Link href="/mentions-legales" className="link-u hover:text-cream">
              Mentions légales
            </Link>
          </li>
          <li>
            <Link href="/confidentialite" className="link-u hover:text-cream">
              Politique de confidentialité
            </Link>
          </li>
          <li>
            <a href="#contenu" className="link-u hover:text-cream">
              Haut de page ↑
            </a>
          </li>
        </ul>
        {site.credits.studio && (
          <p className="micro text-cognac">
            {site.credits.label} —{" "}
            {site.credits.url ? (
              <a href={site.credits.url} className="link-u" target="_blank" rel="noopener noreferrer">
                {site.credits.studio}
              </a>
            ) : (
              site.credits.studio
            )}
          </p>
        )}
      </div>
    </footer>
  );
}
