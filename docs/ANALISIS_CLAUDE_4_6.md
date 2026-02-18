

*Thinking...*

> The user wants me to analyze their implementation of `AppTableClientSide` and how they can leverage the versatility of `AppTableFiltersAdvanced` for both client-side and server-side table scenarios. They want a thorough, methodical analysis document.
> 
> Let me analyze the code carefully:
> 
> ## Current Architecture Analysis
> 
> ### 1. AppTableFiltersAdvancedComponent
> - A standalone component that manages filter criteria (field + operator + value)
> - Has toggles (show inactive, show deleted)
> - Outputs `AppTableFiltersAdvancedOutput` with criteria and toggles
> - Well-structured with computed signals, form cascading, etc.
> 
> 
> ### 2. AppTableClientSideComponent
> - Orchestrates table, filters (simple and advanced), and pagination
> - Takes `data` as input and does client-side filtering, sorting, pagination
> - Has a `convertAdvancedToSimple` function that converts advanced criteria to simple filter values
> 
> ### 3. The Problem
> The conversion function is the bottleneck—it only handles `eq` and `contains` operators, which means the advanced filters lose their power when applied client-side. All the sophisticated filtering capabilities like `gt`, `lt`, `starts_with` get discarded, essentially reducing advanced filters to basic equality checks.
> 
> The `defaultFilterFn` is also too basic, using only case-insensitive substring matching instead of respecting the operator semantics from the advanced filters. This architectural mismatch happens because the rich, structured filter criteria get flattened into a simple key-value model that can't preserve operator information.
> 
> For server-side filtering, the full criteria with operators should be sent to the backend, but client-side needs a proper evaluation engine that can interpret those same criteria locally rather than converting them to a lossy format. I should build a criteria engine that applies the filter criteria directly against the data, respecting all the operators the advanced filter supports. I'm recognizing that the filtering logic needs to be extracted into a separate service so both client and server can use it consistently, and the component should work directly with criteria instead of converting to simple filters, which loses information. The current approach converts advanced filters to simple ones through a lossy transformation, but it would be better to maintain criteria throughout and let the component handle both simple and advanced filter paths natively, or normalize everything to criteria internally.
> 
> For the client-side component, I should add a separate signal for criteria state alongside the existing simple filter values, then modify the filtered data computation to use the appropriate evaluation path depending on which filter type is active. The `convertAdvancedToSimple` function should be removed from the client flow entirely, and I'll create a standalone criteria evaluation utility that can be reused across components. The key insight is that simple and advanced filters genuinely need different handling—simple filters use basic key-value matching while advanced filters need proper criteria evaluation—so trying to force them into one system might be over-engineering when a dual-path approach is more pragmatic.
> 
> I also notice the component doesn't enforce mutual exclusivity between simple and advanced filter modes, and the toggles like `showInactive` and `showDeleted` are being ignored in the advanced search handler even though they're part of the output. Additionally, there's an architectural violation where the shared `AppTableClientSideComponent` imports `convertAdvancedToSimple` from a feature-specific utility module—this conversion logic should either move to the shared layer or be removed entirely from the shared component's dependencies.

# Análisis Arquitectónico: AppTableClientSide y AppTableFiltersAdvanced

---

## 1. Resumen Ejecutivo

Tu diseño muestra una intención arquitectónica sólida: un componente de filtros avanzados reutilizable (`AppTableFiltersAdvanced`) que sirva tanto para escenarios client-side como server-side. Sin embargo, existe un **problema central crítico**: el puente entre `AppTableFiltersAdvanced` y `AppTableClientSide` destruye la riqueza semántica de los criterios avanzados mediante una conversión lossy (`convertAdvancedToSimple`). Esto anula en la práctica la versatilidad del sistema de filtrado avanzado cuando opera en modo client-side.

A continuación presento un análisis exhaustivo con hallazgos categorizados por severidad, una propuesta arquitectónica y ejemplos de implementación.

---

## 2. Análisis del Flujo Actual

El flujo actual cuando el usuario utiliza filtros avanzados en client-side es el siguiente:

El usuario construye criterios con campo, operador y valor. El componente `AppTableFiltersAdvanced` emite un `AppTableFiltersAdvancedOutput` que contiene un array de `AppTableFilterCriterion[]` (cada uno con campo, operador y valor tipados) más un record de toggles. Luego, `AppTableClientSideComponent.onAdvancedSearch()` recibe esa salida y llama a `convertAdvancedToSimple()`, que descarta el operador y retorna solo pares `{clave: valor}` como `AppTableFilterValues`. Finalmente, `filteredData` computed aplica `defaultFilterFn`, que hace un `String.includes` case-insensitive para todo.

El resultado es que de los 12 operadores definidos en `DEFAULT_FILTER_OPERATORS`, solo dos (`eq` y `contains`) tienen algún efecto, y ambos se reducen al mismo comportamiento: un `includes` textual. Los operadores `gt`, `lt`, `gte`, `lte`, `neq`, `not_contains`, `starts_with`, `ends_with`, `is_null` e `is_not_null` son completamente ignorados.

---

## 3. Hallazgos por Severidad

### 3.1 — Críticos

**H1: Conversión lossy destruye la semántica de los criterios.**  
La función `convertAdvancedToSimple` reduce `AppTableFilterCriterion[]` a `Record<string, any>`, perdiendo toda información sobre el operador. Esto significa que un usuario que configure "Salario > 50000" obtiene el mismo resultado que "Salario contiene 50000", lo cual es incorrecto funcionalmente y engañoso para el usuario final.

**H2: Violación de dependencia entre capas.**  
`AppTableClientSideComponent` (ubicado en `@shared/molecules/`) importa directamente desde `src/app/features/pds/shared/utils/filter-config-converter`. Esto crea un acoplamiento ascendente donde una librería compartida depende de un módulo de feature. Esto rompe el principio de dirección de dependencias: las capas inferiores (shared) nunca deben conocer las capas superiores (features).

**H3: `defaultFilterFn` no puede expresar la semántica del filtrado avanzado.**  
Recibe `AppTableFilterValues` (pares clave-valor sin operador). Es estructuralmente imposible que esta función distinga entre "es igual a", "mayor que", "empieza con", etc. No es un bug de implementación, es una limitación del contrato.

### 3.2 — Importantes

**H4: Los toggles no participan en el filtrado client-side.**  
En `onAdvancedSearch`, los toggles se emiten hacia el padre pero no afectan `filteredData`. Si el usuario activa "Mostrar inactivos", los datos no cambian. En server-side el backend los interpretaría, pero en client-side nadie los procesa.

**H5: No hay exclusión mutua entre filtros simples y avanzados.**  
El template muestra ambos (`filtersConfig` y `filtersAdvancedConfig`) si ambos están configurados. Ambos escriben sobre el mismo `filterValues` signal. Si el usuario usa filtros simples y luego avanzados (o viceversa), los estados se mezclan sin limpieza. El consumidor `TableClientSideComponent` tiene un `filterMode` signal, pero `AppTableClientSideComponent` no lo recibe ni lo usa.

**H6: Estado de filtrado unificado insuficiente.**  
Existe un único `filterValues: signal<AppTableFilterValues>({})` como fuente de verdad para el filtrado. Este tipo plano no puede representar criterios avanzados. Esto obliga a la conversión lossy.

### 3.3 — Menores

**H7: `convertToAdvancedConfig` hardcodea toggles.**  
La función en `filter-config-converter.ts` siempre inyecta "Mostrar inactivos" y "Mostrar eliminados". Estos toggles deberían ser configurables por el consumidor, no asumidos por una utilidad de conversión.

**H8: Uso de `as any` en el type mapping.**  
En `convertToAdvancedConfig`, `type: f.type as any` oculta posibles incompatibilidades de tipo entre `AppTableFiltersConfig` y `AppTableFilterFieldType`.

**H9: `criterionCounter` no es resiliente a re-inicialización.**  
Si `initialCriteria` contiene IDs como `criterion_5`, el counter empieza en 0 y puede colisionar.

---

## 4. Propuesta Arquitectónica

### 4.1 — Principio rector

`AppTableFiltersAdvanced` produce `AppTableFilterCriterion[]`. Este es el contrato más expresivo y debe ser la unidad fundamental de filtrado. Tanto el componente client-side como el server-side deben consumir criterios directamente, cada uno con su propia estrategia de evaluación.

El diagrama conceptual es:

```
AppTableFiltersAdvanced
         │
         ▼
  AppTableFilterCriterion[]
         │
    ┌────┴────┐
    ▼         ▼
 Client      Server
 (evalúa     (serializa
  localmente)  y envía al API)
```

### 4.2 — Cambios propuestos

**Cambio 1: Crear un motor de evaluación de criterios client-side.**  
Una función pura `evaluateCriteria<T>(data: T[], criteria: AppTableFilterCriterion[]): T[]` que implementa la lógica de cada operador. Esta función se ubica en el mismo directorio que el modelo de filtros avanzados (capa shared). Es la pieza que actualmente no existe y que conecta la expresividad del modelo con la evaluación real.

**Cambio 2: Introducir estado dual de filtrado en `AppTableClientSideComponent`.**  
En lugar de un solo `filterValues` signal, el componente mantiene dos señales: `simpleFilterValues` para los filtros simples y `advancedCriteria` para los criterios avanzados. El computed `filteredData` aplica la ruta correspondiente según cuál tenga datos. Esto elimina la necesidad de conversión lossy.

**Cambio 3: Eliminar `convertAdvancedToSimple` del flujo de filtrado.**  
La función puede conservarse como utilidad de migración o compatibilidad, pero no debe estar en el camino crítico del filtrado client-side.

**Cambio 4: Mover las utilidades compartidas a la capa shared.**  
Si alguna utilidad de conversión es necesaria desde `@shared`, debe vivir en `@shared`, no en `features/pds`.

**Cambio 5: Procesar toggles en el filtrado client-side.**  
El componente debe recibir una función opcional `toggleFilterFn` que, dada la data y los toggles activos, filtra los registros correspondientes. Alternativamente, los toggles se pueden mapear a criterios implícitos.

**Cambio 6: Permitir inyectar un `criteriaFilterFn` custom.**  
Análogo al actual `filterFn` para filtros simples, se añade un input `criteriaFilterFn` que permite al consumidor sobrescribir la evaluación client-side de criterios. Esto respeta el Open/Closed principle: el comportamiento por defecto es extensible sin modificar el componente.

### 4.3 — Contratos propuestos

```
AppTableClientSideComponent
  inputs:
    data: T[]
    tableConfig: AppTableConfig<T>
    filtersConfig?: AppTableFiltersConfig          // filtros simples
    filtersAdvancedConfig?: AppTableFiltersAdvancedConfig  // filtros avanzados
    paginationConfig?: AppTablePaginationConfig
    filterFn?: (data: T[], filters: AppTableFilterValues) => T[]
    criteriaFilterFn?: (data: T[], criteria: AppTableFilterCriterion[]) => T[]
    toggleFilterFn?: (data: T[], toggles: Record<string, boolean>) => T[]
    sortFn?: (data: T[], sort: AppTableSort) => T[]

  estado interno:
    simpleFilterValues: signal<AppTableFilterValues>
    advancedCriteria: signal<AppTableFilterCriterion[]>
    activeToggles: signal<Record<string, boolean>>
    currentSort: signal<AppTableSort>
    pageIndex: signal<number>
    pageSize: signal<number>

  pipeline computed:
    afterToggleFilter  = toggleFilterFn(data, activeToggles)
    afterCriteriaFilter = criteriaFilterFn(afterToggleFilter, advancedCriteria) 
                          OR simpleFilterFn(afterToggleFilter, simpleFilterValues)
    afterSort          = sortFn(afterCriteriaFilter, currentSort)
    displayData        = paginate(afterSort)
```

---

## 5. Implementación Propuesta

### 5.1 — Motor de evaluación de criterios

Este archivo se ubica junto al modelo de filtros avanzados en la capa shared:

```typescript
// app-simple-filters-advanced/criteria-evaluator.ts

import { AppTableFilterCriterion, FilterValue } from './app-simple-filters-advanced.model';

export function evaluateCriteria<T extends Record<string, any>>(
  data: T[],
  criteria: AppTableFilterCriterion[]
): T[] {
  if (!criteria.length) return data;
  return data.filter(item => criteria.every(c => evaluateOne(item, c)));
}

function evaluateOne<T extends Record<string, any>>(
  item: T,
  criterion: AppTableFilterCriterion
): boolean {
  const raw = item[criterion.field.key];
  const target = criterion.value;
  const op = criterion.operator.key;

  if (op === 'is_null') {
    return raw === null || raw === undefined || raw === '';
  }
  if (op === 'is_not_null') {
    return raw !== null && raw !== undefined && raw !== '';
  }

  if (raw === null || raw === undefined) return false;

  switch (op) {
    case 'eq':
      return looseEquals(raw, target);
    case 'neq':
      return !looseEquals(raw, target);
    case 'contains':
      return normalizeString(raw).includes(normalizeString(target));
    case 'not_contains':
      return !normalizeString(raw).includes(normalizeString(target));
    case 'starts_with':
      return normalizeString(raw).startsWith(normalizeString(target));
    case 'ends_with':
      return normalizeString(raw).endsWith(normalizeString(target));
    case 'gt':
      return compareValues(raw, target) > 0;
    case 'gte':
      return compareValues(raw, target) >= 0;
    case 'lt':
      return compareValues(raw, target) < 0;
    case 'lte':
      return compareValues(raw, target) <= 0;
    default:
      return true;
  }
}

function normalizeString(value: unknown): string {
  return String(value ?? '').toLowerCase().trim();
}

function looseEquals(a: unknown, b: FilterValue): boolean {
  if (a instanceof Date && (b instanceof Date || typeof b === 'string')) {
    const bDate = b instanceof Date ? b : new Date(b);
    return a.getTime() === bDate.getTime();
  }
  if (typeof a === 'boolean' || typeof b === 'boolean') {
    return String(a) === String(b);
  }
  return normalizeString(a) === normalizeString(b);
}

function compareValues(a: unknown, b: FilterValue): number {
  if (a instanceof Date) {
    const bTime = b instanceof Date ? b.getTime() : new Date(b as string).getTime();
    return a.getTime() - bTime;
  }
  const numA = Number(a);
  const numB = Number(b);
  if (!isNaN(numA) && !isNaN(numB)) {
    return numA - numB;
  }
  return normalizeString(a).localeCompare(normalizeString(b));
}
```

### 5.2 — `AppTableClientSideComponent` refactorizado

```typescript
// app-table-client-side.component.ts

import {
  Component,
  computed,
  effect,
  input,
  output,
  signal,
  ChangeDetectionStrategy,
  contentChild,
  TemplateRef,
} from '@angular/core';
import { AppTableComponent } from '@shared/atoms/app-table/app-table.component';
import {
  AppTableConfig,
  AppTableSort,
  AppTableAction,
} from '@shared/atoms/app-table/app-table.model';
import { AppTablePaginationComponent } from '@shared/atoms/app-table/app-table-pagination.component';
import {
  AppTablePaginationConfig,
  AppTablePaginationState,
  AppTablePageEvent,
} from '@shared/atoms/app-table/app-table-pagination.model';
import {
  AppTableFilterFn,
  AppTableSortFn,
  AppTableCriteriaFilterFn,
  AppTableToggleFilterFn,
} from './app-table-client-side.model';
import { AppCardComponent } from '@shared/atoms/app-card/app-card.component';
import { AppTableFiltersAdvancedComponent } from '../app-simple-filters-advanced/app-simple-filters-advanced.component';
import {
  AppTableFiltersAdvancedConfig,
  AppTableFiltersAdvancedOutput,
  AppTableFilterCriterion,
} from '../app-simple-filters-advanced/app-simple-filters-advanced.model';
import { AppTableFiltersComponent } from '../app-simple-filters/app-simple-filters.component';
import {
  AppTableFiltersConfig,
  AppTableFilterValues,
} from '../app-simple-filters/app-simple-filters.model';
import { evaluateCriteria } from '../app-simple-filters-advanced/criteria-evaluator';

@Component({
  selector: 'app-table-client-side',
  standalone: true,
  imports: [
    AppTableComponent,
    AppTableFiltersComponent,
    AppTableFiltersAdvancedComponent,
    AppTablePaginationComponent,
    AppCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './app-table-client-side.component.scss',
  template: `
    <div class="app-client-side-table">
      @if (filtersConfig() && !filtersAdvancedConfig()) {
        <app-simple-filters
          [config]="filtersConfig()!"
          [values]="simpleFilterValues()"
          (valuesChange)="onSimpleFiltersChange($event)">
        </app-simple-filters>
      }

      @if (filtersAdvancedConfig()) {
        <app-card
          title="Filtros avanzados"
          icon="filter_alt"
          [isExpandable]="true"
          [expanded]="false"
          class="mb-4">
          <app-simple-filters-advanced
            [config]="filtersAdvancedConfig()!"
            (search)="onAdvancedSearch($event)">
          </app-simple-filters-advanced>
        </app-card>
      }

      <app-table
        [config]="tableConfig()"
        [data]="displayData()"
        [sort]="currentSort()"
        [loading]="loading()"
        [cellTemplateRef]="projectedCellTemplate()"
        (sortChange)="onSortChange($event)"
        (rowClick)="rowClick.emit($event)"
        (actionClick)="actionClick.emit($event)">
        <ng-content />
      </app-table>

      @if (paginationConfig()) {
        <app-table-pagination
          [config]="paginationConfig()!"
          [state]="paginationState()"
          (pageChange)="onPageChange($event)">
        </app-table-pagination>
      }
    </div>
  `,
})
export class AppTableClientSideComponent<T extends Record<string, any> = Record<string, any>> {
  // ── Inputs de configuración ──
  tableConfig = input.required<AppTableConfig<T>>();
  filtersConfig = input<AppTableFiltersConfig>();
  filtersAdvancedConfig = input<AppTableFiltersAdvancedConfig>();
  paginationConfig = input<AppTablePaginationConfig>();

  // ── Inputs de datos ──
  data = input<T[]>([]);
  loading = input(false);

  // ── Inputs de funciones custom ──
  filterFn = input<AppTableFilterFn<T>>();
  criteriaFilterFn = input<AppTableCriteriaFilterFn<T>>();
  toggleFilterFn = input<AppTableToggleFilterFn<T>>();
  sortFn = input<AppTableSortFn<T>>();

  // ── Outputs ──
  sortChange = output<AppTableSort>();
  filterChange = output<AppTableFilterValues>();
  advancedSearch = output<AppTableFiltersAdvancedOutput>();
  pageChange = output<AppTablePageEvent>();
  rowClick = output<T>();
  actionClick = output<{ action: AppTableAction<T>; row: T }>();

  // ── Estado interno ──
  readonly projectedCellTemplate = contentChild<TemplateRef<any>>('cellTemplate');
  readonly currentSort = signal<AppTableSort>({ active: '', direction: '' });
  readonly simpleFilterValues = signal<AppTableFilterValues>({});
  readonly advancedCriteria = signal<AppTableFilterCriterion[]>([]);
  readonly activeToggles = signal<Record<string, boolean>>({});
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);

  // ── Pipeline de datos ──

  /**
   * Paso 1: Aplicar toggles (e.g., mostrar/ocultar inactivos).
   */
  private readonly afterToggleFilter = computed(() => {
    const data = this.data();
    const toggles = this.activeToggles();

    if (!Object.keys(toggles).length) return data;

    const customFn = this.toggleFilterFn();
    return customFn ? customFn(data, toggles) : data;
  });

  /**
   * Paso 2: Aplicar filtros (simples O avanzados, nunca ambos).
   * Los criterios avanzados tienen prioridad si existen.
   */
  private readonly filteredData = computed(() => {
    const data = this.afterToggleFilter();
    const criteria = this.advancedCriteria();
    const simpleFilters = this.simpleFilterValues();

    if (criteria.length > 0) {
      const customFn = this.criteriaFilterFn();
      return customFn ? customFn(data, criteria) : evaluateCriteria(data, criteria);
    }

    const activeSimple = Object.entries(simpleFilters).filter(
      ([, v]) => v !== null && v !== undefined && v !== '',
    );
    if (!activeSimple.length) return data;

    const customFn = this.filterFn();
    return customFn
      ? customFn(data, simpleFilters)
      : this.defaultSimpleFilter(data, simpleFilters);
  });

  /**
   * Paso 3: Ordenar.
   */
  private readonly sortedData = computed(() => {
    const data = this.filteredData();
    const sort = this.currentSort();

    if (!sort.active || !sort.direction) return data;

    const customFn = this.sortFn();
    return customFn ? customFn(data, sort) : this.defaultSort(data, sort);
  });

  /**
   * Paso 4: Paginar.
   */
  readonly displayData = computed(() => {
    const data = this.sortedData();
    if (!this.paginationConfig()) return data;

    const start = this.pageIndex() * this.pageSize();
    return data.slice(start, start + this.pageSize());
  });

  readonly paginationState = computed<AppTablePaginationState>(() => ({
    pageIndex: this.pageIndex(),
    pageSize: this.pageSize(),
    totalItems: this.sortedData().length,
  }));

  private readonly boundaryGuard = effect(() => {
    const totalItems = this.sortedData().length;
    const pageSize = this.pageSize();
    const currentPage = this.pageIndex();
    const lastPage = Math.max(0, Math.ceil(totalItems / pageSize) - 1);

    if (currentPage > lastPage) {
      this.pageIndex.set(lastPage);
    }
  });

  // ── Handlers ──

  onSimpleFiltersChange(values: AppTableFilterValues): void {
    this.simpleFilterValues.set(values);
    this.advancedCriteria.set([]); // limpiar criterios avanzados
    this.activeToggles.set({});
    this.pageIndex.set(0);
    this.filterChange.emit(values);
  }

  onAdvancedSearch(advancedOutput: AppTableFiltersAdvancedOutput): void {
    this.advancedCriteria.set(advancedOutput.criteria);
    this.activeToggles.set(advancedOutput.toggles);
    this.simpleFilterValues.set({}); // limpiar filtros simples
    this.pageIndex.set(0);
    this.advancedSearch.emit(advancedOutput);
  }

  onSortChange(sort: AppTableSort): void {
    this.currentSort.set(sort);
    this.sortChange.emit(sort);
  }

  onPageChange(event: AppTablePageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.pageChange.emit(event);
  }

  // ── Filtro simple por defecto ──

  private defaultSimpleFilter(data: T[], filters: AppTableFilterValues): T[] {
    const active = Object.entries(filters).filter(
      ([, v]) => v !== null && v !== undefined && v !== '',
    );
    if (!active.length) return data;

    return data.filter(item =>
      active.every(([key, filterValue]) => {
        const itemValue: unknown = item[key];
        if (itemValue === null || itemValue === undefined) return false;

        if (filterValue instanceof Date && itemValue instanceof Date) {
          return itemValue.getTime() === filterValue.getTime();
        }

        return String(itemValue)
          .toLowerCase()
          .includes(String(filterValue).toLowerCase());
      }),
    );
  }

  // ── Ordenamiento por defecto ──

  private defaultSort(data: T[], sort: AppTableSort): T[] {
    return [...data].sort((a, b) => {
      const aVal = a[sort.active as keyof T];
      const bVal = b[sort.active as keyof T];

      let comparison = 0;
      if (aVal < bVal) comparison = -1;
      if (aVal > bVal) comparison = 1;

      return sort.direction === 'asc' ? comparison : -comparison;
    });
  }
}
```

### 5.3 — Modelo actualizado

```typescript
// app-table-client-side.model.ts

import { AppTableFilterValues } from '../app-simple-filters/app-simple-filters.model';
import { AppTableFilterCriterion } from '../app-simple-filters-advanced/app-simple-filters-advanced.model';
import { AppTableSort } from '@shared/atoms/app-table/app-table.model';

export type AppTableFilterFn<T> = (data: T[], filters: AppTableFilterValues) => T[];
export type AppTableCriteriaFilterFn<T> = (data: T[], criteria: AppTableFilterCriterion[]) => T[];
export type AppTableToggleFilterFn<T> = (data: T[], toggles: Record<string, boolean>) => T[];
export type AppTableSortFn<T> = (data: T[], sort: AppTableSort) => T[];
```

### 5.4 — Consumidor refactorizado

```typescript
// table-client-side.component.ts (fragmento relevante)

// Ya NO necesitas convertAdvancedToSimple ni convertToAdvancedConfig
// El consumidor construye directamente AppTableFiltersAdvancedConfig

readonly advancedFiltersConfig: AppTableFiltersAdvancedConfig = {
  fields: [
    { key: 'name', label: 'Nombre', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'department', label: 'Departamento', type: 'select', options: [
      { value: 'Ingeniería', label: 'Ingeniería' },
      { value: 'Ventas', label: 'Ventas' },
      // ...
    ]},
    { key: 'salary', label: 'Salario', type: 'number' },
    { key: 'status', label: 'Estado', type: 'select', options: [
      { value: 'active', label: 'Activo' },
      { value: 'inactive', label: 'Inactivo' },
      { value: 'vacation', label: 'Vacaciones' },
    ]},
    { key: 'hireDate', label: 'Fecha contratación', type: 'date' },
  ],
  toggles: [
    { key: 'showInactive', label: 'Mostrar inactivos', value: false },
  ],
  maxCriteria: 10,
  showClearButton: true,
  showSearchButton: true,
};

// Función custom para interpretar toggles en client-side
readonly toggleFilter = (data: EmployeeViewModel[], toggles: Record<string, boolean>) => {
  let result = data;
  if (!toggles['showInactive']) {
    result = result.filter(e => e.status !== 'inactive');
  }
  return result;
};
```

Y en el template del consumidor:

```html
<app-table-client-side
  [tableConfig]="tableConfig"
  [filtersAdvancedConfig]="advancedFiltersConfig"
  [paginationConfig]="paginationConfig"
  [data]="employeesViewModel()"
  [loading]="isLoading()"
  [toggleFilterFn]="toggleFilter"
  (advancedSearch)="onAdvancedSearch($event)"
  (sortChange)="onSort($event)"
  (pageChange)="onPage($event)"
  (rowClick)="onAction($event)"
  (actionClick)="onAction($event)">
</app-table-client-side>
```

---

## 6. Sobre el Futuro AppTableServerSide

Con esta arquitectura, el componente server-side simplemente toma el `AppTableFiltersAdvancedOutput` y lo serializa para enviarlo al backend. No necesita `evaluateCriteria` porque no evalúa localmente. El contrato se mantiene idéntico:

```
AppTableFiltersAdvanced  →  AppTableFilterCriterion[]  →  HTTP request body
                                                          (el backend interpreta)
```

El `AppTableFiltersAdvancedComponent` no cambia en absoluto. El mismo componente, la misma configuración, la misma salida, diferente consumidor. Esto es exactamente lo que buscas.

---

## 7. Resumen de Acciones

El cambio de mayor impacto es crear `criteria-evaluator.ts`: una función pura, testeable, ubicada en la capa shared, que implementa los 12 operadores. El segundo cambio es separar el estado de filtrado en `AppTableClientSideComponent` en tres señales (`simpleFilterValues`, `advancedCriteria`, `activeToggles`) en lugar del único `filterValues` actual. El tercer cambio es eliminar la dependencia de `AppTableClientSideComponent` hacia `filter-config-converter.ts` del feature module. Y el cuarto es que `convertToAdvancedConfig` deje de hardcodear toggles, o mejor aún, que los consumidores construyan directamente su `AppTableFiltersAdvancedConfig` sin intermediarios de conversión.

Con estos cambios, tu `AppTableFiltersAdvanced` realmente opera a su máxima capacidad en ambos escenarios, cada operador tiene efecto real sobre los datos, los toggles se procesan, y la arquitectura respeta la dirección de dependencias y el principio de responsabilidad única.
