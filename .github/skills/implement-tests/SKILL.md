---
name: "implement-tests"
description: "Implements .spec.ts files from test scenarios following the project's strict black-box testing conventions. Adds missing data-testid attributes to templates as needed."
---

# Implement Tests

## Purpose

Translate test scenarios into production-quality `.spec.ts` files. Every test interacts with the DOM as a user would — never with the component's internal state.

## Instructions

### Step 1 — Gather context

- Find the test scenarios in `docs/specs/{feature-name}.md` (the `## Test Scenarios` section)
- Read the component's `.ts` file to understand its interface
- Read the component's `.html` file to audit `data-testid` coverage
- Check `src/tests/stubs/` for available stubs before creating any

If no test scenarios exist, tell the user to run the `design-tests` skill first.

### Step 2 — Add missing data-testid attributes

Before writing the spec, ensure every element that a test scenario needs to query or interact with has a `data-testid`. Add them to the template now:
- Interactive elements: `data-testid="submit-button"`, `data-testid="cancel-link"`
- Observable elements: `data-testid="error-message"`, `data-testid="loading-spinner"`, `data-testid="empty-state"`
- Content containers: `data-testid="user-list"`, `data-testid="form-title"`

### Step 3 — Write the spec

**Absolute rules — any violation makes the test invalid:**

**Selectors:** Only `screen.getByTestId('...')`. Never `getByText`, `querySelector`, CSS classes, IDs, or element tags.

**Black box:** Never access `fixture.componentInstance`. All interactions via `userEvent`, all assertions via DOM matchers.

**Stubs:** Import from `src/tests/stubs/`. Create new stubs there if needed — never inline in the spec.

**Naming:** All `it()` descriptions in English, specific and behavior-focused. `TC-` prefix is prohibited.

```typescript
import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';

describe('ComponentNameComponent', () => {
  describe('critical path', () => {
    it('displays success message after valid form submission', async () => {
      await render(ComponentNameComponent, {
        imports: [...],
        providers: [...]
      });
      const user = userEvent.setup();

      await user.type(screen.getByTestId('email-input'), 'user@example.com');
      await user.click(screen.getByTestId('submit-button'));

      expect(screen.getByTestId('success-message')).toBeInTheDocument();
    });
  });

  describe('error states', () => {
    it('shows validation error when email format is invalid', async () => {
      // ...
    });
  });
});
```

### Step 4 — Run and verify

```bash
npm test -- --run --reporter=verbose
```

If tests fail because the component is not yet implemented, that is expected — the tests are written first (TDD). If they fail for unexpected reasons (wrong selector, setup error), fix the spec.

Report the outcome clearly: which tests pass, which are pending (component not yet built), which failed unexpectedly.
