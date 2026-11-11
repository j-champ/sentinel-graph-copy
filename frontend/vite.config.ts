import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5173,
    proxy: {
      '/health': 'http://localhost:8080',
      '/forecast': 'http://localhost:8080',
      '/metrics': 'http://localhost:8080',
    },
  },
  build: {
    chunkSizeWarningLimit: 1500,
  },
});
