import { useEffect } from 'react'
import { input } from '../store'

const map = { w: 'w', arrowup: 'w', s: 's', arrowdown: 's', a: 'a', arrowleft: 'a', d: 'd', arrowright: 'd' }

export default function Controls() {
  useEffect(() => {
    const down = (e) => { const k = map[e.key.toLowerCase()]; if (k) input[k] = 1 }
    const up = (e) => { const k = map[e.key.toLowerCase()]; if (k) input[k] = 0 }
    addEventListener('keydown', down)
    addEventListener('keyup', up)
    return () => { removeEventListener('keydown', down); removeEventListener('keyup', up) }
  }, [])

  const btn = (k, label) => (
    <button
      onPointerDown={(e) => { e.preventDefault(); input[k] = 1 }}
      onPointerUp={() => (input[k] = 0)}
      onPointerLeave={() => (input[k] = 0)}
      onPointerCancel={() => (input[k] = 0)}
    >
      {label}
    </button>
  )

  return (
    <>
      <div className="pad left">{btn('a', '◀')}{btn('d', '▶')}</div>
      <div className="pad right">{btn('s', '▼')}{btn('w', '▲')}</div>
    </>
  )
}
