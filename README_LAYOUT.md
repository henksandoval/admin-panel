# Admin Panel - Layout Principal

## 📋 Descripción

Este proyecto implementa un **Layout Principal (Shell)** para una aplicación web moderna de administración, inspirado en el estilo visual y funcional de la plantilla **Fuse Admin**.

## 🛠️ Stack Tecnológico

- **Angular 20+** (Standalone Components)
- **Angular Material** (Componentes de UI)
- **Tailwind CSS 3** (Estilizado)
- **TypeScript**
- **SCSS**

## ✨ Características Implementadas

### 1. Estructura del Layout

El layout principal incluye tres áreas principales:

- **Sidebar** (Barra lateral izquierda)
  - Fondo oscuro con gradiente (#1e293b a #0f172a)
  - Logo y branding en el header
  - Navegación multinivel
  - Footer con copyright

- **Header/Toolbar** (Barra superior)
  - Fondo blanco con sombra sutil
  - Botón de menú hamburguesa
  - Buscador
  - Notificaciones con badge
  - Menú de usuario

- **Área de Contenido Principal**
  - Fondo gris claro (#f9fafb)
  - Padding responsive
  - Router outlet para las vistas

### 2. Navegación Multinivel (3 Niveles)

El sistema de navegación soporta hasta **3 niveles de profundidad**:

```
Nivel 1: Dashboard
Nivel 1: Aplicaciones
  Nivel 2: E-Commerce
    Nivel 3: Productos
    Nivel 3: Pedidos
    Nivel 3: Clientes
  Nivel 2: Correo
  Nivel 2: Chat
Nivel 1: Páginas
  Nivel 2: Autenticación
    Nivel 3: Login
    Nivel 3: Registro
    Nivel 3: Recuperar contraseña
  ...
```

**Características del menú:**
- Acordeones para ítems con hijos
- Animaciones suaves de expansión/colapso
- Indentación visual por nivel (16px por nivel)
- Estados hover y active
- Badges para notificaciones
- Íconos de Material Icons

### 3. Comportamiento Responsive

#### 📱 En Móvil/Tablet (< 768px)
- El sidebar está **oculto por defecto**
- Se abre con el botón hamburguesa del header
- Modo **"over"**: Flota sobre el contenido
- Backdrop oscuro cuando está abierto
- Se cierra automáticamente al hacer clic en un ítem

#### 💻 En Escritorio (≥ 768px)
- El sidebar está **visible y fijo**
- Modo **"side"**: El contenido se ajusta a su derecha
- Ancho fijo de 280px
- Sin backdrop

### 4. Servicios Core

#### NavigationService
```typescript
// Ubicación: src/app/core/services/navigation.service.ts
```
- Gestiona los datos de navegación
- Estructura de 3 niveles
- Soporta badges, íconos y URLs

#### LayoutService
```typescript
// Ubicación: src/app/core/services/layout.service.ts
```
- Controla el estado del sidebar (abierto/cerrado)
- Detecta el tamaño de pantalla (móvil/escritorio)
- Métodos: toggleSidebar(), closeSidebar(), openSidebar()

## 📁 Estructura de Archivos

```
src/app/
├── core/
│   ├── components/
│   │   ├── layout/               # Layout principal
│   │   │   ├── layout.component.ts
│   │   │   ├── layout.component.html
│   │   │   └── layout.component.scss
│   │   ├── sidebar/              # Barra lateral
│   │   │   ├── sidebar.component.ts
│   │   │   ├── sidebar.component.html
│   │   │   └── sidebar.component.scss
│   │   ├── toolbar/              # Header/Toolbar
│   │   │   ├── toolbar.component.ts
│   │   │   ├── toolbar.component.html
│   │   │   └── toolbar.component.scss
│   │   └── nav-item/             # Ítem de navegación recursivo
│   │       ├── nav-item.component.ts
│   │       ├── nav-item.component.html
│   │       └── nav-item.component.scss
│   └── services/
│       ├── navigation.service.ts  # Datos del menú
│       └── layout.service.ts      # Estado del layout
├── pages/
│   └── dashboard/                 # Página de ejemplo
│       ├── dashboard.component.ts
│       ├── dashboard.component.html
│       └── dashboard.component.scss
├── app.config.ts                  # Configuración (incluye animations)
├── app.routes.ts                  # Rutas de la aplicación
├── app.ts                         # Componente raíz
└── app.html                       # Template raíz
```

## 🚀 Cómo Ejecutar

### Instalar dependencias (si no están instaladas)
```bash
npm install
```

### Iniciar el servidor de desarrollo
```bash
npm start
# o
ng serve
```

### Compilar para producción
```bash
npm run build
# o
ng build
```

La aplicación estará disponible en: `http://localhost:4200`

## 🎨 Estilo Visual

### Colores Principales

**Sidebar:**
- Fondo: Gradiente de #1e293b a #0f172a (Dark Slate)
- Texto: rgba(255, 255, 255, 0.7)
- Hover: rgba(255, 255, 255, 0.08)
- Active: rgba(59, 130, 246, 0.15) con borde azul

**Header:**
- Fondo: Blanco (#ffffff)
- Border: Gray-200 (#e5e7eb)
- Sombra sutil

**Contenido:**
- Fondo: Gray-50 (#f9fafb)
- Texto: Gray-800 (#1f2937)

### Tipografía
- Fuente principal: Roboto (Angular Material)
- Tamaños: 14px (nav), 16px (body), 20px+ (headings)

## 📦 Dependencias Principales

```json
{
  "@angular/animations": "^20.3.0",
  "@angular/cdk": "^20.2.14",
  "@angular/material": "^20.2.14",
  "tailwindcss": "^3.x"
}
```

## 🔧 Configuración de Tailwind CSS

El proyecto usa Tailwind CSS v3 con PostCSS. Los archivos de configuración son:

- `tailwind.config.js` - Configuración de Tailwind
- `postcss.config.js` - Configuración de PostCSS
- `src/styles.scss` - Estilos globales con directivas de Tailwind

## 📝 Rutas Configuradas

Todas las rutas están bajo el layout principal:

- `/dashboard` - Panel principal
- `/apps/ecommerce/*` - E-commerce (productos, pedidos, clientes)
- `/apps/mail` - Correo
- `/apps/chat` - Chat
- `/pages/auth/*` - Autenticación (login, registro, recuperación)
- `/pages/errors/*` - Páginas de error (404, 500)
- `/pages/profile` - Perfil de usuario
- `/ui/*` - Componentes UI (forms, tables, cards)
- `/settings` - Configuración

## 💡 Características Destacadas

1. **Componentes Standalone**: Todo el proyecto usa componentes standalone de Angular
2. **Signals**: Uso de Angular Signals para gestión de estado reactivo
3. **Lazy Loading**: Las páginas se cargan de forma diferida
4. **Material Design 3**: Uso de la última versión de Angular Material
5. **Responsive**: Completamente adaptable a móvil, tablet y escritorio
6. **Accesibilidad**: Uso de atributos ARIA y etiquetas semánticas
7. **Animaciones**: Transiciones suaves en menús y componentes

## 🎯 Próximos Pasos

Para extender el proyecto, puedes:

1. Crear más páginas bajo `/pages`
2. Agregar más ítems al menú en `navigation.service.ts`
3. Personalizar los colores en `tailwind.config.js`
4. Implementar autenticación y guards de ruta
5. Agregar temas claro/oscuro
6. Implementar breadcrumbs dinámicos
7. Agregar búsqueda en el sidebar

## 📄 Licencia

Este proyecto es un ejemplo educativo.

---

**Desarrollado con Angular 20 + Material + Tailwind CSS** 🚀

