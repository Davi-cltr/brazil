// Ilustrações chapadas dos pratos (viewBox 300 x 300)

export function FoodArt({ id }: { id: string }) {
  switch (id) {
    case 'paodequeijo':
      return (
        <svg viewBox="0 0 300 300" className="h-full w-full" aria-hidden="true">
          <ellipse cx="150" cy="220" rx="120" ry="34" fill="#E8D9B5" />
          {[
            [100, 170, 52],
            [190, 165, 56],
            [145, 120, 50],
          ].map(([x, y, r], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r={r} fill="#F2C063" />
              <circle cx={x - r * 0.25} cy={y - r * 0.3} r={r * 0.45} fill="#F8D88A" />
              <circle cx={x + r * 0.3} cy={y + r * 0.2} r={4} fill="#D9993A" />
              <circle cx={x - r * 0.4} cy={y + r * 0.35} r={3} fill="#D9993A" />
            </g>
          ))}
        </svg>
      )
    case 'acaraje':
      return (
        <svg viewBox="0 0 300 300" className="h-full w-full" aria-hidden="true">
          <ellipse cx="150" cy="230" rx="120" ry="30" fill="#F7F4EC" />
          <path d="M60 180 C 60 110 240 110 240 180 C 240 210 60 210 60 180Z" fill="#B5531F" />
          <path d="M70 175 C 120 150 180 150 230 175" stroke="#7A2E10" strokeWidth="6" fill="none" />
          {/* recheio: vatapá e camarão */}
          <path d="M80 172 C 120 160 180 160 220 172 C 200 186 100 186 80 172Z" fill="#F2B33D" />
          {[110, 150, 190].map((x) => (
            <path key={x} d={`M${x - 14} 160 C ${x - 10} 140 ${x + 16} 140 ${x + 14} 160 C ${x + 4} 152 ${x - 6} 152 ${x - 14} 160Z`} fill="#F07F5A" />
          ))}
          <path d="M95 150 L 105 140 M 200 150 L 210 138" stroke="#4F7A3A" strokeWidth="5" strokeLinecap="round" />
        </svg>
      )
    case 'acai':
      return (
        <svg viewBox="0 0 300 300" className="h-full w-full" aria-hidden="true">
          <path d="M50 140 H250 C 250 220 200 250 150 250 C 100 250 50 220 50 140Z" fill="#8C5A2B" />
          <ellipse cx="150" cy="140" rx="100" ry="26" fill="#4A1942" />
          <ellipse cx="150" cy="136" rx="86" ry="18" fill="#6B2D5C" />
          {/* peixe frito e farinha, como no Pará */}
          <path d="M110 128 C 130 112 170 112 190 128 L 205 118 L 205 140 L 190 132 C 170 146 130 146 110 132Z" fill="#E0A85A" />
          {Array.from({ length: 22 }, (_, i) => (
            <circle key={i} cx={95 + (i * 37) % 110} cy={128 + (i * 13) % 18} r="2.5" fill="#F3E3B4" />
          ))}
        </svg>
      )
    case 'feijoada':
      return (
        <svg viewBox="0 0 300 300" className="h-full w-full" aria-hidden="true">
          <ellipse cx="150" cy="235" rx="125" ry="26" fill="#2B2B2B" />
          <path d="M45 140 H255 L 240 225 C 220 245 80 245 60 225Z" fill="#3A3A3A" />
          <rect x="30" y="132" width="240" height="18" rx="9" fill="#4A4A4A" />
          <ellipse cx="150" cy="140" rx="104" ry="16" fill="#1E120E" />
          {[
            [110, 136],
            [160, 140],
            [190, 133],
            [135, 144],
          ].map(([x, y], i) => (
            <ellipse key={i} cx={x} cy={y} rx="12" ry="7" fill={i % 2 ? '#7A3B2A' : '#B2553A'} />
          ))}
          <path d="M20 145 H40 M260 145 H280" stroke="#4A4A4A" strokeWidth="12" strokeLinecap="round" />
          <circle cx="240" cy="90" r="26" fill="#F29D38" />
          <path d="M240 64 V116 M214 90 H266 M222 72 L258 108 M258 72 L222 108" stroke="#FBD38D" strokeWidth="3" />
        </svg>
      )
    case 'tacaca':
      return (
        <svg viewBox="0 0 300 300" className="h-full w-full" aria-hidden="true">
          {/* cuia */}
          <path d="M50 130 C 50 220 100 250 150 250 C 200 250 250 220 250 130Z" fill="#3B2416" />
          <path d="M70 160 C 90 170 110 150 130 165 M170 170 C 190 155 210 175 230 160" stroke="#C8A26A" strokeWidth="4" fill="none" />
          <ellipse cx="150" cy="130" rx="100" ry="24" fill="#D9A21B" />
          <ellipse cx="150" cy="128" rx="86" ry="17" fill="#E8B83A" />
          {/* jambu */}
          {[110, 150, 185].map((x, i) => (
            <path key={x} d={`M${x} 128 q 10 -18 22 -4 q -12 10 -22 4z`} fill="#3E8E41" transform={`rotate(${i * 30 - 20} ${x} 128)`} />
          ))}
          <path d="M130 120 C 140 108 160 108 166 122 C 156 116 142 116 130 120Z" fill="#F07F5A" />
          <ellipse cx="200" cy="126" rx="10" ry="5" fill="#F5E6C8" opacity="0.8" />
        </svg>
      )
    case 'brigadeiro':
      return (
        <svg viewBox="0 0 300 300" className="h-full w-full" aria-hidden="true">
          {[
            [100, 180],
            [200, 180],
            [150, 120],
          ].map(([x, y], i) => (
            <g key={i}>
              <path d={`M${x - 46} ${y + 10} L ${x - 34} ${y + 54} H ${x + 34} L ${x + 46} ${y + 10}Z`} fill="#E4572E" />
              <circle cx={x} cy={y} r="40" fill="#5A3420" />
              {Array.from({ length: 26 }, (_, k) => {
                const a = k * 2.4
                const r = 8 + ((k * 7) % 28)
                return <rect key={k} x={x + Math.cos(a) * r} y={y + Math.sin(a) * r} width="7" height="2.6" rx="1.3" fill="#2A160C" transform={`rotate(${k * 33} ${x + Math.cos(a) * r} ${y + Math.sin(a) * r})`} />
              })}
            </g>
          ))}
        </svg>
      )
    case 'chimarrao':
    default:
      return (
        <svg viewBox="0 0 300 300" className="h-full w-full" aria-hidden="true">
          <path d="M95 120 C 70 170 80 240 150 250 C 220 240 230 170 205 120Z" fill="#7A4A26" />
          <path d="M92 132 C 120 140 180 140 208 132" stroke="#C8A26A" strokeWidth="6" fill="none" />
          <ellipse cx="150" cy="120" rx="56" ry="16" fill="#C8A26A" />
          <ellipse cx="150" cy="120" rx="46" ry="11" fill="#5E8C3A" />
          {/* bomba */}
          <path d="M160 118 L 205 40" stroke="#D9D9D9" strokeWidth="9" strokeLinecap="round" />
          <path d="M200 46 L 214 30" stroke="#F2C063" strokeWidth="11" strokeLinecap="round" />
          <path d="M110 70 C 120 50 100 40 112 20 M135 60 C 145 40 125 30 137 10" stroke="#F7F4EC" strokeWidth="4" fill="none" opacity="0.6" strokeLinecap="round" />
        </svg>
      )
  }
}
