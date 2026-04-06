> **Referencia humana — no normativa.**
> La fuente de verdad es el archivo en inglés: `.github/instructions/system-context.instructions.md`.
> Si existe discrepancia entre este archivo y el EN, el EN prevalece.

<!-- TRANSLATION: IN_SYNC source=.github/instructions/system-context.instructions.md ref=7f9f248 updated_at=2026-04-06 -->

---
name: 'System Context'
description: 'Referencia técnica de la arquitectura en tiempo de ejecución de la aplicación: registro de rutas, signals del servicio de autenticación, cadena de interceptores HTTP y feature flags. Usar al modificar flujos de autenticación, routing, la capa HTTP o la lógica de feature flags.'
applyTo: "src/app/**/*.ts"
---

# Contexto del Sistema — Admin Panel

> Este archivo describe cómo funcionan los sistemas existentes. Para las convenciones de código, consulta [Convenciones de Componentes](./components.instructions.md) y [Principios Arquitectónicos](./architectural-principles.instructions.md).

## Routing

Las rutas están definidas en `app.routes.ts`. Los componentes de funcionalidades se cargan de forma diferida mediante `loadComponent()` y se registran a través de `ROUTE_LOADER_REGISTRY` en `feature-route-loaders.ts`.

Las rutas se definen como constantes en `src/app/core/models/app-routes.model.ts`:
- `ROUTE_SEGMENTS` — segmentos de ruta individuales
- `APP_PATHS` — rutas completas compuestas a partir de segmentos

Guards: `authGuard`, `guestGuard`, `roleGuard`, `permissionGuard` — todos en `core/auth/guards/`.

> **Por qué constantes:** Codificar strings de rutas directamente crea inconsistencias silenciosas cuando las rutas cambian. `APP_PATHS` es la única fuente de verdad para todas las llamadas de navegación y directivas `routerLink`.

## Autenticación

`AuthService` (`core/auth/services/auth.service.ts`) gestiona el estado mediante Signals:

```typescript
status: Signal<'checking' | 'authenticated' | 'unauthenticated'>
isAuthenticated: Signal<boolean>   // computed
currentUser: Signal<AuthUser | null>
accessToken: Signal<string | null>
```

El proveedor de autenticación es conectable (`IAuthProvider`):
- `JwtAuthProvider` — producción
- `MockAuthProvider` — desarrollo

El token se mantiene en memoria y se refresca automáticamente 60s antes de expirar. El timeout de inactividad es de 15 min con una advertencia de 2 min.

Directivas de template: `*appHasRole`, `*appHasPermission`, `*appFeatureFlag`.

## Interceptores HTTP

Registrados en orden: `correlationInterceptor` → `authInterceptor` → `errorInterceptor`.

| Interceptor | Comportamiento |
|-------------|----------------|
| `correlationInterceptor` | Agrega el header `X-Correlation-ID` (UUID por sesión, desde `CorrelationService`) |
| `authInterceptor` | Agrega `Authorization: Bearer <token>` |
| `errorInterceptor` | Clasifica errores 5xx/red como `'operational'` (registrado en nivel error); 4xx como `'expected'` (registrado en nivel warn) |

> **Por qué importa el orden:** El ID de correlación debe establecerse antes de que auth agregue el token, y ambos deben estar establecidos antes de que el interceptor de errores pueda registrar el contexto completo de la solicitud.

## Feature Flags

`FeatureFlagsService.isEnabled(key): Signal<boolean>`. Los flags se definen por entorno en `environment.ts`.

```html
<!-- En templates -->
<div *appFeatureFlag="'dashboard.analytics'">...</div>
```

> **Por qué signals:** Los feature flags consumen `Signal<boolean>` para que el grafo de reactividad de Angular pueda actualizar eficientemente solo las partes de la UI afectadas cuando un flag cambia en tiempo de ejecución.
