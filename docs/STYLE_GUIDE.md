# Guía de Estilos - Admin Panel

## Principio Único

**Material gestiona colores y tipografía. Tailwind gestiona layout.**

---

## 📐 LAS 3 CAPAS

```
┌──────────────────────────────────────────────────────┐
│   CAPA 1: Angular Material (GESTOR DE THEMING)       │
│   - Componentes Material (button, card, toolbar)     │
│   - Atributo color="primary|secondary|tertiary"      │
│   - Gestión automática de dark/light/theme-color     │
│   - Material maneja TODOS los colores                │
│   - Material maneja tipografía (escala tipográfica)  │
├──────────────────────────────────────────────────────┤
│   CAPA 2: Tailwind (LAYOUT, SPACING Y ESTRUCTURA)    │
│   - Layout: flex, grid, gap, items-center            │
│   - Spacing: p-6, m-4, space-y-2                     │
│   - Sizing: w-full, h-screen, max-w-4xl              │
│   - Effects: hover:scale-110, transition-transform   │
│   - Responsive: md:, lg:, max-sm:                    │
│   - Borders SIN color: border-t, border-b, border-r  │
│   - Radius: rounded-lg, rounded-full, rounded-xl     │
│   - Shadows básicos: shadow-sm, shadow-md, shadow-lg │
│   - Overflow: overflow-hidden, overflow-auto          │
│   - Visibility: hidden, invisible, sr-only           │
│   - NO COLORES: sin bg-*, text-{color}-*, border-*   │
│   - NO DARK MODE: sin dark:*                         │
│   - VER: Sección "Clases Tailwind en zona gris"      │
├──────────────────────────────────────────────────────┤
│   CAPA 3: SCSS (SOLO CASOS EXTREMOS)                 │
│   - Gradientes muy complejos                         │
│   - Componentes 100% custom (no usan Material)       │
│   - Cuando Material no puede manejar el caso         │
│   - MÍNIMO uso, preferir Material                    │
└──────────────────────────────────────────────────────┘
```

---

## Reglas de Estilos

### Tailwind: SÍ para layout, NO para colores

```html
<!-- ✅ BIEN -->
<div class="flex items-center gap-4 p-6">
  <app-button variant="raised" color="primary">Guardar</app-button>
</div>

<!-- ❌ MAL -->
<button class="bg-blue-500 text-white">Guardar</button>
<div class="bg-white dark:bg-gray-800">Contenido</div>
```

**Tailwind permitido:** `flex`, `grid`, `gap-*`, `p-*`, `m-*`, `w-*`, `h-*`, `rounded-*`, `shadow-*`, `border-t`, `border-b`, `overflow-*`, `sr-only`

**Tailwind prohibido:** `bg-{color}-*`, `text-{color}-*`, `border-{color}-*`, `dark:*`

### Clases Tailwind en zona gris

Algunas clases Tailwind no son colores pero pueden generar dudas. Esta tabla define cómo tratarlas:

| Clase                  | ¿Permitida?    | Motivo                                                                                                     |
|------------------------|----------------|------------------------------------------------------------------------------------------------------------|
| `opacity-*`            | ✅ Sí           | Controla transparencia, no define color                                                                    |
| `bg-transparent`       | ✅ Sí           | Reset visual, no asigna color                                                                              |
| `text-transparent`     | ✅ Sí           | Técnica para gradient text u ocultar texto accesible                                                       |
| `divide-y`, `divide-x` | ⚠️ Con cuidado | Permitido sin color (`divide-y`). Prohibido con color (`divide-gray-200`)                                  |
| `ring-*`               | ⚠️ Con cuidado | Permitido para tamaño (`ring-2`). Prohibido con color (`ring-blue-500`). Preferir focus nativo de Material |
| `placeholder-*`        | ❌ No           | Gestionar via Material form field theming                                                                  |
| `accent-*`             | ❌ No           | Gestionar via Material theming                                                                             |
| `caret-*`              | ❌ No           | Gestionar via SCSS con tokens si es necesario                                                              |

Ante la duda, usar SCSS con tokens del proyecto.

### Tipografía

Material gestiona la escala tipográfica del proyecto a través de su sistema de typography levels. No usar clases Tailwind para tamaños de fuente, pesos ni line-height.

```html
<!-- ✅ BIEN: Typography levels de Material -->
<h1 class="mat-headline-large">Título principal</h1>
<p class="mat-body-medium">Texto de contenido</p>
<span class="mat-label-small">Etiqueta</span>

<!-- ❌ MAL: Tailwind para tipografía -->
<h1 class="text-3xl font-bold">Título principal</h1>
<p class="text-sm leading-relaxed">Texto</p>
```

**Excepción válida:** `truncate`, `line-clamp-*`, `whitespace-nowrap`, `break-words` están permitidos porque controlan comportamiento del texto, no su apariencia tipográfica.

### Material: Siempre para colores

```html
<!-- Botones (via wrappers) -->
<app-button variant="raised" color="primary">Acción</app-button>
<app-button variant="stroked" color="secondary">Cancelar</app-button>

<!-- Cards (via wrappers) -->
<app-card>Contenido</app-card>

<!-- Iconos -->
<mat-icon color="primary">check</mat-icon>
```

### SCSS: Solo cuando Material no alcanza

Casos válidos: gradientes en navegación, estados interactivos complejos (active, parent-active por nivel), mixins reutilizables.

```scss
// ✅ BIEN: Usa tokens del proyecto
.app-nav-item:hover {
  background-color: var(--overlay-light-04);
}

// ❌ MAL: Valores hardcoded
.item:hover {
  background: rgba(0, 0, 0, 0.04);
  color: #1976d2;
}
```

---

## Z-Index

El proyecto gestiona capas de apilamiento mediante tokens. No usar valores numéricos directos.

```scss
// Escala definida en _tokens.scss
$z-index-dropdown:   1000;
$z-index-sticky:     1020;
$z-index-sidebar:    1030;
$z-index-toolbar:    1040;
$z-index-modal:      1050;
$z-index-popover:    1060;
$z-index-tooltip:    1070;
$z-index-toast:      1080;
```

```scss
// ✅ BIEN
.app-sidebar {
  z-index: $z-index-sidebar;
}

// ❌ MAL
.app-sidebar {
  z-index: 999;
}
```

Material maneja automáticamente el z-index de sus overlays (dialog, snackbar, menu). No sobreescribirlos salvo que haya un conflicto documentado, en cuyo caso se agrega un comentario explicando el motivo.

---

## Accesibilidad

### Requisitos mínimos

Todos los componentes deben cumplir WCAG 2.1 nivel AA como mínimo. Los wrappers del PDS son el lugar principal para garantizar estos estándares.

### Navegación por teclado

Todo elemento interactivo debe ser alcanzable y operable con teclado. Material lo gestiona en sus componentes nativos. Para componentes custom, verificar:

```html
<!-- ✅ BIEN: Elemento interactivo custom accesible -->
<div
  role="button"
  tabindex="0"
  (keydown.enter)="handleAction()"
  (keydown.space)="handleAction()"
  (click)="handleAction()"
>
  Acción custom
</div>

<!-- ❌ MAL: Click sin soporte de teclado -->
<div (click)="handleAction()">Acción custom</div>
```

### Textos e iconos

```html
<!-- ✅ BIEN -->
<app-button variant="icon" color="primary" aria-label="Eliminar registro">
  <mat-icon>delete</mat-icon>
</app-button>

<img [src]="chartUrl" alt="Gráfico de ventas mensuales del último trimestre" />

<!-- ❌ MAL -->
<app-button variant="icon" color="primary">
  <mat-icon>delete</mat-icon>
</app-button>

<img [src]="chartUrl" />
```

### Contraste

No aplicar colores manualmente. Material gestiona contraste a través de su sistema de theming. Si se necesita un color custom en SCSS, verificar que cumple ratio 4.5:1 para texto normal y 3:1 para texto grande.

### Clase sr-only

Usar `sr-only` de Tailwind para contenido visible solo por lectores de pantalla:

```html
<span class="sr-only">Ordenar columna de forma ascendente</span>
```

---

## Reglas de Componentes

### Contract naming glossary (core)

Este glosario define una frontera clara entre el modelo interno de la aplicacion y sus integraciones externas. El objetivo es que el dominio de la app sea estable, y que los cambios de APIs o proveedores se absorban mediante mapeos.

**core/contracts**

- Proposito: acuerdos con capas externas (APIs, SDKs, proveedores, storage externo, integraciones).
- Contenido: DTOs de entrada/salida, payloads de webhooks/eventos externos, tipos de librerias externas.
- Sufijos recomendados: `*.contract.ts` o `*.dto.ts`.
- Ejemplos: `user.api.contract.ts`, `menu.api.contract.ts`, `auth.provider.contract.ts`.

**core/models**

- Proposito: modelos internos del dominio de la aplicacion (entidades, value objects, enums de negocio).
- Contenido: tipos que viven y evolucionan con la logica interna, usados por multiples features.
- Sufijos recomendados: `*.model.ts`, `*.value.ts`, `*.types.ts`.
- Ejemplos: `user.model.ts`, `navigation.model.ts`, `auth-session.value.ts`.

**Reglas de uso**

- No mezclar DTOs externos con modelos internos.
- Usar mappers/adapters para convertir `contracts -> models`.
- Si un modelo es especifico de una feature, debe vivir dentro de esa feature, no en `core`.

### Estructura de archivos

```
app-table/
├── app-table.component.ts       # Lógica y template (inline si es simple)
├── app-table.component.html     # Template externo (si aplica)
├── app-table.component.scss     # Estilos (si aplica)
├── app-table.component.spec.ts  # Tests
└── app-table.model.ts           # Interfaces + DEFAULTS
```

### DEFAULTS obligatorios

```typescript
// app-table.model.ts
export const TABLE_DEFAULTS = {
  emptyMessage: 'No hay datos disponibles',
  stickyHeader: false,
  clickableRows: false,
} as const;

// as const garantiza que TypeScript infiera tipos literales
// en lugar de string | boolean genéricos, dando autocompletado exacto

// app-table.component.ts
emptyMessage = input<string>(TABLE_DEFAULTS.emptyMessage);
```

### Inline vs Externo: Template y Estilos

La decisión no se basa en un conteo de líneas, sino en complejidad cognitiva. Usar la siguiente guía:

**Inline cuando:**

- El template o estilos se pueden leer y entender de un vistazo sin hacer scroll
- No hay lógica condicional anidada (`@if` dentro de `@if`, `@for` con `@if` internos)
- No se necesitan mixins ni tokens SCSS custom

**Externo cuando:**

- El template tiene bloques condicionales anidados o múltiples secciones lógicas
- Los estilos requieren mixins, tokens SCSS, o estados complejos (`:host-context`, animaciones)
- Un segundo desarrollador necesitaría más de 10 segundos para entender la estructura

Ante la duda, usar archivo externo.

### Prefijo en clases CSS

```scss
// ✅ BIEN
.app-table { }
.app-table-row { }
.app-table-cell { }

// ❌ MAL
.table { }
.row { }
.cell { }
```

### Computed signals para clases dinámicas

```typescript
tableClasses = computed(() => {
  const classes = ['app-table'];
  if (this.stickyHeader()) classes.push('sticky-header');
  return classes.join(' ');
});
```

No usar métodos que se ejecuten en cada ciclo de detección:

```typescript
// ❌ MAL: Se reevalúa en cada change detection
getClasses(): string {
  return this.stickyHeader ? 'app-table sticky-header' : 'app-table';
}
```

### Estilo funcional e inmutable

El proyecto adopta un estilo funcional para transformaciones de datos. La razón: las funciones puras sin mutación son más predecibles, más fáciles de testear y se alinean con el modelo reactivo de signals.

```typescript
// ✅ Preferido: inmutable, declarativo
private cleanValues(values: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(values).filter(([_, v]) => v != null && v !== '')
  );
}

// ❌ Evitar: mutación de variable local
private cleanValues(values: Record<string, any>) {
  const cleaned = {};
  Object.entries(values).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      cleaned[key] = value;
    }
  });
  return cleaned;
}
```

**Excepción:** Si la versión funcional sacrifica claridad de forma significativa (cadenas de más de 3 operaciones, reducers con lógica compleja), priorizar legibilidad sobre pureza funcional.

---

## Estados de UI

### Patrones estándar

Todo componente que dependa de datos asíncronos debe manejar estos estados:

| Estado       | Patrón                                     | Responsable                                   |
|--------------|--------------------------------------------|-----------------------------------------------|
| Cargando     | Skeleton o spinner via `app-loading`       | Componente contenedor                         |
| Vacío        | Mensaje configurable via DEFAULTS          | Componente de datos (`app-table`, `app-list`) |
| Error        | `app-error-state` con acción de reintentar | Componente contenedor                         |
| Sin permisos | `app-empty-state` con mensaje apropiado    | Guard o componente contenedor                 |

```html
<!-- Ejemplo de manejo de estados -->
@if (isLoading()) {
  <app-loading variant="skeleton" />
} @else if (hasError()) {
  <app-error-state
    [message]="errorMessage()"
    (retry)="loadData()"
  />
} @else if (items().length === 0) {
  <app-empty-state message="No hay registros" />
} @else {
  <app-table [data]="items()" [columns]="columns" />
}
```

---

## Tokens Disponibles

```scss
// Layout
var(--sidebar-width-expanded)   // 280px
var(--sidebar-width-collapsed)  // 64px
var(--toolbar-height)           // 64px
var(--transition-fast)          // 150ms
var(--transition-normal)        // 300ms

// Overlays (para SCSS custom)
var(--overlay-light-04)
var(--overlay-light-12)
var(--overlay-dark-10)

// Navegación
var(--nav-item-hover-bg)
var(--nav-item-active-bg)

// Z-Index (también disponibles como variables SCSS)
// Ver sección "Z-Index"
```

Para agregar nuevos tokens, crear PR modificando `_tokens.scss` con justificación del caso de uso.

---

## Variables SCSS: Cuándo extraer

No todo valor necesita ser una variable. Extraer a variable SCSS o token CSS cuando se cumple al menos una de estas condiciones:

- El valor se repite en más de un lugar
- El valor codifica una decisión de diseño compartida (spacing base, breakpoint)
- El valor podría cambiar de forma coordinada con otros

```scss
// ✅ BIEN: Valor compartido, se usa en cálculos
$min-slot-width: 400px;
$column-gap-px: 24px;
$container-md: ($min-slot-width * 2) + $column-gap-px;

.app-grid {
  gap: $column-gap-px;
}

@container (min-width: #{$container-md}) {
  .app-grid { grid-template-columns: 1fr 1fr; }
}

// ✅ BIEN: Valor local de un solo uso, no necesita variable
.app-detail-header {
  padding-block: 0.75rem;
}
```

**Valores que siempre deben ser tokens o variables:** colores, breakpoints, z-index, dimensiones de layout global (sidebar, toolbar), duraciones de animación.

**Valores que pueden ser literales:** padding/margin local de un componente, gap específico de un layout puntual, border-radius que no forma parte del sistema de diseño.

---

## Componentes Wrapper (PDS)

### Regla principal

**Usar wrappers de `@shared/` en lugar de componentes Material directos** cuando el wrapper exista y cubra el caso de uso necesario.

### Wrappers principales

| Wrapper              | Reemplaza (Material)                                |
|----------------------|-----------------------------------------------------|
| `<app-button>`       | `<button mat-button>`, `<button mat-raised-button>` |
| `<app-card>`         | `<mat-card>`                                        |
| `<app-badge>`        | `<mat-badge>`, elementos custom con badges          |
| `<app-checkbox>`     | `<mat-checkbox>`                                    |
| `<app-radio>`        | `<mat-radio-button>`, `<mat-radio-group>`           |
| `<app-table>`        | `<table>` + Material styling                        |
| `<app-toggle-group>` | `<mat-button-toggle-group>`                         |
| `<app-form-*>`       | `<mat-form-field>`                                  |
| `<app-loading>`      | Spinners, skeletons                                 |
| `<app-empty-state>`  | Mensajes de estado vacío                            |
| `<app-error-state>`  | Mensajes de error con retry                         |

### Cuándo NO crear un wrapper

No envolver un componente Material si el wrapper solo haría pass-through de props sin agregar lógica, defaults o estilos propios. Un wrapper debe justificar su existencia con al menos uno de: defaults del proyecto, lógica de accesibilidad, composición de múltiples elementos Material, o estilos custom.

### Cuándo el wrapper no cubre un caso

Si el wrapper existente no expone una feature de Material que se necesita:

1. Evaluar si la feature debe agregarse al wrapper (crear issue/PR)
2. Si es urgente y puntual, usar Material directo con un comentario que explique por qué y referencie el issue del wrapper
3. No duplicar lógica del wrapper en el componente consumidor

### Ejemplo

```html
<!-- ❌ MAL: Material directo cuando existe wrapper -->
<button mat-raised-button color="primary">Guardar</button>
<mat-card>Contenido</mat-card>

<!-- ✅ BIEN: Wrappers del proyecto -->
<app-button variant="raised" color="primary">Guardar</app-button>
<app-card>Contenido</app-card>

<!-- ✅ ACEPTABLE: Material directo con justificación -->
<!-- Material directo: app-button no soporta FAB extendido aún (ver issue #342) -->
<button mat-fab extended color="primary">
  <mat-icon>add</mat-icon>
  Crear registro
</button>
```

### Documentación completa

- **Props y defaults**: Ver archivo `.model.ts` de cada componente
- **Ejemplos interactivos**: Navegar a `/pds` en el proyecto

---

## Reglas de Código Limpio

### Comentarios: Cuándo sí y cuándo no

El código debe ser autodocumentado. Los nombres de variables, funciones y clases deben explicar su propósito. Sin embargo, hay contexto que el código no puede expresar por sí mismo.

**Comentarios que sí aportan valor:**

- Explicar *por qué* se tomó una decisión no obvia (regla de negocio, workaround, limitación técnica)
- JSDoc en funciones públicas de librerías compartidas y wrappers
- Referencias a issues cuando se usa un workaround temporal

```typescript
// ✅ BIEN: Explica una decisión de negocio no obvia
// Los usuarios con rol viewer pueden editar su propio perfil
// pero no el de otros, según requerimiento SEC-412
if (activeUser.role === UserRole.Viewer && targetUser.id === activeUser.id) {
  enableEditing();
}

// ✅ BIEN: Documenta un workaround
// Material CDK no emite resize en Safari iOS cuando el teclado virtual se cierra.
// Se fuerza recalcular el layout tras un delay.
// Ref: https://github.com/angular/components/issues/XXXXX
setTimeout(() => this.recalculateLayout(), KEYBOARD_DISMISS_DELAY_MS);
```

**Comentarios prohibidos:**

- Describir *qué* hace el código cuando es evidente
- Código comentado (eliminarlo; el historial de Git lo preserva)
- Separadores visuales (`// ========`, `// --- sección ---`)
- TODOs sin ticket asociado (`// TODO: fix this` no es válido, `// TODO(#451): migrar a nueva API` sí lo es)

```typescript
// ❌ MAL
// Obtiene el usuario activo del sistema
const user = getActiveUser();

// Verificamos si el usuario tiene permisos
if (user.hasPermission('admin')) {
  showAdminPanel();
}

// ✅ BIEN
const activeUser = getActiveUser();

if (activeUser.hasPermission(UserRole.Admin)) {
  showAdminPanel();
}
```

### Sin literales hardcoded

No usar strings, números o valores mágicos directamente en lógica de negocio. Extraer a constantes con nombres descriptivos.

```typescript
// ❌ MAL
if (user.role === 'admin') { }
if (retryCount > 3) { }

// ✅ BIEN
if (user.role === UserRole.Admin) { }
if (retryCount > MAX_RETRY_ATTEMPTS) { }
```

**Excepciones válidas:**

- `0`, `1`, `-1` en operaciones matemáticas obvias
- Strings y números en archivos de test (datos de prueba)
- Valores SCSS locales de un solo uso (ver sección "Variables SCSS: Cuándo extraer")

### Nombres descriptivos

```typescript
// ❌ MAL
const d = new Date();
const u = users.filter(x => x.a);
const handleClick = () => { };

// ✅ BIEN
const currentDate = new Date();
const activeUsers = users.filter(user => user.isActive);
const handleSaveButtonClick = () => { };
```

### Idioma del código

Todo el código debe estar en inglés: nombres de variables, funciones, clases, interfaces, constantes, tests y descripciones de specs.

```typescript
// ❌ MAL
const usuarioActivo = getUsuario();
it('muestra el error cuando el campo es inválido', () => { });

// ✅ BIEN
const activeUser = getUser();
it('shows the error when the field is invalid', () => { });
```

**Excepción válida:** strings de UI visibles al usuario, que deben ir en el idioma apropiado vía `$localize`.

### i18n: strings visibles al usuario

Todo string que el usuario final puede leer debe usar `$localize` con un ID de traducción explícito (`@@`). Nunca hardcodear strings en el idioma base sin registrarlos en el catálogo.

```typescript
// ❌ MAL: hardcoded, no traducible
required: 'This field is required'

// ✅ BIEN: registrado en el catálogo de traducción
required: $localize`:FormInput|Required error@@formInput.error.required:This field is required`
```

El formato del ID sigue el patrón: `contexto.elemento.estado` (todo en camelCase, separado por puntos).

### Componentes de formulario: patrón `control` input

Los componentes de formulario del ui-kit **no implementan `ControlValueAccessor`**. En su lugar, reciben el `FormControl` directamente como `input.required<FormControl>()`.

```typescript
// ❌ MAL: CVA con NG_VALUE_ACCESSOR, forwardRef y connector directive
@Component({
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AppFormInputComponent), multi: true }]
})
export class AppFormInputComponent implements ControlValueAccessor { }

// ✅ BIEN: control input directo
@Component({ /* sin providers CVA */ })
export class AppFormInputComponent {
  readonly control = input.required<FormControl<string>>();
}
```

```html
<!-- ❌ MAL -->
<app-form-input formControlName="email" appFormInputConnector />

<!-- ✅ BIEN -->
<app-form-input [control]="form.controls.email" />
```

**Ventajas:** elimina la circularidad NG0200, el warning de WebStorm, y las connector directives. Type safety total al pasar `FormControl<T>` tipado.

**Reactividad de estado:** usar `ctrl.events` + un `signal` como ticker para que los `computed` reaccionen a cambios de `touched`/`dirty`/`status`, que son propiedades planas (no signals) del `FormControl`.

```typescript
private readonly controlEventTick = signal(0);

constructor() {
  effect(() => {
    this.control().events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.controlEventTick.update(v => v + 1));
  });
}
```

**Cuándo mostrar errores:** solo cuando el control es `touched` (no `dirty`). El error aparece al salir del campo, no mientras se escribe.

```typescript
const shouldShow = ctrl.invalid && ctrl.touched;
```

---

## Testing

### Filosofía: Caja Negra

Los tests verifican comportamiento observable, no implementación interna. **Prohibido:** acceder a `fixture.componentInstance` para leer estado o invocar métodos. **Correcto:** interactuar con el DOM via `userEvent` y hacer aserciones con `@testing-library/jest-dom`.

```typescript
// ❌ MAL: acceso a internos
component.submitForm();
expect(component.isLoading).toBe(true);

// ✅ BIEN: caja negra
await user.click(screen.getByTestId('submit-button'));
expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
```

### Selectores: `data-testid`

El único selector válido en tests es `data-testid`. Ni clases CSS, ni IDs, ni texto visible. Si el template no tiene `data-testid`, agregarlos al implementar el test.

```html
<!-- ✅ BIEN -->
<button data-testid="submit-button" mat-raised-button color="primary">Guardar</button>
```

```typescript
// ❌ MAL
screen.getByText('Guardar');
container.querySelector('.submit-btn');

// ✅ BIEN
screen.getByTestId('submit-button');
```

### Visibilidad `protected`

Los miembros del componente usados exclusivamente por el template deben declararse `protected`, no `public`. Esto expresa que forman parte de la API de presentación, no de la API pública del componente.

```typescript
// ❌ MAL
isLoading = signal(false);
handleSubmit() { }

// ✅ BIEN
protected isLoading = signal(false);
protected handleSubmit() { }
```

**Excepción:** miembros accedidos desde tests directamente o desde componentes padre deben ser `public`.

### Stubs reutilizables

Antes de crear un stub o mock local en un test, verificar si ya existe uno en `src/tests/stubs/`. No duplicar stubs entre archivos de test.

```typescript
import { MatIconStub } from '@tests/stubs/material/mat-icon.stub';
```

### Nomenclatura de tests

Los bloques `it()` deben ser descriptivos en inglés. Prohibido prefijos del tipo `TC-`.

```typescript
// ❌ MAL
it('TC-01 - login', () => { });
it('muestra error', () => { });

// ✅ BIEN
it('shows error message when credentials are invalid', () => { });
it('redirects to dashboard after successful login', () => { });
```

### E2E (Playwright)

**Configuración centralizada:** Prohibido hardcodear URLs, credenciales o timeouts en los `.spec.ts`. Usar `e2e/config/test.config.ts`.

**Fixtures:** Reutilizar las fixtures de `e2e/fixtures/` para setup y teardown. No repetir lógica de navegación o autenticación entre specs.

**Esperas:** Usar `waitForURL` o `waitForSelector`. Nunca esperas estáticas (`waitForTimeout()`).

```typescript
// ❌ MAL
await page.goto('http://localhost:4200/auth/login');
await page.waitForTimeout(2000);

// ✅ BIEN
import { testConfig } from '../../config/test.config';
await page.waitForURL(`**${testConfig.routes.dashboard}`);
```

---

## Árbol de Decisión

```
¿Necesitas un estilo?
│
├─ ¿Es layout/spacing/overflow? ─────► Tailwind (flex, p-6, gap-4, overflow-auto)
│
├─ ¿Es border/radius/shadow? ────────► Tailwind (border-t, rounded-lg, shadow-md)
│
├─ ¿Es tipografía? ──────────────────► Material (mat-headline-large, mat-body-medium)
│
├─ ¿Existe wrapper en PDS? ──────────► Wrapper (app-button, app-card)
│
├─ ¿Existe en Material? ─────────────► Material (mat-icon, color="primary")
│
├─ ¿Es un color? ────────────────────► Material o SCSS con tokens
│
├─ ¿Es z-index? ─────────────────────► Variable SCSS ($z-index-*)
│
└─ ¿Nada de lo anterior? ────────────► SCSS con tokens del proyecto
```

---

## Checklist Pre-Commit

- [ ] Sin `bg-{color}-*`, `text-{color}-*`, `border-{color}-*` de Tailwind (excepto zona gris documentada)
- [ ] Sin `dark:*` de Tailwind
- [ ] Sin clases tipográficas de Tailwind (`text-sm`, `font-bold`, etc.)
- [ ] Colores solo via Material o tokens SCSS
- [ ] Tipografía via Material typography levels
- [ ] Archivo `.model.ts` con DEFAULTS si el componente tiene inputs
- [ ] Clases CSS con prefijo `app-{componente}-`
- [ ] Z-index usa variables del sistema, no valores numéricos directos
- [ ] Wrappers PDS usados donde existen
- [ ] Elementos interactivos custom son accesibles por teclado
- [ ] Botones de solo icono tienen `aria-label`
- [ ] Imágenes tienen `alt` descriptivo
- [ ] Estados asíncronos manejan loading, error y vacío
- [ ] Sin comentarios que describen *qué* hace el código
- [ ] Sin código comentado
- [ ] Sin TODOs sin ticket
- [ ] Todo el código (variables, funciones, clases, tests) está en inglés
- [ ] Strings visibles al usuario usan `$localize` con ID de traducción (`@@`)
- [ ] Componentes de formulario usan patrón `control` input, no CVA
- [ ] Miembros usados solo por el template son `protected`
- [ ] Templates con elementos interactivos tienen `data-testid`
- [ ] Tests acceden al DOM vía `data-testid`, no vía `componentInstance`
- [ ] No hay stubs duplicados (verificar `src/tests/stubs/`)
- [ ] `it()` descriptivos en inglés, sin prefijos `TC-`
- [ ] Tests E2E sin URLs, credenciales ni timeouts hardcodeados
- [ ] `ng build` pasa sin errores
- [ ] Tests pasan (`ng test`)

---
