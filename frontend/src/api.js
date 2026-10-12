// Django backend se baat karne ke functions. Backend band ho to game phir bhi chalta hai.
export async function loadPlayer() {
  try {
    const r = await fetch('/api/player/')
    if (!r.ok) return null
    return (await r.json()).player
  } catch {
    return null
  }
}

export async function savePlayer(data) {
  try {
    await fetch('/api/player/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  } catch {
    /* ignore */
  }
}
