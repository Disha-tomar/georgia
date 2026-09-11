import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // injectManifest, not generateSW: the worker hand-writes the byte-range
      // handler that makes the offline basemap possible.
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'prompt',
      injectManifest: {
        // Photos, fonts, glyphs and MapLibre all precache. The 64 MB basemap
        // deliberately does not — it is an explicit, user-initiated download.
        globPatterns: ['**/*.{js,css,html,woff2,webp,png,svg,json,pbf}'],
        globIgnores: ['**/georgia.pmtiles', '**/node_modules/**'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
      manifest: {
        name: 'Georgia — 26 Sep to 4 Oct',
        short_name: 'Georgia',
        description: 'Offline itinerary, maps and food for a nine-day Georgia road trip.',
        lang: 'en',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#F4EBDC',
        theme_color: '#C86B3C',
        categories: ['travel', 'navigation'],
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  build: {
    outDir: 'dist',
    // Photos and the basemap are served as static assets, never inlined.
    assetsInlineLimit: 0,
  },
});
