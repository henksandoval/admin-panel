> **Referencia humana — no normativa.**
> La fuente de verdad es el archivo en inglés: `.github/instructions/system-context.instructions.md`.
> Si existe discrepancia entre este archivo y el EN, el EN prevalece.

<!-- TRANSLATION: IN_SYNC source=.github/instructions/system-context.instructions.md ref=c168627 updated_at=2026-04-06 -->

---
name: 'System Context'
description: 'Referencia técnica de la arquitectura en tiempo de ejecución de la app: registro de rutas, signals del servicio de autenticación, cadena de interceptors HTTP y feature flags. Úsalo cuando modifiques flujos de autenticación, routing, la capa HTTP o la lógica de feature flags.'
applyTo: "src/app/**/*.ts"
---

# System Context — Admin Panel

> Este archivo describe cómo funcionan los sistemas existentes. Para las convenciones de código, consulta [Component Conventions](../components.instructions.md) y [Architectural Principles](../architectural-principles.instructions.md).

## Routing

Las rutas están definidas en `app.routes.ts`. Los componentes de feature se cargan de forma lazy mediante `loadComponent()` y se registran a través de `ROUTE_LOADER_REGISTRY` en `feature-route-loaders.ts`.

Las rutas están definidas como constantes en `src/app/core/models/app-routes.model.ts`:
- `ROUTE_SEGMENTS` — segmentos de ruta individuales
- `APP_PATHS` — rutas completas compuestas a partir de los segmentos

Guards: `authGuard`, `guestGuard`, `roleGuard`, `permissionGuard` — todos en `core/auth/guards/`.

> **Por qué constantes:** Codificar las rutas como strings crea inconsistencias silenciosas cuando cambian las rutas. `APP_PATHS` es la fuente de verdad para todas las llamadas de navegación y directivas `routerLink`.

## Autenticación

`AuthService` (`core/auth/services/auth.service.ts`) gestiona el estado mediante Signals:

```typescript
status: Signal<'checking' | 'authenticated' | 'unauthenticated'>
isAuthenticated: Signal<boolean>   // computed
currentUser: Signal<AuthUser | null>
accessToken: Signal<string | null>
```

El proveedor de autenticación es intercambiable (`IAuthProvider`):
- `JwtAuthProvider` — producción
- `MockAuthProvider` — desarrollo

El token se mantiene en memoria y se refresca automáticamente 60 s antes de su expiración. El timeout por inactividad es de 15 min con un aviso previo de 2 min.

Directivas para plantillas: `*appHasRole`, `*appHasPermission`, `*appFeatureFlag`.

## Interceptors HTTP

Registrados en orden: `correlationInterceptor` → `authInterceptor` → `errorInterceptor`.

| Interceptor | Comportamiento |
|-------------|----------------|
| `correlationInterceptor` | Añade la cabecera `X-Correlation-ID` (UUID de sesión, proveniente de `CorrelationService`) |
| `authInterceptor` | Añade `Authorization: Bearer <token>` |
| `errorInterceptor` | Clasifica errores 5xx/red como `'operational'` (registrados como error); 4xx como `'expected'` (registrados como warn) |

> **Por qué importa el orden:** El correlation ID debe establecerse antes de que auth añada el token, y ambos deben estar presentes antes de que el error interceptor pueda registrar el contexto completo de la petición.

## Feature Flags

`FeatureFlagsService.isEnabled(key): Signal<boolean>`. Los flags se definen por entorno en `environment.ts`.

```html
<!-- En plantillas -->
<div *appFeatureFlag="'dashboard.analytics'">...</div>
```

> **Por qué signals:** Los feature flags consumen `Signal<boolean>` para que el grafo de reactividad de Angular actualice eficientemente solo las partes de la UI afectadas cuando un flag cambia en tiempo de ejecución.
