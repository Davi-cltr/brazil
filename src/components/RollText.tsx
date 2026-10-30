import { cn } from '@/lib/utils'

/**
 * Texto que rola letra a letra no hover (efeito dos links do site do Lando Norris).
 * O elemento pai precisa da classe `roll-host`.
 */
export function RollText({ children, className }: { children: string; className?: string }) {
  return (
    <span className={cn('roll', className)}>
      <span className="sr-only">{children}</span>
      {Array.from(children).map((ch, i) => (
        <span key={i} className="roll__char" style={{ ['--i' as string]: i }} aria-hidden="true">
          <span>{ch}</span>
          <span>{ch}</span>
        </span>
      ))}
    </span>
  )
}
