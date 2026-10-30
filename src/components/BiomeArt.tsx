import { Children, isValidElement, type ReactElement, type ReactNode } from 'react'
import type { Bioma } from '@/data/brasil'

// Paisagens em SVG chapado. Cada <g data-depth> se move com o cursor (paralaxe).
// viewBox 1600 x 900, recortado para cobrir a tela.

const rnd = (seed: number) => {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function canopy(seed: number, y: number, h: number, color: string, count: number, rmin: number, rmax: number) {
  const r = rnd(seed)
  const blobs = Array.from({ length: count }, (_, i) => {
    const cx = (i / (count - 1)) * 1800 - 100 + (r() - 0.5) * 60
    const rr = rmin + r() * (rmax - rmin)
    return <circle key={i} cx={cx} cy={y + (r() - 0.5) * h} r={rr} fill={color} />
  })
  return (
    <>
      {blobs}
      <rect x={-200} y={y} width={2000} height={900 - y + 200} fill={color} />
    </>
  )
}

function Amazonia({ c }: { c: Bioma['cores'] }) {
  return (
    <>
      <rect width="1600" height="900" fill={c.ceu} />
      <g data-depth="0.15">{canopy(3, 330, 80, '#0D3A29', 26, 60, 120)}</g>
      <g data-depth="0.3">{canopy(7, 430, 90, c.fundo, 22, 70, 130)}</g>
      <g data-depth="0.5">
        {canopy(11, 560, 80, c.meio, 18, 80, 150)}
        {/* rio sinuoso */}
        <path d="M-50 900 C 250 760 420 820 640 740 S 1020 640 1200 690 S 1500 760 1700 700 L1700 760 C 1500 820 1300 760 1200 760 S 900 720 700 800 S 300 900 150 960 Z" fill={c.acento} opacity="0.9" />
      </g>
      <g data-depth="0.8">
        {canopy(19, 760, 60, c.frente, 14, 90, 170)}
        {/* folhas grandes na frente */}
        {[120, 420, 1250, 1480].map((x, i) => (
          <path key={i} d={`M${x} 900 C ${x - 60} 760 ${x - 10} 650 ${x + 40} 600 C ${x + 60} 700 ${x + 80} 800 ${x + 30} 900 Z`} fill="#0A2F21" />
        ))}
      </g>
    </>
  )
}

function Cerrado({ c }: { c: Bioma['cores'] }) {
  const tree = (x: number, y: number, s: number, key: number) => (
    <g key={key} transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0 C -10 -40 20 -60 5 -100 C -5 -130 25 -140 30 -170" stroke={c.frente} strokeWidth="12" fill="none" strokeLinecap="round" />
      <path d="M8 -95 C 40 -110 55 -130 80 -128" stroke={c.frente} strokeWidth="8" fill="none" strokeLinecap="round" />
      <ellipse cx="30" cy="-180" rx="70" ry="26" fill="#4E6B2E" />
      <ellipse cx="78" cy="-135" rx="44" ry="18" fill="#5C7C35" />
    </g>
  )
  return (
    <>
      <rect width="1600" height="900" fill={c.ceu} />
      <rect y="0" width="1600" height="180" fill="#F9D27A" />
      <g data-depth="0.1">
        <circle cx="1180" cy="330" r="120" fill="#FFF1C9" />
        <circle cx="1180" cy="330" r="170" fill="#FFF1C9" opacity="0.25" />
      </g>
      <g data-depth="0.25">
        <path d="M0 520 C 300 470 520 500 800 480 S 1300 450 1600 500 V900 H0Z" fill={c.fundo} />
      </g>
      <g data-depth="0.5">
        <path d="M0 610 C 260 580 600 620 900 590 S 1400 570 1600 610 V900 H0Z" fill={c.meio} />
        {tree(260, 610, 0.9, 1)}
        {tree(1350, 600, 1.1, 2)}
        {tree(820, 595, 0.7, 3)}
      </g>
      <g data-depth="0.85">
        <path d="M0 760 C 300 730 600 770 900 740 S 1400 720 1600 760 V900 H0Z" fill="#C88B2E" />
        <g className="biome-sway">
          {Array.from({ length: 70 }, (_, i) => {
            const x = i * 24 - 20
            return <path key={i} d={`M${x} 900 Q ${x + 6} 800 ${x + 14} ${730 + (i % 5) * 8}`} stroke="#8C5E1E" strokeWidth="3" fill="none" />
          })}
        </g>
      </g>
    </>
  )
}

function MataAtlantica({ c }: { c: Bioma['cores'] }) {
  return (
    <>
      <rect width="1600" height="900" fill={c.ceu} />
      <g data-depth="0.1">
        <rect y="560" width="1600" height="340" fill={c.acento} />
        <rect y="600" width="1600" height="6" fill="#F7F4EC" opacity="0.5" />
        <rect y="640" width="1600" height="3" fill="#F7F4EC" opacity="0.35" />
      </g>
      <g data-depth="0.25">
        <path d="M-50 600 L 200 300 L 380 420 L 560 180 L 760 450 L 900 380 L 1100 600 Z" fill={c.fundo} />
        <path d="M1000 600 L 1250 330 Q 1300 250 1340 330 L 1650 600 Z" fill={c.fundo} />
      </g>
      <g data-depth="0.5">
        <path d="M-50 700 L 150 420 L 330 520 L 500 330 L 720 560 L 820 520 L 980 700 Z" fill={c.meio} />
        {canopy(5, 690, 40, c.meio, 12, 40, 80)}
      </g>
      <g data-depth="0.85">
        {canopy(23, 800, 50, c.frente, 16, 60, 120)}
        {/* bromélias */}
        {[180, 640, 1120, 1450].map((x, i) => (
          <g key={i} transform={`translate(${x} 860)`}>
            {[-60, -30, 0, 30, 60].map((a) => (
              <path key={a} d="M0 0 Q -12 -60 0 -120 Q 12 -60 0 0Z" fill="#2E8F5E" transform={`rotate(${a})`} />
            ))}
            <circle cy="-20" r="12" fill="#E4572E" />
          </g>
        ))}
      </g>
    </>
  )
}

function Caatinga({ c }: { c: Bioma['cores'] }) {
  const cacto = (x: number, y: number, s: number, k: number) => (
    <g key={k} transform={`translate(${x} ${y}) scale(${s})`} fill={c.acento}>
      <rect x="-18" y="-260" width="36" height="260" rx="18" />
      <rect x="-80" y="-170" width="30" height="110" rx="15" />
      <rect x="-80" y="-80" width="70" height="28" rx="14" />
      <rect x="50" y="-210" width="30" height="120" rx="15" />
      <rect x="10" y="-110" width="70" height="28" rx="14" />
    </g>
  )
  return (
    <>
      <rect width="1600" height="900" fill={c.ceu} />
      <g data-depth="0.1">
        <circle cx="350" cy="250" r="90" fill="#FFF8E6" />
      </g>
      <g data-depth="0.25">
        <g className="calor">
        <path d="M0 540 C 300 520 500 540 800 520 S 1300 500 1600 530 V900 H0Z" fill={c.fundo} />
        {[200, 520, 980, 1330].map((x, i) => (
          <g key={i} transform={`translate(${x} 530)`} stroke="#8A6A50" strokeWidth="4" fill="none">
            <path d="M0 0 V-70 M0 -40 L-25 -70 M0 -55 L22 -85 M0 -30 L18 -50" />
          </g>
        ))}
        </g>
      </g>
      <g data-depth="0.5">
        <path d="M0 650 C 400 620 800 660 1200 630 S 1500 640 1600 650 V900 H0Z" fill={c.meio} />
        {cacto(1180, 660, 0.9, 1)}
        {cacto(380, 670, 0.6, 2)}
      </g>
      <g data-depth="0.8">
        <path d="M0 780 H1600 V900 H0Z" fill={c.frente} />
        {/* chão rachado */}
        <path d="M0 820 L 140 800 L 260 840 L 420 810 L 560 850 L 760 815 L 900 845 L 1100 805 L 1260 840 L 1450 812 L 1600 830 M 140 800 L 170 900 M 420 810 L 380 900 M 760 815 L 800 900 M 1100 805 L 1060 900 M 1450 812 L 1490 900" stroke="#4A3324" strokeWidth="4" fill="none" />
      </g>
    </>
  )
}

function Pampa({ c }: { c: Bioma['cores'] }) {
  return (
    <>
      <rect width="1600" height="900" fill={c.ceu} />
      <g data-depth="0.1" fill="#FFFFFF" opacity="0.85">
        <ellipse cx="300" cy="200" rx="140" ry="36" />
        <ellipse cx="380" cy="180" rx="90" ry="34" />
        <ellipse cx="1150" cy="150" rx="170" ry="40" />
        <ellipse cx="1250" cy="130" rx="100" ry="36" />
      </g>
      <g data-depth="0.25">
        <path d="M0 560 C 260 500 520 520 780 560 S 1300 510 1600 550 V900 H0Z" fill={c.fundo} />
      </g>
      <g data-depth="0.5">
        <path d="M0 660 C 300 610 600 640 880 680 S 1350 620 1600 660 V900 H0Z" fill={c.meio} />
        {/* umbu solitário */}
        <g transform="translate(1120 650)">
          <path d="M0 0 C -6 -60 6 -100 0 -150" stroke="#3B2A1A" strokeWidth="14" fill="none" />
          <ellipse cx="0" cy="-170" rx="90" ry="55" fill="#2F5A2A" />
          <ellipse cx="-50" cy="-150" rx="50" ry="34" fill="#386641" />
        </g>
      </g>
      <g data-depth="0.85">
        <path d="M0 770 C 400 730 800 760 1200 740 S 1500 750 1600 760 V900 H0Z" fill={c.frente} />
        <g className="biome-sway biome-sway--forte">
          {Array.from({ length: 80 }, (_, i) => {
            const x = i * 21 - 20
            return <path key={i} d={`M${x} 900 Q ${x + 4} 820 ${x + 12} ${760 + (i % 4) * 9}`} stroke="#2C5527" strokeWidth="3" fill="none" />
          })}
        </g>
      </g>
    </>
  )
}

function Pantanal({ c }: { c: Bioma['cores'] }) {
  return (
    <>
      <rect width="1600" height="900" fill={c.ceu} />
      <rect y="250" width="1600" height="260" fill={c.fundo} />
      <g data-depth="0.1">
        <circle cx="800" cy="470" r="130" fill="#FFE7C2" />
      </g>
      <g data-depth="0.25">
        <path d="M0 520 C 200 500 400 515 600 505 S 1100 500 1600 520 V560 H0Z" fill="#2E5A44" />
        {[100, 330, 1250, 1460].map((x, i) => (
          <g key={i} transform={`translate(${x} 515)`}>
            <path d="M0 0 V-90" stroke="#2E3B2A" strokeWidth="6" />
            {[-70, -35, 0, 35, 70].map((a) => (
              <path key={a} d="M0 -90 Q 30 -100 60 -80" stroke="#2E5A44" strokeWidth="6" fill="none" transform={`rotate(${a} 0 -90)`} />
            ))}
          </g>
        ))}
      </g>
      <g data-depth="0.5">
        {/* água espelhada */}
        <rect y="555" width="1600" height="345" fill={c.meio} />
        <ellipse cx="800" cy="640" rx="140" ry="16" fill="#FFE7C2" opacity="0.55" />
        <rect x="690" y="680" width="220" height="6" rx="3" fill="#FFE7C2" opacity="0.4" />
        <rect x="730" y="715" width="140" height="5" rx="3" fill="#FFE7C2" opacity="0.3" />
      </g>
      <g data-depth="0.85">
        <path d="M0 800 C 300 780 500 800 800 790 S 1300 780 1600 800 V900 H0Z" fill={c.frente} />
        {/* tuiuiú */}
        <g transform="translate(330 800)" fill="#F7F4EC">
          <ellipse cx="0" cy="-90" rx="40" ry="26" />
          <path d="M-8 -66 V0 M8 -66 V0" stroke="#1C1206" strokeWidth="4" />
          <path d="M28 -100 Q 40 -150 48 -170" stroke="#1C1206" strokeWidth="10" fill="none" />
          <path d="M28 -112 Q 36 -130 44 -150" stroke="#C0392B" strokeWidth="8" fill="none" />
          <path d="M50 -172 L 110 -160 L 52 -164 Z" fill="#1C1206" />
        </g>
      </g>
    </>
  )
}

const SCENES: Record<string, (p: { c: Bioma['cores'] }) => ReactElement> = {
  amazonia: Amazonia,
  cerrado: Cerrado,
  'mata-atlantica': MataAtlantica,
  caatinga: Caatinga,
  pampa: Pampa,
  pantanal: Pantanal,
}

const depthOf = (k: ReactNode) => (isValidElement(k) ? Number((k.props as Record<string, unknown>)['data-depth'] ?? 0) : 0)

/**
 * Cada camada de profundidade vira um <svg> próprio. Assim a paralaxe só move
 * camadas já desenhadas (composição), sem redesenhar a ilustração a cada quadro.
 */
export function BiomeArt({ b }: { b: Bioma }) {
  const frag = SCENES[b.id]({ c: b.cores }) as ReactElement<{ children: ReactNode }>
  const kids = Children.toArray(frag.props.children)
  const base = kids.filter((k) => !depthOf(k))
  const layers = kids.filter((k) => depthOf(k) > 0)
  const svgProps = { viewBox: '0 0 1600 900', preserveAspectRatio: 'xMidYMid slice', 'aria-hidden': true as const }
  return (
    <>
      <svg {...svgProps} className="absolute inset-0 h-full w-full">
        {base}
      </svg>
      {layers.map((g, i) => (
        <svg key={i} {...svgProps} data-layer={depthOf(g)} className="absolute inset-0 h-full w-full will-change-transform" style={{ transform: 'scale(1.06)' }}>
          {g}
        </svg>
      ))}
    </>
  )
}
