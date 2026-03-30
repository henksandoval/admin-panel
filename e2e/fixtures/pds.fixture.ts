import { test as base, type Page } from '@playwright/test';
import { testConfig } from '../config/test.config';
import { interceptAuthLogin, interceptAuthMe, loginAndNavigate } from '../helpers/auth.helpers';

export interface PdsFixtures {
  toggleGroupsPage: Page;
  selectsPage: Page;
  radioGroupsPage: Page;
  datepickerPage: Page;
  formPage: Page;
}

export const test = base.extend<PdsFixtures>({
  toggleGroupsPage: async ({ page }, use) => {
    if (testConfig.useMock) {
      await interceptAuthLogin(page);
      await interceptAuthMe(page);
    }

    await loginAndNavigate(page, '/pds/toggle-groups');
    await page.waitForSelector('[data-testid="toggle-group"]');

    await use(page);
  },
  selectsPage: async ({ page }, use) => {
    if (testConfig.useMock) {
      await interceptAuthLogin(page);
      await interceptAuthMe(page);
    }

    await loginAndNavigate(page, '/pds/selects');
    await page.waitForSelector('[data-testid="form-select-control"]');

    await use(page);
  },

  radioGroupsPage: async ({ page }, use) => {
    if (testConfig.useMock) {
      await interceptAuthLogin(page);
      await interceptAuthMe(page);
    }

    await loginAndNavigate(page, '/pds/radios');
    await page.waitForSelector('[data-testid="radio-group-wrapper"]');

    await use(page);
  },

  datepickerPage: async ({ page }, use) => {
    if (testConfig.useMock) {
      await interceptAuthLogin(page);
      await interceptAuthMe(page);
    }

    await loginAndNavigate(page, '/pds/form');
    await page.waitForSelector('[data-testid="datepicker-toggle"]');

    await use(page);
  },

  formPage: async ({ page }, use) => {
    if (testConfig.useMock) {
      await interceptAuthLogin(page);
      await interceptAuthMe(page);
    }

    await loginAndNavigate(page, '/pds/form');
    await page.waitForSelector('[data-testid="pds-form-email-input"]');
    await page.waitForSelector('[data-testid="pds-form-description"]');

    await use(page);
  },
});

export { expect } from '@playwright/test';
