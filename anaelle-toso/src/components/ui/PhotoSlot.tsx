import Image from "next/image";
import type { Motif } from "@/lib/content";
import { HORSE_FAR_LEGS, HORSE_GRAZING, HORSE_HEAD_DOOR, HORSE_STANDING, PERSON } from "@/components/illustrations/silhouettes";
import { Van } from "@/components/illustrations/Van";
import { SHOW_PLACEHOLDERS } from "@/lib/config";

/** Illustration duotone servant de fond aux emplacements photo. */
export function MotifArt({ motif, id }: { motif: Motif | string; id: string }) {
  const tone = "rgba(244,234,219,0.16)";
  const tone2 = "rgba(244,234,219,0.09)";
  switch (motif) {
    case "truck":
      return (
        <div className="absolute inset-x-[8%] bottom-[14%] aspect-[640/300] opacity-30 grayscale">
          <Van idSuffix={id} />
        </div>
      );
    case "stable":
      return (
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <rect x="60" y="60" width="280" height="240" fill={tone2} />
          <rect x="80" y="80" width="240" height="90" fill="rgba(13,10,7,0.5)" />
          <g transform="translate(150 70) scale(0.6)">
            <path d={HORSE_HEAD_DOOR} fill={tone} />
          </g>
          <rect x="80" y="170" width="240" height="130" fill={tone2} />
          <path d="M 90 180 L 310 290 M 310 180 L 90 290" stroke={tone} strokeWidth="6" />
        </svg>
      );
    case "tools":
      return (
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true" fill="none">
          <g stroke={tone} strokeWidth="7" strokeLinecap="round">
            <path d="M 70 220 L 300 90" />
            <path d="M 300 90 L 336 70" strokeWidth="16" />
          </g>
          <g stroke={tone} strokeWidth="4" strokeLinecap="round">
            <path d="M 90 120 L 250 240" />
            <circle cx="260" cy="248" r="16" />
          </g>
          <rect x="120" y="40" width="150" height="40" rx="8" stroke={tone2} strokeWidth="4" />
        </svg>
      );
    case "pasture":
      return (
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <path d="M 0 230 C 120 210, 260 216, 400 200 L 400 300 L 0 300 Z" fill={tone2} />
          <g transform="translate(110 236) scale(0.2) translate(0 -680)">
            <path d={HORSE_FAR_LEGS} fill={tone} />
            <path d={HORSE_GRAZING} fill={tone} />
          </g>
          <circle cx="320" cy="150" r="46" fill={tone2} />
          <rect x="316" y="180" width="8" height="40" fill={tone2} />
        </svg>
      );
    case "road":
      return (
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <path d="M 0 250 L 400 250 L 400 300 L 0 300 Z" fill={tone2} />
          {[40, 100, 160, 220, 280, 340].map((x) => (
            <path key={x} d={`M ${x} 240 C ${x + 14} 200, ${x + 14} 160, ${x} 120 C ${x - 14} 160, ${x - 14} 200, ${x} 240 Z`} fill={tone2} />
          ))}
          <path d="M 0 276 H 400" stroke={tone} strokeWidth="3" strokeDasharray="22 26" />
        </svg>
      );
    case "intervention":
    case "portrait":
      return (
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <g transform={motif === "portrait" ? "translate(150 40) scale(0.5)" : "translate(96 92) scale(0.4)"}>
            <path d={PERSON} fill={tone} />
          </g>
          {motif === "intervention" && (
            <g transform="translate(400 300) scale(-0.42 0.42) translate(0 -700)">
              <path d={HORSE_STANDING} fill={tone2} />
            </g>
          )}
        </svg>
      );
    case "horse":
    default:
      return (
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <g transform="translate(80 40) scale(0.9)">
            <path d={HORSE_HEAD_DOOR} fill={tone} />
          </g>
        </svg>
      );
  }
}

interface Props {
  src: string | null;
  alt: string;
  motif?: Motif | string;
  hint?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  label?: string;
  innerProps?: Record<string, string>;
}

/**
 * Photo ou emplacement réservé clairement identifié.
 * Dès qu'un chemin d'image est renseigné dans le contenu, la vraie photo remplace l'emplacement.
 */
export function PhotoSlot({ src, alt, motif = "horse", hint, sizes = "(min-width: 768px) 50vw, 100vw", priority, className = "", label = "Emplacement photo", innerProps }: Props) {
  const pos = /\b(absolute|fixed)\b/.test(className) ? "" : "relative";
  if (src) {
    return (
      <div className={`${pos} overflow-hidden bg-umber ${className}`}>
        <div className="absolute inset-0" {...innerProps}>
          <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
        </div>
      </div>
    );
  }
  const id = (hint || motif || "x").replace(/[^a-z0-9]/gi, "").slice(0, 16) + String(hint?.length ?? 0);
  return (
    <div className={`${pos} overflow-hidden ${className}`} role="img" aria-label={`${label}${hint ? ` : ${hint}` : ""}`}>
      <div className="absolute inset-0" {...innerProps}>
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 30% 20%, #2a3b2d, #121c15 55%, #0d0a07)" }} />
        <MotifArt motif={motif} id={id} />
      </div>
      {/* Repères de cadrage */}
      <div className="pointer-events-none absolute inset-3 md:inset-4" aria-hidden="true">
        {["left-0 top-0 border-l border-t", "right-0 top-0 border-r border-t", "bottom-0 left-0 border-b border-l", "bottom-0 right-0 border-b border-r"].map((c) => (
          <span key={c} className={`absolute h-4 w-4 border-cream/40 ${c}`} />
        ))}
      </div>
      {SHOW_PLACEHOLDERS && (
        <div className="absolute inset-x-5 bottom-5 flex flex-col items-start gap-2 md:inset-x-6 md:bottom-6">
          <span className="ph-tag">{label}</span>
          {hint && <span className="text-[0.8rem] leading-snug text-cream/60">{hint}</span>}
        </div>
      )}
    </div>
  );
}
