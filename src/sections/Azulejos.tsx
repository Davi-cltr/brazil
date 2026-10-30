import { useEffect, useMemo, useRef } from 'react'

// Quatro motivos de azulejo, em azul sobre branco (inspiração modernista, desenho próprio)
function Motivo({ k }: { k: number }) {
  const azul = '#2347A6'
  switch (k) {
    case 0:
      return (
        <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
          <path d="M0 0 H100 A100 100 0 0 1 0 100Z" fill={azul} />
          <circle cx="0" cy="0" r="42" fill="#F7F4EC" />
        </svg>
      )
    case 1:
      return (
        <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
          <path d="M0 0 L100 0 L0 100Z" fill={azul} />
          <circle cx="72" cy="72" r="14" fill={azul} />
        </svg>
      )
    case 2:
      return (
        <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
          <rect x="0" y="0" width="50" height="100" fill={azul} />
          <path d="M50 0 A50 50 0 0 1 50 100Z" fill={azul} />
          <path d="M50 25 A25 25 0 0 0 50 75Z" fill="#F7F4EC" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
          <path d="M0 50 Q25 20 50 50 T100 50 V100 H0Z" fill={azul} />
          <path d="M0 70 Q25 40 50 70 T100 70" stroke="#F7F4EC" strokeWidth="6" fill="none" />
        </svg>
      )
  }
}

/** Grade de azulejos que gira em onda a partir do cursor */
export function Azulejos({ reduced }: { reduced: boolean }) {
  const grid = useRef<HTMLDivElement>(null)
  const tiles = useMemo(
    () =>
      Array.from({ length: 96 }, (_, i) => {
        const h = Math.abs(Math.sin(i * 91.7) * 1000)
        return { motivo: Math.floor(h) % 4, rot: (Math.floor(h * 7) % 4) * 90 }
      }),
    [],
  )

  useEffect(() => {
    const g = grid.current
    if (!g) return
    const els = Array.from(g.querySelectorAll<HTMLElement>('[data-tile]'))
    const rot = tiles.map((t) => t.rot)
    let lastTile = -1
    let lastTime = 0
    const cols = () => Math.max(1, Math.round(g.clientWidth / (els[0]?.offsetWidth || 100)))
    const wave = (origin: number) => {
      const c = cols()
      const ox = origin % c
      const oy = Math.floor(origin / c)
      els.forEach((el, i) => {
        const d = Math.hypot((i % c) - ox, Math.floor(i / c) - oy)
        if (d > 7) return
        rot[i] += 90
        el.style.transitionDelay = reduced ? '0ms' : `${Math.round(d * 45)}ms`
        el.style.transform = `rotate(${rot[i]}deg)`
      })
    }
    const over = (e: PointerEvent) => {
      const el = (e.target as Element).closest<HTMLElement>('[data-tile]')
      if (!el) return
      const i = Number(el.dataset.tile)
      const now = performance.now()
      if (i === lastTile && now - lastTime < 700) return
      if (now - lastTime < 160) return
      lastTile = i
      lastTime = now
      wave(i)
    }
    g.addEventListener('pointerover', over)
    // uma onda ao entrar na tela
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          wave(Math.floor(els.length / 2))
          io.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    io.observe(g)
    return () => {
      g.removeEventListener('pointerover', over)
      io.disconnect()
    }
  }, [tiles, reduced])

  return (
    <section id="azulejos" data-theme="anil" aria-labelledby="azulejos-titulo" className="px-5 py-32 sm:px-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <h2 id="azulejos-titulo" className="max-w-3xl font-display text-[clamp(2.2rem,5vw,4.4rem)] leading-[0.98] font-[800] [font-stretch:85%]">
          Azulejo é parede que conta história
        </h2>
        <p className="max-w-sm opacity-90">
          Veio de Portugal, ganhou o país e, no século 20, virou arte moderna nas fachadas de Brasília e do Rio. Passe o cursor e a grade gira em onda.
        </p>
      </div>
      <div ref={grid} data-cursor="girar" className="mt-14 grid grid-cols-[repeat(auto-fill,minmax(72px,1fr))] overflow-hidden rounded-[28px] border-4 border-cal bg-cal sm:grid-cols-[repeat(auto-fill,minmax(110px,1fr))]">
        {tiles.map((t, i) => (
          <div key={i} data-tile={i} aria-hidden="true" className="aspect-square transition-transform duration-700 ease-(--ease-brasa)" style={{ transform: `rotate(${t.rot}deg)` }}>
            <Motivo k={t.motivo} />
          </div>
        ))}
      </div>
    </section>
  )
}
