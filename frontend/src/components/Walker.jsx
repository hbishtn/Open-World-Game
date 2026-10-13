import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { input, useGame, walker, player } from '../store'
import { groundH, solidAt } from '../world'

const M = (c) => <meshStandardMaterial color={c} flatShading roughness={1} />
const R = 0.45          // character ka ghera (takkar ke liye)
const WALK = 4.6        // chalne ki speed (m/s)

export default function Walker() {
  const root = useRef(), legL = useRef(), legR = useRef(), armL = useRef(), armR = useRef()
  const st = useRef({ phase: 0, amp: 0 })

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const g = useGame.getState()
    const walking = g.mode === 'walk'
    root.current.visible = walking
    const near = walking && Math.hypot(walker.x - player.x, walker.z - player.z) < 8
    if (near !== g.nearCar) g.setNearCar(near)
    if (!walking) return

    // --- chalna: left/right ghumao, up/down aage-peeche ---
    walker.yaw += ((input.a ? 1 : 0) - (input.d ? 1 : 0)) * dt * 2.6
    const sp = ((input.w ? 1 : 0) - (input.s ? 0.6 : 0)) * WALK
    const nx = walker.x + Math.sin(walker.yaw) * sp * dt
    const nz = walker.z + Math.cos(walker.yaw) * sp * dt
    // jagah khali ho aur unchai ka farak <= 0.6 ho (seedhi ka ek step 0.4); warna deewar/railing ki tarah rok do
    const ok = (x, z) => Math.abs(x) < 820 && Math.abs(z) < 820 && !solidAt(x, z, R, walker.gy) && Math.abs(groundH(x, z) - walker.gy) <= 0.6
    const ox = walker.x, oz = walker.z
    if (ok(nx, nz)) { walker.x = nx; walker.z = nz }
    else if (ok(nx, walker.z)) walker.x = nx
    else if (ok(walker.x, nz)) walker.z = nz
    walker.gy = groundH(walker.x, walker.z)
    walker.y += (walker.gy - walker.y) * Math.min(1, dt * 14)

    // --- haath-pair ka hilna ---
    const moved = Math.hypot(walker.x - ox, walker.z - oz) / Math.max(dt, 1e-4)
    const s = st.current
    s.phase += moved * dt * 1.6
    s.amp += ((moved > 0.3 ? 0.7 : 0) - s.amp) * Math.min(1, dt * 10)
    const sw = Math.sin(s.phase) * s.amp
    root.current.position.set(walker.x, walker.y + Math.abs(Math.sin(s.phase)) * 0.05 * s.amp, walker.z)
    root.current.rotation.y = walker.yaw
    legL.current.rotation.x = sw; legR.current.rotation.x = -sw
    armL.current.rotation.x = -sw; armR.current.rotation.x = sw

    // --- camera: character ke peeche-upar se ---
    const fx = Math.sin(walker.yaw), fz = Math.cos(walker.yaw), cam = state.camera, k = Math.min(1, dt * 6)
    cam.position.x += (walker.x - fx * 5.5 - cam.position.x) * k
    cam.position.z += (walker.z - fz * 5.5 - cam.position.z) * k
    cam.position.y += (walker.y + 3.4 - cam.position.y) * k
    cam.lookAt(walker.x + fx * 2, walker.y + 1.6, walker.z + fz * 2)
  })

  const limb = (ref, x, y, w, h, c) => (
    <group ref={ref} position={[x, y, 0]}>
      <mesh position={[0, -h / 2, 0]} castShadow><boxGeometry args={[w, h, w * 1.1]} />{M(c)}</mesh>
    </group>
  )
  return (
    <group ref={root} visible={false} scale={1.3}>
      <mesh position={[0, 1.2, 0]} castShadow><boxGeometry args={[0.5, 0.65, 0.28]} />{M('#ff7a1a')}</mesh>
      <mesh position={[0, 1.72, 0]} castShadow><sphereGeometry args={[0.17, 10, 8]} />{M('#c68642')}</mesh>
      <mesh position={[0, 1.74, 0]}><sphereGeometry args={[0.185, 10, 8, 0, 6.283, 0, 1.45]} />{M('#1a1a1a')}</mesh>
      {[-0.06, 0.06].map((x) => <mesh key={x} position={[x, 1.74, 0.16]}><boxGeometry args={[0.04, 0.04, 0.02]} />{M('#111')}</mesh>)}
      <mesh position={[0, 1.3, -0.2]} castShadow><boxGeometry args={[0.38, 0.5, 0.16]} />{M('#3a3f48')}</mesh>
      {limb(legL, 0.14, 0.85, 0.2, 0.8, '#2c4a7a')}
      {limb(legR, -0.14, 0.85, 0.2, 0.8, '#2c4a7a')}
      {limb(armL, 0.33, 1.5, 0.12, 0.6, '#ff7a1a')}
      {limb(armR, -0.33, 1.5, 0.12, 0.6, '#ff7a1a')}
    </group>
  )
}
