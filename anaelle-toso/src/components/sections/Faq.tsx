"use client";

import { useState } from "react";
import type { FaqContent } from "@/lib/content";
import { ProvisionalTag } from "@/components/ui/SectionHeader";
import { SHOW_PLACEHOLDERS } from "@/lib/config";

/** FAQ par catégories, en accordéons animés. */
export function Faq({ content }: { content: FaqContent }) {
  const [open, setOpen] = useState<string | null>(content.items[0]?.q ?? null);
  const groups = content.categories
    .map((c) => ({ ...c, items: content.items.filter((i) => i.category === c.id) }))
    .filter((g) => g.items.length);

  return (
    <section id="faq" aria-label="Questions fréquentes" className="relative section-y bg-ink">
      <div className="container-x grid gap-10 md:grid-cols-12 md:gap-6">
        <nav aria-label="Catégories" className="md:col-span-3">
          <div className="md:sticky md:top-[calc(var(--header-h)+40px)]">
            <p className="label text-cream/45">Catégories</p>
            <ol className="-mx-[var(--gutter)] mt-5 flex gap-2 overflow-x-auto px-[var(--gutter)] pb-1 [scrollbar-width:none] md:mx-0 md:grid md:gap-1 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden" data-lenis-prevent>
              {groups.map((g, i) => (
                <li key={g.id}>
                  <a href={`#faq-${g.id}`} className="group flex shrink-0 items-baseline gap-3 whitespace-nowrap rounded-[22.5px] border border-line-strong px-3.5 py-2 text-cream/70 transition-colors hover:text-cream md:shrink md:whitespace-normal md:rounded-none md:border-0 md:px-0 md:py-1.5">
                    <span className="label tabular-nums text-cream/35 max-md:hidden">{String(i + 1).padStart(2, "0")}</span>
                    <span className="link-u max-md:label">{g.label}</span>
                    <span className="micro text-cream/35 max-md:hidden">{g.items.length}</span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        <div className="grid gap-20 md:col-span-9">
          {groups.map((g, gi) => (
            <div key={g.id} id={`faq-${g.id}`} className="scroll-mt-28">
              <div className="flex items-baseline gap-4" data-reveal="up">
                <span className="font-serif text-[3rem] leading-none text-sand/35">{String(gi + 1).padStart(2, "0")}</span>
                <h2 className="heading-sm">{g.label}</h2>
              </div>
              <ul className="mt-6">
                {g.items.map((it) => {
                  const isOpen = open === it.q;
                  const id = `${g.id}-${g.items.indexOf(it)}`;
                  return (
                    <li key={it.q} className="relative">
                      <span className="rule-dashed absolute inset-x-0 top-0" aria-hidden="true" />
                      <h3>
                        <button
                          type="button"
                          id={`faq-q-${id}`}
                          aria-expanded={isOpen}
                          aria-controls={`faq-a-${id}`}
                          onClick={() => setOpen(isOpen ? null : it.q)}
                          className="group grid w-full grid-cols-[1fr_auto] items-center gap-6 py-6 text-left"
                        >
                          <span className={`font-serif text-[clamp(1.35rem,2.1vw,2rem)] leading-[1.08] transition-[transform,color] duration-700 ease-[var(--ease-expo)] group-hover:translate-x-2 ${isOpen ? "text-sand" : ""}`}>{it.q}</span>
                          <span className={`relative h-9 w-9 rounded-full border transition-[transform,border-color,background-color] duration-500 ease-[var(--ease-expo)] ${isOpen ? "rotate-45 border-sand bg-sand/10" : "border-line-strong group-hover:border-cream"}`} aria-hidden="true">
                            <span className="absolute left-1/2 top-1/2 h-px w-3.5 -translate-x-1/2 -translate-y-1/2 bg-cream" />
                            <span className="absolute left-1/2 top-1/2 h-3.5 w-px -translate-x-1/2 -translate-y-1/2 bg-cream" />
                          </span>
                        </button>
                      </h3>
                      <div id={`faq-a-${id}`} role="region" aria-labelledby={`faq-q-${id}`} className={`grid transition-[grid-template-rows,opacity] duration-700 ease-[var(--ease-expo)] ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                        <div className="overflow-hidden">
                          <div className={`max-w-3xl pb-8 transition-transform duration-700 ease-[var(--ease-expo)] ${isOpen ? "translate-y-0" : "-translate-y-3"}`}>
                            {it.provisional && SHOW_PLACEHOLDERS && (
                              <div className="mb-3">
                                <ProvisionalTag>Réponse à confirmer</ProvisionalTag>
                              </div>
                            )}
                            <p className="body-lg text-cream/75">{it.a.replace(/^\[[^\]]+\]\s*/, "")}</p>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
                <li className="rule-dashed" aria-hidden="true" />
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
