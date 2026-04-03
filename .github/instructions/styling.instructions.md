---
name: 'Styling Rules'
description: 'CSS/SCSS conventions enforcing Material Design tokens for color and typography, and Tailwind utilities for layout only. Use when editing component styles, templates, or SCSS files. Covers forbidden Tailwind classes and CSS naming prefixes.'
applyTo: "src/**/*.{ts,html,scss}"
---

# Styling Rules

## Responsibility Split

**Material manages colors and typography. Tailwind manages layout.**

| Need | Tool |
|---|---|
| Layout / spacing | Tailwind (`flex`, `p-6`, `gap-4`) |
| Color | Material `color="primary"` or SCSS project token |
| Typography | Material `mat-*` classes |
| Component UI | PDS wrapper (`app-button`, `app-card`) if it exists |
| Z-index | `$z-index-*` from `_tokens.scss` |
| Anything else | SCSS with project tokens |

## Forbidden Tailwind Classes

Never use these Tailwind utilities:

- `bg-{color}-*` — use Material tokens
- `text-{color}-*` — use Material tokens
- `border-{color}-*` — use Material tokens
- `dark:*` — use Material theming
- `text-sm`, `text-lg`, `font-bold`, etc. — use `mat-*` classes

## CSS Class Naming

All CSS classes in a component must be prefixed with `app-{component-name}-`.

```scss
// ❌
.active { ... }
.card-title { ... }

// ✅
.app-user-card-active { ... }
.app-user-card-title { ... }
```

## data-testid in Templates

All interactive elements and key content areas **must have `data-testid` attributes**.

```html
<button data-testid="submit-button" (click)="onSubmit()">{{ label }}</button>
<div data-testid="error-message" *ngIf="hasError">{{ errorText }}</div>
<input data-testid="email-input" [formControl]="emailControl" />