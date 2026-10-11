import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,        // Tashqi so'rovlarga ruxsat beradi
    allowedHosts: true // Ngrok domentlariga ruxsat beradi
  }
})