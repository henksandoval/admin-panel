import { test, expect } from '../../fixtures/auth.fixture';
import { testConfig } from '../../config/test.config';

test.describe('Successful login redirects user', () => {
  test('redirects to default protected route after successful login', async ({ loginPage }) => {
    await loginPage.getByTestId('login-email-input').fill(testConfig.credentials.email);
    await loginPage.getByTestId('login-password-input').fill(testConfig.credentials.password);

    await loginPage.getByTestId('login-submit-button').click();

    await loginPage.waitForURL(`**${testConfig.expectedDefaultRedirect}`, { timeout: 10_000 });

    expect(loginPage.url()).toContain(testConfig.expectedDefaultRedirect);
  });

  test('redirects to returnUrl when query param is present', async ({ loginPage }) => {
    const returnUrl = '/dashboard';

    await loginPage.goto(`/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`);

    await loginPage.getByTestId('login-email-input').fill(testConfig.credentials.email);
    await loginPage.getByTestId('login-password-input').fill(testConfig.credentials.password);

    await loginPage.getByTestId('login-submit-button').click();

    await loginPage.waitForURL(`**${returnUrl}`, { timeout: 10_000 });

    expect(loginPage.url()).toContain(returnUrl);
  });
});
