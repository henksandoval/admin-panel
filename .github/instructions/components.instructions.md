---
name: 'Component Conventions'
description: 'Angular component structure rules for this project. Use when creating or modifying Angular components. Covers the 5-file pattern, signal inputs with COMPONENT_DEFAULTS, computed classes, no CVA, data-testid, and i18n with $localize.'
applyTo: "src/**/*.{component.ts,component.html,component.scss,model.ts}"
---

# Component Conventions

## Required Files per Component

Every component must have exactly these files — no exceptions, even for small components:

```
{name}.component.ts
{name}.component.html
{name}.component.scss
{name}.component.spec.ts
{name}.model.ts
```

> **Why:** Co-locating all related files (logic, template, styles, tests, model) makes each component a self-contained unit. A developer can open one folder and find everything they need. The `.model.ts` file also prevents magic values from being scattered inline — all defaults and types live in one predictable place.

## model.ts Pattern

```typescript
export const COMPONENT_DEFAULTS = {
  size: 'medium',
  disabled: false,
} as const;
```

## component.ts Patterns

```typescript
// Inputs with defaults from model
readonly size = input<Size>(COMPONENT_DEFAULTS.size);

// Template-only members → protected
protected readonly classes = computed(() => ({
  'app-name--active': this.active(),
}));
```

### Computed Signals for Dynamic Classes

Use `computed()` for dynamic classes. Never use methods (they re-evaluate on every change detection cycle).

> **Why:** A method call in a template is invoked on every change detection pass, even when its inputs haven't changed. A `computed()` signal memoizes the result and only recalculates when its dependencies change, giving Angular's OnPush strategy maximum efficiency.

```typescript
// ❌
getClasses() { return { 'app-btn--active': this.active() }; }

// ✅
protected readonly classes = computed(() => ({ 'app-btn--active': this.active() }));
```

### Member Visibility

Members used only by the template must be `protected`, not `public`.

```typescript
// ❌
isLoading = signal(false);

// ✅
protected isLoading = signal(false);
```

Exception: members accessed from tests or parent components must remain `public`.

## Forms

Use `control = input.required<FormControl>()`. Never implement `ControlValueAccessor`.

> **Why:** CVA requires implementing 4 interface methods plus change-detection wiring — significant boilerplate for no added value in this project. Angular 17+ signal inputs allow parent components to pass a `FormControl` directly, keeping form components thin and predictable without a custom value accessor layer.

```typescript
// ✅
control = input.required<FormControl>();

// ❌
implements ControlValueAccessor
```

## data-testid in Templates

All interactive elements and key content areas **must have `data-testid` attributes**.

```html
<button data-testid="submit-button" (click)="onSubmit()">{{ label }}</button>
<div data-testid="error-message" *ngIf="hasError">{{ errorText }}</div>
<input data-testid="email-input" [formControl]="emailControl" />
```

## i18n

All user-visible strings must use `$localize` with an `@@` ID. Never hardcode UI strings.

```typescript
// ✅
$localize`:@@component.submit:Submit`

// ❌
'Submit'
```

## PDS Wrappers

Use PDS wrappers (`app-button`, `app-card`, etc.) over raw Material components when they exist. Check `ui-kit/` first.

## Code Style

- Functional code (`filter`, `map`) over imperative loops
- All code in English — variables, functions, classes, comments
- No comments that describe what the code does. Rename if the name is not self-describing

---

## Related Instructions

- [Styling Rules](./styling.instructions.md) — CSS class naming prefix (`app-{component-name}-`) and forbidden Tailwind utilities
- [Testing Standards](./testing.instructions.md) — how to test this component using `data-testid` and black-box patterns
- [Architectural Principles](./architectural-principles.instructions.md) — where to place this component and which dependencies are allowed

