import { useRef, useState } from 'react'
import { PALAVRAS } from '@/data/brasil'

const GLYPHS = 'ABCDEFGHIJLMNOPQRSTUVXZÃÇÉÔ'

/** embaralha as letras e vai fixando da esquerda para a direita */
function scramble(el: HTMLElement, word: string, reduced: boolean) {
  if (reduced) return
  let frame = 0
  const total = word.length * 3 + 6
  const id = window.setInterval(() => {
    frame++
    const fixed = Math.floor((frame / total) * word.length)
    el.textContent = Array.from(word)
      .map((c, i) => (i < fixed ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
      .join('')
    if (frame >= total) {
      window.clearInterval(id)
      el.textContent = word
    }
  }, 34)
}

function Card({ p, i, reduced }: { p: (typeof PALAVRAS)[number]; i: number; reduced: boolean }) {
  const [flipped, setFlipped] = useState(false)
  const word = useRef<HTMLSpanElement>(null)
  const colors = ['bg-ipe text-tinta', 'bg-urucum text-tinta', 'bg-anil text-cal', 'bg-mata text-cal', 'bg-roxo text-tinta', 'bg-folha text-tinta']
  return (
    <li className="[perspective:1200px]">
      <button
        type="button"
        aria-pressed={flipped}
        aria-label={`${p.palavra}: ${flipped ? p.sentido : 'mostrar o significado'}`}
        onClick={() => setFlipped((v) => !v)}
        onPointerEnter={(e) => {
          if (e.pointerType === 'mouse' && word.current) scramble(word.current, p.palavra, reduced)
        }}
        data-cursor="virar"
        className="relative block aspect-[4/3] w-full text-left transition-transform duration-700 ease-(--ease-brasa) [transform-style:preserve-3d] aria-pressed:[transform:rotateY(180deg)]"
      >
        <span className={`absolute inset-0 flex flex-col justify-between rounded-[28px] p-6 [backface-visibility:hidden] sm:p-8 ${colors[i % colors.length]}`}>
          <span className="text-sm opacity-75">Toque para traduzir</span>
          <span ref={word} className="font-display text-[clamp(2rem,3.6vw,3.3rem)] leading-none font-[850] break-words [font-stretch:100%]">
            {p.palavra}
          </span>
        </span>
        <span className="absolute inset-0 flex flex-col justify-between rounded-[28px] bg-tinta p-6 text-cal [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-8">
          <span className="font-display text-xl font-[800] [font-stretch:115%]">{p.palavra}</span>
          <span className="text-[clamp(1.05rem,1.6vw,1.3rem)] leading-snug">{p.sentido}</span>
        </span>
      </button>
    </li>
  )
}

export function Palavras({ reduced }: { reduced: boolean }) {
  return (
    <section id="palavras" data-theme="cal" aria-labelledby="palavras-titulo" className="px-5 py-32 sm:px-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <h2 id="palavras-titulo" className="max-w-3xl font-display text-[clamp(2.2rem,5vw,4.4rem)] leading-[0.98] font-[800] [font-stretch:85%]">
          Palavras que dão trabalho para traduzir
        </h2>
        <p className="max-w-sm opacity-80">Passe o cursor para embaralhar e clique para virar a carta. Cada uma tem um sentido que outras línguas resolvem com uma frase inteira.</p>
      </div>
      <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PALAVRAS.map((p, i) => (
          <Card key={p.palavra} p={p} i={i} reduced={reduced} />
        ))}
      </ul>
    </section>
  )
}
