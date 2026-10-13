import { useGame, toggleCar } from '../store'

export default function Hud() {
  const speed = useGame((s) => s.speed)
  const mode = useGame((s) => s.mode)
  const nearCar = useGame((s) => s.nearCar)
  const walking = mode === 'walk'
  const deg = -120 + (Math.min(speed, 110) / 110) * 240

  const label = walking
    ? nearCar ? '🚗 Gaadi mein baitho' : '🚗 Gaadi door hai'
    : speed > 5 ? '🚶 Pehle gaadi roko' : '🚶 Gaadi se utro'
  const disabled = walking ? !nearCar : speed > 5

  return (
    <>
      {!walking && (
        <div className="speedo">
          <i style={{ transform: `translate(-50%,-100%) rotate(${deg}deg)` }} />
          <b>{speed}</b>
          <small>km/h</small>
        </div>
      )}
      <button className="carbtn" disabled={disabled} onClick={toggleCar}>{label} (E)</button>
    </>
  )
}
