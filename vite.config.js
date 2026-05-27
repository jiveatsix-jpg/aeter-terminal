import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: '',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    target: 'es2015',
    cssMinify: 'lightningcss',
    rollupOptions: {
      output: {
        manualChunks: undefined,
        inlineDynamicImports: true,
      },
    },
  },
  esbuild: {
    target: 'es2015',
  },
});
