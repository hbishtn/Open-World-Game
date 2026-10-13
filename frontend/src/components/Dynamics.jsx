import { useFrame } from '@react-three/fiber'
import { U } from './Fx'

// Shared clock: Fx.jsx ke shaders (hawa, ghaas, badal) isi se chalte hain.
// Assignment hai (+= nahi), isliye koi aur file bhi clock chalaye to double speed nahi hogi.
export default function Dynamics() {
  useFrame((state) => {
    U.uTime.value = state.clock.elapsedTime
  })
  return null
}
