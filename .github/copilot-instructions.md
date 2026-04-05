# Instrucciones — Admin Panel

> Referencia completa para developers: `docs/STYLE_GUIDE.md`

## Development Environment

### Bootstrap

```bash
npm install
```

### Commands

Read `package.json` scripts for exact command names — they are the source of truth.

### Validation Workflow

After making code changes, always run in this order: **lint → test → build**.
Find the exact script names in `package.json`.

## Architecture

### Stack

- **Angular 20** — standalone components only, no NgModules
- **Angular Signals** — state management (no NgRx); services expose `signal()` + `.asReadonly()`
- **Angular Material 20** — UI components and theming
- **Tailwind CSS 3** — layout utilities only (no color/typography utilities)
- **Vitest** — unit tests; **Playwright** — E2E tests

### Architectural Rules

The project follows screaming architecture and domain-first boundaries.

- Organize by domain, not by artifact type
- Treat each `core/` domain as independently understandable and potentially extractable
- Keep `features/` consuming `core/`, never the reverse
- Use domain-local folders such as `services/`, `guards/`, `interceptors/`, `models/`, `contracts/` only when the domain needs them
- Consider the architectural principles instruction the source of truth for structure decisions: `.github/instructions/architectural-principles.instructions.md` ([Architectural Principles Instructions](instructions/architectural-principles.instructions.md))

> For routing, auth service internals, interceptors and feature flags implementation details, see [System Context](instructions/system-context.instructions.md).

## Rules Index

All coding rules live in scoped instruction files. They apply automatically based on the file being edited:

| File | Scope | Link |
|---|---|---|
| `instructions/architectural-principles.instructions.md` | `src/app/**/*.{ts,html,scss}` | [Architectural Principles](instructions/architectural-principles.instructions.md) |
| `instructions/system-context.instructions.md` | `src/app/**/*.ts` | [System Context](instructions/system-context.instructions.md) |
| `instructions/styling.instructions.md` | `src/**/*.{ts,html,scss}` | [Styling Instructions](instructions/styling.instructions.md) |
| `instructions/components.instructions.md` | `src/**/*.{component.ts,component.html,component.scss,model.ts}` | [Components Instructions](instructions/components.instructions.md) |
| `instructions/testing.instructions.md` | `src/**/*.spec.ts` | [Testing Instructions](instructions/testing.instructions.md) |
| `instructions/e2e.instructions.md` | `e2e/**/*.spec.ts` | [E2E Instructions](instructions/e2e.instructions.md) |

## Pre-Code Checklist

- [ ] No Tailwind color or typography utilities (`bg-*`, `text-{color}-*`, `text-sm`, `font-bold`)
- [ ] `DEFAULTS` defined in `.model.ts`
- [ ] CSS classes prefixed with `app-{component-name}-`
- [ ] All code in English; user-visible strings use `$localize` with `@@` ID
- [ ] Forms use `control = input.required<FormControl>()`, not CVA
- [ ] Tests interact via DOM / `data-testid` — never via `componentInstance`
- [ ] Check `src/tests/stubs/` before creating a new stub
- [ ] Contracts in `core/contracts`, internal models in `core/models`
