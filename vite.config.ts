import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import dotenv from 'dotenv';

dotenv.config(); 

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
