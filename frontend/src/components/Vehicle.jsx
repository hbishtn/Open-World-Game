// Naye gol-matol vehicle models (koi image nahi, sab shapes se).
// Istemaal: <Vehicle kind="truck" color="#d8362f" />   kind = 'truck' | 'auto' | 'car'
// Gaadi ka aage ka hissa +z ki taraf hai. Tyre ab asli gol hain (torus + hub).
const dark = '#23262c'

const Mat = ({ c, r = 0.85, e }) => <meshStandardMaterial color={c} roughness={r} emissive={e || '#000'} emissiveIntensity={e ? 1.2 : 0} />

export function Wheel({ r = 0.48, pos }) {
  return (
    <group position={pos} rotation={[0, Math.PI / 2, 0]}>
      <mesh castShadow><torusGeometry args={[r * 0.72, r * 0.3, 12, 30]} /><Mat c={dark} r={1} /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[r * 0.5, r * 0.5, r * 0.45, 20]} /><Mat c="#cfd4dc" r={0.4} /></mesh>
    </group>
  )
}

const Blob = ({ p, s, c, r = [0, 0, 0], seg = 18 }) => (
  <mesh position={p} scale={s} rotation={r} castShadow><sphereGeometry args={[1, seg, 12]} /><Mat c={c} /></mesh>
)
const Loaf = ({ p, rad, len, s, c }) => (
  <mesh position={p} scale={s} rotation={[Math.PI / 2, 0, 0]} castShadow>
    <capsuleGeometry args={[rad, len, 6, 18]} /><Mat c={c} />
  </mesh>
)

function Truck({ color }) {
  return (
    <group>
      <Loaf p={[0, 0.95, 0.15]} rad={0.7} len={2.3} s={[1.5, 1, 0.85]} c={color} />
      <Blob p={[0, 1.65, 0.75]} s={[0.95, 0.62, 0.85]} c={color} />
      <Blob p={[0, 1.72, 1.2]} s={[0.8, 0.36, 0.34]} c="#7fc4dc" />
      <Blob p={[0, 1.72, 0.45]} s={[0.97, 0.3, 0.3]} c="#7fc4dc" />
      <mesh position={[0, 1.55, -1.2]} castShadow><boxGeometry args={[1.2, 1.05, 1.15]} /><Mat c="#2f9a5a" /></mesh>
      <Loaf p={[0, 0.62, 2.3]} rad={0.2} len={1.9} s={[1.2, 0.8, 1]} c="#cfd4dc" />
      <Blob p={[0.7, 1.0, 2.2]} s={[0.2, 0.2, 0.12]} c="#fff1b0" />
      <Blob p={[-0.7, 1.0, 2.2]} s={[0.2, 0.2, 0.12]} c="#fff1b0" />
      {[-1.1, 1.1].flatMap((x) => [-1.35, 1.35].map((z) => <Wheel key={x + ':' + z} pos={[x, 0.48, z]} />))}
    </group>
  )
}

function Car({ color }) {
  return (
    <group>
      <Loaf p={[0, 0.7, 0]} rad={0.62} len={2.4} s={[1.4, 0.85, 0.85]} c={color} />
      <Blob p={[0, 1.3, -0.1]} s={[0.85, 0.5, 1.05]} c={color} />
      <Blob p={[0, 1.34, -0.1]} s={[0.88, 0.32, 0.8]} c="#7fc4dc" />
      <Blob p={[0.55, 0.78, 2.0]} s={[0.16, 0.16, 0.1]} c="#fff1b0" />
      <Blob p={[-0.55, 0.78, 2.0]} s={[0.16, 0.16, 0.1]} c="#fff1b0" />
      {[-1, 1].flatMap((x) => [-1.15, 1.2].map((z) => <Wheel key={x + ':' + z} r={0.4} pos={[x * 0.95, 0.4, z]} />))}
    </group>
  )
}

// Delhi ka auto-rickshaw: hara neeche, peela canopy, 3 pahiye
function Auto() {
  return (
    <group>
      <Loaf p={[0, 0.8, 0]} rad={0.55} len={1.2} s={[1.3, 0.8, 0.95]} c="#2e8b3d" />
      <Blob p={[0, 1.55, -0.2]} s={[0.78, 0.62, 0.95]} c="#f4c430" />
      <Blob p={[0, 1.5, 0.35]} s={[0.62, 0.32, 0.25]} c="#7fc4dc" />
      <Blob p={[0, 0.95, 1.05]} s={[0.15, 0.15, 0.1]} c="#fff1b0" />
      <Wheel r={0.3} pos={[0, 0.3, 1.0]} />
      <Wheel r={0.3} pos={[-0.72, 0.3, -0.6]} />
      <Wheel r={0.3} pos={[0.72, 0.3, -0.6]} />
    </group>
  )
}

export function Vehicle({ kind = 'truck', color = '#d8362f', ...rest }) {
  return (
    <group {...rest}>
      {kind === 'truck' ? <Truck color={color} /> : kind === 'auto' ? <Auto /> : <Car color={color} />}
    </group>
  )
}
export default Vehicle
