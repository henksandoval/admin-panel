import { test, expect } from '../../fixtures/auth.fixture';
import { testConfig } from '../../config/test.config';
import { interceptConfirmPasswordResetWithError } from '../../helpers/auth.helpers';

const VALID_PASSWORD = 'NewPassword123';

test.describe('ResetPasswordComponent — Happy path', () => {
  test('shows success message and go-to-login button after submitting valid passwords', async ({ resetPasswordPage }) => {
    await resetPasswordPage.getByTestId('reset-password-password-input').fill(VALID_PASSWORD);
    await resetPasswordPage.getByTestId('reset-password-confirm-input').fill(VALID_PASSWORD);

    await resetPasswordPage.getByTestId('reset-password-submit-button').click();

    await expect(resetPasswordPage.getByTestId('reset-password-success-message')).toBeVisible({ timeout: 10_000 });
    await expect(resetPasswordPage.getByTestId('reset-password-go-to-login-button')).toBeVisible();
    await expect(resetPasswordPage.getByRole('form')).not.toBeVisible();
  });
});

test.describe('ResetPasswordComponent — Unhappy paths', () => {
  test('shows an invalid-token message when no token is present in the URL', async ({ page }) => {
    await page.goto('/auth/reset-password');

    await expect(page.getByTestId('reset-password-invalid-token-message')).toBeVisible();
    await expect(page.getByRole('form')).not.toBeVisible();
  });

  test('shows an error message when the server rejects the password reset', async ({ page }) => {
    if (testConfig.useMock) {
      await interceptConfirmPasswordResetWithError(page, 400, { message: 'Invalid or expired token' });
    }
    await page.goto(`/auth/reset-password?token=${testConfig.mockErrorTriggers.resetPasswordErrorToken}`);
    await page.getByTestId('reset-password-password-input').fill(VALID_PASSWORD);
    await page.getByTestId('reset-password-confirm-input').fill(VALID_PASSWORD);
    await page.getByTestId('reset-password-submit-button').click();

    await expect(page.getByTestId('reset-password-error-message')).toBeVisible();
    await expect(page.getByRole('form')).toBeVisible();
  });
});
