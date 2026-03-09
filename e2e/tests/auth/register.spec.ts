import { test, expect } from '../../fixtures/auth.fixture';
import { testConfig } from '../../config/test.config';

test.describe('Registration flow', () => {
  test('redirects to login page after successful registration', async ({ registerPage }) => {
    const { displayName, email, password } = testConfig.registerCredentials;

    await registerPage.getByTestId('register-name-input').fill(displayName);
    await registerPage.getByTestId('register-email-input').fill(email);
    await registerPage.getByTestId('register-password-input').fill(password);
    await registerPage.getByTestId('register-confirm-input').fill(password);

    await registerPage.getByTestId('register-submit-button').click();

    await registerPage.waitForURL('**/auth/login', { timeout: 10_000 });

    expect(registerPage.url()).toContain('/auth/login');
  });
});
