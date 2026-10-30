import { useEffect, useRef } from 'react'
import { clamp } from '@/lib/utils'

const TEXTO =
  'É o quinto maior país do mundo e o único das Américas que fala português. Tem floresta que faz chover, sertão que floresce depois da primeira chuva, campo que não acaba e um litoral inteiro de praia. Tem 27 sotaques de bom-dia, uma comida para cada estado e um ritmo para cada esquina. Role devagar: o Brasil vai acendendo.'

// palavras que ganham cor quando acendem
const DESTAQUES = new Set(['floresta', 'sertão', 'campo', 'litoral', 'sotaques', 'comida', 'ritmo', 'acendendo.'])

/** Texto que acende palavra por palavra conforme a rolagem */
export function Manifesto({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = ref.current
    if (!host) return
    const words = Array.from(host.querySelectorAll<HTMLSpanElement>('[data-w]'))
    if (reduced) {
      words.forEach((w) => (w.style.opacity = '1'))
      return
    }
    let raf = 0
    let near = false
    const io = new IntersectionObserver(([e]) => (near = e.isIntersecting), { rootMargin: '200px' })
    io.observe(host)
    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (!near) return
      const r = host.getBoundingClientRect()
      const vh = window.innerHeight
      // de quando o bloco entra até quando o fim chega a 40% da tela
      const p = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.25))
      const n = words.length
      words.forEach((w, i) => {
        const t = clamp(p * n * 1.15 - i)
        w.style.opacity = String(0.14 + t * 0.86)
        if (w.dataset.hl) w.style.color = t > 0.9 ? 'var(--color-ipe)' : ''
      })
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [reduced])

  return (
    <section id="manifesto" data-theme="noite" aria-label="Manifesto" className="px-5 py-40 sm:px-10 sm:py-56">
      <div ref={ref} className="mx-auto max-w-6xl">
        <p className="font-display text-[clamp(1.9rem,4.4vw,4.1rem)] leading-[1.08] font-[700] [font-stretch:90%]">
          {TEXTO.split(' ').map((w, i) => (
            <span key={i} data-w={i} data-hl={DESTAQUES.has(w) ? '1' : undefined} className="transition-colors duration-500" style={{ opacity: 0.14 }}>
              {w}{' '}
            </span>
          ))}
        </p>
      </div>
    </section>
  )
}
