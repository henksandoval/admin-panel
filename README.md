# 🎨 Admin Panel

> Panel de administración moderno con theming dinámico y arquitectura limpia.

[![Angular](https://img.shields.io/badge/Angular-20.3-DD0031?style=for-the-badge&logo=angular)](https://angular.dev)
[![Material](https://img.shields.io/badge/Material-20.2-5B4FFF?style=for-the-badge&logo=material-design)](https://material.angular.io)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)

**Características principales:**
- 🎨 **6 temas de color** con light/dark mode (12 combinaciones)
- ⚡ **Dynamic theme switching** sin recargar página
- 🎯 **Material Design 3** con design tokens
- 📱 **Responsive** y optimizado
- 🧩 **Standalone components** (Angular 20)
- ♿ **Accesible** (WCAG 2.1)

---

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Iniciar desarrollo
npm start
```

Abre [http://localhost:4200](http://localhost:4200) y empieza a codear.

### Comandos

| Comando | Descripción |
|---------|-------------|
| `npm start` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm test` | Ejecutar tests |
| `npm run watch` | Build en modo watch |

### Prerequisitos

Node.js 18+ · npm 9+

---

## 🛠️ Stack Tecnológico

| Categoría | Tecnología | Versión |
|-----------|-----------|---------|
| **Framework** | Angular | 20.3.0 |
| **UI Components** | Angular Material (M3) | 20.2.14 |
| **CSS Utilities** | Tailwind CSS | 3.4.18 |
| **Language** | TypeScript | 5.9.2 |
| **Reactive** | RxJS | 7.8.0 |
| **Build** | Angular CLI (esbuild) | 20.3.6 |
| **Testing** | Karma + Jasmine | 6.4.0 + 5.9.0 |

---

## 📂 Estructura

```
src/
├── app/
│   ├── core/                   # Guards, interceptors, servicios core
│   ├── features/               # Módulos de funcionalidad
│   └── layout/                 # Layout principal + sidebar + toolbar
│
├── themes/                     # ⚡ Sistema de theming (498 líneas)
│   ├── _brand-palette.scss     # Paletas de color custom
│   ├── _semantic-colors.scss   # Colores semánticos (caution)
│   ├── _variables.scss         # Tokens de layout (dimensions, z-index)
│   ├── _navigation.scss        # Sistema de navegación (mixins + tokens)
│   ├── _theming.scss           # Motor de themes + overlays + badges
│   └── styles.scss             # Entry point global
│
└── public/                     # Assets estáticos
```

**📖 Ver arquitectura completa en [docs/FINAL_ANALYSIS.md](./docs/FINAL_ANALYSIS.md)**

---

## 🎨 Sistema de Theming

### Temas Disponibles

| Tema | Paleta Primary | Paleta Tertiary | Modos |
|------|---------------|-----------------|-------|
| **Brand** | Custom Brand | Custom Tertiary | Light · Dark |
| **Azure** | Material Azure | Material Cyan | Light · Dark |
| **Teal** | Material Cyan | Material Blue | Light · Dark |
| **Rose** | Material Magenta | Material Cyan | Light · Dark |
| **Purple** | Material Violet | Material Cyan | Light · Dark |
| **Amber** | Material Orange | Material Yellow | Light · Dark |

**Total:** 12 combinaciones (6 temas × 2 modos)

### Cambio Dinámico de Tema

```typescript
// Cambiar tema (sin recargar página)
document.body.className = 'theme-azure dark-theme';
```

### Arquitectura

```
Theming (498 líneas) = 0% duplicación
├─ Overlays dinámicos (color-mix)
├─ Navigation states (mixins reutilizables)
├─ Badge system (5 variantes)
└─ Material M3 tokens (--mat-sys-*)
```

**📖 Ver detalles técnicos en [docs/FINAL_ANALYSIS.md#sistema-de-theming](./docs/FINAL_ANALYSIS.md)**

---

## 🎯 Filosofía de Desarrollo

### Principio Único

> **Material gestiona theming · Tailwind gestiona layout · SCSS solo para casos complejos**

### Las 3 Capas

| Capa | Responsabilidad | Ejemplos |
|------|----------------|----------|
| **1. Material** | Theming + Componentes | `color="primary"`, `<mat-card>`, `<mat-icon>` |
| **2. Tailwind** | Layout + Spacing | `flex`, `gap-4`, `p-6`, `md:grid-cols-2` |
| **3. SCSS** | Casos complejos | Gradientes, mixins de navegación |

**📖 Guía completa en [docs/STYLE_GUIDE.md](./docs/STYLE_GUIDE.md)** (lectura obligatoria antes de codear)

---

## 📐 Guías Rápidas

### Crear Componente de Navegación

```scss
@use 'themes/navigation' as nav;

.my-nav-item {
  @include nav.nav-item-all-states();
}
```

**📄 Ver implementación real:** [`sidebar.component.scss`](./src/app/layout/components/sidebar/sidebar.component.scss)

### Usar Badges

```html
<span class="app-badge success">5</span>
<span class="app-badge error has-indicator">3</span>
```

**📄 Ver implementación real:** [`nav-tree-inline.component.html`](./src/app/layout/components/sidebar/components/nav-tree-inline/nav-tree-inline.component.html)

### Combinar Material + Tailwind

```html
<mat-toolbar class="px-4">
  <div class="flex items-center gap-2 flex-1">
    <button mat-icon-button>
      <mat-icon>menu</mat-icon>
    </button>
  </div>
</mat-toolbar>
```

**📄 Ver implementación real:** [`toolbar.component.html`](./src/app/layout/components/toolbar/toolbar.component.html)

### Usar Design Tokens

```scss
// Layout
var(--sidebar-width-expanded)  // 280px
var(--z-floating-nav)           // 1030
var(--transition-fast)          // 150ms + easing

// Navigation
var(--nav-item-hover-bg)        // Overlay dinámico
var(--nav-item-active-bg)       // Overlay dinámico
```

**📄 Ver definiciones:** [`_variables.scss`](./src/themes/_variables.scss) · [`_navigation.scss`](./src/themes/_navigation.scss)

---

## 📊 Métricas

| Métrica | Valor |
|---------|-------|
| **Bundle inicial** | 738 kB → 149 kB (gzip) |
| **CSS bundle** | 127 kB → 5.78 kB (gzip) |
| **Build time** | ~2.5 segundos |
| **Líneas de theming** | 498 (0% duplicación) |
| **Líneas de layout** | 98 (-58% vs original) |
| **Cohesión** | 9.5/10 |

---

## 📚 Documentación

| Documento | Propósito | Audiencia |
|-----------|-----------|-----------|
| **[STYLE_GUIDE.md](./docs/STYLE_GUIDE.md)** | Guía definitiva de estilos | **Obligatorio para developers** |
| [FINAL_ANALYSIS.md](./docs/FINAL_ANALYSIS.md) | Análisis técnico completo | Arquitectos, seniors |
| [FINAL_RESULT.md](./docs/FINAL_RESULT.md) | Resultado de refactorización | Stakeholders, PMs |

---

## 🤝 Contribuir

1. Lee [STYLE_GUIDE.md](./docs/STYLE_GUIDE.md) **completo**
2. Crea branch desde `main`
3. Implementa siguiendo las 3 capas
4. Ejecuta `npm run build` (debe pasar)
5. Crea Pull Request

### Convenciones

- ✅ Material para theming y colores
- ✅ Tailwind para layout y spacing
- ✅ SCSS solo para casos complejos
- ✅ Código autodocumentado (sin comentarios excesivos)
- ✅ Archivos con propósito único (alta cohesión)

---

## 🐛 Troubleshooting

**Build falla con error de SCSS**
```bash
# Remover BOM si existe
(Get-Content file.scss -Encoding UTF8) | Set-Content file.scss -Encoding UTF8 -NoNewline
```

**Tema no cambia**
```html
<!-- Verificar clases en body -->
<body class="theme-azure dark-theme">
```

**Estilos de navegación no aplican**
```scss
// Importar el mixin
@use 'themes/navigation' as nav;
```

---

## 📄 Licencia

[Especificar licencia]

---

**Última actualización:** Enero 2026 · **Versión:** 1.0.0 · **Estado:** ✅ Production Ready

