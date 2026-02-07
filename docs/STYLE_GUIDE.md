# Guía de Estilos - Admin Panel

## Principio Único

**Material gestiona colores. Tailwind gestiona layout.**

---

## 📐 LAS 3 CAPAS

```
┌──────────────────────────────────────────────────────┐
│   CAPA 1: Angular Material (GESTOR DE THEMING)       │
│   - Componentes Material (button, card, toolbar)     │
│   - Atributo color="primary|secundary|tertiary"      │
│   - Gestión automática de dark/light/theme-color     │
│   - Material maneja TODOS los colores                │
├──────────────────────────────────────────────────────┤
│   CAPA 2: Tailwind (SOLO LAYOUT Y SPACING)           │
│   - Layout: flex, grid, gap, items-center            │
│   - Spacing: p-6, m-4, space-y-2                     │
│   - Sizing: w-full, h-screen, max-w-4xl              │
│   - Effects: hover:scale-110, transition-transform   │
│   - Responsive: md:, lg:, max-sm:                    │
│   - Borders SIN color: border-t, border-b, border-r  │
│   - Radius: rounded-lg, rounded-full, rounded-xl     │
│   - Shadows básicos: shadow-sm, shadow-md, shadow-lg │
│   - NO COLORES: sin bg-*, text-*, border-red-500     │
│   - NO DARK MODE: sin dark:*                         │
├──────────────────────────────────────────────────────┤
│   CAPA 3: SCSS (SOLO CASOS EXTREMOS)                 │
│   - Gradientes muy complejos                         │
│   - Componentes 100% custom (no usan Material)       │
│   - Cuando Material no puede manejar el caso         │
│   - MÍNIMO uso, preferir Material                    │
└──────────────────────────────────────────────────────┘
```
---

## Reglas de Estilos

### Tailwind: SÍ para layout, NO para colores

```html
<!-- ✅ BIEN -->
<div class="flex items-center gap-4 p-6">
  <button mat-raised-button color="primary">Guardar</button>
</div>

<!-- ❌ MAL -->
<button class="bg-blue-500 text-white">Guardar</button>
<div class="bg-white dark:bg-gray-800">Contenido</div>
```

**Tailwind permitido:** `flex`, `grid`, `gap-*`, `p-*`, `m-*`, `w-*`, `h-*`, `rounded-*`, `shadow-*`, `border-t`, `border-b`

**Tailwind prohibido:** `bg-*`, `text-*`, `border-{color}-*`, `dark:*`

### Material: Siempre para colores

```html
<!-- Botones -->
<button mat-raised-button color="primary">Acción</button>
<button mat-stroked-button color="secondary">Cancelar</button>

<!-- Cards -->
<mat-card appearance="outlined">Contenido</mat-card>

<!-- Iconos -->
<mat-icon color="primary">check</mat-icon>
```

### SCSS: Solo cuando Material no alcanza

Casos válidos:
- Gradientes en navegación
- Estados interactivos complejos (active, parent-active por nivel)
- Mixins reutilizables

```scss
// Usa tokens del proyecto, nunca hardcoded
.app-nav-item:hover {
  background-color: var(--overlay-light-04);
}

// ❌ MAL
.item:hover {
  background: rgba(0, 0, 0, 0.04);
  color: #1976d2;
}
```

---

## Reglas de Componentes

### Estructura de archivos

```
app-table/
├── app-table.component.ts       # Lógica y template
├── app-table.component.scss     # Estilos
└── app-table.model.ts           # Interfaces + DEFAULTS
```

### DEFAULTS obligatorios

```typescript
// app-table.model.ts
export const TABLE_DEFAULTS = {
  emptyMessage: 'No hay datos disponibles',
  stickyHeader: false,
  clickableRows: false,
} as const;

// app-table.component.ts
emptyMessage = input<string>(TABLE_DEFAULTS.emptyMessage);
```

### HTML Template: Inline vs Externo

| Criterio | Inline | Externo |
|----------|--------|---------|
| Líneas de estructura | <50 | >50 |

### CSS: Inline vs Externo

| Criterio | Inline | Externo |
|----------|--------|---------|
| Líneas de estilos | <50 | >50 |
| Necesita mixins | No | Sí |
| Estados complejos | No | Sí |

Si dudas, usa archivo externo.

### Prefijo en clases CSS

```scss
// ✅ BIEN
.app-table { }
.app-table-row { }
.app-table-cell { }

// ❌ MAL
.table { }
.row { }
.cell { }
```

### Computed signals para clases dinámicas

```typescript
// ✅ BIEN
tableClasses = computed(() => {
  const classes = ['app-table'];
  if (this.stickyHeader()) classes.push('sticky-header');
  return classes.join(' ');
});

// ❌ MAL
getClasses(): string {
  return this.stickyHeader ? 'app-table sticky-header' : 'app-table';
}
```

### Código funcional

```typescript
// ✅ BIEN
private cleanValues(values: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(values).filter(([_, v]) => v != null && v !== '')
  );
}

// ❌ MAL
private cleanValues(values: Record<string, any>) {
  const cleaned = {};
  Object.entries(values).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      cleaned[key] = value;
    }
  });
  return cleaned;
}
```

---

## Árbol de Decisión

```
¿Necesitas un estilo?
│
├─ ¿Es layout/spacing? ──────────────► Tailwind (flex, p-6, gap-4)
│
├─ ¿Es border/radius/shadow? ────────► Tailwind (border-t, rounded-lg)
│
├─ ¿Existe en Material? ─────────────► Material (mat-button, mat-card)
│
├─ ¿Es un color? ────────────────────► Material (color="primary")
│
└─ ¿Nada de lo anterior? ────────────► SCSS con tokens del proyecto
```

---

## Tokens Disponibles

```scss
// Layout
var(--sidebar-width-expanded)   // 280px
var(--toolbar-height)           // 64px
var(--transition-fast)          // 150ms

// Overlays (para SCSS custom)
var(--overlay-light-04)
var(--overlay-light-12)
var(--overlay-dark-10)

// Navegación
var(--nav-item-hover-bg)
var(--nav-item-active-bg)
```

## Reglas de Código Limpio

### Sin comentarios innecesarios

El código debe ser autodocumentado. Los nombres de variables, funciones y clases deben explicar su propósito.

```typescript
// ❌ MAL
// Obtiene el usuario activo del sistema
const user = getActiveUser();

// Verificamos si el usuario tiene permisos
if (user.hasPermission('admin')) {
  showAdminPanel();
}

// ✅ BIEN
const activeUser = getActiveUser();

if (activeUser.hasPermission(UserRole.Admin)) {
  showAdminPanel();
}
```

**Comentarios permitidos:**
- Explicar "por qué" cuando no es obvio (decisiones de negocio, workarounds)
- JSDoc en funciones públicas de librerías compartidas

**Comentarios prohibidos:**
- Describir "qué" hace el código
- Código comentado (elimínalo)
- Separadores (`// ========`)
- TODOs sin ticket asociado

### Sin literales hardcoded

Nunca uses strings, números o valores mágicos directamente en el código. Extrae a constantes con nombres descriptivos.

```typescript
// ❌ MAL
if (user.role === 'admin') { }
if (retryCount > 3) { }
element.style.width = '280px';

// ✅ BIEN
if (user.role === UserRole.Admin) { }
if (retryCount > MAX_RETRY_ATTEMPTS) { }
element.style.width = SIDEBAR_WIDTH_EXPANDED;
```

Aplica también en SCSS:

```scss
// ❌ MAL
:host {
  padding: 1.5rem;
}

.grid {
  gap: 24px;
}

@container (min-width: 848px) { }

// ✅ BIEN
$layout-padding: 1.5rem;
$column-gap: 1.5rem;
$column-gap-px: 24px;
$min-slot-width: 400px;
$container-md: ($min-slot-width * 2) + $column-gap-px;

:host {
  padding: $layout-padding;
}

.grid {
  gap: $column-gap;
}

@container (min-width: $container-md) { }
```

**Excepciones válidas:**
- `0`, `1`, `-1` en operaciones matemáticas obvias
- Strings en tests cuando son datos de prueba explícitos

### Nombres descriptivos

```typescript
// ❌ MAL
const d = new Date();
const u = users.filter(x => x.a);
const handleClick = () => { };

// ✅ BIEN
const currentDate = new Date();
const activeUsers = users.filter(user => user.isActive);
const handleSaveButtonClick = () => { };
```
---

## Componentes Wrapper (PDS)

### Regla única

**Siempre usar wrappers de `@shared/` en lugar de componentes Material directos.**

Los wrappers encapsulan lógica común, estilos consistentes y defaults del proyecto. Material solo se usa internamente en los wrappers.

### Wrappers principales

| Wrapper | Reemplaza (Material) |
|---------|---------------------|
| `<app-button>` | `<button mat-button>`, `<button mat-raised-button>` |
| `<app-card>` | `<mat-card>` |
| `<app-badge>` | `<mat-badge>`, elementos custom con badges |
| `<app-checkbox>` | `<mat-checkbox>` |
| `<app-radio>` | `<mat-radio-button>`, `<mat-radio-group>` |
| `<app-table>` | `<table>` + Material styling |
| `<app-toggle-group>` | `<mat-button-toggle-group>` |
| `<app-form-*>` | `<mat-form-field>` |

### Ejemplo

```html
<!-- ❌ MAL: Material directo -->
<button mat-raised-button color="primary">Guardar</button>
<mat-card>Contenido</mat-card>

<!-- ✅ BIEN: Wrappers del proyecto -->
<app-button variant="raised" color="primary">Guardar</app-button>
<app-card>Contenido</app-card>
```

### Documentación completa

- **Props y defaults**: Ver archivo `.model.ts` de cada componente
- **Ejemplos interactivos**: Navegar a `/pds` en el proyecto

---

## Checklist Pre-Commit

- [ ] Sin `bg-*`, `text-*`, `border-{color}-*` de Tailwind
- [ ] Sin `dark:*` de Tailwind
- [ ] Colores solo via Material (`color="primary"`)
- [ ] Archivo `.model.ts` con DEFAULTS
- [ ] Clases CSS con prefijo `app-{componente}-`
- [ ] `ng build` pasa sin errores
- [ ] Sin comentarios en el código (CleanCode)
