import { test as base, type Page, type Route } from '@playwright/test';
import { testConfig } from '../config/test.config';

/**
 * Registers Playwright route handlers for all API endpoints touched during
 * the login flow when useMock is enabled.
 *
 * The function is intentionally kept independent of the test configuration
 * object so that it can be called with custom overrides if a future test
 * needs to simulate error states.
 */
async function interceptAuthLogin(page: Page): Promise<void> {
  const loginUrl = `${testConfig.apiBaseUrl}/auth/login`;

  await page.route(loginUrl, (route: Route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(testConfig.mockResponses.loginToken),
    });
  });
}

/**
 * Registers a mock handler for the /auth/me endpoint so that the session
 * initialisation that follows a successful login can resolve without a
 * real backend.
 */
async function interceptAuthMe(page: Page): Promise<void> {
  const meUrl = `${testConfig.apiBaseUrl}/auth/me`;

  await page.route(meUrl, (route: Route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(testConfig.mockResponses.user),
    });
  });
}

async function interceptConfirmPasswordReset(page: Page): Promise<void> {
  const confirmUrl = `${testConfig.apiBaseUrl}/auth/password-reset/confirm`;

  await page.route(confirmUrl, (route: Route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({}),
    });
  });
}

export interface AuthFixtures {
  /**
   * Navigates to the login page with all required network interception
   * already configured according to the active test.config.ts.
   *
   * Usage:
   *   test('...', async ({ loginPage }) => {
   *     // page is already at /auth/login and mocks are active (if useMock)
   *   });
   */
  loginPage: Page;
  /**
   * Navigates to the reset-password page with a valid token query param and
   * all required network interception already configured.
   *
   * Usage:
   *   test('...', async ({ resetPasswordPage }) => {
   *     // page is already at /auth/reset-password?token=... and mocks are active (if useMock)
   *   });
   */
  resetPasswordPage: Page;
}

/**
 * Extended Playwright test fixture that provides a pre-configured page for
 * authentication tests.
 *
 * Network interception is activated only when testConfig.useMock === true.
 * When useMock is false the HTTP calls reach the real API defined in
 * testConfig.apiBaseUrl.
 *
 * No test file should import `test` from @playwright/test directly; import
 * from this fixture instead so that the interception logic is always applied
 * consistently.
 */
export const test = base.extend<AuthFixtures>({
  loginPage: async ({ page }, use) => {
    if (testConfig.useMock) {
      await interceptAuthLogin(page);
      await interceptAuthMe(page);
    }

    await page.goto('/auth/login');
    await use(page);
  },

  resetPasswordPage: async ({ page }, use) => {
    if (testConfig.useMock) {
      await interceptConfirmPasswordReset(page);
    }

    await page.goto(`/auth/reset-password?token=${testConfig.resetPasswordToken}`);
    await use(page);
  },
});

export { expect } from '@playwright/test';
