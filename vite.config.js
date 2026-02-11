import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    proxy: {
      // 🟢 AdminBackend Routes (Port 8000)
      '/api/services': { target: 'http://localhost:8000', changeOrigin: true },
      '/api/courses': { target: 'http://localhost:8000', changeOrigin: true },
      '/api/aptitude': { target: 'http://localhost:8000', changeOrigin: true },
      '/api/categories': { target: 'http://localhost:8000', changeOrigin: true },
      '/api/dashboard': { target: 'http://localhost:8000', changeOrigin: true },
      '/api/channels': { target: 'http://localhost:8000', changeOrigin: true },
      '/api/playlists': { target: 'http://localhost:8000', changeOrigin: true },
      '/api/quizzes': { target: 'http://localhost:8000', changeOrigin: true },
      '/api/videos': { target: 'http://localhost:8000', changeOrigin: true },

      // 🔵 Main Backend Routes (Port 5000)
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
