import { test, expect } from '../../fixtures/auth.fixture';
import { testConfig } from '../../config/test.config';
import { interceptAuthRegisterWithError } from '../../helpers/auth.helpers';

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

test.describe('Registration — unhappy paths', () => {
  test('shows an error message when the email address is already registered', async ({ page }) => {
    const { displayName, password } = testConfig.registerCredentials;

    if (testConfig.useMock) {
      await interceptAuthRegisterWithError(page, 409, { message: 'Email already in use' });
    }
    await page.goto('/auth/register');
    await page.getByTestId('register-name-input').fill(displayName);
    await page.getByTestId('register-email-input').fill(testConfig.mockErrorTriggers.registerFailEmail);
    await page.getByTestId('register-password-input').fill(password);
    await page.getByTestId('register-confirm-input').fill(password);
    await page.getByTestId('register-submit-button').click();

    await expect(page.getByTestId('register-error-message')).toBeVisible();
  });

  test('shows a validation error when a required field is left empty and blurred', async ({ page }) => {
    await page.goto('/auth/register');

    await page.getByTestId('register-name-input').click();
    await page.getByTestId('register-email-input').click();

    await expect(page.getByTestId('register-name-input-error')).toBeVisible();
  });
});
