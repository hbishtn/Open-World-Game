import { useMemo } from 'react'
import * as THREE from 'three'
import Inst from './Inst'
import { heightAt, makeRng, nearRing, nearEW, roadGap } from '../world'

const ONE = new THREE.Vector3(1, 1, 1)
const UP = new THREE.Vector3(0, 1, 0)
const part = (base, lx, ly, lz) =>
  base.clone().multiply(new THREE.Matrix4().compose(new THREE.Vector3(lx, ly, lz), new THREE.Quaternion(), ONE))

export default function Trees() {
  const d = useMemo(() => {
    const rnd = makeRng(7)
    const out = { bark: [], b0: [], b1: [], b2: [], ash: [], pole: [], arm: [] }
    const baseAt = (x, z, s = 1) =>
      new THREE.Matrix4().compose(
        new THREE.Vector3(x, heightAt(x, z), z),
        new THREE.Quaternion().setFromAxisAngle(UP, rnd() * 6.28),
        new THREE.Vector3().setScalar(s * (0.8 + rnd() * 0.5))
      )
    // Neem/jamun: gol ghana ped
    const leafy = (x, z) => {
      const B = baseAt(x, z), j = () => (rnd() - 0.5) * 1.5
      out.bark.push(part(B, 0, 2, 0)); out.b0.push(part(B, j(), 4.2, j()))
      out.b1.push(part(B, j(), 5.7, j())); out.b2.push(part(B, j(), 7.2, j()))
    }
    // Ashoka: lamba patla hara ped
    const ashoka = (x, z) => {
      const B = baseAt(x, z, 1.1)
      out.bark.push(part(B, 0, 1.2, 0)); out.ash.push(part(B, 0, 5.5, 0))
    }
    // Kartavya Path ke kinare ped ki line + lamp posts (chorahon aur roundabout chhod ke)
    for (let z = 790; z > -790; z -= 12)
      for (const side of [-1, 1]) {
        if (nearRing(side * 15, z) || nearEW(z, 6)) continue
        ;(Math.floor(z / 12) % 2 ? ashoka : leafy)(side * 15 + (rnd() - 0.5), z)
      }
    for (let z = 790; z > -790; z -= 30)
      for (const side of [-1, 1]) {
        if (nearRing(side * 10.3, z, 6) || nearEW(z, 4)) continue
        const B = new THREE.Matrix4().makeTranslation(side * 10.3, 0, z)
        out.pole.push(part(B, 0, 4, 0)); out.arm.push(part(B, -side * 1.2, 8, 0))
      }
    // Lawns mein bikhre ped (sadak se door)
    for (let i = 0; i < 160; i++) {
      const x = (rnd() < 0.5 ? -1 : 1) * (20 + rnd() * 22), z = 780 - rnd() * 1560
      if (nearRing(x, z, 6) || roadGap(x, z) < 4) continue
      rnd() < 0.4 ? ashoka(x, z) : leafy(x, z)
    }
    return out
  }, [])

  return (
    <>
      <Inst matrices={d.bark} color="#5a4a24"><cylinderGeometry args={[0.5, 0.8, 4, 5]} /></Inst>
      <Inst matrices={d.b0} color="#2f7a3a"><icosahedronGeometry args={[2.4, 1]} /></Inst>
      <Inst matrices={d.b1} color="#3c8a3c"><icosahedronGeometry args={[2.0, 1]} /></Inst>
      <Inst matrices={d.b2} color="#256a34"><icosahedronGeometry args={[1.6, 1]} /></Inst>
      <Inst matrices={d.ash} color="#2a6a30"><coneGeometry args={[1.5, 10, 6]} /></Inst>
      <Inst matrices={d.pole} color="#3a4048"><cylinderGeometry args={[0.14, 0.18, 8, 5]} /></Inst>
      <Inst matrices={d.arm} color="#3a4048"><boxGeometry args={[2.6, 0.15, 0.15]} /></Inst>
    </>
  )
}
