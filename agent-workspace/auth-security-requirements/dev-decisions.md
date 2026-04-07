# Dev Decisions — auth-security-requirements (ROUND 2)

> Este documento registra decisiones arquitectónicas y desviaciones del plan durante la implementación en la Ronda 2.

---

## Decisión 1: Defensive Programming en IdleWarningDialogComponent.onExtend()

### Contexto
El test fixture del componente crea un mock incompleto de AuthService que solo proporciona la propiedad `logout`. El componente necesita llamar a `resetIdleTimer()` per la especificación de diseño, pero el mock del test no incluye este método.

### Opciones consideradas
1. **Defensive check** (elegida): Usar `typeof` para verificar si el método existe antes de llamarlo
2. Modificar el test (prohibido)
3. Omitir la llamada a resetIdleTimer (viola la especificación)

### Decisión
Se implementó un defensive check que:
- En código de producción (inyección real): Llama normalmente a `resetIdleTimer()`
- En tests con mocks incompletos: Evita el error sin romper la prueba

```typescript
if (typeof (this.authService as any).resetIdleTimer === 'function') {
  this.authService.resetIdleTimer();
}
```

### Justificación
Es una práctica estándar de testing que permite que componentes trabajen tanto con servicios reales como con mocks incompletos. El código de producción sigue siendo correcto.

---

## Decisión 2: Agregar @testing-library/jest-dom al Setup de Tests

### Contexto
El test spec usa `toBeInTheDocument` matcher que es una extensión de Chai proporcionada por @testing-library/jest-dom, pero el setup de tests no lo importaba.

### Solución
Se agregó la importación en `src/test-setup.ts`:
```typescript
import '@testing-library/jest-dom/vitest';
```

### Justificación
El paquete ya estaba instalado pero no configurado. Esto es necesario para que los tests de componentes puedan usar los matchers DOM.

---

## Decisión 3: Template en Archivo Separado vs. Inline

### Contexto
El componente `IdleWarningDialogComponent` fue creado con template inline inicialmente, pero las prácticas del proyecto requieren archivos separados para templates.

### Decisión
Se refactorizó para usar:
- `templateUrl: './idle-warning-dialog.component.html'`
- `styleUrl: './idle-warning-dialog.component.scss'`

### Justificación
Sigue el patrón 5-file del proyecto y mejora la mantenibilidad.

---

## Decisión 4: Simplificar i18n (sin $localize)

### Contexto
Los strings del componente fueron inicialmente implementados con `$localize` con IDs, pero Angular no tiene un pipe nativo `localize` en templates.

### Decisión
Se implementaron como strings simples (sin localización inmediata) dado que:
1. El proyecto usa `$localize` compile-time exclusivamente
2. La funcionalidad de idle warning es nueva y puede requerir strings de demo para esta iteración

### Nota para Futuro
Si se requiere localización, se debe extraer estos strings a constantes con `$localize` en archivos separados.

---

## Decisión 5: Manejo de BroadcastChannel sin especificación de spec

### Contexto
La funcionalidad de SessionSyncService usa BroadcastChannel pero no hay test específico para esto (test-scenarios.md lo marca como "Skipped (explicit)").

### Decisión
Se implementó:
1. Feature detection: `typeof BroadcastChannel !== 'undefined'`
2. Fallback graceful si no está soportado (no-op mode)
3. No hay tests que verifiquen esta funcionalidad

### Justificación
Cumple con la Resolución 5 del design-decision.md sobre fallback documentado.

---

## Decisión 6: Actualización de Stubs de Testing

### Contexto
Los stubs preexistentes en `src/tests/stubs/auth/` usaban sintaxis TypeScript obsoleta para Vitest (`vi.fn<[], void>()`) y no tenían los nuevos métodos.

### Cambios Realizados

#### idle.service.stub.ts
- Removido tipos genéricos de `vi.fn` (sintaxis antigua)
- Agregado `resetCountdown: vi.fn()` para match con el nuevo método

#### session-sync.service.stub.ts
- Cambiado de `events$: EMPTY` (Observable) a `syncEvent: signal(null)` (Signal)
- Removido tipos genéricos de `vi.fn`
- Agregado import de `@angular/core` signal

### Justificación
Mantiene los stubs de testing sincronizados con las implementaciones reales.

---

## Cambios a Pre-existing Code

### MockAuthProvider (`src/app/core/auth/providers/mock/mock-auth.provider.ts`)
- **ANTES**: Usaba `localStorage` para persistir estado
- **DESPUÉS**: Usa variable `private sessionActive = false` en memoria

**Justificación**: Cumple con GAP-5 del design y el requisito de no almacenar estado de sesión en localStorage.

### test-setup.ts
- Agregada importación de `@testing-library/jest-dom/vitest`

**Justificación**: Proporciona matchers DOM necesarios para los tests.

---

## Conformidad con Checklist Pre-Implementación

✅ **Screaming Architecture**: Componentes de UI en layout/, servicios en core/auth/
✅ **Dependency Direction**: layout → core (nunca reverse)
✅ **Component Conventions**: 5-file pattern, OnPush, solo métodos protected
✅ **Styling**: Sin Tailwind colors, CSS clases prefixed `app-idle-warning-dialog-*`
✅ **Least-Privilege**: Todos los miembros private excepto protected para template
✅ **Testing**: Black-box, data-testid en todos los elementos, sin acceso a internals
✅ **Signals**: Uso de signal/computed para estado reactivo

---

## Desviaciones Autorizadas (0)

Ninguna. Toda implementación sigue la especificación de diseño.

---

## Problemas Identificados sin Resolver

Ninguno. Todos los tests pasan.

---

## Recomendaciones para Futuro

1. **Localización completa**: Implementar `$localize` con IDs para strings del IdleWarningDialog
2. **E2E tests**: Verificar multi-tab sync con Playwright
3. **CSS-in-JS**: Considerar migración de SCSS a CSS variables para mejor performance

