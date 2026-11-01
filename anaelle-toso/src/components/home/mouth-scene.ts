/**
 * « L'anatomie en mouvement » — scène Three.js procédurale (aucun modèle externe).
 * Modèle simplifié et pédagogique d'une bouche de cheval : incisives, barres, dents de loup,
 * prémolaires et molaires (mâchoire supérieure plus large), tables dentaires, pointes d'émail,
 * crochet et rampe. La caméra suit un trajet piloté par la progression du défilement (0 → 1).
 */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export type AnchorId = "incisives" | "barres" | "loup" | "premolaires" | "molaires" | "pointes-haut" | "pointes-bas" | "tables" | "crochet" | "rampe";

export interface MouthScene {
  setProgress(p: number): void;
  resize(w: number, h: number): void;
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
  [0.0, V(0, 0.8, 36), V(0, -0.4, -6)],
  [0.1, V(0, 0.3, 15.5), V(0, -0.7, -3)],
  [0.2, V(1.1, -0.1, 6.8), V(0, -1, 0)],
  [0.255, V(0, -1.5, 3), V(0, -1.7, -6)], // dans l'axe de l'ouverture
  [0.3, V(0.3, -1, -3.2), V(-3.3, -2.6, -10)], // les barres
  [0.36, V(-0.4, 0.1, -6.6), V(-3.7, 0.7, -14)], // dent de loup
  [0.445, V(0.3, 0.3, -11.2), V(-4.3, -0.2, -23)], // l'arcade
  [0.52, V(0, -0.4, -2), V(0, -0.6, -21)], // recul pendant la coupe
  [0.585, V(0, -0.6, 7), V(0, -0.6, -20)], // vue en coupe (dolly zoom)
  [0.64, V(0, -0.6, 7.5), V(0, -0.6, -20)],
  [0.745, V(-0.7, 2.2, -16.2), V(-3.9, -2.2, -23)], // tables
  [0.775, V(0, -1.6, -2.5), V(-3.6, -1.6, -20)], // recul entre les mâchoires ouvertes
  [0.8, V(-6, -1.4, 9), V(-4.2, -0.8, -18)], // sortie par l'avant, trois-quarts
  [0.835, V(-24, 0.6, -21.5), V(-4.2, -0.4, -21.5)], // profil : surdents
  [0.9, V(-24.5, 0.9, -21.8), V(-4.2, -0.4, -21.8)],
  [1.0, V(-19, 11.5, 23), V(0, -0.8, -13)],
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

export function createMouthScene(canvas: HTMLCanvasElement, opts: { mobile: boolean }): MouthScene {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.mobile ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0d0a07, 16, 64);

  const camera = new THREE.PerspectiveCamera(opts.mobile ? 52 : 38, 1, 0.1, 200);
  scene.add(camera);

  /* Lumières : lampe frontale (sur la caméra), ambiance chaude, contre-jour cognac */
  const lamp = new THREE.SpotLight(0xffe4bf, 0, 0, 0.62, 0.65, 1.1);
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

  /* Matériaux */
  const enamel = new THREE.MeshPhysicalMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.33, metalness: 0, clearcoat: 0.55, clearcoatRoughness: 0.32, emissive: 0x2a1c10, emissiveIntensity: 0.12 });
  const cut = new THREE.MeshBasicMaterial({ color: 0x9b7c58, side: THREE.BackSide });
  const gum = new THREE.MeshPhysicalMaterial({ color: 0x542823, roughness: 0.62, metalness: 0, clearcoat: 0.18, clearcoatRoughness: 0.6 });
  const gumCut = new THREE.MeshBasicMaterial({ color: 0x3a1714, side: THREE.BackSide });
  const palateMat = new THREE.MeshStandardMaterial({ color: 0x55241f, roughness: 0.62, side: THREE.DoubleSide });
  const tongueMat = new THREE.MeshStandardMaterial({ color: 0x5e2e29, roughness: 0.66 });
  const glow = new THREE.MeshStandardMaterial({ color: 0xeadcc3, roughness: 0.3, emissive: 0xff8f45, emissiveIntensity: 0 });
  const hookMat = new THREE.MeshPhysicalMaterial({ color: 0xeee3cd, roughness: 0.33, clearcoat: 0.5, emissive: 0xff8f45, emissiveIntensity: 0 });
  const wolfMat = new THREE.MeshPhysicalMaterial({ color: 0xeee3cd, roughness: 0.33, clearcoat: 0.5, emissive: 0xff8f45, emissiveIntensity: 0 });
  const upperTex = tableTexture("upper");
  const lowerTex = tableTexture("lower");
  const tableUp = new THREE.MeshStandardMaterial({ map: upperTex, emissiveMap: upperTex, emissive: 0xffe6c4, emissiveIntensity: 0, roughness: 0.5 });
  const tableLow = new THREE.MeshStandardMaterial({ map: lowerTex, emissiveMap: lowerTex, emissive: 0xffe6c4, emissiveIntensity: 0, roughness: 0.5 });
  const lineMat = new THREE.LineBasicMaterial({ color: 0xf4eadb, transparent: true, opacity: 0, depthWrite: false, fog: true });
  const materials: THREE.Material[] = [enamel, cut, gum, gumCut, palateMat, tongueMat, glow, hookMat, wolfMat, tableUp, tableLow, lineMat];
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
  function toothShade(geo: THREE.BufferGeometry, h: number, ridges: boolean, taper: number) {
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const tip = new THREE.Color(0xf3ead8);
    const base = new THREE.Color(0xc7a77a);
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
  const incGeo = keep(toothShade(new RoundedBoxGeometry(1.12, 2.7, 0.92, 3, 0.24), 2.7, false, 0.18));
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
  function ridgePath(xBack: number, xFront: number, y: number) {
    const pts: THREE.Vector3[] = [];
    pts.push(V(-xBack - 0.15, y, zOf(5) - 1.6));
    pts.push(V(-xBack, y, zOf(3)));
    pts.push(V(-xFront, y, ROW_START + 0.6));
    pts.push(V(-3.3, y, -7));
    for (let k = 0; k <= 8; k++) {
      const a = -1.05 + (k * 2.1) / 8;
      pts.push(V(Math.sin(a) * (R - 0.15), y, C + Math.cos(a) * (R - 0.15)));
    }
    pts.push(V(3.3, y, -7));
    pts.push(V(xFront, y, ROW_START + 0.6));
    pts.push(V(xBack, y, zOf(3)));
    pts.push(V(xBack + 0.15, y, zOf(5) - 1.6));
    return new THREE.CatmullRomCurve3(pts, false, "centripetal");
  }
  const upRidge = keep(new THREE.TubeGeometry(ridgePath(UPPER_X, UPPER_X - 0.3, 3.05), 220, 1.45, 14, false));
  solid(upRidge, gum, upper, gumCut, false);
  const lowRidge = keep(new THREE.TubeGeometry(ridgePath(LOWER_X, LOWER_X - 0.2, -3.0), 220, 1.35, 14, false));
  solid(lowRidge, gum, lower, gumCut, false);
  anchor("barres", lower, -3.35, -1.75, -8.5);

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
    const geo = keep(new THREE.SphereGeometry(1, 40, 24));
    const m = solid(geo, tongueMat, lower, gumCut, false);
    m.scale.set(2.15, 1.05, 12.5);
    m.position.set(0, -2.6, -19.5);
    const tip = solid(keep(new THREE.SphereGeometry(1, 28, 18)), tongueMat, lower, gumCut, false);
    tip.scale.set(1.75, 0.68, 3.0);
    tip.position.set(0, -2.6, -8.6);
  }

  /* Dents jugales */
  const cheekGeo = keep(toothShade(new RoundedBoxGeometry(TOOTH_W, TOOTH_H, TOOTH_D, 3, 0.22), TOOTH_H, true, 0.1));
  const tableGeo = keep(new THREE.PlaneGeometry(TOOTH_W - 0.42, TOOTH_D - 0.42));
  const spikeGeo = keep(new THREE.ConeGeometry(0.11, 0.42, 4));
  const hookGeo = keep(new RoundedBoxGeometry(TOOTH_W - 0.3, 1.0, 0.9, 2, 0.2));
  const wolfGeo = keep(new THREE.ConeGeometry(0.3, 1.05, 12));

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
    const cutMul = width / height < 0.8 ? 0.88 : 0.66;
    camera.fov =
      baseFov *
      track(
        [
          [0.5, 1],
          [0.585, cutMul],
          [0.64, cutMul],
          [0.72, 1],
        ],
        p,
      );
    camera.updateProjectionMatrix();
    if (width / height < 0.8) {
      // écran portrait : recul supplémentaire pour cadrer les deux arcades en coupe
      camera.position.z += 14 * track(
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
    jawPivot.rotation.x = track(
      [
        [0, 0.02],
        [0.1, 0.05],
        [0.2, 0.075],
        [0.3, 0.1],
        [0.45, 0.1],
        [0.52, 0.085],
        [0.64, 0.085],
        [0.71, 0.25],
        [0.78, 0.25],
        [0.835, 0.06],
        [1, 0.07],
      ],
      p,
    );
    model.rotation.y = track(
      [
        [0, -0.55],
        [0.12, 0],
        [0.88, 0],
        [1, 0.32],
      ],
      p,
    );

    // lumière : la lampe frontale s'allume, puis l'ambiance
    lamp.intensity = 38 * smooth(0.0, 0.07, p) * (1 - 0.45 * smooth(0.9, 1, p));
    hemi.intensity = 0.55 * smooth(0.05, 0.2, p);
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

  return {
    setProgress,
    resize,
    render: () => renderer.render(scene, camera),
    project,
    dispose() {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      upperTex.dispose();
      lowerTex.dispose();
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
