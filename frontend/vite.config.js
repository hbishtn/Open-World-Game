import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // /api ki requests Django (port 8000) ko forward hongi
  server: { proxy: { '/api': 'http://127.0.0.1:8000' } },
})
