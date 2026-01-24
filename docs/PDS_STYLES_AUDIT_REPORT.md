# Auditoría de Estilos PDS - Análisis de Duplicaciones y Desorganización

**Fecha:** 23 de enero de 2026  
**Archivos analizados:** 4 archivos SCSS

---

## 📊 RESUMEN EJECUTIVO

| Problema | Cantidad | Severidad |
|----------|----------|-----------|
| **Estilos duplicados** | 6 clases | 🔴 Alta |
| **Estilos no utilizados** | 3 clases | 🟡 Media |
| **Estilos mal ubicados** | 7 clases | 🟠 Media-Alta |
| **Total de problemas** | 16 | - |

---

## 🔴 PROBLEMA #1: ESTILOS DUPLICADOS (6 clases)

### 1.1 `.section-label` - DUPLICADO

**Ubicaciones:**
- ✅ `_pds-playground.scss` línea 1
- ❌ `pds-page-layout.component.scss` línea 17

```scss
// En _pds-playground.scss
.section-label {
  opacity: 0.7;
}

// En pds-page-layout.component.scss (DUPLICADO)
.section-label {
  color: var(--mat-sys-on-surface-variant);
  opacity: 0.7;
}
```

**Problema:** La clase en `pds-page-layout.component.scss` tiene una propiedad extra (`color`), pero el `opacity` está duplicado.

**Usado en:** 20 ocurrencias en múltiples componentes (buttons, checkboxes, indicators, selects, toggle-groups, basic-forms)

**Solución:** Mantener SOLO en `_pds-playground.scss` con ambas propiedades.

---

### 1.2 `.back-button` - DUPLICADO

**Ubicaciones:**
- ✅ `_pds-playground.scss` línea 5
- ❌ `pds-page-layout.component.scss` línea 22

```scss
// IDÉNTICOS en ambos archivos
.back-button {
  ::ng-deep .mat-mdc-button-persistent-ripple {
    opacity: 0;
  }
}
```

**Problema:** 100% duplicado, código idéntico.

**Usado en:** 6 ocurrencias (todos los pages de PDS)

**Solución:** ELIMINAR de `pds-page-layout.component.scss`, mantener en `_pds-playground.scss`.

---

### 1.3 `.card-header` - DUPLICADO

**Ubicaciones:**
- ✅ `_pds-playground.scss` línea 11
- ❌ `pds-page-layout.component.scss` línea 28

```scss
// IDÉNTICOS en ambos archivos
.card-header {
  background-color: var(--mat-sys-surface-container-low);
  border-color: var(--mat-sys-outline-variant);
}
```

**Problema:** 100% duplicado, código idéntico.

**Usado en:** 1 ocurrencia en `pds-page-layout.component.html`

**Solución:** ELIMINAR de `pds-page-layout.component.scss`, mantener en `_pds-playground.scss`.

---

### 1.4 `.preview-container` - DUPLICADO

**Ubicaciones:**
- ✅ `_pds-playground.scss` línea 17
- ❌ `pds-page-layout.component.scss` línea 37

```scss
// IDÉNTICOS en ambos archivos
.preview-container {
  border-color: var(--mat-sys-outline-variant);
  background-image: url('https://bg.ibelick.com/dot-grid.svg');
}
```

**Problema:** 100% duplicado, código idéntico.

**Usado en:** Solo en `pds-preview-card.component.ts` (template inline)

**Solución:** ELIMINAR de `pds-page-layout.component.scss`, mantener en `_pds-playground.scss`.

---

### 1.5 `.inline-code` - DUPLICADO (con diferencia)

**Ubicaciones:**
- ✅ `_pds-playground.scss` línea 22
- ❌ `pds-page-layout.component.scss` línea 42

```scss
// En _pds-playground.scss
.inline-code {
  background-color: var(--mat-sys-surface-container);
  border-color: var(--mat-sys-outline-variant);
}

// En pds-page-layout.component.scss (con color extra)
.inline-code {
  background-color: var(--mat-sys-surface-container-high);
  color: var(--mat-sys-primary);
  border-color: var(--mat-sys-outline-variant);
}
```

**Problema:** Casi duplicado, pero con diferencias en `background-color` y `color` extra.

**Usado en:** 2 ocurrencias (pds-page-layout, pds-best-practices)

**Solución:** UNIFICAR en `_pds-playground.scss` con la versión más completa.

---

### 1.6 `.api-section-header` - DUPLICADO

**Ubicaciones:**
- ✅ `_pds-playground.scss` línea 148
- ❌ `pds-page-layout.component.scss` línea 49

```scss
// IDÉNTICOS en ambos archivos
.api-section-header {
  .api-icon-container {
    background: linear-gradient(
      135deg,
      var(--mat-sys-primary-container),
      var(--mat-sys-tertiary-container)
    );
    border-color: var(--mat-sys-primary);

    mat-icon {
      color: var(--mat-sys-primary);
    }
  }
}
```

**Problema:** 100% duplicado, código idéntico.

**Usado en:** `pds-api-reference.component.ts`, `pds-best-practices.component.ts`

**Solución:** ELIMINAR de `pds-page-layout.component.scss`, mantener en `_pds-playground.scss`.

---

## 🟡 PROBLEMA #2: ESTILOS NO UTILIZADOS (3 clases)

### 2.1 `.code-card` - NO USADO

**Ubicación:** `_pds-playground.scss` línea 27-52 (26 líneas)

```scss
.code-card {
  background-color: var(--mat-sys-surface-container-highest);
  border-color: var(--mat-sys-outline);
  // ... 26 líneas de estilos
}
```

**Problema:** La clase `.code-card` NO aparece en ningún HTML del proyecto.

**Búsqueda:** 0 ocurrencias en archivos HTML.

**Solución:** ELIMINAR completamente (ahorra 26 líneas).

---

### 2.2 `.card-border` - NO USADO

**Ubicación:** `_pds-playground.scss` línea 72-84 (13 líneas)

```scss
.card-border {
  &.high { border-left: 4px solid var(--mat-sys-primary); }
  &.medium { border-left: 4px solid var(--mat-sys-secondary); }
  &.low { border-left: 4px solid var(--mat-sys-tertiary); }
}
```

**Problema:** Existe un método `getCardBorderClasses()` en `pds-page-layout.component.ts`, pero NO se usa en el HTML.

**Búsqueda:** 0 ocurrencias en archivos HTML.

**Solución:** ELIMINAR completamente O implementar correctamente si se necesita.

---

### 2.3 `.alert-tip` - NO USADO

**Ubicación:** `_pds-playground.scss` línea 127-146 (20 líneas)

```scss
.alert-tip {
  background-color: var(--mat-sys-tertiary-container);
  // ... 20 líneas de estilos
}
```

**Problema:** La clase `.alert-tip` NO aparece en ningún HTML del proyecto.

**Búsqueda:** 0 ocurrencias en archivos HTML.

**Solución:** ELIMINAR completamente (ahorra 20 líneas).

---

## 🟠 PROBLEMA #3: ESTILOS MAL UBICADOS (7 clases)

### 3.1 `.practice-item` - MAL UBICADO

**Ubicación actual:** `pds-best-practices.component.scss`

**Problema:** Esta clase se usa SOLO en `pds-best-practices.component.ts`, pero está en el archivo SCSS del componente. Esto es correcto según el patrón, PERO:

- Ya existe una versión en `_pds-playground.scss` (líneas 72-84) que NO se usa
- Debería estar en `_pds-playground.scss` si se usa en múltiples lugares

**Verificación:** Se usa SOLO en `pds-best-practices.component.ts`.

**Solución:** MANTENER en `pds-best-practices.component.scss` (está bien ubicado).

---

### 3.2-3.8 Estilos en `_pds-playground.scss` que deberían estar en componentes

**Clases que se usan UNA SOLA VEZ:**

| Clase | Usado en | Líneas en _pds-playground |
|-------|----------|--------------------------|
| `.emphasis-badge` | Solo `pds-page-layout` | 54-70 (17 líneas) |
| `.info-box` | Solo `pds-page-layout` | 86-107 (22 líneas) |
| `.example-tag` | Solo `pds-page-layout` | 109-112 (4 líneas) |
| `.section-divider` | NO USADO | 204-206 (3 líneas) |

**Problema:** Estos estilos están en el archivo global pero se usan en un solo componente.

**Solución:** MOVER a `pds-page-layout.component.scss`.

---

## 🟢 PROBLEMA #4: API STYLES DUPLICADOS CON DIFERENCIAS

### 4.1 `.api-card` - DUPLICADO (con diferencias menores)

**Ubicaciones:**
- `_pds-playground.scss` línea 163-203 (41 líneas)
- `pds-page-layout.component.scss` línea 72-115 (44 líneas)

**Diferencias:**

```scss
// En _pds-playground.scss
.api-card {
  border-color: var(--mat-sys-outline);
  border-width: 2px; // ← Extra
  
  .api-type {
    background-color: var(--mat-sys-surface-container-low); // ← Extra
    color: var(--mat-sys-on-surface-variant);
    border-color: var(--mat-sys-outline-variant); // ← Extra
  }
  
  .api-default {
    background-color: var(--mat-sys-tertiary-container); // ← Extra
    color: var(--mat-sys-on-tertiary-container);
    border-color: var(--mat-sys-tertiary); // ← Extra
  }
}

// En pds-page-layout.component.scss
.api-card {
  border-color: var(--mat-sys-outline);
  // No tiene border-width
  
  .api-type {
    color: var(--mat-sys-on-surface-variant);
    // No tiene background ni border
  }
  
  .api-default {
    color: var(--mat-sys-on-surface-variant);
    // No tiene background ni border
  }
}
```

**Usado en:** `pds-api-reference.component.ts`

**Solución:** CONSOLIDAR en `_pds-playground.scss` con la versión más completa.

---

## 📋 RESUMEN DE ACCIONES

### ✅ MANTENER EN `_pds-playground.scss` (con consolidación):
1. `.section-label` - Agregar `color` (usado en 20+ lugares)
2. `.back-button` - Ya correcto (usado en 6 lugares)
3. `.card-header` - Ya correcto (usado en 1 lugar)
4. `.preview-container` - Ya correcto (usado en 1 lugar)
5. `.inline-code` - Consolidar versión completa (usado en 2 lugares)
6. `.api-section-header` - Ya correcto (usado en 2 componentes)
7. `.api-card` - Consolidar versión completa (usado en 1 componente)
8. `.color-variation-card` - Ya correcto (usado en 8 lugares)

### ❌ ELIMINAR de `pds-page-layout.component.scss`:
1. `.section-label` (duplicado)
2. `.back-button` (duplicado)
3. `.card-header` (duplicado)
4. `.preview-container` (duplicado)
5. `.inline-code` (duplicado)
6. `.api-section-header` (duplicado)
7. `.api-card` (duplicado)
8. `.api-title`, `.api-description` (solo usados aquí, pero mejor en global)
9. Todos los estilos de "Best Practices" (no usados en este componente)

### ❌ ELIMINAR de `_pds-playground.scss`:
1. `.code-card` (no usado - 26 líneas)
2. `.card-border` (no usado - 13 líneas)
3. `.alert-tip` (no usado - 20 líneas)
4. `.section-divider` (no usado - 3 líneas)

### ➡️ MOVER a `pds-page-layout.component.scss`:
1. `.emphasis-badge` (17 líneas) - Solo usado aquí
2. `.info-box` (22 líneas) - Solo usado aquí
3. `.example-tag` (4 líneas) - Solo usado aquí
4. `.page-title`, `.page-description`, `.section-title` - Ya están aquí ✅

### ✅ MANTENER en `pds-best-practices.component.scss`:
1. `.practice-item` - Correcto (solo usado aquí)

---

## 📊 IMPACTO DE LA LIMPIEZA

| Archivo | Líneas actuales | Líneas después | Reducción |
|---------|----------------|----------------|-----------|
| `_pds-playground.scss` | 208 | 151 | -57 (-27%) |
| `pds-page-layout.component.scss` | 167 | 60 | -107 (-64%) |
| `pds-best-practices.component.scss` | 30 | 30 | 0 |
| **TOTAL** | **405** | **241** | **-164 (-40%)** |

---

## 🎯 BENEFICIOS DE LA REFACTORIZACIÓN

1. ✅ **Elimina duplicación**: 6 clases duplicadas → consolidadas
2. ✅ **Elimina código muerto**: 62 líneas de código no usado
3. ✅ **Mejora organización**: Estilos globales en global, específicos en componente
4. ✅ **Reduce bundle**: 40% menos código CSS en PDS
5. ✅ **Facilita mantenimiento**: Un solo lugar para cada estilo

---

## 🔧 ORDEN DE REFACTORIZACIÓN RECOMENDADO

1. **Consolidar** `_pds-playground.scss` (agregar propiedades faltantes)
2. **Limpiar** `pds-page-layout.component.scss` (eliminar duplicados)
3. **Mover** estilos específicos a `pds-page-layout.component.scss`
4. **Eliminar** código no usado de `_pds-playground.scss`
5. **Verificar** que todo siga funcionando

---

**Estado:** 🔴 Requiere refactorización urgente  
**Prioridad:** Alta  
**Tiempo estimado:** 30 minutos
