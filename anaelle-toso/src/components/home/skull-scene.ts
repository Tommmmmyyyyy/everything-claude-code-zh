/**
 * Crâne réel en relief (WebGL) : la photographie d'un crâne d'étude, détourée, est posée sur un
 * plan déformé par une carte de relief (2,5D). Un faisceau de scanner la parcourt et la révèle
 * en « radiographie » (structure interne et contours recalculés à partir de la photo).
 * Rendu à la demande : uniquement quand le défilement ou le pointeur changent.
 */
import * as THREE from "three";
import { siteAsset } from "@/lib/config";

export interface Landmark {
  id: string;
  /** Coordonnées dans la photo détourée (1280 × 793 px). */
  x: number;
  y: number;
}

export interface SkullScene {
  set(state: { reveal: number; scan: number; band: number; xray: number; turn: number; px: number; py: number }): void;
  render(): void;
  resize(w: number, h: number): void;
  project(id: string): { x: number; y: number; u: number };
  dispose(): void;
}

const IMG_W = 1280;
const IMG_H = 793;

const vert = /* glsl */ `
uniform sampler2D tDepth;
uniform float uAmp;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec3 p = position;
  p.z += texture2D(tDepth, uv).r * uAmp;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;

const frag = /* glsl */ `
uniform sampler2D tColor;
uniform sampler2D tRadio;
uniform float uScan;
uniform float uBand;
uniform float uXray;
uniform float uReveal;
varying vec2 vUv;
void main() {
  vec4 c = texture2D(tColor, vUv);
  if (c.a < 0.02) discard;
  float r = texture2D(tRadio, vUv).r;
  // radiographie : os translucide menthe, contours denses plus clairs
  vec3 xr = mix(vec3(0.0, 0.035, 0.03), vec3(0.62, 1.0, 0.88), r) * (0.18 + 1.25 * r);
  // fenêtre de lecture : la radiographie apparaît juste derrière le faisceau
  float win = smoothstep(uScan - 0.2, uScan - 0.015, vUv.x) * (1.0 - smoothstep(uScan - 0.002, uScan + 0.004, vUv.x));
  float x = clamp(max(uXray, win * uBand), 0.0, 1.0);
  vec3 col = mix(c.rgb, xr, x);
  // lignes de balayage discrètes en mode radiographie
  col *= 1.0 - 0.12 * x * step(0.5, fract(gl_FragCoord.y * 0.5));
  // faisceau
  float beam = exp(-pow((vUv.x - uScan) / 0.0032, 2.0)) * uBand;
  col += vec3(0.55, 1.0, 0.85) * beam * 1.6;
  // apparition par balayage vertical
  float rv = smoothstep(uReveal * 1.08 - 0.08, uReveal * 1.08, 1.0 - vUv.y);
  float edge = exp(-pow((1.0 - vUv.y - (uReveal * 1.08 - 0.04)) / 0.012, 2.0)) * step(uReveal, 0.999);
  col += vec3(0.55, 1.0, 0.85) * edge * 1.2;
  gl_FragColor = vec4(col, c.a * (1.0 - rv));
}`;

export function createSkullScene(canvas: HTMLCanvasElement, opts: { mobile: boolean; landmarks: Landmark[]; onReady?: () => void }): SkullScene {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.mobile ? 1.75 : 2));
  // les textures sont lues telles quelles (sRGB) et écrites telles quelles
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 100);
  camera.position.set(0, 0, 10);

  const loader = new THREE.TextureLoader();
  let pending = 3;
  const done = () => {
    if (--pending === 0) opts.onReady?.();
  };
  const tex = (src: string) => {
    const t = loader.load(siteAsset(src), done, undefined, done);
    t.colorSpace = THREE.NoColorSpace;
    t.anisotropy = 8;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    return t;
  };
  const tColor = tex("/images/3d/crane/couleur.webp");
  const tRadio = tex("/images/3d/crane/radio.jpg");
  const tDepth = tex("/images/3d/crane/relief.png");

  // relief lisible côté CPU pour ancrer les étiquettes à la surface
  let depthData: Uint8ClampedArray | null = null;
  let dW = 0;
  let dH = 0;
  {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      dW = c.width = img.naturalWidth;
      dH = c.height = img.naturalHeight;
      const g = c.getContext("2d", { willReadFrequently: true })!;
      g.drawImage(img, 0, 0);
      depthData = g.getImageData(0, 0, dW, dH).data;
    };
    img.src = siteAsset("/images/3d/crane/relief.png");
  }

  const PH = 3.2; // hauteur du plan (unités)
  const PW = (PH * IMG_W) / IMG_H;
  const AMP = 0.62;
  const geo = new THREE.PlaneGeometry(PW, PH, opts.mobile ? 180 : 300, opts.mobile ? 112 : 186);
  const uniforms = {
    tColor: { value: tColor },
    tRadio: { value: tRadio },
    tDepth: { value: tDepth },
    uAmp: { value: AMP },
    uScan: { value: -0.1 },
    uBand: { value: 0 },
    uXray: { value: 0 },
    uReveal: { value: 0 },
  };
  const mat = new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms, transparent: true });
  const mesh = new THREE.Mesh(geo, mat);
  const pivot = new THREE.Group();
  pivot.add(mesh);
  scene.add(pivot);

  const landmarks = new Map<string, Landmark>(opts.landmarks.map((l) => [l.id, l]));
  const tmp = new THREE.Vector3();
  let width = 1;
  let height = 1;

  function depthAt(u: number, v: number) {
    if (!depthData) return 0.5;
    const x = Math.min(dW - 1, Math.max(0, Math.round(u * (dW - 1))));
    const y = Math.min(dH - 1, Math.max(0, Math.round(v * (dH - 1))));
    return depthData[(y * dW + x) * 4] / 255;
  }

  function fit() {
    // le crâne occupe ~72 % de la largeur (paysage) ou presque toute la largeur (portrait)
    const aspect = width / height;
    camera.aspect = aspect;
    const portrait = aspect < 0.85;
    const want = portrait ? 0.9 : 0.6;
    const dist = (PW / want / 2 / Math.tan((camera.fov * Math.PI) / 360)) / aspect;
    camera.position.set(0, 0, Math.max(dist, (PH * (portrait ? 1.9 : 1.25)) / 2 / Math.tan((camera.fov * Math.PI) / 360)));
    camera.updateProjectionMatrix();
    pivot.position.set(portrait ? 0.05 : PW * 0.15, portrait ? -0.42 : -0.16, 0);
  }

  return {
    set({ reveal, scan, band, xray, turn, px, py }) {
      uniforms.uReveal.value = reveal;
      uniforms.uScan.value = scan;
      uniforms.uBand.value = band;
      uniforms.uXray.value = xray;
      // rotation douce : défilement + pointeur (le relief se lit en parallaxe)
      pivot.rotation.y = turn * 0.32 + px * 0.2;
      pivot.rotation.x = -0.06 + py * 0.08;
      pivot.updateMatrixWorld(true);
    },
    render() {
      renderer.render(scene, camera);
    },
    resize(w, h) {
      width = Math.max(1, w);
      height = Math.max(1, h);
      renderer.setSize(width, height, false);
      fit();
    },
    project(id) {
      const lm = landmarks.get(id);
      if (!lm) return { x: -999, y: -999, u: 0 };
      const u = lm.x / IMG_W;
      const v = lm.y / IMG_H;
      tmp.set((u - 0.5) * PW, (0.5 - v) * PH, depthAt(u, v) * AMP);
      mesh.localToWorld(tmp);
      tmp.project(camera);
      return { x: (tmp.x * 0.5 + 0.5) * width, y: (-tmp.y * 0.5 + 0.5) * height, u };
    },
    dispose() {
      geo.dispose();
      mat.dispose();
      tColor.dispose();
      tRadio.dispose();
      tDepth.dispose();
      renderer.dispose();
    },
  };
}
