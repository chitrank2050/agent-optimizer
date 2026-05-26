/**
 * Vite configuration for the embedded HighLevel dashboard.
 *
 * Uses the monorepo root `.env` as the single environment source so API and
 * web settings stay aligned during local sandbox review.
 */
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  envDir: fileURLToPath(new URL('../..', import.meta.url)),
  resolve: {
    alias: {
      '@agent-optimizer/contracts': fileURLToPath(
        new URL('../../packages/contracts/src/index.ts', import.meta.url),
      ),
    },
  },
  plugins: [vue(), tailwindcss()],
  server: {
    port: 5173,
  },
});
