import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/dashboard.pengelola.keuangan/', // Ditambahkan agar bisa jalan di GitHub Pages
})
