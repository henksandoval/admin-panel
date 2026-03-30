import { test as base, type Page } from '@playwright/test';
import { testConfig } from '../config/test.config';
import { interceptAuthLogin, interceptAuthMe, loginAndNavigate } from '../helpers/auth.helpers';

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
