import { test, expect } from '../../fixtures/pds.fixture';

test.describe('AppFormDatepickerComponent on PDS form page', () => {
  test('renders the datepicker toggle button', async ({ datepickerPage }) => {
    await expect(datepickerPage.getByTestId('datepicker-toggle')).toBeVisible();
  });

  test('opens the calendar overlay when the toggle button is clicked', async ({ datepickerPage }) => {
    await datepickerPage.getByTestId('datepicker-toggle').locator('button').click();

    await datepickerPage.waitForSelector('[aria-label="Choose date"]');

    await expect(datepickerPage.locator('[aria-label="Choose date"]')).toBeVisible();
  });

  test('renders the birth date datepicker input field', async ({ datepickerPage }) => {
    await expect(datepickerPage.getByTestId('birth-date-input')).toBeVisible();
  });
});
