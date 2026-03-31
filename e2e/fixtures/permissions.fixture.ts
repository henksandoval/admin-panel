import { type Page, test as base } from '@playwright/test';
import { testConfig } from '../config/test.config';
import { interceptAuthLogin, interceptAuthMe, loginAndNavigate } from '../helpers/auth.helpers';

export interface PermissionsFixtures {
  dashboardPage: Page;
}

export const test = base.extend<PermissionsFixtures>({
  dashboardPage: async ({ page }, use) => {
    if (testConfig.useMock) {
      await interceptAuthLogin(page);
      await interceptAuthMe(page);
    }

    await loginAndNavigate(page, testConfig.expectedDefaultRedirect);
    await page.waitForSelector('[data-testid="dashboard-container"]');

    await use(page);
  },
});

export { expect } from '@playwright/test';
