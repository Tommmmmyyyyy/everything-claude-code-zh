import { SiteLink as Link } from "@/components/ui/SiteLink";
import { navLinks, site, socialLinks } from "@/lib/content";
import { SocialIcon } from "@/components/sections/Social";

export function Footer() {
  const year = new Date().getFullYear();
  const socials = socialLinks().filter((s) => s.url);
  const c = site.contact;
  return (
    <footer className="relative border-t border-line bg-forest">
      <div className="container-x grid gap-12 py-16 md:grid-cols-12 md:gap-6 md:py-20">
        <div className="md:col-span-4">
          <p className="font-serif text-[2.6rem] leading-none">
            {site.identity.firstName} <em className="italic text-sand">{site.identity.lastName}</em>
          </p>
          <p className="label mt-4 text-cream/55">{site.identity.profession}</p>
          {site.identity.diploma && <p className="mt-2 text-[0.85rem] text-cream/50">{site.identity.diploma}</p>}
          {socials.length > 0 && (
            <ul className="mt-8 flex gap-3">
              {socials.map((s) => (
                <li key={s.id}>
                  <a href={s.url!} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="grid h-10 w-10 place-items-center rounded-full border border-line-strong transition-colors hover:border-cream">
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
      <div className="container-x flex flex-col gap-4 border-t border-dashed border-line-strong py-6 text-[0.8rem] text-cream/50 md:flex-row md:items-center md:justify-between">
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
