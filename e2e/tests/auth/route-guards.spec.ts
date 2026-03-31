import { expect, test } from '@playwright/test';
import { testConfig } from '../../config/test.config';
import { interceptAuthLogin, interceptAuthMe, loginAndNavigate } from '../../helpers/auth.helpers';

test.describe('Route guard — unauthenticated access', () => {
  test('redirects to the login page when accessing a protected route without a session', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL('**/auth/login**');

    await expect(page.getByTestId('login-submit-button')).toBeVisible();
  });

  test('preserves the original URL as a returnUrl query param on the login redirect', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL('**/auth/login**');

    const url = new URL(page.url());
    expect(url.searchParams.get('returnUrl')).toBe(testConfig.expectedDefaultRedirect);
  });
});

test.describe('Route guard — public auth routes', () => {
  test('the login page is accessible without an active session', async ({ page }) => {
    await page.goto('/auth/login');

    await expect(page.getByTestId('login-submit-button')).toBeVisible();
  });
});

test.describe('Route guard — authenticated access to auth routes', () => {
  test('redirects an already authenticated user from /auth/login to the default dashboard', async ({ page }) => {
    if (testConfig.useMock) {
      await interceptAuthLogin(page);
      await interceptAuthMe(page);
    }

    await loginAndNavigate(page, '/auth/login');

    await page.waitForURL(`**${testConfig.expectedDefaultRedirect}`);

    await expect(page).toHaveURL(new RegExp(testConfig.expectedDefaultRedirect));
  });
});

