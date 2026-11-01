/**
 * « L'anatomie en mouvement » — scène Three.js procédurale (aucun modèle externe).
 * Modèle simplifié et pédagogique d'une bouche de cheval : incisives, barres, dents de loup,
 * prémolaires et molaires (mâchoire supérieure plus large), tables dentaires, pointes d'émail,
 * crochet et rampe. La caméra suit un trajet piloté par la progression du défilement (0 → 1).
 */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { buildHead } from "./head";

export type AnchorId = "incisives" | "barres" | "loup" | "premolaires" | "molaires" | "pointes-haut" | "pointes-bas" | "tables" | "crochet" | "rampe";

export interface MouthScene {
  setProgress(p: number): void;
  resize(w: number, h: number): void;
  /** Qualité adaptative : réduit (ou rétablit) la résolution de rendu. */
  setQuality(level: number): void;
  render(): void;
  /** Position écran (px) d'une ancre ; visible = devant la caméra et dans le cadre. */
  project(id: AnchorId): { x: number; y: number; visible: boolean };
  dispose(): void;
}

/* ── Utilitaires ── */
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
/** Fenêtre douce : 0 avant a, 1 entre b et c, 0 après d. */
const win = (a: number, b: number, c: number, d: number, v: number) => smooth(a, b, v) * (1 - smooth(c, d, v));

/** Interpolation linéaire par morceaux, adoucie. */
function track(keys: [number, number][], p: number) {
  if (p <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [p0, v0] = keys[i];
    const [p1, v1] = keys[i + 1];
    if (p <= p1) return v0 + (v1 - v0) * smooth(p0, p1, p);
  }
  return keys[keys.length - 1][1];
}

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/* Trajet de caméra : [progression, position, cible] */
const CAM: [number, THREE.Vector3, THREE.Vector3][] = [
  [0.0, V(-104, 9, -20), V(0, 2.5, -37)], // la tête entière, de profil
  [0.06, V(-52, 5, 18), V(-2, 1, -16)], // elle pivote de trois-quarts
  [0.12, V(-27, 1.5, 24), V(-1, -0.8, -5)], // les lèvres s'écartent
  [0.2, V(1.1, -0.2, 6.8), V(0, -1.1, 0)], // incisives, entre les lèvres
  [0.255, V(0, -1.6, 3.2), V(0, -1.7, -6)], // dans l'axe de l'ouverture
  [0.3, V(0.3, -1, -3.2), V(-3.3, -2.6, -10)], // les barres
  [0.36, V(-0.9, -1.5, -8.4), V(-3.8, 0.8, -13.4)], // dent de loup, vue de dessous
  [0.445, V(0.3, 0.3, -11.2), V(-4.3, -0.2, -23)], // l'arcade
  [0.52, V(0, -0.4, -2), V(0, -0.6, -21)], // recul pendant la coupe
  [0.585, V(0, -0.6, 7), V(0, -0.6, -20)], // vue en coupe (dolly zoom)
  [0.64, V(0, -0.6, 7.5), V(0, -0.6, -20)],
  [0.745, V(-0.7, 2.2, -16.2), V(-3.9, -2.2, -23)], // tables
  [0.775, V(0, -1.6, -2.5), V(-3.6, -1.6, -20)], // recul entre les mâchoires ouvertes
  [0.8, V(-6, -1.4, 9), V(-4.2, -0.8, -18)], // sortie par l'avant, trois-quarts
  [0.835, V(-24, 0.6, -21.5), V(-4.2, -0.4, -21.5)], // profil : surdents (peau en transparence)
  [0.9, V(-24.5, 0.9, -21.8), V(-4.2, -0.4, -21.8)],
  [1.0, V(-78, 14, 46), V(-6, 3, -27)], // retour à la tête entière, de trois-quarts
];

const PIVOT = V(0, 3.2, -36); // articulation temporo-mandibulaire (approx.)

/* Dimensions (unités ≈ cm) */
const ROW_START = -14;
const TOOTH_D = 2.55;
const TOOTH_GAP = 0.06;
const UPPER_X = 4.4;
const LOWER_X = 3.5;
const TOOTH_W = 2.5;
const TOOTH_H = 3.2;
const TILT = 0.21; // inclinaison des tables (≈ 12°)

function zOf(i: number) {
  return ROW_START - TOOTH_D / 2 - i * (TOOTH_D + TOOTH_GAP);
}

/** Texture des tables dentaires : dentine, replis d'émail, cément. */
function tableTexture(kind: "upper" | "lower") {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#a88a63";
  g.fillRect(0, 0, 256, 256);
  // halo de dentine
  const rg = g.createRadialGradient(128, 128, 20, 128, 128, 160);
  rg.addColorStop(0, "#c2a47a");
  rg.addColorStop(1, "#8d7150");
  g.fillStyle = rg;
  g.fillRect(0, 0, 256, 256);
  g.strokeStyle = "#f6ecd9";
  g.lineCap = "round";
  g.lineJoin = "round";
  // contour d'émail ondulé
  g.lineWidth = 7;
  g.beginPath();
  for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.05) {
    const r = 104 + Math.sin(a * (kind === "upper" ? 5 : 7)) * 7 + Math.sin(a * 2) * 4;
    const x = 128 + Math.cos(a) * r * 1.02;
    const y = 128 + Math.sin(a) * r * 0.96;
    if (a === 0) g.moveTo(x, y);
    else g.lineTo(x, y);
  }
  g.closePath();
  g.stroke();
  if (kind === "upper") {
    // deux infundibulums
    for (const cx of [86, 170]) {
      g.fillStyle = "#4e3c2a";
      g.lineWidth = 6;
      g.beginPath();
      for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.06) {
        const r = 30 + Math.sin(a * 4 + cx) * 6;
        const x = cx + Math.cos(a) * r * 0.62;
        const y = 128 + Math.sin(a) * r * 1.35;
        if (a === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.closePath();
      g.fill();
      g.stroke();
    }
  } else {
    // replis profonds de la dent inférieure
    g.lineWidth = 6;
    for (const [x0, dir] of [
      [60, 1],
      [196, -1],
    ] as const) {
      g.beginPath();
      g.moveTo(x0, 40);
      g.bezierCurveTo(x0 + dir * 60, 80, x0 - dir * 10, 120, x0 + dir * 46, 150);
      g.bezierCurveTo(x0 + dir * 70, 170, x0 + dir * 10, 200, x0 + dir * 20, 220);
      g.stroke();
    }
    g.beginPath();
    g.moveTo(128, 30);
    g.bezierCurveTo(100, 90, 156, 140, 128, 226);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Générateur pseudo-aléatoire déterministe (rendu identique à chaque visite). */
function rng(seed: number) {
  let x = seed;
  return () => (x = (x * 16807) % 2147483647) / 2147483647;
}

/** Textures de relief procédurales (bump) : stries d'émail, papilles de la langue, grain des gencives. */
function reliefTexture(kind: "streaks" | "papillae" | "gum") {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const r = rng(kind === "streaks" ? 11 : kind === "papillae" ? 23 : 37);
  g.fillStyle = "#808080";
  g.fillRect(0, 0, 256, 256);
  if (kind === "streaks") {
    // fines stries verticales + micro-variations de l'émail
    for (let i = 0; i < 140; i++) {
      const x = r() * 256;
      g.strokeStyle = `rgba(${r() > 0.5 ? 255 : 0},${r() > 0.5 ? 255 : 0},${r() > 0.5 ? 255 : 0},0.06)`;
      g.fillStyle = r() > 0.5 ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
      g.fillRect(x, 0, 1 + r() * 3, 256);
    }
    for (let i = 0; i < 900; i++) {
      g.fillStyle = r() > 0.5 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
      g.fillRect(r() * 256, r() * 256, 2, 2);
    }
  } else {
    const n = kind === "papillae" ? 2600 : 1400;
    for (let i = 0; i < n; i++) {
      const x = r() * 256;
      const y = r() * 256;
      const rad = kind === "papillae" ? 0.8 + r() * 1.8 : 1 + r() * 3;
      const grd = g.createRadialGradient(x, y, 0, x, y, rad);
      grd.addColorStop(0, kind === "papillae" ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.18)");
      grd.addColorStop(1, "rgba(128,128,128,0)");
      g.fillStyle = grd;
      g.beginPath();
      g.arc(x, y, rad, 0, Math.PI * 2);
      g.fill();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}

/** Fond : halo chaud au centre, noir chaud sur les bords. */
function backdropTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(256, 290, 10, 256, 290, 360);
  grd.addColorStop(0, "#22170f");
  grd.addColorStop(0.55, "#140e09");
  grd.addColorStop(1, "#0b0806");
  g.fillStyle = grd;
  g.fillRect(0, 0, 512, 512);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/**
 * Crête gingivale : section en « dôme » balayée le long de l'arcade en U,
 * plus large au niveau des dents jugales, affinée sur les barres, fermée aux extrémités.
 */
function ridgeGeometry(curve: THREE.Curve<THREE.Vector3>, dir: 1 | -1, dims: (z: number) => { w: number; h: number; y0: number }) {
  const SEG = 260;
  const P = 30; // points par section
  const pos: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];
  const margin = new THREE.Color(0x9a5246);
  const body = new THREE.Color(0x672923);
  const deep = new THREE.Color(0x3e1714);
  const c = new THREE.Color();
  const pt = new THREE.Vector3();
  const tan = new THREE.Vector3();
  const r = rng(91);
  const profile = (w: number, h: number) => {
    // rectangle arrondi (n, v) : v = 0 au collet (bord gingival), v = h vers l'os
    const out: [number, number][] = [];
    const rb = Math.min(0.9, w * 0.32, h * 0.4);
    const rt = Math.min(0.7, w * 0.25, h * 0.3);
    const arc = (cx: number, cy: number, rad: number, a0: number, a1: number, n: number) => {
      for (let i = 0; i < n; i++) {
        const a = a0 + ((a1 - a0) * i) / (n - 1);
        out.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]);
      }
    };
    const hw = w / 2;
    arc(-hw + rb, rb, rb, Math.PI, Math.PI * 1.5, 8); // collet, côté gauche
    arc(hw - rb, rb, rb, Math.PI * 1.5, Math.PI * 2, 8); // collet, côté droit
    arc(hw - rt, h - rt, rt, 0, Math.PI / 2, 7);
    arc(-hw + rt, h - rt, rt, Math.PI / 2, Math.PI, 7);
    return out.slice(0, P);
  };
  for (let i = 0; i <= SEG; i++) {
    const u = i / SEG;
    curve.getPointAt(u, pt);
    curve.getTangentAt(u, tan);
    const nx = -tan.z;
    const nz = tan.x;
    const len = Math.hypot(nx, nz) || 1;
    const { w, h, y0 } = dims(pt.z);
    const prof = profile(w, h);
    for (const [n, v] of prof) {
      pos.push(pt.x + (nx / len) * n, dir * (y0 + v), pt.z + (nz / len) * n);
      const k = v / h;
      c.copy(margin).lerp(body, Math.min(1, k * 3.2)).lerp(deep, Math.max(0, (k - 0.55) / 0.45));
      const j = 0.94 + r() * 0.08;
      col.push(c.r * j, c.g * j, c.b * j);
    }
  }
  for (let i = 0; i < SEG; i++) {
    for (let j = 0; j < P; j++) {
      const a = i * P + j;
      const b = i * P + ((j + 1) % P);
      const c2 = (i + 1) * P + j;
      const d = (i + 1) * P + ((j + 1) % P);
      idx.push(a, c2, b, b, c2, d);
    }
  }
  // bouchons aux deux extrémités
  for (const ring of [0, SEG]) {
    let cx = 0, cy = 0, cz = 0;
    for (let j = 0; j < P; j++) {
      cx += pos[(ring * P + j) * 3];
      cy += pos[(ring * P + j) * 3 + 1];
      cz += pos[(ring * P + j) * 3 + 2];
    }
    const center = pos.length / 3;
    pos.push(cx / P, cy / P, cz / P);
    col.push(deep.r, deep.g, deep.b);
    for (let j = 0; j < P; j++) {
      const a = ring * P + j;
      const b = ring * P + ((j + 1) % P);
      if (ring === 0) idx.push(center, b, a);
      else idx.push(center, a, b);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  // UV simples pour le relief
  const uv: number[] = [];
  for (let i = 0; i <= SEG; i++) for (let j = 0; j < P; j++) uv.push((i / SEG) * 18, j / P);
  uv.push(0, 0, 1, 1);
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  // orientation : les normales doivent pointer vers l'extérieur de la section
  const nrm = geo.attributes.normal;
  const mid = Math.floor(SEG / 2) * P + Math.floor(P / 4);
  let sx = 0, sy = 0, sz = 0;
  for (let j = 0; j < P; j++) {
    sx += pos[(Math.floor(SEG / 2) * P + j) * 3];
    sy += pos[(Math.floor(SEG / 2) * P + j) * 3 + 1];
    sz += pos[(Math.floor(SEG / 2) * P + j) * 3 + 2];
  }
  const out = new THREE.Vector3(pos[mid * 3] - sx / P, pos[mid * 3 + 1] - sy / P, pos[mid * 3 + 2] - sz / P);
  if (out.dot(new THREE.Vector3(nrm.getX(mid), nrm.getY(mid), nrm.getZ(mid))) < 0) {
    const ix = geo.index!;
    for (let t = 0; t < ix.count; t += 3) {
      const tmpI = ix.getX(t + 1);
      ix.setX(t + 1, ix.getX(t + 2));
      ix.setX(t + 2, tmpI);
    }
    geo.computeVertexNormals();
  }
  return geo;
}

/** Langue : aplatie, effilée vers la pointe, sillon médian, teinte dégradée. */
function tongueGeometry() {
  const geo = new THREE.SphereGeometry(1, 72, 40);
  const pos = geo.attributes.position;
  const col: number[] = [];
  const tip = new THREE.Color(0x87443b);
  const back = new THREE.Color(0x4a1f1b);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i); // -1 (fond) → 1 (pointe)
    const zz = -19 + z * 13.6;
    const width = 2.3 - Math.max(0, z - 0.55) * 0.75 + Math.max(0, -z - 0.6) * 0.4;
    const top = y > 0;
    const groove = top ? 0.16 * Math.exp(-((x / 0.22) ** 2)) * (1 - Math.abs(z) * 0.6) : 0;
    const yy = top ? y * (0.7 - Math.max(0, z - 0.4) * 0.55) - groove : y * (0.7 - Math.max(0, z - 0.4) * 0.4);
    pos.setXYZ(i, x * width, yy, zz);
    c.copy(back).lerp(tip, smooth(-0.6, 0.9, z));
    if (!top) c.multiplyScalar(0.7);
    col.push(c.r, c.g, c.b);
  }
  geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  geo.computeVertexNormals();
  return geo;
}

export function createMouthScene(canvas: HTMLCanvasElement, opts: { mobile: boolean }): MouthScene {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  const maxDpr = Math.min(window.devicePixelRatio || 1, opts.mobile ? 1.5 : 2);
  renderer.setPixelRatio(maxDpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  renderer.setClearColor(0x0d0a07, 1);

  const scene = new THREE.Scene();
  const backdrop = backdropTexture();
  scene.background = backdrop;
  scene.fog = new THREE.Fog(0x110c08, 18, 66);
  // reflets doux d'un environnement neutre : surfaces humides, émail brillant
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envRT.texture;
  scene.environmentIntensity = 0;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(opts.mobile ? 52 : 38, 1, 0.1, 200);
  scene.add(camera);

  // halo lumineux sur les zones mises en valeur (désactivé sur mobile)
  let composer: EffectComposer | null = null;
  let bloom: UnrealBloomPass | null = null;
  if (!opts.mobile) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), 0.15, 0.45, 0.92);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
  }

  /* Lumières : lampe frontale (sur la caméra), ambiance chaude, contre-jour cognac */
  const lamp = new THREE.SpotLight(0xffe4bf, 0, 0, 0.62, 0.7, 0.8);
  lamp.position.set(0, 0.25, 0);
  camera.add(lamp);
  const lampTarget = new THREE.Object3D();
  lampTarget.position.set(0, -0.1, -1);
  camera.add(lampTarget);
  lamp.target = lampTarget;
  const hemi = new THREE.HemisphereLight(0xf4eadb, 0x2a160e, 0);
  scene.add(hemi);
  const rim = new THREE.DirectionalLight(0xc07a43, 0);
  rim.position.set(-6, 10, -40);
  scene.add(rim);
  const rim2 = new THREE.DirectionalLight(0x9cae8e, 0);
  rim2.position.set(10, -4, 10);
  scene.add(rim2);
  // lumière de modelé pour les plans extérieurs de la tête (avant et après le voyage)
  const key = new THREE.DirectionalLight(0xffe2bd, 0);
  key.position.set(-30, 26, 22);
  key.target.position.set(0, 2, -20);
  scene.add(key, key.target);

  /* Matériaux */
  const streaks = reliefTexture("streaks");
  const papillae = reliefTexture("papillae");
  papillae.repeat.set(3, 9);
  const gumGrain = reliefTexture("gum");
  const enamel = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    vertexColors: true,
    roughness: 0.3,
    metalness: 0,
    clearcoat: 0.75,
    clearcoatRoughness: 0.2,
    sheen: 0.25,
    sheenColor: 0xfff0d8,
    bumpMap: streaks,
    bumpScale: 1.2,
    emissive: 0x2a1c10,
    emissiveIntensity: 0.1,
  });
  const cut = new THREE.MeshBasicMaterial({ color: 0xb39472, side: THREE.BackSide });
  const gum = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    vertexColors: true,
    roughness: 0.42,
    metalness: 0,
    clearcoat: 0.85,
    clearcoatRoughness: 0.22,
    sheen: 0.3,
    sheenColor: 0xd99080,
    sheenRoughness: 0.55,
    bumpMap: gumGrain,
    bumpScale: 0.8,
  });
  const gumCut = new THREE.MeshBasicMaterial({ color: 0x5e2620, side: THREE.BackSide });
  const palateMat = new THREE.MeshPhysicalMaterial({ color: 0x5c2823, roughness: 0.5, clearcoat: 0.7, clearcoatRoughness: 0.28, sheen: 0.4, sheenColor: 0xe0a090, side: THREE.DoubleSide });
  const tongueMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    vertexColors: true,
    roughness: 0.74,
    clearcoat: 0.2,
    clearcoatRoughness: 0.5,
    sheen: 0.3,
    sheenColor: 0xc98a7c,
    bumpMap: papillae,
    bumpScale: 1.6,
  });
  const glow = new THREE.MeshPhysicalMaterial({ color: 0xeee2cb, roughness: 0.28, clearcoat: 0.7, emissive: 0xff8a3d, emissiveIntensity: 0 });
  const hookMat = new THREE.MeshPhysicalMaterial({ color: 0xeee3cd, roughness: 0.33, clearcoat: 0.5, emissive: 0xff8f45, emissiveIntensity: 0 });
  const wolfMat = new THREE.MeshPhysicalMaterial({ color: 0xd8c098, roughness: 0.33, clearcoat: 0.5, emissive: 0xff8f45, emissiveIntensity: 0 });
  const upperTex = tableTexture("upper");
  const lowerTex = tableTexture("lower");
  const tableUp = new THREE.MeshStandardMaterial({ map: upperTex, emissiveMap: upperTex, emissive: 0xffe6c4, emissiveIntensity: 0, roughness: 0.5 });
  const tableLow = new THREE.MeshStandardMaterial({ map: lowerTex, emissiveMap: lowerTex, emissive: 0xffe6c4, emissiveIntensity: 0, roughness: 0.5 });
  const lineMat = new THREE.LineBasicMaterial({ color: 0xf4eadb, transparent: true, opacity: 0, depthWrite: false, fog: true });
  const materials: THREE.Material[] = [enamel, cut, gum, gumCut, palateMat, tongueMat, glow, hookMat, wolfMat, tableUp, tableLow, lineMat];
  const textures: THREE.Texture[] = [streaks, papillae, gumGrain, backdrop];
  const geometries: THREE.BufferGeometry[] = [];
  const cutMeshes: THREE.Mesh[] = [];

  const keep = <G extends THREE.BufferGeometry>(g: G) => {
    geometries.push(g);
    return g;
  };

  /**
   * Prépare une géométrie de dent (axe y : -h/2 = surface d'occlusion, +h/2 = côté gencive) :
   * léger effilement vers la racine, stries verticales, teinte ivoire → jaunie vers la gencive.
   */
  function toothShade(geo: THREE.BufferGeometry, h: number, ridges: boolean, taper: number, bend = 0) {
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const tip = new THREE.Color(0xebdec6);
    const base = new THREE.Color(0xbb9a6d);
    const c = new THREE.Color();
    geo.computeBoundingBox();
    const bb = geo.boundingBox!;
    const halfW = (bb.max.x - bb.min.x) / 2;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const t = Math.min(1, Math.max(0, (y + h / 2) / h)); // 0 occlusion → 1 gencive
      let x = pos.getX(i);
      let z = pos.getZ(i);
      if (ridges && Math.abs(x) > halfW - 0.08) x += Math.sign(x) * 0.055 * Math.sin(z * 8.5);
      const k = 1 - t * taper;
      x *= k;
      z *= 1 - t * taper * 0.5;
      z -= bend * t * t; // courbure (face vestibulaire bombée)
      pos.setXYZ(i, x, y, z);
      c.copy(tip).lerp(base, smooth(0.25, 1, t));
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }

  /** Maillage solide + contour lumineux + face de coupe. */
  function solid(geo: THREE.BufferGeometry, mat: THREE.Material, parent: THREE.Object3D, capMat: THREE.Material = cut, edges = true) {
    const m = new THREE.Mesh(geo, mat);
    parent.add(m);
    if (edges) {
      const e = new THREE.LineSegments(keep(new THREE.EdgesGeometry(geo, 28)), lineMat);
      m.add(e);
    }
    const c = new THREE.Mesh(geo, capMat);
    c.visible = false;
    m.add(c);
    cutMeshes.push(c);
    return m;
  }

  const model = new THREE.Group();
  scene.add(model);
  const upper = new THREE.Group();
  model.add(upper);
  const jawPivot = new THREE.Group();
  jawPivot.position.copy(PIVOT);
  model.add(jawPivot);
  const lower = new THREE.Group();
  lower.position.set(-PIVOT.x, -PIVOT.y, -PIVOT.z);
  jawPivot.add(lower);

  const anchors = new Map<AnchorId, THREE.Object3D>();
  const anchor = (id: AnchorId, parent: THREE.Object3D, x: number, y: number, z: number) => {
    const o = new THREE.Object3D();
    o.position.set(x, y, z);
    parent.add(o);
    anchors.set(id, o);
  };

  /* Incisives : 6 en haut, 6 en bas, en arc */
  const incGeo = keep(toothShade(new RoundedBoxGeometry(1.1, 2.8, 0.9, 4, 0.26), 2.8, false, 0.2, 0.45));
  const R = 3.7;
  const C = -3.3;
  for (const jaw of ["up", "low"] as const) {
    for (let k = 0; k < 6; k++) {
      const a = (-0.95 + (k * 1.9) / 5) * (jaw === "up" ? 1 : 0.97);
      const g = new THREE.Group();
      g.position.set(Math.sin(a) * R, 0, C + Math.cos(a) * R);
      g.rotation.y = a;
      (jaw === "up" ? upper : lower).add(g);
      const m = solid(incGeo, enamel, g);
      if (jaw === "up") {
        m.position.y = 1.35;
        m.rotation.x = -0.12;
      } else {
        m.position.y = -1.35;
        m.rotation.x = 0.12;
        m.rotation.z = Math.PI;
      }
    }
  }
  anchor("incisives", upper, 0, 1.3, C + R + 0.5);

  /* Gencives : crête continue en U (arcade jugale, barres, incisives) */
  function ridgePath(xBack: number, xFront: number) {
    const pts: THREE.Vector3[] = [];
    pts.push(V(-xBack - 0.2, 0, zOf(5) - 1.5));
    pts.push(V(-xBack - 0.1, 0, zOf(3)));
    pts.push(V(-xFront, 0, ROW_START + 0.4));
    pts.push(V(-3.25, 0, -7.5));
    for (let k = 0; k <= 8; k++) {
      const a = -1.02 + (k * 2.04) / 8;
      pts.push(V(Math.sin(a) * (R - 0.1), 0, C + Math.cos(a) * (R - 0.1)));
    }
    pts.push(V(3.25, 0, -7.5));
    pts.push(V(xFront, 0, ROW_START + 0.4));
    pts.push(V(xBack + 0.1, 0, zOf(3)));
    pts.push(V(xBack + 0.2, 0, zOf(5) - 1.5));
    return new THREE.CatmullRomCurve3(pts, false, "centripetal");
  }
  const ridgeDims = (lowerJaw: boolean) => (z: number) => {
    const cheek = 1 - smooth(-16, -11, z);
    const inc = smooth(-6.5, -3.2, z);
    return {
      w: 2.1 + 1.35 * cheek + 0.25 * inc,
      h: 1.75 + 0.5 * cheek + 0.2 * inc,
      y0: (lowerJaw ? 1.05 : 0.95) + 0.5 * cheek + 0.6 * inc,
    };
  };
  const upRidge = keep(ridgeGeometry(ridgePath(UPPER_X, UPPER_X - 0.35), 1, ridgeDims(false)));
  solid(upRidge, gum, upper, gumCut, false);
  const lowRidge = keep(ridgeGeometry(ridgePath(LOWER_X + 0.05, LOWER_X - 0.15), -1, ridgeDims(true)));
  solid(lowRidge, gum, lower, gumCut, false);
  anchor("barres", lower, -3.3, -1.1, -8.5);

  /* Palais avec rugosités */
  {
    const geo = keep(new THREE.PlaneGeometry(1, 1, 24, 90));
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const u = pos.getX(i) * 2; // -1 → 1
      const v = pos.getZ(i) + 0.5; // 0 (arrière) → 1 (avant)
      const z = -30.5 + v * 30.2;
      const half = z > C ? Math.max(0.25, Math.sqrt(Math.max(0, 3.45 * 3.45 - (z - C) * (z - C)))) : z > ROW_START ? 3.35 : 3.15 + (ROW_START - z) * 0.03;
      const x = u * half;
      const arch = 1.25 * (1 - u * u);
      const rugae = z > -16 ? 0.13 * Math.sin(z * 1.9) * (1 - u * u) : 0;
      pos.setXYZ(i, x, 3.35 + arch + rugae, z);
    }
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, palateMat);
    upper.add(m);
  }

  /* Langue */
  {
    const m = solid(keep(tongueGeometry()), tongueMat, lower, gumCut, false);
    m.position.set(0, -2.55, -1.1);
  }

  /* Dents jugales */
  const cheekGeo = keep(toothShade(new RoundedBoxGeometry(TOOTH_W, TOOTH_H, TOOTH_D, 3, 0.22), TOOTH_H, true, 0.1));
  const tableGeo = keep(new THREE.PlaneGeometry(TOOTH_W - 0.42, TOOTH_D - 0.42));
  const spikeGeo = keep(new THREE.ConeGeometry(0.11, 0.42, 4));
  const hookGeo = keep(new RoundedBoxGeometry(TOOTH_W - 0.3, 1.0, 0.9, 2, 0.2));
  const wolfGeo = keep(new THREE.ConeGeometry(0.3, 1.05, 12));

  const vary = rng(5);
  for (const side of [-1, 1] as const) {
    for (const jaw of ["up", "low"] as const) {
      const isUp = jaw === "up";
      for (let i = 0; i < 6; i++) {
        const g = new THREE.Group();
        const x = side * ((isUp ? UPPER_X : LOWER_X) + i * 0.1);
        g.position.set(x, 0, zOf(i));
        // tables inclinées : bord externe plus bas en haut, bord interne plus haut en bas
        g.rotation.z = -side * TILT;
        (isUp ? upper : lower).add(g);
        const m = solid(cheekGeo, enamel, g);
        // géométrie : occlusion en -y ; retournée pour la mâchoire inférieure
        m.position.y = isUp ? TOOTH_H / 2 : -TOOTH_H / 2;
        if (!isUp) m.rotation.x = Math.PI;
        // légères irrégularités naturelles
        m.scale.set(1 + (vary() - 0.5) * 0.06, 1, 1 + (vary() - 0.5) * 0.04);
        m.rotation.y = (vary() - 0.5) * 0.05;
        // table dentaire
        const t = new THREE.Mesh(tableGeo, isUp ? tableUp : tableLow);
        t.rotation.x = isUp ? Math.PI / 2 : -Math.PI / 2;
        t.position.y = isUp ? -0.012 : 0.012;
        g.add(t);
        // pointes d'émail : bord externe (haut) / interne (bas)
        const edgeX = isUp ? side * (TOOTH_W / 2 + 0.02) : -side * (TOOTH_W / 2 + 0.02);
        for (const dz of [-0.82, 0, 0.82]) {
          const s = new THREE.Mesh(spikeGeo, glow);
          s.position.set(edgeX, isUp ? 0.12 : -0.12, dz);
          // orientée vers l'extérieur et vers le plan d'occlusion
          const out = isUp ? side : -side;
          s.rotation.z = isUp ? -out * 2.2 : -out * 0.94;
          g.add(s);
        }
        // crochet (1re dent jugale supérieure) et rampe (dernière inférieure)
        if (isUp && i === 0) {
          const h = solid(hookGeo, hookMat, g, cut, true);
          h.position.set(0, -0.52, TOOTH_D / 2 - 0.45);
          if (side === -1) anchor("crochet", g, 0, -0.85, TOOTH_D / 2 - 0.2);
        }
        if (!isUp && i === 5) {
          const h = solid(hookGeo, hookMat, g, cut, true);
          h.position.set(0, 0.52, -TOOTH_D / 2 + 0.45);
          if (side === -1) anchor("rampe", g, 0, 0.85, -TOOTH_D / 2 + 0.2);
        }
        if (side === -1 && isUp && i === 1) anchor("premolaires", g, side * -1.3, 2.0, 0);
        if (side === -1 && isUp && i === 4) anchor("molaires", g, side * -1.3, 2.0, 0);
        if (side === -1 && isUp && i === 2) anchor("pointes-haut", g, side * (TOOTH_W / 2 + 0.35), -0.15, -0.4);
        if (side === -1 && !isUp && i === 2) anchor("pointes-bas", g, -side * (TOOTH_W / 2 + 0.3), 0.15, -0.4);
        if (side === -1 && !isUp && i === 3) anchor("tables", g, 0, 0.05, 0);
      }
    }
    // dents de loup (mâchoire supérieure)
    const w = solid(wolfGeo, wolfMat, upper);
    w.position.set(side * 3.75, 1.15, ROW_START + 0.95);
    w.rotation.x = Math.PI;
    if (side === -1) anchor("loup", upper, -3.75, 0.55, ROW_START + 0.95);
  }

  /* Tête : chanfrein, naseaux, lèvres, yeux, oreilles, joues */
  const head = buildHead(upper, lower, PIVOT, opts);

  /* Poussière lumineuse dans le faisceau */
  const dustGeo = keep(new THREE.BufferGeometry());
  {
    const n = opts.mobile ? 140 : 260;
    const arr = new Float32Array(n * 3);
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < n; i++) {
      arr[i * 3] = (rnd() - 0.5) * 22;
      arr[i * 3 + 1] = (rnd() - 0.5) * 12;
      arr[i * 3 + 2] = 10 - rnd() * 44;
    }
    dustGeo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
  }
  const dustMat = new THREE.PointsMaterial({ color: 0xf4d9b0, size: 0.06, transparent: true, opacity: 0, depthWrite: false, sizeAttenuation: true });
  materials.push(dustMat);
  const dust = new THREE.Points(dustGeo, dustMat);
  scene.add(dust);

  /* Plan de coupe (traversée de la bouche) */
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 100);

  const camPos = new THREE.CatmullRomCurve3(CAM.map((k) => k[1]), false, "centripetal");
  const camTgt = new THREE.CatmullRomCurve3(CAM.map((k) => k[2]), false, "centripetal");
  const tmp = new THREE.Vector3();
  const tgt = new THREE.Vector3();
  let width = 1;
  let height = 1;
  let baseFov = camera.fov;

  function camAt(p: number) {
    let i = 0;
    while (i < CAM.length - 2 && p > CAM[i + 1][0]) i++;
    const local = smooth(CAM[i][0], CAM[i + 1][0], p);
    const u = (i + local) / (CAM.length - 1);
    camPos.getPoint(u, camera.position);
    camTgt.getPoint(u, tgt);
    camera.lookAt(tgt);
  }

  function setProgress(p: number) {
    camAt(p);
    // travelling compensé : la caméra recule pendant que le champ se resserre (vue en coupe quasi orthogonale)
    const cutMul = width / height < 0.8 ? 0.8 : 0.66;
    // objectif plus long pour les plans extérieurs (moins de déformation de perspective)
    const outside = Math.max(1 - smooth(0.12, 0.2, p), smooth(0.9, 0.98, p));
    const portrait = width / height < 0.8;
    camera.fov =
      baseFov *
      (1 - (portrait ? 0 : 0.22) * outside) *
      track(
        [
          [0.5, 1],
          [0.585, cutMul],
          [0.64, cutMul],
          [0.72, 1],
        ],
        p,
      );
    if (portrait && outside > 0.001) {
      // écran portrait : la tête entière, reculée et placée sous le titre
      tmp.copy(camera.position).sub(tgt);
      camera.position.copy(tgt).addScaledVector(tmp, 1 + 0.75 * outside);
      camera.setViewOffset(width, height, 0, -height * 0.2 * outside, width, height);
    } else if (camera.view) {
      camera.clearViewOffset();
    }
    camera.updateProjectionMatrix();
    if (width / height < 0.8) {
      // écran portrait : recul supplémentaire pour cadrer les deux arcades en coupe
      camera.position.z += 6 * track(
        [
          [0.5, 0],
          [0.585, 1],
          [0.64, 1],
          [0.72, 0],
        ],
        p,
      );
    }

    // ouverture de la mâchoire
    // ouverture de la mâchoire : les lèvres s'écartent, la bouche s'ouvre largement puis se stabilise
    const jaw = track(
      [
        [0, 0],
        [0.05, 0],
        [0.135, 0.16],
        [0.2, 0.12],
        [0.3, 0.1],
        [0.45, 0.1],
        [0.52, 0.085],
        [0.64, 0.085],
        [0.71, 0.25],
        [0.78, 0.25],
        [0.835, 0.06],
        [0.9, 0.06],
        [0.97, 0.008],
        [1, 0.008],
      ],
      p,
    );
    jawPivot.rotation.x = jaw;
    head.update(jaw);
    // peau : silhouette lumineuse au début, opaque pendant le voyage, transparente pour le profil
    head.setXray(
      Math.max(
        1 - smooth(0.02, 0.095, p),
        win(0.785, 0.82, 0.9, 0.95, p),
      ),
    );
    // brouillard : lointain pour les plans extérieurs, plus dense dans la bouche
    const ext = Math.max(1 - smooth(0.1, 0.2, p), smooth(0.9, 0.98, p));
    (scene.fog as THREE.Fog).near = 18 + 62 * ext;
    (scene.fog as THREE.Fog).far = 66 + 130 * ext;
    key.intensity = 2.2 * ext * Math.max(smooth(0.02, 0.08, p), smooth(0.9, 0.97, p)) + 0.6 * win(0.8, 0.84, 0.9, 0.94, p);

    // lumière : la lampe frontale s'allume, puis l'ambiance
    lamp.intensity = 20 * smooth(0.0, 0.07, p) * (1 - 0.45 * smooth(0.9, 1, p)) * (1 - 0.4 * win(0.32, 0.35, 0.39, 0.42, p));
    hemi.intensity = 0.3 * smooth(0.05, 0.2, p);
    scene.environmentIntensity = 0.26 * smooth(0.04, 0.2, p) * (1 - 0.35 * smooth(0.9, 1, p));
    rim.intensity = 1.6 * smooth(0.06, 0.2, p);
    rim2.intensity = 0.5 * smooth(0.1, 0.25, p) + 0.6 * smooth(0.88, 1, p);
    dustMat.opacity = 0.55 * smooth(0.02, 0.1, p) * (1 - smooth(0.28, 0.4, p)) + 0.35 * smooth(0.9, 1, p);

    // contours lumineux : tracé initial, puis discrets, puis retour en fin de voyage
    lineMat.opacity = 0.9 * smooth(0, 0.035, p) * (1 - 0.86 * smooth(0.06, 0.18, p)) + 0.5 * smooth(0.88, 0.98, p);

    // mises en lumière par chapitre
    wolfMat.emissiveIntensity = 1.4 * win(0.3, 0.335, 0.38, 0.41, p);
    glow.emissiveIntensity = 2.8 * win(0.5, 0.56, 0.64, 0.68, p);
    tableUp.emissiveIntensity = tableLow.emissiveIntensity = 0.75 * win(0.69, 0.73, 0.78, 0.81, p);
    hookMat.emissiveIntensity = 1.6 * win(0.8, 0.83, 0.9, 0.94, p);
    if (bloom) bloom.strength = 0.12 + 0.5 * Math.max(win(0.3, 0.335, 0.38, 0.41, p), win(0.5, 0.56, 0.64, 0.68, p), win(0.69, 0.73, 0.78, 0.81, p), win(0.8, 0.83, 0.9, 0.94, p));

    // plan de coupe : balaie la bouche d'avant en arrière, puis se retire
    const zc = track(
      [
        [0.47, 6],
        [0.565, -20.15],
        [0.64, -20.15],
        [0.72, 6],
      ],
      p,
    );
    const cutting = p > 0.47 && p < 0.72;
    renderer.clippingPlanes = cutting ? [plane] : [];
    plane.constant = zc;
    for (const c of cutMeshes) c.visible = cutting;
  }

  function resize(w: number, h: number) {
    width = Math.max(1, w);
    height = Math.max(1, h);
    renderer.setSize(width, height, false);
    composer?.setSize(width, height);
    camera.aspect = width / height;
    baseFov = width / height < 0.8 ? 58 : opts.mobile ? 50 : 38;
    camera.fov = baseFov;
    camera.updateProjectionMatrix();
  }

  function project(id: AnchorId) {
    const o = anchors.get(id);
    if (!o) return { x: 0, y: 0, visible: false };
    o.getWorldPosition(tmp);
    tmp.project(camera);
    const visible = tmp.z < 1 && tmp.z > -1 && Math.abs(tmp.x) < 1.05 && Math.abs(tmp.y) < 1.05;
    return { x: (tmp.x * 0.5 + 0.5) * width, y: (-tmp.y * 0.5 + 0.5) * height, visible };
  }

  let quality = 1;
  function setQuality(level: number) {
    const q = Math.max(0.5, Math.min(1, level));
    if (Math.abs(q - quality) < 0.01) return;
    quality = q;
    const dpr = Math.max(0.75, maxDpr * q);
    renderer.setPixelRatio(dpr);
    composer?.setPixelRatio(dpr);
    resize(width, height);
  }

  return {
    setProgress,
    resize,
    setQuality,
    render: () => (composer ? composer.render() : renderer.render(scene, camera)),
    project,
    dispose() {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      upperTex.dispose();
      lowerTex.dispose();
      textures.forEach((t) => t.dispose());
      head.dispose();
      envRT.dispose();
      composer?.dispose();
      renderer.dispose();
    },
  };
}

/** Détection WebGL sans créer de contexte durable. */
export function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}
