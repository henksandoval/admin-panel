import { test, expect } from '@playwright/test';
import { testConfig } from '../../config/test.config';

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

