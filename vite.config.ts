import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    // Photos and the basemap are served as static assets, never inlined.
    assetsInlineLimit: 0,
  },
});
