> **Referencia humana — no normativa.**
> La fuente de verdad es el archivo en inglés: `.github/instructions/styling.instructions.md`.
> Si existe discrepancia entre este archivo y el EN, el EN prevalece.

<!-- TRANSLATION: IN_SYNC source=.github/instructions/styling.instructions.md ref=7f9f248 updated_at=2026-04-06 -->

---
name: 'Styling Rules'
description: 'Convenciones CSS/SCSS que aplican tokens de Material Design para color y tipografía, y utilidades Tailwind solo para layout. Usar al editar estilos de componentes, templates o archivos SCSS. Cubre clases Tailwind prohibidas y prefijos de nombres de clases CSS.'
applyTo: "src/**/*.{ts,html,scss}"
---

# Reglas de Estilos

## División de Responsabilidades

**Material gestiona colores y tipografía. Tailwind gestiona el layout.**

> **Por qué:** El theming de Material Design aplica tokens de color automáticamente a través de propiedades CSS personalizadas, incluyendo el cambio de modo oscuro/claro. Mezclar utilidades de color de Tailwind (`bg-blue-500`) omite este sistema, codifica valores directamente y rompe la consistencia del tema. Mantener una separación estricta significa que un único cambio de theming se propaga en todos lados sin tocar componentes individuales.

| Necesidad | Herramienta |
|---|---|
| Layout / espaciado | Tailwind (`flex`, `p-6`, `gap-4`) |
| Color | `color="primary"` de Material o token SCSS del proyecto |
| Tipografía | Clases `mat-*` de Material |
| UI de componente | Wrapper PDS (`app-button`, `app-card`) si existe |
| Z-index | `$z-index-*` de `_tokens.scss` |
| Cualquier otra cosa | SCSS con tokens del proyecto |

## Clases Tailwind Prohibidas

Nunca uses estas utilidades de Tailwind:

- `bg-{color}-*` — usa tokens de Material
- `text-{color}-*` — usa tokens de Material
- `border-{color}-*` — usa tokens de Material
- `dark:*` — usa theming de Material
- `text-sm`, `text-lg`, `font-bold`, etc. — usa clases `mat-*`

## Nomenclatura de Clases CSS

Todas las clases CSS en un componente deben llevar el prefijo `app-{component-name}-`.

> **Por qué:** Los estilos de componentes Angular tienen alcance mediante encapsulación de vista, pero el SCSS global (tokens, temas) no. Un prefijo previene colisiones con estilos de terceros y deja inmediatamente claro qué componente es dueño de una clase al leer DevTools o revisar un PR.

```scss
// ❌
.active { ... }
.card-title { ... }

// ✅
.app-user-card-active { ... }
.app-user-card-title { ... }
```

## data-testid en Templates

Todos los elementos interactivos y áreas de contenido clave **deben tener atributos `data-testid`**.

```html
<button data-testid="submit-button" (click)="onSubmit()">{{ label }}</button>
<div data-testid="error-message" *ngIf="hasError">{{ errorText }}</div>
<input data-testid="email-input" [formControl]="emailControl" />
```

> **Por qué:** `data-testid` es el único selector estable ante refactors de CSS y cambios de copy. Consulta [Testing Standards](./testing.instructions.md) para la regla completa.

---

## Instrucciones Relacionadas

- [Convenciones de Componentes](./components.instructions.md) — estructura de componentes y requisitos de colocación de `data-testid`
- [Testing Standards](./testing.instructions.md) — por qué `data-testid` es el único selector de prueba válido
