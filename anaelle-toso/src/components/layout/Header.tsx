"use client";

import { useEffect, useRef, useState } from "react";
import { SiteLink as Link } from "@/components/ui/SiteLink";
import { usePathname } from "next/navigation";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { lockScroll } from "@/lib/lenis";
import { navLinks, primaryNav, site, socialLinks } from "@/lib/content";
import { DEMO, SHOW_PLACEHOLDERS, siteAsset } from "@/lib/config";

function normalize(p: string) {
  let x = p.replace(/\.html$/, "").replace(/\/$/, "") || "/";
  // Démo statique servie depuis un sous-dossier (…/app/faq.html) : seul le dernier segment compte
  if (DEMO) x = "/" + (x.split("/").pop() || "");
  return x === "/site" || x === "/index" ? "/" : x;
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const current = normalize(usePathname() || "/");
  const isActive = (href: string) => normalize(href) === current;

  /* Masquer à la descente, réafficher à la remontée */
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      if (Math.abs(y - last) > 6) {
        setHidden(y > last && y > 400);
        last = y;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Menu plein écran : animation, verrouillage, Échap, piège de focus */
  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;
    const reduce = prefersReducedMotion();
    if (open) {
      lockScroll(true);
      menu.hidden = false;
      const cards = menu.querySelectorAll("[data-menu-card]");
      const items = menu.querySelectorAll("[data-menu-item]");
      gsap.fromTo(menu, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: reduce ? 0 : 0.9, ease: "expo.inOut" });
      gsap.fromTo(cards, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: reduce ? 0 : 1, stagger: 0.05, delay: reduce ? 0 : 0.3, ease: "expo.out", clearProps: "transform" });
      gsap.fromTo(items, { yPercent: 110 }, { yPercent: 0, duration: reduce ? 0 : 1, stagger: 0.04, delay: reduce ? 0 : 0.45, ease: "expo.out" });
      menu.querySelector<HTMLElement>("a, button")?.focus();
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
        if (e.key === "Tab") {
          const f = Array.from(menu.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"));
          const all = [toggleRef.current!, ...f];
          const i = all.indexOf(document.activeElement as HTMLElement);
          if (e.shiftKey && i <= 0) {
            e.preventDefault();
            all[all.length - 1].focus();
          } else if (!e.shiftKey && i === all.length - 1) {
            e.preventDefault();
            all[0].focus();
          }
        }
      };
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    } else if (!menu.hidden) {
      lockScroll(false);
      gsap.to(menu, {
        clipPath: "inset(0 0 100% 0)",
        duration: reduce ? 0 : 0.7,
        ease: "expo.inOut",
        onComplete: () => {
          menu.hidden = true;
        },
      });
    }
  }, [open]);

  const socials = socialLinks().filter((s) => s.url || SHOW_PLACEHOLDERS);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[100] px-[max(10px,calc(var(--gutter)-10px))] pt-3 transition-transform duration-700 ease-[var(--ease-expo)] ${hidden && !open ? "-translate-y-[130%]" : "translate-y-0"}`}
      >
        <div
          className={`relative mx-auto flex h-[58px] max-w-[1480px] items-center justify-between gap-6 rounded-full border pl-4 pr-2 transition-[background-color,border-color,box-shadow] duration-700 md:pl-5 ${
            scrolled && !open
              ? "border-line bg-[rgb(5_11_8/0.78)] shadow-[0_18px_50px_-24px_rgb(0_0_0/0.9)] backdrop-blur-xl"
              : "border-transparent bg-transparent"
          }`}
        >
          <Link href="/" className="group flex items-center gap-3" aria-label={`${site.identity.fullName}, accueil`}>
            <span
              className="relative grid h-9 w-9 place-items-center rounded-[11px] border border-line-strong bg-[linear-gradient(145deg,rgb(126_247_198/0.18),rgb(99_216_255/0.05))] font-serif text-[0.8rem] tracking-[-0.04em] text-cream shadow-[inset_0_1px_0_rgb(255_255_255/0.15),0_0_22px_-6px_rgb(126_247_198/0.6)]"
              aria-hidden="true"
            >
              AT
              <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-cognac shadow-[0_0_8px_var(--color-cognac)]" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="whitespace-nowrap font-serif text-[0.92rem] tracking-[-0.04em] sm:text-[1rem]">{site.identity.fullName}</span>
              <span className="micro mt-1 text-cream/45 max-sm:hidden">Dentisterie équine</span>
            </span>
          </Link>

          <nav aria-label="Navigation principale" className="hidden xl:block">
            <ul className="flex items-center gap-1">
              {primaryNav.map((l) => {
                const on = isActive(l.href);
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className={`label group relative flex items-center gap-2 rounded-full px-3.5 py-2 transition-colors duration-500 ${on ? "bg-[rgb(126_247_198/0.08)] text-cream" : "text-cream/65 hover:bg-[rgb(255_255_255/0.04)] hover:text-cream"}`}
                      aria-current={on ? "page" : undefined}
                    >
                      <span
                        className={`h-1 w-1 rounded-full bg-cognac transition-[opacity,transform] duration-500 ${on ? "scale-100 opacity-100 shadow-[0_0_8px_var(--color-cognac)]" : "scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-60"}`}
                        aria-hidden="true"
                      />
                      <span className="relative block overflow-hidden">
                        <span className="block transition-transform duration-500 ease-[var(--ease-expo)] group-hover:-translate-y-full">{l.label}</span>
                        <span className="absolute inset-0 block translate-y-full text-sand transition-transform duration-500 ease-[var(--ease-expo)] group-hover:translate-y-0" aria-hidden="true">
                          {l.label}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/rendez-vous" className="btn btn-filled !min-h-[44px] !px-5 !py-2.5 max-sm:!px-4" data-magnetic="0.2">
              <span className="btn-label">
                <span>
                  <span className="max-sm:hidden">Demander un </span>rendez-vous
                </span>
                <span aria-hidden="true">
                  <span className="max-sm:hidden">Demander un </span>rendez-vous
                </span>
              </span>
            </Link>
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="menu-plein-ecran"
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              className="label flex h-[44px] items-center gap-3 rounded-full border border-line-strong bg-[rgb(255_255_255/0.03)] px-4 transition-colors hover:border-cognac xl:hidden"
            >
              <span className="relative block h-2.5 w-4" aria-hidden="true">
                <span className={`absolute left-0 top-0 h-px w-full bg-cream transition-transform duration-500 ${open ? "translate-y-[5px] rotate-45" : ""}`} />
                <span className={`absolute bottom-0 left-0 h-px w-full bg-cream transition-transform duration-500 ${open ? "-translate-y-[4px] -rotate-45" : ""}`} />
              </span>
              <span className="max-sm:hidden">{open ? "Fermer" : "Menu"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Menu plein écran : une vignette par page */}
      <div ref={menuRef} id="menu-plein-ecran" role="dialog" aria-modal="true" aria-label="Menu" hidden className="fixed inset-0 z-[90] overflow-y-auto bg-ink" data-lenis-prevent>
        <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="container-x relative pb-10 pt-24 md:pt-28">
          <p className="label flex items-center gap-3 text-cream/45"><span className="status-dot" aria-hidden="true" />Navigation</p>
          <nav aria-label="Pages du site" className="mt-6">
            <ul className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4">
              {navLinks.map((l, i) => {
                const on = isActive(l.href);
                return (
                  <li key={l.href} data-menu-card>
                    <Link href={l.href} onClick={() => setOpen(false)} className="group block" aria-current={on ? "page" : undefined}>
                      <span className="relative block aspect-[4/3] overflow-hidden rounded-[16px] border border-line bg-umber">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={siteAsset(l.image)} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-[1.2s] ease-[var(--ease-expo)] group-hover:scale-[1.06]" />
                        <span className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" aria-hidden="true" />
                        <span className="label absolute left-3 top-3 tabular-nums text-cream/80">{String(i + 1).padStart(2, "0")}</span>
                        {on && <span className="micro absolute right-3 top-3 rounded-full bg-cognac px-2 py-1 text-ink">Ici</span>}
                      </span>
                      <span className="mt-3 block font-serif text-[clamp(1.35rem,2.4vw,2rem)] leading-none transition-colors group-hover:text-sand">{l.label}</span>
                      <span className="mt-1.5 block text-[0.85rem] text-cream/55">{l.sub}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="mt-12 grid gap-8 border-t border-dashed border-line-strong pt-8 md:grid-cols-3">
            <div className="overflow-hidden">
              <div data-menu-item>
                <p className="label text-cream/50">Contact</p>
                <ContactLines />
              </div>
            </div>
            <div className="overflow-hidden">
              <div data-menu-item>
                <p className="label text-cream/50">Réseaux</p>
                <ul className="mt-3 flex flex-wrap gap-3">
                  {socials.map((s) => (
                    <li key={s.id}>
                      {s.url ? (
                        <a href={s.url} target="_blank" rel="noopener noreferrer" className="label link-u">
                          {s.label}
                        </a>
                      ) : (
                        <span className="ph-tag">{s.label} — lien à renseigner</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="overflow-hidden md:text-right">
              <div data-menu-item>
                <Link href="/rendez-vous" onClick={() => setOpen(false)} className="btn btn-filled">
                  <span className="btn-label">
                    <span>Demander un rendez-vous</span>
                    <span aria-hidden="true">Demander un rendez-vous</span>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function ContactLines({ className = "mt-3" }: { className?: string }) {
  const c = site.contact;
  return (
    <ul className={`grid gap-1.5 ${className}`}>
      <li>
        {c.phone ? (
          <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="link-u body-lg">
            {c.phoneDisplay || c.phone}
          </a>
        ) : (
          SHOW_PLACEHOLDERS && <span className="ph-tag">Téléphone à renseigner</span>
        )}
      </li>
      <li>
        {c.email ? (
          <a href={`mailto:${c.email}`} className="link-u body-lg">
            {c.email}
          </a>
        ) : (
          SHOW_PLACEHOLDERS && <span className="ph-tag">E-mail à renseigner</span>
        )}
      </li>
      {site.social.instagram && (
        <li>
          <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" className="link-u body-lg">
            @{site.social.instagramHandle || "instagram"}
          </a>
        </li>
      )}
    </ul>
  );
}
