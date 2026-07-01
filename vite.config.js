import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'SISGEM — Minimercado',
        short_name: 'Sisgem',
        description: 'Tu minimercado de confianza',
        theme_color: '#1E9E50',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        lang: 'es',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        // cachear assets estáticos y páginas
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
        // no cachear las APIs del backend
        navigateFallback: null,
        runtimeCaching: [
          {
            // cachear llamadas al catálogo con network-first
            urlPattern: /\/api\/catalogo/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-catalogo',
              expiration: { maxEntries: 50, maxAgeSeconds: 300 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@shared':   path.resolve(__dirname, 'src/shared'),
      '@features': path.resolve(__dirname, 'src/features'),
      '@routes':   path.resolve(__dirname, 'src/routes'),
    }
  }
})