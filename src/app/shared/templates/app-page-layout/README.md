# App Page Layout Component

## 📋 Descripción General

`AppPageLayoutComponent` es un componente de layout flexible y reutilizable basado en CSS Grid que permite crear estructuras de página complejas mediante configuración declarativa. Utiliza el patrón de **content projection con slots nombrados** para proporcionar máxima flexibilidad en la composición de páginas.

## 🎯 ¿Qué Hace?

El componente permite:
- Crear layouts de página con CSS Grid de manera declarativa
- Usar presets predefinidos para casos comunes (2 columnas, dashboard, sidebar, etc.)
- Configurar grids personalizados con control total sobre columnas, filas, gaps y alineación
- Proyectar contenido en slots nombrados
- Posicionar elementos en celdas específicas del grid con control granular
- Visualizar slots vacíos en modo debug/desarrollo

## 🔧 ¿Cómo Funciona?

### Arquitectura del Sistema

```
┌─────────────────────────────────────────┐
│   AppPageLayoutComponent (Contenedor)   │
│  - Gestiona la configuración del grid   │
│  - Renderiza celdas dinámicamente        │
└──────────────┬──────────────────────────┘
               │
               ├─► Usa Signals (Angular 17+)
               │   - resolvedConfig()
               │   - gridStyles()
               │   - slotsMap()
               │
               ├─► Content Projection
               │   @ContentChildren(AppSlotContainerDirective)
               │
               └─► Directiva: AppSlotContainerDirective
                   - Marca templates como slots
                   - Vincula nombre con contenido
```

### Flujo de Datos

1. **Configuración de Entrada**: El componente acepta múltiples formas de configuración (preset, layoutConfig, gridConfig + cells)
2. **Resolución de Config**: `resolvedConfig()` computed signal determina la configuración final siguiendo prioridades
3. **Generación de Estilos**: `gridStyles()` computed signal genera los estilos CSS Grid dinámicamente
4. **Content Projection**: Después del contenido inicializado, mapea los slots nombrados
5. **Renderizado**: Itera sobre las celdas y renderiza el contenido correspondiente

### Prioridad de Configuración

```
layoutConfig (más alta)
    ↓
preset
    ↓
gridConfig + cells
    ↓
LAYOUT_PRESETS.fullWidth (fallback por defecto)
```

## 📝 Ejemplos de Uso

### 1. Uso con Preset (Recomendado para casos comunes)

```typescript
@Component({
  template: `
    <app-page-layout 
      title="Dashboard" 
      description="Vista general del sistema"
      preset="dashboard">
      
      <ng-template appSlot="header">
        <app-stats-summary />
      </ng-template>
      
      <ng-template appSlot="left">
        <app-recent-activity />
      </ng-template>
      
      <ng-template appSlot="right">
        <app-quick-actions />
      </ng-template>
      
      <ng-template appSlot="footer">
        <app-data-table />
      </ng-template>
    </app-page-layout>
  `
})
```

### 2. Configuración Personalizada

```typescript
@Component({
  template: `
    <app-page-layout
      title="Custom Layout"
      [gridConfig]="gridConfig"
      [cells]="cells">
      
      <ng-template appSlot="main">
        <app-main-content />
      </ng-template>
      
      <ng-template appSlot="sidebar">
        <app-sidebar />
      </ng-template>
    </app-page-layout>
  `
})
export class MyComponent {
  gridConfig: GridConfig = {
    columns: '3fr 1fr',
    gap: '2rem',
    alignItems: 'start'
  };
  
  cells: GridCell[] = [
    { slotId: 'main', colStart: 1 },
    { slotId: 'sidebar', colStart: 2 }
  ];
}
```

### 3. Layout Completo con Objeto de Configuración

```typescript
layoutConfig: LayoutConfig = {
  grid: {
    columns: 12,  // Grid de 12 columnas
    gap: '1rem'
  },
  cells: [
    { 
      slotId: 'header', 
      colStart: 1, 
      colEnd: 'full',
      cellClass: 'header-cell'
    },
    { 
      slotId: 'content', 
      colStart: 1, 
      colSpan: 9 
    },
    { 
      slotId: 'sidebar', 
      colStart: 10, 
      colSpan: 3 
    }
  ]
};
```

## 🎨 Presets Disponibles

| Preset | Descripción | Casos de Uso |
|--------|-------------|--------------|
| `fullWidth` | Una columna completa | Páginas simples, formularios |
| `twoColumn` | Dos columnas iguales | Comparaciones, vistas divididas |
| `twoColumnWithFooter` | Dos columnas + footer | Contenido con acciones inferiores |
| `mainWithSidebar` | Contenido principal (2/3) + sidebar (1/3) | Páginas de contenido con info adicional |
| `sidebarWithMain` | Sidebar (1/3) + contenido principal (2/3) | Navegación lateral prominente |
| `threeColumn` | Tres columnas iguales | Dashboards, galerías |
| `dashboard` | Header + 2 columnas + footer | Dashboards complejos |

## ✅ Beneficios

### 1. **Reutilización y DRY**
- Elimina código repetitivo de layouts
- Centraliza la lógica de grid en un solo componente
- Presets evitan reimplementar layouts comunes

### 2. **Flexibilidad**
- Tres niveles de configuración (preset → layout → grid+cells)
- Control granular sobre posicionamiento de celdas
- Adaptable a cualquier necesidad de layout

### 3. **Mantenibilidad**
- Configuración declarativa vs. imperativa
- Separación clara entre estructura (layout) y contenido (slots)
- Fácil de modificar y extender

### 4. **Type Safety**
- TypeScript completo con interfaces bien definidas
- `satisfies` operator para validar presets
- Computed signals con tipado fuerte

### 5. **Performance**
- Usa Signals de Angular (detección de cambios granular)
- Computed signals se recalculan solo cuando cambian dependencias
- CSS Grid es performante nativamente

### 6. **Developer Experience**
- Presets documentados y autodescriptivos
- Modo debug con `showEmptySlots`
- API clara y consistente
