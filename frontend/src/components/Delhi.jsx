import { useMemo } from 'react'
import * as THREE from 'three'
import Inst from './Inst'
import { GATE_Z, RING_IN, BUILDINGS } from '../world'

const M = (c) => <meshStandardMaterial color={c} flatShading roughness={1} />
const STONE = '#c9a27a'   // India Gate ka patthar

export function IndiaGate() {
  const box = (p, s, c) => (
    <mesh position={p} castShadow receiveShadow><boxGeometry args={s} />{M(c)}</mesh>
  )
  return (
    <group position={[0, 0, GATE_Z]}>
      <mesh position={[0, 0.15, 0]} receiveShadow>
        <cylinderGeometry args={[RING_IN - 0.5, RING_IN - 0.5, 0.3, 40]} />{M('#6fae3c')}
      </mesh>
      {box([0, 0.8, 0], [26, 1, 18], '#b9b2a2')}
      {box([0, 1.8, 0], [22, 1, 14], '#c4bcab')}
      {box([-4.5, 12.3, 0], [4, 20, 8], STONE)}
      {box([4.5, 12.3, 0], [4, 20, 8], STONE)}
      {box([0, 24.3, 0], [14, 4, 8], STONE)}
      {box([0, 24.3, 0], [14.2, 1.2, 8.2], '#a8795a')}
      {box([0, 26.8, 0], [15.5, 1, 9], STONE)}
      {box([0, 28, 0], [11, 1.5, 6], STONE)}
      {box([0, 2.3, 0], [5, 0.6, 5], '#2a2a2e')}   {/* Amar Jawan jyoti ka chabutra */}
    </group>
  )
}

// Cream / terracotta / grey imaarat (data world.js ke BUILDINGS se aata hai)
export function Buildings() {
  const g = useMemo(() => {
    const out = [[], [], []]
    for (const b of BUILDINGS)
      out[b.c].push(
        new THREE.Matrix4().compose(
          new THREE.Vector3(b.x, b.h / 2, b.z), new THREE.Quaternion(), new THREE.Vector3(b.w, b.h, b.d)
        )
      )
    return out
  }, [])
  return (
    <>
      <Inst matrices={g[0]} color="#e3d3b0"><boxGeometry args={[1, 1, 1]} /></Inst>
      <Inst matrices={g[1]} color="#c98a62"><boxGeometry args={[1, 1, 1]} /></Inst>
      <Inst matrices={g[2]} color="#b9b4a8"><boxGeometry args={[1, 1, 1]} /></Inst>
    </>
  )
}
