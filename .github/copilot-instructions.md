# Instrucciones — Admin Panel

> Referencia completa para developers: `docs/STYLE_GUIDE.md`

## Development Environment

### Bootstrap

```bash
npm install
```

### Commands

| Command                 | Description                                       |
|-------------------------|---------------------------------------------------|
| `npm start`             | Start development server on http://localhost:4200 |
| `npm run build`         | Production build                                  |
| `npm test`              | Run unit/component tests (Vitest)                 |
| `npm run test:coverage` | Run tests with coverage report                    |
| `npm run lint`          | Lint code (ESLint + angular-eslint)               |
| `npm run lint:fix`      | Lint and auto-fix                                 |
| `npm run e2e`           | Run E2E tests (Playwright)                        |

### Validation Workflow

After making code changes, always run in this order:

```bash
npm run lint
npm test
npm run build
```

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
