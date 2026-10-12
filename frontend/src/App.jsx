import { Canvas } from '@react-three/fiber'
import Terrain from './components/Terrain'
import Road from './components/Road'
import Trees from './components/Trees'
import Truck from './components/Truck'
import TrafficLights from './components/TrafficLights'
import { IndiaGate, Buildings } from './components/Delhi'
import Hud from './hud/Hud'
import Controls from './hud/Controls'
import Minimap from './hud/Minimap'
import { roadX } from './world'

const SKY = '#d9d2b8'

export default function App() {
  return (
    <>
      {/* dpr 0.34 = chhote resolution pe render, CSS se bada => pixel-art look */}
      <Canvas
        shadows
        flat
        dpr={0.34}
        gl={{ antialias: false }}
        camera={{ fov: 55, near: 0.5, far: 700, position: [roadX(790), 6, 800] }}
      >
        <color attach="background" args={[SKY]} />
        <fog attach="fog" args={[SKY, 90, 420]} />
        <hemisphereLight args={['#fff3d6', '#9a8a5a', 2.4]} />
        <Terrain />
        <Road />
        <Trees />
        <TrafficLights />
        <IndiaGate />
        <Buildings />
        <Truck />
      </Canvas>
      <Hud />
      <Controls />
      <Minimap />
    </>
  )
}
