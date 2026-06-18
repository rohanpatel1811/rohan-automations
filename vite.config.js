import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['three', 'gsap', 'framer-motion'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'three':         ['three'],
          'gsap':          ['gsap'],
          'framer-motion': ['framer-motion'],
          'calcom':        ['@calcom/embed-react'],
        },
      },
    },
  },
})
