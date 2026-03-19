import { test as base, type Page, type Route } from '@playwright/test';
import { testConfig, type MockUserResponse } from '../config/test.config';

async function interceptAuthLogin(page: Page): Promise<void> {
  await page.route(`${testConfig.apiBaseUrl}/auth/login`, (route: Route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(testConfig.mockResponses.loginToken),
    });
  });
}

async function interceptAuthMe(page: Page, user: MockUserResponse): Promise<void> {
  await page.route(`${testConfig.apiBaseUrl}/auth/me`, (route: Route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(user),
    });
  });
}

async function loginAndNavigateToDashboard(page: Page): Promise<void> {
  await page.goto('/auth/login');
  await page.getByTestId('login-email-input').fill(testConfig.credentials.email);
  await page.getByTestId('login-password-input').fill(testConfig.credentials.password);
  await page.getByTestId('login-submit-button').click();
  await page.waitForURL(`**${testConfig.expectedDefaultRedirect}`);
}

export interface PermissionsFixtures {
  writePermissionDashboard: Page;
  readOnlyDashboard: Page;
}

export const test = base.extend<PermissionsFixtures>({
  writePermissionDashboard: async ({ page }, use) => {
    if (testConfig.useMock) {
      await interceptAuthLogin(page);
      await interceptAuthMe(page, testConfig.mockResponses.user);
    }

    await loginAndNavigateToDashboard(page);
    await page.waitForSelector('[data-testid="dashboard-container"]');

    await use(page);
  },

  readOnlyDashboard: async ({ page }, use) => {
    if (testConfig.useMock) {
      await interceptAuthLogin(page);
      await interceptAuthMe(page, testConfig.mockResponses.readOnlyUser);
    }

    await loginAndNavigateToDashboard(page);
    await page.waitForSelector('[data-testid="dashboard-container"]');

    await use(page);
  },
});

export { expect } from '@playwright/test';
