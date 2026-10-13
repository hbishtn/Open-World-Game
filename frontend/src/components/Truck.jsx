import { useEffect, useLayoutEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { input, useGame, player, walker } from '../store'
import { roadX, heightAt, onRoad, GATE_Z, RING_IN } from '../world'
import { loadPlayer, savePlayer } from '../api'

const M = (c) => <meshStandardMaterial color={c} flatShading roughness={1} />

export default function Truck() {
  const truck = useRef()
  const rig = useRef()   // sirf position follow karta hai (rotate nahi), sun iske andar hai
  const sun = useRef()
  const st = useRef({ v: 0, ang: Math.PI, x: roadX(780), z: 780, y: 0, shown: -1 })

  useLayoutEffect(() => { rig.current.add(sun.current.target) }, [])

  // Django se purani position lo, aur har 5 sec mein save karo
  useEffect(() => {
    let alive = true
    loadPlayer().then((p) => {
      if (alive && p) Object.assign(st.current, { x: p.x, z: p.z, ang: p.angle, v: 0 })
    })
    const id = setInterval(() => {
      const q = st.current
      savePlayer({ x: q.x, z: q.z, angle: q.ang })
    }, 5000)
    return () => { alive = false; clearInterval(id) }
  }, [])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const q = st.current
    const cam = state.camera
    const walking = useGame.getState().mode === 'walk'

    // --- gaadi ki physics (arcade) ---
    if (walking) q.v -= q.v * 4 * dt // utar gaye: gaadi ruk jati hai
    else q.v += (input.w ? 14 : 0) * dt - (input.s ? 20 : 0) * dt
    q.v -= q.v * 0.4 * dt
    if (!onRoad(q.x, q.z)) q.v -= q.v * 1.3 * dt // road se utre to slow
    q.v = Math.max(-6, Math.min(30, q.v))
    const steer = walking ? 0 : (input.a ? 1 : 0) - (input.d ? 1 : 0)
    q.ang += steer * dt * 1.7 * Math.min(1, Math.abs(q.v) / 6) * (q.v < 0 ? -1 : 1)
    const fx = Math.sin(q.ang), fz = Math.cos(q.ang)
    q.x += fx * q.v * dt
    q.z += fz * q.v * dt
    // India Gate ka platform thos hai: andar nahi ghus sakte
    const gd = Math.hypot(q.x, q.z - GATE_Z)
    if (gd < RING_IN - 0.5) { const k = (RING_IN - 0.5) / gd; q.x *= k; q.z = GATE_Z + (q.z - GATE_Z) * k; q.v *= 0.5 }
    if (q.z < -780) { q.z = 780; q.x = roadX(780); q.ang = Math.PI; q.v = 0 } // duniya khatam => start pe wapas
    q.y += (heightAt(q.x, q.z) - q.y) * Math.min(1, dt * 10)

    truck.current.position.set(q.x, q.y, q.z)
    truck.current.rotation.set(0, q.ang, -steer * q.v * 0.004)
    const f = walking ? walker : q // sun (shadow) active character ke saath chalta hai
    rig.current.position.set(f.x, f.y, f.z)
    player.x = q.x; player.z = q.z; player.ang = q.ang

    if (!walking) {
      // --- camera: gaadi ke peeche-upar se follow ---
      cam.position.x += (q.x - fx * 9 - cam.position.x) * 0.08
      cam.position.z += (q.z - fz * 9 - cam.position.z) * 0.08
      cam.position.y += (q.y + 4.6 - cam.position.y) * 0.08
      cam.position.y = Math.max(cam.position.y, heightAt(cam.position.x, cam.position.z) + 2)
      cam.lookAt(q.x + fx * 6, q.y + 1.2, q.z + fz * 6)
    }

    // --- HUD speed (sirf tab update jab number badle) ---
    const kmh = Math.round(Math.abs(q.v) * 3.6)
    if (kmh !== q.shown) { q.shown = kmh; useGame.getState().setSpeed(kmh) }
  })

  return (
    <>
      <group ref={rig}>
        <directionalLight
          ref={sun}
          position={[-40, 70, 30]}
          intensity={3.5}
          color="#fff0c0"
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0015}
          shadow-camera-left={-45}
          shadow-camera-right={45}
          shadow-camera-top={45}
          shadow-camera-bottom={-45}
          shadow-camera-near={1}
          shadow-camera-far={220}
        />
      </group>

      <group ref={truck}>
        <mesh position={[0, 0.9, 0]} castShadow><boxGeometry args={[2.2, 0.8, 4.2]} />{M('#d8362f')}</mesh>
        <mesh position={[0, 1.6, 0.9]} castShadow><boxGeometry args={[2, 0.9, 1.7]} />{M('#d8362f')}</mesh>
        <mesh position={[0, 1.7, 1.76]}><boxGeometry args={[1.7, 0.45, 0.1]} />{M('#8fd0e0')}</mesh>
        <mesh position={[0, 1.8, -1.1]} castShadow><boxGeometry args={[1.1, 1, 1.2]} />{M('#2f9a5a')}</mesh>
        {[-1.15, 1.15].flatMap((x) =>
          [-1.3, 1.3].map((z) => (
            <mesh key={x + ':' + z} position={[x, 0.45, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.45, 0.45, 0.35, 8]} />
              {M('#28303a')}
            </mesh>
          ))
        )}
      </group>
    </>
  )
}
