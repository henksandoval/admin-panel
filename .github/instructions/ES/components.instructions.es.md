> **Referencia humana — no normativa.**
> La fuente de verdad es el archivo en inglés: `.github/instructions/components.instructions.md`.
> Si existe discrepancia entre este archivo y el EN, el EN prevalece.

<!-- TRANSLATION: IN_SYNC source=.github/instructions/components.instructions.md ref=c168627 updated_at=2026-04-08 -->

---
name: 'Component Conventions'
description: 'Reglas de estructura de componentes Angular para este proyecto. Usar al crear o modificar componentes Angular. Cubre el patrón de 5 archivos, signal inputs con COMPONENT_DEFAULTS, clases computed, sin CVA, data-testid e i18n con $localize.'
applyTo: "src/**/*.{component.ts,component.html,component.scss,model.ts}"
---

# Convenciones de Componentes

## Archivos Requeridos por Componente

Cada componente debe tener exactamente estos archivos — sin excepciones, incluso para componentes pequeños:

```
{nombre}.component.ts
{nombre}.component.html
{nombre}.component.scss
{nombre}.component.spec.ts
{nombre}.model.ts
```

> **Por qué:** Centralizar todos los archivos relacionados (lógica, plantilla, estilos, tests, modelo) convierte cada componente en una unidad autocontenida. Un desarrollador puede abrir una carpeta y encontrar todo lo que necesita. El archivo `.model.ts` también evita que los valores literales queden dispersos — todos los valores por defecto y tipos viven en un lugar predecible.

## Patrón model.ts

```typescript
export const COMPONENT_DEFAULTS = {
  size: 'medium',
  disabled: false,
} as const;
```

## Patrones en component.ts

```typescript
// Inputs con valores por defecto del modelo
readonly size = input<Size>(COMPONENT_DEFAULTS.size);

// Miembros exclusivos de plantilla → protected
protected readonly classes = computed(() => ({
  'app-name--active': this.active(),
}));
```

### Signals Computed para Clases Dinámicas

Usa `computed()` para clases dinámicas. Nunca uses métodos (se reevalúan en cada ciclo de detección de cambios).

> **Por qué:** Una llamada a método en una plantilla se invoca en cada ciclo de detección de cambios, aunque sus entradas no hayan cambiado. Un signal `computed()` memoriza el resultado y solo recalcula cuando sus dependencias cambian, dando a la estrategia OnPush de Angular la máxima eficiencia.

```typescript
// ❌
getClasses() { return { 'app-btn--active': this.active() }; }

// ✅
protected readonly classes = computed(() => ({ 'app-btn--active': this.active() }));
```

### Visibilidad de Miembros

Los miembros usados solo por la plantilla deben ser `protected`, no `public`.

```typescript
// ❌
isLoading = signal(false);

// ✅
protected isLoading = signal(false);
```

Excepción: los miembros a los que acceden los tests o los componentes padre deben permanecer `public`.

## Formularios

Usa `control = input.required<FormControl>()`. Nunca implementes `ControlValueAccessor`.

> **Por qué:** CVA requiere implementar 4 métodos de interfaz más el cableado de detección de cambios — un boilerplate significativo sin valor añadido en este proyecto. Los signal inputs de Angular 17+ permiten a los componentes padre pasar un `FormControl` directamente, manteniendo los componentes de formulario ligeros y predecibles sin necesidad de una capa de value accessor personalizada.

```typescript
// ✅
control = input.required<FormControl>();

// ❌
implements ControlValueAccessor
```

## data-testid en Plantillas

Todos los elementos interactivos y las áreas de contenido clave **deben tener atributos `data-testid`**.

```html
<button data-testid="submit-button" (click)="onSubmit()">{{ label }}</button>
<div data-testid="error-message" *ngIf="hasError">{{ errorText }}</div>
<input data-testid="email-input" [formControl]="emailControl" />
```

## i18n

Todas las cadenas visibles por el usuario deben usar `$localize` con un ID `@@`. Nunca codifiques cadenas de UI directamente.

```typescript
// ✅
$localize`:@@component.submit:Submit`

// ❌
'Submit'
```

## Wrappers del PDS

Usa wrappers del PDS (`app-button`, `app-card`, etc.) sobre componentes Material directos cuando existan. Comprueba `ui-kit/` primero.

## Estilo de Código

- Código funcional (`filter`, `map`) antes que bucles imperativos
- Todo el código en inglés — variables, funciones, clases, comentarios
- Sin comentarios que describan qué hace el código. Renombra si el nombre no es autoexplicativo

---

## Instrucciones Relacionadas

- [Reglas de Estilos](../styling.instructions.md) — prefijo de nomenclatura de clases CSS (`app-{nombre-del-componente}-`) y utilidades de Tailwind prohibidas
- [Estándares de Testing](../testing.instructions.md) — cómo testear este componente usando `data-testid` y patrones de caja negra
- [Principios Arquitectónicos](../architectural-principles.instructions.md) — dónde colocar este componente y qué dependencias están permitidas
