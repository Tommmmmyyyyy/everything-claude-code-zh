/**
 * Planches anatomiques de la dentition du cheval (tracés au trait, style radiographie).
 * Vue latérale gauche (tête orientée vers la gauche), viewBox 1000 × 620.
 * Repères : arcades jugales de x = 380 (106/306) à x = 668 (111/311),
 * plan d'occlusion à y = 346, ATM (articulation temporo-mandibulaire) en (846, 240).
 */
import { outline } from "./silhouettes";

export const TMJ = { x: 846, y: 240 };

/* Contour extérieur de la tête (tissus mous) */
export const HEAD_OUTLINE = outline([
  [46, 356, 1], [36, 334], [44, 306], [74, 286], [130, 268], [210, 244], [310, 214], [430, 186], [550, 160],
  [650, 138], [720, 126], [790, 118], [836, 112, 1], [846, 78], [866, 24, 1], [884, 66], [896, 110, 1],
  [912, 70], [934, 30, 1], [946, 90], [952, 132, 1], [984, 168], [1000, 220, 1], [1000, 600, 1], [930, 560],
  [902, 528], [866, 540], [800, 534], [700, 516], [560, 482], [420, 452], [300, 432], [200, 420], [130, 410],
  [78, 400], [56, 388], [76, 374, 1], [56, 368],
]);

/* Crâne (sans la mandibule) */
export const SKULL = outline([
  [80, 342, 1], [104, 318], [150, 298], [210, 282], [262, 272, 1], [300, 262, 1], [252, 250], [224, 246, 1],
  [300, 226], [420, 200], [540, 178], [620, 164], [690, 156], [760, 160], [830, 168], [890, 172], [930, 180, 1],
  [944, 206], [946, 240], [936, 268, 1], [914, 262], [906, 302, 1], [890, 270], [858, 256], [820, 262],
  [780, 276], [740, 286], [690, 300, 1], [672, 318], [668, 322, 1], [380, 322, 1], [330, 326], [240, 332],
  [150, 338], [100, 344], [86, 350, 1],
]);

/* Mandibule (groupe pivotant autour de l'ATM) */
export const MANDIBLE = outline([
  [86, 372, 1], [130, 374], [240, 378], [330, 376], [380, 370, 1], [668, 370, 1], [700, 352], [728, 318],
  [762, 258], [790, 200, 1], [812, 214], [826, 246, 1], [846, 232, 1], [870, 252], [882, 300], [886, 380],
  [874, 448], [842, 490], [780, 502], [680, 490], [580, 466], [470, 444], [360, 424], [250, 408], [150, 398],
  [100, 392], [80, 382],
]);

const UPPER_CHEEK = [380, 428, 476, 524, 572, 620]; // 106 → 111 (bord mésial)
const TOOTH_W = 46;

/** Dent jugale : couronne visible + couronne de réserve (dans l'os). */
function cheekTooth(x: number, upper: boolean, molar: boolean) {
  const w = TOOTH_W;
  const reserve = molar ? 92 : 78;
  if (upper) {
    const tilt = molar ? 6 : 0;
    return `M ${x + 3} 346 L ${x + 2 + tilt} ${322 - reserve} Q ${x + w / 2 + tilt} ${312 - reserve} ${x + w - 2 + tilt} ${322 - reserve} L ${x + w - 3} 346 Z`;
  }
  return `M ${x + 3} 346 L ${x + 4} ${370 + reserve} Q ${x + w / 2} ${380 + reserve} ${x + w - 4} ${370 + reserve} L ${x + w - 3} 346 Z`;
}

export function SkullLateral({ open = false }: { open?: boolean }) {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* ── Crâne ── */}
      <g data-skull>
        <path data-draw d={SKULL} stroke="var(--color-cream)" strokeWidth="2" fill="rgba(244,234,219,0.05)" />
        {/* Orbite (anneau osseux complet) */}
        <ellipse data-draw cx="690" cy="206" rx="44" ry="40" stroke="var(--color-cream)" strokeWidth="1.6" />
        <ellipse cx="690" cy="206" rx="30" ry="27" stroke="var(--color-cream)" strokeOpacity="0.25" strokeWidth="1" />
        {/* Arcade zygomatique et crête faciale */}
        <path data-draw d="M 700 250 C 750 254, 800 246, 846 238" stroke="var(--color-cream)" strokeWidth="1.6" />
        <path data-draw d="M 690 262 C 640 282, 580 296, 520 302" stroke="var(--color-cream)" strokeOpacity="0.7" strokeWidth="1.4" />
        {/* Foramen infra-orbitaire */}
        <ellipse cx="420" cy="262" rx="7" ry="4.5" stroke="var(--color-cream)" strokeOpacity="0.7" strokeWidth="1.2" />
        {/* Os nasal / incisif, suture */}
        <path d="M 230 250 C 300 236, 420 210, 560 186" stroke="var(--color-cream)" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="3 5" />
        {/* Sinus maxillaire (zone des racines) */}
        <path d="M 470 300 C 500 236, 600 214, 660 240" stroke="var(--color-sage)" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="2 4" />
        {/* Incisives supérieures */}
        <g data-teeth="upper-incisors" stroke="var(--color-cream)" strokeWidth="1.4">
          <path d="M 96 340 C 84 346, 72 354, 66 364 L 82 368 C 88 360, 96 352, 106 346 Z" fill="rgba(244,234,219,0.75)" />
          <path d="M 108 336 C 96 344, 86 352, 80 364 L 94 368 C 100 360, 108 352, 118 344 Z" fill="rgba(244,234,219,0.5)" />
          <path d="M 120 334 C 110 342, 100 352, 96 364 L 108 367 C 112 358, 120 350, 128 343 Z" fill="rgba(244,234,219,0.3)" />
        </g>
        {/* Canine supérieure (surtout chez les mâles) */}
        <path d="M 190 336 L 198 352 L 206 336" stroke="var(--color-cream)" strokeOpacity="0.45" strokeWidth="1.2" strokeDasharray="3 3" />
        {/* Dent de loup (PM1, 105) */}
        <path data-tooth="wolf" d="M 352 324 L 354 336 Q 360 342 366 336 L 368 324 Z" stroke="var(--color-cream)" strokeWidth="1.3" fill="rgba(244,234,219,0.75)" />
        {/* Dents jugales supérieures 106 → 111 */}
        {UPPER_CHEEK.map((x, i) => (
          <path
            key={x}
            data-tooth={i < 3 ? "premolar" : "molar"}
            d={cheekTooth(x, true, i >= 3)}
            stroke="var(--color-cream)"
            strokeWidth="1.2"
            fill="rgba(244,234,219,0.14)"
          />
        ))}
        {/* Couronnes visibles (sous la gencive) */}
        {UPPER_CHEEK.map((x) => (
          <rect key={`c${x}`} x={x + 3} y={322} width={TOOTH_W - 6} height={24} fill="rgba(244,234,219,0.62)" />
        ))}
      </g>

      {/* ── Mandibule ── */}
      <g data-mandible transform={open ? `rotate(-9 ${TMJ.x} ${TMJ.y})` : undefined}>
        <path data-draw d={MANDIBLE} stroke="var(--color-cream)" strokeWidth="2" fill="rgba(244,234,219,0.05)" />
        <path d="M 640 470 C 620 474, 600 470, 588 466" stroke="var(--color-cream)" strokeOpacity="0.4" strokeWidth="1" />
        {/* Foramen mentonnier */}
        <ellipse cx="240" cy="392" rx="6" ry="4" stroke="var(--color-cream)" strokeOpacity="0.6" strokeWidth="1.1" />
        {/* Incisives inférieures */}
        <g data-teeth="lower-incisors" stroke="var(--color-cream)" strokeWidth="1.4">
          <path d="M 100 376 C 88 372, 76 370, 68 368 L 84 366 C 92 368, 102 370, 110 372 Z" fill="rgba(244,234,219,0.75)" />
          <path d="M 102 382 C 92 376, 82 372, 74 370 L 90 366 C 98 370, 108 374, 116 378 Z" fill="rgba(244,234,219,0.45)" />
        </g>
        <path d="M 180 374 L 186 360 L 194 374" stroke="var(--color-cream)" strokeOpacity="0.45" strokeWidth="1.2" strokeDasharray="3 3" />
        {/* Dents jugales inférieures 306 → 311 */}
        {UPPER_CHEEK.map((x, i) => (
          <path
            key={x}
            data-tooth={i < 3 ? "premolar" : "molar"}
            d={cheekTooth(x, false, i >= 3)}
            stroke="var(--color-cream)"
            strokeWidth="1.2"
            fill="rgba(244,234,219,0.14)"
          />
        ))}
        {UPPER_CHEEK.map((x) => (
          <rect key={`l${x}`} x={x + 3} y={346} width={TOOTH_W - 6} height={24} fill="rgba(244,234,219,0.5)" />
        ))}
        {/* Barres (espace interdentaire inférieur) */}
        <path data-bars d="M 132 376 C 200 380, 300 380, 372 372" stroke="var(--color-sage)" strokeWidth="3" strokeOpacity="0" />
      </g>
    </g>
  );
}

/** Surlignages contextuels de la vue latérale (affichés selon la structure sélectionnée). */
export function LateralHighlights() {
  return (
    <g fill="none" pointerEvents="none">
      <g data-hl="incisives">
        <path d="M 62 330 C 70 318, 112 314, 132 332 L 126 372 C 104 380, 74 378, 58 370 Z" stroke="var(--color-cognac)" strokeWidth="2.2" strokeDasharray="5 5" />
      </g>
      <g data-hl="premolaires">
        <rect x="374" y="226" width="150" height="122" rx="10" stroke="var(--color-cognac)" strokeWidth="2.2" strokeDasharray="5 5" />
      </g>
      <g data-hl="molaires">
        <rect x="518" y="214" width="166" height="134" rx="10" stroke="var(--color-cognac)" strokeWidth="2.2" strokeDasharray="5 5" />
      </g>
      <g data-hl="tables">
        <path d="M 382 346 L 668 346" stroke="var(--color-cognac)" strokeWidth="5" strokeLinecap="round" />
      </g>
      <g data-hl="pointes">
        <path
          d="M 384 346 l 8 8 l 8 -8 l 8 8 l 8 -8 l 8 8 l 8 -8 l 8 8 l 8 -8 l 8 8 l 8 -8 l 8 8 l 8 -8 l 8 8 l 8 -8 l 8 8 l 8 -8 l 8 8 l 8 -8 l 8 8 l 8 -8 l 8 8 l 8 -8 l 8 8 l 8 -8 l 8 8 l 8 -8 l 8 8 l 8 -8 l 8 8 l 8 -8 l 8 8 l 8 -8 l 8 8 l 8 -8 l 8 8"
          stroke="var(--color-cognac)"
          strokeWidth="2"
          strokeLinejoin="miter"
        />
      </g>
      <g data-hl="surdents">
        <path d="M 380 346 L 372 362 L 388 362 Z" fill="var(--color-cognac)" />
        <path d="M 668 346 L 678 328 L 662 330 Z" fill="var(--color-cognac)" />
        <circle cx="380" cy="352" r="18" stroke="var(--color-cognac)" strokeWidth="1.6" strokeDasharray="4 4" />
        <circle cx="670" cy="340" r="18" stroke="var(--color-cognac)" strokeWidth="1.6" strokeDasharray="4 4" />
      </g>
      <g data-hl="dents-de-loup">
        <circle cx="360" cy="332" r="20" stroke="var(--color-cognac)" strokeWidth="2.2" strokeDasharray="5 5" />
      </g>
    </g>
  );
}

/** Pas-d'âne (ouvre-bouche) en place, bouche ouverte. */
export function Speculum() {
  return (
    <g data-speculum fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0">
      {/* Têtière vers la nuque */}
      <path data-draw d="M 168 322 C 360 250, 640 150, 880 112" stroke="var(--color-sand)" strokeWidth="7" strokeOpacity="0.55" />
      <path data-draw d="M 168 322 C 360 250, 640 150, 880 112" stroke="var(--color-leather)" strokeWidth="4" />
      {/* Plaque des incisives supérieures */}
      <path data-draw d="M 56 324 L 150 318 L 152 330 L 58 338 Z" stroke="var(--color-sand)" strokeWidth="2.4" fill="rgba(217,196,160,0.18)" />
      {/* Plaque des incisives inférieures */}
      <path data-draw d="M 92 486 L 190 474 L 192 488 L 96 500 Z" stroke="var(--color-sand)" strokeWidth="2.4" fill="rgba(217,196,160,0.18)" />
      {/* Montant latéral à crémaillère */}
      <path data-draw d="M 150 320 L 168 322 L 196 484 L 186 486" stroke="var(--color-sand)" strokeWidth="3.2" />
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} d={`M ${172 + i * 2.6} ${346 + i * 14} l 9 -2`} stroke="var(--color-sand)" strokeWidth="1.6" />
      ))}
      <circle cx="168" cy="322" r="5" fill="var(--color-sand)" />
      <circle cx="196" cy="484" r="5" fill="var(--color-sand)" />
    </g>
  );
}

/* ─────────────────────────────────────────────────────────────
   Vue occlusale de l'arcade supérieure (planches de détail, prestations)
   ───────────────────────────────────────────────────────────── */
export type ArchHighlight =
  | "none"
  | "incisives"
  | "premolaires"
  | "molaires"
  | "tables"
  | "pointes"
  | "surdents"
  | "dents-de-loup"
  | "caps"
  | "exam";

export function DentalArch({ highlight = "none", className = "" }: { highlight?: ArchHighlight; className?: string }) {
  const hl = (k: ArchHighlight) => highlight === k;
  const accent = "var(--color-cognac)";
  const line = "var(--color-cream)";
  const incisors = Array.from({ length: 6 }, (_, i) => {
    const a = (200 + i * 28) * (Math.PI / 180);
    const cx = Math.round((150 + Math.cos(a) * 66) * 100) / 100;
    const cy = Math.round((106 + Math.sin(a) * 58) * 100) / 100;
    const rot = Math.round(((a * 180) / Math.PI + 90) * 100) / 100;
    return { cx, cy, rot };
  });
  const rows = [0, 1, 2, 3, 4, 5].map((i) => ({ y: 196 + i * 34, dx: i * 2.4 }));
  return (
    <svg viewBox="0 0 300 420" className={className} fill="none" aria-hidden="true">
      {/* Palais */}
      <path d="M 92 160 C 90 230, 92 330, 100 400 L 200 400 C 208 330, 210 230, 208 160 C 196 128, 104 128, 92 160 Z" fill="rgba(244,234,219,0.04)" stroke={line} strokeOpacity="0.18" strokeDasharray="3 4" />
      {/* Incisives */}
      {incisors.map((t, i) => (
        <rect
          key={i}
          x={(t.cx - 12).toFixed(2)}
          y={(t.cy - 8).toFixed(2)}
          width={24}
          height={16}
          rx={6}
          transform={`rotate(${t.rot} ${t.cx} ${t.cy})`}
          stroke={hl("incisives") ? accent : line}
          strokeWidth={hl("incisives") ? 2 : 1.2}
          fill={hl("incisives") ? "rgba(192,122,67,0.35)" : "rgba(244,234,219,0.18)"}
        />
      ))}
      {/* Canines (facultatives) */}
      {[86, 214].map((x) => (
        <circle key={x} cx={x} cy={140} r={5} stroke={line} strokeOpacity="0.4" strokeDasharray="2 2" />
      ))}
      {/* Dents de loup */}
      {[98, 202].map((x) => (
        <circle
          key={x}
          cx={x}
          cy={180}
          r={hl("dents-de-loup") ? 7 : 5}
          stroke={hl("dents-de-loup") ? accent : line}
          strokeWidth={hl("dents-de-loup") ? 2 : 1.1}
          fill={hl("dents-de-loup") ? "rgba(192,122,67,0.5)" : "rgba(244,234,219,0.15)"}
        />
      ))}
      {/* Dents jugales */}
      {[-1, 1].map((side) =>
        rows.map((r, i) => {
          const cx = 150 + side * (56 + r.dx);
          const isPre = i < 3;
          const on = hl("tables") || (hl("premolaires") && isPre) || (hl("molaires") && !isPre);
          return (
            <g key={`${side}${i}`}>
              <rect
                x={cx - 18}
                y={r.y}
                width={36}
                height={31}
                rx={5}
                stroke={on ? accent : line}
                strokeWidth={on ? 2 : 1.2}
                fill={on ? "rgba(192,122,67,0.3)" : "rgba(244,234,219,0.12)"}
              />
              {/* Infundibula (replis d'émail) */}
              <ellipse cx={cx - 6} cy={r.y + 15.5} rx={4} ry={7} stroke={line} strokeOpacity="0.45" strokeWidth="1" />
              <ellipse cx={cx + 6} cy={r.y + 15.5} rx={4} ry={7} stroke={line} strokeOpacity="0.45" strokeWidth="1" />
              {hl("pointes") && (
                <path
                  d={side < 0 ? `M ${cx - 18} ${r.y + 3} l -7 6 l 7 6 l -7 6 l 7 6` : `M ${cx + 18} ${r.y + 3} l 7 6 l -7 6 l 7 6 l -7 6`}
                  stroke={accent}
                  strokeWidth="1.8"
                />
              )}
              {hl("caps") && isPre && (
                <rect x={cx - 21} y={r.y - 3} width={42} height={37} rx={7} stroke={accent} strokeWidth="1.8" strokeDasharray="4 3" />
              )}
            </g>
          );
        }),
      )}
      {hl("surdents") && (
        <g fill={accent}>
          <path d="M 76 196 l 9 -12 l 9 12 Z" />
          <path d="M 206 196 l 9 -12 l 9 12 Z" />
          <path d="M 74 395 l 9 12 l 9 -12 Z" opacity="0.6" />
          <path d="M 208 395 l 9 12 l 9 -12 Z" opacity="0.6" />
        </g>
      )}
      {hl("exam") && (
        <g data-scan>
          <rect x="40" y="40" width="220" height="2" fill={accent} opacity="0.9" />
          <rect x="40" y="42" width="220" height="40" fill="url(#scanFade)" />
          <defs>
            <linearGradient id="scanFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#7ef7c6" stopOpacity="0.3" />
              <stop offset="1" stopColor="#7ef7c6" stopOpacity="0" />
            </linearGradient>
          </defs>
        </g>
      )}
      {/* Légendes discrètes */}
      <text x="150" y="30" textAnchor="middle" fill={line} fillOpacity="0.5" fontSize="10" letterSpacing="1.5" fontFamily="var(--font-sans)">
        INCISIVES
      </text>
      <text x="150" y="414" textAnchor="middle" fill={line} fillOpacity="0.5" fontSize="10" letterSpacing="1.5" fontFamily="var(--font-sans)">
        ARCADE SUPÉRIEURE — VUE OCCLUSALE
      </text>
    </svg>
  );
}

/** Coupe transversale au niveau des dents jugales : anisognathie et pointes d'émail. */
export function CrossSection({ className = "" }: { className?: string }) {
  const line = "var(--color-cream)";
  const accent = "var(--color-cognac)";
  return (
    <svg viewBox="0 0 320 250" className={className} fill="none" aria-hidden="true">
      {/* Joues */}
      <path d="M 26 40 C 6 90, 8 160, 40 210" stroke="var(--color-sage)" strokeWidth="2" strokeOpacity="0.7" />
      <path d="M 294 40 C 314 90, 312 160, 280 210" stroke="var(--color-sage)" strokeWidth="2" strokeOpacity="0.7" />
      {/* Langue */}
      <path d="M 104 150 C 120 128, 200 128, 216 150 C 214 176, 106 176, 104 150 Z" fill="rgba(156,174,142,0.22)" stroke="var(--color-sage)" strokeOpacity="0.6" />
      {/* Dents supérieures (plus écartées) — tables inclinées */}
      <path d="M 40 30 L 96 30 L 96 112 L 40 98 Z" stroke={line} strokeWidth="1.5" fill="rgba(244,234,219,0.16)" />
      <path d="M 224 30 L 280 30 L 280 98 L 224 112 Z" stroke={line} strokeWidth="1.5" fill="rgba(244,234,219,0.16)" />
      {/* Dents inférieures (plus rapprochées) */}
      <path d="M 70 104 L 120 116 L 120 210 L 70 210 Z" stroke={line} strokeWidth="1.5" fill="rgba(244,234,219,0.1)" />
      <path d="M 200 116 L 250 104 L 250 210 L 200 210 Z" stroke={line} strokeWidth="1.5" fill="rgba(244,234,219,0.1)" />
      {/* Pointes d'émail : bord externe en haut, bord interne en bas */}
      <path d="M 40 98 L 30 106 L 40 90" stroke={accent} strokeWidth="2.2" fill="rgba(192,122,67,0.6)" />
      <path d="M 280 98 L 290 106 L 280 90" stroke={accent} strokeWidth="2.2" fill="rgba(192,122,67,0.6)" />
      <path d="M 120 116 L 130 110 L 120 126" stroke={accent} strokeWidth="2.2" fill="rgba(192,122,67,0.6)" />
      <path d="M 200 116 L 190 110 L 200 126" stroke={accent} strokeWidth="2.2" fill="rgba(192,122,67,0.6)" />
      <g fontFamily="var(--font-sans)" fontSize="9.5" letterSpacing="1.2" fill={line} fillOpacity="0.65">
        <text x="160" y="22" textAnchor="middle">MÂCHOIRE SUPÉRIEURE (PLUS LARGE)</text>
        <text x="160" y="236" textAnchor="middle">MÂCHOIRE INFÉRIEURE</text>
        <text x="160" y="156" textAnchor="middle" fillOpacity="0.8">LANGUE</text>
        <text x="8" y="128" fillOpacity="0.8">JOUE</text>
      </g>
    </svg>
  );
}

/** Profil d'une arcade avec surdents (crochet rostral, rampe caudale). */
export function HooksProfile({ className = "" }: { className?: string }) {
  const line = "var(--color-cream)";
  const accent = "var(--color-cognac)";
  const xs = [30, 74, 118, 162, 206, 250];
  return (
    <svg viewBox="0 0 320 200" className={className} fill="none" aria-hidden="true">
      {xs.map((x) => (
        <rect key={`u${x}`} x={x} y={40} width={42} height={58} rx={4} stroke={line} strokeWidth="1.3" fill="rgba(244,234,219,0.14)" />
      ))}
      {xs.map((x) => (
        <rect key={`l${x}`} x={x + 10} y={102} width={42} height={58} rx={4} stroke={line} strokeWidth="1.3" fill="rgba(244,234,219,0.1)" />
      ))}
      {/* Crochet rostral sur la première dent supérieure */}
      <path d="M 30 98 L 30 116 L 44 98 Z" fill={accent} />
      {/* Rampe caudale sur la dernière dent inférieure */}
      <path d="M 302 102 L 302 82 L 290 102 Z" fill={accent} />
      <g fontFamily="var(--font-sans)" fontSize="9.5" letterSpacing="1.2" fill={line} fillOpacity="0.65">
        <text x="30" y="30">CROCHET</text>
        <text x="300" y="186" textAnchor="end">RAMPE</text>
        <text x="160" y="196" textAnchor="middle" fillOpacity="0.45">AVANT ← → ARRIÈRE</text>
      </g>
    </svg>
  );
}

/** Vue de face des incisives et lecture des tables. */
export function IncisorsFront({ className = "" }: { className?: string }) {
  const line = "var(--color-cream)";
  const xs = [52, 92, 132, 172, 212, 252];
  return (
    <svg viewBox="0 0 320 200" className={className} fill="none" aria-hidden="true">
      <path d="M 40 40 C 100 20, 220 20, 280 40" stroke="var(--color-sage)" strokeOpacity="0.5" />
      {xs.map((x, i) => {
        const off = Math.abs(i - 2.5) * 5;
        return <rect key={`u${x}`} x={x} y={48 + off} width={34} height={50} rx={8} stroke={line} strokeWidth="1.3" fill="rgba(244,234,219,0.2)" />;
      })}
      {xs.map((x, i) => {
        const off = Math.abs(i - 2.5) * 5;
        return <rect key={`l${x}`} x={x} y={102 - off} width={34} height={50} rx={8} stroke={line} strokeWidth="1.3" fill="rgba(244,234,219,0.12)" />;
      })}
      <path d="M 44 100 C 110 106, 210 106, 290 100" stroke="var(--color-cognac)" strokeWidth="1.6" strokeDasharray="4 4" />
      <g fontFamily="var(--font-sans)" fontSize="9.5" letterSpacing="1.2" fill={line} fillOpacity="0.65">
        <text x="160" y="186" textAnchor="middle">6 INCISIVES EN HAUT, 6 EN BAS</text>
      </g>
    </svg>
  );
}

/** Dent de loup devant la première prémolaire, et position du mors. */
export function WolfToothDetail({ className = "" }: { className?: string }) {
  const line = "var(--color-cream)";
  const accent = "var(--color-cognac)";
  return (
    <svg viewBox="0 0 320 200" className={className} fill="none" aria-hidden="true">
      {/* Gencive / barre */}
      <path d="M 10 92 C 80 96, 140 96, 190 92" stroke="var(--color-sage)" strokeOpacity="0.6" strokeWidth="1.5" />
      {/* Prémolaires */}
      {[186, 236].map((x) => (
        <rect key={x} x={x} y={30} width={46} height={66} rx={5} stroke={line} strokeWidth="1.3" fill="rgba(244,234,219,0.16)" />
      ))}
      {/* Dent de loup */}
      <path d="M 154 60 L 156 92 Q 164 102 172 92 L 174 60 Q 164 52 154 60 Z" stroke={accent} strokeWidth="2" fill="rgba(192,122,67,0.45)" />
      {/* Mors (section) */}
      <circle cx="96" cy="118" r="13" stroke={line} strokeWidth="1.6" />
      <circle cx="96" cy="118" r="5" fill={line} fillOpacity="0.6" />
      <path d="M 112 112 C 130 104, 146 98, 154 94" stroke={accent} strokeWidth="1.2" strokeDasharray="3 3" />
      <g fontFamily="var(--font-sans)" fontSize="9.5" letterSpacing="1.2" fill={line} fillOpacity="0.65">
        <text x="164" y="132" textAnchor="middle">DENT DE LOUP</text>
        <text x="96" y="152" textAnchor="middle">MORS</text>
        <text x="236" y="120" textAnchor="middle">PRÉMOLAIRES</text>
      </g>
    </svg>
  );
}

/** Table dentaire d'une molaire : replis d'émail, dentine, cément. */
export function MolarTable({ className = "" }: { className?: string }) {
  const line = "var(--color-cream)";
  return (
    <svg viewBox="0 0 320 200" className={className} fill="none" aria-hidden="true">
      <rect x="90" y="30" width="140" height="130" rx="18" stroke={line} strokeWidth="1.5" fill="rgba(217,196,160,0.18)" />
      <path
        d="M 104 60 C 124 40, 150 52, 156 72 C 162 92, 140 104, 150 124 C 160 144, 190 140, 200 156 M 216 54 C 196 46, 176 60, 178 80 C 180 100, 206 108, 198 132"
        stroke="var(--color-cognac)"
        strokeWidth="1.8"
      />
      <ellipse cx="132" cy="96" rx="12" ry="22" stroke={line} strokeOpacity="0.7" strokeWidth="1.3" />
      <ellipse cx="186" cy="96" rx="12" ry="22" stroke={line} strokeOpacity="0.7" strokeWidth="1.3" />
      <g fontFamily="var(--font-sans)" fontSize="9.5" letterSpacing="1.2" fill={line} fillOpacity="0.65">
        <text x="160" y="184" textAnchor="middle">SURFACE DE MASTICATION D&apos;UNE MOLAIRE</text>
        <text x="246" y="70">ÉMAIL</text>
        <text x="20" y="100">INFUNDIBULUM</text>
      </g>
    </svg>
  );
}
