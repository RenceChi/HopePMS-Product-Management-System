import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // test section for Vitest
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: '.src/test/setup.js',
  },
});