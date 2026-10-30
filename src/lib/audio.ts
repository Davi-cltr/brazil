// Instrumentos de percussão sintetizados com a Web Audio API (sem arquivos de som).
import type { Instrumento } from '@/data/brasil'
import { soundOn } from './store'

let ctx: AudioContext | null = null
let master: GainNode | null = null
let analyser: AnalyserNode | null = null
let noiseBuf: AudioBuffer | null = null

export function getAudio() {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = soundOn.get() ? 0.8 : 0
    const comp = ctx.createDynamicsCompressor()
    comp.threshold.value = -14
    comp.ratio.value = 4
    analyser = ctx.createAnalyser()
    analyser.fftSize = 512
    master.connect(comp).connect(analyser).connect(ctx.destination)
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const d = noiseBuf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
    soundOn.on((v) => master && master.gain.setTargetAtTime(v ? 0.8 : 0, ctx!.currentTime, 0.05))
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return { ctx, master: master!, analyser: analyser! }
}

function env(g: GainNode, t: number, peak: number, decay: number, attack = 0.002) {
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(peak, t + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay)
}

function tone(t: number, freq: number, endFreq: number, decay: number, peak: number, type: OscillatorType = 'sine') {
  const { ctx, master } = getAudio()
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  if (endFreq !== freq) o.frequency.exponentialRampToValueAtTime(endFreq, t + decay * 0.9)
  env(g, t, peak, decay)
  o.connect(g).connect(master)
  o.start(t)
  o.stop(t + decay + 0.05)
}

function noise(t: number, decay: number, peak: number, filter: BiquadFilterType, freq: number, q = 1) {
  const { ctx, master } = getAudio()
  const src = ctx.createBufferSource()
  src.buffer = noiseBuf
  const f = ctx.createBiquadFilter()
  f.type = filter
  f.frequency.value = freq
  f.Q.value = q
  const g = ctx.createGain()
  env(g, t, peak, decay, 0.001)
  src.connect(f).connect(g).connect(master)
  src.start(t, Math.random() * 0.5)
  src.stop(t + decay + 0.05)
}

/** toca um instrumento no tempo t (segundos do AudioContext) */
export function play(inst: Instrumento, t: number, accent = 1) {
  switch (inst) {
    case 'surdo':
      tone(t, 95, 48, 0.55, 0.9 * accent)
      noise(t, 0.04, 0.12 * accent, 'lowpass', 600)
      break
    case 'surdoAgudo':
      tone(t, 120, 70, 0.4, 0.6 * accent)
      break
    case 'bumbo':
      tone(t, 110, 42, 0.32, 0.85 * accent)
      break
    case 'zabumba':
      tone(t, 100, 52, 0.4, 0.9 * accent)
      noise(t, 0.05, 0.2 * accent, 'lowpass', 900)
      break
    case 'bacalhau':
      noise(t, 0.035, 0.35 * accent, 'bandpass', 2600, 3)
      tone(t, 620, 540, 0.04, 0.12 * accent, 'triangle')
      break
    case 'tamborim':
      tone(t, 780, 700, 0.06, 0.35 * accent, 'triangle')
      noise(t, 0.03, 0.25 * accent, 'highpass', 3000)
      break
    case 'agogoAlto':
      tone(t, 1240, 1240, 0.28, 0.16 * accent, 'sine')
      tone(t, 2790, 2790, 0.12, 0.05 * accent, 'sine')
      break
    case 'agogoBaixo':
      tone(t, 880, 880, 0.3, 0.16 * accent, 'sine')
      tone(t, 1990, 1990, 0.12, 0.05 * accent, 'sine')
      break
    case 'ganza':
      noise(t, 0.045, 0.14 * accent, 'highpass', 6000)
      break
    case 'triangulo':
      tone(t, 4200, 4200, 0.05, 0.06 * accent, 'sine')
      tone(t, 6100, 6100, 0.04, 0.03 * accent, 'sine')
      break
    case 'trianguloAberto':
      tone(t, 4200, 4200, 0.4, 0.08 * accent, 'sine')
      tone(t, 6100, 6100, 0.3, 0.04 * accent, 'sine')
      tone(t, 8300, 8300, 0.25, 0.02 * accent, 'sine')
      break
    case 'caixa':
      noise(t, 0.12, 0.3 * accent, 'bandpass', 1800, 0.8)
      tone(t, 220, 180, 0.08, 0.15 * accent, 'triangle')
      break
    case 'aro':
      tone(t, 1700, 1500, 0.05, 0.25 * accent, 'square')
      noise(t, 0.02, 0.1 * accent, 'bandpass', 4000, 4)
      break
  }
}

/** som curto de chute (embaixadinha) */
export function kick() {
  const { ctx } = getAudio()
  tone(ctx.currentTime, 180, 70, 0.12, 0.5)
  noise(ctx.currentTime, 0.04, 0.2, 'lowpass', 1200)
}
