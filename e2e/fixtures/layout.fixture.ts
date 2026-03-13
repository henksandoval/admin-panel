import { test as base, type Page, type Route } from '@playwright/test';
import { testConfig } from '../config/test.config';

async function interceptAuthLogin(page: Page): Promise<void> {
  await page.route(`${testConfig.apiBaseUrl}/auth/login`, (route: Route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(testConfig.mockResponses.loginToken),
    });
  });
}

async function interceptAuthMe(page: Page): Promise<void> {
  await page.route(`${testConfig.apiBaseUrl}/auth/me`, (route: Route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(testConfig.mockResponses.user),
    });
  });
}

async function loginAndNavigate(page: Page, path: string): Promise<void> {
  await page.goto('/auth/login');
  await page.getByTestId('login-email-input').fill(testConfig.credentials.email);
  await page.getByTestId('login-password-input').fill(testConfig.credentials.password);
  await page.getByTestId('login-submit-button').click();
  await page.waitForURL(`**${testConfig.expectedDefaultRedirect}`);
  await page.goto(path);
}

export interface LayoutFixtures {
  breadcrumbPage: Page;
}

export const test = base.extend<LayoutFixtures>({
  breadcrumbPage: async ({ page }, use) => {
    if (testConfig.useMock) {
      await interceptAuthLogin(page);
      await interceptAuthMe(page);
    }

    await loginAndNavigate(page, '/pds/toggle-groups');
    await page.waitForSelector('[data-testid="bread-crumb-pill"]');

    await use(page);
  },
});

export { expect } from '@playwright/test';
