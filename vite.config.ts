import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import dyadComponentTagger from '@dyad-sh/react-vite-component-tagger';

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  },
  plugins: [dyadComponentTagger(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // React vendor chunk — keeps react + react-dom together, cached across pages
            if (id.includes('react-dom') || id.includes('react/')) return 'vendor-react';
            // Third-party heavy libs in dedicated chunks
            if (id.includes('framer-motion') || id.includes('motion')) return 'framer-motion';
            if (id.includes('@supabase')) return 'supabase';
            if (id.includes('lucide-react')) return 'lucide';
            // recharts is lazy-loaded — not in manualChunks (bundled into chunks that use it)
          }
        }
      }
    }
  }
});
