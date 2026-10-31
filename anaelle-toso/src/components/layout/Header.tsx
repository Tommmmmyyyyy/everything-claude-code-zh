"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { lockScroll } from "@/lib/lenis";
import { navLinks, primaryNav, site, socialLinks } from "@/lib/content";
import { SHOW_PLACEHOLDERS } from "@/lib/config";

export function Header() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("");
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const home = pathname === "/";

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

  /* Section active (indicateur pointillé) */
  useEffect(() => {
    if (!home) return;
    const ids = primaryNav.map((l) => l.href.split("#")[1]);
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [home]);

  /* Menu plein écran : animation, verrouillage, Échap, piège de focus */
  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;
    const reduce = prefersReducedMotion();
    if (open) {
      lockScroll(true);
      menu.hidden = false;
      const items = menu.querySelectorAll("[data-menu-item]");
      gsap.fromTo(menu, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: reduce ? 0 : 0.9, ease: "expo.inOut" });
      gsap.fromTo(items, { yPercent: 110 }, { yPercent: 0, duration: reduce ? 0 : 1, stagger: 0.04, delay: reduce ? 0 : 0.35, ease: "expo.out" });
      const first = menu.querySelector<HTMLElement>("a, button");
      first?.focus();
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
      toggleRef.current?.focus();
    }
  }, [open]);

  const socials = socialLinks().filter((s) => s.url || SHOW_PLACEHOLDERS);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[100] transition-transform duration-700 ease-[var(--ease-expo)] ${
          hidden && !open ? "-translate-y-full" : "translate-y-0"
        }`}
        style={{ ["--header-h" as string]: "72px" }}
      >
        <div
          className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${scrolled && !open ? "opacity-100" : "opacity-0"}`}
          style={{ background: "linear-gradient(to bottom, rgba(13,10,7,0.85), rgba(13,10,7,0))" }}
          aria-hidden="true"
        />
        <div className="container-x relative flex h-[72px] items-center justify-between gap-6">
          <Link href="/#accueil" className="label flex items-baseline gap-2" aria-label={`${site.identity.fullName}, retour à l'accueil`}>
            <span className="font-serif text-[1.35rem] normal-case tracking-normal">{site.identity.fullName}</span>
            <span className="hidden text-cream/50 lg:inline">— Dentisterie équine</span>
          </Link>

          <nav aria-label="Navigation principale" className="hidden md:block">
            <ul className="flex items-center gap-7">
              {primaryNav.map((l) => {
                const id = l.href.split("#")[1];
                const isActive = home && active === id;
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="label relative py-2 text-cream/80 transition-colors hover:text-cream"
                      aria-current={isActive ? "true" : undefined}
                    >
                      {l.label}
                      <span
                        className={`absolute inset-x-0 -bottom-0.5 h-px transition-opacity duration-500 ${isActive ? "opacity-100" : "opacity-0"}`}
                        style={{
                          backgroundImage: "linear-gradient(to right, var(--color-cream) 50%, transparent 0)",
                          backgroundSize: "6px 1px",
                        }}
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/#rendez-vous" className="btn btn-filled !min-h-[40px] !px-5 !py-2.5 max-sm:!px-4" data-magnetic="0.2">
              <span className="btn-label">
                <span>Rendez-vous</span>
                <span aria-hidden="true">Rendez-vous</span>
              </span>
            </Link>
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="menu-plein-ecran"
              className="label flex h-10 items-center gap-3 rounded-[22.5px] border border-line-strong px-4 transition-colors hover:border-cream"
            >
              <span className="relative block h-2.5 w-4" aria-hidden="true">
                <span className={`absolute left-0 top-0 h-px w-full bg-cream transition-transform duration-500 ${open ? "translate-y-[5px] rotate-45" : ""}`} />
                <span className={`absolute bottom-0 left-0 h-px w-full bg-cream transition-transform duration-500 ${open ? "-translate-y-[4px] -rotate-45" : ""}`} />
              </span>
              <span>{open ? "Fermer" : "Menu"}</span>
            </button>
          </div>
        </div>
      </header>

      <div
        ref={menuRef}
        id="menu-plein-ecran"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        hidden
        className="fixed inset-0 z-[90] overflow-y-auto bg-forest"
        data-lenis-prevent
      >
        <div className="container-x flex min-h-full flex-col justify-between gap-12 pb-10 pt-28">
          <nav aria-label="Menu complet">
            <ol className="grid gap-1 md:grid-cols-2 md:gap-x-16">
              {navLinks.map((l, i) => (
                <li key={l.href} className="overflow-hidden border-b border-dashed border-line-strong">
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    data-menu-item
                    className="group flex items-baseline gap-5 py-3 md:py-4"
                  >
                    <span className="label tabular-nums text-cream/40">{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-serif text-[clamp(2rem,4.6vw,3.8rem)] leading-none transition-transform duration-700 ease-[var(--ease-expo)] group-hover:translate-x-3">
                      {l.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
          <div className="grid gap-8 md:grid-cols-3">
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
                <Link href="/#rendez-vous" onClick={() => setOpen(false)} className="btn btn-cream">
                  <span className="btn-label">
                    <span>Prendre rendez-vous</span>
                    <span aria-hidden="true">Prendre rendez-vous</span>
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
    </ul>
  );
}
