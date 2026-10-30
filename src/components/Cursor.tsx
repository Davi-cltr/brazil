import { useEffect, useRef, useState } from 'react'

const LABELS: Record<string, string> = {
  explorar: 'Explorar',
  arrastar: 'Arrastar',
  chutar: 'Chutar',
  tocar: 'Tocar',
  ir: 'Ir',
  virar: 'Virar',
  balancar: 'Balançar',
  confete: 'Confete',
  girar: 'Girar',
  pegar: 'Pegar',
}

/**
 * Cursor próprio: ponto que segue na hora e anel que chega atrasado.
 * Elementos com data-cursor="nome" mudam o rótulo; links e botões aumentam o anel.
 */
export function Cursor({ reduced }: { reduced: boolean }) {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const [enabled, setEnabled] = useState(false)
  const [label, setLabel] = useState('')

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    const on = () => setEnabled(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  useEffect(() => {
    if (!enabled) return
    document.documentElement.classList.add('has-cursor')
    let x = window.innerWidth / 2
    let y = window.innerHeight / 2
    let rx = x
    let ry = y
    let scale = 1
    let targetScale = 1
    let visible = false
    let raf = 0
    const move = (e: PointerEvent) => {
      x = e.clientX
      y = e.clientY
      if (!visible) {
        visible = true
        rx = x
        ry = y
        if (dot.current) dot.current.style.opacity = '1'
        if (ring.current) ring.current.style.opacity = '1'
      }
    }
    const over = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.('[data-cursor], a, button, label, input, [role="button"]')
      const name = el?.getAttribute('data-cursor') ?? ''
      setLabel(LABELS[name] ?? '')
      targetScale = name ? 2.6 : el ? 1.6 : 1
    }
    const leave = () => {
      visible = false
      if (dot.current) dot.current.style.opacity = '0'
      if (ring.current) ring.current.style.opacity = '0'
    }
    const down = () => (targetScale *= 0.8)
    const up = (e: PointerEvent) => over(e)
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerover', over, { passive: true })
    window.addEventListener('pointerdown', down, { passive: true })
    window.addEventListener('pointerup', up, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    const tick = () => {
      raf = requestAnimationFrame(tick)
      const k = reduced ? 1 : 0.18
      rx += (x - rx) * k
      ry += (y - ry) * k
      scale += (targetScale - scale) * (reduced ? 1 : 0.15)
      if (dot.current) dot.current.style.transform = `translate3d(${x}px, ${y}px, 0)`
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) scale(${scale})`
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      document.documentElement.classList.remove('has-cursor')
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerover', over)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      document.documentElement.removeEventListener('pointerleave', leave)
    }
  }, [enabled, reduced])

  if (!enabled) return null
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[95]">
      <div ref={ring} className="absolute top-0 left-0 -mt-5 -ml-5 grid size-10 place-items-center rounded-full border border-cal opacity-0 mix-blend-difference transition-opacity duration-300 will-change-transform">
        <span className="font-display text-[0.32rem] font-bold tracking-wide text-cal [font-stretch:120%]">{label}</span>
      </div>
      <div ref={dot} className="absolute top-0 left-0 -mt-1 -ml-1 size-2 rounded-full bg-cal opacity-0 mix-blend-difference will-change-transform" />
    </div>
  )
}
