# Análisis de Arquitectura: `app-table-client-side` y `app-table-server-side`

> **Autor:** GitHub Copilot (Software Architect Partner)
> **Fecha:** 2026-02-23
> **Scope:** `src/app/shared/organisms/app-table-client-side` y `app-table-server-side`
> **Referencia:** STYLE_GUIDE.md · Clean Code · SOLID · GRASP · KISS · DRY

---

## Resumen Ejecutivo

Ambos organismos presentan una arquitectura sólida, correctamente fundamentada en el modelo reactivo de Angular Signals, con una separación clara de responsabilidades respecto al átomo `app-table`. Sin embargo, existen **5 áreas de mejora concretas** que afectan consistencia, mantenibilidad y alineación con la guía de estilos del proyecto.

| Área | Client-Side | Server-Side |
|---|---|---|
| STYLE_GUIDE (CSS) | ⚠️ 1 hallazgo | ⚠️ 1 hallazgo |
| SOLID | ✅ | ⚠️ 1 hallazgo |
| GRASP | ✅ | ✅ |
| DRY | ⚠️ Crítico | ⚠️ Crítico |
| KISS | ✅ | ✅ |
| Clean Code | ⚠️ 2 hallazgos | ⚠️ 2 hallazgos |
| Modelo (.model.ts) | ⚠️ Incompleto | ✅ Correcto |
| Tests | ❌ Ausentes | ❌ Ausentes |
| Accesibilidad | ⚠️ | ⚠️ |

---

## 1. STYLE_GUIDE

### 1.1 Colores hardcoded en SCSS — `#e0e0e0` ❌

**Aplica a:** ambos componentes

**Archivos:**
- `app-table-client-side.component.scss` línea 6
- `app-table-server-side.component.scss` línea 6

```scss
// ❌ MAL — valor hexadecimal hardcoded como fallback
border: 1px solid var(--mat-sys-outline-variant, #e0e0e0);
```

La STYLE_GUIDE establece que **los colores siempre deben gestionarse a través de Material o tokens SCSS del proyecto**. Un valor hexadecimal hardcoded como fallback es un color manual que evade el sistema de theming. Si el token `--mat-sys-outline-variant` no está disponible, el problema está en la configuración del tema, no en el componente.

**Corrección:**

```scss
// ✅ BIEN — sin fallback hardcoded
border: 1px solid var(--mat-sys-outline-variant);
```

O, si el fallback es semánticamente necesario, referenciar un token del proyecto:

```scss
// ✅ BIEN — fallback via token del proyecto
border: 1px solid var(--mat-sys-outline-variant, var(--overlay-dark-10));
```

### 1.2 Prefijo de clase CSS del wrapper raíz

Las clases `.app-client-side-table` y `.app-server-side-table` respetan el prefijo `app-`. ✅

### 1.3 Tailwind en HTML — `mb-4` en `app-card`

```html
<app-card class="mb-4" ...>
```

La clase `mb-4` es spacing de Tailwind, lo que es **correcto** según la STYLE_GUIDE ("Tailwind gestiona layout"). ✅

---

## 2. Principios SOLID

### 2.1 Single Responsibility Principle (SRP) ✅

Cada organismo tiene una responsabilidad clara y bien delimitada:
- `app-table-client-side`: orquesta filtrado, ordenación y paginación **en memoria**.
- `app-table-server-side`: orquesta la **emisión de parámetros** hacia el backend.

La delegación hacia los átomos (`app-table`, `app-pagination`) y moléculas (`app-filters-*`) es correcta y evita que los organismos absorban responsabilidades ajenas.

### 2.2 Open/Closed Principle (OCP) ✅

La extensibilidad mediante `filterFn` y `sortFn` en el componente client-side es un diseño abierto a extensión y cerrado a modificación. El consumidor puede inyectar estrategias custom sin tocar el organismo.

### 2.3 Dependency Inversion Principle (DIP) — `criteriaToValues` ⚠️

**Aplica a:** `app-table-server-side`

```typescript
private criteriaToValues(criteria: AppFilterCriterion[]): AppFilterValues {
  return criteria.reduce((acc, criterion) => {
    acc[criterion.field.key] = criterion.value;
    return acc;
  }, {} as AppFilterValues);
}
```

Esta lógica de transformación (`AppFilterCriterion[] → AppFilterValues`) es un detalle de la capa de filtros, no del organismo de tabla. El organismo **depende de un detalle de implementación del modelo de filtros** en lugar de depender de una abstracción. Dado que `evaluateCriteria` ya vive en `criteria-evaluator.utils.ts`, esta transformación inversa debería vivir en un util similar o ser responsabilidad del componente de filtros.

**Propuesta:**

```typescript
// app-filters/criteria-evaluator.utils.ts (o un nuevo criteria-mapper.utils.ts)
export function criteriaToValues(criteria: AppFilterCriterion[]): AppFilterValues {
  return Object.fromEntries(criteria.map(c => [c.field.key, c.value]));
}
```

Esto alinea con el patrón ya existente de `evaluateCriteria` y elimina la dependencia directa del organismo sobre la estructura interna de `AppFilterCriterion`.

---

## 3. GRASP

### 3.1 Information Expert ✅

El organismo client-side aplica correctamente el principio de Experto en Información: es el componente que tiene acceso a `data`, `currentFilters`, `currentSort` y `pageIndex`, por lo que es el lugar correcto para computar `filteredData`, `sortedData` y `displayData`.

### 3.2 Controller ✅

Los métodos `onFiltersChange`, `onSortChange`, `onPageChange` actúan como controladores que coordinan la actualización de estado y la emisión de eventos, sin mezclar lógica de presentación ni de negocio.

### 3.3 High Cohesion / Low Coupling ✅

Ambos organismos presentan alta cohesión: cada signal, computed y método contribuye directamente a la responsabilidad central del componente. El acoplamiento con los átomos se hace a través de contratos de inputs/outputs bien definidos, no de acceso directo a instancias.

---

## 4. DRY (Don't Repeat Yourself) — Hallazgo Crítico ❌

### 4.1 Duplicación estructural entre ambos organismos

Ambos componentes comparten, byte a byte, los siguientes elementos:

| Elemento duplicado | client-side | server-side |
|---|---|---|
| Inputs: `tableConfig`, `filtersConfig`, `useAdvancedFilters`, `showPagination`, `paginationConfig`, `data`, `loading` | ✅ | ✅ |
| Outputs: `sortChange`, `pageChange`, `rowClick`, `actionClick`, `filtersChange` | ✅ | ✅ |
| Signal: `currentSort`, `pageIndex`, `pageSize`, `projectedCellTemplate` | ✅ | ✅ |
| Computed: `safeFiltersConfig`, `safePaginationConfig`, `paginationState` | ✅ | ✅ |
| Effect: `boundaryGuard` | ✅ | ✅ |
| Métodos: `onSortChange` (parcial), `onPageChange` | ✅ | ✅ |
| Template del bloque de filtros | ✅ | ✅ |
| Template del bloque de paginación | ✅ | ✅ |
| SCSS completo | ✅ | ✅ |

Esto representa una violación grave del principio DRY y genera un riesgo de **desincronización**: cualquier corrección de bug o mejora en uno debe replicarse manualmente en el otro.

### 4.2 Propuesta de Refactor: Clase Base Abstracta

El patrón recomendado para Angular en este caso es una **clase base abstracta** que centralice el estado y comportamiento compartido:

```typescript
// app-table-base.ts (en shared/organisms/ o en un subdirectorio shared/)
export abstract class AppTableBase<T extends Record<string, any>> {
  // --- Inputs comunes ---
  readonly tableConfig = input.required<AppTableConfig<T>>();
  readonly filtersConfig = input<AppFiltersConfig>();
  readonly useAdvancedFilters = input<boolean>(false);
  readonly showPagination = input<boolean>(true);
  readonly paginationConfig = input<AppPaginationConfig>();
  readonly data = input<T[]>([]);
  readonly loading = input(false);
  readonly resetPageOnFilter = input(true);
  readonly resetPageOnSort = input(false);

  // --- Outputs comunes ---
  sortChange = output<AppTableSort>();
  pageChange = output<AppPageEvent>();
  rowClick = output<T>();
  actionClick = output<{ action: AppTableAction<T>; row: T }>();

  // --- Estado común ---
  readonly projectedCellTemplate = contentChild<TemplateRef<unknown>>('cellTemplate');
  readonly currentSort = signal<AppTableSort>({ active: '', direction: '' });
  readonly pageIndex: WritableSignal<number> = signal(0);
  readonly pageSize: WritableSignal<number> = signal(10);

  // --- Computeds comunes ---
  readonly safeFiltersConfig = computed(() => this.filtersConfig());
  readonly safePaginationConfig = computed(() => this.paginationConfig());
  readonly paginationState = computed<AppPaginationState>(() => ({
    pageIndex: this.pageIndex(),
    pageSize: this.pageSize(),
    totalItems: this.totalItemsForPagination(),
  }));

  // --- Hook para que cada subclase provea el total ---
  protected abstract totalItemsForPagination(): number;

  // --- Handlers comunes ---
  onSortChange(sort: AppTableSort): void {
    this.currentSort.set(sort);
    if (this.resetPageOnSort()) this.pageIndex.set(0);
    this.sortChange.emit(sort);
  }

  onPageChange(event: AppPageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.pageChange.emit(event);
  }
}
```

Cada organismo extendería esta clase y solo implementaría lo diferencial:

```typescript
// app-table-client-side: agrega filtrado/ordenación en memoria
export class AppTableClientSideComponent<T> extends AppTableBase<T> {
  // Solo lo que es exclusivo: filterFn, sortFn, lógica de filtrado/sort en memoria
  protected override totalItemsForPagination = () => this.sortedData().length;
}

// app-table-server-side: agrega totalItems externo, paramsChange, criteriaToValues
export class AppTableServerSideComponent<T> extends AppTableBase<T> {
  readonly totalItems = input<number>(0);
  protected override totalItemsForPagination = () => this.totalItems();
}
```

> **Nota:** En Angular, el uso de herencia en componentes standalone requiere que la clase base **no sea un componente** (no lleva `@Component`). Es simplemente una clase TypeScript. Los `input()`, `output()` y `signal()` heredados funcionan correctamente en este patrón.

---

## 5. KISS (Keep It Simple, Stupid) ✅

### 5.1 `safeFiltersConfig` y `safePaginationConfig`

```typescript
readonly safeFiltersConfig = computed(() => this.filtersConfig());
readonly safePaginationConfig = computed(() => this.paginationConfig());
```

Estos computeds son un pass-through puro que no añaden lógica. Su propósito es hacer el template más legible al usar el operador `as` de Angular (`@if (safeFiltersConfig(); as config)`). Es un patrón válido y simple. ✅

### 5.2 `defaultSort` en client-side

La implementación de `defaultSort` es correcta, con manejo de nulos y preservación de inmutabilidad (`[...data].sort(...)`). Está bien encapsulada como método privado. ✅

### 5.3 `_boundaryGuard` — convención de nomenclatura

```typescript
// client-side
private readonly _boundaryGuard = effect(...)

// server-side
private readonly boundaryGuard = effect(...)
```

Una inconsistencia menor: el client-side usa prefijo `_` para indicar que la variable no se usa directamente, mientras que el server-side no. La guía de estilos no define explícitamente esta convención, pero la inconsistencia entre dos componentes tan similares genera ruido. Estandarizar a uno u otro.

---

## 6. Clean Code

### 6.1 `/* eslint-disable @typescript-eslint/no-explicit-any */` ❌

Ambos archivos deshabilitan globalmente la regla `no-explicit-any` con un comentario de bloque. La STYLE_GUIDE prohíbe los comentarios que no aporten valor, y esta práctica evita que el linter señale usos problemáticos de `any` en el resto del archivo.

El uso de `any` está justificado por la constraint genérica `T extends Record<string, any>`, pero el disable debería ser localizado:

```typescript
// ❌ MAL — deshabilita todo el archivo
/* eslint-disable @typescript-eslint/no-explicit-any */

// ✅ BIEN — solo en la línea que lo necesita
export class AppTableClientSideComponent<T extends Record<string, any>> {
//                                                           ^^^ aquí el any es inevitable
```

O bien, tipar con `unknown` y usar type guards donde sea posible.

### 6.2 `AppTableServerResponse<T>` sin uso ⚠️

**Aplica a:** `app-table-server-side.model.ts`

```typescript
export interface AppTableServerResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

Esta interfaz está definida en el modelo pero **no se usa en ningún lugar del organismo ni del proyecto** (verificado mediante búsqueda en el workspace). Código no utilizado viola el principio de código limpio y genera confusión sobre su propósito.

**Opciones:**
1. Moverla al modelo de la capa de servicios/contratos si es un contrato de API.
2. Eliminarla si no tiene uso previsto documentado.

### 6.3 Trailing blank lines ⚠️

`app-table-server-side.component.ts` termina con 3 líneas en blanco. Detalle menor pero inconsistente con el estilo del resto del proyecto.

---

## 7. Modelo (`.model.ts`)

### 7.1 `app-table-client-side.model.ts` — DEFAULTS ausentes ❌

```typescript
// ❌ MAL — solo tipos, sin DEFAULTS
export type AppTableFilterFn<T> = ...
export type AppTableSortFn<T> = ...
```

La STYLE_GUIDE establece que **todos los inputs deben tener DEFAULTS obligatorios definidos en `.model.ts`**. El client-side tiene inputs con defaults inline (`input<boolean>(false)`, `input(true)`, `input(10)`) pero esos valores no están centralizados en el modelo como lo hace el server-side con `TABLE_SERVER_SIDE_DEFAULTS`.

**Corrección:**

```typescript
// app-table-client-side.model.ts
import { AppTableSort } from "@shared/atoms/app-table/app-table.model";
import { AppFilterCriterion } from "@shared/molecules/app-filters/app-filter.model";

export type AppTableFilterFn<T> = (data: T[], criteria: AppFilterCriterion[]) => T[];
export type AppTableSortFn<T> = (data: T[], sort: AppTableSort) => T[];

export const TABLE_CLIENT_SIDE_DEFAULTS = {
  useAdvancedFilters: false,
  showPagination: true,
  resetPageOnFilter: true,
  resetPageOnSort: false,
  initialPageIndex: 0,
  initialPageSize: 10,
} as const;
```

Y en el componente:

```typescript
readonly useAdvancedFilters = input<boolean>(TABLE_CLIENT_SIDE_DEFAULTS.useAdvancedFilters);
readonly showPagination = input<boolean>(TABLE_CLIENT_SIDE_DEFAULTS.showPagination);
// ...
```

### 7.2 `app-table-server-side.model.ts` ✅

Correcto: tiene `TABLE_SERVER_SIDE_DEFAULTS` con `as const`, cubre todos los inputs con valor por defecto, y separa correctamente las interfaces de contrato (`AppTableServerParams`, `AppTableServerResponse`).

---

## 8. Tests ❌

**Aplica a ambos componentes.**

No existe ningún archivo `.spec.ts` para estos organismos (solo existe `app.spec.ts` en todo el workspace). Dada la complejidad de la lógica en client-side (filtrado, ordenación, paginación en memoria, boundary guard), la ausencia de tests es el riesgo más alto del proyecto.

### Escenarios mínimos recomendados para `app-table-client-side`:

| Escenario | Tipo |
|---|---|
| Renderiza datos en la tabla | Unit |
| Filtrado con `evaluateCriteria` reduce los datos mostrados | Unit |
| Filtrado con `filterFn` custom invoca la función provista | Unit |
| Ordenación ascendente/descendente con `defaultSort` | Unit |
| `resetPageOnFilter: true` resetea el índice de página | Unit |
| `boundaryGuard` mueve la página al último índice válido | Unit |
| Emite `filtersChange` al cambiar filtros | Unit |
| Emite `paramsChange` correctamente (server-side) | Unit |

### Escenarios mínimos para `app-table-server-side`:

| Escenario | Tipo |
|---|---|
| `currentParams` computa correctamente con todos los valores | Unit |
| `criteriaToValues` mapea correctamente `AppFilterCriterion[]` | Unit |
| `boundaryGuard` no ejecuta cuando `totalItems === 0` | Unit |
| `paramsChange` se emite en cada cambio de filtros/sort/página | Unit |

---

## 9. Accesibilidad ⚠️

El bloque de filtros avanzados usa `app-card` con `title="Filtros avanzados"` e `icon="filter_alt"`. Verificar que `app-card` expone correctamente `aria-expanded` cuando `isExpandable: true`, ya que el estado expandido/colapsado debe ser comunicado a lectores de pantalla.

El `ng-content` del template server-side usa `select="[cellTemplate]"` mientras que el client-side usa `<ng-content/>` sin selector. Esta inconsistencia puede causar confusión al consumidor:

```html
<!-- client-side: acepta cualquier contenido proyectado -->
<ng-content/>

<!-- server-side: solo acepta contenido con atributo cellTemplate -->
<ng-content select="[cellTemplate]"/>
```

**Recomendación:** Estandarizar ambos al slot nombrado `select="[cellTemplate]"` para mantener coherencia y evitar proyección accidental de contenido no deseado.

---

## 10. Resumen de Hallazgos y Prioridades

| # | Hallazgo | Severidad | Principio | Aplica a |
|---|---|---|---|---|
| 1 | **Duplicación estructural masiva** — no existe clase base compartida | 🔴 Alta | DRY | Ambos |
| 2 | **DEFAULTS ausentes en client-side model** | 🔴 Alta | STYLE_GUIDE / Clean Code | Client-side |
| 3 | **Ausencia total de tests** | 🔴 Alta | Clean Code | Ambos |
| 4 | **`AppTableServerResponse<T>` sin uso** | 🟡 Media | Clean Code | Server-side |
| 5 | **`criteriaToValues` debería vivir en utils de filtros** | 🟡 Media | DIP / SRP | Server-side |
| 6 | **Color hardcoded `#e0e0e0` como fallback en SCSS** | 🟡 Media | STYLE_GUIDE | Ambos |
| 7 | **`eslint-disable` global en lugar de localizado** | 🟡 Media | Clean Code | Ambos |
| 8 | **`ng-content` inconsistente entre ambos templates** | 🟡 Media | Consistencia / Accesibilidad | Ambos |
| 9 | **Convención `_boundaryGuard` inconsistente** | 🟢 Baja | Clean Code | Ambos |
| 10 | **Trailing blank lines en server-side** | 🟢 Baja | Clean Code | Server-side |

---

## 11. Puntos Fuertes — Lo que está bien

Es importante reconocer lo que funciona correctamente:

- ✅ **Arquitectura Signal-first**: Uso correcto y consistente de `signal`, `computed` y `effect`. No hay `ngOnChanges`, no hay subscripciones manuales, no hay `BehaviorSubject`.
- ✅ **ChangeDetectionStrategy.OnPush** en ambos. Correcto para componentes con inputs inmutables.
- ✅ **Patrón estrategia en client-side**: `filterFn` y `sortFn` como inputs opcionales permiten extensión sin modificación.
- ✅ **`currentParams` en server-side**: Computed que agrega todos los parámetros en un solo objeto es un diseño excelente para el consumidor — una sola suscripción a `paramsChange` lo cubre todo.
- ✅ **`boundaryGuard` effect**: Evita estados inconsistentes de paginación cuando el dataset cambia. Correctamente implementado.
- ✅ **`defaultSort` inmutable**: Usa `[...data].sort()` preservando inmutabilidad.
- ✅ **Separación organismo/átomo**: Los organismos no reimplementan la tabla, la componen. Correcto uso de Atomic Design.
- ✅ **`TABLE_SERVER_SIDE_DEFAULTS` con `as const`**: Patrón correcto según STYLE_GUIDE.
- ✅ **Funcional sobre imperativo**: Uso de `filter`, `map`, `reduce`, `slice` en lugar de bucles con mutación.

---

*Documento generado el 2026-02-23 — revisión recomendada tras aplicar refactors.*

