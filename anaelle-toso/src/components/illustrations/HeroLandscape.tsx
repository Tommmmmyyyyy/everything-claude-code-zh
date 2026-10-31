/**
 * Lever de soleil sur la pâture — décor du hero en couches (parallaxe souris + défilement).
 * Chaque couche porte data-depth (amplitude de parallaxe).
 */
import { grassPath, hillPath } from "@/lib/svg";
import { Fence, Oak, Poplar, SceneHorse } from "./scenery";
import { HORSE_FAR_LEGS, HORSE_GRAZING, HORSE_STANDING } from "./silhouettes";

const W = 1800;
const Hh = 1000;

function Layer({ depth, children, className = "" }: { depth: number; children: React.ReactNode; className?: string }) {
  return (
    <div data-depth={depth} className={`absolute inset-[-4%] will-change-transform ${className}`}>
      <svg viewBox={`0 0 ${W} ${Hh}`} preserveAspectRatio="xMidYMax slice" className="h-full w-full" aria-hidden="true">
        {children}
      </svg>
    </div>
  );
}

export function HeroLandscape() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Ciel */}
      <div
        data-depth="0.02"
        className="absolute inset-[-4%]"
        style={{
          background:
            "linear-gradient(to bottom, #070b08 0%, #101810 22%, #2a2a1c 44%, #6b4a2b 60%, #c4834a 72%, #eab47a 79%, #f5cf98 82%)",
        }}
      />
      {/* Soleil */}
      <div data-depth="0.04" className="absolute inset-[-4%]">
        <div className="absolute left-[56%] top-[61%] aspect-square w-[min(34vw,420px)] -translate-x-1/2 -translate-y-1/2">
          <div
            data-sun
            className="h-full w-full rounded-full"
            style={{
              background:
                "radial-gradient(circle, #fff6e2 0 13%, rgba(255,232,190,0.75) 15%, rgba(255,214,150,0.28) 32%, rgba(240,170,100,0) 68%)",
            }}
          />
        </div>
      </div>

      <Layer depth={0.06}>
        <path d={hillPath({ width: W, baseY: 690, amp: 46, seed: 5, step: 90, bottom: Hh })} fill="#4b3a26" opacity="0.85" />
        {[180, 260, 1320, 1400, 1480, 1600].map((x, i) => (
          <Poplar key={x} x={x} y={690 + (i % 2) * 6} h={110 + (i % 3) * 18} fill="#3b2e1f" />
        ))}
      </Layer>

      {/* Brume */}
      <div
        data-depth="0.08"
        data-mist
        className="absolute inset-x-[-10%] top-[64%] h-[14%] opacity-70 blur-2xl"
        style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(255,226,180,0.55), rgba(255,226,180,0) 70%)" }}
      />

      <Layer depth={0.12}>
        <path d={hillPath({ width: W, baseY: 760, amp: 38, seed: 8, step: 80, bottom: Hh })} fill="#2a2618" />
        <Oak x={330} y={752} h={190} fill="#211d13" seed={9} />
        <Oak x={1480} y={760} h={160} fill="#211d13" seed={10} />
        <SceneHorse x={960} y={770} s={0.09} fill="#1c180f" pose="grazing" />
        <SceneHorse x={1060} y={772} s={0.085} fill="#1c180f" flip />
      </Layer>

      <Layer depth={0.2}>
        {/* Colline proche et cheval à contre-jour */}
        <path
          d="M 0 900 C 260 860, 520 842, 760 836 C 1000 830, 1200 800, 1380 770 C 1520 748, 1660 744, 1800 752 L 1800 1000 L 0 1000 Z"
          fill="#15140d"
        />
        <Fence x0={-20} x1={900} y={866} h={46} every={120} fill="#15140d" />
        <g transform="translate(1110 772) scale(-0.29 0.29) translate(-1000 -680)">
          <path d={HORSE_FAR_LEGS} fill="#0f0d08" />
          <path d={HORSE_STANDING} fill="#120f0a" />
          {/* Liseré de lumière (contre-jour) */}
          <path d={HORSE_STANDING} fill="none" stroke="#f0b877" strokeOpacity="0.55" strokeWidth="5" />
        </g>
        <g transform="translate(1470 752) scale(0.2 0.2) translate(0 -680)" opacity="0.95">
          <path d={HORSE_FAR_LEGS} fill="#0f0d08" />
          <path d={HORSE_GRAZING} fill="#120f0a" />
          <path d={HORSE_GRAZING} fill="none" stroke="#f0b877" strokeOpacity="0.4" strokeWidth="5" />
        </g>
      </Layer>

      <Layer depth={0.34}>
        <path d={grassPath({ width: W, baseY: Hh + 6, height: 120, density: 0.09, seed: 13 })} fill="#090806" />
        <path d={grassPath({ width: W, baseY: Hh + 6, height: 60, density: 0.12, seed: 14 })} fill="#0d0b07" />
      </Layer>
    </div>
  );
}
