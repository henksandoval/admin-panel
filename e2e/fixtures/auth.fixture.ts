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
  loginPage: Page;
  resetPasswordPage: Page;
}

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
