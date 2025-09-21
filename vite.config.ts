import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Re-added the server proxy to ensure API requests work robustly in local development.
  // This forwards any requests from the Vite dev server (e.g., from localhost:5173/api/...)
  // to the local Express server (running on localhost:3001).
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    }
  }
})