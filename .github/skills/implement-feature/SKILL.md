---
name: "implement-feature"
description: "Implements a feature or component following all project conventions. Reads the spec, finds the closest existing analog, creates all required files, and validates with lint and tests."
---

# Implement Feature

## Purpose

Build a feature or component that is correct, idiomatic, and compliant with every project rule. The implementation is done when lint passes and tests pass — not before.

## Instructions

### Step 1 — Read the spec

Find `docs/specs/{feature-name}.md`. If it doesn't exist, use the `clarify-requirements` skill first.

If test files already exist for this feature, read them — they are the acceptance criteria.

### Step 2 — Pre-implementation research

Before writing code:

1. **Find the closest existing analog** in the codebase. Read all its files (`.ts`, `.html`, `.scss`, `.model.ts`). This is your reference implementation — follow its patterns exactly.

2. **Check for PDS wrappers** in `src/app/ui-kit/` before using Material components directly (`app-button`, `app-card`, `app-form-input`, etc.).

3. **Identify reusable services** in `src/app/core/` — inject them instead of reimplementing.

4. **Check stubs** in `src/tests/stubs/` if you will be writing tests too.

### Step 3 — Create files in this exact order

1. **`{name}.model.ts`** — always first
   ```typescript
   export const COMPONENT_DEFAULTS = {
     size: 'medium',
     disabled: false,
   } as const;
   ```

2. **`{name}.component.ts`**
   ```typescript
   @Component({ standalone: true, changeDetection: ChangeDetectionStrategy.OnPush, ... })
   export class NameComponent {
     readonly size = input<Size>(COMPONENT_DEFAULTS.size);
     protected readonly classes = computed(() => ({
       'app-name--large': this.size() === 'large',
     }));
   }
   ```

3. **`{name}.component.html`** — add `data-testid` on every interactive and observable element

4. **`{name}.component.scss`** — all classes prefixed `app-{name}-`

5. **Register the component** in its parent (route, parent component imports array, etc.)

### Step 4 — Apply conventions checklist

Before running validation, verify:
- [ ] No Tailwind color/typography classes (`bg-*`, `text-{color}-*`, `font-*`, `dark:*`, `text-sm`)
- [ ] `DEFAULTS` exported from `.model.ts`
- [ ] All CSS classes prefixed `app-{component-name}-`
- [ ] All user-visible strings use `$localize` with `@@` IDs
- [ ] Dynamic classes use `computed()`, never methods
- [ ] Forms use `control = input.required<FormControl>()`, not CVA
- [ ] Template-only members are `protected`
- [ ] PDS wrappers used where available
- [ ] `data-testid` on all interactive and observable elements
- [ ] `ChangeDetectionStrategy.OnPush` on all components

### Step 5 — Validate

Run in this exact order, fix every error before moving to the next:

```bash
npm run lint
npm test -- --run
```

Do not ask the user to run these. Run them yourself, read the output, and fix what breaks.

### Output

Report:
- Files created and their paths
- Lint result (must be clean)
- Test result (must pass, or clearly explain why tests are pending)
