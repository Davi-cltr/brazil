import { useEffect, useRef, useState } from 'react'
import Matter from 'matter-js'
import { RotateCcw } from 'lucide-react'
import { RollText } from '@/components/RollText'
import { scrollToTarget } from '@/lib/lenis'

export const REPO_URL = 'https://github.com/Davi-cltr/brazil'
const LETRAS = Array.from('BRASIL')
const CORES = ['#FFC93C', '#3BAA6B', '#2347A6', '#E4572E', '#C77DFF', '#F7F4EC']

/** As letras caem com física quando o rodapé aparece; dá para pegar e jogar */
function LetrasFisicas({ reduced }: { reduced: boolean }) {
  const box = useRef<HTMLDivElement>(null)
  const letters = useRef<(HTMLSpanElement | null)[]>([])
  const [run, setRun] = useState(0)

  useEffect(() => {
    const host = box.current!
    if (reduced) return
    let engine: Matter.Engine | null = null
    let raf = 0
    let started = false
    let mouse: Matter.Mouse | null = null

    const start = () => {
      started = true
      const W = host.clientWidth
      const H = host.clientHeight
      engine = Matter.Engine.create({ gravity: { x: 0, y: 1.1 } })
      const wall = { isStatic: true, render: { visible: false } }
      Matter.Composite.add(engine.world, [
        Matter.Bodies.rectangle(W / 2, H + 50, W * 2, 100, wall),
        Matter.Bodies.rectangle(-50, H / 2, 100, H * 3, wall),
        Matter.Bodies.rectangle(W + 50, H / 2, 100, H * 3, wall),
      ])
      const bodies = letters.current.map((el, i) => {
        const w = el!.offsetWidth
        const h = el!.offsetHeight * 0.78
        const b = Matter.Bodies.rectangle(W * (0.12 + i * 0.15), -h * (1 + i * 0.6), w, h, {
          restitution: 0.35,
          friction: 0.5,
          angle: (Math.random() - 0.5) * 0.8,
          chamfer: { radius: Math.min(w, h) * 0.12 },
        })
        return { b, el: el!, w, h }
      })
      Matter.Composite.add(
        engine.world,
        bodies.map((x) => x.b),
      )
      // arrastar só com mouse; no toque, a página continua rolando
      if (window.matchMedia('(pointer: fine)').matches) {
        mouse = Matter.Mouse.create(host)
        const m = mouse as unknown as { mousewheel: EventListener; element: HTMLElement }
        m.element.removeEventListener('wheel', m.mousewheel)
        m.element.removeEventListener('mousewheel', m.mousewheel)
        m.element.removeEventListener('DOMMouseScroll', m.mousewheel)
        const mc = Matter.MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.2, render: { visible: false } } })
        Matter.Composite.add(engine.world, mc)
      }
      // passo fixo: a física anda no mesmo ritmo mesmo se a tela cair de quadros
      let last = performance.now()
      let acc = 0
      const STEP = 1000 / 60
      const tick = () => {
        raf = requestAnimationFrame(tick)
        const now = performance.now()
        acc = Math.min(acc + (now - last), STEP * 6)
        last = now
        while (acc >= STEP) {
          Matter.Engine.update(engine!, STEP)
          acc -= STEP
        }
        bodies.forEach(({ b, el, w, h }) => {
          el.style.transform = `translate3d(${b.position.x - w / 2}px, ${b.position.y - h / 2 - el.offsetHeight * 0.11}px, 0) rotate(${b.angle}rad)`
        })
      }
      raf = requestAnimationFrame(tick)
    }

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started) start()
      },
      { threshold: 0.3 },
    )
    io.observe(host)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
      if (mouse) Matter.Mouse.clearSourceEvents(mouse)
      if (engine) {
        Matter.World.clear(engine.world, false)
        Matter.Engine.clear(engine)
      }
    }
  }, [reduced, run])

  return (
    <div>
      <div ref={box} data-cursor="pegar" className={`relative h-[clamp(240px,42vw,520px)] overflow-hidden rounded-[32px] bg-cal/5 ${reduced ? 'flex items-end justify-center' : ''}`} aria-hidden="true">
        {LETRAS.map((l, i) => (
          <span
            key={`${run}-${i}`}
            ref={(el) => {
              letters.current[i] = el
            }}
            className={`${reduced ? 'relative inline-block' : 'absolute top-0 left-0'} font-display text-[clamp(5rem,15vw,15rem)] leading-none font-[900] select-none [font-stretch:80%]`}
            style={{ color: CORES[i], transform: reduced ? undefined : 'translate3d(-999px,-999px,0)' }}
          >
            {l}
          </span>
        ))}
      </div>
      {!reduced && (
        <button type="button" onClick={() => setRun((r) => r + 1)} className="mt-4 flex items-center gap-2 text-sm opacity-80 hover:opacity-100">
          <RotateCcw className="size-4" aria-hidden="true" /> Soltar as letras de novo
        </button>
      )}
    </div>
  )
}

export function Rodape({ reduced }: { reduced: boolean }) {
  return (
    <footer data-theme="tinta" className="relative">
      <div className="calcadao" aria-hidden="true" />
      <div className="px-5 pt-20 pb-10 sm:px-10">
        <p className="max-w-2xl font-display text-[clamp(1.8rem,3.6vw,3rem)] leading-[1.05] font-[800] [font-stretch:90%]">
          Faltou muita coisa, porque sempre falta. Pegue as letras e arrume do seu jeito.
        </p>
        <div className="mt-12">
          <LetrasFisicas reduced={reduced} />
        </div>
        <div className="mt-16 grid gap-10 border-t border-cal/15 pt-10 text-sm md:grid-cols-[1.4fr_1fr]">
          <div className="space-y-2 opacity-80">
            <p>Dados: IBGE (Censo 2022, Área Territorial 2025, Biomas 2019), UNESCO e IPHAN. Números arredondados quando indicado.</p>
            <p>Mapas: malha estadual do IBGE via GeoDadosBrasil (domínio público, CC0) e limites dos biomas do IBGE simplificados pelo pacote florabr (GPL-3).</p>
            <p>Ilustrações, sons e animações feitos para este site. Fontes Anybody e Hanken Grotesk (OFL).</p>
          </div>
          <ul className="flex flex-wrap gap-x-8 gap-y-3 md:justify-end">
            <li>
              <button type="button" className="roll-host" onClick={() => scrollToTarget(0, 2.6)}>
                <RollText>Voltar ao mapa</RollText>
              </button>
            </li>
            <li>
              <a className="roll-host" href={REPO_URL} target="_blank" rel="noopener noreferrer">
                <RollText>Código no GitHub</RollText>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
