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

### Routing

Routes are defined in `app.routes.ts`. Feature components are lazy-loaded via `loadComponent()` and registered through `ROUTE_LOADER_REGISTRY` in `feature-route-loaders.ts`. Route paths are defined as constants in `src/app/core/models/app-routes.model.ts` (`ROUTE_SEGMENTS`, `APP_PATHS`).

Guards: `authGuard`, `guestGuard`, `roleGuard`, `permissionGuard` — all in `core/auth/guards/`.

### Authentication

`AuthService` (`core/auth/services/auth.service.ts`) manages state via Signals:
- `status: Signal<'checking' | 'authenticated' | 'unauthenticated'>`
- `isAuthenticated: Signal<boolean>` (computed)
- `currentUser: Signal<AuthUser | null>`
- `accessToken: Signal<string | null>`

Auth provider is pluggable (`IAuthProvider`): `JwtAuthProvider` in production, `MockAuthProvider` in development. Token is kept in memory and auto-refreshed 60s before expiry. Idle timeout is 15 min (2 min warning).

Template directives: `*appHasRole`, `*appHasPermission`, `*appFeatureFlag`.

### HTTP Interceptors

Registered in order: `correlationInterceptor` → `authInterceptor` → `errorInterceptor`.

- **correlation**: adds `X-Correlation-ID` header (UUID per session, from `CorrelationService`)
- **auth**: adds `Authorization: Bearer <token>`
- **error**: classifies 5xx/network as `'operational'` (logged at error) and 4xx as `'expected'` (logged at warn)

### Feature Flags

`FeatureFlagsService.isEnabled(key): Signal<boolean>`. Flags are defined per environment in `environment.ts`. Use `*appFeatureFlag="'dashboard.analytics'"` in templates.

## Rules Index

All coding rules live in scoped instruction files. They apply automatically based on the file being edited:

| File | Scope | Link |
|---|---|---|
| `instructions/architectural-principles.instructions.md` | `src/app/**/*.{ts,html,scss}` | [Architectural Principles](instructions/architectural-principles.instructions.md) |
| `instructions/styling.instructions.md` | `src/**/*.{ts,html,scss}` | [Styling Instructions](instructions/styling.instructions.md) |
| `instructions/components.instructions.md` | `src/**/*.{component.ts,component.html,component.scss,model.ts}` | [Components Instructions](instructions/components.instructions.md) |
| `instructions/architecture.instructions.md` | `src/app/core/**/*.ts` | [Architecture Instructions](instructions/architecture.instructions.md) |
| `instructions/testing.instructions.md` | `src/**/*.spec.ts` | [Testing Instructions](instructions/testing.instructions.md) |
| `instructions/e2e.instructions.md` | `e2e/**/*.spec.ts` | [E2E Instructions](instructions/e2e.instructions.md) |

## Key Conventions

### Components

- Every component requires exactly 5 files: `.ts`, `.html`, `.scss`, `.spec.ts`, `.model.ts`
- Template-only members must be `protected`, not `public`
- Use `computed()` for dynamic CSS classes — never use methods
- Input defaults come from `COMPONENT_DEFAULTS` in `.model.ts`
- Use PDS wrappers (`app-button`, `app-card`) over raw Material components when they exist — check `ui-kit/` first

### State

- Services expose state as `readonly` signals: `private readonly _x = signal(…); readonly x = this._x.asReadonly()`
- Use `effect()` for side effects, not `ngOnChanges` or `ngOnInit` subscriptions

### Data Layer

- API shapes → `core/contracts/` (suffix: `.contract.ts` or `.dto.ts`)
- Domain models → `core/models/` (suffix: `.model.ts`, `.value.ts`, `.types.ts`)
- Map at the service/repository boundary — DTOs must never appear in components

### Testing

- Test runner: **Vitest** with `@testing-library/angular`
- Only selector: `data-testid` — never CSS classes, IDs, or visible text
- Component tests never touch `fixture.componentInstance`
- Check `src/tests/stubs/` before creating a new stub

Available stubs: `mat-icon`, `mat-divider`, `mat-sidenav`, `mat-tooltip`, `app-button`, `app-checkbox`, `app-form-input`, `app-form-select`, `app-form-textarea`, `app-form-datepicker`, `app-filter-footer`, `auth-page-layout`, `settings-panel`.

Auth test helpers: `createMockAuthProvider()`, `createFailingAuthProvider()`, `MOCK_USER`, `MOCK_TOKEN_RESPONSE` — from `core/auth/testing/`.

### Styling

- **Material** handles colors and typography; **Tailwind** handles layout/spacing only
- Forbidden Tailwind: `bg-*`, `text-{color}-*`, `border-{color}-*`, `dark:*`, `text-sm/lg`, `font-bold`
- All component CSS classes must be prefixed with `app-{component-name}-`

### i18n

All user-visible strings use `$localize` with an `@@` ID:
```typescript
$localize`:@@component.submit:Submit`
```

## Pre-Code Checklist

- [ ] No Tailwind color or typography utilities (`bg-*`, `text-{color}-*`, `text-sm`, `font-bold`)
- [ ] `DEFAULTS` defined in `.model.ts`
- [ ] CSS classes prefixed with `app-{component-name}-`
- [ ] All code in English; user-visible strings use `$localize` with `@@` ID
- [ ] Forms use `control = input.required<FormControl>()`, not CVA
- [ ] Tests interact via DOM / `data-testid` — never via `componentInstance`
- [ ] Check `src/tests/stubs/` before creating a new stub
- [ ] Contracts in `core/contracts`, internal models in `core/models`
