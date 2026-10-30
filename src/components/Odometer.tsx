import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

const fmt = new Intl.NumberFormat('pt-BR')

/**
 * Número em colunas de dígitos que giram até o valor, da direita para a esquerda,
 * quando o número aparece na tela.
 */
export function Odometer({ value, className, reduced }: { value: number; className?: string; reduced: boolean }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [on, setOn] = useState(reduced)
  const text = fmt.format(value)

  useEffect(() => {
    if (reduced) return setOn(true)
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true)
          io.disconnect()
        }
      },
      { threshold: 0.6 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduced])

  const chars = Array.from(text)
  const digitsTotal = chars.filter((c) => /\d/.test(c)).length
  let seen = 0

  return (
    <span ref={ref} className={cn('inline-flex overflow-hidden tabular-nums', className)} aria-label={text} role="img">
      {chars.map((c, i) => {
        if (!/\d/.test(c)) {
          return (
            <span key={i} aria-hidden="true">
              {c}
            </span>
          )
        }
        const d = Number(c)
        const fromRight = digitsTotal - 1 - seen++
        return (
          <span key={i} aria-hidden="true" className="relative inline-block h-[1em] overflow-hidden leading-none">
            <span
              className="flex flex-col"
              style={{
                transform: `translateY(${on ? -(d + 10) * 5 : 0}%)`,
                transition: reduced ? 'none' : `transform ${1.6 + fromRight * 0.12}s cubic-bezier(0.19, 1, 0.22, 1) ${fromRight * 0.06}s`,
              }}
            >
              {/* duas voltas no cilindro para o giro parecer mais longo */}
              {Array.from({ length: 20 }, (_, n) => (
                <span key={n} className="block h-[1em] leading-none">
                  {n % 10}
                </span>
              ))}
            </span>
          </span>
        )
      })}
    </span>
  )
}
