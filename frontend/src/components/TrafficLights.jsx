import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Inst from './Inst'
import { INTERSECTIONS, phase, sig } from '../signals'

const COL = { green: new THREE.Color('#33ff66'), yellow: new THREE.Color('#ffd23a'), red: new THREE.Color('#ff3b30') }
const T = (x, y, z) => new THREE.Matrix4().makeTranslation(x, y, z)

export default function TrafficLights() {
  const lamps = useRef()
  const cur = useRef([])

  // Har chorahe ke 4 kone pe pole + dabba, aur har pole pe 2 battiyan (NS ke liye, EW ke liye)
  const d = useMemo(() => {
    const poles = [], heads = [], lampM = [], meta = []
    INTERSECTIONS.forEach((it, i) => {
      for (const sx of [-1, 1])
        for (const sz of [-1, 1]) {
          const px = it.x + sx * (it.nh + 1.5), pz = it.z + sz * (it.eh + 1.5)
          poles.push(T(px, 3, pz)); heads.push(T(px, 6.3, pz))
          lampM.push(T(px, 6.3, pz + sz * 0.75)); meta.push({ i, axis: 0 })   // NS traffic ko dikhti hai
          lampM.push(T(px + sx * 0.75, 6.3, pz)); meta.push({ i, axis: 1 })   // EW traffic ko dikhti hai
        }
    })
    return { poles, heads, lampM, meta }
  }, [])

  useLayoutEffect(() => {
    d.lampM.forEach((m, k) => lamps.current.setMatrixAt(k, m))
    lamps.current.instanceMatrix.needsUpdate = true
  }, [d])

  useFrame((state) => {
    sig.t = state.clock.elapsedTime
    const m = lamps.current
    let changed = false
    d.meta.forEach(({ i, axis }, k) => {
      const st = phase(sig.t, INTERSECTIONS[i].off)[axis]
      if (cur.current[k] !== st) { cur.current[k] = st; m.setColorAt(k, COL[st]); changed = true }
    })
    if (changed) m.instanceColor.needsUpdate = true
  })

  return (
    <>
      <Inst matrices={d.poles} color="#3a4048"><cylinderGeometry args={[0.15, 0.2, 6, 5]} /></Inst>
      <Inst matrices={d.heads} color="#1c1f24"><boxGeometry args={[1.2, 1, 1.2]} /></Inst>
      <instancedMesh ref={lamps} args={[undefined, undefined, d.lampM.length]} frustumCulled={false}>
        <sphereGeometry args={[0.42, 6, 6]} />
        <meshBasicMaterial />
      </instancedMesh>
    </>
  )
}
