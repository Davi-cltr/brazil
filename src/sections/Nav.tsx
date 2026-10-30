import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Dialog as D } from 'radix-ui'
import { Volume2, VolumeX } from 'lucide-react'
import { RollText } from '@/components/RollText'
import { scrollToTarget, getLenis } from '@/lib/lenis'
import { soundOn } from '@/lib/store'
import { useSignal } from '@/lib/hooks'

export const SECOES = [
  { id: 'mapa', nome: 'Mapa' },
  { id: 'numeros', nome: 'Números' },
  { id: 'biomas', nome: 'Biomas' },
  { id: 'palavras', nome: 'Palavras' },
  { id: 'ritmos', nome: 'Ritmos' },
  { id: 'sabores', nome: 'Sabores' },
  { id: 'festas', nome: 'Festas' },
  { id: 'futebol', nome: 'Futebol' },
  { id: 'cidades', nome: 'Cidades' },
  { id: 'azulejos', nome: 'Azulejos' },
]

function Mark() {
  return (
    <svg viewBox="0 0 40 40" className="size-8" aria-hidden="true">
      <path d="M20 3 37 20 20 37 3 20Z" fill="currentColor" />
      <circle cx="20" cy="20" r="8" fill="var(--bg)" />
      <path d="M12.5 18.5c5-2.2 10.5-2 15 1" stroke="currentColor" strokeWidth="1.6" fill="none" />
    </svg>
  )
}

export function Nav() {
  const [open, setOpen] = useState(false)
  const sound = useSignal(soundOn)

  useEffect(() => {
    const l = getLenis()
    if (open) l?.stop()
    else l?.start()
  }, [open])

  const go = (id: string) => {
    setOpen(false)
    const el = document.getElementById(id)
    if (el) window.setTimeout(() => scrollToTarget(el, 2), 350)
  }

  return (
    <>
      <motion.header
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.4, ease: [0.19, 1, 0.22, 1] }}
        className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-4 text-cal mix-blend-difference sm:px-10 sm:py-6"
      >
        <a href="#mapa" onClick={(e) => (e.preventDefault(), go('mapa'))} className="roll-host pointer-events-auto flex items-center gap-2.5 font-display text-lg font-[800] [font-stretch:120%]">
          <Mark />
          <RollText>Brasil</RollText>
        </a>
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => soundOn.set(!sound)}
            aria-pressed={sound}
            aria-label={sound ? 'Desligar som' : 'Ligar som'}
            className="grid size-11 place-items-center rounded-full border border-cal/60 transition-colors hover:bg-cal hover:text-tinta"
          >
            {sound ? <Volume2 className="size-4" aria-hidden="true" /> : <VolumeX className="size-4" aria-hidden="true" />}
          </button>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={open}
            className="roll-host flex h-11 items-center gap-3 rounded-full border border-cal/60 px-5 font-display text-sm font-semibold transition-colors hover:bg-cal hover:text-tinta"
          >
            <RollText>Menu</RollText>
            <span className="flex flex-col gap-[3px]" aria-hidden="true">
              <span className="block h-[2px] w-4 bg-current" />
              <span className="block h-[2px] w-4 bg-current" />
            </span>
          </button>
        </div>
      </motion.header>

      <D.Root open={open} onOpenChange={setOpen}>
        <AnimatePresence>
          {open && (
            <D.Portal forceMount>
              <D.Overlay forceMount asChild>
                <motion.div className="fixed inset-0 z-[80] bg-tinta/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
              </D.Overlay>
              <D.Content forceMount asChild aria-describedby={undefined}>
                <motion.div
                  className="fixed inset-0 z-[81] flex flex-col overflow-y-auto overscroll-contain bg-ipe px-5 pt-5 pb-10 text-tinta sm:px-10 sm:pt-6"
                  initial={{ clipPath: 'circle(0% at calc(100% - 4rem) 3rem)' }}
                  animate={{ clipPath: 'circle(150% at calc(100% - 4rem) 3rem)' }}
                  exit={{ clipPath: 'circle(0% at calc(100% - 4rem) 3rem)' }}
                  transition={{ duration: 0.8, ease: [0.65, 0.05, 0, 1] }}
                >
                  <div className="flex items-center justify-between">
                    <D.Title className="font-display text-lg font-[800] [font-stretch:120%]">Ir para</D.Title>
                    <D.Close className="roll-host flex h-11 items-center gap-3 rounded-full border border-tinta/60 px-5 font-display text-sm font-semibold transition-colors hover:bg-tinta hover:text-ipe">
                      <RollText>Fechar</RollText>
                    </D.Close>
                  </div>
                  <nav aria-label="Seções" className="mt-8 flex-1">
                    <ul className="grid gap-x-10 sm:grid-cols-2">
                      {SECOES.map((s, i) => (
                        <li key={s.id} className="overflow-hidden border-b border-tinta/20">
                          <motion.a
                            href={`#${s.id}`}
                            onClick={(e) => {
                              e.preventDefault()
                              go(s.id)
                            }}
                            initial={{ y: '110%' }}
                            animate={{ y: 0 }}
                            transition={{ duration: 0.8, delay: 0.15 + i * 0.045, ease: [0.65, 0.05, 0, 1] }}
                            className="group flex items-baseline justify-between py-2 font-display text-[clamp(2rem,6vw,4.4rem)] leading-[1.05] font-[800] transition-[font-variation-settings] duration-500 [font-variation-settings:'wdth'_80] hover:[font-variation-settings:'wdth'_140]"
                          >
                            {s.nome}
                            <span className="text-base font-medium opacity-0 transition-opacity group-hover:opacity-60" aria-hidden="true">
                              ir
                            </span>
                          </motion.a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </motion.div>
              </D.Content>
            </D.Portal>
          )}
        </AnimatePresence>
      </D.Root>
    </>
  )
}
