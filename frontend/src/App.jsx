import { Canvas } from '@react-three/fiber'
import Terrain from './components/Terrain'
import Road from './components/Road'
import Trees from './components/Trees'
import Truck from './components/Truck'
import TrafficLights from './components/TrafficLights'
import NPCs from './components/NPCs'
import Metro from './components/Metro'
import Walker from './components/Walker'
import Sky from './components/Sky'
import Wires from './components/Wires'
import Grass from './components/Grass'
import Dynamics from './components/Dynamics'
import Effects from './components/Effects'
import { IndiaGate, Buildings } from './components/Delhi'
import Hud from './hud/Hud'
import Controls from './hud/Controls'
import Minimap from './hud/Minimap'
import { roadX } from './world'

const FOG = '#ecd9b2'   // Sky ke horizon ke rang se milta

export default function App() {
  return (
    <>
      <Canvas
        shadows
        flat
        dpr={[1, 1.5]}
        gl={{ antialias: false }}
        camera={{ fov: 55, near: 0.5, far: 700, position: [roadX(790), 6, 800] }}
      >
        <Sky />
        <fog attach="fog" args={[FOG, 110, 480]} />
        <hemisphereLight args={['#cfe3f2', '#a89264', 1.7]} />
        <Terrain />
        <Grass />
        <Road />
        <Trees />
        <Wires />
        <TrafficLights />
        <NPCs />
        <Metro />
        <IndiaGate />
        <Buildings />
        <Truck />
        <Walker />
        <Dynamics />
        <Effects />
      </Canvas>
      <Hud />
      <Controls />
      <Minimap />
    </>
  )
}
