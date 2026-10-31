/**
 * Le camion d'Anaëlle — fourgon utilitaire vu de profil, orienté vers la droite.
 * viewBox 640 × 300, roues centrées en (150, 250) et (500, 250), rayon 40, sol à y = 290.
 * Les groupes [data-wheel], [data-body], [data-door] et [data-beam] sont animés par la section « Le camion ».
 */
export function Van({ livery = "ANAËLLE TOSO", sub = "Dentisterie équine", idSuffix = "v" }: { livery?: string; sub?: string; idSuffix?: string }) {
  const id = (n: string) => `${n}-${idSuffix}`;
  return (
    <svg viewBox="0 0 640 300" className="h-full w-full overflow-visible" aria-hidden="true">
      <defs>
        <linearGradient id={id("body")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3eadb" />
          <stop offset="0.55" stopColor="#e6dac4" />
          <stop offset="1" stopColor="#c9b99c" />
        </linearGradient>
        <linearGradient id={id("glass")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3b342b" />
          <stop offset="0.45" stopColor="#15110d" />
          <stop offset="1" stopColor="#2a241d" />
        </linearGradient>
        <linearGradient id={id("beam")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffe9c4" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffe9c4" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={id("inside")} cx="0.5" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#f2c47e" stopOpacity="0.9" />
          <stop offset="1" stopColor="#3a2618" />
        </radialGradient>
        <radialGradient id={id("shadow")} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#000" stopOpacity="0.55" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ombre portée au sol */}
      <ellipse cx="325" cy="291" rx="330" ry="14" fill={`url(#${id("shadow")})`} />

      {/* Faisceau des phares (visible dans l'écurie) */}
      <g data-beam opacity="0">
        <path d="M 612 156 L 900 120 L 900 250 Z" fill={`url(#${id("beam")})`} />
      </g>

      <g data-body>
        {/* Carrosserie */}
        <path
          d="M 30 52 C 30 40, 38 32, 52 31 L 420 27 C 438 27, 452 30, 466 38 L 486 50 L 566 128 C 572 134, 580 138, 590 140
             L 612 146 C 622 149, 626 156, 627 168 L 628 236 C 628 244, 624 250, 616 252 L 552 254
             A 54 54 0 0 0 446 254 L 204 254 A 54 54 0 0 0 96 254 L 40 254 C 32 254, 28 248, 28 240 Z"
          fill={`url(#${id("body")})`}
        />
        {/* Bandeau vert forêt et filet cognac */}
        <path d="M 28 196 L 628 196 L 628 236 C 628 244, 624 250, 616 252 L 552 254 A 54 54 0 0 0 446 254 L 204 254 A 54 54 0 0 0 96 254 L 40 254 C 32 254, 28 248, 28 240 Z" fill="#172a1e" />
        <rect x="28" y="190" width="600" height="3" fill="#c07a43" />

        {/* Ouverture de la porte latérale (révélée quand la porte coulisse) */}
        <rect x="300" y="52" width="122" height="186" rx="4" fill={`url(#${id("inside")})`} />
        <g opacity="0.85">
          <rect x="310" y="96" width="102" height="4" fill="#1a120b" />
          <rect x="310" y="150" width="102" height="4" fill="#1a120b" />
          <rect x="318" y="72" width="16" height="24" rx="2" fill="#7a4b2a" />
          <rect x="340" y="80" width="26" height="16" rx="2" fill="#9cae8e" />
          <rect x="372" y="74" width="12" height="22" rx="2" fill="#d9c4a0" />
          <rect x="320" y="122" width="40" height="28" rx="3" fill="#3a2618" />
          <rect x="366" y="128" width="34" height="22" rx="3" fill="#c07a43" />
          <rect x="314" y="190" width="94" height="44" rx="4" fill="#2a1e14" />
        </g>

        {/* Vitrage cabine */}
        <path d="M 438 50 L 478 50 L 548 126 L 438 126 Z" fill={`url(#${id("glass")})`} />
        <path d="M 488 54 L 560 128 L 575 136 L 498 52 Z" fill={`url(#${id("glass")})`} opacity="0.9" />
        <path d="M 450 56 L 462 56 L 456 120 L 446 120 Z" fill="#fff" opacity="0.08" />

        {/* Lignes de carrosserie */}
        <g fill="none" stroke="#9f9078" strokeWidth="1.4">
          <path d="M 432 34 L 434 250" />
          <path d="M 296 36 L 296 250" />
          <path d="M 568 140 C 580 150, 600 152, 626 152" />
        </g>
        <rect x="408" y="140" width="16" height="4" rx="2" fill="#8a7c66" />
        <rect x="536" y="146" width="18" height="4" rx="2" fill="#8a7c66" />

        {/* Marquage */}
        <g fill="#172a1e">
          <text x="56" y="110" fontFamily="var(--font-serif), serif" fontSize="31" letterSpacing="0.5" textLength="226" lengthAdjust="spacingAndGlyphs">
            {livery}
          </text>
          <text x="58" y="136" fontFamily="var(--font-sans), sans-serif" fontSize="10.5" fontWeight="500" letterSpacing="2.6">
            {sub.toUpperCase()}
          </text>
        </g>
        <path d="M 58 150 L 282 150" stroke="#c07a43" strokeWidth="1.5" strokeDasharray="4 4" />

        {/* Porte latérale coulissante */}
        <g data-door>
          <rect x="300" y="38" width="128" height="200" fill={`url(#${id("body")})`} />
          <rect x="300" y="190" width="128" height="3" fill="#c07a43" />
          <rect x="300" y="196" width="128" height="42" fill="#172a1e" />
          <path d="M 300 38 L 300 238 M 428 38 L 428 238" stroke="#9f9078" strokeWidth="1.4" />
          <rect x="410" y="120" width="12" height="4" rx="2" fill="#8a7c66" />
        </g>


        {/* Rétroviseur, phare, feu arrière, pare-chocs */}
        <path d="M 540 104 L 556 100 L 560 124 L 546 126 Z" fill="#1a1510" />
        <path d="M 598 150 L 620 154 C 624 156, 625 162, 622 166 L 602 164 Z" fill="#fff4dc" />
        <circle cx="612" cy="158" r="16" fill="#ffe9c4" opacity="0.25" data-headlight />
        <rect x="26" y="64" width="8" height="54" rx="3" fill="#c07a43" />
        <path d="M 606 226 L 630 226 L 630 246 C 630 252, 626 256, 620 256 L 606 256 Z" fill="#1a1510" />
        <path d="M 24 228 L 46 228 L 46 256 L 30 256 C 26 256, 24 252, 24 248 Z" fill="#1a1510" />
      </g>

      {/* Roues */}
      {[150, 500].map((cx) => (
        <g key={cx} transform={`translate(${cx} 250)`}>
          <circle r="41" fill="#100c08" />
          <circle r="34" fill="none" stroke="#2a221a" strokeWidth="3" />
          <g data-wheel>
            <circle r="23" fill="#b9a688" />
            <circle r="23" fill="none" stroke="#7d6c55" strokeWidth="2" />
            {[0, 72, 144, 216, 288].map((a) => (
              <rect key={a} x="-3" y="-21" width="6" height="15" rx="2" fill="#7d6c55" transform={`rotate(${a})`} />
            ))}
            <circle r="7" fill="#4a3d2f" />
            <circle r="2.5" fill="#d9c4a0" />
          </g>
        </g>
      ))}
    </svg>
  );
}
