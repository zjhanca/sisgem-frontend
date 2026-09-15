import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo-icon.png', 'logo-white.png', 'logo-green.png'],
      manifest: {
        name: 'Sisgem',
        short_name: 'Sisgem',
        description: 'Sistema de Gestión para Minimercado',
        theme_color: '#14532D',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/logo-icon.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/logo-icon.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/logo-icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
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