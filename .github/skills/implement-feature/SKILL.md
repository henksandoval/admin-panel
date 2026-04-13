---
name: "implement-feature"
description: "Implements a feature or component following all project conventions. Reads the approved pipeline artifacts or explicit spec, finds the closest existing analog, creates all required files, and validates with lint, tests, and build."
---

# Implement Feature

## Purpose

Build a feature or component that is correct, idiomatic, and compliant with every project rule. The implementation is done only when lint, tests, and build are all clean.

## Instructions

### Step 1 — Determine the working mode

For this repository, prefer the pipeline inputs when they exist:

- `agent-workspace/{issue-number}/design-decision.md`
- `agent-workspace/{issue-number}/test-cases.md`
- existing `.spec.ts` files created in the RED phase

If no pipeline artifacts exist, use the explicit spec or requirements provided by the user. If no reliable spec exists, run the `clarify-requirements` skill first.

### Step 2 — Pre-implementation research

Before writing code:

1. Find the closest existing analog in the codebase and read all of its relevant files
2. Check `src/app/ui-kit/` for PDS wrappers before using raw Material components
3. Reuse existing services and models from `src/app/core/` when appropriate
4. Inspect `src/tests/stubs/` if the implementation touches test setup

### Step 3 — Implement to the approved contract

Use the design decision as the technical contract and the approved tests as the executable contract.

Rules:

- do not redesign the feature while implementing it,
- do not modify approved tests unless a higher-level escalation explicitly changes them,
- document any unavoidable deviation in `dev-decisions.md`.

### Step 4 — Apply the conventions checklist

Before validation, confirm:

- no forbidden Tailwind color or typography classes,
- defaults live in `.model.ts`,
- CSS classes use the `app-{component-name}-` prefix,
- user-visible strings use `$localize` with `@@` IDs,
- dynamic classes use `computed()`,
- form components use `control = input.required<FormControl>()`,
- template-only members are `protected`,
- `data-testid` exists on interactive and observable elements,
- `ChangeDetectionStrategy.OnPush` is present where required.

### Step 5 — Validate in repository order

Run in this exact order:

```bash
npm run lint
npm run test -- --run
npm run build
```

Fix every error before moving to the next command.

### Output

Report:

- files created or modified,
- lint result,
- test result,
- build result.
