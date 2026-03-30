import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for the admin-panel Angular application.
 *
 * The webServer block starts `ng serve` automatically before running any
 * tests and shuts it down when the run completes.  If a server is already
 * listening on port 4200 (e.g. you started it manually) Playwright will
 * reuse it instead of starting a second one.
 *
 * Set PLAYWRIGHT_BASE_URL environment variable to override the base URL
 * (useful in CI where the app may be served from a different origin).
 */
export default defineConfig({
  testDir: './e2e/tests',

  fullyParallel: true,

  forbidOnly: !!process.env['CI'],

  retries: process.env['CI'] ? 2 : 0,

  workers: process.env['CI'] ? 1 : undefined,

  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],

  use: {
    baseURL: process.env['PLAYWRIGHT_BASE_URL'] ?? 'http://localhost:4200',

    trace: 'on-first-retry',

    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  /**
   * Start `ng serve` before the test run.
   * `reuseExistingServer: true` avoids re-starting the dev server when you
   * already have it running locally, which speeds up the feedback loop.
   */
  webServer: {
    command: 'npx ng serve --configuration=development',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
  },
});
