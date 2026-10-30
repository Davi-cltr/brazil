import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { geoMercator, geoPath } from 'd3-geo'
import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson'
import estadosRaw from '@/data/geo/estados.json'
import { introDone } from '@/lib/store'
import { getLenis } from '@/lib/lenis'

const estados = estadosRaw as unknown as FeatureCollection<Polygon | MultiPolygon, { uf: string }>

/** Abertura: o contorno dos estados se desenha enquanto o contador vai a 100 */
export function Preloader({ reduced }: { reduced: boolean }) {
  const [count, setCount] = useState(0)
  const [done, setDone] = useState(false)
  const skip = useRef(false)

  const paths = useMemo(() => {
    const proj = geoMercator().fitSize([400, 400], estados)
    const path = geoPath(proj)
    return estados.features.map((f) => ({ uf: f.properties.uf, d: path(f) ?? '' }))
  }, [])

  useEffect(() => {
    getLenis()?.stop()
    const total = reduced ? 300 : 2100
    const start = performance.now()
    let raf = 0
    const tick = () => {
      const t = Math.min(1, (performance.now() - start) / total)
      const e = skip.current ? 1 : 1 - Math.pow(1 - t, 2.2)
      setCount(Math.round(e * 100))
      if (e >= 1) {
        window.setTimeout(() => setDone(true), reduced ? 0 : 250)
        return
      }
      raf = requestAnimationFrame(tick)
    }
    // espera as fontes para não haver troca de letra durante a animação
    const go = () => (raf = requestAnimationFrame(tick))
    if (document.fonts?.ready) document.fonts.ready.then(go)
    else go()
    return () => cancelAnimationFrame(raf)
  }, [reduced])

  useEffect(() => {
    if (!done) return
    getLenis()?.start()
    introDone.set(true)
  }, [done])

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="pre"
          role="status"
          aria-label={`Carregando, ${count}%`}
          onClick={() => (skip.current = true)}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-mata text-cal"
          exit={reduced ? { opacity: 0 } : { clipPath: 'inset(0 0 100% 0)' }}
          initial={{ clipPath: 'inset(0 0 0% 0)' }}
          transition={{ duration: reduced ? 0.3 : 1.05, ease: [0.65, 0.05, 0, 1] }}
        >
          <svg viewBox="0 0 400 400" className="h-[min(62vh,80vw)] w-auto" aria-hidden="true">
            {paths.map((p, i) => (
              <motion.path
                key={p.uf}
                d={p.d}
                fill="#ffc93c"
                fillOpacity={0}
                stroke="#ffc93c"
                strokeWidth={1.1}
                strokeLinejoin="round"
                initial={{ pathLength: 0, fillOpacity: 0 }}
                animate={{ pathLength: 1, fillOpacity: count > 85 ? 0.92 : 0 }}
                transition={{
                  pathLength: { duration: reduced ? 0 : 1.3, delay: reduced ? 0 : 0.15 + i * 0.03, ease: [0.65, 0.05, 0, 1] },
                  fillOpacity: { duration: 0.4, delay: i * 0.008 },
                }}
              />
            ))}
          </svg>
          <p className="absolute bottom-6 left-5 font-display text-[clamp(3rem,10vw,8rem)] leading-none font-[850] tabular-nums [font-stretch:70%] sm:left-10">
            {count}
          </p>
          <p className="absolute right-5 bottom-8 max-w-[14rem] text-right text-sm opacity-75 sm:right-10">
            Desenhando os 27 estados. Toque para pular.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
