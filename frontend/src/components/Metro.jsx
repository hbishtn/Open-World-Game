import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Inst from './Inst'
import { METRO_X, STATIONS, STATION_HALF, PIER_Z } from '../world'

const LEN = 1600
const ONE = new THREE.Vector3(1, 1, 1)
const QI = new THREE.Quaternion()
const TS = (x, y, z, sx = 1, sy = 1, sz = 1) =>
  new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), QI, new THREE.Vector3(sx, sy, sz))

const Box = ({ p, s, c, op }) => (
  <mesh position={p} castShadow={op === undefined} receiveShadow>
    <boxGeometry args={s} />
    <meshStandardMaterial color={c} flatShading roughness={1} transparent={op !== undefined} opacity={op ?? 1} />
  </mesh>
)

// Signboard ka texture (code se, koi image file nahi)
function sign(text, bg, w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h
  const g = c.getContext('2d')
  g.fillStyle = bg; g.fillRect(0, 0, w, h)
  g.fillStyle = '#fff'; g.font = `bold ${h * 0.5}px system-ui, sans-serif`
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, h / 2 + 4)
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace
  return t
}

// Viaduct ke wo hisse jahan station nahi hai (parapet/peeli patti yahin lagti hai)
const RANGES = (() => {
  const st = [...STATIONS].sort((a, b) => b.z - a.z), out = []
  let top = 800
  for (const s of st) { out.push([top, s.z + STATION_HALF]); top = s.z - STATION_HALF }
  out.push([top, -800])
  return out
})()

function Viaduct() {
  const d = useMemo(() => ({
    col: PIER_Z.map((z) => TS(METRO_X, 4.2, z)),
    cap: PIER_Z.map((z) => TS(METRO_X, 8.4, z)),
  }), [])
  return (
    <>
      <Box p={[METRO_X, 9.4, 0]} s={[11, 1.2, LEN]} c="#b9b7b0" />
      {[-2.8, 2.8].map((o) => <Box key={o} p={[METRO_X + o, 10.07, 0]} s={[2.6, 0.12, LEN]} c="#6b6a66" />)}
      {[-3.52, -2.08, 2.08, 3.52].map((o) => <Box key={o} p={[METRO_X + o, 10.15, 0]} s={[0.18, 0.2, LEN]} c="#2b2b2f" />)}
      {RANGES.flatMap(([a, b]) =>
        [-1, 1].flatMap((sd) => [
          <Box key={`p${a}${sd}`} p={[METRO_X + sd * 5.3, 10.45, (a + b) / 2]} s={[0.4, 0.9, a - b]} c="#a7a59e" />,
          <Box key={`y${a}${sd}`} p={[METRO_X + sd * 5.52, 9.2, (a + b) / 2]} s={[0.06, 0.35, a - b]} c="#f4c20d" />,
        ])
      )}
      <Inst matrices={d.col} color="#a8a6a0"><cylinderGeometry args={[1.0, 1.3, 8.4, 8]} /></Inst>
      <Inst matrices={d.cap} color="#9c9a94"><boxGeometry args={[9, 0.8, 3]} /></Inst>
    </>
  )
}

function Station({ z, name }) {
  const board = useMemo(() => sign('M  ' + name, '#1d4f91', 1024, 128), [name])
  const entry = useMemo(() => sign('M  METRO', '#c1272d', 512, 128), [])
  const d = useMemo(() => {
    const cols = [], posts = [], steps = [], rails = [], tiles = [], land = []
    for (const dz of [-36, -18, 0, 18, 36]) for (const sx of [-1, 1]) cols.push(TS(METRO_X + sx * 6.3, 4.4, z + dz))
    for (const dz of [-40, -20, 0, 20, 40]) for (const sx of [-1, 1]) posts.push(TS(METRO_X + sx * 6.9, 13.2, z + dz))
    // Road ki taraf se upar chadhne ki seedhiyan: station ke dono sire pe ek-ek
    const XS = -17.5, N = 25, RUN = 22, th = Math.atan2(10, RUN)
    for (const s of [1, -1]) {
      const dir = -s, zb = z + s * 52, zt = zb + dir * RUN
      for (let i = 0; i < N; i++) {
        const h = (i + 1) * 0.4
        steps.push(TS(XS, h / 2, zb + dir * (i + 0.5) * (RUN / N), 4, h, RUN / N))
      }
      land.push(TS(-18.3, 9.85, zt + dir * 2, 6.6, 0.3, 4))                    // upar ka landing, platform se juda
      for (const sx of [-2.1, 2.1])
        rails.push(new THREE.Matrix4().compose(
          new THREE.Vector3(XS + sx, 6, (zb + zt) / 2),
          new THREE.Quaternion().setFromEuler(new THREE.Euler(-dir * th, 0, 0)),
          new THREE.Vector3(0.12, 0.12, Math.hypot(RUN, 10))))
      tiles.push(TS(-15.55, 0.06, zb + s * 1.5, 7.9, 0.12, 3))                  // footpath se seedhi tak ka raasta
    }
    return { cols, posts, steps, rails, tiles, land }
  }, [z])

  return (
    <>
      <Box p={[METRO_X, 9.43, z]} s={[14.2, 1.2, 80]} c="#cfc9bb" />                       {/* platform */}
      {[-4.75, 4.75].map((o) => <Box key={o} p={[METRO_X + o, 10.05, z]} s={[0.3, 0.03, 80]} c="#f4c20d" />)}
      <Box p={[METRO_X, 16.8, z]} s={[16, 0.5, 86]} c="#e4e1d6" />                         {/* chhat */}
      {[-8, 8].map((o) => <Box key={o} p={[METRO_X + o, 16.3, z]} s={[0.3, 1.7, 86]} c="#1d4f91" />)}
      <Box p={[METRO_X - 7.1, 11.8, z]} s={[0.08, 3.2, 80]} c="#9bd1e8" op={0.35} />       {/* sheesha */}
      {/* purab ki railing: seedhiyon ke raaste khule chhode hain */}
      <Box p={[METRO_X + 7, 10.55, z]} s={[0.1, 1, 50]} c="#d0d3d8" />
      <Box p={[METRO_X + 7, 10.55, z - 35.5]} s={[0.1, 1, 9]} c="#d0d3d8" />
      <Box p={[METRO_X + 7, 10.55, z + 35.5]} s={[0.1, 1, 9]} c="#d0d3d8" />
      {/* station ka naam: chhat ke dono taraf */}
      <mesh position={[METRO_X - 8.2, 16.3, z]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[12.8, 1.6]} /><meshBasicMaterial map={board} toneMapped={false} />
      </mesh>
      <mesh position={[METRO_X + 8.2, 16.3, z]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[12.8, 1.6]} /><meshBasicMaterial map={board} toneMapped={false} />
      </mesh>
      <Inst matrices={d.cols} color="#aaa8a1"><cylinderGeometry args={[0.7, 0.8, 8.8, 8]} /></Inst>
      <Inst matrices={d.posts} color="#8d8b85"><boxGeometry args={[0.5, 6.4, 0.5]} /></Inst>
      <Inst matrices={d.steps} color="#a9a69e"><boxGeometry args={[1, 1, 1]} /></Inst>
      <Inst matrices={d.land} color="#a9a69e"><boxGeometry args={[1, 1, 1]} /></Inst>
      <Inst matrices={d.rails} color="#d0d3d8"><boxGeometry args={[1, 1, 1]} /></Inst>
      <Inst matrices={d.tiles} color="#b5624a"><boxGeometry args={[1, 1, 1]} /></Inst>
      {/* road ki taraf "M METRO" ka board (footpath se dikhta hai) */}
      {[1, -1].map((s) => (
        <group key={s} position={[-13.4, 0, z + s * 53.5]}>
          <mesh position={[0, 2.1, 0]} castShadow><boxGeometry args={[0.2, 4.2, 0.2]} /><meshStandardMaterial color="#3a4048" /></mesh>
          <mesh position={[0, 4.4, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[3.6, 0.9]} /><meshBasicMaterial map={entry} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </>
  )
}

// 2 metro: ek peeli line (utar ki taraf), ek neeli line (wapas). Har station pe 7 sec rukti hain.
function Trains() {
  const body = useRef(), stripe = useRef(), glass = useRef(), roof = useRef()
  const ZS = useMemo(() => STATIONS.map((s) => s.z), [])
  const trains = useMemo(() => [
    { x: METRO_X + 2.8, dir: -1, c: 700, v: 22, dwell: 0, col: '#f4c20d' },
    { x: METRO_X - 2.8, dir: 1, c: -600, v: 22, dwell: 0, col: '#1e6fd9' },
  ], [])
  const bx = (w, h, d, cy) => new THREE.BoxGeometry(w, h, d).translate(0, cy, 0)
  const geo = useMemo(() => ({
    body: bx(3.0, 2.6, 9, 11.5), stripe: bx(3.04, 0.45, 9.04, 11.1),
    glass: bx(3.05, 0.85, 8.2, 11.9), roof: bx(2.4, 0.35, 6, 12.95),
  }), [])
  const N = trains.length * 6
  const m = useMemo(() => new THREE.Matrix4(), [])

  useLayoutEffect(() => {
    const c = new THREE.Color()
    trains.forEach((t, ti) => { for (let k = 0; k < 6; k++) stripe.current.setColorAt(ti * 6 + k, c.set(t.col)) })
    stripe.current.instanceColor.needsUpdate = true
  }, [trains])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    trains.forEach((t, ti) => {
      if (t.dwell > 0) {
        t.dwell -= dt; t.v = 0
        if (t.dwell <= 0) t.c += t.dir * 1.5                       // station se aage badho
      } else {
        let dist = Infinity                                         // agle station tak doori
        for (const sz of ZS) { const dd = (sz - t.c) * t.dir; if (dd >= -0.2 && dd < dist) dist = dd }
        if (dist < 0.4) { t.c += t.dir * dist; t.v = 0; t.dwell = 7 }
        else {
          const vt = Math.min(22, Math.max(1.2, Math.sqrt(2 * 2.2 * dist)))   // station ke paas dheere
          t.v += Math.max(-3 * dt, Math.min(2.2 * dt, vt - t.v))
          t.c += t.dir * t.v * dt
        }
      }
      if (t.dir < 0 && t.c < -840) t.c += 1680                      // line ke end pe wapas shuru
      if (t.dir > 0 && t.c > 840) t.c -= 1680
      for (let k = 0; k < 6; k++) {
        m.makeTranslation(t.x, 0, t.c + (k - 2.5) * 9.4)
        for (const r of [body, stripe, glass, roof]) r.current.setMatrixAt(ti * 6 + k, m)
      }
    })
    for (const r of [body, stripe, glass, roof]) r.current.instanceMatrix.needsUpdate = true
  })

  const mesh = (ref, g, color) => (
    <instancedMesh ref={ref} args={[g, undefined, N]} castShadow frustumCulled={false}>
      <meshStandardMaterial color={color} flatShading roughness={0.6} />
    </instancedMesh>
  )
  return (
    <>
      {mesh(body, geo.body, '#e6e9ee')}
      {mesh(stripe, geo.stripe, '#ffffff')}
      {mesh(glass, geo.glass, '#1d2a3a')}
      {mesh(roof, geo.roof, '#c3c8d0')}
    </>
  )
}

export default function Metro() {
  return (
    <>
      <Viaduct />
      {STATIONS.map((s) => <Station key={s.z} z={s.z} name={s.name} />)}
      <Trains />
    </>
  )
}
