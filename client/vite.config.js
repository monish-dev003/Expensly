import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      components: resolve(__dirname, 'src/components'),
      pages:      resolve(__dirname, 'src/pages'),
      utils:      resolve(__dirname, 'src/utils'),
      store:      resolve(__dirname, 'src/store'),
      api:        resolve(__dirname, 'src/api'),
    },
  },

  server: {
    port: 5173,
    historyApiFallback: true,
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor':   ['react', 'react-dom', 'react-router-dom'],
          'motion-vendor':  ['framer-motion'],
          'chart-vendor':   ['recharts'],
          'store-vendor':   ['zustand'],
          'firebase-vendor': ['firebase/app', 'firebase/auth'],
        },
      },
    },
  },

  preview: {
    port: 4173,
  },
});
