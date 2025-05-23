import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/NOMBRE-DEL-REPO/', // 🔁 reemplaza por tu repo
  plugins: [react()],
});