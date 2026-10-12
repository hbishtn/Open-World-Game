import { useLayoutEffect, useRef } from 'react'

// Ek hi shape ki hazaaron copies ek draw call mein (trees, dashes ke liye)
export default function Inst({ matrices, color, children }) {
  const ref = useRef()
  useLayoutEffect(() => {
    matrices.forEach((m, i) => ref.current.setMatrixAt(i, m))
    ref.current.instanceMatrix.needsUpdate = true
  }, [matrices])

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, matrices.length]} castShadow frustumCulled={false}>
      {children}
      <meshStandardMaterial color={color} flatShading roughness={1} />
    </instancedMesh>
  )
}
