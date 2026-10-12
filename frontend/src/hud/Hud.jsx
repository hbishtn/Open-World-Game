import { useGame } from '../store'

export default function Hud() {
  const speed = useGame((s) => s.speed)
  const deg = -120 + (Math.min(speed, 110) / 110) * 240
  return (
    <div className="speedo">
      <i style={{ transform: `translate(-50%,-100%) rotate(${deg}deg)` }} />
      <b>{speed}</b>
      <small>km/h</small>
    </div>
  )
}
