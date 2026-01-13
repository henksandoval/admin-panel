# Button Component

Componente wrapper para botones de Angular Material que abstrae la implementación y proporciona una API consistente en toda la aplicación.

**✨ Usa la nueva sintaxis simplificada de Angular Material 20: `matButton="variant"`**

## 📁 Ubicación

`src/app/shared/atoms/button/`

## 🎯 Propósito

Abstraer la implementación de Angular Material Button para:
- Proporcionar una API consistente y simplificada
- Usar la nueva sintaxis de Angular Material 20 (menos declarativa, más simple)
- Facilitar el cambio de biblioteca UI en el futuro
- Centralizar la configuración de estilos de botones
- Mantener consistencia visual en toda la aplicación
- Eliminar problemas con `<ng-content>` en bloques condicionales

## 📦 Uso Básico

```typescript
import { ButtonComponent } from '@shared/atoms/button/button.component';

@Component({
  imports: [ButtonComponent]
})
```

```html
<!-- Botón básico -->
<app-button>Click me</app-button>

<!-- Botón con configuración -->
<app-button [config]="{
  variant: 'filled',
  color: 'primary',
  size: 'large'
}">
  Save Changes
</app-button>
```

## 🆕 Nueva Sintaxis de Angular Material 20

A diferencia de versiones anteriores que usaban directivas separadas (`mat-button`, `mat-raised-button`, `mat-flat-button`, etc.), Angular Material 20 usa un único atributo `matButton` con un valor:

### ❌ Sintaxis Antigua (Angular Material < 20)
```html
<button mat-button>Text</button>
<button mat-raised-button>Elevated</button>
<button mat-flat-button>Filled</button>
<button mat-stroked-button>Outlined</button>
```

### ✅ Nueva Sintaxis (Angular Material 20)
```html
<button matButton>Text</button>
<button matButton="elevated">Elevated</button>
<button matButton="filled">Filled</button>
<button matButton="tonal">Tonal</button>
<button matButton="outlined">Outlined</button>
```

**Beneficios:**
- ✅ Menos declarativo, más simple
- ✅ Un solo atributo en lugar de múltiples directivas
- ✅ Más fácil de cambiar dinámicamente
- ✅ Mejor rendimiento (un solo elemento renderizado)
- ✅ Soluciona problemas con `<ng-content>` en bloques condicionales
- ✅ El contenido proyectado funciona correctamente siempre

## ⚙️ Configuración

### Variantes de Botón (`variant`)

- `text` - Botón de texto sin fondo (matButton sin valor)
- `elevated` - Botón elevado con sombra (matButton="elevated")
- `outlined` - Botón con borde (matButton="outlined")
- `filled` - Botón relleno (matButton="filled") - **Por defecto**
- `tonal` - Botón tonal (matButton="tonal")

### Colores (`color`)

Colores de Material Design 3:
- `primary` - Color primario de la aplicación
- `secondary` - Color secundario
- `tertiary` - Color terciario
- `undefined` - Color por defecto (superficie)

### Formas (`shape`)

- `square` - Bordes cuadrados con border-radius de 0.25rem
- `rounded` - Bordes completamente redondeados (pill shape) - **Por defecto**

### Tamaños (`size`)

- `small` - 32px altura, padding 0.25rem 0.75rem, iconos 1rem
- `medium` - 36px altura, padding 0.5rem 1rem, iconos 1.25rem - **Por defecto**
- `large` - 42px altura, padding 0.5rem 1.5rem, iconos 1.5rem

### Otras Opciones

- `type` - Tipo HTML del botón: `button` | `submit` | `reset` (Por defecto: `button`)
- `disabled` - Estado deshabilitado (Por defecto: `false`, **opcional**)
- `fullWidth` - Botón de ancho completo (Por defecto: `false`)
- `iconBefore` - Icono de Material antes del texto
- `iconAfter` - Icono de Material después del texto
- `ariaLabel` - Etiqueta ARIA para accesibilidad

## 📝 Ejemplos

### Botón Primario con Icono

```html
<app-button [config]="{
  variant: 'filled',
  color: 'primary',
  size: 'large',
  iconBefore: 'save'
}">
  Save Changes
</app-button>
```

### Botón de Acción Secundaria

```html
<app-button [config]="{
  variant: 'outlined',
  color: 'secondary',
  size: 'medium'
}">
  Cancel
</app-button>
```

### Botón Tonal (Nuevo en M3)

```html
<app-button [config]="{
  variant: 'tonal',
  color: 'tertiary',
  shape: 'rounded',
  size: 'large'
}">
  Tertiary Action
</app-button>
```

### Botón de Ancho Completo

```html
<app-button [config]="{
  variant: 'filled',
  color: 'primary',
  fullWidth: true,
  iconAfter: 'arrow_forward'
}">
  Continue
</app-button>
```

### Botón de Submit en Formulario

```html
<app-button [config]="{
  variant: 'filled',
  color: 'primary',
  type: 'submit',
  disabled: form.invalid
}">
  Submit
</app-button>
```

### Botón con Evento Click

```html
<app-button 
  [config]="{ variant: 'outlined', color: 'secondary' }"
  (clicked)="handleClick($event)">
  Click Handler
</app-button>
```

```typescript
handleClick(event: MouseEvent) {
  console.log('Button clicked', event);
}
```

### Uso con Signals (Dinámico)

```typescript
import { signal, computed } from '@angular/core';
import { ButtonConfig, ButtonShape, ButtonSize } from '@shared/atoms/button/button.model';

export class MyComponent {
  shape = signal<ButtonShape>('rounded');
  size = signal<ButtonSize>('large');
  
  buttonConfig = computed(() => ({
    variant: 'filled' as const,
    color: 'primary' as const,
    shape: this.shape(),
    size: this.size()
  }));
}
```

```html
<app-button [config]="buttonConfig()">
  Dynamic Button
</app-button>

<!-- Controles para cambiar shape/size -->
<mat-button-toggle-group [value]="shape()" (change)="shape.set($event.value)">
  <mat-button-toggle value="square">Square</mat-button-toggle>
  <mat-button-toggle value="rounded">Rounded</mat-button-toggle>
</mat-button-toggle-group>
```

## 🎨 Estilos Personalizados

Los estilos están centralizados en `button.component.scss` y utilizan `::ng-deep` para penetrar en los componentes de Material.

### Shape Classes
- `.btn-shape-square` - Border radius de 0.25rem
- `.btn-shape-rounded` - Border radius de 9999px (completamente redondo)

### Size Classes
- `.btn-size-small` - Tamaño pequeño con iconos de 1rem
- `.btn-size-medium` - Tamaño medio con iconos de 1.25rem
- `.btn-size-large` - Tamaño grande con iconos de 1.5rem

## 🔄 Comparación con Material Button Directo

### ❌ Antes (Material directo con sintaxis antigua)

```html
<button 
  mat-flat-button 
  [attr.color]="'primary'"
  [class]="'btn-shape-rounded btn-size-large'">
  Click me
</button>
```

### ✅ Después (app-button con sintaxis nueva)

```html
<app-button [config]="{
  variant: 'filled',
  color: 'primary',
  shape: 'rounded',
  size: 'large'
}">
  Click me
</app-button>
```

## 🏗️ Arquitectura

El componente sigue el patrón de diseño utilizado en `form-field-input`:

1. **Modelo de Configuración** (`button.model.ts`) - Define tipos y opciones
2. **Componente Wrapper** (`button.component.ts`) - Encapsula lógica y renderizado con la nueva sintaxis
3. **Estilos Centralizados** (`button.component.scss`) - Estilos consistentes

### Implementación Interna

```typescript
// Mapeo de variant a matButton attribute
matButtonVariant = computed(() => {
  const variant = this.fullConfig().variant;
  if (variant === 'text') {
    return undefined; // matButton sin valor
  }
  return variant; // 'elevated' | 'filled' | 'tonal' | 'outlined'
});
```

## 🎯 Beneficios

1. **Abstracción Completa** - Oculta detalles de Angular Material
2. **API Consistente** - Similar a `app-form-field-input`
3. **Type Safety** - TypeScript fuerte en todo
4. **Reactividad** - Funciona perfectamente con signals
5. **Mantenibilidad** - Cambios centralizados
6. **Flexibilidad** - Fácil extender con nuevas features
7. **Simplicidad** - Usa la nueva sintaxis simplificada de Angular Material 20
8. **Sin Problemas de Proyección** - `<ng-content>` funciona correctamente

## 🐛 Problema Resuelto

### ❌ Problema con Múltiples Bloques Condicionales

Cuando usábamos múltiples `@if/@else if` con diferentes directivas (`mat-button`, `mat-raised-button`, etc.), el `<ng-content>` solo funcionaba en el último bloque porque se "consumía" en los anteriores:

```typescript
// ❌ ESTO NO FUNCIONA
@if (variant === 'text') {
  <button mat-button><ng-content /></button>
} @else if (variant === 'elevated') {
  <button mat-raised-button><ng-content /></button> // ❌ No proyecta contenido
}
```

### ✅ Solución con Nueva Sintaxis

Un solo elemento `<button>` con atributo dinámico:

```typescript
// ✅ ESTO FUNCIONA
<button [matButton]="variant">
  <ng-content /> // ✅ Siempre proyecta contenido
</button>
```

## 🚀 Próximos Pasos Sugeridos

- [ ] Agregar unit tests para el componente
- [ ] Agregar soporte para botones icon-only (sin texto)
- [ ] Agregar variante de botón FAB (Floating Action Button)
- [ ] Agregar soporte para tooltips integrados
- [ ] Agregar animaciones de loading state
- [ ] Documentar casos de uso en formularios

## 📚 Referencias

- [Angular Material 20 Buttons](https://material.angular.io/components/button/overview)
- [Material Design 3 Buttons](https://m3.material.io/components/buttons/overview)
- Implementación inspirada en: `@shared/atoms/form-field-input`

## 📊 Tipos Exportados

```typescript
export type ButtonVariant = 'text' | 'elevated' | 'outlined' | 'filled' | 'tonal';
export type ButtonColor = 'primary' | 'secondary' | 'tertiary';
export type ButtonShape = 'square' | 'rounded';
export type ButtonSize = 'small' | 'medium' | 'large';
export type ButtonType = 'button' | 'submit' | 'reset';

export interface ButtonOptions {
  variant?: ButtonVariant;
  color?: ButtonColor;
  shape?: ButtonShape;
  size?: ButtonSize;
  type?: ButtonType;
  disabled?: boolean;  // ✅ OPCIONAL
  fullWidth?: boolean;
  iconBefore?: string;
  iconAfter?: string;
  ariaLabel?: string;
}
```

