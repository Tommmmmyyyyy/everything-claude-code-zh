"use client";

import { useMemo, useState } from "react";
import type { SignsContent } from "@/lib/content";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ButtonLink } from "@/components/ui/Button";

/* Pictogrammes au trait (viewBox 120 × 120) */
const ICONS: Record<string, React.ReactNode> = {
  chew: (
    <>
      <path d="M 20 70 C 20 40, 44 24, 70 26 C 92 28, 104 44, 102 62 L 98 80 C 96 90, 88 96, 76 96 L 40 96 C 28 96, 20 86, 20 70 Z" />
      <path d="M 38 66 h 44 M 38 76 h 44" strokeDasharray="5 5" className="animate-[chew_1.2s_ease-in-out_infinite]" />
      <path d="M 8 50 c 4 -6 4 -12 0 -18 M 112 50 c -4 -6 -4 -12 0 -18" />
    </>
  ),
  "drop-food": (
    <>
      <path d="M 18 40 C 30 26, 64 22, 86 30 C 100 36, 104 50, 98 58 L 70 60 C 60 60, 52 66, 40 66 C 26 66, 14 54, 18 40 Z" />
      <path d="M 54 74 l 4 10 M 66 80 l -3 12 M 46 88 l 6 8" className="animate-[fall_1.8s_ease-in_infinite]" />
      <path d="M 30 108 h 60" strokeDasharray="3 6" />
    </>
  ),
  condition: (
    <>
      <path d="M 16 70 C 16 52, 30 44, 50 44 L 80 44 C 96 44, 106 54, 104 68 C 102 80, 90 84, 80 84 L 40 84 C 26 84, 16 80, 16 70 Z" />
      <path d="M 44 50 v 28 M 54 48 v 32 M 64 48 v 32 M 74 50 v 28" strokeOpacity="0.5" />
      <path d="M 60 100 v 14 M 52 106 l 8 8 8 -8" />
    </>
  ),
  bit: (
    <>
      <circle cx="22" cy="60" r="14" />
      <circle cx="98" cy="60" r="14" />
      <path d="M 36 60 h 18 l 6 -6 6 6 h 18" />
      <path d="M 50 36 l 6 8 M 70 36 l -6 8 M 60 30 v 10" className="animate-[pulse-soft_1.6s_ease-in-out_infinite]" />
    </>
  ),
  saliva: (
    <>
      <path d="M 20 44 C 34 30, 70 28, 94 36 C 104 40, 106 52, 98 58 C 82 64, 46 64, 30 60" />
      <path d="M 48 64 c 0 8 -6 12 -6 18 a 6 6 0 0 0 12 0 c 0 -6 -6 -10 -6 -18 Z" className="animate-[drip_2s_ease-in_infinite]" />
      <path d="M 70 62 c 0 6 -4 9 -4 13 a 4 4 0 0 0 8 0 c 0 -4 -4 -7 -4 -13 Z" className="animate-[drip_2s_0.6s_ease-in_infinite]" />
    </>
  ),
  breath: (
    <>
      <path d="M 14 50 C 26 36, 52 34, 66 42 C 74 46, 74 58, 66 62 C 52 68, 26 66, 14 50 Z" />
      <path d="M 80 40 c 8 4 8 10 0 14 c -8 4 -8 10 0 14 M 92 34 c 10 5 10 13 0 18 c -10 5 -10 13 0 18 M 104 42 c 6 3 6 8 0 11" className="animate-[pulse-soft_2s_ease-in-out_infinite]" />
    </>
  ),
  fibers: (
    <>
      <ellipse cx="60" cy="78" rx="40" ry="22" />
      <path d="M 30 70 C 50 60, 70 90, 96 66 M 26 84 C 46 74, 74 98, 94 82 M 40 60 l 30 36" strokeOpacity="0.7" />
      <path d="M 36 30 l 6 10 M 60 24 v 12 M 84 30 l -6 10" strokeOpacity="0.6" />
    </>
  ),
};

export function Signs({ content, index = "08" }: { content: SignsContent; index?: string }) {
  const [active, setActive] = useState(content.items[0].id);
  const [checked, setChecked] = useState<string[]>([]);
  const current = content.items.find((i) => i.id === active)!;

  const verdict = useMemo(() => {
    if (checked.length === 0) return null;
    return checked.length === 1
      ? "Ce signe peut avoir une origine dentaire. Un contrôle de la bouche permet de faire le point et d'agir tôt."
      : `${checked.length} signes observés : un contrôle dentaire est conseillé. Plus il a lieu tôt, plus les soins sont simples.`;
  }, [checked]);

  const toggle = (id: string) => setChecked((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  return (
    <section id="signes" aria-labelledby="signes-title" className="relative section-y bg-forest">
      <SectionHeader index={index} label="Signes à surveiller" title={content.title} intro={content.intro} titleId="signes-title" />

      <div className="container-x mt-16 grid gap-12 md:mt-24 md:grid-cols-12 md:gap-6">
        <fieldset className="md:col-span-7">
          <legend className="label mb-6 text-cream/55">Cochez ce que vous observez chez votre cheval</legend>
          <ul>
            {content.items.map((s, i) => {
              const on = checked.includes(s.id);
              return (
                <li key={s.id} className="relative" onPointerEnter={() => setActive(s.id)} data-reveal="up" data-delay={String(i * 0.04)}>
                  <span className="rule-dashed absolute inset-x-0 top-0" aria-hidden="true" />
                  <label className="group grid cursor-pointer grid-cols-[2rem_1fr_auto] items-start gap-4 py-5 md:py-6" onFocus={() => setActive(s.id)}>
                    <span className="label pt-2 tabular-nums text-cream/40">{String(i + 1).padStart(2, "0")}</span>
                    <span>
                      <span className={`block font-serif text-[clamp(1.5rem,2.6vw,2.4rem)] leading-[1.02] transition-colors ${on ? "text-sand" : ""}`}>{s.title}</span>
                      <span className="mt-2 block max-w-lg text-[0.95rem] leading-relaxed text-cream/60 md:hidden">{s.text}</span>
                    </span>
                    <span className="flex items-center gap-3 pt-1.5">
                      <span className="label hidden text-cream/45 sm:inline">{on ? "Observé" : "Je l'observe"}</span>
                      <input type="checkbox" className="peer sr-only" checked={on} onChange={() => toggle(s.id)} />
                      <span
                        className={`grid h-7 w-7 place-items-center rounded-full border transition-colors duration-300 peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-cream ${
                          on ? "border-sand bg-sand text-ink" : "border-line-strong group-hover:border-cream"
                        }`}
                        aria-hidden="true"
                      >
                        <svg viewBox="0 0 12 12" className={`h-3 w-3 transition-transform duration-300 ${on ? "scale-100" : "scale-0"}`} fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M 2 6.5 L 5 9 L 10 3" />
                        </svg>
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
            <li className="rule-dashed" aria-hidden="true" />
          </ul>
        </fieldset>

        <div className="md:col-span-4 md:col-start-9">
          <div className="md:sticky md:top-[calc(var(--header-h)+32px)]">
            <div className="hidden rounded-[18px] border border-line p-6 md:block">
              <div key={current.id} className="animate-[fadeup_0.6s_var(--ease-expo)]">
                <svg viewBox="0 0 120 120" className="h-28 w-28 text-sand" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {ICONS[current.icon]}
                </svg>
                <h3 className="heading-sm mt-6">{current.title}</h3>
                <p className="body mt-3 text-cream/70">{current.text}</p>
              </div>
            </div>

            <div className="mt-4 rounded-[18px] bg-ink/60 p-6" aria-live="polite">
              <p className="label text-cream/50">Votre observation</p>
              {verdict ? (
                <>
                  <p className="mt-3 text-[1.05rem] leading-relaxed text-cream/90">{verdict}</p>
                  <div className="mt-5">
                    <ButtonLink href="/rendez-vous" variant="ghost">
                      Demander un contrôle
                    </ButtonLink>
                  </div>
                </>
              ) : (
                <p className="mt-3 text-cream/60">Cochez les signes que vous observez : une orientation s&apos;affiche ici.</p>
              )}
            </div>

            <p className="mt-4 flex gap-3 text-[0.85rem] leading-relaxed text-cream/55">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-cognac text-[11px] text-cognac" aria-hidden="true">
                !
              </span>
              <span>{content.disclaimer}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
