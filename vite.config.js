import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Кафе Маргилан Сити',
        short_name: 'Маргилан',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0d3b66',
        icons: [
          {
            src: '/icons/logo.svg',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/logo.svg',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
