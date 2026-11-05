import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/Button";

interface Props {
  index: string;
  title: ReactNode;
  text: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
}

/** Appel à l'action de fin de page. */
export function PageCta({ index, title, text, primary, secondary }: Props) {
  return (
    <section aria-label="Pour aller plus loin" className="relative overflow-hidden bg-forest">
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at 80% 100%, rgba(192,122,67,0.22), transparent 60%)" }} aria-hidden="true" />
      <div className="container-x relative grid gap-10 py-24 md:grid-cols-12 md:items-end md:gap-6 md:py-36">
        <div className="md:col-span-7">
          <div className="flex items-center gap-4">
            <span className="label inline-flex h-6 items-center rounded-full border border-line-strong px-2.5 tabular-nums text-sand">{index}</span>
            <span className="label">Et maintenant</span>
            <span className="relative h-px max-w-[200px] flex-1 bg-line" aria-hidden="true"><span className="absolute inset-0 origin-left bg-[linear-gradient(90deg,var(--color-cognac),transparent_70%)] opacity-70" data-reveal="line" /></span>
          </div>
          <p className="display mt-8 max-w-[11ch]" data-reveal="lines">
            {title}
          </p>
        </div>
        <div className="md:col-span-4 md:col-start-9">
          <p className="body-lg text-cream/75" data-reveal="up">
            {text}
          </p>
          <div className="mt-8 flex flex-wrap gap-3" data-reveal="up" data-delay="0.1">
            <ButtonLink href={primary.href} variant="cream">
              {primary.label}
            </ButtonLink>
            {secondary && (
              <ButtonLink href={secondary.href} variant="ghost" icon={false}>
                {secondary.label}
              </ButtonLink>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
