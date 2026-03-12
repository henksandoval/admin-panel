import { test, expect } from '../../fixtures/pds.fixture';

test.describe('AppToggleGroupComponent on PDS page', () => {
  test('renders toggle group options on the page', async ({ toggleGroupsPage }) => {
    const toggleGroups = await toggleGroupsPage.locator('[data-testid="toggle-group"]').all();
    expect(toggleGroups.length).toBeGreaterThan(0);
  });

  test('selecting a toggle option marks it as active', async ({ toggleGroupsPage }) => {
    const firstToggleGroup = toggleGroupsPage.locator('[data-testid="toggle-group"]').first();
    const firstOption = firstToggleGroup.locator('[data-testid^="toggle-option-"]').first();

    await firstOption.click();

    await expect(firstOption).toHaveClass(/mat-button-toggle-checked/);
  });
});
