import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

/**
 * Letras que esticam e engordam perto do cursor (eixos wdth e wght da Anybody).
 * Sem cursor, uma onda lenta percorre a palavra.
 */
export function VariableTitle({
  text,
  className,
  reduced,
  radius = 420,
}: {
  text: string
  className?: string
  reduced: boolean
  radius?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const host = ref.current
    if (!host || reduced) return
    const letters = Array.from(host.querySelectorAll<HTMLSpanElement>('[data-l]'))
    let mouse: { x: number; y: number } | null = null
    let lastMove = 0
    let raf = 0
    const cur = letters.map(() => ({ w: 100, g: 700 }))
    const onMove = (e: PointerEvent) => {
      mouse = { x: e.clientX, y: e.clientY }
      lastMove = performance.now()
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    // só anima enquanto o título está visível
    let visible = true
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(host)
    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (!visible || host.closest('[style*="opacity: 0"]')) return
      const now = performance.now()
      const idle = !mouse || now - lastMove > 2500
      letters.forEach((el, i) => {
        let t: number
        if (idle) {
          t = 0.5 + 0.5 * Math.sin(now / 900 - i * 0.7)
        } else {
          const r = el.getBoundingClientRect()
          const d = Math.hypot(mouse!.x - (r.left + r.width / 2), mouse!.y - (r.top + r.height / 2))
          t = Math.max(0, 1 - d / radius)
        }
        const w = 62 + 88 * t
        const g = 380 + 520 * t
        const nw = cur[i].w + (w - cur[i].w) * 0.14
        const ng = cur[i].g + (g - cur[i].g) * 0.14
        // só reescreve quando muda de verdade (evita refazer o layout a cada quadro)
        if (Math.abs(nw - cur[i].w) < 0.15 && Math.abs(ng - cur[i].g) < 1) return
        cur[i].w = nw
        cur[i].g = ng
        el.style.fontVariationSettings = `'wdth' ${nw.toFixed(1)}, 'wght' ${ng.toFixed(0)}`
      })
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
    }
  }, [reduced])

  return (
    <span ref={ref} className={cn('inline-flex', className)} aria-label={text} role="img">
      {Array.from(text).map((ch, i) => (
        <span key={i} data-l={i} aria-hidden="true" className="inline-block" style={{ fontVariationSettings: "'wdth' 100, 'wght' 700" }}>
          {ch}
        </span>
      ))}
    </span>
  )
}
