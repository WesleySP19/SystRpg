import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        player: resolve(__dirname, 'player-view.html'),
        map: resolve(__dirname, 'master-map.html'),
        reset: resolve(__dirname, 'reset-sw.html')
      }
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/data': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/public': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
});
