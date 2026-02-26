# Guía de Density — Admin Panel

## Cómo funciona el sistema

El density se controla añadiendo una clase al `<body>`:

```
body.density-comfortable   → espaciado +10%, tipografía sin cambios
body.density-compact       → base de referencia
body.density-dense         → espaciado −15%, tipografía sin cambios
```

### Separación de responsabilidades

El sistema tiene **dos capas independientes** que no deben mezclarse:

| Capa | Qué controla | Cómo |
|---|---|---|
| `mat.all-component-densities($n)` | Altura y padding de **componentes Angular Material** | Sistema oficial M3 |
| Tokens `--density-*` | Spacing y layout de **componentes custom del ui-kit** | Sistema propio |

### Por qué la tipografía NO escala con density

M3 spec define que la density afecta exclusivamente la **altura de los componentes interactivos** (touch targets), no la tipografía. Reducir el `font-size` con density impacta la accesibilidad y la legibilidad. Por eso todos los tokens `--density-font-size-*` tienen siempre `$_text-scale: 1.0`.

---

## Escalas por nivel

```scss
// _density.scss — API pública

$spacing-comfortable: 1.1;   // +10% más aire
$spacing-compact:     1.0;   // base — no cambiar
$spacing-dense:       0.85;  // −15% más condensado
```

| Token | comfortable | compact | dense |
|---|---|---|---|
| Tipografía (`--density-font-size-*`) | `1.0` fijo | `1.0` fijo | `1.0` fijo |
| Spacing (`--density-*-padding`, gaps) | `×1.1` | `×1.0` | `×0.85` |
| Iconos (`--density-font-size-icon-*`) | `×1.1` | `×1.0` | `×0.85` |
| Componentes Material | density `0` | density `-1` | density `-2` |

---

## Tokens disponibles

```scss
// ── Tipografía (fija, no escala) ───────────────────
var(--density-font-size-sm)       // 0.875rem — etiquetas, hints, captions
var(--density-font-size-base)     // 1rem     — texto de cuerpo
var(--density-font-size-lg)       // 1.25rem  — títulos de sección

// ── Iconos (escalan con spacing) ───────────────────
var(--density-font-size-icon-sm)  // iconos en botones pequeños
var(--density-font-size-icon-md)  // iconos estándar
var(--density-font-size-icon-lg)  // iconos decorativos

// ── Layout (escalan con spacing) ───────────────────
var(--density-page-padding)       // padding de páginas
var(--density-section-gap)        // gap entre secciones
var(--density-card-padding)       // padding interno de cards

// ── Componentes específicos ────────────────────────
var(--density-badge-font-size)         // fijo
var(--density-badge-padding-x)         // escala
var(--density-badge-padding-y)         // escala
var(--density-badge-radius)            // escala
var(--density-pagination-font-size)    // fijo
var(--density-pagination-padding-y)    // escala
var(--density-pagination-padding-x)    // escala
var(--density-toolbar-title-size)      // fijo
var(--density-toolbar-menu-size)       // fijo
var(--density-toolbar-sub-size)        // fijo
var(--density-breadcrumb-font-size)    // fijo
var(--density-breadcrumb-padding)      // escala
var(--density-filter-icon-size)        // escala
var(--density-radio-label-size)        // fijo
var(--density-radio-hint-size)         // fijo
var(--density-radio-error-size)        // fijo
```

Cada token tiene un **fallback** al valor compact para que funcione sin clase density en el body:

```scss
// ✅ Siempre incluir el fallback
font-size: var(--density-font-size-sm, 0.875rem);
padding:   var(--density-card-padding, 1rem);
```

---

## Regla de uso por tipo de propiedad

| Propiedad CSS | Token a usar | Escala con density |
|---|---|---|
| `font-size` de etiqueta, hint, caption | `--density-font-size-sm` | ❌ fijo |
| `font-size` de cuerpo | `--density-font-size-base` | ❌ fijo |
| `font-size` de título de sección | `--density-font-size-lg` | ❌ fijo |
| `font-size` + `width` + `height` de icono pequeño | `--density-font-size-icon-sm` | ✅ spacing |
| `font-size` + `width` + `height` de icono estándar | `--density-font-size-icon-md` | ✅ spacing |
| `padding` interno de componente | `--density-card-padding` | ✅ spacing |
| `gap` entre secciones de página | `--density-section-gap` | ✅ spacing |
| `padding` de página completa | `--density-page-padding` | ✅ spacing |

---

## Cómo adaptar un componente atómico

### Patrón estándar

```scss
// app-mi-componente.component.scss

:host {
  display: block;
}

.app-mi-componente-label {
  font-size: var(--density-font-size-sm, 0.875rem);  // texto — fijo
}

.app-mi-componente-icon {
  font-size:   var(--density-font-size-icon-md, 1.25rem);  // icono — escala
  width:       var(--density-font-size-icon-md, 1.25rem);
  height:      var(--density-font-size-icon-md, 1.25rem);
  line-height: var(--density-font-size-icon-md, 1.25rem);
}

.app-mi-componente-body {
  padding: var(--density-card-padding, 1rem);  // spacing — escala
}
```

### Patrón para componentes con tamaños (small / medium / large)

Los multiplicadores de tamaño se aplican **sobre el token**, no con valores hardcoded:

```scss
// ✅ BIEN — escala relativa al token base
.app-mi-componente-small  { padding: calc(var(--density-card-padding, 1rem) * 0.75); }
.app-mi-componente-medium { padding: var(--density-card-padding, 1rem); }
.app-mi-componente-large  { padding: calc(var(--density-card-padding, 1rem) * 1.25); }

// ❌ MAL — valores fijos que ignoran el density
.app-mi-componente-small  { padding: 8px; }
.app-mi-componente-large  { padding: 20px; }
```

---

## Cómo aislar un componente del density

Componentes de navegación (sidebar, etc.) no deben verse afectados. Usa el mixin `sidebar-reset()`:

```scss
// app-mi-navegacion.component.scss
@use 'src/themes/density' as density;

:host {
  @include density.sidebar-reset();
}
```

Este mixin emite todos los tokens con los valores de `$spacing-compact` quemados en **compile-time** (números concretos, sin `var()`). Ningún `body.density-*` puede sobreescribirlos porque los tokens CSS del `:host` tienen mayor especificidad.

> **¿Por qué no basta con sobreescribir una variable CSS?**
> Los tokens del `body` llegan como valores concretos ya resueltos (ej. `calc(1rem * 0.85) = 0.85rem`). Sobreescribir `--density-scale` en el `:host` no recalcula los tokens que ya viajaron por la cascada. La única solución es emitir los tokens con valores SCSS concretos, que es lo que hace el mixin.

---

## Añadir un token nuevo

1. **¿Es tipografía o spacing?** Si es `font-size` de texto → usa `$_text-scale`. Si es `padding`, `gap` o icono → usa `$spacing-scale`.
2. Añade el token al mixin en `_density.scss`:

```scss
@mixin density-tokens($spacing-scale) {
  // ...tokens existentes...

  // ── Mi nuevo grupo ───────────────────────────────
  --density-mi-label:   calc(0.875rem * #{$_text-scale});    // tipografía — fijo
  --density-mi-padding: calc(0.75rem  * #{$spacing-scale}); // spacing — escala
}
```

3. Úsalo en el componente con fallback:

```scss
font-size: var(--density-mi-label,   0.875rem);
padding:   var(--density-mi-padding, 0.75rem);
```

---

## Ajustar las escalas globales

Solo modificar las variables de **spacing**. La tipografía es intencionalmenete fija:

```scss
// _density.scss
$spacing-comfortable: 1.1;   // subir para más aire en comfortable
$spacing-compact:     1.0;   // base — no cambiar
$spacing-dense:       0.85;  // bajar para más condensación en dense
```

**Límite recomendado:** el espaciado no debería bajar de `0.7` para evitar problemas visuales graves.
