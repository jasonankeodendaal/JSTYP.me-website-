import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // The 'vercel dev' command now handles API proxying automatically,
  // making the manual server.proxy configuration redundant.
  // 
  // API key is no longer exposed to the client.
  // It will be used securely on the server-side API routes.
})