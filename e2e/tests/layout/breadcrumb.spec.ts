import { expect, test } from '../../fixtures/layout.fixture';

test.describe('AppBreadCrumbComponent on layout pages', () => {
  test('renders breadcrumb pills when navigating to a nested page', async ({ breadcrumbPage }) => {
    const pills = breadcrumbPage.locator('[data-testid="bread-crumb-pill"]');

    await expect(pills.first()).toBeVisible();
  });

  test('renders separators between breadcrumb items', async ({ breadcrumbPage }) => {
    const pills = breadcrumbPage.locator('[data-testid="bread-crumb-pill"]');
    const separators = breadcrumbPage.locator('[data-testid="bread-crumb-separator"]');
    const pillCount = await pills.count();

    await expect(separators).toHaveCount(pillCount - 1);
  });

  test('marks the last breadcrumb pill with the no-route class', async ({ breadcrumbPage }) => {
    const pills = breadcrumbPage.locator('[data-testid="bread-crumb-pill"]');
    const lastPill = pills.last();

    await expect(lastPill).toHaveClass(/no-route/);
  });

  test('navigates to the parent route when clicking a navigable breadcrumb pill', async ({ breadcrumbPage }) => {
    const pills = breadcrumbPage.locator('[data-testid="bread-crumb-pill"]');

    await expect(pills.nth(1)).toBeVisible();

    const initialUrl = breadcrumbPage.url();

    await pills.first().click();

    await breadcrumbPage.waitForSelector('[data-testid="bread-crumb-pill"]');
    await expect(breadcrumbPage).not.toHaveURL(initialUrl);
  });
});
