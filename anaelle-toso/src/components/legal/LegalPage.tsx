import type { ReactNode } from "react";

/** Gabarit éditorial des pages légales. */
export function LegalPage({ title, updated, children }: { title: string; updated: string | null; children: ReactNode }) {
  return (
    <article className="container-x pb-32 pt-[calc(var(--header-h)+10vh)]">
      <p className="label text-cream/50">Informations légales</p>
      <h1 className="display mt-8 max-w-4xl">{title}</h1>
      <p className="label mt-8 text-cream/45">Dernière mise à jour : {updated ?? <span className="ph-tag">date à renseigner</span>}</p>
      <div className="legal mt-16 grid max-w-3xl gap-12">{children}</div>
    </article>
  );
}

export function LegalBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-dashed border-line-strong pt-6">
      <h2 className="heading-sm">{title}</h2>
      <div className="mt-5 grid gap-4 text-[1.02rem] leading-relaxed text-cream/75 [&_a]:underline [&_a]:underline-offset-4">{children}</div>
    </section>
  );
}

/** Valeur ou emplacement à renseigner. */
export function V({ value, label }: { value: string | null | undefined; label: string }) {
  return value ? <>{value}</> : <span className="ph-tag">{label} à renseigner</span>;
}
