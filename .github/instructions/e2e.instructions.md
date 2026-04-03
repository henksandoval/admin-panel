---
name: 'E2E Playwright Rules'
description: 'Playwright E2E testing conventions for this Angular app. Use when writing or reviewing E2E tests. Covers centralized config, fixture reuse, explicit waits (no waitForTimeout), and data-testid selectors.'
applyTo: "e2e/**/*.spec.ts"
---

# E2E — Playwright Rules

## Centralized Configuration

Hardcoding URLs, credentials, or timeouts in `.spec.ts` files is prohibited. All configuration lives in `e2e/config/test.config.ts`.

```typescript
// ❌ Bad
await page.goto('http://localhost:4200/auth/login');
await page.fill('[name="email"]', 'admin@test.com');

// ✅ Good
import { testConfig } from '../../config/test.config';
await page.goto(testConfig.routes.login);
await loginPage.getByTestId('email-input').fill(testConfig.credentials.email);
```

## Fixtures

Reuse fixtures from `e2e/fixtures/` for setup and teardown. Do not repeat navigation or authentication logic across spec files.

```typescript
import { test } from '../../fixtures/auth.fixture';

test('redirects to dashboard after login', async ({ loginPage }) => { });
```

## Explicit Waits

Use `waitForURL` or `waitForSelector`. `waitForTimeout()` is prohibited.

```typescript
// ❌ Bad
await page.waitForTimeout(2000);

// ✅ Good
await page.waitForURL(`**${testConfig.routes.dashboard}`);
await page.waitForSelector('[data-testid="dashboard-header"]');
```

## Selectors

Always use `getByTestId()`. Same rule as component tests.

```typescript
await loginPage.getByTestId('email-input').fill(testConfig.credentials.email);
await loginPage.getByTestId('submit-button').click();
```

## `test()` Naming

Descriptive in English. `TC-` prefixes are prohibited.

```typescript
// ❌ Bad
test('TC-01 login test', async () => { });

// ✅ Good
test('redirects to default route after successful login', async () => { });
```
