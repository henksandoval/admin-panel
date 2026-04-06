import { type Page, test as base } from '@playwright/test';
import { testConfig } from '../config/test.config';
import { interceptAuthLogin, interceptAuthMe, interceptAuthRefresh, interceptAuthLogout, interceptMenuData, loginAndNavigate } from '../helpers/auth.helpers';

export interface LayoutFixtures {
  breadcrumbPage: Page;
}

export const test = base.extend<LayoutFixtures>({
  breadcrumbPage: async ({ page }, use) => {
    if (testConfig.useMock) {
      await interceptAuthLogin(page);
      await interceptAuthMe(page);
      await interceptAuthRefresh(page);
      await interceptAuthLogout(page);
      await interceptMenuData(page);
    }

    await loginAndNavigate(page, '/pds/toggle-groups');
    // First wait for the layout shell to render
    await page.waitForSelector('[data-testid="layout-shell"]', { timeout: 10000 }).catch(() => {
      console.log('Layout shell not found, checking page state...');
    });
    // Then wait for the breadcrumb
    await page.waitForSelector('[data-testid="bread-crumb-pill"]');

    await use(page);
  },
});

export { expect } from '@playwright/test';
