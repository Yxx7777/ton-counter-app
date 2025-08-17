import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // IMPORTANT: set base for GitHub Pages
  base: '/ton-counter-app/',
  plugins: [
    react(),
    {
      name: 'tonconnect-cors-middleware',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url || ''
          if (url.startsWith('/tonconnect-manifest.json') || url.startsWith('/icon.png')) {
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
          }
          next()
        })
      },
    },
  ],
  server: {
    port: 5177,
    strictPort: true,
    host: true,
    // Разрешаем любые trycloudflare поддомены (туннель может смениться)
    allowedHosts: true,
  },
  resolve: {
    alias: {
      buffer: 'buffer',   // 👈 говорим Vite, где искать Buffer
    },
  },
  define: {
    'process.env': {},    // 👈 подмена process.env, иначе тоже может ругаться
  },
})
