import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 3000,
    host: true,
    strictPort: false, // Allow fallback to other ports if 3000 is busy
    open: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/analytics'],
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-checkbox', '@radix-ui/react-label', '@radix-ui/react-separator'],
        },
      },
    },
  },
  define: {
    // Ensure NODE_ENV is available at build time
    'import.meta.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
  preview: {
    port: 3000,
    host: true,
  },
})
