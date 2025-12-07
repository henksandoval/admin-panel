# 🎯 Admin Panel - Enterprise Ready

Panel de administración profesional construido con Angular 20, diseñado con una arquitectura escalable y un sistema de estilos moderno.

## ✨ Características

- 🎨 **Tailwind CSS First** - Sistema de estilos utility-first para desarrollo rápido
- 🌙 **Dark Mode** - Tema oscuro/claro con persistencia
- 📱 **Responsive** - Diseño adaptable para móvil, tablet y desktop
- 🏗️ **Screaming Architecture** - Organizado por features/dominios
- 🎭 **Material Design 3** - Componentes UI modernos
- ⚡ **Angular 20** - Última versión con standalone components y signals
- 🔒 **Type-Safe** - TypeScript estricto
- 🚀 **Optimizado** - Build de producción optimizado

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
│   │   ├── components/       # Sidebar, Toolbar, etc.
│   │   └── services/         # Servicios de layout
│   └── shared/               # Componentes, pipes, directivas compartidas
└── styles.scss               # TODO el sistema de estilos (168 líneas)
```

## 🎨 Sistema de Estilos

Este proyecto usa un enfoque **Tailwind-First** que facilita el desarrollo:

### Características

- ✅ **95% Tailwind** - Clases utility directamente en HTML
- ✅ **5% CSS Custom** - Solo para casos especiales
- ✅ **Dark Mode incluido** - Con toggle en toolbar
- ✅ **Sincronizado** - Tailwind + Material Design coordinados

### Ejemplo Rápido

```html
<!-- Card con dark mode -->
<div class="bg-white dark:bg-secondary-800 p-6 rounded-lg shadow-md">
  <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">
    Título
  </h3>
  <p class="text-gray-600 dark:text-gray-400">
    Contenido que funciona en light y dark mode
  </p>
</div>
```

**📖 [Ver Guía Completa de Estilos](./STYLES-GUIDE.md)**

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
