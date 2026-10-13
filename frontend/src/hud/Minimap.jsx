import { useEffect, useRef, useState } from 'react'
import { player, walker, useGame } from '../store'
import { NS, EW, BUILDINGS, GATE_Z, RING_IN, RING_OUT, METRO_X, STATIONS, STATION_HALF } from '../world'
import { INTERSECTIONS } from '../signals'

const HALF = 850   // duniya -850..850 tak hai
const BCOL = ['#c9a98a', '#b9714f', '#a9a79c']

function drawMap(ctx, w, h, cx, cz, k, big) {
  const X = (x) => w / 2 + (x - cx) * k
  const Z = (z) => h / 2 + (z - cz) * k
  const rect = (x0, x1, z0, z1, c) => { ctx.fillStyle = c; ctx.fillRect(X(x0), Z(z0), (x1 - x0) * k, (z1 - z0) * k) }
  const minW = big ? 3 : 2
  const label = (t, x, y, right) => {
    ctx.font = 'bold 11px system-ui'; ctx.lineWidth = 3; ctx.strokeStyle = '#000'; ctx.fillStyle = '#fff'
    if (right) x -= ctx.measureText(t).width
    ctx.strokeText(t, x, y); ctx.fillText(t, x, y)
  }

  ctx.fillStyle = '#6b6350'; ctx.fillRect(0, 0, w, h)                       // duniya ke bahar
  rect(-HALF, HALF, -HALF, HALF, '#d9cfa8')                                 // zameen
  rect(-44, -12, -800, 800, '#8bbf5a'); rect(12, 44, -800, 800, '#8bbf5a')  // lawns
  for (const b of BUILDINGS) rect(b.x - b.w / 2, b.x + b.w / 2, b.z - b.d / 2, b.z + b.d / 2, BCOL[b.c])

  ctx.fillStyle = '#3d434b'                                                 // sadakein
  for (const r of NS) { const pw = Math.max(r.half * 2 * k, minW); ctx.fillRect(X(r.x) - pw / 2, Z(-800), pw, 1600 * k) }
  for (const r of EW) { const pw = Math.max(r.half * 2 * k, minW); ctx.fillRect(X(-800), Z(r.z) - pw / 2, 1600 * k, pw) }

  ctx.strokeStyle = '#3d434b'; ctx.lineWidth = (RING_OUT - RING_IN) * k     // India Gate roundabout
  ctx.beginPath(); ctx.arc(X(0), Z(GATE_Z), ((RING_OUT + RING_IN) / 2) * k, 0, 6.283); ctx.stroke()
  ctx.fillStyle = '#8bbf5a'
  ctx.beginPath(); ctx.arc(X(0), Z(GATE_Z), RING_IN * k, 0, 6.283); ctx.fill()
  const g = big ? 5 : 3
  ctx.fillStyle = '#c9a27a'; ctx.fillRect(X(0) - g, Z(GATE_Z) - g, g * 2, g * 2)

  // metro line (peeli patti) + stations (neele dabbe)
  const mw = Math.max(11 * k, minW)
  ctx.fillStyle = '#f4c20d'; ctx.fillRect(X(METRO_X) - mw / 2, Z(-800), mw, 1600 * k)
  ctx.fillStyle = '#1d4f91'
  for (const s of STATIONS) ctx.fillRect(X(METRO_X) - 7 * k - 1, Z(s.z) - STATION_HALF * k, 14 * k + 2, STATION_HALF * 2 * k)

  // traffic signal wale chorahe (peele dot)
  ctx.fillStyle = '#ffb703'
  for (const it of INTERSECTIONS) { const s = big ? 4 : 3; ctx.fillRect(X(it.x) - s / 2, Z(it.z) - s / 2, s, s) }

  if (big) {
    ctx.strokeStyle = '#f6f2e4'; ctx.lineWidth = 2
    ctx.strokeRect(X(-HALF), Z(-HALF), HALF * 2 * k, HALF * 2 * k)         // border
    for (const r of NS) label(r.name, X(r.x) + 6, Z(740))
    for (const r of EW) label(r.name, X(-790) + 4, Z(r.z) - 6)
    for (const s of STATIONS) label('M ' + s.name, X(METRO_X) - 7 * k - 4, Z(s.z) + 4, true)
    label('India Gate', X(40), Z(GATE_Z) + 4); label('Start', X(14), Z(780))
    label('N ↑', 8, 18)
    label('▲ aap  ■ India Gate  ■ signal  ▮ metro', 8, h - 10)
  }

  // aap: laal tikona (paidal ho to gaadi chhota safed dabba ban jati hai)
  const walking = useGame.getState().mode === 'walk'
  const me = walking ? walker : player
  if (walking) { ctx.fillStyle = '#fff'; ctx.strokeStyle = '#000'; ctx.lineWidth = 1; ctx.fillRect(X(player.x) - 3, Z(player.z) - 3, 6, 6); ctx.strokeRect(X(player.x) - 3, Z(player.z) - 3, 6, 6) }
  ctx.save()
  ctx.translate(X(me.x), Z(me.z)); ctx.rotate(Math.PI - (walking ? walker.yaw : player.ang))
  const s = big ? 1.7 : 1
  ctx.fillStyle = '#ff3b30'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(0, -6 * s); ctx.lineTo(4.5 * s, 5 * s); ctx.lineTo(-4.5 * s, 5 * s); ctx.closePath(); ctx.fill(); ctx.stroke()
  ctx.restore()
}

export default function Minimap() {
  const small = useRef()
  const big = useRef()
  const [full, setFull] = useState(false)
  const size = Math.max(200, Math.min(innerWidth - 24, innerHeight - 100))

  useEffect(() => {                       // chhota map (truck ke saath chalta hai)
    if (full) return
    const ctx = small.current.getContext('2d')
    let raf
    const loop = () => { const me = useGame.getState().mode === 'walk' ? walker : player; drawMap(ctx, 130, 130, me.x, me.z, 0.6, false); raf = requestAnimationFrame(loop) }
    loop()
    return () => cancelAnimationFrame(raf)
  }, [full])

  useEffect(() => {                       // bada map (poori duniya)
    if (!full) return
    const ctx = big.current.getContext('2d')
    let raf
    const loop = () => { drawMap(ctx, size, size, 0, 0, size / (HALF * 2), true); raf = requestAnimationFrame(loop) }
    loop()
    return () => cancelAnimationFrame(raf)
  }, [full, size])

  if (full)
    return (
      <div className="mapfull">
        <button className="mapback" onClick={() => setFull(false)}>← Back</button>
        <canvas ref={big} width={size} height={size} />
      </div>
    )
  return <canvas ref={small} className="minimap" width={130} height={130} onPointerDown={() => setFull(true)} />
}
