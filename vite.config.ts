import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  // Environment configuration
  envPrefix: 'VITE_',
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  },
  
  // Optimized dependencies
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      '@google/genai',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
    ],
  },
  
  // Server configuration for development
  server: {
    port: 5173,
    host: true,
    open: false,
    cors: true
  },
  
  // Production build configuration
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          gemini: ['@google/genai'],
          ui: ['lucide-react']
        }
      }
    }
  }
});