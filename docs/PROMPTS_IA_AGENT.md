# 🤖 Prompts para IA Agent - Migración Tailwind

Este archivo contiene prompts listos para copiar y pegar cuando uses un IA Agent para realizar la migración.

---

## 📋 Prompt General (Usar al inicio)

```
Estoy trabajando en un proyecto Angular + Tailwind + Angular Material y necesito migrar de un enfoque con mucho CSS personalizado a un enfoque utility-first con Tailwind.

CONTEXTO DEL PROYECTO:
- Framework: Angular 20 standalone components
- Styling: Tailwind CSS 3.4 + Angular Material 20
- Sistema de temas: Dinámico con CSS Variables (--theme-primary-*)
- 6 temas de color intercambiables
- Dark mode con clase 'dark-theme'

OBJETIVOS:
1. Reducir CSS personalizado de ~1,100 líneas a ~200 líneas (85%)
2. Usar Tailwind utilities para el 90% de los estilos
3. Mantener SCSS solo para casos excepcionales
4. Preservar toda la funcionalidad existente
5. Mantener compatibilidad con sistema de temas

EXCEPCIONES PERMITIDAS EN SCSS:
✅ Gradientes con CSS variables: background: linear-gradient(135deg, var(--theme-primary-600), var(--theme-primary-700))
✅ Custom scrollbars: ::-webkit-scrollbar
✅ Pseudo-elementos complejos: ::before, ::after
✅ Animaciones keyframes complejas
✅ Transiciones de propiedades específicas (no 'all')
✅ CSS Variables del sistema de temas

REGLAS ESTRICTAS:
❌ NO crear clases CSS para layout básico (flex, grid, spacing)
❌ NO usar SCSS para colores, tipografía, spacing
❌ NO duplicar utilities que ya existen en Tailwind
❌ NO usar @apply excesivamente
❌ NO mezclar enfoques sin justificación

He preparado una documentación completa:
- MIGRACION_TAILWIND_UTILITY_FIRST.md (guía detallada paso a paso)
- RESUMEN_MIGRACION.md (vista ejecutiva)

¿Estás listo para ayudarme con la migración?
```

---

## 🎯 Prompts por Componente

### 1️⃣ app.component.scss (Nivel: Fácil ⭐)

```
TAREA: Migrar app.component.scss a Tailwind

ARCHIVO ACTUAL:
- app.component.scss: 7 líneas
- Solo contiene estilos del :host

ACCIÓN REQUERIDA:
1. Eliminar completamente el archivo app.component.scss
2. Migrar los estilos a host binding en app.component.ts
3. Actualizar la referencia en el decorator (eliminar styleUrl)

ESTILOS A MIGRAR:
:host {
  display: block;
  height: 100%;
  width: 100%;
}

CÓDIGO ESPERADO EN app.component.ts:
@Component({
  selector: 'app-root',
  standalone: true,
  // ... otros imports ...
  host: {
    class: 'block h-full w-full'
  },
  // ELIMINAR: styleUrl: './app.component.scss'
})

VALIDACIÓN:
- [ ] Archivo .scss eliminado
- [ ] Host binding agregado al decorator
- [ ] styleUrl removido
- [ ] App se ve idéntica
- [ ] No hay errores en consola

Procede con la migración.
```

### 2️⃣ dashboard.component.scss (Nivel: Fácil ⭐)

```
TAREA: Migrar dashboard.component.scss a Tailwind

ARCHIVO ACTUAL:
- dashboard.component.scss: 18 líneas
- Contiene animación fadeIn

CONTEXTO:
- tailwind.config.js ya tiene 'animate-fade-in' configurado
- No necesitamos el keyframe personalizado

ACCIÓN REQUERIDA:
1. Eliminar completamente el archivo dashboard.component.scss
2. Reemplazar la clase 'dashboard-page' con 'animate-fade-in' en el HTML
3. Actualizar el decorator (eliminar styleUrl)

CAMBIOS EN dashboard.component.html:
<!-- ANTES -->
<div class="dashboard-page">

<!-- DESPUÉS -->
<div class="animate-fade-in">

VALIDACIÓN:
- [ ] Archivo .scss eliminado
- [ ] Clase actualizada en HTML
- [ ] styleUrl removido del decorator
- [ ] Animación funciona igual
- [ ] No hay errores en consola

Procede con la migración.
```

### 3️⃣ toolbar.component.scss (Nivel: Fácil ⭐)

```
TAREA: Migrar toolbar.component.scss a Tailwind

ARCHIVO ACTUAL:
- toolbar.component.scss: 10 líneas
- Contiene gradientes con CSS variables

DECISIÓN:
⚠️ MANTENER PARCIALMENTE - Los gradientes con CSS variables no pueden hacerse en Tailwind

ACCIÓN REQUERIDA:
1. Mantener el archivo pero simplificarlo
2. Renombrar la clase 'toolbar' a 'toolbar-gradient' (más descriptivo)
3. Eliminar cualquier estilo que pueda hacerse con Tailwind
4. Actualizar referencia en HTML

NUEVO CONTENIDO de toolbar.component.scss:
// Gradientes dinámicos con variables de tema (no disponibles en Tailwind)
.toolbar-gradient {
  background: linear-gradient(135deg, var(--theme-primary-600), var(--theme-primary-700));
}

.dark-theme .toolbar-gradient {
  background: linear-gradient(135deg, var(--theme-primary-700), var(--theme-primary-800));
}

CAMBIOS EN toolbar.component.html:
<!-- ANTES -->
<mat-toolbar class="toolbar h-16 px-4 shadow-md relative z-10 text-white transition-all duration-300">

<!-- DESPUÉS -->
<mat-toolbar class="toolbar-gradient h-16 px-4 shadow-md relative z-10 text-white transition-all duration-300">

VALIDACIÓN:
- [ ] Archivo .scss reducido a 8 líneas
- [ ] Solo contiene gradientes
- [ ] Clase renombrada en HTML
- [ ] Gradiente se ve idéntico
- [ ] Dark mode funciona

Procede con la migración.
```

### 4️⃣ layout.component.scss (Nivel: Medio ⭐⭐)

```
TAREA: Migrar layout.component.scss a Tailwind

ARCHIVO ACTUAL:
- layout.component.scss: 32 líneas
- Contiene estilos de :host, sidenav, main-content

ANÁLISIS:
✅ MIGRAR: Estilos de :host → host binding
✅ MIGRAR: Estilos de main-content → clases Tailwind
⚠️ MANTENER: Transición de width del sidenav (comportamiento dinámico)

ACCIÓN REQUERIDA:
1. Reducir el archivo SCSS a solo la transición del sidenav
2. Migrar :host a host binding
3. Migrar main-content a clases Tailwind en el template
4. Actualizar layout.component.ts con host binding

NUEVO CONTENIDO de layout.component.scss:
// Transición de ancho del sidenav (comportamiento dinámico complejo)
.sidenav {
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:not(.collapsed) {
    width: 280px;
  }
  
  &.collapsed {
    width: 64px;
  }
}

CAMBIOS EN layout.component.ts:
@Component({
  // ... existente ...
  host: {
    class: 'block h-full'
  },
  // ... existente ...
})

CAMBIOS EN el template (dentro de layout.component.ts):
<!-- Actualizar mat-sidenav -->
<mat-sidenav class="sidenav border-r-0 overflow-visible">

<!-- Actualizar main -->
<main class="main-content flex-1 overflow-y-auto min-h-0 bg-gray-50 dark:bg-secondary-900 transition-colors duration-300">

VALIDACIÓN:
- [ ] Archivo .scss reducido a ~15 líneas
- [ ] Host binding agregado
- [ ] Clases Tailwind en template
- [ ] Transición del sidenav funciona
- [ ] Dark mode funciona
- [ ] Responsive funciona

Procede con la migración.
```

### 5️⃣ sidebar.component.scss (Nivel: Medio ⭐⭐)

```
TAREA: Migrar sidebar.component.scss a Tailwind

ARCHIVO ACTUAL:
- sidebar.component.scss: 38 líneas
- Contiene gradientes y scrollbar personalizado

ANÁLISIS:
⚠️ MANTENER: Gradiente de fondo :host (usa variables CSS)
⚠️ MANTENER: Gradiente del logo (usa variables CSS)
⚠️ MANTENER: Scrollbar personalizado (::-webkit-scrollbar)
✅ MIGRAR: Hover del logo → mover a HTML

ACCIÓN REQUERIDA:
1. Mantener solo gradientes y scrollbar en SCSS
2. Mover el hover scale del logo a clases Tailwind en HTML

NUEVO CONTENIDO de sidebar.component.scss:
// Gradiente de fondo con variables dinámicas (no disponible en Tailwind)
:host {
  display: block;
  height: 100%;
  background: linear-gradient(180deg, var(--theme-primary-800), var(--theme-primary-900));
}

// Gradiente del logo
.logo-container {
  background: linear-gradient(to bottom right, var(--theme-primary-500), var(--theme-primary-600));
}

// Scrollbar personalizado (pseudo-elementos específicos de navegador)
.sidebar-nav {
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
}

CAMBIOS EN sidebar.component.html:
<!-- ANTES -->
<div class="logo-container w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300">

<!-- DESPUÉS -->
<div class="logo-container w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:scale-105">

VALIDACIÓN:
- [ ] Archivo .scss reducido a ~35 líneas
- [ ] Solo contiene gradientes y scrollbar
- [ ] Hover funciona en logo
- [ ] Scrollbar personalizado funciona
- [ ] Gradientes se ven idénticos

Procede con la migración.
```

### 6️⃣ settings-panel.component.scss (Nivel: Difícil ⭐⭐⭐)

```
TAREA: Migrar settings-panel.component.scss a Tailwind

ARCHIVO ACTUAL:
- settings-panel.component.scss: 240 líneas
- Segundo componente más complejo del proyecto

ANÁLISIS DETALLADO:
⚠️ MANTENER (55 líneas):
  - Transición del panel (right: -400px → 0)
  - Gradiente del header (usa variables CSS)
  - Estados active con variables CSS (theme-option, scheme-option)
  - Scrollbar personalizado
  - Media query responsive (width change)

✅ MIGRAR (185 líneas):
  - Layout del botón flotante → Tailwind utilities
  - Estructura de grids → grid grid-cols-3 gap-3
  - Estilos de theme-option → clases inline
  - Estilos de scheme-option → clases inline
  - Backdrop → clases inline
  - Animación fadeIn → animate-fade-in (ya en config)

NUEVO CONTENIDO de settings-panel.component.scss (reducido a ~100 líneas):
// Panel slide-in transition
.settings-panel {
  position: fixed;
  top: 0;
  right: -400px;
  width: 400px;
  height: 100vh;
  transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &.open {
    right: 0;
  }
}

// Header gradient con variables dinámicas
.settings-header {
  background: linear-gradient(135deg, var(--theme-primary-500), var(--theme-primary-700));
}

// Active states con variables CSS dinámicas
.theme-option.active {
  background: var(--theme-primary-50);
  border-color: var(--theme-primary-500);

  .theme-label {
    color: var(--theme-primary-700);
    font-weight: 600;
  }
}

.scheme-option.active {
  background: linear-gradient(135deg, var(--theme-primary-500), var(--theme-primary-700));
  border-color: var(--theme-primary-500);
  color: white;

  mat-icon {
    color: white;
  }
}

// Scrollbar personalizado
.settings-content {
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 3px;

    &:hover {
      background: #a0aec0;
    }
  }
}

// Responsive
@media (max-width: 640px) {
  .settings-panel {
    width: 100%;
    right: -100%;
  }
}

CAMBIOS CLAVE EN settings-panel.component.html:

1. Botón flotante:
<button class="fixed bottom-6 right-6 z-[1000] shadow-lg transition-transform duration-200 hover:scale-110 active:scale-95" mat-mini-fab color="primary">

2. Panel:
<div class="settings-panel flex flex-col bg-white shadow-[-4px_0_24px_rgba(0,0,0,0.15)] z-[1100]" [class.open]="isOpen">

3. Header:
<div class="settings-header flex items-center justify-between p-6 flex-shrink-0">

4. Content:
<div class="settings-content flex-1 overflow-y-auto p-6">

5. Section:
<div class="mb-8 last:mb-0">
  <h3 class="text-xs font-semibold tracking-wide text-slate-600 mb-4 uppercase">THEME</h3>

6. Theme Grid:
<div class="grid grid-cols-3 gap-3">

7. Theme Option:
<button class="flex flex-col items-center gap-2 p-3 bg-transparent border-2 border-transparent rounded-xl cursor-pointer transition-all duration-200 hover:bg-slate-50 hover:border-slate-200 theme-option" [class.active]="config().theme === theme.id">

8. Theme Color:
<div class="w-12 h-12 rounded-full flex items-center justify-center shadow-md relative transition-transform duration-200 group-hover:scale-110" [style.background-color]="theme.color">

9. Theme Label:
<span class="text-sm text-slate-600 transition-all duration-200">{{ theme.label }}</span>

10. Scheme Option:
<button class="flex flex-col items-center gap-2 px-3 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl cursor-pointer transition-all duration-200 text-slate-600 text-sm font-medium hover:bg-slate-100 hover:border-slate-300 hover:-translate-y-0.5 scheme-option" [class.active]="config().scheme === scheme.id">

11. Backdrop:
<div class="fixed inset-0 bg-black/50 z-[1050] animate-fade-in" (click)="closePanel()"></div>

INSTRUCCIONES DETALLADAS:
1. Reemplaza cada sección del HTML una por una
2. Mantén las clases 'settings-panel', 'settings-header', 'theme-option', 'scheme-option' para los estilos CSS que se mantienen
3. Agrega todas las utilities de Tailwind inline
4. Prueba visualmente después de cada cambio
5. Verifica que los estados active funcionan
6. Verifica que el panel se desliza correctamente
7. Verifica responsive en móvil

VALIDACIÓN:
- [ ] Archivo .scss reducido a ~100 líneas (58% reducción)
- [ ] Panel se desliza correctamente
- [ ] Botón flotante con hover/active funciona
- [ ] Grids se ven correctos
- [ ] Estados active funcionan con temas
- [ ] Scrollbar personalizado funciona
- [ ] Dark mode funciona
- [ ] Responsive funciona en móvil
- [ ] Gradientes se ven idénticos

Este es un componente complejo - toma tu tiempo y valida cada cambio.

Procede con la migración.
```

### 7️⃣ nav-item.component.scss (Nivel: Difícil ⭐⭐⭐)

```
TAREA: Migrar nav-item.component.scss a Tailwind

ARCHIVO ACTUAL:
- nav-item.component.scss: 261 líneas
- Componente MÁS COMPLEJO del proyecto

ANÁLISIS DETALLADO:
⚠️ MANTENER (~80 líneas):
  - Pseudo-elemento ::before para borde active
  - Floating submenu con posicionamiento dinámico
  - Animación slideIn con keyframes
  - Scrollbar del submenu
  - Padding levels anidados (floating menu)

✅ MIGRAR (~181 líneas):
  - Layout básico del nav-item → flex items-center gap-3
  - Estados hover → hover:bg-white/10
  - Estados active → clases condicionales
  - Íconos, títulos, badges → utilities inline
  - Collapsed states → utilities condicionales
  - Transiciones simples → transition-all duration-200

NUEVO CONTENIDO de nav-item.component.scss (reducido a ~80 líneas):
// Borde indicador para item activo (pseudo-elemento)
.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background-color: var(--theme-primary-400);
}

// Floating submenu con animación y posicionamiento dinámico
.floating-submenu {
  position: fixed;
  min-width: 240px;
  background: var(--theme-primary-800);
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1);
  margin-left: 8px;
  z-index: 1500;
  animation: slideIn 0.15s ease;
  pointer-events: auto;

  .submenu-items {
    max-height: 400px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.1);
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 2px;
    }
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

// Ajustes de padding para niveles anidados en floating menu
.floating-submenu {
  > .submenu-items > .nav-item-wrapper .nav-item {
    padding-left: 16px !important;
    padding-right: 16px !important;
  }

  .nav-children .nav-item-wrapper .nav-item {
    padding-left: 32px !important;
  }

  .nav-children .nav-children .nav-item-wrapper .nav-item {
    padding-left: 48px !important;
  }
}

CAMBIOS CRÍTICOS EN nav-item.component.html:

1. Nav Item Collapsable:
<!-- ANTES -->
<div class="nav-item nav-collapsable" ...>

<!-- DESPUÉS -->
<div 
  class="flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 text-white/70 text-sm hover:bg-white/10 hover:text-white/95 relative nav-item nav-collapsable"
  [class.bg-white/12]="isOpen()"
  [class.text-white/95]="isOpen()"
  ...>

2. Nav Item Link:
<!-- ANTES -->
<a class="nav-item nav-link" ...>

<!-- DESPUÉS -->
<a 
  class="flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 text-white/70 text-sm no-underline hover:bg-white/10 hover:text-white/95 relative nav-item"
  routerLinkActive="active"
  ...>

3. Ícono:
<!-- ANTES -->
<mat-icon class="nav-icon">{{ item().icon }}</mat-icon>

<!-- DESPUÉS -->
<mat-icon 
  class="text-xl w-5 h-5 flex-shrink-0"
  [class.text-theme-400]="isActive || isOpen()">
  {{ item().icon }}
</mat-icon>

4. Título:
<!-- ANTES -->
<span class="nav-title">{{ item().title }}</span>

<!-- DESPUÉS -->
<span class="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">{{ item().title }}</span>

5. Arrow:
<!-- ANTES -->
<mat-icon class="nav-arrow" [class.open]="isOpen()">keyboard_arrow_down</mat-icon>

<!-- DESPUÉS -->
<mat-icon 
  class="text-xl w-5 h-5 flex-shrink-0 transition-transform duration-200"
  [class.rotate-180]="isOpen()">
  keyboard_arrow_down
</mat-icon>

6. Badge:
<!-- ANTES -->
<span class="nav-badge {{ item().badge!.bg }} {{ item().badge!.fg }}">

<!-- DESPUÉS -->
<span class="inline-flex items-center justify-center text-xs font-semibold leading-none min-w-[18px] h-[18px] px-1.5 rounded-full flex-shrink-0 ml-auto {{ item().badge!.bg }} {{ item().badge!.fg }}">

7. Nav Children Container:
<!-- ANTES -->
<div class="nav-children" [class.open]="isOpen()">

<!-- DESPUÉS -->
<div 
  class="max-h-0 overflow-hidden transition-[max-height] duration-300 ease-in-out"
  [class.max-h-[2000px]]="isOpen()">

NOTAS IMPORTANTES:
- Mantén las clases 'nav-item', 'nav-collapsable', 'nav-link', 'active' para los estilos CSS que se mantienen
- El floating submenu mantiene su estructura actual (solo cambiar estilos inline donde sea posible)
- La lógica de posicionamiento dinámico permanece en TypeScript
- Los niveles anidados de padding se mantienen en SCSS (complejo de hacer con Tailwind)

VALIDACIÓN EXHAUSTIVA:
- [ ] Archivo .scss reducido a ~80 líneas (69% reducción)
- [ ] Items de nivel 0 se ven correctos
- [ ] Items anidados se ven correctos
- [ ] Hover states funcionan
- [ ] Active state con borde izquierdo funciona
- [ ] Ícono cambia de color cuando active
- [ ] Arrow rota cuando abre/cierra
- [ ] Badges se muestran correctamente
- [ ] Collapsed sidebar funciona
- [ ] Floating submenu aparece correctamente
- [ ] Floating submenu tiene scroll personalizado
- [ ] Animación slideIn funciona
- [ ] Todos los niveles de padding funcionan
- [ ] Tooltips funcionan en collapsed mode
- [ ] No hay glitches visuales

IMPORTANTE:
Este es el componente más complejo. Prueba exhaustivamente cada estado:
- Sidebar expandido vs collapsed
- Items normales vs con submenú
- Submenús abiertos vs cerrados
- Floating submenu en sidebar collapsed
- Active states
- Hover states
- Dark mode
- Responsive

Procede con la migración con mucho cuidado.
```

---

## 🔍 Prompts de Validación

### Validar un Componente Individual

```
TAREA: Validar la migración de [NOMBRE_COMPONENTE]

Verifica los siguientes aspectos:

1. ARCHIVO SCSS:
   - [ ] Tiene menos de 50 líneas (o está eliminado completamente)
   - [ ] Solo contiene excepciones legítimas:
     * Gradientes con CSS variables
     * Custom scrollbars
     * Pseudo-elementos complejos
     * Animaciones keyframes complejas
     * Transiciones de propiedades específicas
   - [ ] No hay duplicación con utilities de Tailwind

2. ARCHIVO HTML:
   - [ ] Usa principalmente clases de Tailwind
   - [ ] Mantiene clases CSS solo cuando es necesario (estados active, etc.)
   - [ ] No hay clases CSS obsoletas/sin usar

3. ARCHIVO TypeScript:
   - [ ] Si eliminaste SCSS, también eliminaste styleUrl del decorator
   - [ ] Si migraste :host, agregaste host binding al decorator
   - [ ] No hay errores de TypeScript

4. FUNCIONALIDAD:
   - [ ] El componente se ve idéntico al original
   - [ ] Todos los estados funcionan (hover, active, focus)
   - [ ] Animaciones y transiciones funcionan
   - [ ] Dark mode funciona correctamente
   - [ ] Responsive design funciona en todos los breakpoints
   - [ ] No hay errores en la consola del navegador
   - [ ] No hay warnings de Angular

5. PERFORMANCE:
   - [ ] No hay flickering o glitches visuales
   - [ ] Las transiciones son suaves
   - [ ] No hay layout shifts

Proporciona un reporte detallado de la validación.
```

### Validar Todo el Proyecto

```
TAREA: Validación final de la migración completa a Tailwind utility-first

Realiza una auditoría completa del proyecto:

1. MÉTRICAS:
   - [ ] Cuenta líneas totales de CSS custom antes vs después
   - [ ] Verifica que se alcanzó el objetivo de 85% reducción
   - [ ] Lista archivos SCSS que quedan y sus tamaños

2. CÓDIGO:
   - [ ] Busca clases CSS custom que puedan ser utilities de Tailwind
   - [ ] Busca código duplicado entre componentes
   - [ ] Identifica oportunidades de optimización

3. BUILD:
   - [ ] `ng build` ejecuta sin errores
   - [ ] `ng build --configuration production` ejecuta sin errores
   - [ ] Compara tamaño del bundle CSS antes vs después
   - [ ] No hay warnings relacionados a CSS/Tailwind

4. FUNCIONALIDAD COMPLETA:
   - [ ] Todas las rutas/componentes funcionan
   - [ ] Sistema de temas funciona (6 temas)
   - [ ] Dark mode funciona en todo el app
   - [ ] Responsive funciona en mobile/tablet/desktop
   - [ ] Todas las animaciones funcionan
   - [ ] Sidebar expand/collapse funciona
   - [ ] Settings panel funciona
   - [ ] Navigation funciona (todos los niveles)

5. DOCUMENTACIÓN:
   - [ ] Actualiza este documento si encontraste casos nuevos
   - [ ] Documenta decisiones importantes tomadas
   - [ ] Crea guía de mantenimiento para el futuro

Proporciona un reporte ejecutivo con:
- Métricas alcanzadas
- Problemas encontrados y solucionados
- Recomendaciones para el futuro
```

---

## 📊 Prompt de Análisis Inicial

```
TAREA: Analizar el estado actual antes de iniciar la migración

Realiza un análisis exhaustivo del proyecto:

1. INVENTARIO DE ARCHIVOS SCSS:
   - Lista todos los archivos .scss del proyecto
   - Cuenta líneas de código de cada uno
   - Identifica dependencias entre archivos

2. CATEGORIZACIÓN DE CSS:
   Para cada archivo, identifica:
   - ✅ CSS que DEBE migrarse a Tailwind (layout, spacing, colores básicos)
   - ⚠️ CSS que PUEDE mantenerse (gradientes, scrollbars, pseudo-elementos)
   - ❌ CSS que es DUDOSO (evaluar caso por caso)

3. DEPENDENCIAS:
   - Identifica uso de CSS variables
   - Identifica uso de @apply
   - Identifica uso de mixins/extends
   - Identifica imports entre archivos SCSS

4. COMPLEJIDAD:
   Asigna nivel de complejidad a cada archivo:
   - 🟢 Bajo: Puede eliminarse completamente
   - 🟡 Medio: Requiere refactoring moderado
   - 🔴 Alto: Requiere análisis cuidadoso

5. ORDEN DE EJECUCIÓN:
   Propone un orden óptimo basado en:
   - Complejidad (fácil a difícil)
   - Dependencias (sin dependencias primero)
   - Impacto (archivos pequeños primero para ganar confianza)

Proporciona un plan de ejecución detallado.
```

---

## 🆘 Prompts de Troubleshooting

### Problema: Estilos no se aplican

```
PROBLEMA: Los estilos de Tailwind no se están aplicando correctamente

DEBUG:
1. Verifica que las clases estén en el archivo:
   - Revisa src/**/*.{html,ts} en tailwind.config.js content
   
2. Verifica la sintaxis:
   - Las clases con / deben estar entre comillas: class="bg-white/10"
   - Las clases con [] deben ser correctas: class="z-[1000]"
   
3. Verifica purge/JIT:
   - Detén el servidor
   - Elimina .angular/cache
   - npm run start

4. Verifica el orden de especificidad:
   - Tailwind debe cargarse después de Material
   - Revisa el orden en styles.scss

5. Verifica dark mode:
   - Las clases dark: requieren clase 'dark-theme' en ancestor
   - Verifica que el toggle funciona

Identifica y soluciona el problema.
```

### Problema: Gradientes no funcionan

```
PROBLEMA: Los gradientes con variables CSS no se ven correctos

DEBUG:
1. Verifica las variables CSS:
   - Abre DevTools y revisa :root en Elements
   - Verifica que --theme-primary-* están definidas
   
2. Verifica la sintaxis del gradiente:
   - Debe ser: linear-gradient(135deg, var(--theme-primary-600), var(--theme-primary-700))
   - No: background-gradient(...)
   
3. Verifica el tema activo:
   - Revisa que body tiene la clase correcta: theme-default, theme-brand, etc.
   
4. Verifica el SCSS:
   - La clase debe estar aplicada en el HTML
   - El archivo SCSS debe estar referenciado en styleUrl

Identifica y soluciona el problema.
```

### Problema: Animaciones no funcionan

```
PROBLEMA: Las animaciones no funcionan después de la migración

DEBUG:
1. Para animaciones de Tailwind (animate-fade-in, etc.):
   - Verifica que están definidas en tailwind.config.js
   - Verifica que la clase está correctamente escrita
   
2. Para animaciones CSS (keyframes):
   - Verifica que el @keyframes está en el SCSS
   - Verifica que la clase animation: está aplicada
   - Verifica que el archivo SCSS está importado
   
3. Para transiciones:
   - Verifica que transition-* está aplicado
   - Verifica que la propiedad que cambia está especificada
   - Ejemplo: transition-transform vs transition-all

Identifica y soluciona el problema.
```

---

## 💡 Prompts de Optimización

### Optimizar tailwind.config.js

```
TAREA: Optimizar la configuración de Tailwind

Revisa tailwind.config.js y:

1. UTILITIES CUSTOM:
   - Identifica patrones que se repiten 5+ veces
   - Considera agregar utilities custom en extend

2. ANIMATIONS:
   - Revisa si las animaciones en keyframes se usan
   - Considera agregar más si se repiten en SCSS

3. COLORS:
   - Verifica que todos los colores en extend se usan
   - Considera eliminar colores no utilizados

4. SPACING:
   - Verifica si spacing custom se usa frecuentemente
   - Considera agregar más valores si es necesario

5. PLUGINS:
   - Evalúa si plugins de Tailwind ayudarían:
     * @tailwindcss/forms
     * @tailwindcss/typography
     * @tailwindcss/aspect-ratio

Proporciona recomendaciones de optimización.
```

### Consolidar themes/styles.scss

```
TAREA: Optimizar themes/styles.scss

Revisa el archivo y:

1. UTILITIES CUSTOM:
   - Identifica clases .app-* que se usan menos de 3 veces
   - Considera reemplazarlas con utilities inline

2. CSS VARIABLES:
   - Verifica que todas las variables se usan
   - Considera eliminar variables sin uso

3. MATERIAL OVERRIDES:
   - Verifica que todos los overrides son necesarios
   - Considera mover a componentes específicos

4. DUPLICACIÓN:
   - Busca lógica duplicada con Tailwind
   - Busca lógica duplicada entre utilities

5. ORGANIZACIÓN:
   - Considera separar en archivos:
     * variables.scss
     * material-overrides.scss
     * custom-utilities.scss

Proporciona un plan de optimización.
```

---

## 📝 Notas Finales

- Copia estos prompts según los necesites
- Personaliza con detalles específicos de tu caso
- Valida siempre visualmente después de cada cambio
- No tengas miedo de preguntar si algo no está claro

---

**Estos prompts están listos para usar con cualquier IA Agent (GitHub Copilot, ChatGPT, Claude, etc.)**

