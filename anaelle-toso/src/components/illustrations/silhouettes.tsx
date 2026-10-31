/**
 * Silhouettes vectorielles dessinées à la main (points de contrôle lissés).
 * Cheval : orienté vers la droite, sol à y = 680 (viewBox 1000 × 700).
 */
import type { SVGProps } from "react";

type Pt = [number, number] | [number, number, 1];

/** Contour fermé lissé (Catmull-Rom → Bézier). Un 3e élément « 1 » marque un angle vif. */
export function outline(points: Pt[], tension = 1 / 6): string {
  const n = points.length;
  const P = (i: number) => points[(i + n) % n];
  const r = (v: number) => Math.round(v * 10) / 10;
  const tangent = (i: number): [number, number] => {
    const p = P(i);
    if (p[2]) return [0, 0];
    const a = P(i - 1);
    const b = P(i + 1);
    return [(b[0] - a[0]) * tension, (b[1] - a[1]) * tension];
  };
  let d = `M ${P(0)[0]} ${P(0)[1]}`;
  for (let i = 0; i < n; i++) {
    const p1 = P(i);
    const p2 = P(i + 1);
    const t1 = tangent(i);
    const t2 = tangent(i + 1);
    d += ` C ${r(p1[0] + t1[0])} ${r(p1[1] + t1[1])}, ${r(p2[0] - t2[0])} ${r(p2[1] - t2[1])}, ${p2[0]} ${p2[1]}`;
  }
  return d + " Z";
}

/* Corps commun (garrot → arrière-main → antérieur proche → pointe de l'épaule) */
const BODY: Pt[] = [
  [610, 208], [560, 226], [500, 232], [430, 224], [360, 208], [300, 210], [262, 226],
  // queue
  [238, 240], [218, 280], [208, 340], [210, 410], [220, 470], [234, 502, 1], [242, 470], [240, 410], [238, 352, 1],
  // postérieur proche
  [246, 386], [258, 426], [264, 476], [276, 530], [271, 562], [272, 600], [275, 630], [282, 652], [290, 670],
  [290, 680, 1], [338, 680, 1], [326, 656], [314, 638], [304, 616], [302, 580], [306, 540], [318, 500], [338, 458],
  [362, 428], [392, 404],
  // ventre
  [450, 420], [520, 428], [590, 426], [606, 432, 1],
  // antérieur proche
  [612, 478], [616, 524], [618, 550], [615, 580], [617, 622], [623, 642], [632, 662], [636, 676],
  [636, 680, 1], [684, 680, 1], [672, 656], [660, 636], [652, 616], [649, 580], [652, 548], [654, 508], [662, 462],
  [676, 420], [694, 386],
];

const HEAD_UP: Pt[] = [
  [706, 352], [724, 314], [748, 276], [772, 246], [786, 232],
  // ganache
  [792, 252], [806, 270], [832, 280], [866, 286], [898, 296], [916, 304], [930, 304], [940, 296, 1], [950, 288],
  [956, 272], [950, 252], [932, 224], [904, 184], [876, 148], [854, 120], [844, 106, 1],
  // oreilles
  [848, 84], [852, 60, 1], [838, 78], [830, 98, 1], [824, 80], [818, 62, 1], [810, 82], [806, 102, 1],
  // crinière
  [782, 108], [742, 124], [698, 150], [652, 180],
];

const HEAD_DOWN: Pt[] = [
  [706, 372], [726, 420], [748, 470], [768, 520], [784, 566, 1],
  [784, 600], [794, 628], [812, 650], [832, 668], [852, 680, 1], [872, 678], [884, 666], [886, 648], [878, 612],
  [868, 566], [858, 520], [850, 492, 1],
  [862, 470], [870, 446, 1], [856, 462], [844, 474, 1], [848, 452], [852, 432, 1], [840, 450], [832, 468, 1],
  [818, 438], [796, 388], [766, 324], [724, 262], [672, 222],
];

/* Membres éloignés (dessinés derrière le corps, plus sombres) */
const FAR_HIND: Pt[] = [
  [330, 420], [324, 470], [322, 520], [326, 548], [324, 590], [326, 628], [332, 652], [340, 670], [340, 680, 1],
  [384, 680, 1], [372, 656], [362, 636], [356, 612], [354, 576], [358, 540], [366, 500], [384, 450], [404, 410],
];
const FAR_FORE: Pt[] = [
  [580, 420], [584, 478], [588, 524], [590, 550], [587, 580], [589, 622], [594, 642], [602, 662], [604, 680, 1],
  [650, 680, 1], [640, 656], [630, 636], [624, 616], [621, 580], [624, 548], [626, 508], [632, 462], [640, 424],
];

export const HORSE_STANDING = outline([...BODY, ...HEAD_UP]);
export const HORSE_GRAZING = outline([...BODY, ...HEAD_DOWN]);
export const HORSE_FAR_LEGS = outline(FAR_HIND) + " " + outline(FAR_FORE);

/* Tête et encolure au-dessus d'une porte de box (viewBox 300 × 300) */
export const HORSE_HEAD_DOOR = outline([
  [40, 300, 1], [50, 244], [74, 188], [106, 140], [134, 110], [146, 100, 1],
  [146, 82], [152, 62, 1], [160, 80], [164, 96, 1], [170, 82], [182, 64, 1], [184, 84], [180, 102, 1],
  [198, 124], [224, 160], [248, 194], [264, 214], [274, 232], [272, 250], [262, 262], [248, 266, 1],
  [236, 262], [220, 256], [200, 249], [182, 244], [166, 238], [155, 224], [150, 208, 1], [142, 238], [136, 270], [134, 300, 1],
]);

/* Intervenante debout, tournée vers la droite, bras tendu vers le licol (viewBox 220 × 520) */
export const PERSON = outline([
  [98, 20], [114, 22], [124, 32], [127, 46], [128, 56], [132, 64, 1], [127, 70], [127, 76], [122, 82, 1], [116, 84],
  [114, 94, 1], [128, 100], [140, 108], [150, 124], [158, 146, 1], [194, 134], [202, 140, 1], [196, 148],
  [162, 160, 1], [148, 152], [148, 190], [150, 240, 1], [142, 250], [140, 300], [138, 380], [136, 470],
  [138, 492, 1], [160, 498], [162, 506, 1], [116, 506, 1], [114, 480], [112, 400], [106, 312, 1], [102, 400],
  [98, 480], [100, 492, 1], [118, 498], [118, 506, 1], [78, 506, 1], [80, 480], [78, 400], [76, 320], [72, 250, 1],
  [76, 240], [72, 180], [74, 130], [82, 104], [88, 92, 1], [84, 80], [76, 70], [66, 82], [60, 104], [64, 118, 1],
  [70, 96], [76, 72], [80, 56], [86, 30],
]);

type SvgProps = SVGProps<SVGSVGElement> & { title?: string };

export function HorseStanding({ title, farFill, ...props }: SvgProps & { farFill?: string }) {
  return (
    <svg viewBox="0 0 1000 700" role={title ? "img" : undefined} aria-hidden={title ? undefined : true} {...props}>
      {title && <title>{title}</title>}
      <path d={HORSE_FAR_LEGS} fill={farFill ?? "currentColor"} opacity={farFill ? 1 : 0.75} />
      <path d={HORSE_STANDING} fill="currentColor" />
    </svg>
  );
}

export function HorseGrazing({ title, farFill, ...props }: SvgProps & { farFill?: string }) {
  return (
    <svg viewBox="0 0 1000 700" role={title ? "img" : undefined} aria-hidden={title ? undefined : true} {...props}>
      {title && <title>{title}</title>}
      <path d={HORSE_FAR_LEGS} fill={farFill ?? "currentColor"} opacity={farFill ? 1 : 0.75} />
      <path d={HORSE_GRAZING} fill="currentColor" />
    </svg>
  );
}
