> **Referencia humana — no normativa.**
> La fuente de verdad es el archivo en inglés: `.github/instructions/styling.instructions.md`.
> Si existe discrepancia entre este archivo y el EN, el EN prevalece.

<!-- TRANSLATION: IN_SYNC source=.github/instructions/styling.instructions.md ref=c168627 updated_at=2026-04-06 -->

---
name: 'Styling Rules'
description: 'Convenciones CSS/SCSS que imponen tokens de Material Design para color y tipografía, y utilities de Tailwind solo para layout. Úsalas al editar estilos de componentes, plantillas o archivos SCSS. Cubre clases de Tailwind prohibidas y prefijos de nomenclatura CSS.'
applyTo: "src/**/*.{ts,html,scss}"
---

# Styling Rules

## División de Responsabilidades

**Material gestiona colores y tipografía. Tailwind gestiona el layout.**

> **Por qué:** El theming de Material Design aplica tokens de color automáticamente mediante propiedades CSS personalizadas, incluyendo el cambio entre modo oscuro y claro. Mezclar utilities de color de Tailwind (`bg-blue-500`) evita este sistema, codifica valores de forma rígida y rompe la consistencia del tema. Mantener una separación estricta significa que un único cambio de tema se propaga a todos lados sin tocar componentes individuales.

| Necesidad | Herramienta |
|---|---|
| Layout / espaciado | Tailwind (`flex`, `p-6`, `gap-4`) |
| Color | `color="primary"` de Material o token SCSS del proyecto |
| Tipografía | Clases `mat-*` de Material |
| UI de componente | Wrapper PDS (`app-button`, `app-card`) si existe |
| Z-index | `$z-index-*` de `_tokens.scss` |
| Cualquier otra necesidad | SCSS con tokens del proyecto |

## Clases de Tailwind Prohibidas

Nunca uses estas utilities de Tailwind:

- `bg-{color}-*` — usa tokens de Material
- `text-{color}-*` — usa tokens de Material
- `border-{color}-*` — usa tokens de Material
- `dark:*` — usa el theming de Material
- `text-sm`, `text-lg`, `font-bold`, etc. — usa clases `mat-*`

## Nomenclatura de Clases CSS

Todas las clases CSS de un componente deben llevar el prefijo `app-{nombre-del-componente}-`.

> **Por qué:** Los estilos de componentes Angular están encapsulados mediante view encapsulation, pero el SCSS global (tokens, temas) no lo está. Un prefijo evita colisiones con estilos de terceros y deja claro de inmediato a qué componente pertenece una clase al leer DevTools o revisar un PR.

```scss
// ❌
.active { ... }
.card-title { ... }

// ✅
.app-user-card-active { ... }
.app-user-card-title { ... }
```

## data-testid en Plantillas

Todos los elementos interactivos y áreas de contenido clave **deben tener atributos `data-testid`**.

```html
<button data-testid="submit-button" (click)="onSubmit()">{{ label }}</button>
<div data-testid="error-message" *ngIf="hasError">{{ errorText }}</div>
<input data-testid="email-input" [formControl]="emailControl" />
```

> **Por qué:** `data-testid` es el único selector estable bajo refactors de CSS y cambios de copy. Consulta [Testing Standards](../testing.instructions.md) para la regla completa.

---

## Instrucciones Relacionadas

- [Component Conventions](../components.instructions.md) — estructura de componentes y requisitos de ubicación de `data-testid`
- [Testing Standards](../testing.instructions.md) — por qué `data-testid` es el único selector válido en pruebas
