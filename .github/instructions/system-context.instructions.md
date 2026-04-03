---
name: 'System Context'
description: 'Technical reference for the app runtime architecture: routing registry, auth service signals, HTTP interceptor chain, and feature flags. Use when modifying auth flows, routing, HTTP layer, or feature flag logic.'
applyTo: "src/app/**/*.ts"
---

# System Context — Admin Panel

> This file describes how existing systems work. For coding conventions, see [Component Conventions](./components.instructions.md) and [Architectural Principles](./architectural-principles.instructions.md).

## Routing

Routes are defined in `app.routes.ts`. Feature components are lazy-loaded via `loadComponent()` and registered through `ROUTE_LOADER_REGISTRY` in `feature-route-loaders.ts`.

Route paths are defined as constants in `src/app/core/models/app-routes.model.ts`:
- `ROUTE_SEGMENTS` — individual path segments
- `APP_PATHS` — full paths composed from segments

Guards: `authGuard`, `guestGuard`, `roleGuard`, `permissionGuard` — all in `core/auth/guards/`.

> **Why constants:** Hardcoding route strings creates silent mismatches when paths change. `APP_PATHS` is the single source of truth for all navigation calls and `routerLink` directives.

## Authentication

`AuthService` (`core/auth/services/auth.service.ts`) manages state via Signals:

```typescript
status: Signal<'checking' | 'authenticated' | 'unauthenticated'>
isAuthenticated: Signal<boolean>   // computed
currentUser: Signal<AuthUser | null>
accessToken: Signal<string | null>
```

Auth provider is pluggable (`IAuthProvider`):
- `JwtAuthProvider` — production
- `MockAuthProvider` — development

Token is kept in memory and auto-refreshed 60s before expiry. Idle timeout is 15 min with a 2 min warning.

Template directives: `*appHasRole`, `*appHasPermission`, `*appFeatureFlag`.

## HTTP Interceptors

Registered in order: `correlationInterceptor` → `authInterceptor` → `errorInterceptor`.

| Interceptor | Behavior |
|-------------|----------|
| `correlationInterceptor` | Adds `X-Correlation-ID` header (UUID per session, from `CorrelationService`) |
| `authInterceptor` | Adds `Authorization: Bearer <token>` |
| `errorInterceptor` | Classifies 5xx/network as `'operational'` (logged at error); 4xx as `'expected'` (logged at warn) |

> **Why order matters:** The correlation ID must be set before auth adds the token, and both must be set before the error interceptor can log the full request context.

## Feature Flags

`FeatureFlagsService.isEnabled(key): Signal<boolean>`. Flags are defined per environment in `environment.ts`.

```html
<!-- In templates -->
<div *appFeatureFlag="'dashboard.analytics'">...</div>
```

> **Why signals:** Feature flags consume `Signal<boolean>` so Angular's reactivity graph can efficiently update only the parts of the UI affected when a flag changes at runtime.
