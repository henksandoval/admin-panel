import { test, expect } from '../../fixtures/permissions.fixture';

test.describe('Permission directives on dashboard', () => {
  test('renders write-action section when user has write permission', async ({ dashboardPage }) => {
    await expect(dashboardPage.getByTestId('dashboard-write-action')).toBeVisible();
  });

  test('removes delete-action section from DOM when user lacks delete permission', async ({ dashboardPage }) => {
    await expect(dashboardPage.getByTestId('dashboard-delete-action')).not.toBeAttached();
  });

  test('renders admin-panel section when user has admin role', async ({ dashboardPage }) => {
    await expect(dashboardPage.getByTestId('dashboard-admin-panel')).toBeVisible();
  });

  test('removes superadmin-panel section from DOM when user lacks superadmin role', async ({ dashboardPage }) => {
    await expect(dashboardPage.getByTestId('dashboard-superadmin-panel')).not.toBeAttached();
  });
});
