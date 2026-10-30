import { useEffect, useRef, useState } from 'react'
import { Pause, Play, RotateCcw } from 'lucide-react'
import { RITMOS, type Ritmo } from '@/data/brasil'
import { getAudio, play } from '@/lib/audio'
import { soundOn } from '@/lib/store'
import { cn } from '@/lib/utils'

type Grid = boolean[][]
const toGrid = (r: Ritmo): Grid => r.trilhas.map((t) => Array.from(t.passos).map((c) => c === 'x'))

/**
 * Sequenciador de 16 passos com agendamento antecipado na Web Audio
 * (o som não depende do ritmo de quadros da tela).
 */
export function Ritmos({ reduced }: { reduced: boolean }) {
  const [idx, setIdx] = useState(0)
  const ritmo = RITMOS[idx]
  const [grid, setGrid] = useState<Grid>(() => toGrid(RITMOS[0]))
  const [bpm, setBpm] = useState(RITMOS[0].bpm)
  const [playing, setPlaying] = useState(false)
  const [step, setStep] = useState(-1)
  const gridRef = useRef(grid)
  const bpmRef = useRef(bpm)
  const ritmoRef = useRef(ritmo)
  const canvas = useRef<HTMLCanvasElement>(null)
  gridRef.current = grid
  bpmRef.current = bpm
  ritmoRef.current = ritmo

  const choose = (i: number) => {
    setIdx(i)
    setGrid(toGrid(RITMOS[i]))
    setBpm(RITMOS[i].bpm)
  }

  // agendador
  useEffect(() => {
    if (!playing) return
    const { ctx } = getAudio()
    let next = ctx.currentTime + 0.06
    let s = 0
    const queue: { s: number; t: number }[] = []
    const id = window.setInterval(() => {
      while (next < ctx.currentTime + 0.12) {
        const g = gridRef.current
        ritmoRef.current.trilhas.forEach((tr, ti) => {
          if (g[ti]?.[s]) play(tr.inst, next, s % 4 === 0 ? 1 : 0.72)
        })
        queue.push({ s, t: next })
        next += 60 / bpmRef.current / 4
        s = (s + 1) % 16
      }
    }, 25)
    let raf = 0
    const ui = () => {
      raf = requestAnimationFrame(ui)
      while (queue.length && queue[0].t <= ctx.currentTime) setStep(queue.shift()!.s)
    }
    raf = requestAnimationFrame(ui)
    return () => {
      window.clearInterval(id)
      cancelAnimationFrame(raf)
      setStep(-1)
    }
  }, [playing])

  // para quando sai da tela
  useEffect(() => {
    const el = canvas.current?.closest('section')
    if (!el) return
    const io = new IntersectionObserver(([e]) => !e.isIntersecting && setPlaying(false))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // visualizador: anéis que respiram com o som
  useEffect(() => {
    const c = canvas.current
    if (!c || !playing) return
    const ctx2 = c.getContext('2d')!
    const { analyser } = getAudio()
    const data = new Uint8Array(analyser.frequencyBinCount)
    let raf = 0
    const draw = () => {
      raf = requestAnimationFrame(draw)
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = c.clientWidth
      const h = c.clientHeight
      if (c.width !== w * dpr) {
        c.width = w * dpr
        c.height = h * dpr
      }
      ctx2.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx2.clearRect(0, 0, w, h)
      analyser.getByteFrequencyData(data)
      const n = 96
      const cx = w / 2
      const cy = h / 2
      const base = Math.min(w, h) * 0.22
      ctx2.strokeStyle = ritmoRef.current.cor
      ctx2.lineCap = 'round'
      for (let i = 0; i < n; i++) {
        const v = data[Math.floor((i / n) * data.length * 0.7)] / 255
        const a = (i / n) * Math.PI * 2 - Math.PI / 2
        const len = reduced ? 4 : 6 + v * base * 0.9
        ctx2.lineWidth = 3
        ctx2.globalAlpha = 0.35 + v * 0.65
        ctx2.beginPath()
        ctx2.moveTo(cx + Math.cos(a) * base, cy + Math.sin(a) * base)
        ctx2.lineTo(cx + Math.cos(a) * (base + len), cy + Math.sin(a) * (base + len))
        ctx2.stroke()
      }
      ctx2.globalAlpha = 1
    }
    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      ctx2.clearRect(0, 0, c.width, c.height)
    }
  }, [playing, reduced])

  const toggle = () => {
    getAudio()
    if (!playing) soundOn.set(true)
    setPlaying((v) => !v)
  }

  return (
    <section id="ritmos" data-theme="tinta" aria-labelledby="ritmos-titulo" className="relative overflow-hidden px-5 py-32 sm:px-10">
      <canvas ref={canvas} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full opacity-60" />
      <div className="relative grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)]">
        <div>
          <h2 id="ritmos-titulo" className="font-display text-[clamp(2.2rem,5vw,4.4rem)] leading-[0.98] font-[800] [font-stretch:85%]">
            Monte a batucada
          </h2>
          <p className="mt-5 max-w-md opacity-85">
            Escolha um ritmo, aperte play e ligue ou desligue os toques na grade. Os instrumentos são sintetizados no próprio navegador, em padrões simplificados.
          </p>
          <div role="tablist" aria-label="Ritmos" className="mt-8 flex flex-wrap gap-2">
            {RITMOS.map((r, i) => (
              <button
                key={r.id}
                role="tab"
                aria-selected={i === idx}
                onClick={() => choose(i)}
                className="rounded-full border px-5 py-2.5 font-display text-sm font-semibold transition-colors [font-stretch:110%]"
                style={i === idx ? { background: r.cor, borderColor: r.cor, color: '#0b1410' } : { borderColor: 'rgba(247,244,236,0.35)' }}
              >
                {r.nome}
              </button>
            ))}
          </div>
          <div role="tabpanel" aria-label={ritmo.nome} className="mt-8">
            <p className="text-sm" style={{ color: ritmo.cor }}>
              {ritmo.origem}
            </p>
            <p className="mt-2 max-w-md opacity-90">{ritmo.texto}</p>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={toggle}
              data-cursor="tocar"
              className="grid size-20 place-items-center rounded-full transition-transform duration-300 hover:scale-105"
              style={{ background: ritmo.cor, color: '#0b1410' }}
              aria-label={playing ? `Parar ${ritmo.nome}` : `Tocar ${ritmo.nome}`}
            >
              {playing ? <Pause className="size-8" aria-hidden="true" /> : <Play className="size-8 translate-x-0.5" aria-hidden="true" />}
            </button>
            <label className="flex items-center gap-3 text-sm">
              <span className="w-24 tabular-nums">{bpm} batidas/min</span>
              <input type="range" min={60} max={170} value={bpm} onChange={(e) => setBpm(Number(e.target.value))} className="w-40" style={{ accentColor: ritmo.cor }} />
            </label>
            <button type="button" onClick={() => choose(idx)} className="flex items-center gap-2 text-sm opacity-80 hover:opacity-100">
              <RotateCcw className="size-4" aria-hidden="true" /> Voltar ao padrão
            </button>
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <table className="w-full min-w-[640px] table-fixed border-separate border-spacing-1">
            <colgroup>
              <col className="w-36" />
              {Array.from({ length: 16 }, (_, s) => (
                <col key={s} />
              ))}
            </colgroup>
            <caption className="sr-only">Grade de {ritmo.nome}: cada linha é um instrumento, cada coluna um passo</caption>
            <thead>
              <tr>
                <th scope="col" className="sr-only">Instrumento</th>
                {Array.from({ length: 16 }, (_, s) => (
                  <th key={s} scope="col" className={cn('text-[0.65rem] font-normal opacity-50', s % 4 === 0 && 'opacity-90')}>
                    {s % 4 === 0 ? s / 4 + 1 : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ritmo.trilhas.map((tr, ti) => (
                <tr key={tr.nome}>
                  <th scope="row" className="truncate pr-3 text-left text-[0.8rem] font-medium">
                    {tr.nome}
                  </th>
                  {grid[ti].map((on, s) => (
                    <td key={s}>
                      <button
                        type="button"
                        aria-pressed={on}
                        aria-label={`${tr.nome}, passo ${s + 1}`}
                        onClick={() => setGrid((g) => g.map((row, r) => (r === ti ? row.map((v, c) => (c === s ? !v : v)) : row)))}
                        className={cn(
                          'block h-9 w-full rounded-md transition-[background-color,transform] duration-150',
                          s % 4 === 0 ? 'bg-cal/18' : 'bg-cal/8',
                          step === s && 'scale-y-110',
                        )}
                        style={on ? { background: ritmo.cor, transform: step === s ? 'scale(1.12)' : undefined } : step === s ? { background: 'rgba(247,244,236,0.35)' } : undefined}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
