/**
 * Tête de cheval procédurale (aucun modèle externe) : chanfrein, bout du nez, naseaux, lèvres,
 * yeux, oreilles, robe baie à poil ras, joues qui s'étirent à l'ouverture de la mâchoire.
 * La peau est double face : robe à l'extérieur, muqueuse rose et humide à l'intérieur de la bouche.
 * Unités ≈ cm ; plan d'occlusion en y = 0 ; incisives à l'avant (z ≈ 0), ATM en arrière (z ≈ -36).
 */
import * as THREE from "three";
import { siteAsset } from "@/lib/config";

type Key = [number, number];
type WKey = [number, number, number, number]; // z, largeur bas, milieu, haut

/**
 * Spline cubique monotone (Fritsch–Carlson) sur z, clés triées de l'avant (z grand) vers l'arrière.
 * Courbure continue : aucune « cassure » visible entre deux clés du profil.
 */
function spline(keys: Key[]) {
  const xs = keys.map((k) => -k[0]); // croissant
  const ys = keys.map((k) => k[1]);
  const n = xs.length;
  const d: number[] = [];
  const m: number[] = new Array(n).fill(0);
  for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
  m[0] = d[0];
  m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = m[i + 1] = 0;
      continue;
    }
    const a = m[i] / d[i];
    const b = m[i + 1] / d[i];
    const h = a * a + b * b;
    if (h > 9) {
      const t = 3 / Math.sqrt(h);
      m[i] = t * a * d[i];
      m[i + 1] = t * b * d[i];
    }
  }
  return (z: number) => {
    const x = -z;
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0;
    while (x > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i];
    const t = (x - xs[i]) / h;
    const t2 = t * t;
    const t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * m[i + 1];
  };
}
const cache = new Map<Key[], (z: number) => number>();
function at(keys: Key[], z: number) {
  let f = cache.get(keys);
  if (!f) cache.set(keys, (f = spline(keys)));
  return f(z);
}
const wCache = new Map<WKey[], [Key[], Key[], Key[]]>();
function atW(keys: WKey[], z: number): [number, number, number] {
  let k = wCache.get(keys);
  if (!k) wCache.set(keys, (k = [keys.map((x) => [x[0], x[1]] as Key), keys.map((x) => [x[0], x[2]] as Key), keys.map((x) => [x[0], x[3]] as Key)]));
  return [at(k[0], z), at(k[1], z), at(k[2], z)];
}
const sgnpow = (v: number, p: number) => Math.sign(v) * Math.pow(Math.abs(v), p);
const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
/** Largeur selon la hauteur relative t (0 bas → 1 haut), passant par (0, wb), (0.45, wm), (1, wt). */
function widthAt(t: number, [wb, wm, wt]: [number, number, number]) {
  const a = 0.45;
  if (t <= a) {
    const k = t / a;
    return wb + (wm - wb) * (k * (2 - k));
  }
  const k = (t - a) / (1 - a);
  return wm + (wt - wm) * k * k;
}

/* ── Profils de la tête (tête adulte ≈ 58 cm, incisives en z ≈ 0, plan d'occlusion en y = 0) ── */
const FRONT = 3.0; // bout de la lèvre supérieure
const BACK = -56; // nuque
// ligne du dessus : bout du nez, naseaux, chanfrein droit, front large, nuque
const UP_TOP: Key[] = [
  [FRONT, 1.4], [2.3, 3.4], [1.0, 5.5], [-1.5, 7.2], [-4, 8.1], [-8, 8.8], [-16, 10.8], [-24, 13.4], [-32, 16.2], [-40, 18.2], [-47, 19.2], [-52, 18.6], [BACK, 16.8],
];
// bord inférieur de la partie haute : lèvre supérieure, commissure, puis ligne de la joue jusqu'à l'ATM
const UP_LIP: Key[] = [
  [FRONT, -0.5], [-6, -0.5], [-10, -0.3], [-18, 0.6], [-26, 1.6], [-33, 3.0], [-40, 4.6], [-48, 6.0], [BACK, 7.0],
];
// demi-largeurs : bas (lèvre/joue), milieu, dessus
const UP_W: WKey[] = [
  [FRONT, 2.6, 2.9, 2.2], [1.0, 4.0, 4.8, 3.1], [-2, 4.3, 4.7, 3.1], [-5.5, 5.2, 4.8, 2.9], [-10, 6.6, 5.6, 3.1], [-15, 7.6, 6.9, 3.5],
  [-21, 8.0, 7.9, 4.0], [-27, 8.3, 8.6, 4.9], [-32, 7.9, 8.5, 6.6], [-36, 8.1, 9.4, 7.4], [-42, 7.9, 8.9, 7.2], [-49, 6.9, 7.5, 6.2], [BACK, 5.3, 5.6, 4.6],
];
const LOW_FRONT = 2.6;
const LOW_BACK = -50.5;
// bord supérieur de la mâchoire : lèvre inférieure puis ligne de la joue
const LOW_LIP: Key[] = [
  [LOW_FRONT, 0.0], [-6, -0.1], [-10, 0.2], [-18, 1.0], [-26, 2.0], [-33, 3.4], [-40, 5.0], [-46, 6.0], [LOW_BACK, 6.4],
];
// bord inférieur : menton (houppe), auge, ganache ronde
const LOW_BOT: Key[] = [
  [LOW_FRONT, -1.1], [1.6, -3.1], [0.2, -4.7], [-2, -5.9], [-4.5, -5.6], [-8, -5.6], [-14, -6.8], [-20, -8.4], [-28, -11.0], [-35, -13.4], [-40, -14.7], [-44, -14.5], [-47, -12.6], [-49.3, -8.8], [LOW_BACK, -5.0],
];
const LOW_W: WKey[] = [
  [LOW_FRONT, 2.2, 2.8, 3.0], [-0.5, 2.9, 4.1, 4.3], [-4, 3.1, 4.9, 5.3], [-9, 3.4, 5.2, 6.0], [-14, 3.6, 5.7, 6.7], [-20, 4.1, 6.4, 7.2],
  [-28, 5.1, 7.0, 7.5], [-36, 6.7, 7.9, 8.0], [-42, 7.5, 8.3, 8.2], [-47, 7.1, 7.9, 8.0], [LOW_BACK, 5.9, 6.9, 7.4],
];

/** Fin du « U » : lèvres enroulées vers l'intérieur à l'avant, flancs ouverts au niveau des joues. */
const curlAt = (z: number) => Math.PI * (0.62 + 0.13 * smooth(-7.5, -3.5, z));

interface SectionPt {
  x: number;
  y: number;
}

/** Section ouverte de la partie haute (u : 0 = lèvre gauche, 0.5 = chanfrein, 1 = lèvre droite). */
function upperSection(z: number, u: number): SectionPt {
  const yt = at(UP_TOP, z);
  const yl = at(UP_LIP, z);
  const w = atW(UP_W, z);
  const bmax = curlAt(z);
  const n = 2.35;
  const b = (u - 0.5) * 2 * bmax; // 0 = dessus, ±bmax = bords
  const yEnd = sgnpow(Math.cos(bmax), 2 / n);
  const hh = (yt - yl) / (1 - yEnd);
  const yc = yt - hh;
  const y = yc + sgnpow(Math.cos(b), 2 / n) * hh;
  const t = Math.min(1, Math.max(0, (y - yl) / (yt - yl)));
  // crête faciale : arête osseuse sur le côté de la face, entre les naseaux et l'œil
  const crestY = 4.2 + (-z - 14) * 0.12;
  const crest = 0.42 * Math.exp(-(((y - crestY) / 1.1) ** 2)) * smooth(-12, -16, z) * smooth(-33, -28, z);
  // salière / arcade au-dessus de l'œil
  const brow = 0.5 * Math.exp(-(((y - 16) / 1.6) ** 2)) * Math.exp(-(((z + 34) / 3.5) ** 2));
  const x = sgnpow(Math.sin(b), 2 / n) * (widthAt(t, w) + crest + brow);
  return { x, y };
}

/** Section ouverte de la mâchoire inférieure (u : 0 = lèvre gauche, 0.5 = dessous, 1 = lèvre droite). */
function lowerSection(z: number, u: number): SectionPt {
  const yl = at(LOW_LIP, z);
  const yb = at(LOW_BOT, z);
  const w = atW(LOW_W, z);
  const bmax = curlAt(z);
  const n = 2.25;
  const b = (u - 0.5) * 2 * bmax; // 0 = dessous
  const yEnd = sgnpow(Math.cos(bmax), 2 / n);
  const hh = (yl - yb) / (1 - yEnd);
  const yc = yb + hh;
  const y = yc - sgnpow(Math.cos(b), 2 / n) * hh;
  const t = Math.min(1, Math.max(0, (y - yb) / (yl - yb)));
  // masséter : joue musclée et ronde au-dessus de la ganache
  const masseter = 0.55 * Math.exp(-(((y + 5.5) / 3.6) ** 2)) * Math.exp(-(((z + 36) / 6.5) ** 2));
  // menton (houppe) légèrement bombé
  const chin = 0.25 * Math.exp(-(((y + 4.6) / 1.2) ** 2)) * Math.exp(-(((z + 1.5) / 1.6) ** 2));
  const x = sgnpow(Math.sin(b), 2 / n) * (widthAt(t, w) + masseter + chin);
  return { x, y };
}

/** Arrondi des extrémités (bout du nez, nuque) : la section se resserre vers son centre. */
function roundEnds(z: number, front: number, back: number, rf: number, rb: number) {
  if (z > front - rf) return Math.sqrt(Math.max(0, 1 - ((z - (front - rf)) / rf) ** 2));
  if (z < back + rb) return Math.sqrt(Math.max(0, 1 - ((back + rb - z) / rb) ** 2));
  return 1;
}

/** Surface balayée ; UV : u autour de la section, v de l'avant (0) vers l'arrière (1). */
function loft(section: (z: number, u: number) => SectionPt, front: number, back: number, nz: number, nu: number, rf: number, rb: number, cy: (z: number) => number) {
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= nz; i++) {
    const s = i / nz;
    // échantillonnage plus dense vers l'avant (lèvres, naseaux)
    const z = front - (front - back) * Math.pow(s, 1.25);
    const k = roundEnds(z, front, back, rf, rb);
    const c = cy(z);
    for (let j = 0; j <= nu; j++) {
      const u = j / nu;
      const p = section(z, u);
      pos.push(p.x * k, c + (p.y - c) * k, z);
      uv.push(u, s);
    }
  }
  for (let i = 0; i < nz; i++) {
    for (let j = 0; j < nu; j++) {
      const a = i * (nu + 1) + j;
      const b = a + nu + 1;
      idx.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Oriente les normales vers l'extérieur (test sur le sommet de la section médiane). */
function orientOutward(g: THREE.BufferGeometry, nz: number, nu: number, outward: THREE.Vector3) {
  const n = g.attributes.normal;
  const mid = Math.floor(nz / 2) * (nu + 1) + Math.floor(nu / 2);
  const v = new THREE.Vector3(n.getX(mid), n.getY(mid), n.getZ(mid));
  if (v.dot(outward) < 0) {
    const ix = g.index!;
    for (let t = 0; t < ix.count; t += 3) {
      const a = ix.getX(t + 1);
      ix.setX(t + 1, ix.getX(t + 2));
      ix.setX(t + 2, a);
    }
    g.computeVertexNormals();
  }
}

function rng(seed: number) {
  let x = seed;
  return () => (x = (x * 16807) % 2147483647) / 2147483647;
}

/** Robe baie : bout du nez noir, chanfrein plus sombre, reflets et poils dans le sens de la tête. */
function coatTexture(lower: boolean) {
  const W = 512;
  const H = 1024;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  const r = rng(lower ? 77 : 41);
  // dégradé avant → arrière (v = y du canevas)
  const grd = g.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0, "#0c0908");
  grd.addColorStop(0.06, "#120d0b");
  grd.addColorStop(0.14, "#24150f");
  grd.addColorStop(0.28, "#432216");
  grd.addColorStop(0.5, "#552b19");
  grd.addColorStop(0.78, "#4c2616");
  grd.addColorStop(1, "#2f180f");
  g.fillStyle = grd;
  g.fillRect(0, 0, W, H);
  // chanfrein plus sombre (haut de la section, u ≈ 0.5) ou ganaches (bas, mâchoire)
  const band = g.createLinearGradient(0, 0, W, 0);
  band.addColorStop(0, "rgba(0,0,0,0)");
  band.addColorStop(0.5, lower ? "rgba(255,200,150,0.06)" : "rgba(10,5,2,0.28)");
  band.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = band;
  g.fillRect(0, H * 0.12, W, H * 0.88);
  // bords des lèvres très sombres
  const lip = g.createLinearGradient(0, 0, W, 0);
  lip.addColorStop(0, "rgba(8,5,4,0.85)");
  lip.addColorStop(0.08, "rgba(8,5,4,0)");
  lip.addColorStop(0.92, "rgba(8,5,4,0)");
  lip.addColorStop(1, "rgba(8,5,4,0.85)");
  g.fillStyle = lip;
  g.fillRect(0, 0, W, H * 0.3);
  // poils : traits fins dans le sens de la tête
  for (let i = 0; i < 9000; i++) {
    const x = r() * W;
    const y = r() * H;
    const len = 6 + r() * 16;
    const light = r() > 0.55;
    g.strokeStyle = light ? `rgba(255,190,130,${0.03 + r() * 0.05})` : `rgba(0,0,0,${0.05 + r() * 0.07})`;
    g.lineWidth = 0.8;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + (r() - 0.5) * 2, y + len);
    g.stroke();
  }
  // pommelures discrètes (reflets de la robe)
  for (let i = 0; i < 60; i++) {
    const x = r() * W;
    const y = H * 0.25 + r() * H * 0.7;
    const rad = 10 + r() * 26;
    const d = g.createRadialGradient(x, y, 0, x, y, rad);
    d.addColorStop(0, "rgba(255,180,120,0.05)");
    d.addColorStop(1, "rgba(255,180,120,0)");
    g.fillStyle = d;
    g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  // détail réel de la robe (photo d'un poney bai, filtrée passe-haut) : reflets et texture du poil
  if (typeof Image !== "undefined") {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      const pat = g.createPattern(img, "repeat");
      if (!pat) return;
      pat.setTransform(new DOMMatrix().scale(0.34, 0.34));
      g.save();
      g.globalCompositeOperation = "overlay";
      g.globalAlpha = 0.6;
      g.fillStyle = pat;
      g.fillRect(0, H * 0.08, W, H * 0.92);
      g.restore();
      t.needsUpdate = true;
    };
    img.src = siteAsset("/images/3d/robe.jpg");
  }
  return t;
}

/** Carte de normales « poil ras » : stries orientées dans le sens de la tête. */
function hairNormalTexture() {
  const S = 256;
  const r = rng(13);
  const h = new Float32Array(S * S);
  for (let k = 0; k < 2400; k++) {
    const x0 = Math.floor(r() * S);
    const y0 = Math.floor(r() * S);
    const len = 8 + Math.floor(r() * 20);
    const amp = 0.4 + r() * 0.6;
    for (let j = 0; j < len; j++) {
      const y = (y0 + j) % S;
      const x = (x0 + Math.round(j * 0.08)) % S;
      h[y * S + x] += amp * Math.sin((j / len) * Math.PI);
    }
  }
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  const img = g.createImageData(S, S);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const hx = h[y * S + ((x + 1) % S)] - h[y * S + ((x - 1 + S) % S)];
      const hy = h[((y + 1) % S) * S + x] - h[((y - 1 + S) % S) * S + x];
      const nx = -hx * 0.8;
      const ny = -hy * 0.8;
      const nz = 1;
      const l = Math.hypot(nx, ny, nz);
      const o = (y * S + x) * 4;
      img.data[o] = ((nx / l) * 0.5 + 0.5) * 255;
      img.data[o + 1] = ((ny / l) * 0.5 + 0.5) * 255;
      img.data[o + 2] = ((nz / l) * 0.5 + 0.5) * 255;
      img.data[o + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(6, 14);
  t.anisotropy = 8;
  return t;
}

/**
 * Matériau de peau double face :
 * - face externe : robe baie, poil ras (sheen), reflets ;
 * - face interne : muqueuse rose, humide ;
 * - uXray (0 → 1) : la peau devient une silhouette lumineuse translucide (vue « rayons X »).
 */
function skinMaterial(map: THREE.Texture, normalMap: THREE.Texture, xray: { value: number }, scan: { value: number }) {
  const m = new THREE.MeshPhysicalMaterial({
    map,
    normalMap,
    normalScale: new THREE.Vector2(0.45, 0.45),
    roughness: 0.62,
    metalness: 0,
    sheen: 1,
    sheenColor: new THREE.Color(0x9a6040),
    sheenRoughness: 0.42,
    side: THREE.DoubleSide,
    transparent: true,
  });
  // une seule passe double face : gl_FrontFacing distingue la robe (dehors) de la muqueuse (dedans)
  m.forceSinglePass = true;
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uXray = xray;
    sh.uniforms.uScan = scan;
    sh.vertexShader = sh.vertexShader
      .replace("void main() {", "varying vec3 vScanPos;\nvoid main() {")
      .replace("#include <project_vertex>", "#include <project_vertex>\n  vScanPos = (modelMatrix * vec4(transformed, 1.0)).xyz;");
    sh.fragmentShader = sh.fragmentShader
      .replace("void main() {", "uniform float uXray;\nuniform float uScan;\nvarying vec3 vScanPos;\nvoid main() {")
      .replace(
        "#include <map_fragment>",
        "#include <map_fragment>\n  if (!gl_FrontFacing) { float lipEdge = smoothstep(0.0, 0.07, min(vMapUv.x, 1.0 - vMapUv.x)); diffuseColor.rgb = mix(vec3(0.05, 0.03, 0.026), vec3(0.29, 0.075, 0.07), lipEdge); }",
      )
      .replace(
        "#include <normal_fragment_maps>",
        "#include <normal_fragment_maps>\n  if (!gl_FrontFacing) normal = -normalize(vNormal);",
      )
      .replace(
        "#include <roughnessmap_fragment>",
        "#include <roughnessmap_fragment>\n  if (!gl_FrontFacing) roughnessFactor = 0.3;",
      )
      .replace(
        "#include <lights_physical_fragment>",
        "#include <lights_physical_fragment>\n  #ifdef USE_SHEEN\n  if (!gl_FrontFacing) material.sheenColor = vec3(0.0);\n  #endif",
      )
      .replace(
        "#include <opaque_fragment>",
        `float fres = pow(1.0 - abs(dot(normalize(normal), normalize(vViewPosition))), 2.2);
  // hologramme : silhouette fresnel, fines lignes de balayage, faisceau du scanner
  float scanLines = 0.82 + 0.18 * sin(vScanPos.y * 7.0);
  float band = exp(-pow((vScanPos.z - uScan) / 1.5, 2.0));
  outgoingLight = mix(outgoingLight, vec3(0.5, 0.98, 0.84) * (0.1 + 2.1 * fres) * scanLines + vec3(0.6, 1.0, 0.9) * band * 1.8, uXray);
  diffuseColor.a *= mix(1.0, 0.02 + 0.6 * pow(fres, 1.3), uXray);
  diffuseColor.a = min(1.0, diffuseColor.a + band * 0.5 * uXray);
  #include <opaque_fragment>`,
      );
  };
  return m;
}

export interface Head {
  /** À appeler quand l'angle de la mâchoire change (joues et commissures). */
  update(jawAngle: number): void;
  setXray(v: number): void;
  /** Position (z, repère monde) du faisceau du scanner sur la peau holographique. */
  setScan(z: number): void;
  dispose(): void;
}

/**
 * Construit la tête autour de la dentition existante.
 * upper : groupe fixe ; lower : groupe de la mâchoire (pivot en `pivot`).
 */
export function buildHead(upper: THREE.Object3D, lower: THREE.Object3D, pivot: THREE.Vector3, opts: { mobile: boolean }): Head {
  const geos: THREE.BufferGeometry[] = [];
  const mats: THREE.Material[] = [];
  const texs: THREE.Texture[] = [];
  const xray = { value: 0 };
  const scan = { value: 200 };

  const coatUp = coatTexture(false);
  const coatLow = coatTexture(true);
  const hair = hairNormalTexture();
  texs.push(coatUp, coatLow, hair);
  const skinUp = skinMaterial(coatUp, hair, xray, scan);
  const skinLow = skinMaterial(coatLow, hair, xray, scan);
  mats.push(skinUp, skinLow);

  const NZ = opts.mobile ? 130 : 200;
  const NU = opts.mobile ? 48 : 72;

  /* Partie haute : chanfrein, bout du nez, lèvre supérieure, joues, front */
  const upGeo = loft(upperSection, FRONT, BACK, NZ, NU, 1.7, 5, (z) => (at(UP_TOP, z) + at(UP_LIP, z)) / 2);
  orientOutward(upGeo, NZ, NU, new THREE.Vector3(0, 1, 0));
  geos.push(upGeo);
  const upMesh = new THREE.Mesh(upGeo, skinUp);
  upMesh.renderOrder = 2;
  upper.add(upMesh);

  /* Mâchoire inférieure : lèvre inférieure, menton, ganaches */
  const NZL = Math.round(NZ * 0.8);
  const lowGeo = loft(lowerSection, LOW_FRONT, LOW_BACK, NZL, NU, 1.5, 2.5, (z) => (at(LOW_LIP, z) + at(LOW_BOT, z)) / 2);
  orientOutward(lowGeo, NZL, NU, new THREE.Vector3(0, -1, 0));
  geos.push(lowGeo);
  const lowMesh = new THREE.Mesh(lowGeo, skinLow);
  lowMesh.renderOrder = 2;
  lower.add(lowMesh);

  /* Joues / commissures : membrane étirée entre les bords haut et bas, recalculée à chaque ouverture */
  const MZ = 40;
  const MV = 8;
  const zFrom = -7.6;
  const zTo = -41;
  const memGeo = new THREE.BufferGeometry();
  const memPos = new Float32Array(2 * (MZ + 1) * (MV + 1) * 3);
  const memUv = new Float32Array(2 * (MZ + 1) * (MV + 1) * 2);
  const memIdx: number[] = [];
  for (let side = 0; side < 2; side++) {
    const off = side * (MZ + 1) * (MV + 1);
    for (let i = 0; i < MZ; i++) {
      for (let j = 0; j < MV; j++) {
        const a = off + i * (MV + 1) + j;
        const b = a + MV + 1;
        if (side === 0) memIdx.push(a, b, a + 1, a + 1, b, b + 1);
        else memIdx.push(a, a + 1, b, a + 1, b + 1, b);
      }
    }
    for (let i = 0; i <= MZ; i++) {
      for (let j = 0; j <= MV; j++) {
        const o = (off + i * (MV + 1) + j) * 2;
        memUv[o] = side === 0 ? 0.2 : 0.8;
        memUv[o + 1] = 0.25 + (i / MZ) * 0.6;
      }
    }
  }
  memGeo.setAttribute("position", new THREE.BufferAttribute(memPos, 3));
  memGeo.setAttribute("uv", new THREE.BufferAttribute(memUv, 2));
  memGeo.setIndex(memIdx);
  geos.push(memGeo);
  const memMesh = new THREE.Mesh(memGeo, skinUp);
  memMesh.renderOrder = 2;
  memMesh.frustumCulled = false;
  upper.add(memMesh);

  // points des bords (repère de chaque groupe), précalculés
  const edgeUp: THREE.Vector3[][] = [[], []];
  const edgeLow: THREE.Vector3[][] = [[], []];
  for (let i = 0; i <= MZ; i++) {
    const z = zFrom + (zTo - zFrom) * (i / MZ);
    for (let side = 0; side < 2; side++) {
      const u = side === 0 ? 0.004 : 0.996;
      const pu = upperSection(z, u);
      const pl = lowerSection(z, u);
      edgeUp[side].push(new THREE.Vector3(pu.x, pu.y, z));
      edgeLow[side].push(new THREE.Vector3(pl.x, pl.y, z));
    }
  }
  const rot = new THREE.Matrix4();
  const tmp = new THREE.Vector3();
  let lastAngle = NaN;
  const update = (a: number) => {
    if (Math.abs(a - lastAngle) < 1e-4) return;
    lastAngle = a;
    rot.makeRotationX(a);
    for (let side = 0; side < 2; side++) {
      const off = side * (MZ + 1) * (MV + 1);
      const sx = side === 0 ? -1 : 1;
      for (let i = 0; i <= MZ; i++) {
        const top = edgeUp[side][i];
        tmp.copy(edgeLow[side][i]).sub(pivot).applyMatrix4(rot).add(pivot);
        const gap = top.y - tmp.y;
        const fade = smooth(0, 1.2, gap);
        for (let j = 0; j <= MV; j++) {
          const v = j / MV;
          const o = (off + i * (MV + 1) + j) * 3;
          // joue légèrement bombée, plus marquée quand la bouche s'ouvre
          const bulge = Math.sin(Math.PI * v) * (0.25 + 0.06 * gap) * fade;
          memPos[o] = top.x + (tmp.x - top.x) * v + sx * bulge;
          memPos[o + 1] = top.y + (tmp.y - top.y) * v;
          memPos[o + 2] = top.z + (tmp.z - top.z) * v + Math.sin(Math.PI * v) * 0.15 * gap * (1 - i / MZ);
        }
      }
    }
    memGeo.attributes.position.needsUpdate = true;
    memGeo.computeVertexNormals();
    memGeo.computeBoundingSphere();
  };
  update(0);

  /* Naseaux : orifice sombre en virgule, bordé d'un bourrelet */
  const dark = new THREE.MeshPhysicalMaterial({ color: 0x050302, roughness: 0.55, transparent: true });
  const rimMat = new THREE.MeshPhysicalMaterial({ color: 0x1a120e, roughness: 0.48, sheen: 0.6, sheenColor: new THREE.Color(0x5a3a2a), sheenRoughness: 0.5, normalMap: hair, normalScale: new THREE.Vector2(0.3, 0.3), transparent: true });
  mats.push(dark, rimMat);
  const holeGeo = new THREE.SphereGeometry(1, 24, 16);
  const rimGeo = new THREE.TorusGeometry(1, 0.2, 12, 40, Math.PI * 1.65);
  geos.push(holeGeo, rimGeo);
  for (const sx of [-1, 1]) {
    const g = new THREE.Group();
    const surf = upperSection(0.2, sx < 0 ? 0.31 : 0.69);
    g.position.set(surf.x * 0.95, surf.y - 0.4, 0.2);
    g.rotation.set(0.1, sx * 0.45, sx * -0.3);
    const hole = new THREE.Mesh(holeGeo, dark);
    hole.scale.set(0.78, 1.65, 0.5);
    g.add(hole);
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.scale.set(0.9, 1.8, 0.8);
    rim.rotation.z = sx * 0.9;
    g.add(rim);
    upper.add(g);
  }

  /* Yeux : globe sombre et brillant, paupière en bourrelet */
  const eyeMat = new THREE.MeshPhysicalMaterial({ color: 0x0b0705, roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 1.6, transparent: true });
  const lidGeo = new THREE.TorusGeometry(1.45, 0.22, 14, 40);
  const lidMat = new THREE.MeshPhysicalMaterial({ color: 0x2a1610, roughness: 0.55, sheen: 0.8, sheenColor: new THREE.Color(0x6a4030), sheenRoughness: 0.5, transparent: true });
  mats.push(lidMat);
  const eyeGeo = new THREE.SphereGeometry(1.55, 32, 24);
  mats.push(eyeMat);
  geos.push(lidGeo, eyeGeo);
  for (const sx of [-1, 1]) {
    const z = -34;
    const y = 13.6;
    const t = (y - at(UP_LIP, z)) / (at(UP_TOP, z) - at(UP_LIP, z));
    const x = widthAt(t, atW(UP_W, z));
    const eye = new THREE.Mesh(eyeGeo, eyeMat);
    eye.position.set(sx * (x - 0.55), y, z);
    eye.scale.set(0.62, 0.85, 1.25);
    upper.add(eye);
    const lid = new THREE.Mesh(lidGeo, lidMat);
    lid.position.copy(eye.position).add(new THREE.Vector3(sx * 0.3, 0, 0));
    lid.rotation.y = Math.PI / 2;
    lid.scale.set(1.35, 0.78, 1);
    upper.add(lid);
  }

  /* Oreilles */
  const earPts = [
    [0.01, 0], [1.6, 0.3], [1.95, 2.2], [1.7, 4.6], [1.15, 6.6], [0.45, 8.0], [0.01, 8.5],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const earGeo = new THREE.LatheGeometry(earPts, 28);
  geos.push(earGeo);
  for (const sx of [-1, 1]) {
    const ear = new THREE.Mesh(earGeo, skinUp);
    ear.position.set(sx * 3.8, at(UP_TOP, -50) - 1.4, -50);
    ear.scale.set(1, 1, 0.55);
    ear.rotation.set(-0.3, sx * 0.25, sx * -0.32);
    upper.add(ear);
  }

  /* Vibrisses autour du bout du nez et du menton */
  const whiskers: number[] = [];
  const r = rng(29);
  const nrm = new THREE.Vector3();
  for (let k = 0; k < (opts.mobile ? 40 : 70); k++) {
    const lowerPart = r() > 0.55;
    const u = 0.08 + r() * 0.84;
    const z = lowerPart ? 1.6 - r() * 4 : 2.2 - r() * 4.5;
    const p = lowerPart ? lowerSection(z, u) : upperSection(z, u);
    const base = new THREE.Vector3(p.x, p.y, z);
    nrm.set(p.x * 0.6, lowerPart ? -0.8 : 0.3, 0.9 + r() * 0.4).normalize();
    nrm.x += (r() - 0.5) * 0.6;
    nrm.y += (r() - 0.5) * 0.6;
    const len = 0.8 + r() * 1.1;
    const tip = base.clone().addScaledVector(nrm.normalize(), len);
    if (lowerPart) {
      // stockées dans le repère de la mâchoire : ajoutées plus bas
      whiskers.push(1, base.x, base.y, base.z, tip.x, tip.y, tip.z);
    } else {
      whiskers.push(0, base.x, base.y, base.z, tip.x, tip.y, tip.z);
    }
  }
  const wMat = new THREE.LineBasicMaterial({ color: 0xcdbca4, transparent: true, opacity: 0.38, depthWrite: false });
  mats.push(wMat);
  for (const part of [0, 1]) {
    const arr: number[] = [];
    for (let i = 0; i < whiskers.length; i += 7) if (whiskers[i] === part) arr.push(...whiskers.slice(i + 1, i + 7));
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3));
    geos.push(g);
    (part === 0 ? upper : lower).add(new THREE.LineSegments(g, wMat));
  }

  return {
    update,
    setScan(z: number) {
      scan.value = z;
    },
    setXray(v: number) {
      xray.value = v;
      const opaque = v < 0.02;
      skinUp.depthWrite = skinLow.depthWrite = opaque;
      wMat.opacity = 0.38 * (1 - v);
      for (const m of [dark, rimMat, eyeMat, lidMat]) {
        m.opacity = 1 - 0.9 * v;
        m.depthWrite = opaque;
      }
    },
    dispose() {
      geos.forEach((g) => g.dispose());
      mats.forEach((m) => m.dispose());
      texs.forEach((t) => t.dispose());
    },
  };
}

/* ────────────────────────────────────────────────────────────────
   Squelette (visible en « rayons X » et en coupe) : maxillaire, os
   incisif, os nasal, orbite, fosse temporale ; mandibule avec sa
   branche montante, son condyle (ATM) et son processus coronoïde.
   Contours relevés sur des crânes réels, vue latérale (z, y).
   ──────────────────────────────────────────────────────────────── */
type P2 = [number, number];
const MASK = { z0: -57, z1: 4, y0: -16, y1: 22, w: 1024, h: 640 };

/** Masque de découpe dessiné dans le plan latéral (blanc = os). */
function boneMask(outline: P2[], holes: { c: P2; r: P2 }[]) {
  const c = document.createElement("canvas");
  c.width = MASK.w;
  c.height = MASK.h;
  const g = c.getContext("2d")!;
  const X = (z: number) => ((z - MASK.z0) / (MASK.z1 - MASK.z0)) * MASK.w;
  const Y = (y: number) => (1 - (y - MASK.y0) / (MASK.y1 - MASK.y0)) * MASK.h;
  g.fillStyle = "#000";
  g.fillRect(0, 0, MASK.w, MASK.h);
  g.fillStyle = "#fff";
  g.beginPath();
  // contour lissé : courbes passant par les milieux des segments
  const n = outline.length;
  const mid = (a: P2, b: P2): P2 => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const m0 = mid(outline[n - 1], outline[0]);
  g.moveTo(X(m0[0]), Y(m0[1]));
  for (let i = 0; i < n; i++) {
    const p = outline[i];
    const m = mid(p, outline[(i + 1) % n]);
    g.quadraticCurveTo(X(p[0]), Y(p[1]), X(m[0]), Y(m[1]));
  }
  g.fill();
  g.fillStyle = "#000";
  for (const h of holes) {
    g.beginPath();
    g.ellipse(X(h.c[0]), Y(h.c[1]), (h.r[0] / (MASK.z1 - MASK.z0)) * MASK.w, (h.r[1] / (MASK.y1 - MASK.y0)) * MASK.h, 0, 0, Math.PI * 2);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.NoColorSpace;
  return t;
}

/** Plaque latérale enveloppant la tête : grille (z, y) repliée à la demi-largeur donnée. */
function bonePlate(side: 1 | -1, halfWidth: (z: number, y: number) => number, yRange: [number, number]) {
  const NZ = 120;
  const NY = 48;
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= NZ; i++) {
    const z = MASK.z0 + ((MASK.z1 - MASK.z0) * i) / NZ;
    for (let j = 0; j <= NY; j++) {
      const y = yRange[0] + ((yRange[1] - yRange[0]) * j) / NY;
      pos.push(side * Math.max(0.6, halfWidth(z, y)), y, z);
      uv.push((z - MASK.z0) / (MASK.z1 - MASK.z0), (y - MASK.y0) / (MASK.y1 - MASK.y0));
    }
  }
  for (let i = 0; i < NZ; i++) {
    for (let j = 0; j < NY; j++) {
      const a = i * (NY + 1) + j;
      const b = a + NY + 1;
      if (side > 0) idx.push(a, b, a + 1, a + 1, b, b + 1);
      else idx.push(a, a + 1, b, a + 1, b + 1, b);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

export interface Skull {
  /** 0 = invisible ; 1 = os opaques (coupe) ; entre les deux : transparence de radiographie. */
  setOpacity(v: number): void;
  /** Lueur propre de l'os (aspect radiographique). */
  setGlow(v: number): void;
  dispose(): void;
}

export function buildSkull(upper: THREE.Object3D, lower: THREE.Object3D): Skull {
  const geos: THREE.BufferGeometry[] = [];
  const mats: THREE.Material[] = [];
  const texs: THREE.Texture[] = [];

  // contour du crâne (os incisif, échancrure naso-incisive, os nasal en pointe, chanfrein, front, nuque,
  // occiput, arcade zygomatique, crête faciale, bord alvéolaire au-dessus des dents)
  const dorsal: P2[] = [];
  for (let z = -3; z >= -50; z -= 3) dorsal.push([z, at(UP_TOP, z) - 1.05]);
  const skullOutline: P2[] = [
    [2.7, -0.3], [2.9, 1.6], [2.2, 3.4], [0.2, 4.0], [-6.5, 4.8], [-12.6, 5.7], // os incisif → fond de l'échancrure
    [-7.5, 6.6], [-2.4, 7.1], // dessous de l'os nasal, jusqu'à sa pointe
    ...dorsal,
    [-52, 17.4], [-54.6, 13.8], [-54.2, 9.4], [-51.5, 5.6], [-47.5, 7.2], // nuque, occiput
    [-44.5, 9.4], [-40, 9.6], [-36.5, 9.0], // arcade zygomatique (au-dessus de l'ATM)
    [-33.5, 6.4], [-29, 4.6], [-22, 3.4], [-15, 1.9], // crête faciale puis bord alvéolaire
    [-10, 0.9], [-4, 0.3], [0.4, -0.6], // barres, alvéoles des incisives
  ];
  const skullHoles = [
    { c: [-35.5, 13.4] as P2, r: [3.3, 2.9] as P2 }, // orbite
    { c: [-42.6, 14.2] as P2, r: [2.3, 2.6] as P2 }, // fosse temporale
    { c: [-19, 7.0] as P2, r: [0.38, 0.32] as P2 }, // foramen infra-orbitaire
  ];
  // mandibule : corps, angle arrondi, branche montante, condyle, échancrure, processus coronoïde
  const mandOutline: P2[] = [
    [2.0, -0.4], [1.4, -2.2], [0.4, -4.2], [-2, -5.3], [-8, -5.1], [-16, -6.2], [-24, -8.0], [-32, -10.4], [-37, -12.2],
    [-41, -13.4], [-45, -12.5], [-47.6, -9.4], [-48.5, -5], [-48.2, 0], [-46.8, 5], [-45.2, 8.8], // angle et bord postérieur
    [-44.3, 10.9], [-42.6, 11.7], [-41.2, 10.8], // condyle (ATM)
    [-39.6, 8.8], // échancrure mandibulaire
    [-37.6, 13.2], [-36.4, 14.6], [-35.2, 12.2], // processus coronoïde
    [-33.6, 6.8], [-31.6, 1.4], [-30, -0.9], // bord antérieur de la branche
    [-22, -1.0], [-14, -1.2], [-10, -0.7], [-5, -0.9], [0, -0.6], // bord alvéolaire, barres
  ];
  const mandHoles = [
    { c: [-40.6, 2.8] as P2, r: [0.55, 0.5] as P2 }, // foramen mandibulaire
    { c: [-8.6, -3.3] as P2, r: [0.32, 0.26] as P2 }, // foramen mentonnier
  ];

  const skullMask = boneMask(skullOutline, skullHoles);
  const mandMask = boneMask(mandOutline, mandHoles);
  texs.push(skullMask, mandMask);
  const boneMat = (alpha: THREE.Texture) =>
    new THREE.MeshPhysicalMaterial({
      color: 0xf1e7d2,
      roughness: 0.72,
      sheen: 0.4,
      sheenColor: new THREE.Color(0xffe9c8),
      emissive: new THREE.Color(0x9ff2d6),
      emissiveIntensity: 0,
      alphaMap: alpha,
      alphaTest: 0.01,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
  const skullMat = boneMat(skullMask);
  const mandMat = boneMat(mandMask);
  mats.push(skullMat, mandMat);

  const inset = (z: number) => 1.05 + 0.5 * smooth(-20, -34, z); // plus de tissus sur les joues
  const upW = (z: number, y: number) => {
    const t = Math.min(1, Math.max(0, (y - at(UP_LIP, z)) / (at(UP_TOP, z) - at(UP_LIP, z))));
    return widthAt(t, atW(UP_W, z)) - inset(z);
  };
  const lowW = (z: number, y: number) => {
    const t = Math.min(1, Math.max(0, (y - at(LOW_BOT, z)) / (at(LOW_LIP, z) - at(LOW_BOT, z))));
    return widthAt(t, atW(LOW_W, z)) - 0.95 - 0.6 * smooth(-28, -38, z);
  };
  const meshes: THREE.Mesh[] = [];
  for (const side of [1, -1] as const) {
    const sg = bonePlate(side, upW, [-1, 19.5]);
    const mg = bonePlate(side, lowW, [-14.5, 15.5]);
    geos.push(sg, mg);
    const sm = new THREE.Mesh(sg, skullMat);
    const mm = new THREE.Mesh(mg, mandMat);
    sm.renderOrder = mm.renderOrder = 1;
    upper.add(sm);
    lower.add(mm);
    meshes.push(sm, mm);
  }

  return {
    setOpacity(v: number) {
      const vis = v > 0.01;
      for (const m of meshes) m.visible = vis;
      skullMat.opacity = mandMat.opacity = v;
      skullMat.depthWrite = mandMat.depthWrite = false;
    },
    setGlow(v: number) {
      skullMat.emissiveIntensity = mandMat.emissiveIntensity = v;
    },
    dispose() {
      geos.forEach((g) => g.dispose());
      mats.forEach((m) => m.dispose());
      texs.forEach((t) => t.dispose());
    },
  };
}
