import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { U, NOISE } from './Fx'

// Aasmaan: horizon pe App.jsx ke FOG rang jaisa dhundla peela, upar halka neela,
// surya ki chamak aur dheere sarakte badal. Sab shader se, koi image nahi.
const VERT = `
varying vec3 vDir;
void main() {
  vDir = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`

const FRAG = `
uniform float uTime;
uniform vec3 uHorizon;
uniform vec3 uZenith;
uniform vec3 uSun;
uniform vec3 uSunDir;
varying vec3 vDir;
${NOISE}
void main() {
  vec3 d = normalize(vDir);
  float h = clamp(d.y, 0.0, 1.0);
  vec3 col = mix(uHorizon, uZenith, pow(h, 0.5));
  float sd = max(dot(d, uSunDir), 0.0);
  col += uSun * (pow(sd, 900.0) * 2.0 + pow(sd, 14.0) * 0.28);
  vec2 uv = d.xz / (d.y + 0.3) * 1.4 + vec2(uTime * 0.012, 0.0);
  float f = fbm(uv * 1.6);
  float c = smoothstep(0.55, 0.585, f) * smoothstep(0.02, 0.3, d.y);
  vec3 cc = mix(vec3(0.80, 0.84, 0.95), vec3(1.0, 0.97, 0.92), smoothstep(0.58, 0.74, f));
  col = mix(col, cc, c * 0.92);
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`

export default function Sky() {
  const ref = useRef()
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          uTime: U.uTime,
          uHorizon: { value: new THREE.Color('#ecd9b2') },
          uZenith: { value: new THREE.Color('#7fb2dc') },
          uSun: { value: new THREE.Color('#fff1c4') },
          uSunDir: { value: new THREE.Vector3(-40, 70, 30).normalize() },
        },
        vertexShader: VERT,
        fragmentShader: FRAG,
      }),
    []
  )

  // aasmaan hamesha camera ke saath chalta hai
  useFrame(({ camera }) => ref.current.position.copy(camera.position))

  return (
    <mesh ref={ref} renderOrder={-1} frustumCulled={false} material={mat}>
      <sphereGeometry args={[600, 24, 16]} />
    </mesh>
  )
}
