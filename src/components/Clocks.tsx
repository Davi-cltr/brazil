import { useEffect, useState } from 'react'
import { FUSOS } from '@/data/brasil'

const fmts = FUSOS.map(
  (f) => new Intl.DateTimeFormat('pt-BR', { timeZone: f.tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
)

/** Hora certa nos quatro fusos do Brasil, ao vivo */
export function Clocks({ className }: { className?: string }) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])
  return (
    <div className={className}>
      <p className="mb-2 text-[0.8rem] opacity-70">Agora, nos quatro fusos do país</p>
      <ul className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
        {FUSOS.map((f, i) => {
          const parts = fmts[i].format(now)
          return (
            <li key={f.tz} className="min-w-0">
              <time dateTime={now.toISOString()} className="block font-display text-[1.15rem] font-semibold tabular-nums [font-stretch:115%]">
                {parts}
              </time>
              <span className="block truncate text-[0.75rem] opacity-70">
                {f.nome}, {f.utc}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
