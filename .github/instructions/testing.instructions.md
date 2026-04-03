---
name: 'Testing Standards'
description: 'Black-box testing conventions for Angular components using Vitest and @testing-library/angular. Use when writing, reviewing, or debugging spec files. Covers data-testid selectors, stub reuse, and it() naming.'
applyTo: "src/**/*.spec.ts"
---

# Testing — Component & Integration Tests

## Black Box Philosophy

Tests verify observable behavior, not internal implementation. Accessing `fixture.componentInstance` to read state or invoke methods is prohibited.

> **Why:** Tests that reach into component internals couple to implementation details. When the internal structure changes (rename, refactor, signal→computed), tests break even if the visible behavior is unchanged. DOM-based tests survive refactors and prove what the user actually experiences.

```typescript
// ❌ Bad
component.submitForm();
expect(component.isLoading).toBe(true);

// ✅ Good
await user.click(screen.getByTestId('submit-button'));
expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
```

## Selectors

The only valid selector is `data-testid`. Never use CSS classes, IDs, or visible text. If the template does not have `data-testid`, add it before writing the test.

> **Why:** CSS classes and IDs are styling/structure concerns that change frequently. Visible text breaks when copy changes or translations are added. `data-testid` is an explicit, stable contract between the template and its tests — it communicates intent and survives style and copy changes.

```typescript
// ❌ Bad
screen.getByText('Guardar');
container.querySelector('.submit-btn');

// ✅ Good
screen.getByTestId('submit-button');
```

## Reusable Stubs

Check `src/tests/stubs/` before creating a local stub or mock. Do not duplicate stubs across test files.

> **Why:** Duplicate stubs diverge over time — one gets updated, others do not. A single shared stub is the contract for how that dependency behaves in tests across the entire project.

```typescript
import { MatIconStub } from '@stubs/material/mat-icon.stub';
```

## `it()` Naming

Descriptive in English. `TC-` prefixes are prohibited.

```typescript
// ❌ Bad
it('TC-01 login', () => { });
it('muestra error', () => { });

// ✅ Good
it('shows error message when credentials are invalid', () => { });
it('redirects to dashboard after successful login', () => { });
```

## Component Visibility

When modifying a `.ts` file as part of a test, declare members used exclusively by the template as `protected`, not `public`.

```typescript
// ❌ Bad
isLoading = signal(false);
handleSubmit() { }

// ✅ Good
protected isLoading = signal(false);
protected handleSubmit() { }
```

Exception: members accessed from tests or parent components must remain `public`.

---

## Related Instructions

- [Component Conventions](./components.instructions.md) — components must declare `data-testid` on all interactive elements before tests can be written
- [E2E Playwright Rules](./e2e.instructions.md) — same `data-testid` and naming conventions apply to Playwright tests

