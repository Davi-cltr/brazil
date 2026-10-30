import { useEffect, useRef, useState } from 'react'
import { REGIOES, UFS, UF_BY_SIGLA } from '@/data/brasil'
import type { MapScene } from '@/three/MapScene'
import { getLenis, scrollToTarget } from '@/lib/lenis'
import { introDone } from '@/lib/store'
import { clamp, easeInOut, easeOut, range } from '@/lib/utils'
import { VariableTitle } from '@/components/VariableTitle'
import { Clocks } from '@/components/Clocks'
import { RollText } from '@/components/RollText'

const N = REGIOES.length + 1 // abertura + 5 regiões
const SEG = 1.1
const IN_START = 0.6

function Words({ text }: { text: string }) {
  const words = text.split(' ')
  return (
    <>
      {words.map((w, i) => (
        <span key={i}>
          <span className="word-mask">
            <span data-word={i}>{w}</span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </>
  )
}

export function Travessia({ reduced }: { reduced: boolean }) {
  const wrapRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const panelsRef = useRef<(HTMLDivElement | null)[]>([])
  const heroRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const tipRef = useRef<HTMLDivElement>(null)
  const labelsRef = useRef<HTMLDivElement>(null)
  const railRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<HTMLDivElement>(null)
  const pRef = useRef(0)
  const [active, setActive] = useState(0)
  const [webgl, setWebgl] = useState(true)

  const yFor = (k: number) => {
    const el = wrapRef.current
    if (!el) return 0
    const top = el.getBoundingClientRect().top + window.scrollY
    return top + (k / (N - 1)) * (el.offsetHeight - window.innerHeight)
  }
  const goTo = (k: number) => scrollToTarget(yFor(k), Math.min(3, 1.1 + Math.abs(k - Math.round(pRef.current)) * 0.4))

  useEffect(() => {
    const wrap = wrapRef.current!
    const canvas = canvasRef.current!
    let scene: MapScene | null = null
    let disposed = false
    let pointer = { x: 0, y: 0 }
    let hoverPx: { x: number; y: number } | null = null
    let introStart = introDone.get() ? performance.now() : -1
    let inView = true
    let raf = 0
    let lastActive = -1
    let lastTip = ''

    const resize = () => scene?.resize(canvas.clientWidth, canvas.clientHeight)
    import('@/three/MapScene')
      .then(({ MapScene }) => {
        if (disposed) return
        try {
          scene = new MapScene(canvas, reduced)
          resize()
        } catch {
          setWebgl(false)
        }
      })
      .catch(() => setWebgl(false))
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    const offIntro = introDone.on((v) => {
      if (v && introStart < 0) introStart = performance.now()
    })

    const onMove = (e: PointerEvent) => {
      pointer = { x: (e.clientX / window.innerWidth) * 2 - 1, y: (e.clientY / window.innerHeight) * 2 - 1 }
      const r = canvas.getBoundingClientRect()
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom
      hoverPx = inside ? { x: e.clientX - r.left, y: e.clientY - r.top } : null
    }
    const onLeave = () => (hoverPx = null)
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    const io = new IntersectionObserver(([en]) => (inView = en.isIntersecting), { rootMargin: '100px' })
    io.observe(wrap)

    const labelEls = Array.from(labelsRef.current?.querySelectorAll<HTMLSpanElement>('[data-uf]') ?? [])

    const frame = () => {
      raf = requestAnimationFrame(frame)
      if (!inView) return
      const rect = wrap.getBoundingClientRect()
      const max = Math.max(1, rect.height - window.innerHeight)
      const p = clamp(-rect.top / max) * (N - 1)
      pRef.current = p
      const i = Math.min(Math.floor(p), N - 2)
      const t = p - i
      const nowActive = Math.round(p)
      if (nowActive !== lastActive) {
        lastActive = nowActive
        setActive(nowActive)
      }

      // passo do mapa: troca de região no meio da passagem
      let mapT = easeInOut(range(t, 0.25, 0.7))
      if (reduced) mapT = t >= 0.5 ? 1 : 0
      const step = i + mapT

      // textos das regiões entram em etapas; a abertura sai subindo
      panelsRef.current.forEach((panel, k) => {
        if (!panel) return
        const parts = panel.querySelectorAll<HTMLElement>('[data-j]')
        const n = parts.length
        let vis = 0
        parts.forEach((el) => {
          const j = Number(el.dataset.j)
          let inJ: number
          let outJ: number
          if (reduced) {
            inJ = p >= k - 0.5 ? 1 : 0
            outJ = k < N - 1 && p > k + 0.5 ? 1 : 0
          } else {
            inJ = easeOut(range(p - (k - 1), IN_START + j * 0.06, IN_START + j * 0.06 + 0.22))
            const o0 = (n - 1 - j) * 0.04
            outJ = k === N - 1 ? 0 : range(p - k, o0, o0 + 0.16)
          }
          const op = inJ * (1 - outJ)
          vis = Math.max(vis, op)
          el.style.opacity = String(op)
          el.style.transform = `translate3d(0, ${(1 - inJ) * 26 - outJ * 16}px, 0)`
        })
        panel.querySelectorAll<HTMLElement>('[data-word]').forEach((w) => {
          const wi = Number(w.dataset.word)
          const a = reduced ? (p >= k - 0.5 ? 1 : 0) : easeOut(range(p - (k - 1), IN_START + wi * 0.035, IN_START + wi * 0.035 + 0.24))
          w.style.transform = `translate3d(0, ${(1 - a) * 110}%, 0)`
        })
        panel.style.visibility = vis > 0.001 ? 'visible' : 'hidden'
      })

      // abertura
      const heroOut = reduced ? (p > 0.5 ? 1 : 0) : range(p, 0, 0.35)
      if (heroRef.current) {
        heroRef.current.style.opacity = String(1 - heroOut)
        heroRef.current.style.transform = `translate3d(0, ${-heroOut * 6}vh, 0)`
        heroRef.current.style.visibility = heroOut > 0.99 ? 'hidden' : 'visible'
      }
      if (titleRef.current) {
        titleRef.current.style.opacity = String(1 - heroOut)
        titleRef.current.style.transform = `translate3d(0, ${-heroOut * 14}vh, 0) scale(${1 - heroOut * 0.08})`
      }

      // régua
      if (railRef.current) {
        const show = range(p, 0.3, 0.8)
        railRef.current.style.opacity = String(show)
        railRef.current.inert = show < 0.5
      }
      if (markerRef.current) markerRef.current.style.transform = `translate3d(${(clamp((p - 1) / (N - 2)) * 100).toFixed(2)}%, 0, 0)`

      const aspect = canvas.clientWidth / Math.max(1, canvas.clientHeight)
      const wide = aspect >= 1
      const regionAmt = clamp(step)
      const intro = introStart < 0 ? 0 : reduced ? 1 : clamp((performance.now() - introStart) / 2200)
      scene?.render({
        step,
        pointer,
        hoverPx,
        intro,
        offsetX: wide ? regionAmt * Math.min(1.7, 0.75 * aspect) : 0,
        offsetY: wide ? 0 : 0.62 + regionAmt * 0.35,
      })

      // dica do estado sob o cursor
      const hov = scene?.hovered?.uf ?? ''
      if (tipRef.current) {
        if (hov !== lastTip) {
          lastTip = hov
          const u = UF_BY_SIGLA[hov]
          tipRef.current.innerHTML = u
            ? `<strong class="block font-display text-lg leading-tight">${u.nome}</strong><span class="block text-sm opacity-80">Capital: ${u.capital}</span><span class="block text-sm opacity-80">Região ${REGIOES.find((r) => r.id === u.regiao)!.nome}</span>`
            : ''
        }
        tipRef.current.style.opacity = hov ? '1' : '0'
        if (hoverPx) {
          const tw = tipRef.current.offsetWidth
          const tx = Math.min(hoverPx.x + 18, canvas.clientWidth - tw - 12)
          tipRef.current.style.transform = `translate3d(${tx}px, ${hoverPx.y + 18}px, 0)`
        }
      }

      // siglas dos estados da região em foco
      if (scene) {
        labelEls.forEach((el) => {
          const uf = el.dataset.uf!
          const s = scene!.byUf.get(uf)
          if (!s) return
          const w = Math.max(0, 1 - Math.abs(step - (s.regionIndex + 1)))
          if (w < 0.02) {
            el.style.opacity = '0'
            return
          }
          const pos = scene!.screenOf(uf)
          if (!pos) return
          el.style.opacity = String(w)
          el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`
        })
      }
    }
    raf = requestAnimationFrame(frame)

    // encaixe por parada
    let snapTimer = 0
    let dir = 1
    let snapping = false
    const lenis = getLenis()
    const snap = () => {
      if (snapping || reduced) return
      const p = pRef.current
      if (p <= 0.001 || p >= N - 1.001) return
      const frac = p - Math.floor(p)
      if (frac < 0.008 || frac > 0.992) return
      const target = dir > 0 ? (frac > 0.1 ? Math.ceil(p) : Math.floor(p)) : frac < 0.9 ? Math.floor(p) : Math.ceil(p)
      snapping = true
      lenis?.scrollTo(yFor(target), { duration: 1.3 * Math.max(0.45, Math.abs(target - p)), easing: easeInOut, onComplete: () => (snapping = false) })
      window.setTimeout(() => (snapping = false), 2200)
    }
    const onScroll = (l: { direction: number }) => {
      if (l.direction) dir = l.direction
      window.clearTimeout(snapTimer)
      snapTimer = window.setTimeout(snap, 170)
    }
    lenis?.on('scroll', onScroll)

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      offIntro()
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      lenis?.off('scroll', onScroll)
      window.clearTimeout(snapTimer)
      scene?.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced])

  return (
    <section ref={wrapRef} id="mapa" data-theme="mata" aria-label="O mapa do Brasil, estado por estado" style={{ height: `${100 + (N - 1) * SEG * 100}vh` }} className="relative">
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* linhas de latitude ao fundo */}
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.12]" preserveAspectRatio="none" viewBox="0 0 100 100">
          {Array.from({ length: 11 }, (_, i) => (
            <line key={i} x1="0" x2="100" y1={i * 10} y2={i * 10} stroke="#f7f4ec" strokeWidth="0.08" vectorEffect="non-scaling-stroke" strokeDasharray={i === 5 ? undefined : '2 3'} />
          ))}
        </svg>

        {/* título gigante, atrás do mapa */}
        <div ref={titleRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
          <VariableTitle text="Brasil" reduced={reduced} className="font-display text-[clamp(5rem,25vw,27rem)] leading-[0.8] tracking-[-0.03em] text-ipe" />
        </div>

        <canvas ref={canvasRef} className="absolute inset-0 z-10 h-full w-full" aria-hidden="true" data-cursor="explorar" />
        {!webgl && (
          <p className="absolute inset-x-6 top-28 z-20 max-w-md text-sm opacity-80">
            Seu navegador não liberou o WebGL, então o mapa em 3D não aparece. O resto do site funciona normalmente.
          </p>
        )}

        {/* siglas */}
        <div ref={labelsRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-20">
          {UFS.map((u) => (
            <span key={u.sigla} data-uf={u.sigla} className="absolute top-0 left-0 rounded-full bg-tinta/70 px-2 py-0.5 font-display text-[0.72rem] font-bold tracking-wide text-cal opacity-0 [font-stretch:120%]">
              {u.sigla}
            </span>
          ))}
        </div>

        {/* dica do estado */}
        <div ref={tipRef} role="status" aria-live="polite" className="pointer-events-none absolute top-0 left-0 z-30 rounded-2xl bg-cal px-4 py-3 text-tinta opacity-0 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.6)] transition-opacity duration-200" />

        {/* abertura */}
        <div ref={heroRef} className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col gap-6 px-5 pb-7 max-md:bg-gradient-to-t max-md:from-mata max-md:via-mata/85 max-md:to-transparent max-md:pt-16 sm:px-10 sm:pb-9 md:flex-row md:items-end md:justify-between [&_a]:pointer-events-auto [&_button]:pointer-events-auto">
          <div className="max-w-lg">
            <h1 className="font-display text-[clamp(1.5rem,2.6vw,2.2rem)] leading-[1.08] font-semibold [font-stretch:110%]">
              Um passeio pelo país, do mapa ao batuque.
            </h1>
            <p className="mt-3 max-w-md opacity-85">
              <span className="hidden [@media(hover:hover)]:inline">Passe o cursor pelos estados e role a página para atravessar as cinco regiões.</span>
              <span className="[@media(hover:hover)]:hidden">Role a página para atravessar as cinco regiões.</span>
            </p>
            <button type="button" onClick={() => goTo(1)} className="roll-host mt-6 inline-flex h-12 items-center rounded-full bg-ipe px-6 font-display font-semibold text-tinta transition-colors hover:bg-cal" data-cursor="ir">
              <RollText>Começar pelo Norte</RollText>
            </button>
          </div>
          <Clocks className="md:max-w-[34rem]" />
        </div>

        {/* regiões */}
        {REGIOES.map((r, idx) => {
          const k = idx + 1
          return (
            <div
              key={r.id}
              ref={(el) => {
                panelsRef.current[k] = el
              }}
              inert={active !== k}
              className="invisible absolute inset-x-0 bottom-0 z-20 px-5 pb-32 max-[999px]:bg-gradient-to-t max-[999px]:from-mata max-[999px]:via-mata/90 max-[999px]:to-transparent max-[999px]:pt-20 min-[1000px]:top-0 min-[1000px]:flex min-[1000px]:items-center min-[1000px]:px-10 min-[1000px]:pb-0"
            >
              <div className="max-w-[33rem]">
                <p data-j="0" className="mb-3 flex items-center gap-3 font-display text-sm font-semibold [font-stretch:120%]" style={{ color: r.cor }}>
                  <span className="inline-block size-3 rounded-full" style={{ background: r.cor }} aria-hidden="true" />
                  Região {r.nome}
                </p>
                <h2 data-j="1" className="font-display text-[clamp(2rem,4.6vw,3.9rem)] leading-[0.98] font-[800] tracking-[-0.02em] [font-stretch:88%]">
                  <Words text={r.titulo} />
                </h2>
                <p data-j="2" className="mt-5 max-w-[31rem] opacity-90 max-[999px]:text-[0.95rem]">
                  {r.texto}
                </p>
                <dl data-j="3" className="mt-7 grid grid-cols-3 gap-4 border-t border-cal/25 pt-5 max-[999px]:mt-5">
                  {r.fatos.map((f) => (
                    <div key={f.rotulo}>
                      <dt className="text-[0.78rem] opacity-70">{f.rotulo}</dt>
                      <dd className="mt-1 font-display text-[clamp(1rem,1.7vw,1.3rem)] font-bold [font-stretch:110%]">{f.valor}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          )
        })}

        {/* régua das regiões */}
        <div ref={railRef} className="absolute inset-x-0 bottom-0 z-30 px-5 pb-[max(1.1rem,env(safe-area-inset-bottom))] opacity-0 sm:px-10 sm:pb-7">
          <div className="relative mx-7 h-12 sm:mx-10">
            <div className="absolute top-[7px] right-0 left-0 h-px bg-cal/30" aria-hidden="true" />
            <div className="absolute top-0 right-0 left-0" aria-hidden="true">
              <div ref={markerRef} className="w-full">
                <div className="size-[15px] -translate-x-1/2 rounded-full bg-ipe shadow-[0_0_0_5px_rgba(255,201,60,0.25)]" />
              </div>
            </div>
            <ol>
              {REGIOES.map((r, idx) => (
                <li key={r.id} className="absolute top-0 -translate-x-1/2" style={{ left: `${(idx / (REGIOES.length - 1)) * 100}%` }}>
                  <button
                    type="button"
                    onClick={() => goTo(idx + 1)}
                    aria-current={active === idx + 1 ? 'step' : undefined}
                    className="roll-host flex flex-col items-center gap-2 px-2 pt-[3px] text-[0.75rem] whitespace-nowrap opacity-70 transition-opacity aria-[current=step]:opacity-100 sm:text-sm"
                  >
                    <span className="size-[9px] rounded-full border border-cal/70" style={{ background: r.cor }} aria-hidden="true" />
                    <RollText>{r.nome}</RollText>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
