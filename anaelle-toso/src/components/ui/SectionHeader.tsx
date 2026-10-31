import type { ReactNode } from "react";
import { SHOW_PLACEHOLDERS } from "@/lib/config";

interface Props {
  index: string;
  label: string;
  title: ReactNode;
  intro?: ReactNode;
  provisional?: boolean;
  align?: "left" | "split";
  className?: string;
  titleId?: string;
}

/** En-tête éditorial : index « (03) », étiquette, filet pointillé, grand titre serif. */
export function SectionHeader({ index, label, title, intro, provisional, align = "split", className = "", titleId }: Props) {
  return (
    <header className={`container-x ${className}`}>
      <div className="flex items-center gap-4">
        <span className="label tabular-nums text-cream/50">({index})</span>
        <span className="label">{label}</span>
        <span className="rule-dashed flex-1" data-reveal="line" aria-hidden="true" />
        {provisional && SHOW_PLACEHOLDERS && <ProvisionalTag />}
      </div>
      <div className={align === "split" ? "mt-10 grid gap-8 md:mt-14 md:grid-cols-12 md:gap-6" : "mt-10 md:mt-14"}>
        <h2 id={titleId} className={`heading ${align === "split" ? "md:col-span-7" : "max-w-5xl"}`} data-reveal="lines">
          {title}
        </h2>
        {intro && (
          <div className={align === "split" ? "md:col-span-4 md:col-start-9 md:self-end" : "mt-8 max-w-xl"}>
            <p className="body text-cream/70" data-reveal="up" data-delay="0.15">
              {intro}
            </p>
          </div>
        )}
      </div>
    </header>
  );
}

export function ProvisionalTag({ children = "Contenu à valider" }: { children?: ReactNode }) {
  return (
    <span className="ph-tag" title="Contenu provisoire : à valider avant la mise en ligne">
      <span aria-hidden="true">✦</span>
      {children}
    </span>
  );
}

/** Texte provisoire : affiché en italique avec une étiquette, identifiable au premier coup d'œil. */
export function ProvisionalText({ text, className = "" }: { text: string; className?: string }) {
  const m = text.match(/^\[([^\]]+)\]\s*(.*)$/s);
  if (!m) return <span className={className}>{text}</span>;
  return (
    <span className={className}>
      {SHOW_PLACEHOLDERS && (
        <>
          <span className="ph-tag align-middle">{m[1]}</span>{" "}
        </>
      )}
      <span className="ph-text">{m[2]}</span>
    </span>
  );
}

export function isProvisional(text: string | null | undefined) {
  return !!text && /^\[[^\]]+\]/.test(text);
}
