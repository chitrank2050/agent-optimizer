import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

/**
 * Vitest runs API unit/integration tests through SWC for faster TypeScript
 * transforms while preserving NestJS decorator metadata from tsconfig.json.
 */
export default defineConfig({
  plugins: [
    swc.vite({
      tsconfigFile: './tsconfig.json',
    }),
  ],
  test: {
    environment: 'node',
    globals: true,
  },
});
