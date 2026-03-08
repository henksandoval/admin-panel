# 🏗️ Fase 1 — Backbone de Infraestructura: Autenticación y Autorización

> **Admin Panel · Angular 17+ · Visión de plataforma reutilizable**  
> Documento de arquitectura y spec de implementación

---

## Visión General

La capa de autenticación se construye como un **sistema de plugins intercambiables**: el núcleo del framework (`AuthService`, guard, interceptor) es agnóstico al proveedor, y el mecanismo concreto (JWT propio, OAuth2/PKCE, SSO corporativo) se inyecta mediante un `InjectionToken<IAuthProvider>`. Esto permite que el admin panel actúe como base reutilizable para múltiples productos sin reescribir la infraestructura.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ADMIN PANEL CORE                             │
│                                                                     │
│   AuthService ──── IAuthProvider ◄──── JwtAuthProvider   (prod)    │
│       │                 ▲               OAuth2Provider   (empresa)  │
│   authGuard             │               SsoProvider      (corp)     │
│   authInterceptor       │               NullAuthProvider (default)  │
│                    AUTH_PROVIDER                                    │
│                  (InjectionToken)                                   │
│                  → configurado en app.config.ts de cada producto    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Principios de Diseño

| Principio | Aplicación concreta |
|---|---|
| **Single Responsibility** | `AuthService` gestiona estado; `IAuthProvider` gestiona protocolo; el interceptor gestiona HTTP |
| **Open/Closed** | Nuevo proveedor = nueva clase que implementa `IAuthProvider`, sin tocar el core |
| **Intercambiabilidad** | `IAuthProvider` se registra vía `InjectionToken`, configurable por producto en `app.config.ts` |
| **Signals-first** | Todo estado de sesión expuesto como `Signal` readonly; sin `BehaviorSubject` |
| **Fail-secure** | Sin proveedor registrado, `NullAuthProvider` bloquea explícitamente con errores descriptivos |
| **Storage mínimo** | `access_token` solo en memoria (signal); `refresh_token` en `httpOnly` cookie (servidor) o `sessionStorage` como fallback controlado |

---

## Estructura de Archivos Propuesta

```
src/app/core/
├── auth/
│   ├── models/
│   │   └── auth.model.ts               ← Interfaces + tipos + AUTH_DEFAULTS
│   ├── providers/
│   │   ├── auth-provider.token.ts      ← InjectionToken<IAuthProvider> + NullAuthProvider
│   │   ├── jwt/
│   │   │   └── jwt-auth.provider.ts    ← Implementación JWT propio (Fase 1.3)
│   │   └── oauth2/
│   │       └── oauth2-auth.provider.ts ← Implementación OAuth2/PKCE (fase futura)
│   ├── services/
│   │   └── auth.service.ts             ← Orquestador principal con signals
│   ├── guards/
│   │   └── auth.guard.ts               ← CanActivateFn / CanMatchFn + roleGuard
│   └── interceptors/
│       └── auth.interceptor.ts         ← HttpInterceptorFn
├── guards/                             ← Re-exports + guards adicionales del core
└── interceptors/                       ← Re-exports + interceptors adicionales del core

src/app/features/
└── auth/
    ├── login/
    │   ├── login.component.ts
    │   ├── login.component.scss
    │   └── login.model.ts              ← LoginFormState, LOGIN_DEFAULTS
    └── shared/
        └── auth-layout.component.ts    ← Layout sin sidebar para páginas de auth
```

> **Path alias recomendado:** Añadir `"@auth/*": ["src/app/core/auth/*"]` en `tsconfig.json`.

---

## Contratos e Interfaces — `auth.model.ts`

```typescript
import { Observable } from 'rxjs';

// ── Estado de sesión ──────────────────────────────────────────────────────────
export type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';

export interface AuthUser {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
  readonly roles: ReadonlyArray<string>;
  readonly permissions: ReadonlyArray<string>;
  readonly avatarUrl?: string;
  readonly metadata?: Record<string, unknown>;
}

export interface AuthSession {
  readonly user: AuthUser;
  readonly accessToken: string;           // En memoria ÚNICAMENTE
  readonly accessTokenExpiresAt: number;  // epoch ms
}

// ── Request/Response DTOs ─────────────────────────────────────────────────────
export interface LoginCredentials {
  readonly email: string;
  readonly password: string;
}

export interface TokenResponse {
  readonly accessToken: string;
  readonly expiresIn: number;             // segundos
  readonly tokenType: 'Bearer';
  // refreshToken NO se expone aquí → viaja en httpOnly cookie automáticamente
}

// ── Contrato del proveedor (interfaz abstracta) ───────────────────────────────
export interface IAuthProvider {
  login(credentials: LoginCredentials): Observable<TokenResponse>;
  logout(): Observable<void>;
  refreshAccessToken(): Observable<TokenResponse>;
  getUser(accessToken: string): Observable<AuthUser>;
  isTokenExpired(session: AuthSession): boolean;
}

// ── Defaults ──────────────────────────────────────────────────────────────────
export const AUTH_DEFAULTS = {
  tokenRefreshThresholdMs: 60_000,   // refrescar si expira en < 60s
  redirectAfterLogin: '/',
  loginRoute: '/auth/login',
  unauthorizedRoute: '/errors/403',
} as const;
```

---

## `auth-provider.token.ts`

```typescript
import { inject, Injectable, InjectionToken } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { IAuthProvider, LoginCredentials, TokenResponse, AuthUser, AuthSession } from '../models/auth.model';

/** Fail-secure: lanza error explícito si no se registra un proveedor real */
@Injectable({ providedIn: 'root' })
export class NullAuthProvider implements IAuthProvider {
  private readonly errorMsg = (method: string) =>
    `[AUTH] NullAuthProvider.${method}() invocado. Registra un proveedor real en app.config.ts via: { provide: AUTH_PROVIDER, useClass: JwtAuthProvider }`;

  login(_: LoginCredentials): Observable<TokenResponse> {
    return throwError(() => new Error(this.errorMsg('login')));
  }
  logout(): Observable<void> {
    return throwError(() => new Error(this.errorMsg('logout')));
  }
  refreshAccessToken(): Observable<TokenResponse> {
    return throwError(() => new Error(this.errorMsg('refreshAccessToken')));
  }
  getUser(_: string): Observable<AuthUser> {
    return throwError(() => new Error(this.errorMsg('getUser')));
  }
  isTokenExpired(_: AuthSession): boolean {
    return true; // Fail-secure: siempre considera expirado
  }
}

export const AUTH_PROVIDER = new InjectionToken<IAuthProvider>('AUTH_PROVIDER', {
  factory: () => inject(NullAuthProvider),
});

/** URLs que el interceptor debe ignorar (no inyectar token) */
export const AUTH_PUBLIC_URLS = new InjectionToken<string[]>('AUTH_PUBLIC_URLS', {
  factory: () => [],
});
```

---

## `auth.service.ts` — Especificación Completa

**Responsabilidad:** Único punto de verdad del estado de autenticación. Orquesta el proveedor, gestiona tokens en memoria y coordina el flujo de refresh proactivo.

```typescript
import {
  computed, inject, Injectable, Signal, signal
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, switchMap, catchError, EMPTY } from 'rxjs';
import { AUTH_PROVIDER } from '../providers/auth-provider.token';
import {
  AUTH_DEFAULTS, AuthSession, AuthStatus, AuthUser,
  LoginCredentials, TokenResponse
} from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly provider = inject(AUTH_PROVIDER);
  private readonly router   = inject(Router);

  // ── Estado privado ─────────────────────────────────────────────────────────
  private readonly _status      = signal<AuthStatus>('checking');
  private readonly _currentUser = signal<AuthUser | null>(null);
  private readonly _accessToken = signal<string | null>(null);
  private _refreshTimer: ReturnType<typeof setTimeout> | null = null;

  // ── Signals públicos (readonly) ────────────────────────────────────────────
  readonly status:          Signal<AuthStatus>   = this._status.asReadonly();
  readonly currentUser:     Signal<AuthUser | null> = this._currentUser.asReadonly();
  readonly accessToken:     Signal<string | null>   = this._accessToken.asReadonly();
  readonly isAuthenticated: Signal<boolean>          = computed(() => this._status() === 'authenticated');

  // ── Computed de autorización ───────────────────────────────────────────────
  hasRole(role: string): Signal<boolean> {
    return computed(() => this._currentUser()?.roles.includes(role) ?? false);
  }

  hasPermission(permission: string): Signal<boolean> {
    return computed(() => this._currentUser()?.permissions.includes(permission) ?? false);
  }

  hasAnyRole(roles: string[]): Signal<boolean> {
    return computed(() =>
      roles.some(role => this._currentUser()?.roles.includes(role) ?? false)
    );
  }

  // ── Métodos públicos ───────────────────────────────────────────────────────

  /**
   * Llamado en APP_INITIALIZER (InitializationService).
   * Intenta recuperar sesión vigente mediante el refresh token (httpOnly cookie).
   * Resuelve status a 'authenticated' o 'unauthenticated'.
   */
  checkSession(): Observable<void> {
    return this.provider.refreshAccessToken().pipe(
      switchMap(tokenResponse => this.setSession(tokenResponse)),
      catchError(() => {
        this.clearSession();
        return EMPTY;
      })
    );
  }

  /**
   * Inicia sesión con credenciales. Navega a returnUrl o '/' en éxito.
   */
  login(credentials: LoginCredentials, returnUrl?: string): Observable<void> {
    return this.provider.login(credentials).pipe(
      switchMap(tokenResponse => this.setSession(tokenResponse)),
      tap(() => this.router.navigateByUrl(returnUrl ?? AUTH_DEFAULTS.redirectAfterLogin))
    );
  }

  /**
   * Cierra sesión. Invalida cookie en servidor, limpia estado local.
   */
  logout(): Observable<void> {
    return this.provider.logout().pipe(
      tap({
        next:  () => this.clearSession(),
        error: () => this.clearSession(),  // limpiar aunque falle el endpoint
      })
    );
  }

  // ── Métodos privados ───────────────────────────────────────────────────────

  private setSession(tokenResponse: TokenResponse): Observable<void> {
    const { accessToken, expiresIn } = tokenResponse;
    const expiresAt = Date.now() + expiresIn * 1000;

    this._accessToken.set(accessToken);

    return this.provider.getUser(accessToken).pipe(
      tap(user => {
        this._currentUser.set(user);
        this._status.set('authenticated');
        this.scheduleTokenRefresh(expiresAt);
      }),
      switchMap(() => EMPTY)  // → Observable<void>
    );
  }

  private clearSession(): void {
    this.clearRefreshTimer();
    this._accessToken.set(null);
    this._currentUser.set(null);
    this._status.set('unauthenticated');
    this.router.navigate([AUTH_DEFAULTS.loginRoute]);
  }

  private scheduleTokenRefresh(expiresAt: number): void {
    this.clearRefreshTimer();
    const delay = expiresAt - Date.now() - AUTH_DEFAULTS.tokenRefreshThresholdMs;
    if (delay <= 0) return;

    this._refreshTimer = setTimeout(() => {
      this.provider.refreshAccessToken().pipe(
        switchMap(tr => this.setSession(tr)),
        catchError(() => { this.clearSession(); return EMPTY; })
      ).subscribe();
    }, delay);
  }

  private clearRefreshTimer(): void {
    if (this._refreshTimer !== null) {
      clearTimeout(this._refreshTimer);
      this._refreshTimer = null;
    }
  }
}
```

---

## `auth.interceptor.ts` — Especificación Completa

**Responsabilidad:** Inyectar `Authorization: Bearer <token>` en requests autenticados; interceptar 401, intentar refresh una vez y reintentar; hacer logout si el refresh falla.

```typescript
import { inject } from '@angular/core';
import {
  HttpErrorResponse, HttpInterceptorFn, HttpRequest
} from '@angular/common/http';
import {
  BehaviorSubject, catchError, filter, switchMap, take, throwError
} from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AUTH_PROVIDER, AUTH_PUBLIC_URLS } from '../providers/auth-provider.token';

// Estado compartido del flujo de refresh (fuera del fn para ser compartido entre calls)
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService  = inject(AuthService);
  const authProvider = inject(AUTH_PROVIDER);
  const publicUrls   = inject(AUTH_PUBLIC_URLS);

  // Ignorar URLs públicas (login, refresh, assets)
  const isPublic = publicUrls.some(url => req.url.includes(url));
  if (isPublic) return next(req);

  const token = authService.accessToken();
  const authReq = token ? addTokenHeader(req, token) : req;

  return next(authReq).pipe(
    catchError(error => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return handle401(req, next, authService, authProvider);
      }
      return throwError(() => error);
    })
  );
};

function addTokenHeader(req: HttpRequest<unknown>, token: string) {
  return req.clone({
    headers: req.headers.set('Authorization', `Bearer ${token}`)
  });
}

function handle401(req: HttpRequest<unknown>, next: any, authService: AuthService, authProvider: any) {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authProvider.refreshAccessToken().pipe(
      switchMap((tokenResponse: any) => {
        isRefreshing = false;
        refreshTokenSubject.next(tokenResponse.accessToken);
        return next(addTokenHeader(req, tokenResponse.accessToken));
      }),
      catchError(error => {
        isRefreshing = false;
        authService.logout().subscribe();
        return throwError(() => error);
      })
    );
  }

  // Encolar requests mientras se refresca
  return refreshTokenSubject.pipe(
    filter(token => token !== null),
    take(1),
    switchMap(token => next(addTokenHeader(req, token!)))
  );
}
```

---

## `auth.guard.ts` — Especificación Completa

**Responsabilidad:** Bloquear rutas protegidas hasta que el estado de sesión esté resuelto; redirigir a login si no autenticado; verificar roles/permisos si se especifican en `route.data`.

```typescript
import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot
} from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AUTH_DEFAULTS } from '../models/auth.model';

/** Guard principal: verifica autenticación */
export const authGuard: CanActivateFn = (_route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router      = inject(Router);

  // Si el status aún está 'checking' (init en progreso), esperar
  return toObservable(authService.status).pipe(
    filter(status => status !== 'checking'),
    take(1),
    map(status => {
      if (status === 'authenticated') return true;
      return router.createUrlTree(
        [AUTH_DEFAULTS.loginRoute],
        { queryParams: { returnUrl: state.url } }
      );
    })
  );
};

/** Guard de roles: verificar después de authGuard */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, _state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router      = inject(Router);

  const requiredRoles: string[]  = route.data['roles']      ?? [];
  const requireAll:    boolean   = route.data['requireAll'] ?? false;
  const user = authService.currentUser();

  if (!user || requiredRoles.length === 0) return true;

  const hasAccess = requireAll
    ? requiredRoles.every(role => user.roles.includes(role))
    : requiredRoles.some(role  => user.roles.includes(role));

  return hasAccess
    ? true
    : router.createUrlTree([AUTH_DEFAULTS.unauthorizedRoute]);
};

/** Helpers de composición para uso en route definitions */
export const canActivateAuthenticated = [authGuard] as const;
export const canActivateWithRole = (roles: string[], requireAll = false) => ({
  canActivate: [authGuard, roleGuard],
  data: { roles, requireAll }
});
```

---

## `jwt-auth.provider.ts` — Implementación de Referencia

**Responsabilidad:** Implementación concreta de `IAuthProvider` para autenticación JWT contra un backend propio.

```typescript
import { inject, Injectable, InjectionToken } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  IAuthProvider, LoginCredentials, TokenResponse, AuthUser, AuthSession,
  AUTH_DEFAULTS
} from '../../models/auth.model';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

@Injectable({ providedIn: 'root' })
export class JwtAuthProvider implements IAuthProvider {
  private readonly http    = inject(HttpClient);
  private readonly apiBase = inject(API_BASE_URL);

  login(credentials: LoginCredentials): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.apiBase}/auth/login`, credentials, {
      withCredentials: true  // recibir la httpOnly cookie con refresh token
    });
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiBase}/auth/logout`, {}, {
      withCredentials: true  // invalidar la httpOnly cookie en servidor
    });
  }

  refreshAccessToken(): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.apiBase}/auth/refresh`, {}, {
      withCredentials: true  // enviar la httpOnly cookie automáticamente
    });
  }

  getUser(accessToken: string): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.apiBase}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
  }

  isTokenExpired(session: AuthSession): boolean {
    return Date.now() >= session.accessTokenExpiresAt - AUTH_DEFAULTS.tokenRefreshThresholdMs;
  }
}
```

---

## Estrategia de Tokens y Almacenamiento Seguro

```
┌──────────────────────────────────────────────────────────────────────┐
│                      ESTRATEGIA DE TOKENS                            │
├──────────────────┬───────────────────────────────────────────────────┤
│ Access Token     │ Signal<string | null> — SOLO EN MEMORIA           │
│                  │ Vida corta: 15 min (configurable)                 │
│                  │ Se pierde al cerrar tab/browser ✅                │
│                  │ No accesible desde localStorage/sessionStorage ✅ │
├──────────────────┼───────────────────────────────────────────────────┤
│ Refresh Token    │ httpOnly Cookie (RECOMENDADO, requiere backend)   │
│                  │ → Browser la envía automáticamente                │
│                  │ → Completamente inaccesible desde JS ✅           │
│                  │ → Configurar: SameSite=Strict, Secure, Path=/auth │
│                  │                                                   │
│                  │ sessionStorage FALLBACK (si SPA sin servidor)     │
│                  │ → Aislado por tab, no persiste ✅                 │
│                  │ → Vulnerable a XSS ⚠️  (documentar el trade-off)  │
├──────────────────┼───────────────────────────────────────────────────┤
│ User Info        │ Signal<AuthUser | null> — EN MEMORIA              │
│                  │ Derivado del JWT claims o endpoint /auth/me       │
└──────────────────┴───────────────────────────────────────────────────┘

⛔ REGLA: NUNCA usar localStorage para tokens de ningún tipo.
```

---

## Flujo de Refresh Token (ASCII)

```
Request HTTP saliente
     │
     ▼
┌──────────────────┐
│  authInterceptor │
└────────┬─────────┘
         │
         │ ¿URL pública?
         ├── SÍ ──────────────────────────────▶ next(req) directo
         │
         │ ¿Hay accessToken en memoria?
         ├── SÍ → añadir Authorization header
         │
         ▼
    next(authReq)
         │
         │ ¿Respuesta 401?
         ├── NO ─────────────────────────────▶ Response OK
         │
         ▼
┌─────────────────────────────┐
│   handle401()               │
│                             │
│ ¿isRefreshing === true?     │
└─────────────────────────────┘
     │ SÍ                   │ NO
     ▼                      ▼
┌──────────────┐    ┌────────────────────────────┐
│ Encolar en   │    │ isRefreshing = true         │
│ refreshToken │    │ authProvider                │
│ Subject      │    │   .refreshAccessToken()     │
└──────┬───────┘    └──────────────┬─────────────┘
       │                           │
       │                  ┌────────┴──────────┐
       │                  │ Éxito             │ Fallo
       │                  ▼                   ▼
       │        ┌───────────────────┐  ┌─────────────────────┐
       │        │ isRefreshing=false│  │ isRefreshing=false  │
       │        │ Subject.next(tok) │  │ authService.logout()│
       │        │ flush queue ──────┤  │ redirect /auth/login│
       │        └────────┬──────────┘  └─────────────────────┘
       │                 │
       └─────────────────▼
              Reintentar request original con nuevo token
```

---

## Flujos de Autenticación Principales

### 1. Verificación de sesión en arranque (APP_INITIALIZER)

```
app.bootstrap
    │
    ▼
InitializationService.initialize()
    │
    ├─▶ [NUEVO] authService.checkSession()
    │       │
    │       │ POST /auth/refresh (envía httpOnly cookie automáticamente)
    │       │
    │       ├─▶ Éxito: setSession() → status = 'authenticated'
    │       └─▶ Fallo: clearSession() → status = 'unauthenticated'
    │                  (NO redirige: deja que el guard gestione)
    │
    └─▶ [YA EXISTE] menuDataService.loadMenu() → buildRoutes()
```

> `checkSession()` es el **primer paso** de `initialize()`. El resto del init puede ejecutarse en paralelo o en secuencia según necesidades del producto.

### 2. Login

```
LoginComponent.submit(credentials)
    │
    ▼
authService.login(credentials, returnUrl)
    │
    ▼
authProvider.login(credentials)
── POST /auth/login ──▶
    │
    ├─▶ Éxito (200 + TokenResponse):
    │       setSession(tokenResponse)
    │           ├─▶ _accessToken.set(token)
    │           ├─▶ authProvider.getUser(token)
    │           ├─▶ _currentUser.set(user)
    │           ├─▶ _status.set('authenticated')
    │           └─▶ scheduleTokenRefresh(expiresAt)
    │       router.navigateByUrl(returnUrl ?? '/')
    │
    └─▶ Error (401/422):
            propagar error → LoginComponent muestra feedback
```

### 3. Logout

```
[usuario clickea Logout] | [401 irrecuperable en interceptor]
    │
    ▼
authService.logout()
    │
    ├─▶ authProvider.logout() → POST /auth/logout (invalida cookie httpOnly)
    ├─▶ clearRefreshTimer()
    ├─▶ _accessToken.set(null)
    ├─▶ _currentUser.set(null)
    ├─▶ _status.set('unauthenticated')
    └─▶ router.navigate(['/auth/login'])

Nota: clearSession() se ejecuta tanto en éxito como en error del logout endpoint
(el usuario SIEMPRE queda deslogueado localmente)
```

---

## Integración con el Sistema de Rutas Existente

### 1. `InitializationService` — Extensión mínima

```typescript
// initialization.service.ts
async initialize(): Promise<void> {
  await firstValueFrom(this.authService.checkSession());  // NUEVO: primer paso
  await this.loadMenu();     // ya existente
  await this.buildRoutes();  // ya existente
}
```

### 2. `RouteDefinition` — Extensión del modelo

```typescript
// route-registry.ts (extender la interfaz existente)
export interface RouteDefinition {
  readonly path: string;
  readonly loader?: LazyComponentLoader;
  readonly requiresAuth?: boolean;    // NUEVO
  readonly roles?: string[];          // NUEVO
  readonly requireAllRoles?: boolean; // NUEVO (default: false = OR lógico)
}
```

### 3. `RouteBuilderService` — Inyección automática de guards

```typescript
// route-builder.service.ts (extender el método buildRoute)
private buildRoute(def: RouteDefinition): Route {
  const route: Route = {
    path: def.path,
    loadComponent: def.loader,
  };

  if (def.requiresAuth) {
    route.canActivate = def.roles?.length
      ? [authGuard, roleGuard]
      : [authGuard];

    if (def.roles?.length) {
      route.data = {
        roles: def.roles,
        requireAll: def.requireAllRoles ?? false,
      };
    }
  }

  return route;
}
```

### 4. `app.routes.ts` — Rama pública de auth

```typescript
// Añadir fuera del LayoutComponent (sin guard)
{
  path: 'auth',
  loadComponent: () =>
    import('@features/auth/shared/auth-layout.component')
      .then(m => m.AuthLayoutComponent),
  children: [
    {
      path: 'login',
      loadComponent: () =>
        import('@features/auth/login/login.component')
          .then(m => m.LoginComponent),
    },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
  ],
},
```

### 5. `app.config.ts` — Registro del proveedor e interceptor

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    // ...providers existentes...

    // NUEVO: HTTP con interceptor de auth
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),

    // NUEVO: Proveedor de autenticación (intercambiable por producto)
    { provide: AUTH_PROVIDER,    useClass: JwtAuthProvider },
    { provide: AUTH_PUBLIC_URLS, useValue: ['/auth/login', '/auth/refresh', '/auth/logout'] },
    { provide: API_BASE_URL,     useValue: environment.apiBaseUrl },
  ],
};
```

---

## Estrategia de Testing

### `auth.service.ts`
- Estado inicial es `'checking'`
- Tras `checkSession()` exitoso → `status === 'authenticated'`, `currentUser` poblado
- Tras `checkSession()` fallido → `status === 'unauthenticated'`, `currentUser === null`
- `login()` correcto → transiciona estado, navega a returnUrl
- `logout()` limpia sesión, cancela timer, navega a `/auth/login`
- `hasRole()` / `hasPermission()` retornan signal correcto según `currentUser`
- Timer de refresh se programa con el delta correcto (`expiresAt - now - threshold`)
- `clearRefreshTimer()` cancela el timeout activo

### `auth.guard.ts`
- `status === 'authenticated'` → retorna `true`
- `status === 'unauthenticated'` → retorna `UrlTree` apuntando a `/auth/login` con `returnUrl`
- `status === 'checking'` → espera a que cambie (no resuelve inmediatamente)
- `roleGuard` con roles coincidentes → `true`
- `roleGuard` sin roles coincidentes → `UrlTree` a `/errors/403`

### `auth.interceptor.ts`
- Requests a URLs públicas no llevan header `Authorization`
- Requests autenticados → header `Authorization: Bearer <token>` inyectado
- Respuesta 200 → pasa sin modificación
- Respuesta 401 → dispara refresh → reintenta con nuevo token
- Múltiples 401 simultáneos → solo un refresh, los demás quedan encolados
- Refresh fallido → `logout()` + redirect, error propagado

### `jwt-auth.provider.ts`
- Cada método HTTP mockeado con `HttpClientTestingModule` / `provideHttpClientTesting()`
- `login()` envía `withCredentials: true`
- `refreshAccessToken()` envía `withCredentials: true`
- `isTokenExpired()` con distintos deltas de tiempo (expirado, vigente, en umbral)

> El proyecto usa **Vitest** — usar `TestBed` con `vi.fn()` para mocks del proveedor.

---

## Consideraciones de Seguridad

| Riesgo | Mitigación |
|---|---|
| **XSS roba access token** | Token solo en Signal (memoria), no en DOM ni Web Storage |
| **XSS roba refresh token** | httpOnly cookie inaccesible desde JavaScript |
| **CSRF en endpoint /refresh** | Cookie con `SameSite=Strict` + CSRF token en header (responsabilidad del backend) |
| **Token leak en logs** | `LoggingService` nunca recibe objetos `AuthSession` completos; loguear solo `userId` |
| **Race condition en refresh** | Flag `isRefreshing` + cola de requests pendientes en `BehaviorSubject` |
| **Rutas accesibles antes de init** | Guard espera `status !== 'checking'` con `toObservable` + `filter` |
| **JWT manipulado en frontend** | Verificación de firma **siempre en backend**; frontend solo decodifica claims para UX |
| **Persistencia accidental** | `localStorage` prohibido para tokens; `settings.service.ts` usa storage solo para preferencias de UI |
| **Proveedor no configurado** | `NullAuthProvider` falla con errores explícitos en lugar de silenciosamente |

---

## Decisiones de Diseño y Trade-offs

| Decisión | Alternativa descartada | Razón |
|---|---|---|
| `InjectionToken` para proveedor | Herencia con clase abstracta | DI de Angular es más flexible; permite `useFactory` con config dinámica por producto |
| Access token en Signal (memoria) | `sessionStorage` | Signal es más seguro (no serializado) y reactivo; reset automático al cerrar tab |
| Refresh token en httpOnly cookie | `localStorage` / `sessionStorage` | Inaccesible desde JS → elimina el vector de XSS sobre el refresh token |
| `HttpInterceptorFn` funcional | Clase `HttpInterceptor` | Angular 17+ recomienda functional; compatible con `provideHttpClient(withInterceptors([]))` |
| `CanActivateFn` funcional | Guard como clase | Mismo motivo que interceptor; mejor tree-shaking y menor boilerplate |
| `checkSession()` en `APP_INITIALIZER` | Lazy check en primer guard activado | Garantiza que `status` esté resuelto antes de renderizar cualquier ruta |
| `NullAuthProvider` como default | Sin default en el token | Fail-secure explícito: la app no arranca silenciosamente sin auth real |
| Timer proactivo de refresh | Solo refresh reactivo en 401 | Evita interrupciones de UX durante operaciones largas justo cuando expira el token |

---

## Fases de Implementación (Orden de Prioridad)

### ✅ Fase 1.1 — Contratos y estructura (sin lógica) · *Unblocking*
1. `auth.model.ts` — Interfaces, tipos y `AUTH_DEFAULTS`
2. `auth-provider.token.ts` — `InjectionToken` + `NullAuthProvider`
3. Extender `RouteDefinition` con `requiresAuth`, `roles`, `requireAllRoles`
4. Path alias `@auth/*` en `tsconfig.json`

### 🔨 Fase 1.2 — Core funcional · *Bloquea todas las features*
5. `auth.service.ts` — Signals + `checkSession()` + `login()` + `logout()`
6. `auth.guard.ts` — `authGuard` + `roleGuard` + helpers de composición
7. `auth.interceptor.ts` — Inyección de token + manejo 401/refresh con cola
8. Integrar `checkSession()` en `InitializationService.initialize()`
9. Registrar interceptor y `NullAuthProvider` en `app.config.ts`

### 🔌 Fase 1.3 — Proveedor JWT concreto
10. `API_BASE_URL` `InjectionToken` + configuración en environments
11. `jwt-auth.provider.ts` — Implementación completa contra API real
12. Cambiar `app.config.ts` de `NullAuthProvider` a `JwtAuthProvider`

### 🎨 Fase 1.4 — UI de autenticación
13. `features/auth/shared/auth-layout.component.ts` — Layout sin sidebar
14. `features/auth/login/` — Componente de login con feedback de error
15. `app.routes.ts` — Rama pública `/auth/**`
16. Aplicar `requiresAuth: true` en las entradas protegidas del route registry

### 🛡️ Fase 1.5 — Hardening y testing
17. Tests unitarios de cada capa (service, guard, interceptor, provider)
18. `RouteBuilderService` inyectando guards dinámicamente desde `requiresAuth`/`roles`
19. Documentar contrato de `IAuthProvider` para implementaciones futuras (OAuth2, SSO)

---

## Apéndice: Árbol de Dependencias

```
app.config.ts
    ├── provideHttpClient(withInterceptors([authInterceptor]))
    │       └── authInterceptor → AuthService, AUTH_PROVIDER, AUTH_PUBLIC_URLS
    ├── { provide: AUTH_PROVIDER, useClass: JwtAuthProvider }
    │       └── JwtAuthProvider → HttpClient, API_BASE_URL
    └── InitializationService
            └── AuthService.checkSession() → AUTH_PROVIDER

authGuard / roleGuard → AuthService (signal readonly)
AuthService → AUTH_PROVIDER (InjectionToken)
```

---

*Documento generado: 2026-03-05 · Versión 1.0*

