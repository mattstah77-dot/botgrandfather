import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/customer/',
  build: {
    outDir: resolve(__dirname, '../../public/customer'),
    emptyOutDir: true,
  },
});
