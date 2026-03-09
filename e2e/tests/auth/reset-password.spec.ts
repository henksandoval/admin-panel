import { test, expect } from '../../fixtures/auth.fixture';

const VALID_PASSWORD = 'NewPassword123';
const SUCCESS_MESSAGE_TIMEOUT_MS = 10_000;

test.describe('ResetPasswordComponent — Happy path', () => {
  test('shows success message and go-to-login button after submitting valid passwords', async ({ resetPasswordPage }) => {
    await resetPasswordPage.getByTestId('reset-password-password-input').fill(VALID_PASSWORD);
    await resetPasswordPage.getByTestId('reset-password-confirm-input').fill(VALID_PASSWORD);

    await resetPasswordPage.getByTestId('reset-password-submit-button').click();

    await resetPasswordPage.waitForSelector('[data-testid="reset-password-success-message"]', { timeout: SUCCESS_MESSAGE_TIMEOUT_MS });

    expect(await resetPasswordPage.getByTestId('reset-password-success-message').isVisible()).toBe(true);
    expect(await resetPasswordPage.getByTestId('reset-password-go-to-login-button').isVisible()).toBe(true);
    expect(await resetPasswordPage.getByRole('form').isVisible()).toBe(false);
  });
});
