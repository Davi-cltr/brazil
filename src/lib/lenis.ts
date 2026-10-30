import Lenis from 'lenis'
import { easeInOut, prefersReducedMotion } from './utils'

let instance: Lenis | null = null

export function startLenis() {
  if (instance || prefersReducedMotion()) return instance
  instance = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9, autoRaf: true })
  return instance
}

export function stopLenis() {
  instance?.destroy()
  instance = null
}

export const getLenis = () => instance

/** rola até uma posição em px ou até um elemento, com ou sem Lenis */
export function scrollToTarget(target: number | HTMLElement, duration = 1.4) {
  if (instance) {
    instance.scrollTo(target, { duration, easing: easeInOut })
    return
  }
  const top = typeof target === 'number' ? target : target.getBoundingClientRect().top + window.scrollY
  window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
}
