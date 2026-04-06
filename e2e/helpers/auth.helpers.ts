import { type Page, type Route } from '@playwright/test';
import { testConfig } from '../config/test.config';

// Menu data that matches public/data/menu.json structure
const MOCK_MENU_DATA = [
  {
    "id": "dashboard",
    "label": "Dashboard",
    "icon": "dashboard",
    "requiresAuth": true
  },
  {
    "id": "pds",
    "label": "PDS",
    "icon": "dashboard_customize",
    "requiresAuth": true,
    "roles": ["admin"],
    "children": [
      {
        "id": "pds-index",
        "label": "Index",
        "icon": "home"
      },
      {
        "id": "pds-toggle-groups",
        "label": "Toggle Groups",
        "icon": "view_week"
      }
    ]
  }
];

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

export async function interceptAuthRefresh(page: Page): Promise<void> {
  await page.route('**/auth/refresh', (route: Route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(testConfig.mockResponses.loginToken),
    });
  });
}

export async function interceptAuthLogout(page: Page): Promise<void> {
  await page.route('**/auth/logout', (route: Route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({}),
    });
  });
}

export async function interceptMenuData(page: Page): Promise<void> {
  await page.route('**/data/menu.json', (route: Route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_MENU_DATA),
    });
  });
}

export async function loginAndNavigate(page: Page, path: string): Promise<void> {
  await page.goto('/auth/login');
  await page.getByTestId('login-email-input').fill(testConfig.credentials.email);
  await page.getByTestId('login-password-input').fill(testConfig.credentials.password);
  await page.getByTestId('login-submit-button').click();
  await page.waitForURL(`**${testConfig.expectedDefaultRedirect}`);
  // Navigate to the target path
  await page.goto(path);
  // Wait a brief moment for Angular to initialize
  await page.waitForLoadState('domcontentloaded');
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

