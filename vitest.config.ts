import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';
import { resolve } from 'path';

export default defineConfig({
  plugins: [angular()],
  test: {
    globals: true,
    pool: 'forks',
    environment: 'jsdom',
    setupFiles: [
      '@analogjs/vite-plugin-angular/setup-vitest',
      'src/test-setup.ts',
    ],
    include: ['src/**/*.spec.ts'],
    reporters: ['verbose'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/app/**/*.ts'],
      exclude: [
        'src/app/**/*.spec.ts',
        'src/app/**/*.model.ts',
        'src/app/app.routes.ts',
        'src/app/app.config.ts',
        'src/main.ts',
        'src/app/features/pds/**',
      ],
      thresholds: {
        statements: 70,
        branches: 70,
        functions: 70,
        lines: 70,
      },
    },
  },
  resolve: {
    alias: {
      '@auth-testing': resolve(__dirname, 'src/tests/helpers/auth'),
      '@core': resolve(__dirname, 'src/app/core'),
      '@auth': resolve(__dirname, 'src/app/core/auth'),
      '@features': resolve(__dirname, 'src/app/features'),
      '@layout': resolve(__dirname, 'src/app/layout'),
      '@stubs': resolve(__dirname, 'src/tests/stubs'),
      '@test-helpers': resolve(__dirname, 'src/tests/helpers'),
      '@ui-atoms': resolve(__dirname, 'src/app/ui-kit/atoms'),
      '@ui-molecules': resolve(__dirname, 'src/app/ui-kit/molecules'),
      '@ui-organisms': resolve(__dirname, 'src/app/ui-kit/organisms'),
      '@ui-templates': resolve(__dirname, 'src/app/ui-kit/templates'),
      '@ui-types': resolve(__dirname, 'src/app/ui-kit/types'),
      '@ui-kit': resolve(__dirname, 'src/app/ui-kit'),
      '@env': resolve(__dirname, 'src/environments'),
    },
  },
});

