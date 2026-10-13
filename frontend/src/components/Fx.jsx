// Graphics ke shaders: sab code se (koi image nahi). Material ko "paint" karke dhool, daag, khidkiyan, hawa wagairah jodte hain.
// NAYA: AutoPaint component khud poore scene ke material dhoondh ke unpe ye shaders laga deta hai,
// isliye Terrain/Road/Delhi files mein kuch badalna nahi padta.
import { useEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

export const U = { uTime: { value: 0 } }     // shared clock (hawa, badal)

export const NOISE = `
float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(h21(i), h21(i+vec2(1.0,0.0)), f.x), mix(h21(i+vec2(0.0,1.0)), h21(i+vec2(1.0,1.0)), f.x), f.y); }
float fbm(vec2 p){ return 0.5*vn(p) + 0.25*vn(p*2.03) + 0.125*vn(p*4.1); }
`

const FRAG = {
  plain: '',
  // dhool-mitti ki zameen
  ground: `
    vec2 p = vWP.xz; float n = fbm(p*0.07), m = fbm(p*0.7+7.0);
    diffuseColor.rgb *= 0.78 + 0.35*n + 0.14*m + 0.06*h21(floor(p*4.0));`,
  // lawn: hara, kahin sookha peela, mowing ki patti
  lawn: `
    vec2 p = vWP.xz; float n = fbm(p*0.13), d = fbm(p*0.045+20.0);
    diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.74,0.66,0.34), smoothstep(0.48,0.72,d)*0.75);
    diffuseColor.rgb *= 0.72 + 0.5*n + 0.12*h21(floor(p*5.0));
    diffuseColor.rgb *= 0.95 + 0.05*step(0.5, fract(p.y*0.05));`,
  // purani sadak: daag, dararen
  asphalt: `
    vec2 p = vWP.xz; float n = fbm(p*0.6), st = fbm(p*0.06+3.0);
    float cr = 1.0 - smoothstep(0.0,0.015,abs(n-0.5));
    diffuseColor.rgb *= 0.78 + 0.4*n + 0.1*h21(floor(p*10.0));
    diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb*0.5, smoothstep(0.5,0.72,st)*0.55);
    diffuseColor.rgb *= 1.0 - cr*0.4;`,
  // lal-patthar ki tiles
  tile: `
    vec2 q = vWP.xz*0.7; vec2 f = fract(q); float ln = min(step(f.x,0.035)+step(f.y,0.035), 1.0);
    diffuseColor.rgb *= (0.85 + 0.3*h21(floor(q))) * (1.0 - ln*0.35) * (0.9 + 0.2*fbm(vWP.xz*2.0));`,
  // patthar ke blocks (India Gate)
  stone: `
    float ln = step(fract(vWP.y*0.8), 0.05);
    diffuseColor.rgb *= 0.9 + 0.2*fbm(vWP.xz*1.5 + vWP.y) - ln*0.18;`,
  // Delhi ki imaarat: khidkiyan, chhajje, neeche dukaan + signboard, daag
  facade: `
    vec3 nn = normalize(vN);
    vec3 base = diffuseColor.rgb;
    if (abs(nn.y) < 0.5) {
      float sx = step(0.5, abs(nn.x));
      vec2 uv = vec2(mix(vWP.x, vWP.z, sx), vWP.y);
      vec2 cell = vec2(3.0, 3.4);
      vec2 f = fract(uv / cell); vec2 id = floor(uv / cell);
      float hh = h21(id + sx * 17.0);
      float win = step(0.22, f.x) * step(f.x, 0.72) * step(0.3, f.y) * step(f.y, 0.78);
      vec3 glass = mix(vec3(0.09,0.13,0.18), vec3(0.42,0.52,0.58), hh * 0.6);
      glass = mix(glass, vec3(0.95,0.78,0.45), step(0.9, hh) * 0.9);
      float up = step(3.4, uv.y);
      base *= 1.0 - step(f.y, 0.1) * up * 0.22;
      base = mix(base, glass, win * up);
      vec3 sgn = 0.55 + 0.45 * cos(6.2831 * (h21(vec2(floor(uv.x / 5.0), 3.0)) + vec3(0.0, 0.33, 0.67)));
      vec3 shop = mix(vec3(0.36,0.37,0.4), vec3(0.5,0.5,0.52), step(0.5, fract(uv.y * 2.5)));
      shop = mix(shop, sgn, step(2.5, uv.y));
      base = mix(base, shop, (1.0 - up) * step(0.5, h21(vec2(floor(uv.x / 5.0), 9.0)) + 0.35));
      base *= 0.86 + 0.14 * smoothstep(0.0, 9.0, uv.y);
      base *= 0.88 + 0.24 * fbm(uv * 0.35);
    } else {
      base = mix(base, vec3(0.4,0.39,0.38), 0.7);
    }
    diffuseColor.rgb = base;`,
}

const VERT = (wind) => `
  vec4 fxW = vec4(position, 1.0);
  vec3 fxO = vec3(0.0);
  #ifdef USE_INSTANCING
    fxW = instanceMatrix * fxW;
    fxO = instanceMatrix[3].xyz;
  #endif
  vWP = (modelMatrix * fxW).xyz;
  vN = normal;
  ${wind ? `float fxH = max(0.0, fxO.y + position.y);
  transformed.x += sin(uTime*1.7 + fxO.x*0.31 + fxO.z*0.23) * 0.12 * fxH * ${wind.toFixed(3)};
  transformed.z += cos(uTime*1.3 + fxO.z*0.29 + fxO.x*0.17) * 0.09 * fxH * ${wind.toFixed(3)};` : ''}
`

// Halka anime / toon look: roshni 3 narm patiyon (bands) mein, shadow mein neela-jamuni rang,
// roshni mein garam rang, kinaare pe rim-light, aur brush jaisa halka texture.
// Taqat badalni ho to neeche 0.85 (bands ki taqat) aur 0.16 (rim) ke number badlo.
const TOON = `
  {
    float fxA = max(dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114)), 0.03);
    float fxL = dot(outgoingLight, vec3(0.299, 0.587, 0.114));
    float fxQ = clamp(fxL / fxA / 1.2, 0.0, 1.0);
    float fxS = fxQ * 3.0;
    float fxB = (floor(fxS) + smoothstep(0.38, 0.62, fract(fxS))) / 3.0;
    fxB = mix(fxQ, fxB, 0.85);
    vec3 fxTint = mix(vec3(0.60, 0.58, 0.84), vec3(1.04, 0.97, 0.84), fxB);
    fxTint *= 0.93 + 0.14 * fbm(vWP.xz * 1.6 + vWP.y * 1.1);
    float fxRim = pow(1.0 - clamp(dot(normalize(vViewPosition), normal), 0.0, 1.0), 3.0);
    outgoingLight = diffuseColor.rgb * fxTint * (0.52 + 0.78 * fxB) + vec3(1.0, 0.84, 0.58) * fxRim * 0.16 * fxB;
  }
`

// material ko shader se "paint" karo. wind > 0 ho to hawa mein hilta hai.
export function paint(mat, kind = 'plain', wind = 0) {
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = U.uTime
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;\nvarying vec3 vWP;\nvarying vec3 vN;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\n' + VERT(wind))
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWP;\nvarying vec3 vN;\n' + NOISE)
      .replace('#include <color_fragment>', '#include <color_fragment>\n' + FRAG[kind])
      .replace('#include <opaque_fragment>', TOON + '\n#include <opaque_fragment>')
  }
  mat.customProgramCacheKey = () => kind + wind
  return mat
}

// <Mat kind="asphalt" color="#555" /> : mesh ke andar material ki jagah
export function Mat({ kind, color, wind = 0, ...rest }) {
  const m = useMemo(() => paint(new THREE.MeshStandardMaterial({ color, roughness: 1, ...rest }), kind, wind), [kind, color, wind])
  return <primitive object={m} attach="material" />
}

/* ------------------------------------------------------------------ */
/*  AutoPaint: scene ke material khud pehchaan ke shader laga deta hai  */
/* ------------------------------------------------------------------ */
const _size = new THREE.Vector3()
const _ws = new THREE.Vector3()
const _m4 = new THREE.Matrix4()
const _p = new THREE.Vector3()
const _q = new THREE.Quaternion()
const _s = new THREE.Vector3()

// Mesh ko dekh ke andaza lagata hai ki ye kya hai (zameen / sadak / imaarat)
function classify(o, m) {
  const g = o.geometry
  if (!g) return null
  if (!g.boundingBox) g.computeBoundingBox()
  g.boundingBox.getSize(_size)

  let w, h
  if (o.isInstancedMesh) {
    w = 0; h = 0
    const n = Math.min(o.count, 40)
    for (let i = 0; i < n; i++) {
      o.getMatrixAt(i, _m4)
      _m4.decompose(_p, _q, _s)
      h = Math.max(h, _size.y * _s.y)
      w = Math.max(w, _size.x * _s.x, _size.z * _s.z)
    }
  } else {
    o.getWorldScale(_ws)
    h = _size.y * _ws.y
    w = Math.max(_size.x * _ws.x, _size.z * _ws.z)
  }

  if (m.vertexColors && !o.isInstancedMesh) return 'lawn'                 // rang-bhari zameen
  if (!o.isInstancedMesh && h < 0.8 && w > 40) return 'asphalt'           // lambi chapti patti = sadak
  if (g.type === 'BoxGeometry' && h > 5 && w > 4) return 'facade'         // oonchi dabba = imaarat
  return null
}

export function AutoPaint() {
  const scene = useThree((s) => s.scene)

  useEffect(() => {
    const seen = new WeakSet()
    const base = THREE.Material.prototype.onBeforeCompile

    const run = () => {
      scene.traverse((o) => {
        if (!o.isMesh || !o.material) return
        const mats = Array.isArray(o.material) ? o.material : [o.material]
        for (const m of mats) {
          if (seen.has(m)) continue
          seen.add(m)
          if (!m.isMeshStandardMaterial) continue
          if (m.onBeforeCompile !== base) continue          // pehle se paint ho chuka hai (Grass, Mat...)
          const kind = classify(o, m) || 'plain'   // pehchan na ho to bhi toon look lagta hai
          if (kind === 'lawn' || kind === 'asphalt') m.flatShading = false   // zameen/sadak chikni, dabba-dabba nahi
          paint(m, kind, 0)
          m.needsUpdate = true
        }
      })
    }

    const t0 = setTimeout(run, 600)
    const id = setInterval(run, 1500)   // naye banne wale mesh (chunks) ke liye
    return () => { clearTimeout(t0); clearInterval(id) }
  }, [scene])

  return null
}
