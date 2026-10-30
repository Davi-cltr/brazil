import { useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { SABORES } from '@/data/brasil'
import { FoodArt } from '@/components/FoodArt'

/** Galeria para arrastar com inércia (mouse, dedo ou roda horizontal) */
export function Sabores({ reduced }: { reduced: boolean }) {
  const viewport = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLUListElement>(null)
  const state = useRef({ x: 0, v: 0, target: 0, dragging: false, startX: 0, startPos: 0, lastX: 0, lastT: 0, moved: 0 })

  useEffect(() => {
    const vp = viewport.current!
    const tr = track.current!
    const st = state.current
    let raf = 0
    const bounds = () => Math.min(0, vp.clientWidth - tr.scrollWidth)
    const down = (e: PointerEvent) => {
      if (e.button !== 0) return
      st.dragging = true
      st.startX = e.clientX
      st.startPos = st.x
      st.lastX = e.clientX
      st.lastT = performance.now()
      st.v = 0
      st.moved = 0
      vp.setPointerCapture(e.pointerId)
    }
    const move = (e: PointerEvent) => {
      if (!st.dragging) return
      const now = performance.now()
      const dx = e.clientX - st.lastX
      st.v = dx / Math.max(1, now - st.lastT)
      st.lastX = e.clientX
      st.lastT = now
      st.moved += Math.abs(dx)
      let x = st.startPos + (e.clientX - st.startX)
      const min = bounds()
      if (x > 0) x *= 0.35
      if (x < min) x = min + (x - min) * 0.35
      st.x = x
      st.target = x
    }
    const up = () => {
      if (!st.dragging) return
      st.dragging = false
      st.target = st.x + (reduced ? 0 : st.v * 420)
    }
    const wheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return
      e.preventDefault()
      st.target -= e.deltaX
    }
    vp.addEventListener('pointerdown', down)
    vp.addEventListener('pointermove', move)
    vp.addEventListener('pointerup', up)
    vp.addEventListener('pointercancel', up)
    vp.addEventListener('wheel', wheel, { passive: false })
    // impede o clique de abrir algo depois de um arraste
    const click = (e: MouseEvent) => st.moved > 6 && e.preventDefault()
    vp.addEventListener('click', click, true)

    let near = false
    let lastX = NaN
    let lastSkew = NaN
    const io = new IntersectionObserver(([e]) => (near = e.isIntersecting), { rootMargin: '100px' })
    io.observe(vp)
    const cards = Array.from(tr.querySelectorAll<HTMLElement>('[data-card]'))
    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (!near) return
      if (!st.dragging) {
        const min = bounds()
        st.target = Math.min(0, Math.max(min, st.target))
        st.x += (st.target - st.x) * (reduced ? 1 : 0.09)
      }
      const x = Math.round(st.x * 10) / 10
      if (x !== lastX) {
        lastX = x
        tr.style.transform = `translate3d(${x}px, 0, 0)`
      }
      // cartões inclinam conforme a velocidade
      const skew = reduced ? 0 : Math.round(Math.max(-8, Math.min(8, (st.target - st.x) * -0.02)) * 20) / 20
      if (skew !== lastSkew) {
        lastSkew = skew
        cards.forEach((c) => (c.style.transform = `skewX(${skew}deg)`))
      }
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      vp.removeEventListener('pointerdown', down)
      vp.removeEventListener('pointermove', move)
      vp.removeEventListener('pointerup', up)
      vp.removeEventListener('pointercancel', up)
      vp.removeEventListener('wheel', wheel)
      vp.removeEventListener('click', click, true)
    }
  }, [reduced])

  const nudge = (dir: number) => {
    const card = track.current?.querySelector<HTMLElement>('[data-card]')
    state.current.target += -dir * ((card?.offsetWidth ?? 300) + 24)
  }

  return (
    <section id="sabores" data-theme="urucum" aria-labelledby="sabores-titulo" className="py-32">
      <div className="flex flex-col gap-6 px-5 sm:px-10 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 id="sabores-titulo" className="font-display text-[clamp(2.2rem,5vw,4.4rem)] leading-[0.98] font-[800] [font-stretch:85%]">
            Uma comida para cada canto
          </h2>
          <p className="mt-4 max-w-md">Arraste para o lado, ou use as setas. Cada prato tem endereço de origem, mesmo que hoje se coma no país inteiro.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => nudge(-1)} aria-label="Prato anterior" className="grid size-12 place-items-center rounded-full border-2 border-tinta transition-colors hover:bg-tinta hover:text-urucum">
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => nudge(1)} aria-label="Próximo prato" className="grid size-12 place-items-center rounded-full border-2 border-tinta transition-colors hover:bg-tinta hover:text-urucum">
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div ref={viewport} data-cursor="arrastar" className="mt-14 cursor-grab touch-pan-y overflow-hidden select-none active:cursor-grabbing">
        <ul ref={track} className="flex w-max gap-6 px-5 will-change-transform sm:px-10">
          {SABORES.map((s) => (
            <li key={s.id} data-card className="w-[clamp(260px,28vw,380px)] shrink-0 origin-bottom">
              <article className="overflow-hidden rounded-[28px] bg-cal text-tinta">
                <div className="aspect-square p-6" style={{ background: s.cor }}>
                  <FoodArt id={s.id} />
                </div>
                <div className="p-6">
                  <p className="text-sm opacity-70">{s.lugar}</p>
                  <h3 className="mt-1 font-display text-2xl leading-tight font-[800] [font-stretch:110%]">{s.nome}</h3>
                  <p className="mt-2 text-[0.98rem] leading-snug">{s.texto}</p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
