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

async function interceptPasswordReset(page: Page): Promise<void> {
  const resetUrl = `${testConfig.apiBaseUrl}/auth/password-reset/request`;

  await page.route(resetUrl, (route: Route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({}),
    });
  });
}

async function interceptAuthRegister(page: Page): Promise<void> {
  const registerUrl = `${testConfig.apiBaseUrl}/auth/register`;

  await page.route(registerUrl, (route: Route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({}),
    });
  });
}

export interface AuthFixtures {
  loginPage: Page;
  /**
   * Navigates to the forgot-password page with all required network interception
   * already configured according to the active test.config.ts.
   *
   * Usage:
   *   test('...', async ({ forgotPasswordPage }) => {
   *     // page is already at /auth/forgot-password and mocks are active (if useMock)
   *   });
   */
  forgotPasswordPage: Page;

  /**
   * Navigates to the register page with all required network interception
   * already configured according to the active test.config.ts.
   */
  registerPage: Page;
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

  forgotPasswordPage: async ({ page }, use) => {
    if (testConfig.useMock) {
      await interceptPasswordReset(page);
    }

    await page.goto('/auth/forgot-password');
    await use(page);
  },

  registerPage: async ({ page }, use) => {
    if (testConfig.useMock) {
      await interceptAuthRegister(page);
    }

    await page.goto('/auth/register');
    await use(page);
  },
});

export { expect } from '@playwright/test';
