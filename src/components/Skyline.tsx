// Silhuetas simplificadas (viewBox 800 x 300), desenhadas à mão para este site

export function Skyline({ id, color }: { id: string; color: string }) {
  const f = { fill: color }
  switch (id) {
    case 'rio':
      return (
        <svg viewBox="0 0 800 300" className="h-full w-full" aria-hidden="true" preserveAspectRatio="xMidYMax meet">
          {/* Corcovado com o Cristo, Pão de Açúcar e a Urca */}
          <path {...f} d="M0 300 L0 220 C 80 200 120 120 170 80 C 200 60 230 70 250 110 C 280 170 320 210 380 230 L 380 300Z" />
          <rect {...f} x="206" y="34" width="6" height="34" />
          <rect {...f} x="190" y="44" width="38" height="5" />
          <path {...f} d="M420 300 C 430 250 470 230 500 240 C 520 250 530 270 540 300Z" />
          <path {...f} d="M560 300 C 570 220 600 130 640 110 C 680 100 700 160 720 230 C 730 260 760 280 800 290 L800 300Z" />
          <path d="M520 255 L 640 112" stroke={color} strokeWidth="1.5" />
          <rect {...f} x="572" y="190" width="10" height="7" />
        </svg>
      )
    case 'salvador':
      return (
        <svg viewBox="0 0 800 300" className="h-full w-full" aria-hidden="true" preserveAspectRatio="xMidYMax meet">
          {/* Cidade Alta, Elevador Lacerda e casario */}
          <rect {...f} x="0" y="150" width="800" height="150" opacity="0.35" />
          <rect {...f} x="330" y="70" width="60" height="230" />
          <rect {...f} x="300" y="70" width="120" height="40" />
          {[0, 1, 2, 3].map((k) => (
            <rect key={k} x={342} y={130 + k * 38} width="36" height="18" fill="none" stroke={color} />
          ))}
          {[440, 500, 556, 610, 668, 724].map((x, i) => (
            <g key={x}>
              <rect {...f} x={x} y={150 - (i % 2) * 18} width="50" height={150 + (i % 2) * 18} opacity={0.6 + (i % 3) * 0.15} />
              <path {...f} d={`M${x - 4} ${150 - (i % 2) * 18} L ${x + 25} ${130 - (i % 2) * 18} L ${x + 54} ${150 - (i % 2) * 18}Z`} />
            </g>
          ))}
          {/* igreja */}
          <rect {...f} x="60" y="120" width="140" height="180" />
          <rect {...f} x="70" y="60" width="34" height="70" />
          <rect {...f} x="156" y="60" width="34" height="70" />
          <path {...f} d="M70 60 L 87 30 L 104 60Z M156 60 L 173 30 L 190 60Z" />
        </svg>
      )
    case 'saopaulo':
      return (
        <svg viewBox="0 0 800 300" className="h-full w-full" aria-hidden="true" preserveAspectRatio="xMidYMax meet">
          {Array.from({ length: 22 }, (_, i) => {
            const h = 80 + ((i * 53) % 170)
            return <rect key={i} {...f} x={i * 37} y={300 - h} width="32" height={h} opacity={0.55 + ((i * 7) % 5) * 0.09} />
          })}
          {/* prédio em onda */}
          <path {...f} d="M300 300 V 90 C 340 70 380 110 420 90 C 460 70 480 100 500 90 V300Z" />
          {Array.from({ length: 9 }, (_, k) => (
            <path key={k} d={`M300 ${110 + k * 20} C 340 ${90 + k * 20} 380 ${130 + k * 20} 420 ${110 + k * 20} C 460 ${90 + k * 20} 480 ${120 + k * 20} 500 ${110 + k * 20}`} stroke="rgba(0,0,0,0.25)" fill="none" />
          ))}
          <rect {...f} x="640" y="20" width="10" height="70" />
        </svg>
      )
    case 'brasilia':
      return (
        <svg viewBox="0 0 800 300" className="h-full w-full" aria-hidden="true" preserveAspectRatio="xMidYMax meet">
          {/* Congresso: torres gêmeas, cúpula e cuia */}
          <rect {...f} x="0" y="250" width="800" height="50" />
          <rect {...f} x="372" y="40" width="22" height="210" />
          <rect {...f} x="406" y="40" width="22" height="210" />
          <rect {...f} x="372" y="140" width="56" height="10" />
          <rect {...f} x="120" y="236" width="560" height="14" />
          <path {...f} d="M200 236 A 70 50 0 0 1 340 236Z" />
          <path {...f} d="M470 180 Q 555 290 640 180 Z" />
          <rect {...f} x="545" y="222" width="20" height="16" />
        </svg>
      )
    case 'manaus':
      return (
        <svg viewBox="0 0 800 300" className="h-full w-full" aria-hidden="true" preserveAspectRatio="xMidYMax meet">
          {/* Teatro Amazonas e o encontro das águas */}
          <rect x="0" y="250" width="400" height="50" fill="#2B1A0F" opacity="0.8" />
          <rect x="400" y="250" width="400" height="50" fill="#C9A06A" opacity="0.8" />
          <rect {...f} x="230" y="150" width="340" height="100" />
          <rect {...f} x="260" y="120" width="280" height="34" />
          <path {...f} d="M330 120 C 330 40 470 40 470 120Z" />
          <rect {...f} x="394" y="20" width="12" height="30" />
          {Array.from({ length: 8 }, (_, k) => (
            <rect key={k} x={250 + k * 40} y="170" width="14" height="60" fill="rgba(0,0,0,0.25)" />
          ))}
          <path d="M340 110 C 350 60 450 60 460 110" stroke="#FFC93C" strokeWidth="6" fill="none" strokeDasharray="10 8" />
        </svg>
      )
    case 'recife':
    default:
      return (
        <svg viewBox="0 0 800 300" className="h-full w-full" aria-hidden="true" preserveAspectRatio="xMidYMax meet">
          {/* pontes, coqueiros e igrejas de Olinda no morro */}
          <path {...f} d="M0 300 V 180 C 120 120 240 120 360 180 V300Z" opacity="0.5" />
          <rect {...f} x="140" y="80" width="80" height="80" />
          <rect {...f} x="150" y="40" width="22" height="45" />
          <rect {...f} x="188" y="40" width="22" height="45" />
          <rect {...f} x="0" y="250" width="800" height="50" opacity="0.4" />
          {[380, 520, 660].map((x) => (
            <path key={x} d={`M${x} 250 Q ${x + 70} 190 ${x + 140} 250`} stroke={color} strokeWidth="10" fill="none" />
          ))}
          {[460, 700].map((x) => (
            <g key={x}>
              <path d={`M${x} 250 C ${x + 6} 200 ${x - 4} 150 ${x + 8} 110`} stroke={color} strokeWidth="8" fill="none" />
              {[-60, -20, 20, 60, 100].map((a) => (
                <path key={a} d={`M${x + 8} 110 q 30 -10 60 10`} stroke={color} strokeWidth="7" fill="none" transform={`rotate(${a} ${x + 8} 110)`} />
              ))}
            </g>
          ))}
        </svg>
      )
  }
}
