# Páginas de Error — Admin Panel

## Descripción General

Las páginas de error son vistas especializadas que se muestran cuando la navegación falla o cuando ocurren errores HTTP. La aplicación proporciona tres páginas de error estándar:

- **404 (Not Found):** Cuando el usuario navega a una ruta inexistente
- **403 (Unauthorized):** Cuando el usuario no tiene permisos para acceder a un recurso
- **500 (Server Error):** Cuando ocurre un error en el servidor

Estas páginas tienen su propio layout (`ErrorLayoutComponent`) sin barra lateral ni toolbar, proporcionando una experiencia de error limpia y enfocada.

---

## Arquitectura

### Estructura de Directorios

```
src/app/features/errors/
├── error-layout.component.ts          # Layout compartido (sin sidebar/toolbar)
├── pages/
│   ├── not-found/
│   │   ├── not-found.component.ts
│   │   └── not-found.component.spec.ts
│   ├── unauthorized/
│   │   ├── unauthorized.component.ts
│   │   └── unauthorized.component.spec.ts
│   └── server-error/
│       ├── server-error.component.ts
│       └── server-error.component.spec.ts
└── route-loaders.ts                   # Exporta los lazy loaders
```

### Patrón: Screaming Architecture + Lazy Loading

Las páginas de error siguen el mismo patrón que las rutas de autenticación (`features/auth/`):

- **Carpeta `features/`:** Dominio independiente y reutilizable
- **Componentes lazy-loaded:** Se cargan bajo demanda, no en el bundle inicial
- **Layout propio:** `ErrorLayoutComponent` en lugar del layout principal
- **Route registry:** Integración con el sistema de rutas dinámicas

---

## Flujo de Carga

### 1. Definición en Routes (`app.routes.ts`)

```typescript
export const ERROR_ROUTES: Routes = [
  {
    path: 'errors',
    component: ErrorLayoutComponent,
    children: [
      {
        path: 'not-found',
        loadComponent: () =>
          import('@features/errors/pages/not-found/not-found.component').then(
            (m) => m.NotFoundComponent,
          ),
      },
      {
        path: 'unauthorized',
        loadComponent: () =>
          import('@features/errors/pages/unauthorized/unauthorized.component').then(
            (m) => m.UnauthorizedComponent,
          ),
      },
      {
        path: 'server-error',
        loadComponent: () =>
          import('@features/errors/pages/server-error/server-error.component').then(
            (m) => m.ServerErrorComponent,
          ),
      },
    ],
  },
];
```

**Características:**

- `path: 'errors'` — Prefijo que agrupa todas las rutas de error bajo `/errors/*`
- `component: ErrorLayoutComponent` — Layout personalizado sin navegación
- `loadComponent` — Carga lazy de cada página (no incluidas en el bundle inicial)
- Cada página es un componente standalone

### 2. Wildcard Route (Fallback)

Al final de `app.routes.ts`:

```typescript
export const routes: Routes = [
  ...AUTH_ROUTES,
  ...ERROR_ROUTES,
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: LAYOUT_STATIC_CHILDREN,
  },
  {
    path: '**',        // ← Cualquier ruta no coincidida
    redirectTo: '/errors/not-found',
  },
];
```

**¿Cómo funciona?**

- Angular evalúa las rutas en orden
- Si no coinciden `auth/`, `errors/`, o las rutas bajo layout → cae en `**`
- `**` redirige automáticamente a `/errors/not-found`

**Orden crítico:**

1. `AUTH_ROUTES` (se evalúan primero)
2. `ERROR_ROUTES`
3. Layout con children dinámicos
4. `**` (último, para capturar cualquier cosa)

### 3. ErrorLayoutComponent

```typescript

@Component({
  selector: 'app-error-layout',
  standalone: true,
  imports: [RouterOutlet],
  styles: `
    :host {
      display: flex;
      height: 100%;
      width: 100%;
    }
  `,
  template: `
    <div class="flex h-full w-full items-center justify-center p-6">
      <router-outlet />
    </div>
  `,
})
export class ErrorLayoutComponent {
}
```

**Diseño:**

- **Centrado en pantalla:** Flexbox centra el contenido
- **Sin navegación:** No incluye sidebar, toolbar ni menú
- **RouterOutlet:** Renderiza la página de error específica (`not-found.component`, etc.)
- **Responsive:** Padding y proporciones adaptan a móvil

### 4. Componentes de Página

Cada página de error sigue el mismo patrón:

#### `not-found.component.ts` (404)

```typescript

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  styles: `/* Estilos específicos de 404 */`,
  template: `
    <div class="app-not-found-container">
      <div class="app-not-found-code">404</div>
      <mat-icon class="app-not-found-icon" color="primary">search_off</mat-icon>
      <h1 class="mat-headline-large">{{ pageTitle }}</h1>
      <p class="mat-body-medium mt-4">{{ pageDescription }}</p>
      <div class="mt-8 flex gap-4 justify-center">
        <a mat-raised-button color="primary" routerLink="/dashboard">
          {{ returnButtonText }}
        </a>
      </div>
    </div>
  `,
})
export class NotFoundComponent {
  protected readonly pageTitle = $localize`...`;
  protected readonly pageDescription = $localize`...`;
  protected readonly returnButtonText = $localize`...`;
}
```

**Componentes usados:**

- `MatIconModule` — Icono de Material
- `MatButtonModule` — Botón de retorno con estilos
- `RouterLink` — Navegación al dashboard

**Strings localizados:** Todos los textos usan `$localize` con IDs únicos para i18n.

**Responsiveness:** Clases Tailwind (`mt-4`, `flex`, `gap-4`, `justify-center`) manejan layout y spacing.

#### Similar para `unauthorized.component.ts` (403) y `server-error.component.ts` (500)

---

## Integración con Route Loaders

Las páginas de error **no están** en el menú dinámico (no aparecen en `menu.json`), pero están registradas para lazy loading:

### `route-loaders.ts`

```typescript
export const errorRouteLoaders: RouteLoaderRegistry = {
  'not-found': () => import('@features/errors/pages/not-found/not-found.component')
    .then((m) => m.NotFoundComponent),
  'unauthorized': () => import('@features/errors/pages/unauthorized/unauthorized.component')
    .then((m) => m.UnauthorizedComponent),
  'server-error': () => import('@features/errors/pages/server-error/server-error.component')
    .then((m) => m.ServerErrorComponent),
};
```

Registrado en `feature-route-loaders.ts`:

```typescript
export const featureRouteLoaders: RouteLoaderRegistry = {
  ...dashboardRouteLoaders,
  ...pdsRouteLoaders,
  ...errorRouteLoaders,  // ← Incluido
};
```

Y provisto en `app.config.ts`:

```typescript
{
  provide: ROUTE_LOADER_REGISTRY, useValue
:
  featureRouteLoaders
}
,
```

**¿Por qué?** Aunque no se usan dinámicamente desde el menú, están disponibles si se necesita extended lazy loading en el futuro.

---

## Casos de Uso

### 1. Usuario Navega a Ruta Inexistente

```
Usuario escribe: http://localhost:4200/productos/xyz
        ↓
Angular evalúa rutas en orden
        ↓
¿Coincide /auth/*? No
¿Coincide /errors/*? No
¿Coincide "" (layout)? No (porque /productos no está en dynamicChildren)
        ↓
¿Coincide **? Sí
        ↓
Redirige a /errors/not-found
        ↓
ErrorLayoutComponent se renderiza
        ↓
NotFoundComponent muestra 404
```

### 2. Usuario Sin Permisos

En el interceptor o guard de autorización:

```typescript
// En un guard o error interceptor
if (error.status === 403) {
  this.router.navigate(['/errors/unauthorized']);
}
```

### 3. Error en el Servidor

En el `errorInterceptor`:

```typescript
if (error.status === 500) {
  this.router.navigate(['/errors/server-error']);
}
```

---

## Convenciones de Código

### Clases CSS

Prefijo `app-{componente}-`:

```typescript
'app-not-found-container'
'app-not-found-code'
'app-not-found-icon'
```

Facilita debugging y evita conflictos de nombres.

### Strings Localizados

Todos los textos user-facing usan `$localize`:

```typescript
protected readonly
pageTitle = $localize`:NotFound|Page title@@errors.notfound.title:Page not found`;
```

**Estructura:** `$localize`:CONTEXTO|DESCRIPCIÓN@@ID:TEXTO:`

Esto permite:

- Extraer strings para traducción
- Cambiar textos sin tocar código
- Mantener IDs únicos por idioma

### Material vs Tailwind

| Elemento   | Librería                          |
|------------|-----------------------------------|
| Colores    | Material (`color="primary"`)      |
| Tipografía | Material (`mat-headline-large`)   |
| Layout     | Tailwind (`flex`, `gap-4`, `p-6`) |
| Spacing    | Tailwind (`mt-4`, `mb-6`)         |

---

## Testing

Cada página de error incluye 4 tests básicos:

```typescript
describe('NotFoundComponent', () => {
  it('should display 404 code', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const code = compiled.querySelector('.app-not-found-code');
    expect(code?.textContent).toContain('404');
  });

  it('should display page title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('.mat-headline-large');
    expect(title).toBeTruthy();
  });

  it('should have a link to dashboard', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const link = compiled.querySelector('a[routerLink="/dashboard"]');
    expect(link).toBeTruthy();
  });

  it('should display error icon', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const icon = compiled.querySelector('.app-not-found-icon');
    expect(icon?.textContent).toContain('search_off');
  });
});
```

**Enfoque black-box:**

- Interacción vía DOM
- Selectores por clase, no por `componentInstance`
- Verificación de presencia y contenido

---

## Escalabilidad

### Agregar una Nueva Página de Error

1. **Crear componente:**
   ```bash
   src/app/features/errors/pages/rate-limit/
   ├── rate-limit.component.ts
   └── rate-limit.component.spec.ts
   ```

2. **Agregar a `app.routes.ts`:**
   ```typescript
   {
     path: 'rate-limit',
     loadComponent: () => import('...').then((m) => m.RateLimitComponent),
   }
   ```

3. **Registrar loader (opcional):**
   ```typescript
   'rate-limit': () => import('...').then((m) => m.RateLimitComponent),
   ```

4. **Usar en interceptor:**
   ```typescript
   if (error.status === 429) {
     this.router.navigate(['/errors/rate-limit']);
   }
   ```

### Manejo de Errores desde el Servidor

En `errorInterceptor`:

```typescript
intercept(req
:
HttpRequest<unknown>, next
:
HttpHandlerFn
):
Observable < HttpEvent < unknown >> {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 404:
          this.router.navigate(['/errors/not-found']);
          break;
        case 403:
          this.router.navigate(['/errors/unauthorized']);
          break;
        case 500:
        case 502:
        case 503:
          this.router.navigate(['/errors/server-error']);
          break;
      }
      return throwError(() => error);
    }),
  );
}
```

---

## Resumen

| Aspecto           | Detalles                                                            |
|-------------------|---------------------------------------------------------------------|
| **Ubicación**     | `src/app/features/errors/`                                          |
| **Layout**        | `ErrorLayoutComponent` (sin sidebar/toolbar)                        |
| **Rutas**         | `/errors/not-found`, `/errors/unauthorized`, `/errors/server-error` |
| **Carga**         | Lazy loading via `loadComponent`                                    |
| **Fallback**      | Wildcard `**` redirige a `/errors/not-found`                        |
| **Componentes**   | Standalone, Material + Tailwind                                     |
| **Strings**       | `$localize` con IDs únicos                                          |
| **Testing**       | 4 tests por página (código, título, link, icono)                    |
| **Escalabilidad** | Fácil agregar nuevas páginas                                        |

Las páginas de error son parte integral del flujo de navegación y proporcionan feedback claro al usuario cuando algo falla.
