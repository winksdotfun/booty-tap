import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020', // Changed from es2015 to support BigInt
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: undefined,
        compact: true
      }
    },
    terserOptions: {
      compress: {
        drop_console: true,
        passes: 2
      }
    }
  }
})