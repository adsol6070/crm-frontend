import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(),],
  define: { 'process.env': {}, global: 'window' },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
})
