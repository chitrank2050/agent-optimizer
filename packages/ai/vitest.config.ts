import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

/**
 * The AI package is pure TypeScript, so SWC can safely handle test transforms
 * without changing runtime behavior.
 */
export default defineConfig({
  plugins: [
    swc.vite({
      tsconfigFile: './tsconfig.json',
    }),
  ],
  test: {
    environment: 'node',
  },
});
