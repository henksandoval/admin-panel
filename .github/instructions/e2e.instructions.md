---
applyTo: "e2e/**/*.spec.ts"
---

# E2E — Playwright Rules

## Centralized Configuration

Hardcoding URLs, credentials, or timeouts in `.spec.ts` files is prohibited. All configuration lives in `e2e/config/test.config.ts`.

```typescript
// ❌ MAL
await page.goto('http://localhost:4200/auth/login');
await page.fill('[name="email"]', 'admin@test.com');

// ✅ BIEN
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
// ❌ MAL
await page.waitForTimeout(2000);

// ✅ BIEN
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
// ❌ MAL
test('TC-01 login test', async () => { });

// ✅ BIEN
test('redirects to default route after successful login', async () => { });
```
