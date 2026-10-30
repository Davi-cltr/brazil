import { useCallback, useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { NUMEROS, UFS } from '@/data/brasil'
import { Odometer } from '@/components/Odometer'
import { getLenis } from '@/lib/lenis'

function StatesMarquee() {
  const speed = useRef(1)
  const [paused, setPaused] = useState(false)
  const rows = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const lenis = getLenis()
    let raf = 0
    let current = 1
    const on = () => {
      if (lenis) speed.current = 1 + Math.min(Math.abs(lenis.velocity) * 0.2, 7)
    }
    lenis?.on('scroll', on)
    let near = false
    const io = new IntersectionObserver(([e]) => (near = e.isIntersecting), { rootMargin: '100px' })
    if (rows.current) io.observe(rows.current)
    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (!near) return
      speed.current += (1 - speed.current) * 0.04
      current += (speed.current - current) * 0.15
      rows.current?.getAnimations({ subtree: true }).forEach((a) => (a.playbackRate = current))
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      lenis?.off('scroll', on)
    }
  }, [])
  const half = Math.ceil(UFS.length / 2)
  const row = useCallback(
    (list: typeof UFS, reverse: boolean, outline: boolean) => (
      <div className="flex gap-(--gap) overflow-hidden [--duration:60s] [--gap:2rem]">
        {[0, 1].map((k) => (
          <div key={k} aria-hidden={k > 0 || undefined} className="flex shrink-0 animate-marquee gap-(--gap)" style={reverse ? { animationDirection: 'reverse' } : undefined}>
            {list.map((u) => (
              <span
                key={u.sigla}
                className={`font-display text-[clamp(2.4rem,7vw,6rem)] leading-none font-[850] whitespace-nowrap [font-stretch:75%] ${outline ? 'text-transparent [-webkit-text-stroke:1.5px_var(--color-tinta)]' : ''}`}
              >
                {u.nome}
                <span className="mx-4 inline-block size-[0.3em] -translate-y-[0.15em] rotate-45 bg-urucum align-middle" aria-hidden="true" />
              </span>
            ))}
          </div>
        ))}
      </div>
    ),
    [],
  )
  return (
    <div ref={rows} data-paused={paused} className="marquee-band relative -mx-5 mt-24 border-y-2 border-tinta py-6 sm:-mx-10">
      <p className="sr-only">Os 27 estados e o Distrito Federal, em letreiro.</p>
      {row(UFS.slice(0, half), false, false)}
      <div className="h-3" />
      {row(UFS.slice(half), true, false)}
      <button
        type="button"
        onClick={() => setPaused((v) => !v)}
        aria-label={paused ? 'Continuar letreiro' : 'Pausar letreiro'}
        className="absolute -top-5 right-5 grid size-10 place-items-center rounded-full bg-tinta text-ipe sm:right-10"
      >
        {paused ? <Play className="size-4" aria-hidden="true" /> : <Pause className="size-4" aria-hidden="true" />}
      </button>
    </div>
  )
}

export function Numeros({ reduced }: { reduced: boolean }) {
  const [lead, ...rest] = NUMEROS
  return (
    <section id="numeros" data-theme="ipe" aria-labelledby="numeros-titulo" className="relative px-5 pt-36 pb-24 sm:px-10">
      <h2 id="numeros-titulo" className="max-w-3xl font-display text-[clamp(2rem,4.5vw,3.8rem)] leading-[1] font-[800] [font-stretch:85%]">
        Grande demais para caber numa frase, então vamos aos números.
      </h2>
      <div className="mt-16">
        <Odometer value={lead.valor} reduced={reduced} className="font-display text-[clamp(3.4rem,13vw,13rem)] leading-[0.9] font-[900] tracking-[-0.02em] [font-stretch:70%]" />
        <p className="mt-3 text-lg">{lead.rotulo}. Em 2025, a estimativa do IBGE passa de 213 milhões.</p>
      </div>
      <dl className="mt-16 grid gap-x-8 gap-y-12 border-t-2 border-tinta pt-10 sm:grid-cols-2 lg:grid-cols-4">
        {rest.map((n) => (
          <div key={n.rotulo}>
            <dd className="font-display text-[clamp(2.4rem,5vw,4.2rem)] leading-none font-[850] [font-stretch:80%]">
              <Odometer value={n.valor} reduced={reduced} />
            </dd>
            <dt className="mt-2 max-w-[16rem] text-[0.98rem]">{n.rotulo}</dt>
          </div>
        ))}
      </dl>
      <p className="mt-10 text-sm opacity-75">Fontes: IBGE (Censo 2022, Área Territorial 2025, Biomas 2019).</p>
      <StatesMarquee />
    </section>
  )
}
