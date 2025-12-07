# 🎯 Admin Panel - Enterprise Ready

Panel de administración profesional construido con Angular 20, diseñado con una arquitectura escalable y un sistema de estilos moderno.

## ✨ Características

- 🎨 **6 Temas de Colores** - Default, Brand, Teal, Rose, Purple, Amber con cambio en tiempo real
- 🌙 **Dark Mode Completo** - Light/Dark mode para cada tema con persistencia
- 📱 **Responsive** - Diseño adaptable para móvil, tablet y desktop
- 🏗️ **Screaming Architecture** - Organizado por features/dominios
- 🎭 **Material Design 3** - Componentes UI modernos con paletas completas
- ⚡ **Angular 20** - Última versión con standalone components y signals
- 🔒 **Type-Safe** - TypeScript estricto
- 🚀 **Optimizado** - Build de producción optimizado
- ⚙️ **Settings Panel** - Panel de configuración con cambio de temas instantáneo

## 🚀 Inicio Rápido

### Prerequisitos

- Node.js 18 o superior
- npm 9 o superior

### Instalación

```bash
# Clonar el repositorio
git clone <repo-url>

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
```

Una vez iniciado, abre tu navegador en `http://localhost:4200/`

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── core/                    # Servicios core, guards, interceptors
│   ├── features/               # Features/módulos por dominio
│   │   └── dashboard/         # Feature de dashboard
│   ├── layout/                # Layout principal y componentes
│   │   ├── components/       # Sidebar, Toolbar, Settings Panel
│   │   └── services/         # Settings, Layout, Navigation services
│   └── shared/               # Componentes, pipes, directivas compartidas
├── styles.scss               # Entry point (importa themes)
└── themes/                   # Sistema de múltiples temas
    ├── styles.scss          # Generador de CSS para 6 temas
    ├── theme.scss           # Loop de creación de temas
    └── theme_colors.scss    # 6 paletas Material 3 completas
```

## 🎨 Sistema de Temas Múltiples

Este proyecto implementa un sistema completo de tematización con 6 colores disponibles:

### 🎨 Temas Disponibles

| Tema | Color | Hex Code |
|------|-------|----------|
| Default | Blue | `#3b82f6` |
| Brand | Cyan | `#06b6d4` |
| Teal | Teal | `#14b8a6` |
| Rose | Rose | `#f43f5e` |
| Purple | Purple | `#a855f7` |
| Amber | Amber | `#f59e0b` |

Cada tema incluye:
- ✅ Paleta Material Design 3 completa (tonalidades 0-100)
- ✅ Modo claro (Light Mode)
- ✅ Modo oscuro (Dark Mode)
- ✅ Cambio en tiempo real sin recompilar
- ✅ Persistencia en localStorage

### Características del Sistema

- ✅ **Cambio instantáneo** - Click en Settings Panel y todo cambia
- ✅ **95% Tailwind** - Clases utility directamente en HTML
- ✅ **Material 3 integrado** - Todos los componentes responden al tema
- ✅ **Sincronizado** - Tailwind + Material Design coordinados

### Ejemplo de Uso

```typescript
// Cambiar tema programáticamente
settingsService.setTheme('purple');
settingsService.setScheme('dark');
```

**📖 [Ver Guía Completa del Sistema de Temas](./MULTI-THEME-SYSTEM.md)**

## 🛠️ Comandos Disponibles

```bash
# Desarrollo
npm start                    # Inicia servidor de desarrollo
npm run watch               # Build en modo watch

# Build
npm run build               # Build de producción
ng build --configuration development  # Build de desarrollo

# Testing
npm test                    # Ejecuta tests unitarios
```

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
