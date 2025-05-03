import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { // Add this server configuration
    proxy: {
      // Proxy /api requests to your backend server
      '/api': {
        target: 'http://localhost:5000', // Your backend server address
        changeOrigin: true, // Recommended for virtual hosted sites
        secure: false,      // Optional: Set to false if backend uses http
      },
    },
  },
})
