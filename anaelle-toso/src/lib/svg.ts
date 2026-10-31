/** Générateurs SVG déterministes (mêmes formes côté serveur et client). */

export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

const r1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Ligne de collines douces : somme de sinusoïdes échantillonnée puis lissée (Catmull-Rom → Bézier).
 * Retourne un chemin fermé vers le bas (jusqu'à `bottom`).
 */
export function hillPath({
  width,
  baseY,
  amp,
  seed = 1,
  step = 80,
  bottom = 1000,
  x0 = 0,
  freq = 1,
}: {
  width: number;
  baseY: number;
  amp: number;
  seed?: number;
  step?: number;
  bottom?: number;
  x0?: number;
  freq?: number;
}) {
  const rand = rng(seed);
  const p1 = rand() * Math.PI * 2;
  const p2 = rand() * Math.PI * 2;
  const p3 = rand() * Math.PI * 2;
  const pts: [number, number][] = [];
  for (let x = x0; x <= x0 + width + step; x += step) {
    const y =
      baseY +
      amp * 0.6 * Math.sin((x / 900) * freq + p1) +
      amp * 0.3 * Math.sin((x / 370) * freq + p2) +
      amp * 0.1 * Math.sin((x / 140) * freq + p3);
    pts.push([x, y]);
  }
  return smoothPath(pts) + ` L ${r1(x0 + width + step)} ${bottom} L ${x0} ${bottom} Z`;
}

/** Courbe lisse passant par les points (Catmull-Rom uniforme). */
export function smoothPath(pts: [number, number][]) {
  if (pts.length < 2) return "";
  let d = `M ${r1(pts[0][0])} ${r1(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${r1(c1x)} ${r1(c1y)}, ${r1(c2x)} ${r1(c2y)}, ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return d;
}

/** Herbes hautes : brins effilés le long d'une ligne de sol. */
export function grassPath({
  width,
  baseY,
  height,
  density = 0.12,
  seed = 7,
  x0 = 0,
  lean = 0.35,
}: {
  width: number;
  baseY: number;
  height: number;
  density?: number;
  seed?: number;
  x0?: number;
  lean?: number;
}) {
  const rand = rng(seed);
  const count = Math.floor(width * density);
  let d = "";
  for (let i = 0; i < count; i++) {
    const x = x0 + rand() * width;
    const h = height * (0.35 + rand() * 0.65);
    const w = 2 + rand() * 4;
    const l = (rand() - 0.5) * 2 * lean * h;
    const tipX = x + l;
    const tipY = baseY - h;
    d += `M ${r1(x - w)} ${baseY + 2} Q ${r1(x + l * 0.3)} ${r1(baseY - h * 0.55)} ${r1(tipX)} ${r1(tipY)} Q ${r1(x + l * 0.35 + w * 0.4)} ${r1(baseY - h * 0.5)} ${r1(x + w)} ${baseY + 2} Z `;
  }
  return d;
}

/** Feuillage arrondi (chêne, tilleul) : nuage de disques. */
export function canopy(cx: number, cy: number, r: number, seed = 3, lobes = 9) {
  const rand = rng(seed);
  const discs: { cx: number; cy: number; r: number }[] = [{ cx, cy, r: r * 0.72 }];
  for (let i = 0; i < lobes; i++) {
    const a = (i / lobes) * Math.PI * 2 + rand() * 0.5;
    const d = r * (0.42 + rand() * 0.3);
    discs.push({
      cx: r1(cx + Math.cos(a) * d * 1.15),
      cy: r1(cy + Math.sin(a) * d * 0.78),
      r: r1(r * (0.34 + rand() * 0.22)),
    });
  }
  return discs;
}
