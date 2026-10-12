// Traffic signal ka time-table. NS = utar-dakshin sadak, EW = purab-paschim sadak.
import { NS, EW } from './world'

export const CYCLE = 20                 // 20 sec ka chakkar
export const sig = { t: 0 }             // game ka clock (TrafficLights update karta hai)

export const INTERSECTIONS = NS.flatMap((n, a) =>
  EW.map((e, b) => ({ x: n.x, z: e.z, nh: n.half, eh: e.half, off: ((a * 3 + b * 7) % 5) * 4 }))
)

// [NS ki batti, EW ki batti]
export const phase = (t, off) => {
  const p = (t + off) % CYCLE
  if (p < 8) return ['green', 'red']
  if (p < 10) return ['yellow', 'red']
  if (p < 18) return ['red', 'green']
  return ['red', 'yellow']
}
