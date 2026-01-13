# Guía Visual de Prueba - app-button Component

## ✅ Checklist de Verificación

### 1. Proyección de Contenido (ng-content)
- [ ] El texto entre `<app-button>` y `</app-button>` se muestra correctamente
- [ ] El texto "Primary", "Secondary", "Tertiary", "Disabled" aparece en los botones
- [ ] Los iconos (si se configuran) aparecen antes o después del texto

### 2. Aplicación de Estilos Dinámicos
- [ ] Al cambiar "Shape" a "Square", los botones tienen bordes cuadrados (border-radius: 0.25rem)
- [ ] Al cambiar "Shape" a "Rounded", los botones tienen bordes completamente redondeados (pill shape)
- [ ] Al cambiar "Size" a "Small", los botones son más pequeños (32px altura)
- [ ] Al cambiar "Size" a "Medium", los botones tienen tamaño medio (36px altura)
- [ ] Al cambiar "Size" a "Large", los botones son más grandes (42px altura)

### 3. Variantes de Botón
- [ ] **Text Buttons:** Sin fondo, solo texto
- [ ] **Elevated Buttons:** Con sombra elevada
- [ ] **Outlined Buttons:** Con borde visible
- [ ] **Filled Buttons:** Con fondo sólido
- [ ] **Tonal Buttons:** Con fondo tonal (más suave que filled)

### 4. Colores Material Design 3
- [ ] **Primary:** Usa el color primario del tema (generalmente azul)
- [ ] **Secondary:** Usa el color secundario del tema
- [ ] **Tertiary:** Usa el color terciario del tema
- [ ] **Disabled:** Botón deshabilitado con opacidad reducida

### 5. Reactividad
- [ ] Los cambios en los toggles de Shape/Size actualizan TODOS los botones inmediatamente
- [ ] No hay retrasos ni parpadeos al cambiar configuraciones
- [ ] El estado disabled se respeta en todo momento

## 🎨 Cómo se Debe Ver

### Shape: Rounded, Size: Large
```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Primary    │  │  Secondary   │  │   Tertiary   │  │   Disabled   │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
  (pill shape)      (pill shape)      (pill shape)      (pill shape)
```

### Shape: Square, Size: Large
```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Primary    │  │  Secondary   │  │   Tertiary   │  │   Disabled   │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
  (square edges)    (square edges)    (square edges)    (square edges)
```

### Shape: Rounded, Size: Small
```
┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐
│Primary │  │Secondary│ │Tertiary│  │Disabled│
└────────┘  └────────┘  └────────┘  └────────┘
 (smaller)    (smaller)   (smaller)   (smaller)
```

## 🐛 Problemas Comunes y Soluciones

### Problema 1: El texto no aparece en los botones
**Causa:** El `<ng-content></ng-content>` no está renderizando correctamente
**Solución:** Verificar que el template usa la sintaxis correcta y que no hay conflictos con ViewEncapsulation

**✅ Solución Implementada:** 
- Cambiamos de `*ngIf` a `@if` (sintaxis de Angular 20)
- El `<ng-content>` está correctamente posicionado entre los iconos

### Problema 2: Los estilos (shape/size) no se aplican
**Causa:** Las clases CSS no se están aplicando al elemento button de Material
**Solución:** Usar `::ng-deep` en el SCSS para penetrar en el Shadow DOM de Material

**✅ Solución Implementada:**
```scss
:host ::ng-deep button {
  &.btn-shape-square { /* ... */ }
  &.btn-shape-rounded { /* ... */ }
}
```

### Problema 3: Los colores no funcionan
**Causa:** Angular Material requiere `[attr.color]` en lugar de `[color]`
**Solución:** Usar `[attr.color]="fullConfig().color"`

**✅ Solución Implementada:** Mantenido `[attr.color]` tal como lo solicitaste

### Problema 4: Cambiar shape/size no actualiza los botones
**Causa:** La configuración no se recalcula cuando cambian los signals
**Solución:** Reconstruir `matCardConfig` cuando cambian shape o size

**✅ Solución Implementada:**
```typescript
setShape(shape: ButtonShape): void {
  this.shape.set(shape);
  this.matCardConfig.set(this.buildAllMatCardConfigs()); // ✅ Reconstruir
}
```

## 📊 Comparación Antes/Después

### ❌ ANTES (No Funcional)
```html
<app-button
  [config]="{
    variant: config.type,           // ❌ type en lugar de variant
    color: config.m3Color,          // ❌ m3Color en lugar de color
    shape: selectedShape(),         // ❌ selectedShape() en lugar de shape()
    size: selectedSize(),           // ❌ selectedSize() en lugar de size()
    disabled: config.disabled || false  // ❌ Lógica innecesaria
  }">
  {{ config.label }}
</app-button>
```

**Problemas:**
- Propiedades inconsistentes (type vs variant, m3Color vs color)
- Nombres de signals verbosos (selectedShape vs shape)
- Lógica innecesaria en template (|| false)
- Objeto config reconstruido en cada render

### ✅ DESPUÉS (Funcional)
```typescript
// Component
interface ButtonConfig {
  readonly variant: ButtonVariant;
  readonly color: ButtonColor;
  readonly shape: ButtonShape;
  readonly size: ButtonSize;
  readonly disabled?: boolean;  // Opcional
}

buttons: this.colorRoles.map(role => ({
  variant,
  label: role.label,
  color: role.color,
  shape: this.shape(),
  size: this.size(),
  disabled: role.disabled  // undefined si no está presente
}))
```

```html
<!-- Template -->
<app-button [config]="config">
  {{ config.label }}
</app-button>
```

**Ventajas:**
- Propiedades consistentes y tipadas
- Nombres de signals simples
- Sin lógica en template
- Configuración precalculada y tipada
- disabled opcional (no necesita || false)

## 🎯 Test Manual

1. **Navegar a la página:**
   ```
   http://localhost:4200/pds/buttons
   ```

2. **Verificar render inicial:**
   - ✅ Deberías ver 5 tarjetas (Text, Elevated, Outlined, Filled, Tonal)
   - ✅ Cada tarjeta tiene 4 botones (Primary, Secondary, Tertiary, Disabled)
   - ✅ El texto es visible en todos los botones
   - ✅ Shape inicial: Rounded (pill shape)
   - ✅ Size inicial: Large

3. **Probar cambio de Shape:**
   - Click en "Square" → Todos los botones deben cambiar a bordes cuadrados
   - Click en "Rounded" → Todos los botones deben volver a pill shape

4. **Probar cambio de Size:**
   - Click en "Small" → Todos los botones se hacen más pequeños
   - Click en "Medium" → Todos los botones tamaño medio
   - Click en "Large" → Todos los botones más grandes

5. **Verificar estados:**
   - ✅ El botón "Disabled" en cada grupo está deshabilitado (opacidad reducida, cursor not-allowed)
   - ✅ Los otros botones son clickeables

## 📝 Código de Ejemplo de Uso

### Uso Simple
```html
<app-button>Click Me</app-button>
```

### Uso con Configuración
```html
<app-button [config]="{
  variant: 'filled',
  color: 'primary',
  size: 'large',
  shape: 'rounded'
}">
  Save Changes
</app-button>
```

### Uso con Signals Dinámicos
```typescript
export class MyComponent {
  shape = signal<ButtonShape>('rounded');
  
  config = computed(() => ({
    variant: 'filled' as ButtonVariant,
    color: 'primary' as ButtonColor,
    shape: this.shape(),
    size: 'large' as ButtonSize
  }));
}
```

```html
<app-button [config]="config()">Dynamic Button</app-button>

<button mat-button (click)="shape.set('square')">Square</button>
<button mat-button (click)="shape.set('rounded')">Rounded</button>
```

## ✨ Resultado Esperado

Después de estos cambios, deberías tener:

1. ✅ Un componente `app-button` completamente funcional
2. ✅ Proyección de contenido trabajando correctamente
3. ✅ Estilos dinámicos aplicándose en tiempo real
4. ✅ API simplificada y consistente
5. ✅ Type safety en toda la configuración
6. ✅ Reactividad completa con signals
7. ✅ Documentación completa en README.md
8. ✅ Showcase funcional en /pds/buttons

¡Todo listo para usar en producción! 🚀

