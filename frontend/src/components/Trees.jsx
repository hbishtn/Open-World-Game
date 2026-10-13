import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import * as W from '../world'

// Reference jaise ped: pollard willow (mota ainthta tana + patli tehniyan) aur gol-matol patton wale ped.
// Sab shapes thodi bigdi hui (noise se) taaki hath se bani lagein, dabba-dabba nahi.
const rngMake = (seed) => { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647 }
const gy = (x, z) => (typeof W.heightAt === 'function' ? W.heightAt(x, z) : 0)
function clear(x, z) {
  if (typeof W.roadDist === 'function') return W.roadDist(x, z) > 4
  if (typeof W.onRoad === 'function') return !W.onRoad(x, z, 5)
  if (typeof W.roadX === 'function') return Math.abs(x - W.roadX(z)) > 7
  return Math.hypot(x, z) > 30
}

function lumpy(geo, amp, seed) {
  const p = geo.attributes.position, v = new THREE.Vector3()
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i)
    const n = 1 + amp * (Math.sin(v.x * 1.9 + seed) * Math.cos(v.z * 2.1 + seed * 1.3) + 0.6 * Math.sin(v.y * 2.7 + seed * 0.7))
    p.setXYZ(i, v.x * n, v.y, v.z * n)
  }
  geo.computeVertexNormals()
  return geo
}
function blob(r, seed, squash = 0.85) {
  const g = new THREE.IcosahedronGeometry(r, 2)
  const p = g.attributes.position, v = new THREE.Vector3()
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i)
    const n = 1 + 0.2 * Math.sin(v.x * 1.7 + seed) * Math.cos(v.z * 1.9 + seed * 1.3) + 0.12 * Math.sin(v.y * 2.3 + seed)
    p.setXYZ(i, v.x * n, v.y * n * squash, v.z * n)
  }
  g.computeVertexNormals()
  return g
}

function Parts({ geo, mats, cols }) {
  const ref = useRef()
  useLayoutEffect(() => {
    const m = ref.current
    mats.forEach((x, i) => { m.setMatrixAt(i, x); m.setColorAt(i, cols[i]) })
    m.instanceMatrix.needsUpdate = true
    m.instanceColor.needsUpdate = true
  }, [mats, cols])
  if (!mats.length) return null
  return (
    <instancedMesh ref={ref} args={[geo, undefined, mats.length]} castShadow receiveShadow frustumCulled={false}>
      <meshStandardMaterial color="#ffffff" roughness={1} />
    </instancedMesh>
  )
}

const ONE = new THREE.Vector3(1, 1, 1), UP = new THREE.Vector3(0, 1, 0)
const part = (B, x, y, z, rx = 0, rz = 0, k = 1) =>
  B.clone().multiply(new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, 0, rz)), ONE.clone().multiplyScalar(k)))

export default function Trees() {
  const geos = useMemo(() => ({
    trunk: lumpy(new THREE.CylinderGeometry(0.85, 1.5, 3.6, 12, 5), 0.16, 1),
    knob: lumpy(new THREE.CylinderGeometry(1.7, 1.0, 1.5, 12, 3), 0.2, 4),
    stick: new THREE.CylinderGeometry(0.03, 0.07, 5, 5),
    tuft: blob(0.55, 2, 0.7),
    stem: lumpy(new THREE.CylinderGeometry(0.4, 0.75, 4.2, 9, 3), 0.12, 7),
    b0: blob(2.6, 3), b1: blob(2.1, 5), b2: blob(1.7, 8),
  }), [])

  const d = useMemo(() => {
    const rnd = makeRng(7)
    const o = {}
    for (const k of ['trunk', 'knob', 'stick', 'tuft', 'stem', 'b0', 'b1', 'b2']) o[k] = { m: [], c: [] }
    const add = (k, m, col) => { o[k].m.push(m); o[k].c.push(new THREE.Color(col)) }
    const pick = (a) => a[(rnd() * a.length) | 0]
    const base = (x, z) => new THREE.Matrix4().compose(new THREE.Vector3(x, gy(x, z), z), new THREE.Quaternion().setFromAxisAngle(UP, rnd() * 6.28), new THREE.Vector3().setScalar(0.8 + rnd() * 0.6))

    const willow = (x, z) => {
      const B = base(x, z)
      add('trunk', part(B, 0, 1.8, 0), pick(['#8d6a2b', '#7a5d2a', '#94702f']))
      add('knob', part(B, 0, 4.0, 0), pick(['#a7a53a', '#b9a83a', '#8f9b36']))
      const n = 16
      for (let i = 0; i < n; i++) {
        const a = (i / n) * 6.28 + rnd() * 0.3, t = 0.35 + rnd() * 0.45
        const sx = Math.cos(a), sz = Math.sin(a), len = 0.8 + rnd() * 0.5
        const m = part(B, sx * 1.0, 4.9 + len * 2, sz * 1.0, sz * t, -sx * t, len)
        add('stick', m, pick(['#6f6234', '#80703a', '#5f5530']))
        if (rnd() < 0.45) add('tuft', part(B, sx * (1.0 + t * 4 * len), 4.9 + len * 4.2, sz * (1.0 + t * 4 * len)), pick(['#b6c23a', '#9fb637', '#d4b73a']))
      }
    }
    const leafy = (x, z) => {
      const B = base(x, z), gul = rnd() < 0.12
      add('stem', part(B, 0, 2.1, 0), '#5d4a28')
      const pal = gul ? ['#e0572a', '#d9482b', '#e8763a'] : ['#2f7a3a', '#3c8a3c', '#4a9a3a', '#2a6a38']
      const col = pick(pal)
      const j = () => (rnd() - 0.5) * 1.6
      add('b0', part(B, j(), 4.6, j()), col)
      add('b1', part(B, j(), 6.3, j()), pick(pal))
      add('b2', part(B, j(), 7.9, j()), pick(pal))
    }

    if (typeof W.roadX === 'function') {
      for (let z = 780; z > -780; z -= 9)
        for (const side of [-1, 1]) if (rnd() < 0.5) { const x = W.roadX(z) + side * (9 + rnd() * 5); rnd() < 0.55 ? willow(x, z) : leafy(x, z) }
    }
    let n = 0, tries = 0
    while (n < 160 && tries++ < 2000) {
      const x = (rnd() - 0.5) * 900, z = (rnd() - 0.5) * 1500 + 100
      if (!clear(x, z)) continue
      rnd() < 0.4 ? willow(x, z) : leafy(x, z); n++
    }
    return o
  }, [])

  return (
    <>
      {Object.keys(geos).map((k) => <Parts key={k} geo={geos[k]} mats={d[k].m} cols={d[k].c} />)}
    </>
  )
}
function makeRng(seed) { return rngMake(seed) }
