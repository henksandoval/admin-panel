# Análisis de Código Común: AppSimpleFilter vs AppAdvancedFilter

**Fecha:** 18 de Febrero de 2026  
**Componentes analizados:**
- `AppSimpleFilterComponent` (simple)
- `AppAdvancedFilterComponent` (advanced)

---

## 🎯 Resumen Ejecutivo

Ambos componentes comparten **una cantidad significativa de código común** (aproximadamente 35-40%), principalmente en:
- Gestión de toggles
- Outputs de eventos
- Defaults de configuración
- Lógica de computed signals para mostrar/ocultar elementos
- Renderizado condicional de campos por tipo

---

## 📊 Código Común Identificado

### 1. **Gestión de Toggles** (100% duplicado)

#### AppSimpleFilterComponent
```typescript
readonly toggles = signal<AppFilterToggle[]>([]);

constructor() {
  effect(() => {
    this.toggles.set((this.config().toggles ?? []).map(t => ({ ...t })));
  });
}

onToggleChange(key: string, event: Event): void {
  const checked = (event.target as HTMLInputElement).checked;
  this.toggles.update(current =>
    current.map(t => t.key === key ? { ...t, value: checked } : t)
  );
  this.toggleChange.emit(togglesToRecord(this.toggles()));
}
```

#### AppAdvancedFilterComponent
```typescript
readonly toggles = signal<AppFilterToggle[]>([]);

constructor() {
  effect(() => {
    this.toggles.set((this.config().toggles ?? []).map(t => ({ ...t })));
  });
}

onToggleChange(key: string, event: Event): void {
  const checked = (event.target as HTMLInputElement).checked;
  this.toggles.update(current =>
    current.map(t => t.key === key ? { ...t, value: checked } : t)
  );
  this.toggleChange.emit(togglesToRecord(this.toggles()));
  this.emitAutoSearch();
}
```

**Diferencia:** Advanced emite `emitAutoSearch()` adicional.

---

### 2. **Outputs Comunes**

Ambos componentes declaran:

```typescript
toggleChange = output<Record<string, boolean>>();
```

---

### 3. **Computed Signals para Defaults** (Patrón idéntico)

#### AppSimpleFilterComponent
```typescript
readonly appearance = computed(() => 
  this.config().appearance ?? FILTER_DEFAULTS.appearance
);
readonly showClearAll = computed(() => 
  this.config().showClearAll ?? FILTER_DEFAULTS.showClearAll
);
readonly clearAllLabel = computed(() => 
  this.config().clearAllLabel ?? FILTER_DEFAULTS.clearAllLabel
);
private readonly debounceMs = computed(() => 
  this.config().debounceMs ?? FILTER_DEFAULTS.debounceMs
);
```

#### AppAdvancedFilterComponent
```typescript
readonly showClearButton = computed(() => 
  this.config().showClearButton ?? FILTER_DEFAULTS.showClearButton
);
readonly showSearchButton = computed(() => 
  this.config().showSearchButton ?? FILTER_DEFAULTS.showSearchButton
);
private readonly autoSearch = computed(() => 
  this.config().autoSearch ?? FILTER_DEFAULTS.autoSearch
);
private readonly maxCriteria = computed(() => 
  this.config().maxCriteria ?? FILTER_DEFAULTS.maxCriteria
);
```

**Patrón común:** `computed(() => this.config().property ?? DEFAULTS.property)`

---

### 4. **Renderizado de Campos por Tipo** (Lógica similar)

#### AppSimpleFilterComponent (Template)
```html
@switch (filter.type) {
  @case ('text') {
    <app-form-input [formControl]="getControl(filter.key)" 
                    [config]="{ type: 'text', label: filter.label, ... }">
    </app-form-input>
  }
  @case ('number') {
    <app-form-input [formControl]="getControl(filter.key)" 
                    [config]="{ type: 'number', label: filter.label, ... }">
    </app-form-input>
  }
  @case ('select') {
    <app-form-select [formControl]="getControl(filter.key)" 
                     [options]="getSelectOptions(filter)" 
                     [config]="{ label: filter.label, ... }">
    </app-form-select>
  }
  @case ('date') {
    <app-form-datepicker [formControl]="getControl(filter.key)" 
                         [config]="{ label: filter.label, ... }">
    </app-form-datepicker>
  }
}
```

#### AppAdvancedFilterComponent (Template)
```html
@switch (selectedFieldType()) {
  @case ('select') {
    <app-form-select appFormSelectConnector formControlName="value" 
                     [options]="valueOptions()" [config]="{ label: 'Valor' }">
    </app-form-select>
  }
  @case ('date') {
    <app-form-datepicker appFormDatepickerConnector formControlName="value"
                         [config]="{ label: 'Fecha' }">
    </app-form-datepicker>
  }
  @case ('number') {
    <app-form-input appFormInputConnector formControlName="value" type="number"
                    [config]="{ label: 'Valor' }">
    </app-form-input>
  }
  @case ('boolean') {
    <app-form-select appFormSelectConnector formControlName="value" 
                     [options]="booleanOptions" [config]="{ label: 'Valor' }">
    </app-form-select>
  }
  @default {
    <app-form-input appFormInputConnector formControlName="value" 
                    [config]="{ label: 'Valor' }">
    </app-form-input>
  }
}
```

**Patrón común:** Renderizado condicional de componentes de formulario basado en tipo de campo.

---

### 5. **Renderizado de Toggles en Template** (100% duplicado)

#### AppSimpleFilterComponent
```html
@for (toggle of toggles(); track toggle.key) {
  <app-checkbox [checked]="toggle.value" (change)="onToggleChange(toggle.key, $event)">
    {{ toggle.label }}
  </app-checkbox>
}
```

#### AppAdvancedFilterComponent
```html
@for (toggle of toggles(); track toggle.key) {
  <app-checkbox [checked]="toggle.value" (change)="onToggleChange(toggle.key, $event)">
    {{ toggle.label }}
  </app-checkbox>
}
```

---

### 6. **Imports de Módulos Angular** (Parcialmente comunes)

#### Comunes en ambos:
```typescript
import { Component, ChangeDetectionStrategy, computed, effect, 
         input, output, signal, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AppCheckboxComponent } from '@shared/atoms/app-checkbox/app-checkbox.component';
import { AppFormDatepickerComponent } from '@shared/molecules/app-form/app-form-datepicker/...';
import { AppFormInputComponent } from '@shared/molecules/app-form/app-form-input/...';
import { AppFormSelectComponent } from '@shared/molecules/app-form/app-form-select/...';
import { togglesToRecord } from '../app-filter.utils';
import { AppFilterToggle, FILTER_DEFAULTS, AppFiltersConfig } from '../app-filter.model';
```

---

### 7. **Gestión de DestroyRef** (Patrón compartido)

Ambos componentes:
```typescript
private readonly destroyRef = inject(DestroyRef);

// Uso en subscriptions
.pipe(takeUntilDestroyed(this.destroyRef))
```

---

## 🔍 Diferencias Clave

### Simple Filter
- Trabaja con `FormGroup` dinámico
- Emite valores (`AppFilterValues`)
- Tiene `debounceTime` en valueChanges
- Gestiona valores externos vía `input()` y `effect()`
- Botón "Limpiar todos" simple

### Advanced Filter
- Trabaja con `FormBuilder` y criterios
- Emite criterios (`AppFilterCriterion[]`)
- Constructor de filtros interactivo (campo → operador → valor)
- Auto-search opcional
- Muestra pills visuales de criterios activos
- Lógica de cascada de formulario (field → operator → value)

---

## 💡 Oportunidades de Refactoring

> **⚠️ IMPORTANTE:** Este proyecto NO usa herencia de clases ni servicios con `@Injectable`. 
> El refactor debe seguir el patrón del proyecto: **composición con standalone components, signals y funciones utilitarias**.

---

### 1. **Funciones Utilitarias para Toggles** (Composición funcional)

En lugar de una clase base, extraer la lógica a funciones reutilizables:

```typescript
// app-filter-toggles.utils.ts
import { Signal, WritableSignal, effect, output } from '@angular/core';
import { AppFilterToggle, AppFiltersConfig } from './app-filter.model';
import { togglesToRecord } from './app-filter.utils';

export interface FilterTogglesHandlers {
  toggles: WritableSignal<AppFilterToggle[]>;
  onToggleChange: (key: string, event: Event) => void;
}

export function createFilterTogglesHandlers(
  config: Signal<AppFiltersConfig>,
  toggleChange: ReturnType<typeof output<Record<string, boolean>>>,
  onChangeCallback?: () => void
): FilterTogglesHandlers {
  const toggles = signal<AppFilterToggle[]>([]);

  // Auto-sync con config
  effect(() => {
    toggles.set((config().toggles ?? []).map(t => ({ ...t })));
  });

  const onToggleChange = (key: string, event: Event): void => {
    const checked = (event.target as HTMLInputElement).checked;
    toggles.update(current =>
      current.map(t => t.key === key ? { ...t, value: checked } : t)
    );
    toggleChange.emit(togglesToRecord(toggles()));
    onChangeCallback?.();
  };

  return { toggles, onToggleChange };
}
```

**Uso en componentes:**

```typescript
export class AppAdvancedFilterComponent {
  readonly config = input.required<AppFiltersConfig>();
  toggleChange = output<Record<string, boolean>>();

  // Composición: delega la lógica a la función utilitaria
  private togglesHandlers = createFilterTogglesHandlers(
    this.config,
    this.toggleChange,
    () => this.emitAutoSearch() // callback específico del componente
  );

  readonly toggles = this.togglesHandlers.toggles;
  readonly onToggleChange = this.togglesHandlers.onToggleChange;
}
```

**Beneficios:**
- ✅ Sin herencia (composición funcional)
- ✅ Reutilización total de lógica (~30 LOC)
- ✅ Type-safe y testeable
- ✅ Permite callbacks personalizados por componente
- ✅ Sigue el patrón del proyecto (signals + funciones)

---

### 2. **Componente Atómico: `AppFilterToggles`**

Un componente standalone reutilizable para el renderizado:

```typescript
// app-filter-toggles.component.ts
import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { AppCheckboxComponent } from '@shared/atoms/app-checkbox/app-checkbox.component';
import { AppFilterToggle } from '../app-filter.model';

@Component({
  selector: 'app-filter-toggles',
  standalone: true,
  imports: [AppCheckboxComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (toggle of toggles(); track toggle.key) {
      <app-checkbox 
        [checked]="toggle.value" 
        (change)="toggleChange.emit({ key: toggle.key, event: $event })">
        {{ toggle.label }}
      </app-checkbox>
    }
  `
})
export class AppFilterTogglesComponent {
  toggles = input.required<AppFilterToggle[]>();
  toggleChange = output<{ key: string; event: Event }>();
}
```

**Uso en templates:**

```html
<!-- Simple Filter -->
<app-filter-toggles 
  [toggles]="toggles()" 
  (toggleChange)="onToggleChange($event.key, $event.event)">
</app-filter-toggles>

<!-- Advanced Filter -->
<app-filter-toggles 
  [toggles]="toggles()" 
  (toggleChange)="onToggleChange($event.key, $event.event)">
</app-filter-toggles>
```

**Beneficios:**
- ✅ Elimina 100% duplicación de template (~5 LOC por componente)
- ✅ Componente atómico testeable
- ✅ Standalone component (estilo del proyecto)
- ✅ Single Responsibility

---

### 3. **Funciones Utilitarias para Defaults** (Type-safe helpers)

```typescript
// app-filter-defaults.utils.ts
import { Signal, computed } from '@angular/core';
import { AppFiltersConfig, FILTER_DEFAULTS } from './app-filter.model';

export function createDefaultComputed<K extends keyof typeof FILTER_DEFAULTS>(
  config: Signal<AppFiltersConfig>,
  key: K
): Signal<typeof FILTER_DEFAULTS[K]> {
  return computed(() => config()[key] ?? FILTER_DEFAULTS[key]);
}

export function createDefaultsComputeds<K extends keyof typeof FILTER_DEFAULTS>(
  config: Signal<AppFiltersConfig>,
  keys: K[]
): Record<K, Signal<typeof FILTER_DEFAULTS[K]>> {
  return keys.reduce((acc, key) => {
    acc[key] = createDefaultComputed(config, key);
    return acc;
  }, {} as Record<K, Signal<typeof FILTER_DEFAULTS[K]>>);
}
```

**Uso en componentes:**

```typescript
export class AppSimpleFilterComponent {
  readonly config = input.required<AppFiltersConfig>();

  // Antes: 4 computed signals repetitivos
  // readonly appearance = computed(() => this.config().appearance ?? FILTER_DEFAULTS.appearance);
  // readonly showClearAll = computed(() => this.config().showClearAll ?? FILTER_DEFAULTS.showClearAll);
  // ...

  // Después: una sola línea
  private defaults = createDefaultsComputeds(this.config, [
    'appearance', 'showClearAll', 'clearAllLabel', 'debounceMs'
  ]);

  readonly appearance = this.defaults.appearance;
  readonly showClearAll = this.defaults.showClearAll;
  readonly clearAllLabel = this.defaults.clearAllLabel;
  private readonly debounceMs = this.defaults.debounceMs;
}
```

**Beneficios:**
- ✅ Reduce boilerplate de ~4 líneas a 1 línea
- ✅ Type-safe (TypeScript infiere tipos)
- ✅ Funcional y composable
- ✅ Sin servicios ni inyección

---

### 4. **Componente Reutilizable: `AppFilterFieldRenderer`** (Opcional)

Componente standalone para encapsular el switch de tipos:

```typescript
// app-filter-field-renderer.component.ts
import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AppFilterFieldType } from '../app-filter.model';
import { AppFormInputComponent } from '@shared/molecules/app-form/app-form-input/app-form-input.component';
import { AppFormSelectComponent } from '@shared/molecules/app-form/app-form-select/app-form-select.component';
import { AppFormDatepickerComponent } from '@shared/molecules/app-form/app-form-datepicker/app-form-datepicker.component';
import { SelectOption } from '@shared/molecules/app-form/app-form-select/app-form-select.model';

@Component({
  selector: 'app-filter-field-renderer',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AppFormInputComponent,
    AppFormSelectComponent,
    AppFormDatepickerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @switch (fieldType()) {
      @case ('text') {
        <app-form-input [formControl]="control()" [config]="config()"></app-form-input>
      }
      @case ('number') {
        <app-form-input [formControl]="control()" type="number" [config]="config()"></app-form-input>
      }
      @case ('select') {
        <app-form-select [formControl]="control()" [options]="options()" [config]="config()"></app-form-select>
      }
      @case ('date') {
        <app-form-datepicker [formControl]="control()" [config]="config()"></app-form-datepicker>
      }
      @case ('boolean') {
        <app-form-select [formControl]="control()" [options]="booleanOptions()" [config]="config()"></app-form-select>
      }
    }
  `
})
export class AppFilterFieldRendererComponent {
  fieldType = input.required<AppFilterFieldType>();
  control = input.required<FormControl>();
  config = input<any>({});
  options = input<SelectOption[]>([]);
  booleanOptions = input<SelectOption[]>([
    { value: true, label: 'Sí' },
    { value: false, label: 'No' }
  ]);
}
```

**Beneficios:**
- ✅ Elimina ~40 LOC de switches duplicados
- ✅ Facilita agregar nuevos tipos
- ✅ Standalone y testeable
- ⚠️ Puede ser overkill si solo se usan en 2 lugares

**Prioridad:** Media-Baja (evaluar ROI)

---

## 📈 Métricas de Duplicación

| Aspecto | Duplicación | LOC Duplicadas | Solución Propuesta | Prioridad |
|---------|-------------|----------------|-------------------|-----------|
| Gestión de toggles | 100% | ~25 | Función utilitaria `createFilterTogglesHandlers` | 🔴 Alta |
| Renderizado de toggles | 100% | ~5 | Componente `AppFilterTogglesComponent` | 🔴 Alta |
| Computed defaults | Patrón | ~15 | Función `createDefaultsComputeds` | 🟡 Media |
| Renderizado campos | Lógica similar | ~40 | Componente `AppFilterFieldRenderer` (opcional) | 🟢 Baja |
| DestroyRef pattern | 100% | ~3 | Ya es minimal, OK dejar así | 🟢 N/A |

**Total estimado de código duplicado/similar:** ~90-100 LOC  
**Reducción estimada con refactor:** ~70-80 LOC (77-80%)

---

## 🎯 Recomendaciones (Actualizado: Composición > Herencia)

### Prioridad 1 - Implementar Ya (Alto ROI)
1. ✅ Crear función `createFilterTogglesHandlers` en `app-filter-toggles.utils.ts`
2. ✅ Crear componente `AppFilterTogglesComponent` (standalone, atómico)
3. ✅ Refactorizar `AppSimpleFilterComponent` y `AppAdvancedFilterComponent` para usar ambos

**Impacto:** ~35 LOC eliminadas, mejor testabilidad

---

### Prioridad 2 - Siguiente Iteración (ROI Medio)
4. ✅ Crear función `createDefaultsComputeds` en `app-filter-defaults.utils.ts`
5. ✅ Aplicar en ambos componentes para reducir boilerplate de computed signals

**Impacto:** ~15 LOC más limpias, código más declarativo

---

### Prioridad 3 - Evaluar (ROI Bajo/Medio)
6. ⚙️ Considerar `AppFilterFieldRenderer` solo si se añaden más componentes de filtros
7. ⚙️ Si se crean 3+ tipos de filtros, extraer también lógica de FormGroup dinámico

**Impacto:** ~40 LOC potenciales, pero puede ser overkill para 2 componentes

---

### ❌ NO Hacer (Anti-patrones para este proyecto)
- ❌ Crear clase base abstracta (el proyecto no usa herencia)
- ❌ Crear servicios `@Injectable` (el proyecto usa funciones puras)
- ❌ Usar mixins o decoradores custom (complejidad innecesaria)
- ❌ Crear una "librería de filtros" genérica (YAGNI)

---

## 🔄 Orden de Implementación Recomendado

```
1. app-filter-toggles.utils.ts          (función createFilterTogglesHandlers)
   └─> Testear en isolation
   
2. app-filter-toggles.component.ts      (componente standalone)
   └─> Testear con diferentes toggles
   
3. Refactorizar AppAdvancedFilterComponent
   └─> Aplicar utils + componente
   └─> Verificar tests E2E
   
4. Refactorizar AppSimpleFilterComponent
   └─> Aplicar utils + componente
   └─> Verificar tests E2E
   
5. app-filter-defaults.utils.ts         (función createDefaultsComputeds)
   └─> Aplicar en ambos componentes
   
6. Cleanup: eliminar código muerto
```

---

## 🧪 Plan de Testing

Al refactorizar, asegurar:
- ✅ Tests unitarios para `BaseFilterComponent`
- ✅ Tests de integración para toggles
- ✅ Tests E2E que cubran ambos filtros (simple/advanced)
- ✅ Verificar que outputs se emiten correctamente
- ✅ Validar que defaults se aplican bien

---

## 📝 Conclusiones

1. **Existe ~35-40% de código duplicado** entre ambos componentes
2. La **gestión de toggles es 100% duplicada** y candidata perfecta para extracción
3. El **patrón de computed defaults** se repite y puede abstraerse
4. El **renderizado condicional de campos** puede centralizarse (opcional)
5. **La composición funcional es superior a la herencia** en este contexto

### ¿Por qué NO usar herencia?

| Criterio | Herencia | Composición (recomendado) |
|----------|----------|---------------------------|
| **Acoplamiento** | 🔴 Alto (tight coupling) | 🟢 Bajo (loose coupling) |
| **Testabilidad** | 🟡 Requiere setup de clase base | 🟢 Funciones puras testeables aisladamente |
| **Flexibilidad** | 🔴 Rígido (single inheritance) | 🟢 Flexible (múltiples funciones) |
| **Estilo del proyecto** | 🔴 No se usa en ningún lado | 🟢 Standalone + signals (consistente) |
| **Tree-shaking** | 🟡 Puede cargar código no usado | 🟢 Solo importa lo necesario |
| **Debugging** | 🔴 Callstack más complejo | 🟢 Callstack directo |
| **Reusabilidad** | 🟡 Solo vía herencia | 🟢 Función importable en cualquier lado |

**Beneficio estimado del refactor (composición):**
- 📉 Reducción de ~70-80 LOC (77-80% del código duplicado)
- 🔧 **Mejora de mantenibilidad** (funciones puras, sin jerarquías)
- 🧪 **Mejora de testabilidad** (unit tests simples)
- 🚀 Facilita adición de nuevos tipos de filtros
- 🎯 **Consistente con el estilo del proyecto** (clave)

---

## 🔗 Referencias

- `app-filter.model.ts` - Modelos compartidos
- `app-filter.utils.ts` - Utilidades compartidas (ya reutilizadas)
- `FILTER_DEFAULTS` - Constantes compartidas (bien implementadas)

---

## 📚 Principios de Diseño Aplicados

El refactor propuesto sigue estos principios:

### SOLID (adaptado a composición funcional)
- **S**ingle Responsibility: Funciones y componentes con propósito único
- **O**pen/Closed: Extensión vía composición, no modificación
- **L**iskov Substitution: N/A (no hay herencia)
- **I**nterface Segregation: Interfaces mínimas y específicas
- **D**ependency Inversion: Funciones puras sin dependencias ocultas

### Composition over Inheritance
- ✅ Funciones utilitarias reutilizables
- ✅ Standalone components pequeños y composables
- ✅ Signals para estado reactivo
- ✅ Zero magic, zero side effects ocultos

### YAGNI (You Aren't Gonna Need It)
- ❌ No crear abstracciones "por si acaso"
- ✅ Refactorizar solo código duplicado real
- ✅ Evaluar ROI de cada extracción

---

**Nota final:** Este análisis demuestra que **la composición funcional es la mejor opción para este proyecto**, evitando anti-patrones como herencia de clases o servicios inyectables que romperían la consistencia del codebase. El enfoque propuesto mantiene el estilo moderno de Angular (signals, standalone components, funciones puras) y facilita el mantenimiento a largo plazo.

