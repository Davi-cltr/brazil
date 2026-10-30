import { useEffect, useRef } from 'react'

const CORES = ['#FFC93C', '#E4572E', '#3BAA6B', '#F7F4EC', '#C77DFF', '#5B8DEF', '#FF7EB6']

interface Pt {
  x: number
  y: number
  px: number
  py: number
  pin: boolean
}
interface Corda {
  pts: Pt[]
  len: number
  cores: string[]
}
interface Confete {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  vr: number
  ph: number
  w: number
  h: number
  c: string
  life: number
}

/**
 * Bandeirinhas com física de corda (Verlet): o cursor empurra as cordas.
 * Clique em qualquer lugar da seção para soltar confete.
 */
export function Festas({ reduced }: { reduced: boolean }) {
  const sec = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const c = canvas.current!
    const host = sec.current!
    const ctx = c.getContext('2d')!
    let w = 0
    let h = 0
    let cordas: Corda[] = []
    let confetes: Confete[] = []
    let mouse = { x: -999, y: -999, vx: 0, vy: 0 }
    let raf = 0
    let inView = false
    let burstDone = false

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = c.clientWidth
      h = c.clientHeight
      c.width = w * dpr
      c.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const linhas = w < 700 ? [0.05, 0.12] : [0.04, 0.1, 0.16]
      cordas = linhas.map((fy, li) => {
        const y0 = h * fy
        const seg = w < 700 ? 30 : 38
        const n = Math.ceil((w + 40) / seg)
        const pts: Pt[] = Array.from({ length: n + 1 }, (_, i) => {
          const x = -20 + (i / n) * (w + 40)
          const sag = Math.sin((i / n) * Math.PI) * (40 + li * 18)
          return { x, y: y0 + sag, px: x, py: y0 + sag, pin: i === 0 || i === n }
        })
        return { pts, len: ((w + 40) / n) * 1.02, cores: pts.map((_, i) => CORES[(i * 3 + li * 2) % CORES.length]) }
      })
    }
    build()
    const ro = new ResizeObserver(build)
    ro.observe(c)

    const burst = (x: number, y: number, n = 140) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2
        const sp = 300 + Math.random() * 700
        confetes.push({
          x,
          y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 350,
          r: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 14,
          ph: Math.random() * 6,
          w: 6 + Math.random() * 6,
          h: 10 + Math.random() * 8,
          c: CORES[Math.floor(Math.random() * CORES.length)],
          life: 4 + Math.random() * 2,
        })
      }
      if (confetes.length > 900) confetes = confetes.slice(-900)
    }

    const onMove = (e: PointerEvent) => {
      const r = c.getBoundingClientRect()
      const x = e.clientX - r.left
      const y = e.clientY - r.top
      mouse = { x, y, vx: x - mouse.x, vy: y - mouse.y }
    }
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element).closest('a,button')) return
      const r = c.getBoundingClientRect()
      burst(e.clientX - r.left, e.clientY - r.top, reduced ? 40 : 140)
    }
    host.addEventListener('pointermove', onMove)
    host.addEventListener('click', onClick)
    const io = new IntersectionObserver(
      ([e]) => {
        inView = e.isIntersecting
        if (inView && !burstDone && !reduced) {
          burstDone = true
          window.setTimeout(() => burst(w / 2, h * 0.55, 180), 400)
        }
      },
      { threshold: 0.35 },
    )
    io.observe(host)

    let last = performance.now()
    let t = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (!inView) return
      const now = performance.now()
      const dt = Math.min((now - last) / 1000, 0.033)
      last = now
      t += dt
      ctx.clearRect(0, 0, w, h)

      // cordas
      for (const cd of cordas) {
        for (const p of cd.pts) {
          if (p.pin) continue
          const vx = (p.x - p.px) * 0.985
          const vy = (p.y - p.py) * 0.985
          p.px = p.x
          p.py = p.y
          const wind = reduced ? 0 : Math.sin(t * 1.3 + p.x * 0.01) * 6
          p.x += vx + wind * dt * dt * 60
          p.y += vy + 900 * dt * dt
          const dx = p.x - mouse.x
          const dy = p.y - mouse.y
          const d = Math.hypot(dx, dy)
          if (!reduced && d < 90) {
            p.x += mouse.vx * 0.25 + (dx / (d || 1)) * (90 - d) * 0.06
            p.y += mouse.vy * 0.25 + (dy / (d || 1)) * (90 - d) * 0.06
          }
        }
        for (let it = 0; it < 6; it++) {
          for (let i = 0; i < cd.pts.length - 1; i++) {
            const a = cd.pts[i]
            const b = cd.pts[i + 1]
            const dx = b.x - a.x
            const dy = b.y - a.y
            const d = Math.hypot(dx, dy) || 1
            const diff = (d - cd.len) / d
            if (!a.pin && !b.pin) {
              a.x += dx * diff * 0.5
              a.y += dy * diff * 0.5
              b.x -= dx * diff * 0.5
              b.y -= dy * diff * 0.5
            } else if (a.pin) {
              b.x -= dx * diff
              b.y -= dy * diff
            } else {
              a.x += dx * diff
              a.y += dy * diff
            }
          }
        }
        // fio
        ctx.strokeStyle = 'rgba(247,244,236,0.8)'
        ctx.lineWidth = 1.4
        ctx.beginPath()
        cd.pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)))
        ctx.stroke()
        // bandeirinhas com o corte em V
        for (let i = 0; i < cd.pts.length - 1; i++) {
          const a = cd.pts[i]
          const b = cd.pts[i + 1]
          const ang = Math.atan2(b.y - a.y, b.x - a.x)
          const sw = (a.x - a.px + b.x - b.px) * 0.6
          const len = Math.hypot(b.x - a.x, b.y - a.y) * 0.86
          const fh = len * 1.25
          ctx.save()
          ctx.translate((a.x + b.x) / 2, (a.y + b.y) / 2)
          ctx.rotate(ang)
          ctx.transform(1, 0, Math.max(-0.6, Math.min(0.6, -sw * 0.05)), 1, 0, 0)
          ctx.fillStyle = cd.cores[i]
          ctx.beginPath()
          ctx.moveTo(-len / 2, 0)
          ctx.lineTo(len / 2, 0)
          ctx.lineTo(len / 2, fh)
          ctx.lineTo(0, fh * 0.72)
          ctx.lineTo(-len / 2, fh)
          ctx.closePath()
          ctx.fill()
          ctx.restore()
        }
      }

      // confete
      confetes = confetes.filter((f) => (f.life -= dt) > 0 && f.y < h + 40)
      for (const f of confetes) {
        f.vx *= 1 - 1.8 * dt
        f.vy = f.vy * (1 - 1.2 * dt) + 700 * dt
        f.x += f.vx * dt + Math.sin(f.ph * 3) * 0.6
        f.y += f.vy * dt
        f.r += f.vr * dt
        f.ph += dt
        ctx.save()
        ctx.translate(f.x, f.y)
        ctx.rotate(f.r)
        ctx.scale(1, Math.cos(f.ph * 8))
        ctx.globalAlpha = Math.min(1, f.life)
        ctx.fillStyle = f.c
        ctx.fillRect(-f.w / 2, -f.h / 2, f.w, f.h)
        ctx.restore()
      }
      mouse.vx *= 0.8
      mouse.vy *= 0.8
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('click', onClick)
    }
  }, [reduced])

  return (
    <section ref={sec} id="festas" data-theme="anil" data-cursor="confete" aria-labelledby="festas-titulo" className="relative min-h-[110svh] overflow-hidden px-5 pt-[38vh] pb-28 sm:px-10">
      <canvas ref={canvas} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
      <div className="relative">
        <h2 id="festas-titulo" className="max-w-4xl font-display text-[clamp(2.4rem,6vw,5.6rem)] leading-[0.95] font-[850] [font-stretch:80%]">
          O ano tem duas festas grandes
        </h2>
        <p className="mt-4 max-w-lg opacity-85">Passe o cursor pelas bandeirinhas e clique em qualquer lugar para soltar confete.</p>
        <div className="mt-14 grid gap-10 md:grid-cols-2">
          <article className="rounded-[28px] bg-cal/10 p-7 backdrop-blur-sm sm:p-9">
            <h3 className="font-display text-3xl font-[850] text-ipe [font-stretch:110%]">Carnaval</h3>
            <p className="mt-3 text-[1.02rem]">
              Acontece antes da Quaresma, em fevereiro ou março. No Rio e em São Paulo, as escolas de samba desfilam no sambódromo. Em Olinda e no Recife, o frevo toma as ladeiras. Em Salvador, a festa vai atrás do trio elétrico.
            </p>
          </article>
          <article className="rounded-[28px] bg-cal/10 p-7 backdrop-blur-sm sm:p-9">
            <h3 className="font-display text-3xl font-[850] text-ipe [font-stretch:110%]">São João</h3>
            <p className="mt-3 text-[1.02rem]">
              Em junho, as festas juninas celebram Santo Antônio, São João e São Pedro com quadrilha, fogueira, milho e bandeirinhas. Campina Grande, na Paraíba, e Caruaru, em Pernambuco, disputam o título de maior São João do mundo.
            </p>
          </article>
        </div>
      </div>
    </section>
  )
}
