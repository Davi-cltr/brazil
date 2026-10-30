import { useEffect, useMemo, useRef, useState } from 'react'
import { geoMercator, geoPath } from 'd3-geo'
import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson'
import biomasRaw from '@/data/geo/biomas.json'
import estadosRaw from '@/data/geo/estados.json'
import { BIOMAS } from '@/data/brasil'
import { BiomeArt } from '@/components/BiomeArt'
import { startParticles } from '@/components/BiomeParticles'
import { getLenis, scrollToTarget } from '@/lib/lenis'
import { clamp, easeInOut, easeOut, range } from '@/lib/utils'
import { RollText } from '@/components/RollText'

const biomasGeo = biomasRaw as unknown as FeatureCollection<Polygon | MultiPolygon, { id: string }>
const estadosGeo = estadosRaw as unknown as FeatureCollection<Polygon | MultiPolygon, { uf: string }>
const N = BIOMAS.length
const SEG = 1.1
const COR_MAPA: Record<string, string> = {
  amazonia: '#2E9A5E',
  cerrado: '#E09A2D',
  'mata-atlantica': '#1E8F84',
  caatinga: '#C28A5C',
  pampa: '#8BC34A',
  pantanal: '#4FA3C0',
}
const pct = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

function Scene({ i, live, reduced }: { i: number; live: boolean; reduced: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (!live || !canvas.current) return
    return startParticles(canvas.current, BIOMAS[i].id, reduced)
  }, [live, i, reduced])
  return (
    <>
      <BiomeArt b={BIOMAS[i]} />
      <canvas ref={canvas} className="absolute inset-0 h-full w-full" aria-hidden="true" />
    </>
  )
}

export function Biomas({ reduced }: { reduced: boolean }) {
  const wrap = useRef<HTMLElement>(null)
  const scenes = useRef<(HTMLDivElement | null)[]>([])
  const panels = useRef<(HTMLDivElement | null)[]>([])
  const bars = useRef<(HTMLSpanElement | null)[]>([])
  const pRef = useRef(0)
  const [base, setBase] = useState(0)
  const [active, setActive] = useState(0)

  const mapa = useMemo(() => {
    const proj = geoMercator().fitSize([300, 300], estadosGeo)
    const path = geoPath(proj)
    return {
      estados: estadosGeo.features.map((f) => path(f) ?? ''),
      biomas: Object.fromEntries(biomasGeo.features.map((f) => [f.properties.id, path(f) ?? ''])),
    }
  }, [])

  const yFor = (k: number) => {
    const el = wrap.current!
    const top = el.getBoundingClientRect().top + window.scrollY
    return top + (k / (N - 1)) * (el.offsetHeight - window.innerHeight)
  }

  useEffect(() => {
    const el = wrap.current!
    let raf = 0
    let inView = false
    let pointer = { x: 0, y: 0 }
    let lastBase = -1
    let lastActive = -1
    const io = new IntersectionObserver(([e]) => (inView = e.isIntersecting), { rootMargin: '100px' })
    io.observe(el)
    const onMove = (e: PointerEvent) => (pointer = { x: (e.clientX / window.innerWidth) * 2 - 1, y: (e.clientY / window.innerHeight) * 2 - 1 })
    window.addEventListener('pointermove', onMove, { passive: true })
    const sp = { x: 0, y: 0 }

    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (!inView) return
      const r = el.getBoundingClientRect()
      const max = Math.max(1, r.height - window.innerHeight)
      const p = clamp(-r.top / max) * (N - 1)
      pRef.current = p
      const i = Math.min(Math.floor(p), N - 2)
      const t = p - i
      if (i !== lastBase) {
        lastBase = i
        setBase(i)
      }
      const a = Math.round(p)
      if (a !== lastActive) {
        lastActive = a
        setActive(a)
      }
      sp.x += (pointer.x - sp.x) * 0.06
      sp.y += (pointer.y - sp.y) * 0.06

      // cenas: a próxima abre num círculo que cresce a partir do centro
      const reveal = reduced ? (t >= 0.5 ? 1 : 0) : easeInOut(range(t, 0.18, 0.82))
      scenes.current.forEach((s, k) => {
        if (!s) return
        if (k < i || k > i + 1) {
          s.style.visibility = 'hidden'
          return
        }
        s.style.visibility = 'visible'
        if (k === i + 1) s.style.clipPath = `circle(${(reveal * 120).toFixed(2)}% at 50% 55%)`
        else s.style.clipPath = 'none'
        const zoom = k === i ? 1 + reveal * 0.08 : 1.08 - reveal * 0.08
        s.style.transform = reduced ? '' : `scale(${zoom})`
        if (!reduced) {
          s.querySelectorAll<SVGSVGElement>('[data-layer]').forEach((g) => {
            const d = Number(g.dataset.layer)
            g.style.transform = `translate3d(${(-sp.x * d * 40).toFixed(1)}px, ${(-sp.y * d * 22).toFixed(1)}px, 0) scale(1.06)`
          })
        }
      })

      // textos
      panels.current.forEach((panel, k) => {
        if (!panel) return
        let inJ: number, outJ: number
        if (reduced) {
          inJ = p >= k - 0.5 ? 1 : 0
          outJ = k < N - 1 && p > k + 0.5 ? 1 : 0
        } else {
          inJ = k === 0 ? 1 : easeOut(range(p - (k - 1), 0.62, 0.9))
          outJ = k === N - 1 ? 0 : range(p - k, 0.05, 0.22)
        }
        const op = inJ * (1 - outJ)
        panel.style.opacity = String(op)
        panel.style.transform = `translate3d(0, ${(1 - inJ) * 30 - outJ * 20}px, 0)`
        panel.style.visibility = op > 0.001 ? 'visible' : 'hidden'
      })
      bars.current.forEach((b, k) => {
        if (b) b.style.transform = `scaleX(${clamp(p - k + 0.5)})`
      })
    }
    raf = requestAnimationFrame(tick)

    // encaixe por bioma
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
      lenis?.scrollTo(yFor(target), { duration: 1.4 * Math.max(0.45, Math.abs(target - p)), easing: easeInOut, onComplete: () => (snapping = false) })
      window.setTimeout(() => (snapping = false), 2200)
    }
    const onScroll = (l: { direction: number }) => {
      if (l.direction) dir = l.direction
      window.clearTimeout(snapTimer)
      snapTimer = window.setTimeout(snap, 170)
    }
    lenis?.on('scroll', onScroll)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      lenis?.off('scroll', onScroll)
      window.clearTimeout(snapTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced])

  const b = BIOMAS[active]

  return (
    <section ref={wrap} id="biomas" data-theme="tinta" aria-labelledby="biomas-titulo" className="relative" style={{ height: `${100 + (N - 1) * SEG * 100}vh` }}>
      <h2 id="biomas-titulo" className="sr-only">Os seis biomas do Brasil</h2>
      <div className="sticky top-0 h-svh overflow-hidden">
        {BIOMAS.map((bio, k) => (
          <div
            key={bio.id}
            ref={(el) => {
              scenes.current[k] = el
            }}
            className="absolute inset-0 origin-center will-change-transform"
            style={{ zIndex: k, visibility: k === 0 ? 'visible' : 'hidden' }}
          >
            <Scene i={k} live={k === base || k === base + 1} reduced={reduced} />
          </div>
        ))}

        {/* sombra para leitura */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-black/65 via-black/30 to-transparent max-md:bg-gradient-to-t max-md:from-black/80 max-md:via-black/40" />

        {BIOMAS.map((bio, k) => (
          <div
            key={bio.id}
            ref={(el) => {
              panels.current[k] = el
            }}
            inert={active !== k}
            className="absolute inset-x-0 bottom-0 z-20 px-5 pb-32 text-cal [text-shadow:0_1px_18px_rgba(0,0,0,0.45)] md:top-0 md:flex md:items-center md:px-10 md:pb-0"
            style={{ visibility: k === 0 ? 'visible' : 'hidden' }}
          >
            <div className="max-w-[32rem]">
              <p className="font-display text-[clamp(4rem,11vw,9.5rem)] leading-[0.85] font-[900] tracking-[-0.03em] [font-stretch:65%]">
                {pct.format(bio.pct)}%
              </p>
              <p className="mt-2 text-sm opacity-85">do território brasileiro, cerca de {bio.areaKm2} de km²</p>
              <h3 className="mt-6 font-display text-[clamp(1.7rem,3.4vw,2.8rem)] leading-[1] font-[800] [font-stretch:90%]">{bio.titulo}</h3>
              <p className="mt-4 max-w-[30rem] opacity-95 max-md:text-[0.95rem]">{bio.texto}</p>
            </div>
          </div>
        ))}

        {/* minimapa com a área real de cada bioma */}
        <figure className="absolute top-24 right-5 z-20 w-[clamp(120px,22vw,250px)] rounded-3xl bg-black/35 p-4 text-cal backdrop-blur-md sm:right-10">
          <svg viewBox="0 0 300 300" className="h-auto w-full" role="img" aria-label={`Mapa do Brasil com o bioma ${b.nome} em destaque`}>
            {BIOMAS.map((bio) => (
              <path
                key={bio.id}
                d={mapa.biomas[bio.id]}
                fill={COR_MAPA[bio.id]}
                style={{ opacity: bio.id === b.id ? 1 : 0.18, transition: 'opacity 0.6s cubic-bezier(0.65,0.05,0,1)' }}
              />
            ))}
            <g fill="none" stroke="#F7F4EC" strokeOpacity="0.35" strokeWidth="0.6">
              {mapa.estados.map((d, k) => (
                <path key={k} d={d} />
              ))}
            </g>
          </svg>
          <figcaption className="mt-2 text-[0.72rem] opacity-80">Área do bioma {b.nome}. Fonte: IBGE.</figcaption>
        </figure>

        {/* índice dos biomas */}
        <nav aria-label="Biomas" className="absolute inset-x-0 bottom-0 z-30 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] text-cal sm:px-10 sm:pb-7">
          <ol className="grid grid-cols-3 gap-x-4 gap-y-2 md:grid-cols-6">
            {BIOMAS.map((bio, k) => (
              <li key={bio.id}>
                <button type="button" onClick={() => scrollToTarget(yFor(k), 1.4)} aria-current={active === k ? 'step' : undefined} className="roll-host block w-full text-left text-[0.8rem] opacity-70 transition-opacity aria-[current=step]:opacity-100 sm:text-sm">
                  <span className="mb-1.5 block h-[3px] overflow-hidden rounded-full bg-cal/25" aria-hidden="true">
                    <span
                      ref={(el) => {
                        bars.current[k] = el
                      }}
                      className="block h-full origin-left rounded-full bg-cal"
                      style={{ transform: 'scaleX(0)' }}
                    />
                  </span>
                  <RollText>{bio.nome}</RollText>
                </button>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </section>
  )
}
