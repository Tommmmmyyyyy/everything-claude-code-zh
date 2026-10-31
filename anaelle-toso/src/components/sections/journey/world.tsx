/**
 * Décors du parcours du camion, couche par couche.
 * Coordonnées « monde » : hauteur 900, sol (contact des pneus) à GROUND.
 * Un élément destiné à apparaître à l'abscisse écran X (0 = centre) lorsque la caméra
 * est en C, sur une couche de vitesse s, est placé en x = X + C·s + OFFSET.
 */
import { grassPath, hillPath } from "@/lib/svg";
import { Barn, Church, Farmhouse, Fence, Hedge, HangingLamp, Oak, Poplar, SceneHorse, ScenePerson, StableInterior } from "@/components/illustrations/scenery";

export const H = 900;
export const GROUND = 790;
export const OFFSET = 1400;
export const C_END = 9000;
export const C_SWITCH = 4250;
export const ENTRANCE_C = 3000;
export const EXIT_C = 5500;

export const SPEED = { far: 0.16, mid: 0.4, near: 0.72, ground: 1, fg: 1.3 } as const;

export const layerWidth = (s: number) => Math.ceil(OFFSET * 2 + C_END * s + 800);
export const at = (X: number, C: number, s: number) => X + C * s + OFFSET;

/* Palettes */
const P = {
  dawnFar: "#2b3329",
  dawnFar2: "#222a21",
  dawnMid: "#19211a",
  dawnNear: "#121811",
  road: "#17140f",
  fg: "#080a07",
  dayFar: "#5d6a50",
  dayFar2: "#4b5a42",
  dayMid: "#36452f",
  dayNear: "#253222",
  track: "#3b2f20",
  dayFg: "#141b11",
};

function LayerSvg({ s, children }: { s: number; children: React.ReactNode }) {
  const w = layerWidth(s);
  return (
    <svg viewBox={`0 0 ${w} ${H}`} preserveAspectRatio="xMinYMin meet" className="h-full w-full overflow-visible" aria-hidden="true">
      {children}
    </svg>
  );
}

/* ── Couche lointaine ──────────────────────────────────────── */
export function FarLayer() {
  const s = SPEED.far;
  const w = layerWidth(s);
  return (
    <LayerSvg s={s}>
      <g data-scene="road">
        <path d={hillPath({ width: w, baseY: 600, amp: 70, seed: 11, step: 120 })} fill={P.dawnFar} />
        <Church x={at(380, 900, s)} y={622} s={0.55} fill={P.dawnFar2} />
        <path d={hillPath({ width: w, baseY: 650, amp: 40, seed: 12, step: 100 })} fill={P.dawnFar2} />
      </g>
      <g data-scene="pasture" opacity="0">
        <path d={hillPath({ width: w, baseY: 585, amp: 80, seed: 21, step: 120 })} fill={P.dayFar} />
        <path d={hillPath({ width: w, baseY: 640, amp: 45, seed: 22, step: 100 })} fill={P.dayFar2} />
        {[1400, 1900, 2600, 3300, 3900].map((x, i) => (
          <Oak key={x} x={x} y={650 - (i % 2) * 8} h={70 + (i % 3) * 14} fill={P.dayFar2} seed={x} />
        ))}
      </g>
    </LayerSvg>
  );
}

/* ── Couche intermédiaire ──────────────────────────────────── */
export function MidLayer() {
  const s = SPEED.mid;
  const w = layerWidth(s);
  const poplars: number[] = [];
  for (let x = 260; x < 3900; x += 150) if (x < 2200 || x > 3500) poplars.push(x);
  return (
    <LayerSvg s={s}>
      <g data-scene="road">
        <path d={hillPath({ width: w, baseY: 700, amp: 26, seed: 31, step: 90 })} fill={P.dawnMid} />
        <Farmhouse x={at(-420, 1500, s)} y={712} s={0.9} fill={P.dawnMid} light="#e7a95f" />
        {poplars.map((x, i) => (
          <Poplar key={x} x={x} y={705} h={150 + ((i * 37) % 60)} fill={P.dawnMid} />
        ))}
        <Barn x={at(-80, 2750, s)} y={712} w={720} h={230} fill="#1a1510" trim="#2a1f15" light="#e5a457" />
      </g>
      <g data-scene="pasture" opacity="0">
        <path d={hillPath({ width: w, baseY: 690, amp: 34, seed: 41, step: 90 })} fill={P.dayMid} />
        {[2500, 2780, 3600, 4300, 4520, 5300, 5900].map((x, i) => (
          <Oak key={x} x={x} y={700} h={150 + (i % 3) * 30} fill={P.dayMid} seed={x + 3} />
        ))}
        <SceneHorse x={at(-300, 6200, s)} y={712} s={0.13} fill="#1f1912" pose="grazing" />
        <SceneHorse x={at(120, 6500, s)} y={716} s={0.12} fill="#2a1d13" />
        <SceneHorse x={at(-120, 7600, s)} y={712} s={0.13} fill="#1a140e" pose="grazing" flip />
        <SceneHorse x={at(340, 8200, s)} y={714} s={0.12} fill="#3b2818" pose="grazing" />
        <Fence x0={2600} x1={6400} y={724} h={26} every={70} fill="#2c3a28" />
      </g>
    </LayerSvg>
  );
}

/* ── Couche proche ─────────────────────────────────────────── */
export function NearLayer() {
  const s = SPEED.near;
  return (
    <LayerSvg s={s}>
      <g data-scene="road">
        <Hedge x={200} y={772} w={1500} h={46} fill={P.dawnNear} seed={51} />
        <Oak x={at(520, 700, s)} y={772} h={330} fill={P.dawnNear} seed={52} />
        <Hedge x={2100} y={772} w={900} h={52} fill={P.dawnNear} seed={53} />
        <Oak x={at(-600, 2300, s)} y={772} h={300} fill={P.dawnNear} seed={54} />
        {/* Panneau « Écurie » */}
        <g transform={`translate(${at(260, 1900, s)} 772)`}>
          <rect x="-3" y="-120" width="6" height="120" fill={P.dawnNear} />
          <path d="M -60 -128 L 52 -128 L 70 -112 L 52 -96 L -60 -96 Z" fill="#c07a43" />
          <text x="-48" y="-106" fontFamily="var(--font-sans), sans-serif" fontSize="15" fontWeight="500" letterSpacing="2" fill="#0d0a07">
            ÉCURIE
          </text>
        </g>
        <Fence x0={3200} x1={4800} y={772} h={56} every={120} fill="#1d1a13" />
      </g>
      <g data-scene="pasture" opacity="0">
        <path d={hillPath({ width: 9000, x0: 3200, baseY: 760, amp: 14, seed: 61, step: 120 })} fill={P.dayNear} />
        <Oak x={at(-520, 6000, s)} y={772} h={360} fill={P.dayNear} seed={62} />
        <SceneHorse x={at(150, 6700, s)} y={772} s={0.24} fill="#2b1d12" pose="grazing" />
        <SceneHorse x={at(-480, 7300, s)} y={774} s={0.23} fill="#14100b" flip />
        <Oak x={at(600, 7700, s)} y={772} h={300} fill={P.dayNear} seed={63} />
        <Fence x0={at(-1100, 5600, s)} x1={at(1100, 9000, s)} y={776} h={70} every={150} fill="#d9c4a0" rails={2} />
      </g>
    </LayerSvg>
  );
}

/* ── Sol (vitesse 1) + scène finale ───────────────────────── */
export function GroundLayer() {
  const s = SPEED.ground;
  const w = layerWidth(s);
  const finalX = at(0, C_END, s);
  return (
    <LayerSvg s={s}>
      <g data-scene="road">
        <rect x="0" y={GROUND - 12} width={w} height={H} fill={P.road} />
        <rect x="0" y={GROUND - 14} width={w} height={3} fill="#2a241b" />
        <path d={`M 0 ${GROUND + 44} H ${w}`} stroke="#d9c4a0" strokeOpacity="0.45" strokeWidth="4" strokeDasharray="70 90" />
      </g>
      <g data-scene="pasture" opacity="0">
        <rect x="0" y={GROUND - 14} width={w} height={H} fill={P.dayNear} />
        <rect x="0" y={GROUND - 10} width={w} height={70} fill={P.track} />
        <path d={grassPath({ width: w - 4000, x0: 4000, baseY: GROUND - 8, height: 18, density: 0.08, seed: 71 })} fill={P.dayNear} />
        {/* Scène finale : le cheval attend, Anaëlle à sa tête */}
        <g data-final>
          <SceneHorse x={finalX + 130} y={GROUND} s={0.41} fill="#2b1b10" far="#1d130b" flip />
          <g data-person>
            <ScenePerson x={finalX + 30} y={GROUND} s={0.41} fill="#0e0b08" />
          </g>
          {/* Lampe frontale / éclairage d'examen */}
          <circle data-examlight cx={finalX + 146} cy={GROUND - 176} r="70" fill="url(#examGlow)" opacity="0" />
          {/* Mallette au sol */}
          <rect x={finalX - 30} y={GROUND - 34} width="54" height="34" rx="4" fill="#3a2618" />
          <rect x={finalX - 12} y={GROUND - 40} width="18" height="7" rx="3" fill="none" stroke="#3a2618" strokeWidth="3" />
        </g>
      </g>
      <defs>
        <radialGradient id="examGlow">
          <stop offset="0" stopColor="#fff1cf" stopOpacity="0.95" />
          <stop offset="1" stopColor="#fff1cf" stopOpacity="0" />
        </radialGradient>
      </defs>
    </LayerSvg>
  );
}

/* ── Premier plan (vitesse 1,3) : herbes, piliers, chambranles ─ */
export function ForegroundLayer() {
  const s = SPEED.fg;
  const w = layerWidth(s);
  const entrance = at(0, ENTRANCE_C, s);
  const exit = at(0, EXIT_C, s);
  const pillars: number[] = [];
  for (let x = entrance + 700; x < exit - 500; x += 820) pillars.push(x);
  return (
    <LayerSvg s={s}>
      <g data-scene="road">
        <path d={grassPath({ width: entrance - 400, baseY: H + 4, height: 120, density: 0.05, seed: 81 })} fill={P.fg} />
      </g>
      <g data-scene="pasture" opacity="0">
        <path d={grassPath({ width: w - exit - 200, x0: exit + 200, baseY: H + 4, height: 150, density: 0.06, seed: 82 })} fill={P.dayFg} />
        <Fence x0={exit + 1600} x1={exit + 2900} y={H + 10} h={120} every={260} fill="#0f140d" />
      </g>
      {/* Piliers de l'allée d'écurie */}
      {pillars.map((x) => (
        <g key={x}>
          <rect x={x - 26} y={-2400} width={52} height={H + 2400} fill="#0b0805" />
          <rect x={x - 26} y={-2400} width={4} height={H + 2400} fill="#3a2a1c" />
          <path d={`M ${x - 26} 120 L ${x - 160} 20 L ${x - 150} 8 L ${x - 26} 100 Z`} fill="#0b0805" />
        </g>
      ))}
      {/* Chambranles d'entrée et de sortie : effet de passage */}
      {[entrance, exit].map((x, i) => (
        <g key={x}>
          <rect x={x - 180} y={-2400} width={360} height={H + 2400} fill="#0a0705" />
          <rect x={i === 0 ? x - 180 : x + 172} y={-2400} width={8} height={H + 2400} fill="#e2a965" opacity="0.5" />
          <rect x={x - 140} y={-2400} width={4} height={H + 2400} fill="#20170f" />
          <rect x={x + 120} y={-2400} width={4} height={H + 2400} fill="#20170f" />
          {i === 0 && (
            <g transform={`translate(${x - 110} 420)`}>
              <rect width="220" height="54" rx="4" fill="#3a2618" />
              <text x="110" y="35" textAnchor="middle" fontFamily="var(--font-serif), serif" fontSize="30" fill="#f4eadb">
                Écurie
              </text>
            </g>
          )}
        </g>
      ))}
    </LayerSvg>
  );
}

/* ── Intérieur de l'écurie (rendu entre les deux chambranles) ─ */
export function InteriorWall() {
  const s = SPEED.near;
  const x0 = at(-1300, ENTRANCE_C - 400, s);
  const x1 = at(1300, EXIT_C + 400, s);
  const lamps: number[] = [];
  for (let x = x0 + 240; x < x1 - 200; x += 520) lamps.push(x);
  return (
    <LayerSvg s={s}>
      <defs>
        <radialGradient id="lampGlow">
          <stop offset="0" stopColor="#ffc979" stopOpacity="0.42" />
          <stop offset="0.5" stopColor="#d98a3f" stopOpacity="0.12" />
          <stop offset="1" stopColor="#d98a3f" stopOpacity="0" />
        </radialGradient>
      </defs>
      <StableInterior x0={x0} x1={x1} y={GROUND - 30} />
      {lamps.map((x) => (
        <HangingLamp key={x} x={x} y={GROUND - 482} len={90} />
      ))}
    </LayerSvg>
  );
}

export function InteriorFloor() {
  const s = SPEED.ground;
  const x0 = at(-1300, ENTRANCE_C - 400, s);
  const x1 = at(1300, EXIT_C + 400, s);
  return (
    <LayerSvg s={s}>
      <rect x={x0} y={GROUND - 30} width={x1 - x0} height={H} fill="#2a2119" />
      <rect x={x0} y={GROUND - 30} width={x1 - x0} height={4} fill="#3d3024" />
      {Array.from({ length: Math.floor((x1 - x0) / 140) }, (_, i) => (
        <rect key={i} x={x0 + i * 140} y={GROUND - 26} width={2} height={H} fill="#1d1711" />
      ))}
      {/* Copeaux / paille au sol */}
      <path d={grassPath({ width: x1 - x0, x0, baseY: GROUND - 26, height: 8, density: 0.05, seed: 91, lean: 1.4 })} fill="#6e5530" opacity="0.6" />
    </LayerSvg>
  );
}
