# Informe de revisión — auth-security-requirements (Ronda 2)

> Generado por: Architect Reviewer Agent  
> Artefactos auditados: `design-decision.md` · `completion-report.md` · `dev-decisions.md`  
> Archivos de implementación revisados: 16 (7 nuevos + 9 modificados)

<!-- STATUS: NEEDS_REVISION -->

---

## Resumen ejecutivo

La implementación de Ronda 2 resuelve parcialmente los 6 hallazgos MAYOR de Ronda 1. Dos convenciones críticas siguen incumplidas: (1) ningún string visible del `IdleWarningDialogComponent` usa `$localize` con `@@id`, violación explícita de las instrucciones de componentes y clasificada como **BLOQUEANTE** por el skill `review-code`; (2) los valores tipográficos en el SCSS siguen siendo píxeles crudos en lugar de tokens de Material Design. Adicionalmente, el componente `IdleWarningDialogComponent` llama `authService.logout()` cuando el countdown llega a cero — comportamiento que el `design-decision.md` Resolución 1 prohibió explícitamente al elegir la Opción A sobre la Opción B. Hay tres MENOR técnicos adicionales. El veredicto es **DO_NOT_MERGE**.

---

## Resultados de auditoría

### Archivos revisados: 16 (7 nuevos + 9 modificados)

| Archivo | Revisado |
|---|---|
| `session-sync.service.ts` | ✅ |
| `idle-warning-dialog.component.ts` | ✅ |
| `idle-warning-dialog.component.html` | ✅ |
| `idle-warning-dialog.component.scss` | ✅ |
| `idle-warning-dialog.component.model.ts` | ✅ |
| `auth.service.ts` | ✅ |
| `idle.service.ts` | ✅ |
| `core/auth/services/index.ts` | ✅ |
| `auth.model.ts` | ✅ |
| `mock-auth.provider.ts` | ✅ |
| `layout.component.ts` | ✅ |
| `test-setup.ts` | ✅ |
| `idle.service.stub.ts` | ✅ |
| `session-sync.service.stub.ts` | ✅ |
| `completion-report.md` | ✅ |
| `dev-decisions.md` | ✅ |

- Tests: 380 GREEN (afirmado por Dev; no contradicho por evidencia en código)
- Lint: sin issues nuevos (afirmado)
- Build: exitoso (afirmado)

---

## Hallazgos BLOQUEANTE

### B-1 — Strings visibles al usuario sin `$localize@@id` en `idle-warning-dialog.component.html`

**Archivo**: `src/app/layout/components/idle-warning-dialog/idle-warning-dialog.component.html`

**Líneas afectadas**:
- Línea 4: `Sesión por expirar`
- Línea 8: `Tu sesión expirará en:`
- Línea 20: `Mantener sesión activa`
- Línea 26: `Cerrar sesión`

**Regla violada** (doble evidencia):
1. `components.instructions.md`: *"All user-visible strings must use `$localize` with an `@@` ID. Never hardcode UI strings."*
2. `review-code/SKILL.md` Dimension 1: *"User-visible strings without `$localize` | ❌ Blocker"*

**Hallazgo de Ronda 1**: MAYOR-5. Clasificado BLOQUEANTE en Ronda 2 porque el skill lo califica ❌ Blocker y la violación es idéntica e intencional.

**Decisión del Dev (dev-decisions.md Decisión 4)**: El Dev documentó explícitamente no implementar `$localize`, argumentando que *"Angular no tiene un pipe nativo `localize` en templates."* Este argumento es **factualmente incorrecto**: `$localize` es un tagged template literal que se usa en el TypeScript de la clase como propiedad `protected`, y se enlaza desde el template. No es un pipe. El mecanismo correcto es:

```typescript
// idle-warning-dialog.component.ts
protected readonly titleText = $localize`:IdleWarningDialog|Title@@idle-warning-dialog.title:Sesión por expirar`;
protected readonly descriptionText = $localize`:IdleWarningDialog|Desc@@idle-warning-dialog.description:Tu sesión expirará en:`;
protected readonly extendButtonText = $localize`:IdleWarningDialog|Extend@@idle-warning-dialog.extend:Mantener sesión activa`;
protected readonly logoutButtonText = $localize`:IdleWarningDialog|Logout@@idle-warning-dialog.logout:Cerrar sesión`;
```

```html
<!-- idle-warning-dialog.component.html -->
<h2 ...>{{ titleText }}</h2>
<p ...>{{ descriptionText }}</p>
<button ...>{{ extendButtonText }}</button>
<button ...>{{ logoutButtonText }}</button>
```

**Consecuencia**: DO_NOT_MERGE. Requiere corrección antes de cualquier aprobación.

---

## Hallazgos MAYOR

### M-1 — `startCountdown()` llama `authService.logout()` al expirar el timer — viola design-decision.md Resolución 1

**Archivo**: `src/app/layout/components/idle-warning-dialog/idle-warning-dialog.component.ts`  
**Líneas**: 79–82

```typescript
// idle-warning-dialog.component.ts — startCountdown()
if (next <= 0) {
  this.stopCountdown();
  this.authService.logout().subscribe();   // ← VIOLA RESOLUCIÓN 1
  this.dialogRef.close();
  return 0;
}
```

**Contrato violado** — `design-decision.md` Resolución 1, veredicto explícito:
> *"Se elige la Opción A. `AuthService` añade un segundo `effect()` que llama `this.logout()` cuando `idleService.idle()` es `true`. El `IdleWarningDialogComponent` es responsable únicamente de la presentación visual del countdown y de ofrecer las acciones al usuario; **nunca llama `logout()` directamente**."*

**Regla de implementación derivada (Regla 9)**: *"Este `effect()` debe ser idempotente: debe verificar que `this._status() === 'authenticated'` antes de disparar el logout."*

**Impacto real**: La Opción B (dialog con countdown + llamada directa a logout) fue **explícitamente rechazada** porque produce un logout duplicado. En la implementación actual, al llegar t=15min, AMBOS mecanismos disparan simultáneamente:
1. El countdown interno del dialog llega a 0 → `authService.logout().subscribe()`  
2. `IdleService.idle()` → true → `AuthService.Effect #2` → `this.logout(...).subscribe()`

Esto crea una carrera entre dos flujos de logout concurrentes, exactamente el escenario descrito como riesgo en la Resolución 1.

**Nota**: La llamada a `authService.logout()` en `onLogout()` (botón "Cerrar sesión", línea 67) es correcta — es una acción explícita del usuario y está dentro del scope de presentación. Solo el auto-logout desde `startCountdown()` viola el contrato.

**Corrección**: Eliminar `this.authService.logout().subscribe()` y `this.dialogRef.close()` de la rama `next <= 0`. El dialog debe únicamente detenerse; el cierre ocurrirá automáticamente cuando `AuthService` llame `idleService.stop()` durante su secuencia de logout, lo que pone `warning()` a `false` y el effect de `LayoutComponent` cierra el dialog.

---

### M-2 — Valores tipográficos crudos en SCSS en lugar de tokens de Material Design (MAYOR-2 de Ronda 1, sin corregir)

**Archivo**: `src/app/layout/components/idle-warning-dialog/idle-warning-dialog.component.scss`

| Línea | Valor | Problema |
|---|---|---|
| 13 | `font-size: 20px` | Hardcoded; debe usar `mat.get-theme-typography(...)` o variable CSS de Material |
| 14 | `font-weight: 500` | Hardcoded |
| 18 | `font-size: 14px` | Hardcoded |
| 24 | `font-size: 48px` | Hardcoded |
| 25 | `font-weight: 700` | Hardcoded |

**Regla violada** — `styling.instructions.md`:
> *"Typography | Material `mat-*` classes"*  
> *"Material manages colors and typography. Tailwind manages layout."*

Los valores crudos de píxeles para tipografía eluden el sistema de theming de Material Design, igual que hacerlo con Tailwind. Los tamaños y pesos tipográficos deben mapearse a la escala de tipo de Material (e.g., `headline-medium`, `body-medium`, `display-large`) usando las variables CSS de theming:

```scss
// ❌ actual
.app-idle-warning-dialog-title {
  font-size: 20px;
  font-weight: 500;
}

// ✅ correcto — usar el type scale de Material
.app-idle-warning-dialog-title {
  font: var(--mat-sys-title-large);   // headline apropiada del design system
}

.app-idle-warning-dialog-countdown {
  font: var(--mat-sys-display-medium); // display para el número prominente
  font-variant-numeric: tabular-nums;
}
```

**Estado en Ronda 1**: MAYOR-2. Persiste sin cambios en Ronda 2.

---

### M-3 — Conversión `(this.authService as any)` innecesaria en `onExtend()` — type safety comprometida en producción

**Archivo**: `src/app/layout/components/idle-warning-dialog/idle-warning-dialog.component.ts`  
**Líneas**: 59–62

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
if (typeof (this.authService as any).resetIdleTimer === 'function') {
  this.authService.resetIdleTimer();
}
```

**Por qué este cast es incorrecto**:  
`AuthService` define `resetIdleTimer()` como método público en la línea 82 de `auth.service.ts`:
```typescript
resetIdleTimer(): void {
  this.idleService.resetCountdown();
}
```

El tipo inyectado del campo `private readonly authService = inject(AuthService)` ya incluye el método `resetIdleTimer`. Por lo tanto, el cast `as any` no es necesario para compilar ni en producción — `this.authService.resetIdleTimer()` es una llamada válida y type-safe.

**Causa real**: El mock de `AuthService` en el test del componente no expone `resetIdleTimer()`. La solución correcta es completar el mock de test, no debilitar el código de producción con `as any` para encubrir un mock incompleto. Además, los comentarios `eslint-disable` suprimen deliberadamente advertencias de tipo safety.

**Impacto**: El código de producción tiene type safety artificialmente degradada para acomodar una deficiencia de test. Viola el principio de que los tests no deben influir en la calidad del código de producción.

**Corrección**: Reemplazar el bloque por `this.authService.resetIdleTimer()` directamente. Si el test falla, actualizar el mock de `AuthService` en el spec para incluir `resetIdleTimer: vi.fn()`.

---

## Hallazgos MENOR

### Me-1 — `signal<any>(null)` en `LayoutComponent` — tipo no acotado

**Archivo**: `src/app/layout/layout.component.ts`  
**Línea**: 114

```typescript
private idleWarningDialogRef = signal<any>(null);
```

**Corrección**:
```typescript
import { MatDialogRef } from '@angular/material/dialog';
// ...
private idleWarningDialogRef = signal<MatDialogRef<IdleWarningDialogComponent> | null>(null);
```

---

### Me-2 — `dialogRef.afterClosed().subscribe()` sin `takeUntilDestroyed()` en `LayoutComponent`

**Archivo**: `src/app/layout/layout.component.ts`  
**Líneas**: 129–131

```typescript
dialogRef.afterClosed().subscribe(() => {
  this.idleWarningDialogRef.set(null);
});
```

Aunque `LayoutComponent` es efectivamente un singleton, el patrón correcto per `review-code/SKILL.md` es usar `takeUntilDestroyed()` para evitar potenciales memory leaks en tests o en escenarios de re-mount:

```typescript
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// En el constructor, pre-crear el ref:
private readonly destroyRef = inject(DestroyRef);

// Al suscribirse:
dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
  this.idleWarningDialogRef.set(null);
});
```

---

### Me-3 — `SessionSyncService` omite el log de `AuditService` en modo fallback — desviación de Resolución 5

**Archivo**: `src/app/core/auth/services/session-sync.service.ts`  
**Líneas**: 23–34

El `design-decision.md` Resolución 5 especifica explícitamente:
> *"Si `supported === false`: registrar un warning en `AuditService` con el mensaje `'BroadcastChannel not supported; multi-tab session sync disabled'`"*

La implementación activa el modo no-op correctamente pero **omite el log de auditoría**. El servicio ni siquiera inyecta `AuditService`. Esta omisión no está documentada en `dev-decisions.md`.

**Corrección**: Inyectar `AuditService` y llamar `auditService.record({ action: 'broadcast_channel_unsupported', ... })` en el path de fallback.

---

### Me-4 — `LayoutComponent` sin `ChangeDetectionStrategy.OnPush` (archivo en scope, modificado en este PR)

**Archivo**: `src/app/layout/layout.component.ts`  
**Línea**: 17 (decorador `@Component`)

El componente fue modificado en este PR para agregar el effect de idle dialog. El nuevo effect usa `signal()` — el patrón más eficiente con `OnPush`. Sin embargo, el `@Component` no declara `changeDetection: ChangeDetectionStrategy.OnPush`, lo que anula ese beneficio. Es una violación de la convención del proyecto per `components.instructions.md` y per el skill (`ChangeDetectionStrategy.OnPush missing | ⚠️ Warning`).

---

## Ronda 1 — Estado de cada hallazgo

| v1 MAYOR | Estado | Notas |
|---|---|---|
| MAYOR-1 (design-test conflict: logout desde component) | ⚠️ Parcialmente resuelto → **nuevo MAYOR M-1** | `AuthService.Effect #2` implementado ✅. Pero `startCountdown()` sigue llamando `authService.logout()` al expirar ❌. Duplica el logout contra la Resolución 1. |
| MAYOR-2 (raw CSS values) | ❌ Sin corregir → **MAYOR M-2** | `font-size` y `font-weight` en píxeles crudos sin cambio respecto a Ronda 1. |
| MAYOR-3 (template methods públicos) | ✅ Corregido | `onExtend()` y `onLogout()` declarados `protected`. |
| MAYOR-4 (OnPush faltante) | ✅ Corregido | `IdleWarningDialogComponent` tiene `ChangeDetectionStrategy.OnPush`. |
| MAYOR-5 ($localize sin @@id) | ❌ Sin corregir → **BLOQUEANTE B-1** | Ningún string usa `$localize`. Dev documentó la decisión de no implementarlo con una justificación técnica incorrecta. |
| MAYOR-6 (LoginComponent.resolveErrorMessage no eliminado) | ⚠️ Reclasificado a MENOR | El método sigue presente (línea 102 de `login.component.ts`). Sin embargo, dado que `AuthService` ahora normaliza los 401, el método opera exclusivamente como helper de display para otros errores. Sin impacto de seguridad. El Dev no lo menciona en ningún artefacto. |

---

## Análisis adicional — Diseño arquitectónico

### Lo que funciona bien

- **Screaming architecture**: `IdleWarningDialogComponent` en `layout/components/`, `SessionSyncService` en `core/auth/services/` — correcto.
- **Dirección de dependencias**: `layout/ → core/auth/` — sin inversiones detectadas.
- **SOLID en servicios**: `IdleService`, `SessionSyncService` y `AuthService` tienen responsabilidades bien delimitadas.
- **Patrón 5-file**: Presente en `idle-warning-dialog/` (5 archivos, incluyendo spec y model).
- **COMPONENT_DEFAULTS**: `IDLE_WARNING_DIALOG_DEFAULTS` en `.model.ts` ✅.
- **Visibilidad de miembros**: `onExtend()`, `onLogout()`, `countdownDisplay` son `protected` ✅.
- **`data-testid`**: Los 4 elementos interactivos del dialog están marcados ✅.
- **MockAuthProvider**: Reemplazado correctamente con `private sessionActive = false` ✅.
- **GAP-4 (error normalization)**: `AuthService.login()` normaliza correctamente el 401 ✅.
- **GAP-1 (idle lifecycle)**: `AuthService.Effect #1` para start/stop de `IdleService` ✅.
- **Stubs actualizados**: `idle.service.stub.ts` y `session-sync.service.stub.ts` con Signal API correcta ✅.
- **BroadcastChannel fallback**: Feature detection implementada ✅.

### Aspectos cuestionables que no bloquean merge per se

- `IdleWarningDialogComponent` inyecta `AuthService` directamente en lugar de abstraerse detrás de una interfaz. Esto es aceptable dado que `AuthService` ya es la abstracción del dominio auth en este proyecto.
- El `LayoutComponent` inyecta tanto `IdleService` para observar `warning()` como abre el dialog de `IdleWarningDialogComponent`. Este acoplamiento fue explícitamente aprobado en la Resolución 3 del diseño.

---

## Recomendación de merge

- [x] `DO_NOT_MERGE: Hallazgo BLOQUEANTE B-1 — strings visibles sin $localize@@id (components.instructions.md + SKILL.md ❌ Blocker). Adicionalmente: MAYOR M-1 (dialog llama logout al expirar countdown, viola Resolución 1 del design-decision.md), MAYOR M-2 (tipografía en píxeles crudos, MAYOR-2 de Ronda 1 sin corregir), MAYOR M-3 (as any cast innecesario que compromete type safety en producción).`

---

## Acciones requeridas para siguiente iteración

El Dev Agent debe corregir en este orden de prioridad:

1. **[B-1 — BLOQUEANTE]** Mover los 4 strings del template a propiedades `protected` con `$localize` y `@@id` en la clase del componente.

2. **[M-1 — MAYOR]** Eliminar `this.authService.logout().subscribe()` y `this.dialogRef.close()` de la rama `next <= 0` en `startCountdown()`. Dejar que `AuthService.Effect #2` (ya implementado) gestione el logout automático.

3. **[M-2 — MAYOR]** Reemplazar `font-size` y `font-weight` con píxeles crudos en el SCSS por variables CSS del type scale de Material Design (`--mat-sys-*` o equivalente en el tema configurado del proyecto).

4. **[M-3 — MAYOR]** Eliminar la conversión `as any` y el defensive check. Llamar `this.authService.resetIdleTimer()` directamente. Actualizar el mock de `AuthService` en el spec del dialog para incluir `resetIdleTimer: vi.fn()`.

5. **[Me-1]** Tipar `idleWarningDialogRef` correctamente en `LayoutComponent`.

6. **[Me-2]** Agregar `takeUntilDestroyed()` a la suscripción de `afterClosed()`.

7. **[Me-3]** Inyectar `AuditService` en `SessionSyncService` y registrar el warning cuando BroadcastChannel no está soportado.

---

## Estado del contexto

- [x] Completé esta revisión con contexto completo — todos los 16 archivos fueron abiertos y analizados línea a línea.

---

## Checklist de completitud

- [x] Se auditó coherencia con screaming architecture
- [x] Se verificaron SOLID, DRY, acoplamiento entre capas
- [x] Se revisaron las decisiones autónomas del Dev contra el diseño aprobado
- [x] Todos los hallazgos están clasificados (BLOQUEANTE / MAYOR / MENOR)
- [x] La recomendación de merge está presente y es una de las tres opciones válidas
- [x] El "Estado del contexto" está completado

---

## Nivel de confianza

**Alto**

Justificación: Todos los 16 archivos fueron leídos directamente. Los hallazgos citan líneas específicas verificadas manualmente. Las reglas de referencia fueron cargadas desde los archivos de instrucciones y el skill. No hubo saturación de contexto. Los hallazgos de Ronda 1 se verificaron contra el código actual, no contra afirmaciones del Dev Agent.
