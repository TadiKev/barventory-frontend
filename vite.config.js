// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build',   // ← ensures Vite outputs to "build/" instead of "dist/"
  },
  server: {
    proxy: {
      // During local development, forward any /api calls to your local backend
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
