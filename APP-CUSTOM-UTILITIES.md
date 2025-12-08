# 🎨 App Custom Utilities - Clases Encapsuladas

## 🎯 ¿Qué Son?

Son **clases utility personalizadas** que encapsulan patrones comunes de tu aplicación, combinando automáticamente light y dark mode.

---

## ✅ Ventaja Principal

### Antes (Verboso):
```html
<mat-icon class="text-theme-600 dark:text-theme-400">notifications</mat-icon>
<p class="text-gray-600 dark:text-gray-400 mb-1">Texto secundario</p>
<div class="bg-white dark:bg-secondary-800 border border-gray-200 dark:border-secondary-700">
```

### Ahora (Conciso): ✨
```html
<mat-icon class="app-text-theme">notifications</mat-icon>
<p class="app-text-secondary mb-1">Texto secundario</p>
<div class="app-card">
```

**¡Mucho más limpio y mantenible!** 🎉

---

## 📚 Catálogo Completo

### 🎨 Colores de Texto Temáticos

#### `app-text-theme`
```html
<span class="app-text-theme">Texto con color del tema</span>
```
**Equivalente a:** `text-theme-600 dark:text-theme-400`

**Uso:** Textos que deben usar el color del tema seleccionado

---

#### `app-text-theme-light`
```html
<span class="app-text-theme-light">Texto claro del tema</span>
```
**Equivalente a:** `text-theme-500 dark:text-theme-300`

**Uso:** Textos más claros del tema

---

#### `app-text-theme-dark`
```html
<span class="app-text-theme-dark">Texto oscuro del tema</span>
```
**Equivalente a:** `text-theme-700 dark:text-theme-500`

**Uso:** Textos más oscuros del tema

---

### 📝 Colores de Texto Neutros

#### `app-text-primary`
```html
<h1 class="app-text-primary">Título Principal</h1>
```
**Equivalente a:** `text-gray-800 dark:text-gray-100`

**Uso:** Títulos y textos principales

---

#### `app-text-secondary`
```html
<p class="app-text-secondary">Texto normal</p>
```
**Equivalente a:** `text-gray-600 dark:text-gray-300`

**Uso:** Textos normales y párrafos

---

#### `app-text-tertiary`
```html
<span class="app-text-tertiary">Texto menos importante</span>
```
**Equivalente a:** `text-gray-500 dark:text-gray-400`

**Uso:** Textos secundarios, metadatos

---

#### `app-text-muted`
```html
<small class="app-text-muted">Texto deshabilitado</small>
```
**Equivalente a:** `text-gray-400 dark:text-gray-600`

**Uso:** Textos deshabilitados, placeholders

---

### 🎨 Fondos Temáticos

#### `app-bg-theme`
```html
<div class="app-bg-theme p-4">Fondo del tema</div>
```
**Equivalente a:** `bg-theme-100 dark:bg-theme-900`

**Uso:** Fondos suaves del tema

---

#### `app-bg-theme-subtle`
```html
<div class="app-bg-theme-subtle p-4">Fondo muy sutil</div>
```
**Equivalente a:** `bg-theme-50 dark:bg-theme-900 dark:bg-opacity-30`

**Uso:** Fondos apenas perceptibles

---

#### `app-bg-theme-solid`
```html
<button class="app-bg-theme-solid px-4 py-2">Botón</button>
```
**Equivalente a:** `bg-theme-500 text-white`

**Uso:** Botones y elementos destacados

---

### 🏠 Fondos Neutros

#### `app-bg-surface`
```html
<div class="app-bg-surface p-6">Card simple</div>
```
**Equivalente a:** `bg-white dark:bg-secondary-800`

**Uso:** Cards, modales, superficies

---

#### `app-bg-surface-raised`
```html
<div class="app-bg-surface-raised p-4">Fondo elevado</div>
```
**Equivalente a:** `bg-gray-50 dark:bg-secondary-700`

**Uso:** Secciones destacadas, sidebars secundarios

---

#### `app-bg-hover`
```html
<button class="app-bg-hover px-4 py-2">Hover state</button>
```
**Equivalente a:** `bg-gray-100 dark:bg-secondary-600`

**Uso:** Estados hover en botones secundarios

---

### 📏 Bordes

#### `app-border-theme`
```html
<div class="border app-border-theme">Con borde del tema</div>
```
**Equivalente a:** `border-theme-300 dark:border-theme-700`

**Uso:** Bordes con color del tema

---

#### `app-border-theme-light`
```html
<div class="border app-border-theme-light">Borde claro</div>
```
**Equivalente a:** `border-theme-200 dark:border-theme-800`

**Uso:** Bordes más sutiles del tema

---

#### `app-border-default`
```html
<div class="border app-border-default">Borde normal</div>
```
**Equivalente a:** `border-gray-200 dark:border-secondary-700`

**Uso:** Bordes neutros estándar

---

#### `app-border-light`
```html
<div class="border app-border-light">Borde muy sutil</div>
```
**Equivalente a:** `border-gray-100 dark:border-secondary-600`

**Uso:** Divisores sutiles

---

### 🎁 Componentes Completos

#### `app-card`
```html
<div class="app-card p-6 rounded-lg">
  <h3>Card completo</h3>
  <p>Con fondo y borde automático</p>
</div>
```
**Equivalente a:** `bg-white dark:bg-secondary-800 border border-gray-200 dark:border-secondary-700`

**Uso:** Cards y contenedores

---

#### `app-button-primary`
```html
<button class="app-button-primary px-6 py-2 rounded-lg">
  Guardar
</button>
```
**Incluye:**
- Fondo del tema
- Texto blanco
- Hover automático
- Dark mode

**Uso:** Botones de acción principal

---

#### `app-button-secondary`
```html
<button class="app-button-secondary px-6 py-2 rounded-lg">
  Cancelar
</button>
```
**Incluye:**
- Fondo gris
- Texto oscuro/claro según modo
- Hover automático
- Dark mode

**Uso:** Botones secundarios

---

#### `app-input`
```html
<input type="text" class="app-input px-4 py-2 rounded-lg w-full" placeholder="Nombre">
```
**Incluye:**
- Fondo y borde
- Focus con color del tema
- Dark mode
- Estados focus

**Uso:** Inputs de formularios

---

#### `app-badge`
```html
<span class="app-badge">Nuevo</span>
```
**Incluye:**
- Fondo del tema
- Padding y border-radius
- Tamaño de texto
- Dark mode

**Uso:** Badges y etiquetas

---

### 🎨 Iconos

#### `app-icon-theme`
```html
<mat-icon class="app-icon-theme">star</mat-icon>
```
**Equivalente a:** `text-theme-600 dark:text-theme-400`

**Uso:** Iconos con color del tema

---

#### `app-icon-muted`
```html
<mat-icon class="app-icon-muted">info</mat-icon>
```
**Equivalente a:** `text-gray-400 dark:text-gray-600`

**Uso:** Iconos deshabilitados o secundarios

---

## 🎯 Ejemplos de Uso

### Ejemplo 1: Card de Estadística

**Antes:**
```html
<mat-card class="bg-white dark:bg-secondary-800 border border-gray-200 dark:border-secondary-700">
  <mat-card-content class="p-6">
    <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Ventas</p>
    <h3 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">$45,231</h3>
    <div class="bg-theme-100 dark:bg-theme-900 p-4 rounded-lg">
      <mat-icon class="text-theme-600 dark:text-theme-400">attach_money</mat-icon>
    </div>
  </mat-card-content>
</mat-card>
```

**Ahora:**
```html
<mat-card class="app-card">
  <mat-card-content class="p-6">
    <p class="text-sm app-text-secondary mb-1">Total Ventas</p>
    <h3 class="text-2xl font-bold app-text-primary mb-2">$45,231</h3>
    <div class="app-bg-theme p-4 rounded-lg">
      <mat-icon class="app-icon-theme">attach_money</mat-icon>
    </div>
  </mat-card-content>
</mat-card>
```

**Reducción:** ~40% menos código ✅

---

### Ejemplo 2: Formulario

**Antes:**
```html
<div class="bg-white dark:bg-secondary-800 border border-gray-200 dark:border-secondary-700 p-6 rounded-lg">
  <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Login</h2>
  
  <label class="block text-gray-600 dark:text-gray-400 mb-2">Email</label>
  <input 
    type="email" 
    class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-secondary-600 bg-white dark:bg-secondary-800 text-gray-900 dark:text-gray-100"
    placeholder="tu@email.com">
  
  <button class="w-full mt-4 bg-theme-500 hover:bg-theme-600 text-white px-6 py-2 rounded-lg">
    Entrar
  </button>
  
  <button class="w-full mt-2 bg-gray-100 dark:bg-secondary-700 hover:bg-gray-200 dark:hover:bg-secondary-600 text-gray-800 dark:text-gray-100 px-6 py-2 rounded-lg">
    Cancelar
  </button>
</div>
```

**Ahora:**
```html
<div class="app-card p-6 rounded-lg">
  <h2 class="text-xl font-semibold app-text-primary mb-4">Login</h2>
  
  <label class="block app-text-secondary mb-2">Email</label>
  <input 
    type="email" 
    class="app-input w-full px-4 py-2 rounded-lg"
    placeholder="tu@email.com">
  
  <button class="app-button-primary w-full mt-4 px-6 py-2 rounded-lg">
    Entrar
  </button>
  
  <button class="app-button-secondary w-full mt-2 px-6 py-2 rounded-lg">
    Cancelar
  </button>
</div>
```

**Reducción:** ~50% menos código ✅

---

### Ejemplo 3: Lista de Items

**Antes:**
```html
@for (item of items; track item.id) {
  <div class="bg-gray-50 dark:bg-secondary-700 hover:bg-gray-100 dark:hover:bg-secondary-600 border border-gray-200 dark:border-secondary-700 p-4 rounded-lg">
    <div class="bg-theme-100 dark:bg-theme-900 p-3 rounded-full inline-flex">
      <mat-icon class="text-theme-600 dark:text-theme-400">{{ item.icon }}</mat-icon>
    </div>
    <h4 class="text-gray-800 dark:text-gray-100 font-semibold">{{ item.title }}</h4>
    <p class="text-gray-600 dark:text-gray-400">{{ item.description }}</p>
    <span class="inline-flex px-3 py-1 rounded-full bg-theme-100 dark:bg-theme-900 text-theme-700 dark:text-theme-300 text-xs">
      {{ item.status }}
    </span>
  </div>
}
```

**Ahora:**
```html
@for (item of items; track item.id) {
  <div class="app-bg-surface-raised hover:app-bg-hover app-border-default border p-4 rounded-lg">
    <div class="app-bg-theme p-3 rounded-full inline-flex">
      <mat-icon class="app-icon-theme">{{ item.icon }}</mat-icon>
    </div>
    <h4 class="app-text-primary font-semibold">{{ item.title }}</h4>
    <p class="app-text-secondary">{{ item.description }}</p>
    <span class="app-badge text-xs">{{ item.status }}</span>
  </div>
}
```

**Reducción:** ~60% menos código ✅

---

## 📊 Comparación de Código

| Métrica | Sin app:* | Con app:* | Mejora |
|---------|-----------|-----------|--------|
| **Caracteres** | ~180 | ~80 | -55% |
| **Legibilidad** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | +67% |
| **Mantenibilidad** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | +67% |
| **Dark mode** | Manual | Automático | ✅ |

---

## ✅ Ventajas

### 1. Menos Código
```html
<!-- 18 clases → 4 clases -->
<div class="bg-white dark:bg-secondary-800 border border-gray-200 dark:border-secondary-700 text-gray-600 dark:text-gray-400">
<div class="app-card app-text-secondary">
```

### 2. Más Legible
```html
<!-- ¿Qué hace esto? -->
<p class="text-gray-600 dark:text-gray-400">

<!-- Clarísimo -->
<p class="app-text-secondary">
```

### 3. Consistencia
- Todos los textos secundarios usan la misma clase
- Cambiar el estilo en un lugar → afecta todo

### 4. Dark Mode Automático
- No más `dark:*` en HTML
- Todo manejado por CSS

### 5. Mantenible
- Cambiar colores globales → editar una clase
- No buscar y reemplazar en 50 archivos

---

## 🎯 Guía de Uso

### ¿Cuándo Usar app:*?

✅ **Usa app:* cuando:**
- El patrón se repite mucho
- Necesitas light + dark mode
- Quieres código más limpio

❌ **Usa Tailwind directo cuando:**
- Es un caso único
- Necesitas valores específicos
- El patrón no existe

---

### Combinando con Tailwind

```html
<!-- ✅ PERFECTO: Combinar ambos -->
<div class="app-card p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
  <!-- app-card: fondo y borde -->
  <!-- Tailwind: padding, border-radius, sombra, hover -->
</div>
```

---

## 🔧 Personalización

Si necesitas ajustar las utilites, edita:

**Archivo:** `src/themes/styles.scss`

**Sección:** `APP CUSTOM UTILITIES`

**Ejemplo:**
```scss
.app-text-secondary {
  color: #4b5563;  // ← Cambiar este valor
  
  .dark-theme & {
    color: #d1d5db;  // ← Y este
  }
}
```

---

## 📚 Resumen

**Antes de app:***
```html
<mat-icon class="text-theme-600 dark:text-theme-400">notifications</mat-icon>
```

**Con app:***
```html
<mat-icon class="app-icon-theme">notifications</mat-icon>
```

**Resultado:**
- ✅ 55% menos código
- ✅ Más legible
- ✅ Dark mode automático
- ✅ Mantenible
- ✅ Consistente

**¡Usa app:* para un código más limpio y profesional!** 🚀

