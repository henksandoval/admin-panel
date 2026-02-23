# Informe de Análisis: AppTableClientSide vs AppTableServerSide

**Fecha:** 23 de febrero de 2026  
**Autor:** GitHub Copilot — Software Architect Analysis

---

## 1. Resumen Ejecutivo

Ambos organismos comparten una arquitectura sólida basada en Signals, `ChangeDetectionStrategy.OnPush` y composición de átomos/moléculas. La separación de responsabilidades es correcta. Sin embargo, existen **asimetrías contractuales, inconsistencias en el manejo de filtros y deuda técnica menor** que deben corregirse antes de que la base crezca.

---

## 2. Comparativa Estructural

| Aspecto | ClientSide | ServerSide |
|---|---|---|
| `model.ts` con DEFAULTS | ⚠️ Parcial — sin defaults | ✅ `TABLE_SERVER_SIDE_DEFAULTS` completo |
| Tipo interno de filtros | `AppFilterCriterion[]` (criteria) | `AppFilterValues` (values) |
| Output de filtros | `filtersChange: AppFilterCriterion[]` | `filtersChange: AppFilterValues` |
| Output unificado de params | ❌ No existe | ✅ `paramsChange: AppTableServerParams` |
| `filterFn` / `sortFn` custom | ✅ Soportado | ❌ No aplica (délega al backend) |
| `ng-content` en template | `<ng-content/>` (sin selector) | `<ng-content select="[cellTemplate]"/>` |
| `AppTableServerResponse<T>` usado | — | ❌ Definido en model pero nunca consumido |
| SCSS prefijo de clase | `.app-client-side-table` | `.app-server-side-table` |

---

## 3. Hallazgos Detallados

### 3.1 🔴 CRÍTICO — Tipo del output `filtersChange` es inconsistente entre los dos organismos

**ClientSide** emite `AppFilterCriterion[]` (criterios ricos con operadores).  
**ServerSide** convierte internamente esos criterios a `AppFilterValues` (flat map) y emite eso.

```typescript
// client-side
filtersChange = output<AppFilterCriterion[]>();

// server-side
filtersChange = output<AppFilterValues>();
```

**Problema:** Si un consumidor necesita migrar de client-side a server-side (escenario muy común al escalar), el cambio rompe el contrato del output y obliga a refactorizar todos los consumers. Además, `AppFilterValues` pierde el operador (ej. `contains`, `gt`), lo que impide que el backend reciba consultas ricas sin trabajo adicional.

**Sugerencia:** Unificar la firma. El server-side debería emitir `AppFilterCriterion[]` y dejar que el consumer (servicio, store) haga la transformación a `AppFilterValues` o a los params de su API. El `criteriaToValues()` debería ser un **utility exportado**, no lógica interna del componente.

---

### 3.2 🔴 CRÍTICO — `app-table-client-side.model.ts` no tiene DEFAULTS

El client-side carece de constante `TABLE_CLIENT_SIDE_DEFAULTS`, violando la regla absoluta de la guía de estilos. Los valores por defecto están hardcodeados inline en los inputs:

```typescript
// client-side — defaults dispersos en el .ts
readonly useAdvancedFilters = input<boolean>(false);
readonly showPagination    = input<boolean>(true);
readonly resetPageOnFilter = input(true);
readonly resetPageOnSort   = input(false);
readonly pageSize          = signal(10);   // ← hardcoded, sin constante
readonly pageIndex         = signal(0);    // ← hardcoded, sin constante
```

El server-side hace esto bien con `TABLE_SERVER_SIDE_DEFAULTS`.

---

### 3.3 🟠 MAYOR — `AppTableServerResponse<T>` está definido pero no se usa

En `app-table-server-side.model.ts` existe la interfaz:

```typescript
export interface AppTableServerResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

No es consumida en ningún lugar del organismo. Esto genera ruido y expectativas falsas ("¿el componente acepta una respuesta completa?"). Debe eliminarse o bien el componente debe aceptar esta interfaz directamente mediante un input `response` alternativo al binomio `data` + `totalItems` separados.

---

### 3.4 🟠 MAYOR — `ng-content` inconsistente entre los dos templates

```html
<!-- client-side -->
<ng-content/>

<!-- server-side -->
<ng-content select="[cellTemplate]"/>
```

El client-side proyecta **todo** su ng-content hacia el `app-table` interno, mientras que el server-side filtra por el atributo `[cellTemplate]`. Esto significa que un consumer que use `<ng-template #cellTemplate>` en el client-side **no** necesita el atributo, pero en el server-side **sí**. Comportamiento divergente para el mismo concepto.

**Agravante:** el mecanismo de `contentChild<TemplateRef>('cellTemplate')` + `[cellTemplateRef]="projectedCellTemplate()"` está presente en **ambos** componentes, lo que hace que el `ng-content` del client-side sea básicamente inerte para la proyección de templates de celda.

---

### 3.5 🟡 MODERADO — `safeFiltersConfig` y `safePaginationConfig` son computed innecesarios

En ambos componentes:

```typescript
readonly safeFiltersConfig    = computed(() => this.filtersConfig());
readonly safePaginationConfig = computed(() => this.paginationConfig());
```

Estos computed no añaden ninguna transformación; simplemente re-envuelven el signal del input. Existen probablemente para que el template pueda usar `@if (safeFiltersConfig(); as config)` sin necesidad del `?.`, pero un signal de input opcional ya retorna `undefined` nativamente y se puede usar directamente en el template. Son un nivel de indirección inútil que confunde la lectura del código.

---

### 3.6 🟡 MODERADO — `_boundaryGuard` (client-side) vs `boundaryGuard` (server-side): convención de nombrado inconsistente

```typescript
// client-side
private readonly _boundaryGuard = effect(...)

// server-side
private readonly boundaryGuard = effect(...)
```

Uno usa prefijo `_` y el otro no. Menor, pero en un codebase con guía de estilos es ruido que señala que los dos componentes fueron escritos/revisados en momentos distintos.

---

### 3.7 🟡 MODERADO — Lógica de `onFiltersChange` diverge sin documentación

El server-side tiene un paso de transformación `criteriaToValues()` que el client-side no tiene. Esta diferencia es **correcta arquitectónicamente** (el server-side necesita un formato plano para los query params), pero no está documentada ni comentada. Un desarrollador nuevo podría eliminarla pensando que es código muerto.

---

### 3.8 🟢 MENOR — SCSS duplicado al 100%

Ambos archivos `.scss` son idénticos salvo el nombre de la clase raíz. Esto no es un problema grave si se espera que cada uno evolucione independientemente, pero actualmente es una fuente de posible divergencia silenciosa. Considerar un mixin/token compartido para los estilos de contenedor base.

---

### 3.9 🟢 MENOR — `pageSize` como signal privado en client-side sin default centralizado

El server-side inicializa `pageSize` con `TABLE_SERVER_SIDE_DEFAULTS.initialPageSize`. El client-side usa `signal(10)`. Si alguien necesita cambiar el tamaño de página por defecto en el client-side, tiene que buscar en el `.ts` en lugar de modificar una constante en el `.model.ts`.

---

## 4. Matriz de Paridad

| Funcionalidad | ClientSide | ServerSide | ¿Deberían ser iguales? |
|---|:---:|:---:|---|
| DEFAULTS en model.ts | ❌ | ✅ | Sí |
| Output `filtersChange` con criterios ricos | ✅ | ❌ | Sí (unificar) |
| Output `paramsChange` unificado | ❌ | ✅ | No (solo server-side lo necesita) |
| `filterFn` / `sortFn` custom | ✅ | ❌ | No (solo client-side lo necesita) |
| `ng-content select` consistente | ❌ | ✅ | Sí |
| Nombrado `boundaryGuard` sin `_` | ❌ | ✅ | Sí |

---

## 5. Plan de Acción Priorizado

### P0 — Antes del próximo sprint

1. **Crear `TABLE_CLIENT_SIDE_DEFAULTS`** en `app-table-client-side.model.ts` y referenciar desde el `.ts`.
2. **Unificar el output `filtersChange`** a `AppFilterCriterion[]` en server-side. Mover `criteriaToValues()` a `app-filter.utils.ts` como función exportada.
3. **Corregir `ng-content`** en client-side a `<ng-content select="[cellTemplate]"/>` para paridad.

### P1 — Deuda técnica planificada

4. **Eliminar `AppTableServerResponse<T>`** del model o consumirlo en el componente.
5. **Eliminar `safeFiltersConfig` y `safePaginationConfig`** como computed wrap-only, reemplazándolos por uso directo del signal de input en el template.
6. **Renombrar `_boundaryGuard`** a `boundaryGuard` en client-side para consistencia.

### P2 — Mejoras arquitectónicas

7. **Extraer mixin SCSS base** `_table-organism-base.scss` para evitar duplicación.
8. **Considerar una clase base abstracta** o un token de tipo `AppTableOrganism<T>` que formalice el contrato compartido (inputs comunes, outputs comunes) y obligue a ambos a respetarlo, haciendo las diferencias explícitas por extensión.

---

## 6. Apreciación General

La arquitectura de señales, la separación en átomos/moléculas/organismos y el uso de `ChangeDetectionStrategy.OnPush` son decisiones excelentes y bien ejecutadas. El patrón del `boundaryGuard` (effect que corrige paginación fuera de rango) es especialmente elegante. Los problemas identificados son **de contrato y de consistencia**, no de diseño fundamental — lo que indica un buen nivel arquitectónico base.

