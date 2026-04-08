> **Referencia humana — no normativa.**
> La fuente de verdad es el archivo en inglés: `.github/instructions/styling.instructions.md`.
> Si existe discrepancia entre este archivo y el EN, el EN prevalece.

<!-- TRANSLATION: IN_SYNC source=.github/instructions/styling.instructions.md ref=c168627 updated_at=2026-04-08 -->

---
name: 'Styling Rules'
description: 'Convenciones CSS/SCSS que aplican tokens de Material Design para color y tipografía, y utilidades de Tailwind solo para layout. Usar al editar estilos de componentes, plantillas o archivos SCSS. Cubre clases de Tailwind prohibidas y prefijos de nomenclatura CSS.'
applyTo: "src/**/*.{ts,html,scss}"
---

# Reglas de Estilos

## División de Responsabilidades

**Material gestiona colores y tipografía. Tailwind gestiona el layout.**

> **Por qué:** El tema de Material Design aplica tokens de color automáticamente mediante propiedades CSS personalizadas, incluyendo el cambio entre modo oscuro y claro. Mezclar utilidades de color de Tailwind (`bg-blue-500`) elude este sistema, codifica valores fijos y rompe la consistencia del tema. Mantener una separación estricta significa que un único cambio de tema se propaga a todos lados sin tocar componentes individuales.

| Necesidad | Herramienta |
|---|---|
| Layout / espaciado | Tailwind (`flex`, `p-6`, `gap-4`) |
| Color | `color="primary"` de Material o token de proyecto en SCSS |
| Tipografía | Clases `mat-*` de Material |
| UI de componente | Wrapper del PDS (`app-button`, `app-card`) si existe |
| Z-index | `$z-index-*` desde `_tokens.scss` |
| Cualquier otra cosa | SCSS con tokens del proyecto |

## Clases de Tailwind Prohibidas

Nunca uses estas utilidades de Tailwind:

- `bg-{color}-*` — usa tokens de Material
- `text-{color}-*` — usa tokens de Material
- `border-{color}-*` — usa tokens de Material
- `dark:*` — usa el tema de Material
- `text-sm`, `text-lg`, `font-bold`, etc. — usa clases `mat-*`

## Nomenclatura de Clases CSS

Todas las clases CSS de un componente deben tener el prefijo `app-{nombre-del-componente}-`.

> **Por qué:** Los estilos de los componentes Angular están limitados por encapsulación de vista, pero el SCSS global (tokens, temas) no lo está. Un prefijo evita colisiones con estilos de terceros y deja claro de inmediato qué componente posee una clase al revisar DevTools o un PR.

```scss
// ❌
.active { ... }
.card-title { ... }

// ✅
.app-user-card-active { ... }
.app-user-card-title { ... }
```

## data-testid en Plantillas

Todos los elementos interactivos y las áreas de contenido clave **deben tener atributos `data-testid`**.

```html
<button data-testid="submit-button" (click)="onSubmit()">{{ label }}</button>
<div data-testid="error-message" *ngIf="hasError">{{ errorText }}</div>
<input data-testid="email-input" [formControl]="emailControl" />
```

> **Por qué:** `data-testid` es el único selector estable ante refactorings de CSS y cambios de contenido. Consulta [Estándares de Testing](../testing.instructions.md) para la regla completa.

---

## Instrucciones Relacionadas

- [Convenciones de Componentes](../components.instructions.md) — estructura de componentes y requisitos de colocación de `data-testid`
- [Estándares de Testing](../testing.instructions.md) — por qué `data-testid` es el único selector de test válido
