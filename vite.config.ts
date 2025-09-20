import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Vercel will set process.env variables during the build process.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Expose Vercel's environment variables to the client code
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    }
  }
})
