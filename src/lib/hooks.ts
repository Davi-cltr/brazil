import { useEffect, useState, useSyncExternalStore } from 'react'
import { createSignal } from './store'

export function useSignal<T>(s: ReturnType<typeof createSignal<T>>) {
  return useSyncExternalStore(s.on, s.get, s.get)
}

export function useReducedMotionPref() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false,
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}

/** liga um efeito só enquanto o elemento está perto da tela */
export function useInViewRef<T extends Element>(ref: React.RefObject<T | null>, margin = '200px') {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: margin })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, margin])
  return inView
}
