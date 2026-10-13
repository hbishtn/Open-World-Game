import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import * as W from '../world'
import { paint } from './Fx'

// Hilti hui ghaas: camera ke aage-paas ke ~50 unit mein, sadak ko chhodkar.
// Blades ki jagah cell-hash se tay hoti hai, isliye chalte waqt ghaas "tikti" nahi, wahin rehti hai.
const CELL = 1.7
const R = 46
const MAX = 9000

const hash = (a, b) => {
  const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453
  return s - Math.floor(s)
}

// NOTE: world.js ke jo bhi function mile wahi use hota hai.
// Agar ghaas sadak ke upar ug rahi ho, to yahan apne world.js ka road-check laga do.
function clearOfRoad(x, z) {
  if (typeof W.roadDist === 'function') return W.roadDist(x, z) > 2.5
  if (typeof W.onRoad === 'function') return !W.onRoad(x, z, 3)
  if (typeof W.roadX === 'function') return Math.abs(x - W.roadX(z)) > 6
  return true
}
const groundY = (x, z) => (typeof W.heightAt === 'function' ? W.heightAt(x, z) : 0)

export default function Grass() {
  const ref = useRef()
  const last = useRef({ x: 1e9, z: 1e9 })
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const dir = useMemo(() => new THREE.Vector3(), [])

  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(0.16, 0.9, 1, 3)
    g.translate(0, 0.45, 0)
    const p = g.attributes.position
    for (let i = 0; i < p.count; i++) p.setX(i, p.getX(i) * (1 - (p.getY(i) / 0.9) * 0.85)) // upar se patli
    return g
  }, [])

  const mat = useMemo(
    () => paint(new THREE.MeshStandardMaterial({ color: '#9db44e', side: THREE.DoubleSide, roughness: 1 }), 'lawn', 1.4),
    []
  )

  useFrame(({ camera }) => {
    camera.getWorldDirection(dir)
    const cx = camera.position.x + dir.x * 22
    const cz = camera.position.z + dir.z * 22
    const L = last.current
    if (Math.hypot(cx - L.x, cz - L.z) < 10) return
    L.x = cx
    L.z = cz

    const m = ref.current
    let n = 0
    const i0 = Math.floor((cx - R) / CELL), i1 = Math.floor((cx + R) / CELL)
    const j0 = Math.floor((cz - R) / CELL), j1 = Math.floor((cz + R) / CELL)
    for (let i = i0; i <= i1; i++) {
      for (let j = j0; j <= j1; j++) {
        if (hash(Math.floor(i / 5), Math.floor(j / 5)) < 0.3) continue // khali jagah (patches)
        for (let k = 0; k < 3; k++) {
          if (n >= MAX) break
          const x = (i + hash(i + k * 3.1, j)) * CELL
          const z = (j + hash(i, j + k * 7.3)) * CELL
          if (Math.hypot(x - cx, z - cz) > R) continue
          if (!clearOfRoad(x, z)) continue
          const s = 0.7 + hash(i + 5 + k, j + 5) * 0.9
          dummy.position.set(x, groundY(x, z), z)
          dummy.rotation.set(0, hash(i + 9, j + 1 + k) * 6.28, 0)
          dummy.scale.set(s, s * (0.8 + hash(i + k, j + 11) * 0.7), s)
          dummy.updateMatrix()
          m.setMatrixAt(n++, dummy.matrix)
        }
      }
    }
    m.count = n
    m.instanceMatrix.needsUpdate = true
  })

  return <instancedMesh ref={ref} args={[geo, mat, MAX]} frustumCulled={false} />
}
