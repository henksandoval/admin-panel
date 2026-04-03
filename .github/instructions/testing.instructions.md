---
name: 'Testing Standards'
description: 'Black-box testing conventions for Angular components using Vitest and @testing-library/angular. Use when writing, reviewing, or debugging spec files. Covers data-testid selectors, stub reuse, and it() naming.'
applyTo: "src/**/*.spec.ts"
---

# Testing — Component & Integration Tests

## Black Box Philosophy

Tests verify observable behavior, not internal implementation. Accessing `fixture.componentInstance` to read state or invoke methods is prohibited.

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

```typescript
// ❌ Bad
screen.getByText('Guardar');
container.querySelector('.submit-btn');

// ✅ Good
screen.getByTestId('submit-button');
```

## Reusable Stubs

Check `src/tests/stubs/` before creating a local stub or mock. Do not duplicate stubs across test files.

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
