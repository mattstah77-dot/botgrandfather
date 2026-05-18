import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/app/',
  build: {
    outDir: resolve(__dirname, '../../public/app'),
    emptyOutDir: true,
  },
});
