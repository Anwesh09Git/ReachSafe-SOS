import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'maskable-icon.png'],
      manifest: {
        name: 'ReachSafe Emergency Node',
        short_name: 'ReachSafe',
        description: 'Real-time Full-Stack Personal Safety & Location Telemetry Stream',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone', 
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'https://cdn-icons-png.flaticon.com/512/1086/1086614.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
});
