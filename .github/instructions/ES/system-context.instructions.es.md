> **Referencia humana — no normativa.**
> La fuente de verdad es el archivo en inglés: `.github/instructions/system-context.instructions.md`.
> Si existe discrepancia entre este archivo y el EN, el EN prevalece.

<!-- TRANSLATION: IN_SYNC source=.github/instructions/system-context.instructions.md ref=c168627 updated_at=2026-04-08 -->

---
name: 'System Context'
description: 'Referencia técnica de la arquitectura de ejecución de la aplicación: registro de rutas, signals del servicio de auth, cadena de interceptores HTTP y feature flags. Usar al modificar flujos de auth, enrutamiento, la capa HTTP o la lógica de feature flags.'
applyTo: "src/app/**/*.ts"
---

# Contexto del Sistema — Admin Panel

> Este archivo describe cómo funcionan los sistemas existentes. Para convenciones de codificación, consulta [Convenciones de Componentes](../components.instructions.md) y [Principios Arquitectónicos](../architectural-principles.instructions.md).

## Enrutamiento

Las rutas se definen en `app.routes.ts`. Los componentes de funcionalidades se cargan de forma diferida vía `loadComponent()` y se registran a través de `ROUTE_LOADER_REGISTRY` en `feature-route-loaders.ts`.

Las rutas se definen como constantes en `src/app/core/models/app-routes.model.ts`:
- `ROUTE_SEGMENTS` — segmentos de ruta individuales
- `APP_PATHS` — rutas completas compuestas a partir de los segmentos

Guards: `authGuard`, `guestGuard`, `roleGuard`, `permissionGuard` — todos en `core/auth/guards/`.

> **Por qué usar constantes:** Codificar las cadenas de ruta directamente genera inconsistencias silenciosas cuando las rutas cambian. `APP_PATHS` es la única fuente de verdad para todas las llamadas de navegación y directivas `routerLink`.

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

El token se mantiene en memoria y se renueva automáticamente 60 segundos antes de su expiración. El timeout por inactividad es de 15 minutos con un aviso de 2 minutos.

Directivas de plantilla: `*appHasRole`, `*appHasPermission`, `*appFeatureFlag`.

## Interceptores HTTP

Registrados en orden: `correlationInterceptor` → `authInterceptor` → `errorInterceptor`.

| Interceptor | Comportamiento |
|-------------|----------------|
| `correlationInterceptor` | Agrega la cabecera `X-Correlation-ID` (UUID por sesión, desde `CorrelationService`) |
| `authInterceptor` | Agrega `Authorization: Bearer <token>` |
| `errorInterceptor` | Clasifica errores 5xx y de red como `'operational'` (log al nivel error); errores 4xx como `'expected'` (log al nivel warn) |

> **Por qué importa el orden:** El ID de correlación debe establecerse antes de que auth agregue el token, y ambos deben estar presentes antes de que el Interceptor de errores pueda registrar el contexto completo de la petición.

## Feature Flags

`FeatureFlagsService.isEnabled(key): Signal<boolean>`. Los Feature flags se definen por entorno en `environment.ts`.

```html
<!-- En plantillas -->
<div *appFeatureFlag="'dashboard.analytics'">...</div>
```

> **Por qué usar signals:** Los Feature flags consumen `Signal<boolean>` para que el grafo de reactividad de Angular pueda actualizar eficientemente solo las partes de la UI afectadas cuando un flag cambia en tiempo de ejecución.
