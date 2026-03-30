import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Forgot password — successful submission shows confirmation', () => {
  test('hides the form and shows the success message after submitting a valid email', async ({ forgotPasswordPage }) => {
    await forgotPasswordPage.getByTestId('forgot-password-email-input').fill('user@example.com');

    await forgotPasswordPage.getByTestId('forgot-password-submit-button').click();

    await expect(forgotPasswordPage.getByTestId('forgot-password-success-message')).toBeVisible({ timeout: 10_000 });
    await expect(forgotPasswordPage.getByTestId('forgot-password-form')).not.toBeVisible();
  });
});
