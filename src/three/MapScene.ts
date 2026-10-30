import * as THREE from 'three'
import { geoCentroid, geoMercator } from 'd3-geo'
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson'
import estadosRaw from '@/data/geo/estados.json'
import { REGIOES, UF_BY_SIGLA } from '@/data/brasil'

const estados = estadosRaw as unknown as FeatureCollection<Polygon | MultiPolygon, { uf: string; nome: string }>

const BASE_GREENS = ['#1C6E47', '#22804F', '#2E9A5E', '#17603F', '#28895A']
const MUTED = new THREE.Color('#1d3a2e')
const HOVER = new THREE.Color('#FFC93C')

interface StateObj {
  uf: string
  group: THREE.Group
  mesh: THREE.Mesh<THREE.ExtrudeGeometry, THREE.MeshStandardMaterial>
  lines: THREE.LineSegments
  base: THREE.Color
  regionColor: THREE.Color
  regionIndex: number
  baseH: number
  h: number
  lift: number
  drop: number
  introDelay: number
  centroid: THREE.Vector3
}

export interface MapState {
  /** 0 = abertura; 1..5 = regiões (pode ser fracionário na passagem) */
  step: number
  /** -1..1, posição do cursor na tela */
  pointer: { x: number; y: number }
  /** px do cursor dentro do canvas, ou null */
  hoverPx: { x: number; y: number } | null
  /** 0..1, progresso da subida inicial */
  intro: number
  /** deslocamento horizontal do mapa (unidades de mundo) */
  offsetX: number
  offsetY: number
}

export class MapScene {
  renderer: THREE.WebGLRenderer
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100)
  root = new THREE.Group()
  pivot = new THREE.Group()
  states: StateObj[] = []
  byUf = new Map<string, StateObj>()
  raycaster = new THREE.Raycaster()
  ndc = new THREE.Vector2()
  hovered: StateObj | null = null
  width = 1
  height = 1
  reduced: boolean
  last = performance.now()
  tiltX = 0
  tiltY = 0
  regionCenters: THREE.Vector3[] = []
  regionZoom: number[] = []
  camTarget = new THREE.Vector3()

  constructor(canvas: HTMLCanvasElement, reduced: boolean) {
    this.reduced = reduced
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.camera.position.set(0, -0.2, 7.2)

    this.scene.add(new THREE.HemisphereLight('#fff6dc', '#0b2e22', 1.6))
    const sun = new THREE.DirectionalLight('#fff1c9', 2.4)
    sun.position.set(-3, 4, 6)
    this.scene.add(sun)

    // projeção de Mercator ajustada a um quadrado de 4 x 4 unidades
    const proj = geoMercator().fitSize([3.6, 3.6], estados)
    const P = (lon: number, lat: number) => {
      const p = proj([lon, lat])!
      return new THREE.Vector2(p[0] - 1.8, -(p[1] - 1.8))
    }

    const lineMat = new THREE.LineBasicMaterial({ color: '#FFC93C', transparent: true, opacity: 0.55 })
    const ordered = [...estados.features].sort((a, b) => geoCentroid(a)[0] - geoCentroid(b)[0])

    ordered.forEach((f: Feature<Polygon | MultiPolygon, { uf: string; nome: string }>, i) => {
      const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates
      const shapes: THREE.Shape[] = []
      const linePts: number[] = []
      for (const poly of polys) {
        const outer = poly[0].map(([lo, la]) => P(lo, la))
        const shape = new THREE.Shape(outer)
        for (const hole of poly.slice(1)) shape.holes.push(new THREE.Path(hole.map(([lo, la]) => P(lo, la))))
        shapes.push(shape)
        for (const ring of poly) {
          for (let k = 0; k < ring.length - 1; k++) {
            const a = P(ring[k][0], ring[k][1])
            const b = P(ring[k + 1][0], ring[k + 1][1])
            linePts.push(a.x, a.y, 0, b.x, b.y, 0)
          }
        }
      }
      const geo = new THREE.ExtrudeGeometry(shapes, { depth: 1, bevelEnabled: false, steps: 1 })
      const uf = f.properties.uf
      const info = UF_BY_SIGLA[uf]
      const regionIndex = REGIOES.findIndex((r) => r.id === info.regiao)
      const base = new THREE.Color(BASE_GREENS[i % BASE_GREENS.length])
      const mat = new THREE.MeshStandardMaterial({ color: base.clone(), roughness: 0.75, metalness: 0.05, flatShading: true })
      const mesh = new THREE.Mesh(geo, mat)
      const lg = new THREE.BufferGeometry()
      lg.setAttribute('position', new THREE.Float32BufferAttribute(linePts, 3))
      const lines = new THREE.LineSegments(lg, lineMat)
      const group = new THREE.Group()
      group.add(mesh, lines)
      const c = geoCentroid(f)
      const cv = P(c[0], c[1])
      const baseH = uf === 'DF' ? 0.16 : 0.07 + ((i * 37) % 9) / 160
      const s: StateObj = {
        uf,
        group,
        mesh,
        lines,
        base,
        regionColor: new THREE.Color(REGIOES[regionIndex].cor),
        regionIndex,
        baseH,
        h: 0.001,
        lift: 0,
        drop: 3,
        introDelay: (cv.x + 1.8) / 3.6 * 0.55 + (Math.sin(i * 12.9) * 0.5 + 0.5) * 0.25,
        centroid: new THREE.Vector3(cv.x, cv.y, 0),
      }
      mesh.userData.state = s
      this.states.push(s)
      this.byUf.set(uf, s)
      this.root.add(group)
    })

    // centro e zoom de cada região, a partir dos estados que a compõem
    REGIOES.forEach((_, r) => {
      const box = new THREE.Box3()
      this.states.filter((s) => s.regionIndex === r).forEach((s) => box.expandByObject(s.mesh))
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())
      this.regionCenters.push(center)
      this.regionZoom.push(THREE.MathUtils.clamp(1.8 / Math.max(size.x, size.y * 1.15), 1, 2.1))
    })

    this.pivot.add(this.root)
    this.scene.add(this.pivot)
  }

  resize(w: number, h: number) {
    this.width = w
    this.height = h
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    // em telas estreitas, afasta a câmera para o país caber
    this.camera.position.z = w / h < 0.9 ? 7.2 / Math.max(0.55, w / h) * 0.85 : 7.2
    this.camera.updateProjectionMatrix()
  }

  /** estado sob o cursor (ou null) */
  pick(px: { x: number; y: number } | null) {
    if (!px) return null
    this.ndc.set((px.x / this.width) * 2 - 1, -(px.y / this.height) * 2 + 1)
    this.raycaster.setFromCamera(this.ndc, this.camera)
    const hit = this.raycaster.intersectObjects(this.states.map((s) => s.mesh), false)[0]
    return hit ? (hit.object.userData.state as StateObj) : null
  }

  /** posição em px do centro de um estado (para rótulos HTML) */
  screenOf(uf: string, out = new THREE.Vector3()) {
    const s = this.byUf.get(uf)
    if (!s) return null
    s.group.localToWorld(out.set(s.centroid.x, s.centroid.y, s.h + 0.02))
    out.project(this.camera)
    return { x: (out.x * 0.5 + 0.5) * this.width, y: (-out.y * 0.5 + 0.5) * this.height, z: out.z }
  }

  render(st: MapState) {
    const now = performance.now()
    const dt = Math.min((now - this.last) / 1000, 0.05)
    this.last = now
    const k = this.reduced ? 1 : 1 - Math.pow(0.0008, dt) // suavização independente de fps

    // peso de cada região (tenda em volta do passo inteiro)
    const weights = REGIOES.map((_, r) => Math.max(0, 1 - Math.abs(st.step - (r + 1))))
    const regionSum = weights.reduce((a, b) => a + b, 0)

    // câmera: aproxima da região ativa
    let zoom = 1 - 0.12 * Math.max(0, 1 - st.step)
    const center = new THREE.Vector3()
    weights.forEach((w, r) => {
      if (!w) return
      center.addScaledVector(this.regionCenters[r], w)
      zoom += (this.regionZoom[r] - 1) * w
    })
    this.root.position.x += (-center.x - this.root.position.x) * k
    this.root.position.y += (-center.y - this.root.position.y) * k
    const sc = THREE.MathUtils.lerp(this.root.scale.x, zoom, k)
    this.root.scale.set(sc, sc, Math.sqrt(sc))

    // inclinação de mesa + cursor
    const tx = -0.72 + (this.reduced ? 0 : st.pointer.y * 0.1)
    const ty = this.reduced ? 0 : st.pointer.x * 0.16
    this.tiltX += (tx - this.tiltX) * k
    this.tiltY += (ty - this.tiltY) * k
    this.pivot.rotation.set(this.tiltX, this.tiltY, -0.04 * regionSum)
    this.pivot.position.x += (st.offsetX - this.pivot.position.x) * k
    this.pivot.position.y += (st.offsetY - this.pivot.position.y) * k

    // estado sob o cursor (só na abertura)
    const hov = st.step < 0.4 ? this.pick(st.hoverPx) : null
    this.hovered = hov

    const t = performance.now() / 1000
    for (const s of this.states) {
      const w = weights[s.regionIndex]
      // altura: na região ativa os estados sobem; os outros afundam
      let targetH = s.baseH + w * 0.42 - (regionSum - w) * 0.05
      if (!this.reduced && st.step < 0.4) targetH += Math.sin(t * 0.8 + s.centroid.x * 1.7 + s.centroid.y) * 0.012
      targetH = Math.max(0.012, targetH)
      // subida inicial em cascata
      const local = this.reduced ? 1 : THREE.MathUtils.clamp((st.intro * 1.6 - s.introDelay) / 0.5, 0, 1)
      const e = 1 - Math.pow(1 - local, 3)
      s.h += (targetH * e - s.h) * Math.min(1, k * 1.6)
      const liftT = hov === s ? 0.22 : 0
      s.lift += (liftT - s.lift) * Math.min(1, k * 1.8)
      s.drop = (1 - e) * 2.2
      s.mesh.scale.z = Math.max(0.001, s.h)
      s.group.position.z = s.lift + s.drop
      s.lines.position.z = s.h + 0.002

      // cor
      const target = s.base.clone()
      if (regionSum > 0) target.lerp(MUTED, Math.min(1, regionSum - w) * 0.85)
      if (w > 0) target.lerp(s.regionColor, w)
      if (hov === s) target.copy(HOVER)
      s.mesh.material.color.lerp(target, Math.min(1, k * 1.4))
    }
    ;(this.states[0].lines.material as THREE.LineBasicMaterial).opacity = 0.55 * (1 - regionSum * 0.6)

    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    this.renderer.dispose()
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh
      m.geometry?.dispose?.()
      const mat = m.material as THREE.Material | undefined
      mat?.dispose?.()
    })
  }
}
