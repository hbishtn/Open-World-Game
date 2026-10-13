import { create } from 'zustand'
import { groundH, solidAt } from './world'

// HUD ke liye state (kam-kam update hoti hai)
export const useGame = create((set) => ({
  speed: 0,
  setSpeed: (speed) => set({ speed }),
  mode: 'car',                 // 'car' = gaadi chala rahe, 'walk' = paidal
  setMode: (mode) => set({ mode }),
  nearCar: false,              // paidal ho tab: gaadi paas hai?
  setNearCar: (nearCar) => set({ nearCar }),
}))

// Keyboard/touch input: plain object, taaki har frame React re-render na ho
export const input = { w: 0, a: 0, s: 0, d: 0 }
export const player = { x: 0, z: 780, ang: Math.PI }                 // gaadi ki position
export const walker = { x: 0, y: 0, z: 780, yaw: Math.PI, gy: 0 }    // character ki position

// Gaadi se utro / gaadi mein baitho (button ya E key)
export function toggleCar() {
  const s = useGame.getState()
  if (s.mode === 'car') {
    if (s.speed > 5) return                                           // chalti gaadi se nahi utar sakte
    const c = Math.cos(player.ang), sn = Math.sin(player.ang)
    for (const [dx, dz] of [[c * 3.2, -sn * 3.2], [-c * 3.2, sn * 3.2], [sn * 4, c * 4]]) {
      const x = player.x + dx, z = player.z + dz
      if (!solidAt(x, z, 0.45, 0) && groundH(x, z) === 0) {
        Object.assign(walker, { x, z, y: 0, gy: 0, yaw: player.ang })
        s.setMode('walk')
        return
      }
    }
  } else if (s.nearCar) {
    s.setMode('car')
  }
}
