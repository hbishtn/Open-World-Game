import { create } from 'zustand'

// HUD ke liye state (kam-kam update hoti hai)
export const useGame = create((set) => ({
  speed: 0,
  setSpeed: (speed) => set({ speed }),
}))

// Keyboard/touch input: plain object, taaki har frame React re-render na ho
export const input = { w: 0, a: 0, s: 0, d: 0 }

// Truck ki position (minimap ke liye), plain object taaki re-render na ho
export const player = { x: 0, z: 780, ang: Math.PI }