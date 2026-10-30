import { useEffect, useState } from 'react'
import { startLenis, stopLenis } from '@/lib/lenis'
import { useReducedMotionPref } from '@/lib/hooks'
import { Preloader } from '@/components/Preloader'
import { Cursor } from '@/components/Cursor'
import { Nav } from '@/sections/Nav'
import { Travessia } from '@/sections/Travessia'
import { Numeros } from '@/sections/Numeros'
import { Manifesto } from '@/sections/Manifesto'
import { Biomas } from '@/sections/Biomas'
import { Palavras } from '@/sections/Palavras'
import { Ritmos } from '@/sections/Ritmos'
import { Sabores } from '@/sections/Sabores'
import { Festas } from '@/sections/Festas'
import { Futebol } from '@/sections/Futebol'
import { Cidades } from '@/sections/Cidades'
import { Azulejos } from '@/sections/Azulejos'
import { Rodape } from '@/sections/Rodape'

/** o tema (cor de fundo) segue a seção que está no meio da tela */
function useSectionTheme(ready: boolean) {
  useEffect(() => {
    if (!ready) return
    const els = Array.from(document.querySelectorAll<HTMLElement>('main [data-theme], footer[data-theme]'))
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) document.documentElement.dataset.theme = (e.target as HTMLElement).dataset.theme
        })
      },
      { rootMargin: '-50% 0px -50% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [ready])
}

export default function App() {
  const reduced = useReducedMotionPref()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
    startLenis()
    setReady(true)
    return () => stopLenis()
  }, [])

  useSectionTheme(ready)

  return (
    <>
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[110] focus:rounded-full focus:bg-cal focus:px-4 focus:py-2 focus:text-tinta">
        Pular para o conteúdo
      </a>
      <Preloader reduced={reduced} />
      <Nav />
      <main id="conteudo">
        {ready && <Travessia reduced={reduced} />}
        <Numeros reduced={reduced} />
        <Manifesto reduced={reduced} />
        {ready && <Biomas reduced={reduced} />}
        <Palavras reduced={reduced} />
        <Ritmos reduced={reduced} />
        <div className="calcadao" aria-hidden="true" />
        <Sabores reduced={reduced} />
        <Festas reduced={reduced} />
        <Futebol reduced={reduced} />
        <Cidades reduced={reduced} />
        <Azulejos reduced={reduced} />
      </main>
      <Rodape reduced={reduced} />
      <Cursor reduced={reduced} />
      <div className="grain" aria-hidden="true" />
    </>
  )
}
