import { useMemo } from 'react'
import * as THREE from 'three'
import Inst from './Inst'
import { NS, EW, ROAD_HALF, GATE_Z, RING_IN, RING_OUT } from '../world'
import { INTERSECTIONS } from '../signals'

const ASPHALT = '#4b5057'
const SANDSTONE = '#b5624a'                       // Delhi ka lal-patthar footpath
const T = (x, y, z) => new THREE.Matrix4().makeTranslation(x, y, z)
const MAIN = [[800, -388], [-452, -800]]          // Kartavya Path (roundabout ke pehle aur baad)

// footpath ko chorahon pe kaat do: segs mein se gaps hata do
const cut = (segs, gaps) =>
  gaps.reduce((acc, [gh, gl]) => acc.flatMap(([s, e]) => {
    if (gl >= s || gh <= e) return [[s, e]]
    const r = []
    if (s > gh) r.push([s, gh])
    if (gl > e) r.push([gl, e])
    return r
  }), segs)

const inEW = (z, pad) => EW.some((e) => Math.abs(z - e.z) < e.half + pad)
const inNS = (x, pad) => NS.some((r) => Math.abs(x - r.x) < r.half + pad)

const Asphalt = ({ pos, size }) => (
  <mesh position={pos} receiveShadow>
    <boxGeometry args={size} />
    <meshStandardMaterial color={ASPHALT} flatShading roughness={1} />
  </mesh>
)

export default function Road() {
  const d = useMemo(() => {
    const dashNS = [], dashEW = [], zebraNS = [], zebraEW = []
    for (const r of NS)
      for (let z = 790; z > -790; z -= 10) {
        if (inEW(z, 6)) continue
        if (r.x === 0 && Math.abs(z - GATE_Z) < RING_OUT + 2) continue
        dashNS.push(T(r.x, 0.24, z))
      }
    for (const e of EW)
      for (let x = -790; x < 790; x += 10) {
        if (inNS(x, 6)) continue
        dashEW.push(T(x, 0.24, e.z))
      }
    // zebra crossing: har chorahe ki 4 bhujaon pe
    for (const it of INTERSECTIONS) {
      for (let i = -it.nh + 1; i < it.nh; i += 2) for (const s of [-1, 1]) zebraNS.push(T(it.x + i, 0.24, it.z + s * (it.eh + 3)))
      for (let i = -it.eh + 1; i < it.eh; i += 2) for (const s of [-1, 1]) zebraEW.push(T(it.x + s * (it.nh + 3), 0.24, it.z + i))
    }
    const foot = cut(MAIN, EW.map((e) => [e.z + e.half, e.z - e.half])).filter(([a, b]) => a - b > 1)
    return { dashNS, dashEW, zebraNS, zebraEW, foot }
  }, [])

  return (
    <>
      {/* Kartavya Path */}
      {MAIN.map(([a, b]) => <Asphalt key={a} pos={[0, 0.1, (a + b) / 2]} size={[ROAD_HALF * 2, 0.2, a - b]} />)}
      {/* baaki NS sadakein */}
      {NS.filter((r) => r.x !== 0).map((r) => <Asphalt key={r.x} pos={[r.x, 0.1, 0]} size={[r.half * 2, 0.2, 1600]} />)}
      {/* EW sadakein */}
      {EW.map((e) => <Asphalt key={e.z} pos={[0, 0.1, e.z]} size={[1600, 0.2, e.half * 2]} />)}

      {/* lal-patthar footpath (chorahon pe ruke hue) */}
      {d.foot.flatMap(([a, b]) =>
        [-1, 1].map((s) => (
          <mesh key={a + ':' + s} position={[s * (ROAD_HALF + 1.3), 0.15, (a + b) / 2]} receiveShadow>
            <boxGeometry args={[2.6, 0.3, a - b]} />
            <meshStandardMaterial color={SANDSTONE} flatShading roughness={1} />
          </mesh>
        ))
      )}

      {/* India Gate roundabout */}
      <mesh position={[0, 0.21, GATE_Z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[RING_IN, RING_OUT, 64]} />
        <meshStandardMaterial color={ASPHALT} flatShading roughness={1} />
      </mesh>

      <Inst matrices={d.dashNS} color="#f2f2e8"><boxGeometry args={[0.3, 0.04, 3]} /></Inst>
      <Inst matrices={d.dashEW} color="#f2f2e8"><boxGeometry args={[3, 0.04, 0.3]} /></Inst>
      <Inst matrices={d.zebraNS} color="#ffffff"><boxGeometry args={[1, 0.04, 3]} /></Inst>
      <Inst matrices={d.zebraEW} color="#ffffff"><boxGeometry args={[3, 0.04, 1]} /></Inst>
    </>
  )
}
