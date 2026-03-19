import { test, expect } from '../../fixtures/permissions.fixture';

test.describe('Permission directives on dashboard', () => {
  test('shows write-permission element when user has write permission', async ({ writePermissionDashboard }) => {
    await expect(writePermissionDashboard.getByTestId('dashboard-write-action')).toBeVisible();
  });

  test('shows admin-role element when user has admin role', async ({ writePermissionDashboard }) => {
    await expect(writePermissionDashboard.getByTestId('dashboard-admin-panel')).toBeVisible();
  });

  test('hides write-permission element when user lacks write permission', async ({ readOnlyDashboard }) => {
    await expect(readOnlyDashboard.getByTestId('dashboard-write-action')).not.toBeVisible();
  });

  test('hides admin-role element when user lacks admin role', async ({ readOnlyDashboard }) => {
    await expect(readOnlyDashboard.getByTestId('dashboard-admin-panel')).not.toBeVisible();
  });
});
