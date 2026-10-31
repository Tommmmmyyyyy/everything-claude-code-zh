"use client";

import { useState } from "react";
import type { FaqContent } from "@/lib/content";
import { SectionHeader, ProvisionalTag } from "@/components/ui/SectionHeader";
import { SHOW_PLACEHOLDERS } from "@/lib/config";

export function Faq({ content }: { content: FaqContent }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" aria-labelledby="faq-title" className="relative section-y bg-ink">
      <SectionHeader index="14" label="Questions fréquentes" title={content.title} titleId="faq-title" align="left" />

      <div className="container-x mt-14 grid gap-6 md:mt-20 md:grid-cols-12">
        <div className="md:col-span-3">
          <p className="label text-cream/45 md:sticky md:top-[calc(var(--header-h)+40px)]">
            {content.items.length} questions
          </p>
        </div>
        <ul className="md:col-span-9">
          {content.items.map((it, i) => {
            const isOpen = open === i;
            const answer = it.a.replace(/^\[[^\]]+\]\s*/, "");
            return (
              <li key={it.q} className="relative">
                <span className="rule-dashed absolute inset-x-0 top-0" aria-hidden="true" />
                <h3>
                  <button
                    type="button"
                    id={`faq-q-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="group grid w-full grid-cols-[1fr_auto] items-center gap-6 py-6 text-left md:py-7"
                  >
                    <span className="font-serif text-[clamp(1.4rem,2.3vw,2.2rem)] leading-[1.08] transition-transform duration-700 ease-[var(--ease-expo)] group-hover:translate-x-2">
                      {it.q}
                    </span>
                    <span className="relative h-9 w-9 rounded-full border border-line-strong transition-colors group-hover:border-cream" aria-hidden="true">
                      <span className="absolute left-1/2 top-1/2 h-px w-3.5 -translate-x-1/2 -translate-y-1/2 bg-cream" />
                      <span className={`absolute left-1/2 top-1/2 h-3.5 w-px -translate-x-1/2 -translate-y-1/2 bg-cream transition-transform duration-500 ${isOpen ? "scale-y-0" : ""}`} />
                    </span>
                  </button>
                </h3>
                <div
                  id={`faq-a-${i}`}
                  role="region"
                  aria-labelledby={`faq-q-${i}`}
                  className={`grid transition-[grid-template-rows] duration-700 ease-[var(--ease-expo)] ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                >
                  <div className="overflow-hidden">
                    <div className="max-w-3xl pb-8">
                      {it.provisional && SHOW_PLACEHOLDERS && (
                        <div className="mb-3">
                          <ProvisionalTag>Réponse à confirmer</ProvisionalTag>
                        </div>
                      )}
                      <p className="body-lg text-cream/75">{answer}</p>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
          <li className="rule-dashed" aria-hidden="true" />
        </ul>
      </div>
    </section>
  );
}
