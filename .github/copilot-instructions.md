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

## Rules Index

All coding rules live in scoped instruction files. They apply automatically based on the file being edited:

| File | Scope | Link |
|---|---|---|
| `instructions/styling.instructions.md` | `src/**/*.{ts,html,scss}` | [Styling Instructions](instructions/styling.instructions.md) |
| `instructions/components.instructions.md` | `src/**/*.{component.ts,component.html,component.scss,model.ts}` | [Components Instructions](instructions/components.instructions.md) |
| `instructions/architecture.instructions.md` | `src/app/core/**/*.ts` | [Architecture Instructions](instructions/architecture.instructions.md) |
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
