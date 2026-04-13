---
name: "implement-tests"
description: "Implements .spec.ts files from approved test-cases.md following the project's strict black-box testing conventions. Adds missing data-testid attributes to templates as needed."
---

# Implement Tests

## Purpose

Translate approved `test-cases.md` scenarios into executable `.spec.ts` files that fail for the right reason: missing implementation, not broken test code.

## Instructions

### Step 1 — Gather pipeline context

Read:

1. `agent-workspace/{issue-number}/test-cases.md`
2. `agent-workspace/{issue-number}/design-decision.md`
3. `.github/instructions/testing.instructions.md`
4. `src/tests/stubs/`

If `test-cases.md` does not exist, stop and tell the user to run the `design-tests` skill first.

### Step 2 — Add missing `data-testid` coverage

Use the "Elementos UI observables" section of `design-decision.md` to determine which UI elements need stable selectors.

Before writing tests:

- add `data-testid` to every interactive element the scenario touches,
- add `data-testid` to every observable message, loading state, or content region the assertions need,
- keep naming consistent with the project's testing instructions.

### Step 3 — Write the specs

Absolute rules:

- Use `screen.getByTestId(...)` / `queryByTestId(...)` selectors only
- Never access `fixture.componentInstance`
- Reuse stubs from `src/tests/stubs/` before creating new ones
- Keep every `it()` description in English and behavior-focused
- Make the new tests compile cleanly before checking RED behavior

### Step 4 — Verify RED state

Run:

```bash
npm run test -- --run
```

All new tests must fail by assertion. If any new test fails because of compilation, setup, or selector mistakes, fix the test first.

### Step 5 — Write `test-implementation-report.md`

Write `agent-workspace/{issue-number}/test-implementation-report.md` in Spanish using `agent-workspace/templates/test-implementation-report.template.md`.

Keep code identifiers, file paths, `data-testid` values, and `it()` descriptions in English.

### Output

Report:

- the spec files created or updated,
- the number of tests failing by assertion,
- any `data-testid` values introduced in templates.
