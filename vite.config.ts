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
  
  // Fix Firebase dependency issues
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      '@google/genai',
      'firebase/app',
      'firebase/firestore',
      'firebase/analytics'
    ],
    exclude: ['firebase']
  },
  
  // Server configuration for development
  server: {
    port: 5173,
    host: true,
    open: false,
    cors: true
  },
  
  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: false,
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    rollupOptions: {
      external: (id) => {
        // Don't bundle firebase - let it be handled by CDN or individual imports
        return id === 'firebase' || id.startsWith('firebase/');
      }
    }
  },
  
  // Additional Vite configuration to handle Firebase
  ssr: {
    noExternal: ['@google/genai']
  }
});