> **Referencia humana — no normativa.**
> La fuente de verdad es el archivo en inglés: `.github/instructions/components.instructions.md`.
> Si existe discrepancia entre este archivo y el EN, el EN prevalece.

<!-- TRANSLATION: IN_SYNC source=.github/instructions/components.instructions.md ref=c168627 updated_at=2026-04-06 -->

---
name: 'Component Conventions'
description: 'Reglas de estructura de componentes Angular para este proyecto. Úsalas al crear o modificar componentes Angular. Cubre el patrón de 5 archivos, inputs con signal y COMPONENT_DEFAULTS, clases computadas, sin CVA, data-testid e i18n con $localize.'
applyTo: "src/**/*.{component.ts,component.html,component.scss,model.ts}"
---

# Component Conventions

## Archivos Requeridos por Componente

Cada componente debe tener exactamente estos archivos — sin excepciones, incluso para componentes pequeños:

```
{name}.component.ts
{name}.component.html
{name}.component.scss
{name}.component.spec.ts
{name}.model.ts
```

> **Por qué:** Colocalizar todos los archivos relacionados (lógica, plantilla, estilos, pruebas, modelo) convierte cada componente en una unidad autocontenida. Un desarrollador puede abrir una carpeta y encontrar todo lo que necesita. El archivo `.model.ts` también evita que los valores mágicos queden dispersos inline — todos los valores por defecto y tipos viven en un lugar predecible.

## Patrón de model.ts

```typescript
export const COMPONENT_DEFAULTS = {
  size: 'medium',
  disabled: false,
} as const;
```

## Patrones de component.ts

```typescript
// Inputs con valores por defecto del modelo
readonly size = input<Size>(COMPONENT_DEFAULTS.size);

// Miembros solo para plantilla → protected
protected readonly classes = computed(() => ({
  'app-name--active': this.active(),
}));
```

### Signals Computadas para Clases Dinámicas

Usa `computed()` para clases dinámicas. Nunca uses métodos (se reevalúan en cada ciclo de detección de cambios).

> **Por qué:** Una llamada a método en una plantilla se invoca en cada ciclo de detección de cambios, aunque sus entradas no hayan cambiado. Una signal `computed()` memoriza el resultado y solo recalcula cuando sus dependencias cambian, dando a la estrategia OnPush de Angular la máxima eficiencia.

```typescript
// ❌
getClasses() { return { 'app-btn--active': this.active() }; }

// ✅
protected readonly classes = computed(() => ({ 'app-btn--active': this.active() }));
```

### Visibilidad de Miembros

Los miembros usados únicamente por la plantilla deben ser `protected`, no `public`.

```typescript
// ❌
isLoading = signal(false);

// ✅
protected isLoading = signal(false);
```

Excepción: los miembros a los que acceden pruebas o componentes padre deben mantenerse como `public`.

## Formularios

Usa `control = input.required<FormControl>()`. Nunca implementes `ControlValueAccessor`.

> **Por qué:** CVA requiere implementar 4 métodos de interfaz más el cableado de detección de cambios — una cantidad considerable de boilerplate sin valor añadido en este proyecto. Los inputs signal de Angular 17+ permiten que los componentes padre pasen un `FormControl` directamente, manteniendo los componentes de formulario ligeros y predecibles sin necesidad de una capa de value accessor personalizada.

```typescript
// ✅
control = input.required<FormControl>();

// ❌
implements ControlValueAccessor
```

## data-testid en Plantillas

Todos los elementos interactivos y áreas de contenido clave **deben tener atributos `data-testid`**.

```html
<button data-testid="submit-button" (click)="onSubmit()">{{ label }}</button>
<div data-testid="error-message" *ngIf="hasError">{{ errorText }}</div>
<input data-testid="email-input" [formControl]="emailControl" />
```

## i18n

Todas las cadenas visibles por el usuario deben usar `$localize` con un ID `@@`. Nunca codifiques cadenas de UI de forma rígida.

```typescript
// ✅
$localize`:@@component.submit:Submit`

// ❌
'Submit'
```

## Wrappers PDS

Usa wrappers PDS (`app-button`, `app-card`, etc.) en lugar de componentes de Material directamente cuando existan. Comprueba primero `ui-kit/`.

## Estilo de Código

- Código funcional (`filter`, `map`) en lugar de bucles imperativos
- Todo el código en inglés — variables, funciones, clases, comentarios
- Sin comentarios que describan lo que hace el código. Renombra si el nombre no es autodescriptivo

---

## Instrucciones Relacionadas

- [Styling Rules](../styling.instructions.md) — prefijo de nomenclatura de clases CSS (`app-{component-name}-`) y utilities de Tailwind prohibidas
- [Testing Standards](../testing.instructions.md) — cómo probar este componente usando `data-testid` y patrones de caja negra
- [Architectural Principles](../architectural-principles.instructions.md) — dónde colocar este componente y qué dependencias están permitidas
