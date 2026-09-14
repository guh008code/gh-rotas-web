import { defineConfig } from 'vite';
export default defineConfig({ base: '/app/', esbuild: { jsx: 'automatic' }, build: { outDir: '../wwwroot/app', emptyOutDir: true }, server: { port: 5173 } });
