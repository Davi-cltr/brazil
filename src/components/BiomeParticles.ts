// Partículas de cada bioma num canvas 2D: chuva, sementes, névoa, poeira, vento e pássaros.

interface P {
  x: number
  y: number
  vx: number
  vy: number
  s: number
  a: number
  ph: number
}

export function startParticles(canvas: HTMLCanvasElement, kind: string, reduced: boolean) {
  const ctx = canvas.getContext('2d')
  if (!ctx || reduced) return () => {}
  let w = 0
  let h = 0
  let dpr = 1
  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    w = canvas.clientWidth
    h = canvas.clientHeight
    canvas.width = w * dpr
    canvas.height = h * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(canvas)

  const count = { amazonia: 260, cerrado: 70, 'mata-atlantica': 14, caatinga: 90, pampa: 60, pantanal: 9 }[kind] ?? 50
  const make = (initial: boolean): P => {
    const r = Math.random
    switch (kind) {
      case 'amazonia':
        return { x: r() * w * 1.2, y: initial ? r() * h : -20, vx: -120, vy: 900 + r() * 500, s: 10 + r() * 14, a: 0.25 + r() * 0.35, ph: 0 }
      case 'cerrado':
        return { x: r() * w, y: initial ? r() * h : h + 10, vx: 10 + r() * 20, vy: -(15 + r() * 30), s: 1.5 + r() * 2.5, a: 0.5 + r() * 0.5, ph: r() * 6 }
      case 'mata-atlantica':
        return { x: initial ? r() * w : -300, y: h * (0.35 + r() * 0.5), vx: 12 + r() * 18, vy: 0, s: 160 + r() * 220, a: 0.12 + r() * 0.12, ph: r() * 6 }
      case 'caatinga':
        return { x: initial ? r() * w : -10, y: h * (0.45 + r() * 0.5), vx: 30 + r() * 60, vy: (r() - 0.5) * 8, s: 1 + r() * 2, a: 0.35 + r() * 0.4, ph: r() * 6 }
      case 'pampa':
        return { x: initial ? r() * w : -200, y: r() * h * 0.85, vx: 600 + r() * 500, vy: 0, s: 60 + r() * 160, a: 0.12 + r() * 0.2, ph: r() * 6 }
      case 'pantanal':
      default:
        return { x: initial ? r() * w : -60, y: h * (0.12 + r() * 0.3), vx: 50 + r() * 40, vy: (r() - 0.5) * 6, s: 10 + r() * 8, a: 0.9, ph: r() * 6 }
    }
  }
  const ps: P[] = Array.from({ length: count }, () => make(true))
  let last = performance.now()
  let raf = 0
  const tick = () => {
    raf = requestAnimationFrame(tick)
    const now = performance.now()
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    ctx.clearRect(0, 0, w, h)
    // atualiza posições
    for (let i = 0; i < ps.length; i++) {
      const p = ps[i]
      p.ph += dt
      p.x += p.vx * dt + (kind === 'cerrado' ? Math.sin(p.ph * 2) * 0.4 : 0)
      p.y += p.vy * dt
      if (p.y > h + 40 || p.y < -40 || p.x > w + 320 || p.x < -340) ps[i] = make(false)
    }
    // desenha em lotes: poucos traços por quadro, mesmo com centenas de partículas
    switch (kind) {
      case 'amazonia': {
        ctx.strokeStyle = 'rgba(220,245,235,0.4)'
        ctx.lineWidth = 1
        ctx.beginPath()
        for (const p of ps) {
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p.x + p.vx * 0.018, p.y - p.s)
        }
        ctx.stroke()
        break
      }
      case 'cerrado': {
        ctx.fillStyle = 'rgba(255,248,225,0.75)'
        ctx.beginPath()
        for (const p of ps) {
          ctx.moveTo(p.x + p.s, p.y)
          ctx.arc(p.x, p.y, p.s * (0.75 + 0.25 * Math.sin(p.ph * 3)), 0, Math.PI * 2)
        }
        ctx.fill()
        break
      }
      case 'mata-atlantica':
        for (const p of ps) {
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.s)
          g.addColorStop(0, `rgba(240,250,248,${p.a})`)
          g.addColorStop(1, 'rgba(240,250,248,0)')
          ctx.fillStyle = g
          ctx.fillRect(p.x - p.s, p.y - p.s, p.s * 2, p.s * 2)
        }
        break
      case 'caatinga':
        ctx.fillStyle = 'rgba(120,85,55,0.55)'
        for (const p of ps) ctx.fillRect(p.x, p.y + Math.sin(p.ph * 2) * 4, p.s, p.s)
        break
      case 'pampa': {
        ctx.strokeStyle = 'rgba(255,255,255,0.28)'
        ctx.lineWidth = 1.2
        ctx.beginPath()
        for (const p of ps) {
          ctx.moveTo(p.x, p.y + Math.sin(p.ph * 3) * 6)
          ctx.quadraticCurveTo(p.x + p.s * 0.5, p.y - 8, p.x + p.s, p.y + Math.sin(p.ph * 3 + 1) * 6)
        }
        ctx.stroke()
        break
      }
      case 'pantanal': {
        // pássaros em V batendo asa
        ctx.strokeStyle = 'rgba(28,18,6,0.85)'
        ctx.lineWidth = 2.2
        ctx.beginPath()
        for (const p of ps) {
          const f = Math.sin(p.ph * 9) * p.s * 0.45
          ctx.moveTo(p.x - p.s, p.y - f)
          ctx.quadraticCurveTo(p.x - p.s * 0.4, p.y - p.s * 0.2, p.x, p.y)
          ctx.quadraticCurveTo(p.x + p.s * 0.4, p.y - p.s * 0.2, p.x + p.s, p.y - f)
        }
        ctx.stroke()
        break
      }
    }
  }
  raf = requestAnimationFrame(tick)
  return () => {
    cancelAnimationFrame(raf)
    ro.disconnect()
  }
}
