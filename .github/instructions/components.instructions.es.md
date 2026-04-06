> **Referencia humana — no normativa.**
> La fuente de verdad es el archivo en inglés: `.github/instructions/components.instructions.md`.
> Si existe discrepancia entre este archivo y el EN, el EN prevalece.

<!-- TRANSLATION: IN_SYNC source=.github/instructions/components.instructions.md ref=7f9f248 updated_at=2026-04-06 -->

---
name: 'Component Conventions'
description: 'Reglas de estructura de componentes Angular para este proyecto. Usar al crear o modificar componentes Angular. Cubre el patrón de 5 archivos, signal inputs con COMPONENT_DEFAULTS, clases computed, sin CVA, data-testid e i18n con $localize.'
applyTo: "src/**/*.{component.ts,component.html,component.scss,model.ts}"
---

# Convenciones de Componentes

## Archivos Requeridos por Componente

Cada componente debe tener exactamente estos archivos — sin excepciones, incluso para componentes pequeños:

```
{name}.component.ts
{name}.component.html
{name}.component.scss
{name}.component.spec.ts
{name}.model.ts
```

> **Por qué:** Co-localizar todos los archivos relacionados (lógica, template, estilos, pruebas, modelo) hace que cada componente sea una unidad autocontenida. Un desarrollador puede abrir una carpeta y encontrar todo lo que necesita. El archivo `.model.ts` también previene que los valores mágicos queden dispersos inline — todos los valores por defecto y tipos viven en un lugar predecible.

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

// Miembros solo del template → protected
protected readonly classes = computed(() => ({
  'app-name--active': this.active(),
}));
```

### Signals Computed para Clases Dinámicas

Usa `computed()` para clases dinámicas. Nunca uses métodos (se re-evalúan en cada ciclo de detección de cambios).

> **Por qué:** Una llamada a método en un template se invoca en cada pasada de detección de cambios, incluso cuando sus entradas no han cambiado. Un signal `computed()` memoiza el resultado y solo recalcula cuando sus dependencias cambian, dando a la estrategia OnPush de Angular la máxima eficiencia.

```typescript
// ❌
getClasses() { return { 'app-btn--active': this.active() }; }

// ✅
protected readonly classes = computed(() => ({ 'app-btn--active': this.active() }));
```

### Visibilidad de Miembros

Los miembros usados solo por el template deben ser `protected`, no `public`.

```typescript
// ❌
isLoading = signal(false);

// ✅
protected isLoading = signal(false);
```

Excepción: los miembros accedidos desde pruebas o componentes padre deben permanecer `public`.

## Formularios

Usa `control = input.required<FormControl>()`. Nunca implementes `ControlValueAccessor`.

> **Por qué:** CVA requiere implementar 4 métodos de interfaz más el cableado de detección de cambios — un boilerplate significativo sin valor añadido en este proyecto. Los signal inputs de Angular 17+ permiten que los componentes padre pasen un `FormControl` directamente, manteniendo los componentes de formulario delgados y predecibles sin una capa de acceso a valor personalizada.

```typescript
// ✅
control = input.required<FormControl>();

// ❌
implements ControlValueAccessor
```

## data-testid en Templates

Todos los elementos interactivos y áreas de contenido clave **deben tener atributos `data-testid`**.

```html
<button data-testid="submit-button" (click)="onSubmit()">{{ label }}</button>
<div data-testid="error-message" *ngIf="hasError">{{ errorText }}</div>
<input data-testid="email-input" [formControl]="emailControl" />
```

## i18n

Todas las cadenas visibles para el usuario deben usar `$localize` con un ID `@@`. Nunca codifiques strings de UI directamente.

```typescript
// ✅
$localize`:@@component.submit:Submit`

// ❌
'Submit'
```

## Wrappers PDS

Usa wrappers PDS (`app-button`, `app-card`, etc.) sobre los componentes de Material directos cuando existan. Verifica `ui-kit/` primero.

## Estilo de Código

- Código funcional (`filter`, `map`) sobre bucles imperativos
- Todo el código en inglés — variables, funciones, clases, comentarios
- Sin comentarios que describan lo que hace el código. Renombra si el nombre no es autodescriptivo

---

## Instrucciones Relacionadas

- [Reglas de Estilos](./styling.instructions.md) — prefijo de nomenclatura de clases CSS (`app-{component-name}-`) y utilidades Tailwind prohibidas
- [Testing Standards](./testing.instructions.md) — cómo probar este componente usando `data-testid` y patrones de caja negra
- [Principios Arquitectónicos](./architectural-principles.instructions.md) — dónde colocar este componente y qué dependencias están permitidas
