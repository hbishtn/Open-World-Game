import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { U, AutoPaint } from './Fx'

// 1) AutoPaint: zameen/sadak/imaarat pe Fx ke shaders khud laga deta hai
// 2) Dhool ke kan: camera ke aas-paas dheere udte hain (dhoop mein chamakte).
// 3) Halki garam rang ki vignette (kinaare thode gehre) screen ke upar.
const N = 260
const BOX = 60
const BOXY = 14
const wrap = (v, c, s) => c + ((((v - c + s / 2) % s) + s) % s) - s / 2

export default function Effects() {
  const { gl } = useThree()
  const pts = useRef()

  const data = useMemo(() => {
    const p = new Float32Array(N * 3)
    for (let i = 0; i < N; i++) {
      p[i * 3] = Math.random() * BOX
      p[i * 3 + 1] = Math.random() * BOXY
      p[i * 3 + 2] = Math.random() * BOX
    }
    return p
  }, [])

  useFrame(({ camera }, delta) => {
    const dt = Math.min(delta, 0.05)
    const attr = pts.current.geometry.attributes.position
    const a = attr.array
    const c = camera.position
    const t = U.uTime.value
    for (let i = 0; i < N; i++) {
      const k = i * 3
      a[k] += (0.6 + Math.sin(t * 0.5 + i) * 0.3) * dt
      a[k + 1] += Math.sin(t * 0.7 + i * 1.3) * 0.15 * dt
      a[k + 2] += 0.25 * dt
      a[k] = wrap(a[k], c.x, BOX)
      a[k + 1] = wrap(a[k + 1], c.y + 2, BOXY)
      a[k + 2] = wrap(a[k + 2], c.z, BOX)
    }
    attr.needsUpdate = true
  })

  useEffect(() => {
    const host = gl.domElement.parentElement
    if (!host) return
    const el = document.createElement('div')
    el.style.cssText =
      'position:absolute;inset:0;pointer-events:none;' +
      'background:radial-gradient(ellipse at 50% 45%,rgba(0,0,0,0) 55%,rgba(60,30,5,.32) 100%),' +
      'linear-gradient(rgba(255,196,120,.07),rgba(255,196,120,.07));' +
      'backdrop-filter:saturate(1.18) contrast(1.06);-webkit-backdrop-filter:saturate(1.18) contrast(1.06);'
    host.appendChild(el)
    return () => el.remove()
  }, [gl])

  return (
    <>
      <AutoPaint />
      <points ref={pts} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[data, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#fff0c8" size={0.14} sizeAttenuation transparent opacity={0.55} depthWrite={false} />
      </points>
    </>
  )
}
