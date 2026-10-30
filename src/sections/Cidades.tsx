import { useRef } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { CIDADES } from '@/data/brasil'
import { Skyline } from '@/components/Skyline'

function Card({ c, i, progress, reduced }: { c: (typeof CIDADES)[number]; i: number; progress: MotionValue<number>; reduced: boolean }) {
  const n = CIDADES.length
  const target = 1 - (n - i) * 0.035
  const scale = useTransform(progress, [i / n, 1], [1, reduced ? 1 : target])
  const dim = useTransform(progress, [i / n, Math.min(1, (i + 1.2) / n)], [0, reduced ? 0 : 0.35])
  return (
    <div className="sticky flex h-[86svh] items-start justify-center" style={{ top: `calc(9vh + ${i * 22}px)` }}>
      <motion.article
        style={{ scale, background: c.cor, color: c.fg }}
        className="relative flex h-[min(74svh,640px)] w-full origin-top flex-col overflow-hidden rounded-[32px] p-7 shadow-[0_-20px_60px_-30px_rgba(0,0,0,0.5)] sm:p-10"
      >
        <div className="flex items-start justify-between gap-6">
          <h3 className="font-display text-[clamp(2.6rem,7.5vw,7rem)] leading-[0.88] font-[900] tracking-[-0.02em] [font-stretch:72%]">{c.nome}</h3>
          <span className="rounded-full border px-3 py-1 font-display text-sm font-bold" style={{ borderColor: c.fg }}>
            {c.uf}
          </span>
        </div>
        <p className="mt-5 max-w-md text-[clamp(1rem,1.5vw,1.2rem)] leading-snug">{c.fato}</p>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] opacity-90">
          <Skyline id={c.id} color={c.fg} />
        </div>
        <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: dim }} />
      </motion.article>
    </div>
  )
}

/** Cartas que se empilham: a de baixo encolhe e escurece enquanto a próxima sobe */
export function Cidades({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  return (
    <section id="cidades" data-theme="cal" aria-labelledby="cidades-titulo" className="px-5 pt-32 pb-20 sm:px-10">
      <h2 id="cidades-titulo" className="max-w-4xl font-display text-[clamp(2.4rem,5.6vw,5rem)] leading-[0.95] font-[850] [font-stretch:80%]">
        Seis cidades, seis jeitos de ser Brasil
      </h2>
      <div ref={ref} className="mt-16">
        {CIDADES.map((c, i) => (
          <Card key={c.id} c={c} i={i} progress={scrollYProgress} reduced={reduced} />
        ))}
      </div>
    </section>
  )
}
