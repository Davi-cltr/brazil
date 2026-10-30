import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { COPAS } from '@/data/brasil'
import { kick } from '@/lib/audio'
import { soundOn } from '@/lib/store'

const STAR = 'M50 4 L61.8 37.6 L97.6 38.2 L69 59.8 L79.4 94 L50 73.6 L20.6 94 L31 59.8 L2.4 38.2 L38.2 37.6 Z'

function readBest() {
  try {
    return Number(localStorage.getItem('brasil:embaixadinhas') ?? 0) || 0
  } catch {
    return 0
  }
}

/** Jogo de embaixadinha: toque na bola para mantê-la no ar */
function Embaixadinha({ reduced }: { reduced: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(readBest)
  const [status, setStatus] = useState<'pronto' | 'jogando' | 'caiu'>('pronto')
  const api = useRef<{ kick: (x?: number, y?: number) => void }>({ kick: () => {} })

  useEffect(() => {
    const c = canvas.current!
    const ctx = c.getContext('2d')!
    let w = 0
    let h = 0
    let r = 32
    const ball = { x: 0, y: 0, vx: 0, vy: 0, a: 0, va: 0 }
    let mode: 'pronto' | 'jogando' | 'caiu' = 'pronto'
    let pts = 0
    let raf = 0
    let last = performance.now()
    let t = 0
    let visible = false

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = c.clientWidth
      h = c.clientHeight
      c.width = w * dpr
      c.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      r = Math.max(24, Math.min(36, w * 0.06))
      if (mode !== 'jogando') {
        ball.x = w / 2
        ball.y = h * 0.45
      }
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(c)
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(c)

    const floor = () => h - 26
    const doKick = (cx?: number, cy?: number) => {
      if (mode === 'caiu') {
        mode = 'pronto'
        setStatus('pronto')
        pts = 0
        setScore(0)
        ball.x = w / 2
        ball.y = h * 0.45
        ball.vx = ball.vy = 0
        return
      }
      const px = cx ?? ball.x + (Math.random() - 0.5) * r
      const py = cy ?? ball.y + r
      const d = Math.hypot(px - ball.x, py - ball.y)
      if (cx !== undefined && d > r * 1.8) return
      mode = 'jogando'
      setStatus('jogando')
      ball.vy = -(820 + Math.random() * 140)
      ball.vx = Math.max(-420, Math.min(420, ball.vx * 0.4 + (ball.x - px) * 9))
      ball.va = ball.vx * 0.02
      pts++
      setScore(pts)
      if (soundOn.get()) kick()
    }
    api.current.kick = doKick
    const onDown = (e: PointerEvent) => {
      const rect = c.getBoundingClientRect()
      doKick(e.clientX - rect.left, e.clientY - rect.top)
    }
    c.addEventListener('pointerdown', onDown)

    const drawBall = () => {
      // sombra no chão
      const hgt = Math.max(0, floor() - (ball.y + r))
      const s = Math.max(0.25, 1 - hgt / h)
      ctx.fillStyle = 'rgba(0,0,0,0.25)'
      ctx.beginPath()
      ctx.ellipse(ball.x, floor() + 4, r * s, r * 0.22 * s, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.save()
      ctx.translate(ball.x, ball.y)
      ctx.rotate(ball.a)
      ctx.fillStyle = '#F7F4EC'
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#0B1410'
      const pent = (cx: number, cy: number, rr: number, rot: number) => {
        ctx.beginPath()
        for (let k = 0; k < 5; k++) {
          const a = rot + (k * Math.PI * 2) / 5
          ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr)
        }
        ctx.closePath()
        ctx.fill()
      }
      ctx.save()
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.clip()
      pent(0, 0, r * 0.36, -Math.PI / 2)
      for (let k = 0; k < 5; k++) {
        const a = -Math.PI / 2 + (k * Math.PI * 2) / 5
        pent(Math.cos(a) * r * 0.95, Math.sin(a) * r * 0.95, r * 0.3, a + Math.PI / 5)
      }
      ctx.restore()
      ctx.strokeStyle = '#0B1410'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
    }

    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (!visible) {
        last = performance.now()
        return
      }
      const now = performance.now()
      const dt = Math.min((now - last) / 1000, 0.033)
      last = now
      t += dt
      ctx.clearRect(0, 0, w, h)
      // listras do gramado
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'
        ctx.fillRect((i * w) / 8, 0, w / 8, h)
      }
      ctx.fillStyle = 'rgba(247,244,236,0.5)'
      ctx.fillRect(0, floor() + 8, w, 2)

      if (mode === 'pronto') {
        ball.y = h * 0.45 + (reduced ? 0 : Math.sin(t * 3) * 8)
        ball.a += reduced ? 0 : dt * 0.6
      } else if (mode === 'jogando') {
        ball.vy += 1900 * dt
        ball.x += ball.vx * dt
        ball.y += ball.vy * dt
        ball.a += ball.va * dt
        if (ball.x < r) {
          ball.x = r
          ball.vx = Math.abs(ball.vx) * 0.7
        }
        if (ball.x > w - r) {
          ball.x = w - r
          ball.vx = -Math.abs(ball.vx) * 0.7
        }
        if (ball.y < r) {
          ball.y = r
          ball.vy = Math.abs(ball.vy) * 0.4
        }
        if (ball.y + r >= floor()) {
          ball.y = floor() - r
          ball.vy = 0
          ball.vx = 0
          mode = 'caiu'
          setStatus('caiu')
          setBest((b) => {
            const nb = Math.max(b, pts)
            try {
              localStorage.setItem('brasil:embaixadinhas', String(nb))
            } catch {
              /* sem armazenamento */
            }
            return nb
          })
        }
      }
      drawBall()
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      c.removeEventListener('pointerdown', onDown)
    }
  }, [reduced])

  return (
    <div className="relative">
      <div className="mb-3 flex items-end justify-between">
        <p className="font-display text-[clamp(3rem,7vw,5.5rem)] leading-none font-[900] tabular-nums [font-stretch:70%]" aria-live="polite">
          {score}
          <span className="sr-only"> embaixadinhas</span>
        </p>
        <p className="text-right text-sm opacity-85">
          Recorde neste navegador: <strong className="font-display text-lg">{best}</strong>
        </p>
      </div>
      <canvas
        ref={canvas}
        tabIndex={0}
        role="application"
        aria-label="Jogo de embaixadinha. Clique na bola, ou aperte espaço, para chutar."
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault()
            api.current.kick()
          }
        }}
        data-cursor="chutar"
        className="block aspect-[4/3] w-full touch-none rounded-[28px] bg-black/15"
      />
      <p className="mt-3 text-sm opacity-85">
        {status === 'pronto' && 'Clique na bola, ou aperte espaço, para começar. Acerte embaixo dela para ela subir reto.'}
        {status === 'jogando' && 'Não deixe cair.'}
        {status === 'caiu' && `Caiu! Foram ${score}. Clique ou aperte espaço para tentar de novo.`}
      </p>
    </div>
  )
}

export function Futebol({ reduced }: { reduced: boolean }) {
  return (
    <section id="futebol" data-theme="gramado" aria-labelledby="futebol-titulo" className="px-5 py-32 sm:px-10">
      <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 id="futebol-titulo" className="font-display text-[clamp(2.4rem,5.6vw,5rem)] leading-[0.95] font-[850] [font-stretch:80%]">
            Cinco estrelas na camisa
          </h2>
          <p className="mt-5 max-w-md opacity-90">O Brasil é o país com mais títulos de Copa do Mundo masculina. Cada estrela acima do escudo é uma conquista.</p>
          <ol className="mt-12 flex flex-wrap gap-x-6 gap-y-8">
            {COPAS.map((ano, i) => (
              <li key={ano} className="flex flex-col items-center gap-3">
                <svg viewBox="0 0 100 100" className="size-[clamp(3.6rem,7vw,5.5rem)]" aria-hidden="true">
                  <motion.path
                    d={STAR}
                    fill="#FFC93C"
                    stroke="#FFC93C"
                    strokeWidth="3"
                    strokeLinejoin="round"
                    initial={reduced ? false : { pathLength: 0, fillOpacity: 0, rotate: -40, scale: 0.6 }}
                    whileInView={{ pathLength: 1, fillOpacity: 1, rotate: 0, scale: 1 }}
                    viewport={{ once: true, amount: 0.8 }}
                    transition={{ duration: 0.9, delay: i * 0.18, ease: [0.65, 0.05, 0, 1], fillOpacity: { delay: i * 0.18 + 0.6, duration: 0.4 } }}
                    style={{ transformOrigin: '50px 50px' }}
                  />
                </svg>
                <span className="font-display text-xl font-[800] tabular-nums">{ano}</span>
              </li>
            ))}
          </ol>
        </div>
        <Embaixadinha reduced={reduced} />
      </div>
    </section>
  )
}
