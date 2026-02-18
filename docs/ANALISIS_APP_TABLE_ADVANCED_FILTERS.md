# Análisis Arquitectónico: AppTableFiltersAdvanced en Client-Side y Server-Side

**Fecha**: 13 de febrero de 2026  
**Autor**: Análisis de Arquitectura de Software  
**Versión**: 1.0

---

## Executive Summary

**Veredicto General**: ✅ **Arquitectura sólida con oportunidades de mejora significativas**

Tu implementación demuestra comprensión de principios SOLID y separación de responsabilidades. Sin embargo, existen **problemas críticos de violación del Single Responsibility Principle** en `AppTableClientSideComponent` y una **oportunidad arquitectónica perdida** para crear una abstracción común entre Client-Side y Server-Side.

**Principales hallazgos**:
1. ✅ `AppTableFiltersAdvancedComponent` es reutilizable y bien diseñado
2. ❌ `AppTableClientSideComponent` mezcla lógica de filtrado avanzado con conversiones ad-hoc
3. ❌ Función `convertAdvancedToSimple()` es una solución temporal que oculta un problema de diseño
4. ⚠️ No existe una estrategia unificada para aplicar criterios avanzados
5. ⚠️ La integración con Server-Side no está arquitectonicamente preparada

---

## 1. Análisis de la Implementación Actual

### 1.1 AppTableFiltersAdvancedComponent

**Evaluación**: ✅ **Excelente**

```typescript
// Responsabilidad clara: Construir y emitir criterios de filtrado
search = output<AppTableFiltersAdvancedOutput>();
criteriaChange = output<AppTableFilterCriterion[]>();
toggleChange = output<Record<string, boolean>>();
```

**Fortalezas**:
- ✅ **Single Responsibility**: Solo gestiona la UI de construcción de criterios
- ✅ **Open/Closed**: Extensible mediante configuración (`operators`, `fields`, `toggles`)
- ✅ **Dependency Inversion**: Emite estructuras de datos, no implementa lógica de filtrado
- ✅ **Interface Segregation**: Outputs granulares para diferentes consumidores
- ✅ Rich domain model con `AppTableFilterCriterion`, `AppTableFilterOperator`

**Modelo de Datos Robusto**:
```typescript
export interface AppTableFilterCriterion {
  id: string;
  field: AppTableFilterField;      // ✅ Objeto completo, no solo key
  operator: AppTableFilterOperator; // ✅ Objeto completo, no solo string
  value: FilterValue;
}
```

Este diseño permite extensiones futuras sin romper contratos.

---

### 1.2 AppTableClientSideComponent

**Evaluación**: ⚠️ **Problemático - Violaciones de SRP**

#### Problema 1: Conversión Ad-hoc en el Componente

```typescript
// ❌ VIOLACIÓN SRP: El componente no debe conocer la estructura de los criterios
onAdvancedSearch(output: AppTableFiltersAdvancedOutput): void {
  const simpleFilters = convertAdvancedToSimple(output.criteria);
  this.filterValues.set(simpleFilters);
  this.pageIndex.set(0);
  this.advancedSearch.emit(output);
}
```

**Problemas identificados**:
1. El componente depende de una función de conversión externa
2. La función `convertAdvancedToSimple()` solo soporta operadores `eq` y `contains`
3. El resto de operadores avanzados se pierden silenciosamente
4. No hay estrategia para operadores complejos (`gt`, `lte`, `is_null`, etc.)

#### Problema 2: Lógica de Filtrado Primitiva

```typescript
// ❌ LIMITADO: Solo filtra por igualdad o contains simple
private defaultFilterFn(data: T[], filters: AppTableFilterValues): T[] {
  return data.filter((item) =>
    activeFilters.every(([key, filterValue]) => {
      const itemValue: unknown = (item as Record<string, unknown>)[key];
      return String(itemValue)
        .toLowerCase()
        .includes(String(filterValue).toLowerCase());
    }),
  );
}
```

Esta implementación **no puede procesar** los 12 operadores que `AppTableFiltersAdvancedComponent` promete:
- `gt`, `gte`, `lt`, `lte` (comparaciones numéricas/fechas)
- `starts_with`, `ends_with` (comparaciones de texto)
- `is_null`, `is_not_null` (validaciones de existencia)
- `neq`, `not_contains` (negaciones)

---

### 1.3 Función `convertAdvancedToSimple()`

**Evaluación**: ❌ **Antipatrón - Solución Temporal Peligrosa**

```typescript
// ❌ PROBLEM: Pérdida de información y funcionalidad
export function convertAdvancedToSimple(
  criteria: AppTableFilterCriterion[]
): AppTableFilterValues {
  return criteria.reduce((acc, c) => {
    if (c.operator.key === 'eq' || c.operator.key === 'contains') {
      acc[c.field.key] = c.value;  // ❌ Se pierde el operador
    }
    // ❌ Otros operadores se ignoran silenciosamente
    return acc;
  }, {} as AppTableFilterValues);
}
```

**Problemas críticos**:
1. **Pérdida de datos**: Solo 2 de 12 operadores soportados
2. **Falsa expectativa**: El usuario construye criterios que no se aplican
3. **Acoplamiento conceptual**: Asume que "simple" y "advanced" son compatibles
4. **Bug silencioso**: No hay error ni warning cuando se ignoran operadores

---

## 2. Arquitectura Propuesta

### 2.1 Principio Fundamental

> **Los filtros avanzados no deben "convertirse" a filtros simples. Son tipos de filtrado completamente diferentes que requieren motores de ejecución diferentes.**

### 2.2 Estrategia: Filter Execution Engine

Necesitas un **motor de ejecución de filtros** que interprete los criterios avanzados:

```typescript
┌─────────────────────────────────────────────────────────────┐
│                  AppTableFiltersAdvanced                     │
│              (UI Builder - Sin lógica de filtrado)          │
└────────────────────────┬────────────────────────────────────┘
                         │ emits
                         │ AppTableFiltersAdvancedOutput {
                         │   criteria: AppTableFilterCriterion[]
                         │   toggles: Record<string, boolean>
                         │ }
                         ▼
         ┌───────────────────────────────────────┐
         │    Filter Execution Strategy          │
         │    (Interface/Abstract)               │
         └───────────────┬───────────────────────┘
                         │
         ┌───────────────┴───────────────────┐
         │                                   │
         ▼                                   ▼
┌────────────────────┐          ┌────────────────────┐
│  ClientSideFilter  │          │  ServerSideFilter  │
│  ExecutionEngine   │          │  QueryBuilder      │
│                    │          │                    │
│ - Evalúa criterios │          │ - Genera query     │
│   en memoria       │          │   params para API  │
│ - Aplica operadores│          │ - Serializa para   │
│   complejos        │          │   backend          │
└────────────────────┘          └────────────────────┘
```

---

## 3. Diseño Detallado - Solución Propuesta

### 3.1 Interface Base - Filter Execution Strategy

```typescript
// app-simple-filters-advanced/filter-execution.model.ts

/**
 * Estrategia abstracta para ejecutar filtros avanzados.
 * Cumple con Open/Closed Principle y Dependency Inversion.
 */
export interface AppTableFilterExecutionStrategy<T> {
  /**
   * Aplica criterios de filtrado avanzado a los datos
   * @param data - Datos originales
   * @param output - Criterios y toggles del filtro avanzado
   * @returns Datos filtrados o null si la estrategia no aplica
   */
  execute(
    data: T[],
    output: AppTableFiltersAdvancedOutput
  ): T[] | null;
}

/**
 * Para Server-Side, necesitamos construir query params, no filtrar data
 */
export interface AppTableFilterQueryStrategy {
  /**
   * Convierte criterios avanzados en query params para el backend
   */
  buildQueryParams(
    output: AppTableFiltersAdvancedOutput
  ): Record<string, any>;
}
```

### 3.2 Client-Side Filter Execution Engine

```typescript
// app-simple-filters-advanced/client-side-filter-executor.ts

export class ClientSideFilterExecutor<T extends Record<string, any>> 
  implements AppTableFilterExecutionStrategy<T> {
  
  execute(data: T[], output: AppTableFiltersAdvancedOutput): T[] {
    let filtered = [...data];

    // 1. Aplicar criterios avanzados
    if (output.criteria.length > 0) {
      filtered = filtered.filter(row => 
        this.evaluateAllCriteria(row, output.criteria)
      );
    }

    // 2. Aplicar toggles
    filtered = this.applyToggles(filtered, output.toggles);

    return filtered;
  }

  private evaluateAllCriteria(
    row: T, 
    criteria: AppTableFilterCriterion[]
  ): boolean {
    // AND lógico: todas las condiciones deben cumplirse
    return criteria.every(criterion => 
      this.evaluateCriterion(row, criterion)
    );
  }

  private evaluateCriterion(
    row: T, 
    criterion: AppTableFilterCriterion
  ): boolean {
    const fieldValue = row[criterion.field.key];
    const filterValue = criterion.value;
    const operator = criterion.operator.key;

    // Operadores sin valor
    if (!criterion.operator.requiresValue) {
      switch (operator) {
        case 'is_null':
          return fieldValue === null || fieldValue === undefined || fieldValue === '';
        case 'is_not_null':
          return fieldValue !== null && fieldValue !== undefined && fieldValue !== '';
        default:
          return false;
      }
    }

    // Validación de nulls
    if (fieldValue === null || fieldValue === undefined) {
      return false;
    }

    // Operadores por tipo
    switch (operator) {
      // Igualdad
      case 'eq':
        return this.equals(fieldValue, filterValue, criterion.field.type);
      case 'neq':
        return !this.equals(fieldValue, filterValue, criterion.field.type);

      // Texto
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(filterValue).toLowerCase());
      case 'not_contains':
        return !String(fieldValue).toLowerCase().includes(String(filterValue).toLowerCase());
      case 'starts_with':
        return String(fieldValue).toLowerCase().startsWith(String(filterValue).toLowerCase());
      case 'ends_with':
        return String(fieldValue).toLowerCase().endsWith(String(filterValue).toLowerCase());

      // Comparaciones numéricas/fecha
      case 'gt':
        return this.compare(fieldValue, filterValue, criterion.field.type) > 0;
      case 'gte':
        return this.compare(fieldValue, filterValue, criterion.field.type) >= 0;
      case 'lt':
        return this.compare(fieldValue, filterValue, criterion.field.type) < 0;
      case 'lte':
        return this.compare(fieldValue, filterValue, criterion.field.type) <= 0;

      default:
        console.warn(`Operador no soportado: ${operator}`);
        return false;
    }
  }

  private equals(
    fieldValue: any, 
    filterValue: any, 
    type: AppTableFilterFieldType
  ): boolean {
    if (type === 'date') {
      const d1 = new Date(fieldValue).getTime();
      const d2 = new Date(filterValue).getTime();
      return d1 === d2;
    }
    if (type === 'number') {
      return Number(fieldValue) === Number(filterValue);
    }
    if (type === 'boolean') {
      return Boolean(fieldValue) === Boolean(filterValue);
    }
    // text, select
    return String(fieldValue).toLowerCase() === String(filterValue).toLowerCase();
  }

  private compare(
    fieldValue: any, 
    filterValue: any, 
    type: AppTableFilterFieldType
  ): number {
    if (type === 'date') {
      return new Date(fieldValue).getTime() - new Date(filterValue).getTime();
    }
    if (type === 'number') {
      return Number(fieldValue) - Number(filterValue);
    }
    // text comparison
    return String(fieldValue).localeCompare(String(filterValue));
  }

  private applyToggles(data: T[], toggles: Record<string, boolean>): T[] {
    let result = [...data];

    // Ejemplo: filtrar por active/inactive
    if (toggles['showInactive'] === false) {
      result = result.filter(row => 
        (row as any).status !== 'inactive'
      );
    }

    if (toggles['showDeleted'] === false) {
      result = result.filter(row => 
        !(row as any).deleted
      );
    }

    return result;
  }
}
```

### 3.3 Server-Side Query Builder

```typescript
// app-simple-filters-advanced/server-side-query-builder.ts

export class ServerSideQueryBuilder implements AppTableFilterQueryStrategy {
  
  buildQueryParams(output: AppTableFiltersAdvancedOutput): Record<string, any> {
    const params: Record<string, any> = {};

    // 1. Serializar criterios
    if (output.criteria.length > 0) {
      params['filters'] = this.serializeCriteria(output.criteria);
    }

    // 2. Añadir toggles
    Object.entries(output.toggles).forEach(([key, value]) => {
      params[key] = value;
    });

    return params;
  }

  private serializeCriteria(criteria: AppTableFilterCriterion[]): any {
    // Opción 1: Array de objetos (JSON)
    return criteria.map(c => ({
      field: c.field.key,
      operator: c.operator.key,
      value: this.serializeValue(c.value, c.field.type),
    }));

    // Opción 2: Query string custom (depende de tu backend)
    // Ejemplo: ?filter[name][contains]=John&filter[age][gte]=18
  }

  private serializeValue(value: FilterValue, type: AppTableFilterFieldType): any {
    if (type === 'date' && value instanceof Date) {
      return value.toISOString();
    }
    return value;
  }
}
```

### 3.4 AppTableClientSideComponent Refactorizado

```typescript
// app-table-client-side.component.ts (REFACTORED)

@Component({
  selector: 'app-table-client-side',
  // ... imports
})
export class AppTableClientSideComponent<T extends Record<string, any>> {
  // ... existing inputs
  
  // ✅ NUEVO: Inyección de estrategia de filtrado avanzado
  advancedFilterExecutor = input<AppTableFilterExecutionStrategy<T>>(
    new ClientSideFilterExecutor<T>()
  );

  // ... existing signals

  // ✅ SEPARAR: Filtros simples y avanzados
  private readonly filterMode = signal<'simple' | 'advanced'>('simple');
  private readonly advancedFilterOutput = signal<AppTableFiltersAdvancedOutput | null>(null);

  // ✅ NUEVO: Computed separado para filtros avanzados
  private readonly advancedFilteredData = computed(() => {
    const data = this.data();
    const output = this.advancedFilterOutput();
    
    if (!output || this.filterMode() !== 'advanced') {
      return data;
    }

    const executor = this.advancedFilterExecutor();
    return executor.execute(data, output) ?? data;
  });

  // ✅ MODIFICADO: Usar simple o advanced según el modo
  private readonly filteredData = computed(() => {
    if (this.filterMode() === 'advanced') {
      return this.advancedFilteredData();
    }

    // Lógica simple existente
    const data = this.data();
    const filters = this.filterValues();

    if (!Object.keys(filters).length) return data;

    const customFn = this.filterFn();
    return customFn ? customFn(data, filters) : this.defaultFilterFn(data, filters);
  });

  // ... rest remains the same (sortedData, displayData, etc.)

  // ✅ REFACTORIZADO: Ya no convierte, solo activa modo advanced
  onAdvancedSearch(output: AppTableFiltersAdvancedOutput): void {
    this.filterMode.set('advanced');
    this.advancedFilterOutput.set(output);
    this.pageIndex.set(0);
    this.advancedSearch.emit(output);
  }

  // ✅ NUEVO: Cuando se usan filtros simples, desactivar advanced
  override onFiltersChange(values: AppTableFilterValues): void {
    this.filterMode.set('simple');
    this.advancedFilterOutput.set(null);
    super.onFiltersChange(values);
  }
}
```

### 3.5 AppTableServerSideComponent Integración

```typescript
// app-table-server-side.component.ts (ENHANCED)

@Component({
  selector: 'app-table-server-side',
  // ... imports + AppTableFiltersAdvancedComponent
})
export class AppTableServerSideComponent<T extends Record<string, any>> {
  // ... existing
  
  // ✅ NUEVO: Config y output para filtros avanzados
  filtersAdvancedConfig = input<AppTableFiltersAdvancedConfig>();
  advancedSearch = output<AppTableFiltersAdvancedOutput>();
  
  // ✅ NUEVO: Query builder injectable
  queryBuilder = input<AppTableFilterQueryStrategy>(
    new ServerSideQueryBuilder()
  );

  private readonly filterMode = signal<'simple' | 'advanced'>('simple');
  private readonly advancedFilterOutput = signal<AppTableFiltersAdvancedOutput | null>(null);

  // ✅ MODIFICADO: currentParams incluye filtros avanzados
  readonly currentParams = computed<AppTableServerParams>(() => {
    const base = {
      sort: this.currentSort(),
      pageIndex: this.pageIndex(),
      pageSize: this.pageSize(),
    };

    if (this.filterMode() === 'advanced') {
      const output = this.advancedFilterOutput();
      if (output) {
        const builder = this.queryBuilder();
        return {
          ...base,
          filters: builder.buildQueryParams(output),
        };
      }
    }

    return {
      ...base,
      filters: this.filterValues(),
    };
  });

  // ✅ NUEVO: Handler para búsqueda avanzada
  onAdvancedSearch(output: AppTableFiltersAdvancedOutput): void {
    this.filterMode.set('advanced');
    this.advancedFilterOutput.set(output);
    
    if (this.resetPageOnFilter()) {
      this.pageIndex.set(0);
    }

    this.advancedSearch.emit(output);
    this.emitParamsChange();
  }

  override onFiltersChange(values: AppTableFilterValues): void {
    this.filterMode.set('simple');
    this.advancedFilterOutput.set(null);
    super.onFiltersChange(values);
  }
}
```

---

## 4. Análisis SOLID

### 4.1 Single Responsibility Principle

| Componente | ❌ Antes | ✅ Después |
|------------|---------|-----------|
| `AppTableFiltersAdvancedComponent` | ✅ Solo UI | ✅ Solo UI |
| `AppTableClientSideComponent` | ❌ UI + conversión + filtrado limitado | ✅ UI + orquestación (delega filtrado) |
| `ClientSideFilterExecutor` | ❌ No existe | ✅ Solo lógica de filtrado en memoria |
| `ServerSideQueryBuilder` | ❌ No existe | ✅ Solo construcción de queries |

### 4.2 Open/Closed Principle

**Antes**: Para añadir un nuevo operador, debes modificar `convertAdvancedToSimple()` y `defaultFilterFn()`.

**Después**: 
```typescript
// ✅ Extender sin modificar código existente
export class CustomFilterExecutor<T> extends ClientSideFilterExecutor<T> {
  protected override evaluateCriterion(row: T, criterion: AppTableFilterCriterion): boolean {
    // Añadir soporte para operadores custom
    if (criterion.operator.key === 'my_custom_operator') {
      return /* lógica custom */;
    }
    return super.evaluateCriterion(row, criterion);
  }
}
```

### 4.3 Liskov Substitution Principle

```typescript
// ✅ Cualquier implementación de la estrategia es sustituible
const standardExecutor = new ClientSideFilterExecutor<Employee>();
const customExecutor = new CustomFilterExecutor<Employee>();
const caseInsensitiveExecutor = new CaseInsensitiveFilterExecutor<Employee>();

// Todos funcionan en AppTableClientSideComponent
<app-table-client-side [advancedFilterExecutor]="customExecutor" />
```

### 4.4 Interface Segregation Principle

```typescript
// ✅ Interfaces segregadas por caso de uso
interface AppTableFilterExecutionStrategy<T> { /* Client-side */ }
interface AppTableFilterQueryStrategy { /* Server-side */ }

// NO: interface AppTableFilterStrategy { execute(); buildQuery(); } ❌
```

### 4.5 Dependency Inversion Principle

```typescript
// ✅ Componentes dependen de abstracciones, no de implementaciones
advancedFilterExecutor = input<AppTableFilterExecutionStrategy<T>>();
//                            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//                            Abstracción, no clase concreta
```

---

## 5. Beneficios de la Solución Propuesta

### 5.1 Funcionales

1. ✅ **Todos los operadores funcionan**: `gt`, `lte`, `is_null`, `starts_with`, etc.
2. ✅ **Sin pérdida de información**: Los criterios se ejecutan tal cual se construyen
3. ✅ **Reutilizable**: Mismo `AppTableFiltersAdvancedComponent` para client y server
4. ✅ **Extensible**: Fácil añadir nuevos operadores o lógicas custom

### 5.2 Técnicos

1. ✅ **Testeable**: Cada clase tiene una responsabilidad clara
2. ✅ **Mantenible**: Cambios en filtrado no afectan componentes UI
3. ✅ **Type-safe**: TypeScript valida tipos en compile-time
4. ✅ **Sin acoplamiento**: Componentes no conocen implementaciones concretas

### 5.3 De Negocio

1. ✅ **Consistencia**: Mismo UX para filtrado simple y avanzado
2. ✅ **Escalabilidad**: Fácil añadir filtros en el futuro
3. ✅ **Debugging**: Logs claros de qué criterios se aplican

---

## 6. Plan de Migración

### Fase 1: Crear Infraestructura (No Breaking Changes)

1. Crear `filter-execution.model.ts` con interfaces
2. Crear `client-side-filter-executor.ts` con lógica completa
3. Crear `server-side-query-builder.ts`
4. **Testing exhaustivo** con todos los operadores

### Fase 2: Refactorizar AppTableClientSideComponent

1. Añadir inputs opcionales para `advancedFilterExecutor`
2. Mantener `convertAdvancedToSimple()` como fallback (deprecated)
3. Añadir signal `filterMode`
4. Refactorizar `onAdvancedSearch()`

### Fase 3: Actualizar AppTableServerSideComponent

1. Añadir soporte para `filtersAdvancedConfig`
2. Integrar `ServerSideQueryBuilder`
3. Modificar template para incluir `app-simple-filters-advanced`

### Fase 4: Eliminar Código Legacy

1. Remover `convertAdvancedToSimple()`
2. Remover `convertToAdvancedConfig()` (ya no necesario)
3. Actualizar documentación

### Fase 5: Testing en Aplicaciones Reales

1. Migrar página de ejemplo `table-client-side`
2. Validar con data real
3. Performance testing con grandes volúmenes

---

## 7. Consideraciones Adicionales

### 7.1 Performance

```typescript
// ⚠️ Para datasets grandes (>10,000 rows), considera:
export class OptimizedClientSideFilterExecutor<T> extends ClientSideFilterExecutor<T> {
  
  execute(data: T[], output: AppTableFiltersAdvancedOutput): T[] {
    // Usar índices o caching para criterios complejos
    const indexed = this.createIndexes(data, output.criteria);
    return super.execute(indexed, output);
  }
}
```

### 7.2 OR Logic (Futuro)

```typescript
// Actualmente: todos los criterios son AND
// Futuro: soportar agrupación con OR

export interface AppTableFilterGroup {
  operator: 'AND' | 'OR';
  criteria: AppTableFilterCriterion[];
  groups?: AppTableFilterGroup[];
}
```

### 7.3 Validación de Backend

```typescript
// Server-side debe validar que los operadores son soportados
// Ejemplo en NestJS:

@Get('/employees')
async findAll(@Query() query: FilterQueryDto) {
  this.validateOperators(query.filters);
  return this.employeeService.findWithFilters(query.filters);
}
```

---

## 8. Conclusiones y Recomendaciones

### 8.1 Tu Intuición es Correcta

> "La intención arquitectónica que tengo en mente es que mi AppTableFiltersAdvanced me sirva para ambos escenarios"

✅ **Completamente correcto**. `AppTableFiltersAdvancedComponent` **debe** ser reutilizable entre client-side y server-side. Es una decisión arquitectónica excelente.

### 8.2 Problema Identificado

❌ La implementación actual usa un **patrón de conversión inadecuado** que:
- Pierde información (solo 2 de 12 operadores)
- Crea falsa expectativa en usuarios
- Viola SRP al mezclar conversión con componentes

### 8.3 Solución Propuesta

✅ **Strategy Pattern** con:
- `ClientSideFilterExecutor`: Ejecuta criterios en memoria
- `ServerSideQueryBuilder`: Construye query params
- Inyección de dependencias para extensibilidad

### 8.4 Impacto del Cambio

| Aspecto | Impacto |
|---------|---------|
| **Funcionalidad** | ✅ Todos los operadores funcionan |
| **Architecture** | ✅ SOLID compliant |
| **Testing** | ✅ Cada clase testeable independientemente |
| **Migration** | ⚠️ Moderado (quebrar compatibilidad con `convertAdvancedToSimple`) |
| **Maintenance** | ✅ Drásticamente más fácil |

### 8.5 Recomendación Final

**🚀 PROCEDER CON REFACTORING**

La inversión de tiempo en esta refactorización es **completamente justificada** porque:

1. **Escala correctamente**: Funciona con 2 o 200 operadores
2. **Predecible**: Los usuarios obtienen lo que construyen
3. **Profesional**: Cumple estándares enterprise
4. **Futuro-proof**: Fácil añadir OR logic, grupos, campo-to-campo comparisons

---

## 9. Próximos Pasos Inmediatos

1. ✅ Review y aprobación de este análisis
2. 🔨 Implementar `ClientSideFilterExecutor` con tests
3. 🔨 Refactorizar `AppTableClientSideComponent`
4. 🧪 Testing exhaustivo con todos los operadores
5. 📝 Actualizar documentación de uso
6. 🚀 Deploy y validación

---

**¿Pregunta?**: ¿Procedo con la implementación de este diseño?
