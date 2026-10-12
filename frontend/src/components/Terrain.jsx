// Flat Delhi zameen: dhool-mitti ka rang + dono taraf hare lawns
const dust = '#cdbf94'
const lawn = '#6fae3c'
export default function Terrain() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1700, 1700]} />
        <meshStandardMaterial color={dust} flatShading roughness={1} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 28, 0.05, 0]} receiveShadow>
          <boxGeometry args={[32, 0.1, 1600]} />
          <meshStandardMaterial color={lawn} flatShading roughness={1} />
        </mesh>
      ))}
    </>
  )
}
