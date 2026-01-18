import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',                        // allows Render to access the app
    port: Number(process.env.PORT) || 5173, // use Render's port or default
    allowedHosts: ['.onrender.com']         // allow Render's public host
  }
})

