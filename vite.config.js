import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';
import preact from '@preact/preset-vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    preact()
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        player: resolve(__dirname, 'jogador/index.html'),
        reset: resolve(__dirname, 'reset-sw.html')
      }
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/data': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/public': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/socket.io': {
        target: 'http://localhost:8080',
        ws: true
      },
      '/yjs': {
        target: 'http://localhost:8080',
        ws: true
      }
    }
  }
});
