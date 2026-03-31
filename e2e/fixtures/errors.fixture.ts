import { type Page, test as base } from '@playwright/test';
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

    await loginAndNavigate(page, testConfig.expectedDefaultRedirect);
    await use(page);
  },
});

export { expect } from '@playwright/test';
