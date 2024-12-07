import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    exclude: ['e2e/**', ...configDefaults.exclude],
    setupFiles: './src/__tests__/setup.ts',
  },
});
