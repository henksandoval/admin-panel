import { expect, test } from '../../fixtures/errors.fixture';
import { testConfig } from '../../config/test.config';

test.describe('In-shell error pages', () => {
  test('unknown URL is redirected to the not-found page inside the shell', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/this-route-does-not-exist');
    await authenticatedPage.waitForURL(`**${testConfig.errorRoutes.notFound}`);

    await expect(authenticatedPage.getByTestId('layout-shell')).toBeVisible();
    await expect(authenticatedPage.getByTestId('not-found-page')).toBeVisible();
  });

  test('in-shell error pages render within the layout and show a return-to-dashboard CTA', async ({ authenticatedPage }) => {
    await authenticatedPage.goto(testConfig.errorRoutes.notFound);
    await authenticatedPage.waitForURL(`**${testConfig.errorRoutes.notFound}`);

    await expect(authenticatedPage.getByTestId('layout-shell')).toBeVisible();
    await expect(authenticatedPage.getByTestId('not-found-page')).toBeVisible();
    await expect(authenticatedPage.getByTestId('not-found-page-cta')).toBeVisible();
  });

  test('unauthorized page renders within the layout and shows a return-to-dashboard CTA', async ({ authenticatedPage }) => {
    await authenticatedPage.goto(testConfig.errorRoutes.unauthorized);

    await expect(authenticatedPage.getByTestId('layout-shell')).toBeVisible();
    await expect(authenticatedPage.getByTestId('unauthorized-page')).toBeVisible();
    await expect(authenticatedPage.getByTestId('unauthorized-page-cta')).toBeVisible();
  });

  test('server-error page renders within the layout and shows a return-to-dashboard CTA', async ({ authenticatedPage }) => {
    await authenticatedPage.goto(testConfig.errorRoutes.serverError);

    await expect(authenticatedPage.getByTestId('layout-shell')).toBeVisible();
    await expect(authenticatedPage.getByTestId('server-error-page')).toBeVisible();
    await expect(authenticatedPage.getByTestId('server-error-page-cta')).toBeVisible();
  });
});

test.describe('Critical error pages', () => {
  test('session-expired renders outside the shell and CTA redirects to login', async ({ page }) => {
    await page.goto(testConfig.errorRoutes.sessionExpired);
    await page.waitForSelector('[data-testid="session-expired-page"]');

    await expect(page.getByTestId('layout-shell')).not.toBeVisible();
    await expect(page.getByTestId('session-expired-page')).toBeVisible();

    await page.getByTestId('session-expired-page-cta').click();
    await page.waitForURL('**/auth/login');

    expect(page.url()).toContain('/auth/login');
  });

  test('system-down renders outside the shell and shows a retry button', async ({ page }) => {
    await page.goto(testConfig.errorRoutes.systemDown);
    await page.waitForSelector('[data-testid="system-down-page"]');

    await expect(page.getByTestId('layout-shell')).not.toBeVisible();
    await expect(page.getByTestId('system-down-page')).toBeVisible();
    await expect(page.getByTestId('system-down-page-cta')).toBeVisible();
  });

  test('access-denied renders outside the shell and CTA redirects to login', async ({ page }) => {
    await page.goto(testConfig.errorRoutes.accessDenied);

    await expect(page.getByTestId('layout-shell')).not.toBeVisible();
    await expect(page.getByTestId('access-denied-page')).toBeVisible();
    await expect(page.getByTestId('access-denied-page-cta')).toBeVisible();
  });
});
