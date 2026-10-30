// Estado global mínimo, sem dependência: quem precisa se inscreve.
type Listener<T> = (v: T) => void

export function createSignal<T>(initial: T) {
  let value = initial
  const listeners = new Set<Listener<T>>()
  return {
    get: () => value,
    set: (v: T) => {
      if (Object.is(v, value)) return
      value = v
      listeners.forEach((l) => l(v))
    },
    on: (l: Listener<T>) => {
      listeners.add(l)
      return () => {
        listeners.delete(l)
      }
    },
  }
}

/** a abertura terminou: o mapa pode subir */
export const introDone = createSignal(false)
/** som ligado (só depois de um clique do usuário) */
export const soundOn = createSignal(false)
