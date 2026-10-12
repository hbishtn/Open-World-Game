// Delhi world: Kartavya Path (main) + side roads + chorahe + India Gate roundabout
export const ROAD_HALF = 9          // main sadak aadhi chauDai
export const SIDE_HALF = 7          // baaki sadakon ki aadhi chauDai
export const GATE_Z = -420          // India Gate ka center
export const RING_IN = 18           // roundabout: andar ka gol (gate ka platform)
export const RING_OUT = 36          // roundabout: bahar ka kinara

// Utar-dakshin (z ki taraf) sadakein, aur purab-paschim (x ki taraf) sadakein
export const NS = [
  { x: -200, half: SIDE_HALF, name: 'Rafi Marg' },
  { x: 0, half: ROAD_HALF, name: 'Kartavya Path' },
  { x: 200, half: SIDE_HALF, name: 'Janpath' },
]
export const EW = [
  { z: 600, half: SIDE_HALF, name: 'Tilak Marg' },
  { z: 300, half: SIDE_HALF, name: 'Shahjahan Rd' },
  { z: -100, half: SIDE_HALF, name: 'Rajaji Marg' },
  { z: -700, half: SIDE_HALF, name: 'Mathura Rd' },
]

export const roadX = () => 0
export const roadD = () => 0
export const heightAt = () => 0     // Delhi flat hai

// Kya (x,z) sadak par hai?
export const onRoad = (x, z) => {
  const d = Math.hypot(x, z - GATE_Z)
  if (d < RING_OUT) return d > RING_IN
  return NS.some((r) => Math.abs(x - r.x) < r.half + 0.5) || EW.some((r) => Math.abs(z - r.z) < r.half + 0.5)
}

export const nearRing = (x, z, pad = 4) => Math.hypot(x, z - GATE_Z) < RING_OUT + pad
export const nearEW = (z, pad) => EW.some((r) => Math.abs(z - r.z) < r.half + pad)
// Sabse paas ki sadak ke kinare se doori (andar ho to negative)
export const roadGap = (x, z) =>
  Math.min(...NS.map((r) => Math.abs(x - r.x) - r.half), ...EW.map((r) => Math.abs(z - r.z) - r.half))

export const makeRng = (seed) => {
  let s = seed
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

// Imaarton ki list (3D scene aur map dono isi se banate hain)
export const BUILDINGS = (() => {
  const rnd = makeRng(5), out = []
  const dims = () => [12 + rnd() * 10, 14 + rnd() * 8, 8 + rnd() * 18]
  const add = (x, z, w, d, h) => {
    const hw = w / 2, hd = d / 2
    if (Math.hypot(x, z - GATE_Z) < RING_OUT + Math.max(hw, hd) + 6) return
    if (NS.some((r) => Math.abs(x - r.x) < hw + r.half + 4)) return
    if (EW.some((r) => Math.abs(z - r.z) < hd + r.half + 4)) return
    out.push({ x, z, w, d, h, c: Math.floor(rnd() * 3) })
  }
  for (let z = 780; z > -780; z -= 26)                       // Kartavya Path ke door
    for (const s of [-1, 1]) { const [w, d, h] = dims(); add(s * (78 + rnd() * 25), z + (rnd() - 0.5) * 6, w, d, h) }
  for (const r of NS) if (r.x !== 0)                         // side NS sadakon ke kinare
    for (let z = 780; z > -780; z -= 28)
      for (const s of [-1, 1]) { const [w, d, h] = dims(); add(r.x + s * (r.half + 5 + w / 2), z + (rnd() - 0.5) * 4, w, d, h) }
  for (const r of EW)                                        // EW sadakon ke kinare
    for (let x = -780; x < 780; x += 28) {
      if (Math.abs(x) < 125) continue
      for (const s of [-1, 1]) { const [w, d, h] = dims(); add(x + (rnd() - 0.5) * 4, r.z + s * (r.half + 5 + d / 2), w, d, h) }
    }
  return out
})()
