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

// Metro: Kartavya Path ke paschim (left) lawn ke upar elevated line
export const METRO_X = -28
export const STATION_HALF = 40      // station ki aadhi lambai
export const STATIONS = [{ z: 450, name: 'Central Secretariat' }, { z: -245, name: 'India Gate' }]
// Metro ke neeche/seedhiyon ke paas ped nahi lagte
export const nearMetro = (x, z) =>
  (x > -37 && x < -19) || (x > -21 && x < -12 && STATIONS.some((s) => Math.abs(z - s.z) < 62))

// ---------- Paidal chalne ke liye: unchai (seedhiyan/platform) aur takkar ----------
export const PLATFORM_Y = 10.03
// Metro khambhe (z positions) -- Metro.jsx bhi inhi se khambhe banata hai
export const PIER_Z = (() => {
  const out = []
  for (let z = 790; z > -790; z -= 28) {
    if (STATIONS.some((s) => Math.abs(z - s.z) < STATION_HALF + 6)) continue
    if (EW.some((e) => Math.abs(z - e.z) < e.half + 5)) continue
    if (Math.hypot(METRO_X, z - GATE_Z) < RING_OUT + 4) continue
    out.push(z)
  }
  return out
})()
export const STATION_COLS = STATIONS.flatMap((s) =>
  [-36, -18, 0, 18, 36].flatMap((dz) => [-1, 1].map((sx) => [METRO_X + sx * 6.3, s.z + dz]))
)

// (x,z) pe paidal chalne wali zameen ki unchai: 0 = sadak/lawn, seedhi pe 0.4 har step, platform pe 10
export const groundH = (x, z) => {
  for (const st of STATIONS) {
    if (Math.abs(z - st.z) <= STATION_HALF && x >= METRO_X + 4.9 && x <= METRO_X + 7) return PLATFORM_Y  // purab ka platform
    for (const s of [1, -1]) {
      const t = (z - (st.z + s * 52)) * -s            // seedhi ke shuru se doori
      if (x >= -19.5 && x <= -15.5 && t >= 0 && t < 22) return Math.min(10, (Math.floor(t / 0.88) + 1) * 0.4)
      if (x >= -21.7 && x <= -15 && t >= 22 && t <= 26) return 10                                      // upar ka landing
    }
  }
  return 0
}

// Zameen pe koi thos cheez (khambha, imaarat, India Gate)? h = abhi ki unchai (upar platform pe ho to false)
export const solidAt = (x, z, r, h = 0) => {
  if (h > 5) return false
  if (Math.hypot(x, z - GATE_Z) < RING_IN - 0.5 + r) return true
  if (Math.abs(x - METRO_X) < 3 + r) for (const pz of PIER_Z) if (Math.hypot(x - METRO_X, z - pz) < 1.5 + r) return true
  for (const [cx, cz] of STATION_COLS) if (Math.abs(x - cx) < 1 + r && Math.abs(z - cz) < 1 + r) return true
  for (const b of BUILDINGS) if (Math.abs(x - b.x) < b.w / 2 + r && Math.abs(z - b.z) < b.d / 2 + r) return true
  return false
}
