import { test, expect } from '../../fixtures/pds.fixture';

test.describe('AppFormRadioGroupComponent on PDS page', () => {
  test('renders radio options on the radios PDS page', async ({ radioGroupsPage }) => {
    const radioOptions = await radioGroupsPage.locator('[data-testid^="radio-option-"]').all();
    expect(radioOptions.length).toBeGreaterThan(0);
  });

  test('selecting a radio option marks it as checked', async ({ radioGroupsPage }) => {
    const secondOption = radioGroupsPage.locator('[data-testid^="radio-option-"]').nth(1);
    await secondOption.locator('input[type="radio"]').click();

    await expect(secondOption.locator('input[type="radio"]')).toBeChecked();
  });

  test('renders the radio group label when configured', async ({ radioGroupsPage }) => {
    await expect(radioGroupsPage.getByTestId('radio-group-label')).toBeVisible();
  });

  test('disabled state renders all radio options as non-interactive', async ({ radioGroupsPage }) => {
    await radioGroupsPage.locator('mat-button-toggle', { hasText: 'Disabled' }).click();
    await radioGroupsPage.waitForSelector('[data-testid="radio-group-wrapper"]');

    const radioInputs = await radioGroupsPage.locator('[data-testid^="radio-option-"] input[type="radio"]').all();
    for (const input of radioInputs) {
      await expect(input).toBeDisabled();
    }
  });
});
