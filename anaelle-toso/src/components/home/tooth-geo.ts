/**
 * Géométrie de dents équines (hypsodontes) : section non rectangulaire, crêtes verticales
 * côté joue, couronne longue légèrement courbe, effilée puis fermée côté racine.
 *
 * Repère local : y = -h/2 → table (surface d'usure), y = +h/2 → extrémité radiculaire ;
 * x = vestibulaire (joue) → lingual ; z = rostral (+) / caudal (-).
 * Deux groupes de matériaux : 0 = faces (couronne), 1 = table.
 */
import * as THREE from "three";

export interface ToothSpec {
  kind: "upper" | "lower" | "incisor";
  w: number; // largeur vestibulo-linguale
  d: number; // longueur mésio-distale
  h: number; // hauteur totale (couronne de réserve comprise)
  /** côté de la bouche : -1 = gauche (joue vers -x), +1 = droite (joue vers +x) */
  side: -1 | 1;
  bend?: number; // courbure le long de la hauteur
  taper?: number; // effilement vers la racine
  tones?: [number, number]; // teinte table → racine
  /** UV de la table : fonction (u vestibulo-lingual 0..1, v rostral = 1) → uv atlas */
  capUv?: (u: number, v: number) => [number, number];
  /** retournement rostral/caudal du repère (dents montées tête-bêche, mâchoire inférieure) */
  flipZ?: boolean;
  seed?: number;
}

const g = (x: number, c: number, s: number) => Math.exp(-((x - c) * (x - c)) / (s * s));
const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Contour de la section (x vestibulaire négatif) pour un angle θ. */
function outline(spec: ToothSpec, th: number, rnd: number): [number, number] {
  const { w, d, kind } = spec;
  const c = Math.cos(th);
  const s = Math.sin(th);
  const n = kind === "incisor" ? 2.3 : 4.2; // super-ellipse : ovale (incisive) ou rectangle arrondi
  let x = (w / 2) * Math.sign(c) * Math.pow(Math.abs(c), 2 / n);
  const z = (d / 2) * Math.sign(s) * Math.pow(Math.abs(s), 2 / n);
  const zn = z / (d / 2); // -1 → 1
  if (kind === "upper") {
    if (x < 0) {
      // côté joue : parastyle et mésostyle (crêtes verticales), creux entre les deux
      const k = smooth(0, -w * 0.3, x);
      x -= k * (0.13 * g(zn, 0.62, 0.22) + 0.15 * g(zn, -0.02, 0.2) + 0.07 * g(zn, -0.75, 0.2) - 0.05);
    } else {
      // côté palais : protocône bombé
      const k = smooth(0, w * 0.3, x);
      x += k * (0.16 * g(zn, 0.05, 0.42) - 0.05);
    }
  } else if (kind === "lower") {
    if (x < 0) {
      // côté joue : sillon vertical marqué entre les deux lobes
      const k = smooth(0, -w * 0.3, x);
      x += k * (0.2 * g(zn, 0.0, 0.16) - 0.02);
    } else {
      // côté langue : ondulations (métaconide, entoconide)
      const k = smooth(0, w * 0.3, x);
      x += k * 0.06 * Math.sin(zn * 6.2 + 0.6);
    }
  } else {
    // incisive : face vestibulaire plus plate, face linguale bombée
    if (x < 0) x *= 0.86;
  }
  // irrégularités naturelles, propres à chaque dent
  x *= 1 + 0.015 * Math.sin(th * 3 + rnd * 6.28);
  return [x, z];
}

export function toothGeometry(spec: ToothSpec): THREE.BufferGeometry {
  const RING = spec.kind === "incisor" ? 36 : 56;
  const RINGS = 26;
  const { h, side } = spec;
  const bend = spec.bend ?? 0.25;
  const taper = spec.taper ?? 0.16;
  const tones = spec.tones ?? [0xffffff, 0xd8c6a4];
  const rnd = ((spec.seed ?? 1) * 0.6180339) % 1;
  const sx = side === -1 ? 1 : -1; // le modèle est construit joue vers -x
  const fz = spec.flipZ ? -1 : 1;
  const tip = new THREE.Color(tones[0]);
  const base = new THREE.Color(tones[1]);
  const col = new THREE.Color();

  const pos: number[] = [];
  const uv: number[] = [];
  const colors: number[] = [];
  const idx: number[] = [];

  // section de base (anneau), réutilisée à chaque hauteur
  const ring: [number, number][] = [];
  for (let i = 0; i <= RING; i++) ring.push(outline(spec, (i / RING) * Math.PI * 2, rnd));

  const scaleAt = (t: number) => {
    // couronne qui s'effile, puis extrémité radiculaire arrondie et fermée
    const k = 1 - taper * t;
    const end = t > 0.84 ? Math.sqrt(Math.max(0, 1 - ((t - 0.84) / 0.16) ** 2)) : 1;
    return k * Math.max(0.12, end);
  };

  // faces latérales
  for (let j = 0; j <= RINGS; j++) {
    const t = j / RINGS;
    const y = -h / 2 + t * h;
    const k = scaleAt(t);
    const zOff = -bend * t * t; // courbure : la racine part vers l'arrière
    col.copy(tip).lerp(base, smooth(0.05, 0.9, t));
    for (let i = 0; i <= RING; i++) {
      const [x, z] = ring[i];
      pos.push(sx * x * k, y, fz * (z * k + zOff));
      uv.push((i / RING) * 2, t);
      colors.push(col.r, col.g, col.b);
    }
  }
  const row = RING + 1;
  for (let j = 0; j < RINGS; j++) {
    for (let i = 0; i < RING; i++) {
      const a = j * row + i;
      const b = a + 1;
      const c = a + row;
      const e = c + 1;
      idx.push(a, c, b, b, c, e);
    }
  }
  const sideCount = idx.length;

  // table (éventail depuis le centre)
  const center = pos.length / 3;
  const capUv = spec.capUv ?? ((u: number, v: number) => [u, v] as [number, number]);
  const w2 = spec.w / 2 + 0.25;
  const d2 = spec.d / 2 + 0.25;
  const pushCap = (x: number, z: number) => {
    pos.push(sx * x, -h / 2, fz * z);
    // u : vestibulaire (0) → lingual (1) ; v : rostral = 1
    const [a, b] = capUv(Math.min(1, Math.max(0, (x + w2) / (2 * w2))), Math.min(1, Math.max(0, (z + d2) / (2 * d2))));
    uv.push(a, b);
    colors.push(tip.r, tip.g, tip.b);
  };
  pushCap(0, 0);
  for (let i = 0; i <= RING; i++) pushCap(ring[i][0], ring[i][1]);
  for (let i = 0; i < RING; i++) idx.push(center, center + 1 + i, center + 1 + i + 1);

  // extrémité radiculaire (fermeture)
  const last = RINGS * row;
  const rootC = pos.length / 3;
  pos.push(0, h / 2, fz * -bend);
  uv.push(0.5, 1);
  colors.push(base.r, base.g, base.b);
  for (let i = 0; i < RING; i++) idx.push(rootC, last + i + 1, last + i);

  // le miroir (sx = -1) et le retournement (fz = -1) inversent l'orientation des triangles
  if (sx * fz < 0) {
    for (let i = 0; i < idx.length; i += 3) {
      const t = idx[i + 1];
      idx[i + 1] = idx[i + 2];
      idx[i + 2] = t;
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(idx);
  geo.addGroup(0, sideCount, 0);
  geo.addGroup(sideCount, RING * 3, 1);
  geo.addGroup(sideCount + RING * 3, idx.length - sideCount - RING * 3, 0);
  geo.computeVertexNormals();
  return geo;
}

/** Table d'incisive : émail périphérique, dentine, « cornet » (infundibulum) sombre. */
export function incisorTableTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const x = c.getContext("2d")!;
  x.fillStyle = "#e9dcc2";
  x.fillRect(0, 0, 256, 256);
  const rg = x.createRadialGradient(128, 128, 10, 128, 128, 130);
  rg.addColorStop(0, "#d6c29c");
  rg.addColorStop(1, "#bfa77d");
  x.fillStyle = rg;
  x.beginPath();
  x.ellipse(128, 128, 104, 92, 0, 0, Math.PI * 2);
  x.fill();
  x.strokeStyle = "#f7f0e2";
  x.lineWidth = 9;
  x.stroke();
  // cornet dentaire
  x.fillStyle = "#4a3624";
  x.beginPath();
  x.ellipse(128, 120, 46, 22, 0, 0, Math.PI * 2);
  x.fill();
  x.strokeStyle = "#f3ead7";
  x.lineWidth = 6;
  x.stroke();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
