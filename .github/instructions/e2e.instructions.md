---
name: 'E2E Playwright Rules'
description: 'Playwright E2E testing conventions for this Angular app. Use when writing or reviewing E2E tests. Covers centralized config, fixture reuse, explicit waits (no waitForTimeout), and data-testid selectors.'
applyTo: "e2e/**/*.spec.ts"
---

# E2E — Playwright Rules

## Centralized Configuration

Hardcoding URLs, credentials, or timeouts in `.spec.ts` files is prohibited. All configuration lives in `e2e/config/test.config.ts`.

> **Why:** Hardcoded values scatter environment-specific configuration across dozens of files. When a URL, port, or credential changes (e.g., staging vs. CI), a single change to `test.config.ts` propagates everywhere instead of requiring a search-and-replace across the whole test suite.

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

> **Why:** Auth and navigation flows repeated in each spec become a maintenance burden when the login page changes. Fixtures are the single point of change, and they make individual tests shorter and focused on their actual scenario rather than on setup boilerplate.

```typescript
import { test } from '../../fixtures/auth.fixture';

test('redirects to dashboard after login', async ({ loginPage }) => { });
```

## Explicit Waits

Use `waitForURL` or `waitForSelector`. `waitForTimeout()` is prohibited.

> **Why:** `waitForTimeout` introduces arbitrary delays that either waste time on fast machines or cause flakiness on slow CI runners. Event-driven waits (`waitForURL`, `waitForSelector`) resolve as soon as the condition is met, making tests both faster and reliable across environments.

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

---

## Related Instructions

- [Testing Standards](./testing.instructions.md) — same `data-testid` selectors and naming rules apply to unit tests

