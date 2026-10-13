import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { EW, GATE_Z, RING_OUT, makeRng } from '../world'

const S = 1.3                       // insaan ka size (thoda bada taaki door se dikhe)
const N_FOOT = 60                   // footpath pe chalne wale
const N_LAWN = 30                   // lawn mein ghoomne wale
const SHIRTS = ['#e8e4d8', '#c0392b', '#2e86c1', '#f1c40f', '#27ae60', '#8e44ad', '#e67e22', '#ecf0f1']
const SKINS = ['#e0ac84', '#c68642', '#a9714b', '#8d5524']
const PANTS = ['#2c3e50', '#34495e', '#5d4037', '#1f1f1f']
const BAGS = ['#d35400', '#2c3e50', '#c0392b', '#16a085', '#f1c40f']
const pick = (r, a) => a[Math.floor(r() * a.length)]

const UP = new THREE.Vector3(0, 1, 0)
const ONE = new THREE.Vector3(1, 1, 1)
const _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _sc = new THREE.Vector3(S, S, S)
const _base = new THREE.Matrix4(), _loc = new THREE.Matrix4(), _arm = new THREE.Matrix4(), _col = new THREE.Color()

const box = (w, h, d, oy) => { const g = new THREE.BoxGeometry(w, h, d); g.translate(0, oy, 0); return g }
// body ke hisse (jodh pe ghumne wale) ka matrix = insaan ka base * hisse ki jagah/ghumav
const limb = (out, x, y, rx) => {
  _loc.compose(_p.set(x, y, 0), _q.setFromEuler(_e.set(rx, 0, 0)), ONE)
  out.multiplyMatrices(_base, _loc)
}

// Kartavya Path ke footpath ke wo hisse jahan chorahe/roundabout nahi hai
function segments() {
  const blockers = [
    ...EW.map((e) => [e.z + e.half + 1.5, e.z - e.half - 1.5]),
    [GATE_Z + RING_OUT + 3, GATE_Z - RING_OUT - 3],
  ].sort((a, b) => b[0] - a[0])
  const segs = []
  let top = 780
  for (const [hi, lo] of blockers) { if (top - hi > 12) segs.push([top, hi]); top = lo }
  if (top + 780 > 12) segs.push([top, -780])
  return segs
}

export default function NPCs() {
  const torso = useRef(), head = useRef(), legs = useRef(), arms = useRef(), bags = useRef()
  const N = N_FOOT + N_LAWN

  const d = useMemo(() => {
    const rnd = makeRng(99), segs = segments()
    const total = segs.reduce((s, [a, b]) => s + a - b, 0)
    const npcs = []
    let nBag = 0
    for (let i = 0; i < N; i++) {
      const foot = i < N_FOOT
      let t = rnd() * total, z = 0, a = 0, b = 0
      for (const [sa, sb] of segs) { if (t < sa - sb) { z = sa - t; a = sa; b = sb; break } t -= sa - sb }
      const side = foot ? (rnd() < 0.5 ? -1 : 1) : 1
      const [x0, x1] = foot ? [9.5, 11.1] : [17, 42]
      const reg = {
        xmin: side > 0 ? x0 : -x1, xmax: side > 0 ? x1 : -x0,
        zmin: Math.max(b + 1, z - 35), zmax: Math.min(a - 1, z + 35),      // apne ghar ke aas-paas hi ghoomta hai
      }
      const x = reg.xmin + rnd() * (reg.xmax - reg.xmin), zz = reg.zmin + rnd() * (reg.zmax - reg.zmin)
      const hasBag = rnd() < 0.55
      npcs.push({
        reg, x, z: zz, tx: x, tz: zz, yaw: rnd() * 6.28, amp: 0, wait: rnd() * 3, phase: rnd() * 6.28,
        speed: foot ? 1.1 + rnd() * 0.7 : 0.8 + rnd() * 0.8,
        shirt: pick(rnd, SHIRTS), skin: pick(rnd, SKINS), pants: pick(rnd, PANTS), bagC: pick(rnd, BAGS),
        bagIdx: hasBag ? nBag++ : -1,
      })
    }
    const geos = {
      torso: box(0.5, 0.65, 0.28, 1.2), head: new THREE.SphereGeometry(0.17, 8, 6).translate(0, 1.72, 0),
      leg: box(0.2, 0.8, 0.24, -0.4), arm: box(0.12, 0.6, 0.14, -0.3), bag: box(0.32, 0.34, 0.12, 0),
    }
    return { npcs, nBag, geos }
  }, [])

  // rang ek baar set karo
  useLayoutEffect(() => {
    const c = (m, i, hex) => m.setColorAt(i, _col.set(hex))
    d.npcs.forEach((n, i) => {
      c(torso.current, i, n.shirt); c(head.current, i, n.skin)
      c(legs.current, 2 * i, n.pants); c(legs.current, 2 * i + 1, n.pants)
      c(arms.current, 2 * i, n.shirt); c(arms.current, 2 * i + 1, n.shirt)
      if (n.bagIdx >= 0) c(bags.current, n.bagIdx, n.bagC)
    })
    for (const r of [torso, head, legs, arms, bags]) r.current.instanceColor.needsUpdate = true
  }, [d])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    const M = {}
    d.npcs.forEach((n, i) => {
      let moving = false
      if (n.wait > 0) n.wait -= dt
      else {
        const dx = n.tx - n.x, dz = n.tz - n.z, dist = Math.hypot(dx, dz)
        if (dist < 0.4) {                       // pahunch gaye: naya random target + kabhi ruk jao
          n.tx = n.reg.xmin + Math.random() * (n.reg.xmax - n.reg.xmin)
          n.tz = n.reg.zmin + Math.random() * (n.reg.zmax - n.reg.zmin)
          n.wait = Math.random() < 0.6 ? 0.5 + Math.random() * 4 : 0
        } else {
          n.x += (dx / dist) * n.speed * dt; n.z += (dz / dist) * n.speed * dt
          moving = true
          let df = Math.atan2(dx, dz) - n.yaw
          df = Math.atan2(Math.sin(df), Math.cos(df))
          n.yaw += df * Math.min(1, dt * 8)
        }
      }
      if (moving) n.phase += n.speed * dt * 5
      n.amp += ((moving ? 0.7 : 0) - n.amp) * Math.min(1, dt * 10)
      const sw = Math.sin(n.phase) * n.amp
      const bob = Math.abs(Math.sin(n.phase)) * 0.05 * n.amp

      _base.compose(_p.set(n.x, bob, n.z), _q.setFromAxisAngle(UP, n.yaw), _sc)
      torso.current.setMatrixAt(i, _base)
      head.current.setMatrixAt(i, _base)
      limb(_arm, 0, 0, 0)                                          // (scratch)
      limb(_arm, 0.14, 0.85, sw); legs.current.setMatrixAt(2 * i, _arm)
      limb(_arm, -0.14, 0.85, -sw); legs.current.setMatrixAt(2 * i + 1, _arm)
      limb(_arm, 0.33, 1.5, -sw); arms.current.setMatrixAt(2 * i, _arm)
      const rx = n.bagIdx >= 0 ? -0.25 : sw                       // bag wala haath thoda aage, kam hilta hai
      limb(_arm, -0.33, 1.5, rx); arms.current.setMatrixAt(2 * i + 1, _arm)
      if (n.bagIdx >= 0) {                                         // bag haath ke saath lataka hua
        _loc.compose(_p.set(0, -0.62, 0.06), _q.identity(), ONE)
        M.bag = _arm.multiply(_loc)
        bags.current.setMatrixAt(n.bagIdx, M.bag)
      }
    })
    for (const r of [torso, head, legs, arms, bags]) r.current.instanceMatrix.needsUpdate = true
  })

  const mat = <meshStandardMaterial roughness={1} />
  return (
    <>
      <instancedMesh ref={torso} args={[d.geos.torso, undefined, N]} castShadow frustumCulled={false}>{mat}</instancedMesh>
      <instancedMesh ref={head} args={[d.geos.head, undefined, N]} castShadow frustumCulled={false}>{mat}</instancedMesh>
      <instancedMesh ref={legs} args={[d.geos.leg, undefined, N * 2]} castShadow frustumCulled={false}>{mat}</instancedMesh>
      <instancedMesh ref={arms} args={[d.geos.arm, undefined, N * 2]} castShadow frustumCulled={false}>{mat}</instancedMesh>
      <instancedMesh ref={bags} args={[d.geos.bag, undefined, d.nBag]} castShadow frustumCulled={false}>{mat}</instancedMesh>
    </>
  )
}
