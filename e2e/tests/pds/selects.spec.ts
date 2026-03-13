import { test, expect } from '../../fixtures/pds.fixture';

test.describe('AppFormSelectComponent on PDS page', () => {
  test('renders the select control on the selects page', async ({ selectsPage }) => {
    await expect(selectsPage.getByTestId('form-select-control')).toBeVisible();
  });

  test('opens the dropdown panel when the select is clicked', async ({ selectsPage }) => {
    await selectsPage.getByTestId('form-select-control').click();

    await selectsPage.waitForSelector('[role="listbox"]');

    await expect(selectsPage.locator('[role="listbox"]')).toBeVisible();
  });

  test('displays the selected country label in the trigger after selection', async ({ selectsPage }) => {
    await selectsPage.getByTestId('form-select-control').click();
    await selectsPage.waitForSelector('[role="listbox"]');

    await selectsPage.getByRole('option', { name: 'United States' }).click();

    await expect(selectsPage.getByTestId('form-select-control')).toContainText('United States');
  });

  test('switches to multiple selection mode when the Multiple toggle is activated', async ({ selectsPage }) => {
    await selectsPage.getByTestId('toggle-option-multiple').click();
    await selectsPage.waitForSelector('[data-testid="form-select-control"]');

    await selectsPage.getByTestId('form-select-control').click();
    await selectsPage.waitForSelector('[role="listbox"]');

    await expect(selectsPage.locator('[role="listbox"]')).toHaveAttribute('aria-multiselectable', 'true');
  });

  test('shows grouped options when the Grouped toggle is activated', async ({ selectsPage }) => {
    await selectsPage.getByTestId('toggle-option-grouped').click();
    await selectsPage.waitForSelector('[data-testid="form-select-control"]');

    await selectsPage.getByTestId('form-select-control').click();
    await selectsPage.waitForSelector('[role="group"]');

    const groups = selectsPage.locator('[role="group"]');
    await expect(groups).toHaveCount(3);
  });

  test('shows the select as disabled when the Disabled toggle is activated', async ({ selectsPage }) => {
    await selectsPage.getByTestId('toggle-option-disabled').click();
    await selectsPage.waitForSelector('[data-testid="form-select-control"]');

    await expect(selectsPage.getByTestId('form-select-control')).toHaveAttribute('aria-disabled', 'true');
  });
});
