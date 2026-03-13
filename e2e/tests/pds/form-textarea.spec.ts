import { test, expect } from '../../fixtures/pds.fixture';

test.describe('AppFormTextareaComponent on PDS form page', () => {
  test('renders the description textarea', async ({ formPage }) => {
    await expect(formPage.getByTestId('pds-form-description')).toBeVisible();
  });

  test('accepts text input and reflects it in the textarea', async ({ formPage }) => {
    const textarea = formPage.getByTestId('pds-form-description');

    await textarea.fill('Testing the textarea input');

    await expect(textarea).toHaveValue('Testing the textarea input');
  });

  test('shows a validation error after blurring the required textarea without input', async ({ formPage }) => {
    const textarea = formPage.getByTestId('pds-form-description');

    await textarea.click();
    await textarea.press('Tab');

    await formPage.waitForSelector('[data-testid="pds-form-description-error"]');
    await expect(formPage.getByTestId('pds-form-description-error')).toBeVisible();
  });

  test('clears the validation error when valid text is entered', async ({ formPage }) => {
    const textarea = formPage.getByTestId('pds-form-description');

    await textarea.click();
    await textarea.press('Tab');
    await formPage.waitForSelector('[data-testid="pds-form-description-error"]');

    await textarea.fill('This is a valid description with enough characters');
    await textarea.press('Tab');

    await expect(formPage.getByTestId('pds-form-description-error')).not.toBeVisible();
  });
});
