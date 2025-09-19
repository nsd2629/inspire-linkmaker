import { defineConfig } from 'vite';
export default defineConfig({
  root: 'link',
  build: { outDir: '../dist', emptyOutDir: true },
  server: { port: 5173, open: '/link/' }
});
