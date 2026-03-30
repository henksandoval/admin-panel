import { type Page, type Route } from '@playwright/test';
import { testConfig } from '../config/test.config';

export async function interceptAuthLogin(page: Page): Promise<void> {
  await page.route(`${testConfig.apiBaseUrl}/auth/login`, (route: Route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(testConfig.mockResponses.loginToken),
    });
  });
}

export async function interceptAuthMe(page: Page): Promise<void> {
  await page.route(`${testConfig.apiBaseUrl}/auth/me`, (route: Route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(testConfig.mockResponses.user),
    });
  });
}

export async function loginAndNavigate(page: Page, path: string): Promise<void> {
  await page.goto('/auth/login');
  await page.getByTestId('login-email-input').fill(testConfig.credentials.email);
  await page.getByTestId('login-password-input').fill(testConfig.credentials.password);
  await page.getByTestId('login-submit-button').click();
  await page.waitForURL(`**${testConfig.expectedDefaultRedirect}`);
  await page.goto(path);
}

export async function interceptAuthLoginWithError(
  page: Page,
  status: number,
  body: Record<string, unknown>,
): Promise<void> {
  await page.route(`${testConfig.apiBaseUrl}/auth/login`, (route: Route) => {
    route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  });
}

export async function interceptAuthRegisterWithError(
  page: Page,
  status: number,
  body: Record<string, unknown>,
): Promise<void> {
  await page.route(`${testConfig.apiBaseUrl}/auth/register`, (route: Route) => {
    route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  });
}

export async function interceptConfirmPasswordResetWithError(
  page: Page,
  status: number,
  body: Record<string, unknown>,
): Promise<void> {
  await page.route(`${testConfig.apiBaseUrl}/auth/password-reset/confirm`, (route: Route) => {
    route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  });
}

