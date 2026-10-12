# Pixel Road: React + React Three Fiber + Django

## Folder
- `frontend/`: React + Vite + React Three Fiber (game yahan chalta hai)
- `backend/`: Django (player ki position save/load API)

## Chalane ka process

### 1) Backend (Terminal 1)
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py makemigrations game
python manage.py migrate
python manage.py runserver      # http://127.0.0.1:8000
```

### 2) Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev                     # http://localhost:5173
```
Browser mein `http://localhost:5173` kholo. Controls: W A S D / arrow keys, ya phone pe on-screen buttons.
Vite `/api` ki requests apne aap Django ko bhej deta hai (vite.config.js mein proxy).

## Code kahan kya hai
- `src/world.js`: road ka path + zameen ki unchai (poori duniya ka math)
- `components/Terrain.jsx`: pahaad/khet; `Road.jsx`: sadak; `Trees.jsx`: ped + poles
- `components/Truck.jsx`: gaadi ki physics, camera follow, save/load
- `hud/`: speedometer aur touch controls
- `App.jsx`: scene, fog, light, pixel look (`dpr={0.34}`)

## Agle steps
1. Rapier physics (`@react-three/rapier`) asli collision ke liye
2. Chunk loading: jaise-jaise aage badho, nayi duniya generate ho
3. Ghaas/phool (instanced) aur postprocessing se painterly look
4. Login (Django auth), quests, inventory
5. Multiplayer: Django Channels (WebSocket)
