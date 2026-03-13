import { test, expect } from '../../fixtures/pds.fixture';

test.describe('AppFormInputComponent on PDS form page', () => {
  test('accepts typed text and reflects it as input value', async ({ formPage }) => {
    const emailInput = formPage.getByTestId('pds-form-email-input');

    await emailInput.fill('user@example.com');

    await expect(emailInput).toHaveValue('user@example.com');
  });

  test('shows a validation error after the email field is blurred with an invalid value', async ({ formPage }) => {
    const emailInput = formPage.getByTestId('pds-form-email-input');

    await emailInput.fill('not-an-email');
    await emailInput.blur();

    await expect(formPage.getByTestId('pds-form-email-input-error')).toBeVisible();
  });

  test('does not show a validation error before the email field is touched', async ({ formPage }) => {
    await expect(formPage.getByTestId('pds-form-email-input-error')).not.toBeAttached();
  });

  test('password field has type password by default', async ({ formPage }) => {
    await expect(formPage.getByTestId('pds-form-password-input')).toHaveAttribute('type', 'password');
  });
});
