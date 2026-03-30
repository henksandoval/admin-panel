import { test as base, type Page } from '@playwright/test';
import { testConfig } from '../config/test.config';
import { interceptAuthLogin, interceptAuthMe, loginAndNavigate } from '../helpers/auth.helpers';

export interface ErrorFixtures {
  authenticatedPage: Page;
}

export const test = base.extend<ErrorFixtures>({
  authenticatedPage: async ({ page }, use) => {
    if (testConfig.useMock) {
      await interceptAuthLogin(page);
      await interceptAuthMe(page);
    }

    await loginAndNavigate(page, testConfig.errorRoutes.notFound);
    await use(page);
  },
});

export { expect } from '@playwright/test';
