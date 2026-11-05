/**
 * Éléments de décor composables (à placer dans un <svg>) : arbres, haies, clôtures,
 * bâtiments, boxes d'écurie, lampes. Coordonnées en unités du monde ; y = ligne de sol.
 */
import { canopy, rng } from "@/lib/svg";
import { HORSE_HEAD_DOOR, HORSE_STANDING, HORSE_GRAZING, HORSE_FAR_LEGS, PERSON } from "./silhouettes";

export function Oak({ x, y, h, fill, seed = 1 }: { x: number; y: number; h: number; fill: string; seed?: number }) {
  const r = h * 0.36;
  const discs = canopy(x, y - h + r * 0.95, r, seed, 10);
  return (
    <g fill={fill}>
      <path d={`M ${x - h * 0.035} ${y} L ${x - h * 0.02} ${y - h * 0.45} L ${x + h * 0.02} ${y - h * 0.45} L ${x + h * 0.04} ${y} Z`} />
      {discs.map((d, i) => (
        <circle key={i} cx={d.cx} cy={d.cy} r={d.r} />
      ))}
    </g>
  );
}

export function Poplar({ x, y, h, fill }: { x: number; y: number; h: number; fill: string }) {
  const w = h * 0.13;
  return (
    <g fill={fill}>
      <rect x={x - 2} y={y - h * 0.18} width={4} height={h * 0.18} />
      <path
        d={`M ${x} ${y - h} C ${x + w * 0.9} ${y - h * 0.8}, ${x + w * 1.05} ${y - h * 0.35}, ${x + w * 0.4} ${y - h * 0.12} L ${x - w * 0.4} ${y - h * 0.12} C ${x - w * 1.05} ${y - h * 0.35}, ${x - w * 0.9} ${y - h * 0.8}, ${x} ${y - h} Z`}
      />
    </g>
  );
}

export function Hedge({ x, y, w, h, fill, seed = 2 }: { x: number; y: number; w: number; h: number; fill: string; seed?: number }) {
  const rand = rng(seed);
  const n = Math.max(3, Math.round(w / (h * 0.9)));
  const items = Array.from({ length: n }, (_, i) => {
    const cx = x + (i + 0.5) * (w / n);
    const r = h * (0.55 + rand() * 0.35);
    return <circle key={i} cx={cx} cy={y - r * 0.8} r={r} />;
  });
  return (
    <g fill={fill}>
      <rect x={x} y={y - h * 0.5} width={w} height={h * 0.5} />
      {items}
    </g>
  );
}

export function Farmhouse({ x, y, s = 1, fill, light }: { x: number; y: number; s?: number; fill: string; light?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill}>
      <path d="M 0 0 L 0 -70 L 60 -120 L 120 -70 L 120 0 Z" />
      <path d="M 110 0 L 110 -52 L 200 -52 L 200 0 Z" />
      <path d="M 104 -52 L 156 -86 L 206 -52 Z" />
      <rect x="80" y="-128" width="12" height="30" />
      {light && (
        <>
          <rect x="22" y="-48" width="14" height="18" fill={light} />
          <rect x="140" y="-34" width="12" height="14" fill={light} opacity="0.8" />
        </>
      )}
    </g>
  );
}

export function Church({ x, y, s = 1, fill }: { x: number; y: number; s?: number; fill: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill}>
      <path d="M 0 0 L 0 -60 L 50 -95 L 100 -60 L 100 0 Z" />
      <path d="M 100 0 L 100 -110 L 130 -110 L 130 0 Z" />
      <path d="M 96 -110 L 115 -200 L 134 -110 Z" />
      <rect x="114" y="-216" width="2" height="18" />
      <rect x="109" y="-210" width="12" height="2" />
    </g>
  );
}

/** Clôture à lisses (piquets + deux lisses). */
export function Fence({ x0, x1, y, h = 60, every = 110, fill, rails = 2 }: { x0: number; x1: number; y: number; h?: number; every?: number; fill: string; rails?: number }) {
  const posts: number[] = [];
  for (let x = x0; x <= x1; x += every) posts.push(x);
  return (
    <g fill={fill}>
      {posts.map((x) => (
        <rect key={x} x={x - 3.5} y={y - h} width={7} height={h} />
      ))}
      {Array.from({ length: rails }, (_, i) => (
        <rect key={i} x={x0} y={y - h + 8 + i * (h * 0.4)} width={x1 - x0} height={5} />
      ))}
    </g>
  );
}

/** Façade de grange / écurie vue de côté. */
export function Barn({ x, y, w = 760, h = 300, fill, trim, light }: { x: number; y: number; w?: number; h?: number; fill: string; trim: string; light: string }) {
  const roof = h * 0.55;
  return (
    <g>
      <path d={`M ${x} ${y} L ${x} ${y - h} L ${x + w / 2} ${y - h - roof} L ${x + w} ${y - h} L ${x + w} ${y} Z`} fill={fill} />
      <path d={`M ${x - 20} ${y - h + 4} L ${x + w / 2} ${y - h - roof - 10} L ${x + w + 20} ${y - h + 4}`} fill="none" stroke={trim} strokeWidth="10" />
      {/* Grande porte coulissante entrouverte */}
      <rect x={x + w / 2 - 110} y={y - h * 0.82} width={220} height={h * 0.82} fill={light} opacity="0.85" />
      <rect x={x + w / 2 - 170} y={y - h * 0.84} width={120} height={h * 0.84} fill={trim} />
      <path d={`M ${x + w / 2 - 170} ${y - h * 0.84} l 120 ${h * 0.84} M ${x + w / 2 - 50} ${y - h * 0.84} l -120 ${h * 0.84}`} stroke={fill} strokeWidth="6" />
      {/* Lucarne à foin */}
      <rect x={x + w / 2 - 34} y={y - h - roof * 0.62} width={68} height={70} fill={trim} />
      {/* Fenêtres de boxes */}
      {[0.12, 0.26, 0.74, 0.88].map((f) => (
        <rect key={f} x={x + w * f - 26} y={y - h * 0.62} width={52} height={38} fill={light} opacity="0.55" />
      ))}
    </g>
  );
}

/** Mur du fond de l'écurie : boxes, chevaux, plaques, poutres. */
export function StableInterior({ x0, x1, y, seed = 4 }: { x0: number; x1: number; y: number; seed?: number }) {
  const rand = rng(seed);
  const boxW = 300;
  const boxes: number[] = [];
  for (let x = x0 + 80; x + boxW <= x1 - 40; x += boxW + 30) boxes.push(x);
  const coats = ["#1d3e39", "#112320", "#2f5b54", "#0c1615", "#254e47"];
  return (
    <g>
      {/* Mur, s'étendant vers le haut pour couvrir le ciel sur écran haut */}
      <rect x={x0} y={y - 2400} width={x1 - x0} height={2400} fill="#0c1715" />
      <rect x={x0} y={y - 430} width={x1 - x0} height={430} fill="#0f1f1c" />
      {/* Bardage */}
      {Array.from({ length: Math.floor((x1 - x0) / 46) }, (_, i) => (
        <rect key={i} x={x0 + i * 46} y={y - 430} width={1.5} height={430} fill="#081110" opacity="0.6" />
      ))}
      {/* Poutre haute */}
      <rect x={x0} y={y - 452} width={x1 - x0} height={24} fill="#070f0e" />
      {boxes.map((bx) => {
        const hasHorse = rand() > 0.22;
        const coat = coats[Math.floor(rand() * coats.length)];
        const flip = rand() > 0.5;
        const tilt = (rand() - 0.5) * 10;
        return (
          <g key={bx}>
            {/* Ouverture haute du box */}
            <rect x={bx} y={y - 330} width={boxW} height={150} fill="#050a09" />
            <rect x={bx + 10} y={y - 322} width={boxW - 20} height={140} fill="#0a1614" />
            {hasHorse && (
              <g transform={`translate(${bx + (flip ? 230 : 70)} ${y - 382}) scale(${flip ? -0.78 : 0.78} 0.78) rotate(${tilt} 150 300)`}>
                <path d={HORSE_HEAD_DOOR} fill={coat} />
                <circle cx="190" cy="140" r="5" fill="#040808" />
              </g>
            )}
            {/* Porte basse avec croisillon */}
            <rect x={bx} y={y - 182} width={boxW} height={182} fill="#19312d" />
            <rect x={bx + 12} y={y - 170} width={boxW - 24} height={158} fill="none" stroke="#112320" strokeWidth="8" />
            <path d={`M ${bx + 16} ${y - 166} L ${bx + boxW - 16} ${y - 16} M ${bx + boxW - 16} ${y - 166} L ${bx + 16} ${y - 16}`} stroke="#112320" strokeWidth="8" />
            <rect x={bx - 4} y={y - 190} width={boxW + 8} height={10} fill="#21403b" />
            {/* Plaque nominative (vierge) */}
            <rect x={bx + boxW / 2 - 30} y={y - 350} width={60} height={14} rx={2} fill="#7ef7c6" opacity="0.8" />
            {/* Grille latérale */}
            {Array.from({ length: 6 }, (_, k) => (
              <rect key={k} x={bx + boxW + 6 + k * 4} y={y - 330} width={1.5} height={150} fill="#1c322e" />
            ))}
          </g>
        );
      })}
      {/* Balle de foin et seau */}
      <g transform={`translate(${x0 + 40} ${y})`}>
        <rect x={boxes.length ? boxW + 100 : 0} y={-70} width={110} height={70} rx={6} fill="#4f8f89" />
        <path d={`M ${boxW + 104} -46 h 102 M ${boxW + 104} -24 h 102`} stroke="#376a65" strokeWidth="3" />
      </g>
    </g>
  );
}

export function HangingLamp({ x, y, len = 120 }: { x: number; y: number; len?: number }) {
  return (
    <g>
      <circle cx={x} cy={y + len + 30} r={190} fill="url(#lampGlow)" />
      <rect x={x - 1} y={y} width={2} height={len} fill="#050b0a" />
      <path d={`M ${x - 26} ${y + len + 18} L ${x - 12} ${y + len} L ${x + 12} ${y + len} L ${x + 26} ${y + len + 18} Z`} fill="#081110" />
      <ellipse cx={x} cy={y + len + 20} rx={14} ry={5} fill="#aff8d3" />
    </g>
  );
}

/** Cheval placé dans une scène (sol à y), échelle s, orienté à droite (ou à gauche si flip). */
export function SceneHorse({
  x,
  y,
  s,
  fill,
  far,
  pose = "standing",
  flip = false,
}: {
  x: number;
  y: number;
  s: number;
  fill: string;
  far?: string;
  pose?: "standing" | "grazing";
  flip?: boolean;
}) {
  const sx = flip ? -s : s;
  return (
    <g transform={`translate(${x} ${y - 680 * s}) scale(${sx} ${s})${flip ? " translate(-1000 0)" : ""}`}>
      <path d={HORSE_FAR_LEGS} fill={far ?? fill} opacity={far ? 1 : 0.7} />
      <path d={pose === "grazing" ? HORSE_GRAZING : HORSE_STANDING} fill={fill} />
    </g>
  );
}

export function ScenePerson({ x, y, s, fill, flip = false }: { x: number; y: number; s: number; fill: string; flip?: boolean }) {
  const sx = flip ? -s : s;
  return (
    <g transform={`translate(${x} ${y - 506 * s}) scale(${sx} ${s})${flip ? " translate(-220 0)" : ""}`}>
      <path d={PERSON} fill={fill} />
    </g>
  );
}
