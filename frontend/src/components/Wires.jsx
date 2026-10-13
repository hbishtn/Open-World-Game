import { useMemo } from 'react'
import * as THREE from 'three'
import * as W from '../world'

// Bijli ke taar: har do khambhon ke beech 3 taar jo beech mein thode jhuke hote hain.
// Khambhe wahi hone chahiye jo Trees.jsx / Delhi.jsx mein bane hain.
// Default: purane code jaisa, road ke left mein har 36 unit pe khambha (roadX se).
// Apne khambhon ki list dena ho to <Wires poles={[[x,z],[x,z],...]} /> likho.
const TOP = 7.6
const SAG = 1.2

const groundY = (x, z) => (typeof W.heightAt === 'function' ? W.heightAt(x, z) : 0)

export default function Wires({ poles }) {
  const geo = useMemo(() => {
    let pts = poles
    if (!pts && typeof W.roadX === 'function') {
      pts = []
      for (let z = 770; z > -770; z -= 36) pts.push([W.roadX(z) - 7.5, z])
    }
    if (!pts || pts.length < 2) return null

    const v = []
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, az] = pts[i], [bx, bz] = pts[i + 1]
      const ya = groundY(ax, az) + TOP, yb = groundY(bx, bz) + TOP
      for (const off of [-1.1, 0, 1.1]) {
        let px = ax + off, py = ya, pz = az
        for (let s = 1; s <= 8; s++) {
          const t = s / 8
          const nx = ax + off + (bx - ax) * t
          const nz = az + (bz - az) * t
          const ny = ya + (yb - ya) * t - SAG * 4 * t * (1 - t)
          v.push(px, py, pz, nx, ny, nz)
          px = nx; py = ny; pz = nz
        }
      }
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3))
    return g
  }, [poles])

  if (!geo) return null
  return (
    <lineSegments geometry={geo} frustumCulled={false}>
      <lineBasicMaterial color="#2b2b2b" />
    </lineSegments>
  )
}
