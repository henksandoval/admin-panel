import { test, expect } from '../../fixtures/auth.fixture';
import { testConfig } from '../../config/test.config';

/**
 * TC-LoginHappyPath
 *
 * Verifies that a user with valid credentials is redirected to a protected
 * route after a successful login.
 *
 * The test covers two scenarios in a single spec file:
 *   1. Login without a returnUrl → redirected to the default protected route.
 *   2. Login with a returnUrl query param → redirected to that specific route.
 *
 * Network mocking / real-API behaviour is controlled exclusively by
 * e2e/config/test.config.ts.  This file must never hardcode that decision.
 */

test.describe('TC-LoginHappyPath — Successful login redirects user', () => {
  test('redirects to default protected route after successful login', async ({ loginPage }) => {
    await loginPage.getByLabel('Email').fill(testConfig.credentials.email);
    await loginPage.getByLabel('Password').fill(testConfig.credentials.password);

    await loginPage.getByRole('button', { name: /sign in/i }).click();

    await loginPage.waitForURL(`**${testConfig.expectedDefaultRedirect}`, { timeout: 10_000 });

    expect(loginPage.url()).toContain(testConfig.expectedDefaultRedirect);
  });

  test('redirects to returnUrl when query param is present', async ({ loginPage }) => {
    const returnUrl = '/dashboard';

    await loginPage.goto(`/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`);

    await loginPage.getByLabel('Email').fill(testConfig.credentials.email);
    await loginPage.getByLabel('Password').fill(testConfig.credentials.password);

    await loginPage.getByRole('button', { name: /sign in/i }).click();

    await loginPage.waitForURL(`**${returnUrl}`, { timeout: 10_000 });

    expect(loginPage.url()).toContain(returnUrl);
  });
});
