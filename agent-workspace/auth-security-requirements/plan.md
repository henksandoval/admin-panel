# Plan de validación técnica — auth-security-requirements

> Generado por: Tech Lead Agent  
> Artefactos auditados: `spec.md` · `design-decision.md`

---

## Resumen de la validación

El diseño es arquitectónicamente sólido en sus cuatro decisiones principales y cubre correctamente ~80% de los criterios del spec que ya están implementados. Sin embargo, **dos hallazgos MAYOR bloquean el avance a QA**: (1) ningún artefacto está designado para reaccionar al signal `IdleService.idle` y ejecutar el logout automático cuando expira el countdown, y (2) el `MatDialog` para inactividad no especifica `disableClose: true`, lo que permite que un ESC cierre el dialog silenciosamente dejando la sesión en un estado de advertencia sin salida observable.

---

## Checklist de auditoría

- [x] Violaciones de SOLID detectadas *(2 hallazgos MENOR — SRP de AuthService y DIP en normalización de errores; documentados abajo)*
- [x] Acoplamiento entre capas no definido en `architectural-principles.instructions.md` *(ninguno prohibido; 1 inconsistencia MENOR documentada)*
- [x] Edge cases de la spec no cubiertos en el diseño *(1 hallazgo MAYOR — criterio "logout automático en 2 minutos" sin subscriber definido)*
- [x] Impacto en features existentes (cross-feature impact) no considerado *(guards y interceptor no afectados; GAP-5 MockAuthProvider fuera de scope de modificación — 1 hallazgo MENOR)*
- [x] Dependencias circulares potenciales *(ninguna — AuthService → IdleService es unidireccional; confirmado por código existente)*
- [x] Inconsistencias con `styling.instructions.md` o `testing.instructions.md` *(1 hallazgo MENOR — Rule 7 sobre data-testid contradice el mandato de styling.instructions.md)*

---

## Hallazgos clasificados

### BLOQUEANTE

Ninguno.

---

### MAYOR

#### MAYOR-1 — `IdleService.idle` signal no tiene subscriber: el logout automático nunca se dispara

**Descripción del problema:**  
El diseño define que `AuthService` usará un `effect()` que reacciona a `_status` para llamar `idleService.start()` / `idleService.stop()`. Define también que `LayoutComponent` usará un `effect()` que reacciona a `IdleService.warning()` para abrir el dialog. Pero **ningún artefacto del diseño está designado para reaccionar a `IdleService.idle`** (el signal que se activa a t=15min cuando el countdown de 2 minutos expira).

`IdleService` emite dos signals con semánticas distintas:
- `warning` (t=13min) → `LayoutComponent` abre dialog ✓ especificado
- `idle` (t=15min) → ??? **no especificado**

El diseño describe el comportamiento observable *"Al no actuar durante los 2 minutos del dialog, el usuario es redirigido a `/auth/login`"* pero no especifica qué código lo produce. Hay dos interpretaciones mutuamente excluyentes:

**Opción A — El dialog gestiona su propio countdown:**  
`IdleWarningDialogComponent` tiene su propio timer interno de 2 minutos. Al llegar a cero, el dialog llama `authService.logout()`. En este caso `IdleService.idle` es dead code (se setea a `true` pero nadie lo lee).

**Opción B — `AuthService` reacciona a `IdleService.idle`:**  
`AuthService` tiene un segundo `effect()` que llama `this.logout()` cuando `idleService.idle()` es `true`. En este caso el dialog muestra el countdown visualmente pero no dispara el logout por sí mismo.

Ambas opciones son válidas, pero la elección tiene consecuencias concretas en testing, separación de responsabilidades y en si `IdleService.idle` permanece como dead code.

**Riesgo concreto en los próximos 12 meses:**  
Un Dev Agent que implementa estrictamente lo documentado (un `effect()` para `_status`) no añadirá ningún subscriber para `IdleService.idle`. El criterio del spec *"Dado que un usuario recibe la advertencia de inactividad y NO toma acción en 2 minutos... la sesión se cierra automáticamente"* fallará en QA. Los 3 criterios de expiración por inactividad quedan en riesgo.

**Recomendación:**  
El Architect debe elegir una opción explícitamente y documentarla en las restricciones de implementación. La opción más limpia para evitar dead code es: `AuthService` añade un segundo `effect()` que observa `idleService.idle()` y llama `this.logout('/auth/login')`. El dialog solo muestra el countdown visualmente y se cierra cuando el dialog ref detecta que el servicio ya hizo logout. Esto mantiene el principio de que solo `AuthService` toma decisiones de sesión.

---

#### MAYOR-2 — `MatDialog.disableClose` no especificado: el dialog puede cerrarse con ESC rompiendo la garantía "bloqueante"

**Descripción del problema:**  
El diseño justifica la elección del MatDialog bloqueante con: *"El foco es capturado por el modal; el usuario no puede ignorarlo sin interactuar."* Sin embargo, la configuración default de `MatDialog` tiene `disableClose: false`, lo que significa que ESC o un click en el backdrop cierra el dialog sin pasar por ninguno de los dos botones.

Si el usuario presiona ESC:
1. El dialog se cierra.
2. `IdleService.warning` permanece en `true` (el signal no cambió).
3. El `effect()` en `LayoutComponent` NO se re-ejecuta (el signal tiene el mismo valor que tenía cuando disparó la apertura del dialog).
4. El dialog no se reabre.
5. Si `IdleService.idle` no tiene subscriber (MAYOR-1), nada hace logout.
6. Si tiene subscriber, el usuario es expulsado sin haber visto nunca los 2 minutos de advertencia.

En ambos casos el criterio del spec *"se le muestra una advertencia de sesión por expirar **con opción** de extender o cerrar sesión"* queda sin cumplir: el usuario no tuvo opción porque el dialog desapareció.

**Riesgo concreto en los próximos 12 meses:**  
Este es un comportamiento habitual de los usuarios (ESC para cerrar ventanas). En un test de aceptación manual o e2e, un QA que presione ESC en el dialog de inactividad verá que la sesión expira sin warning visible. Es un defecto de seguridad observable.

**Recomendación:**  
Añadir `disableClose: true` a la configuración del `MatDialog.open()` en `LayoutComponent`. Documentarlo explícitamente en la Regla 3 o como Regla 9 en las restricciones de implementación del design-decision.md. Adicionalmente, el `effect()` de `LayoutComponent` debería verificar si el dialog ya está abierto antes de abrirlo de nuevo (guardar la referencia `MatDialogRef` para evitar múltiples instancias si el signal se re-evalúa).

---

### MENOR

#### MENOR-1 — Contradicción interna: reasoning dice `core/auth/` pero file structure dice `layout/components/`

**Descripción:** La sección de trade-offs de la Decisión 1 afirma literalmente: *"al ser un concern de seguridad de sesión, pertenece a `core/auth/` como componente secundario."* Pero la sección "Estructura de archivos nueva" ubica el componente en `src/app/layout/components/idle-warning-dialog/`.

Ambas ubicaciones son legalmente compatibles con `architectural-principles.instructions.md` (layout puede depender de core; core puede tener componentes internos). El problema no es la ubicación elegida, sino que la documentación de razonamiento y la decisión efectiva apuntan a lugares distintos.

**Riesgo:** Un Dev Agent que lea el razonamiento creará el archivo en `core/auth/`. Uno que lea la estructura de archivos lo creará en `layout/`. El Architect debe hacer consistente el texto con la ubicación elegida.

**Recomendación:** Si se elige `layout/components/` (como indica la estructura), actualizar el texto del trade-off para reflejar esa justificación. Si se prefiere `core/auth/components/` (como sugiere el texto), actualizar la estructura de archivos.

---

#### MENOR-2 — GAP-5 (`MockAuthProvider` usa localStorage) identificado pero excluido de los archivos a modificar

**Descripción:** El diseño identifica correctamente GAP-5 con severidad baja. Sin embargo, `mock-auth.provider.ts` no aparece en la sección "Archivos a modificar". La corrección más simple (reemplazar `localStorage.setItem(this.SESSION_KEY, 'active')` por una variable en memoria) es trivial y debería incluirse.

**Riesgo:** Cualquier Vitest test que use `MockAuthProvider` y verifique el criterio *"el token NO está visible en localStorage/sessionStorage como texto plano"* fallará. Los tests de `AuthService` que usan el mock provider en desarrollo podrán pasar en CI/CD pero fallar en auditorías de seguridad manual.

**Recomendación:** Añadir `mock-auth.provider.ts` a la lista de archivos a modificar con una nota: reemplazar `localStorage` por un `private session = signal(false)` en memoria.

---

#### MENOR-3 — `BroadcastChannel` no tiene fallback documentado para el 3% de browsers sin soporte

**Descripción:** El diseño reconoce que `BroadcastChannel` puede no estar disponible en jsdom (Vitest), pero no documenta qué debe hacer `SessionSyncService` si `typeof BroadcastChannel === 'undefined'` en producción.

**Riesgo:** En el 3% de navegadores sin soporte (navegadores muy antiguos, algunos WebViews), el constructor `new BroadcastChannel('session')` lanza `ReferenceError` y rompe la inicialización del servicio. Dado que `SessionSyncService` será `providedIn: 'root'`, este error podría impedir el arranque de la aplicación.

**Recomendación:** Añadir en la Regla 4 de restricciones de implementación: *"Si `typeof BroadcastChannel === 'undefined'`, el servicio debe registrar un warning en `AuditService` y operar en modo no-op (no emitir ni suscribir). La sincronización multi-tab queda degradada pero la aplicación continúa funcionando."*

---

#### MENOR-4 — La Regla 7 sobre `data-testid` contradice `styling.instructions.md`

**Descripción:** La Regla 7 en las restricciones de implementación dice: *"El Developer Agent NO los debe definir al construir el template — esto será provisto como parte del siguiente artefacto de QA."* La instrucción `styling.instructions.md` dice: *"All interactive elements and key content areas **must have `data-testid` attributes**"* y `testing.instructions.md` dice: *"If the template does not have `data-testid`, add it before writing the test."*

La intención del diseño (que QA especifique los testids, luego el Developer los añada) es razonable como secuencia de pipeline. El problema es el verbo: *"NO los debe definir"* puede ser interpretado por el Dev Agent como "nunca añadas testids al template" en lugar de "no los inventes por tu cuenta, úsalos desde el artefacto de QA."

**Recomendación:** Cambiar la Regla 7 a: *"El Developer Agent debe aplicar exactamente los `data-testid` que especifique el QA Agent. No debe definirlos por cuenta propia. Los templates deben construirse con los placeholders listos para recibirlos antes de que el Dev Agent aplique el artefacto de QA."*

---

#### MENOR-5 — `AuthService` acumula 12+ responsabilidades post-implementación (SRP degradado)

**Descripción:** Post-implementación, `AuthService` coordinará: login, logout, session check, token refresh scheduling, role/permission queries, password reset (×2), user registration, audit recording, idle lifecycle management (nuevo `effect()`), error normalization, session sync broadcasting, y (si se adopta la recomendación de MAYOR-1) reaction to idle expiry. Son 12+ razones de cambio en una sola clase.

**Riesgo en 12 meses:** Cualquier cambio en la política de idle (ej: agregar MFA tier que extiende el timeout) requiere tocar el mismo archivo que maneja registro de usuarios. Los tests de `AuthService` ya son complejos; añadir idle + sync los hará más frágiles. No es un bloqueante hoy, pero el diseño debería documentar un umbral de extracción (ej: "Si AuthService supera N métodos públicos, extraer IdleOrchestrator y/o SessionSyncCoordinator").

**Recomendación:** Añadir una nota en el diseño: *"Si en iteraciones futuras se añaden más concerns de sesión, considerar extraer `SessionLifecycleService` que encapsule start/stop de idle, reacción a idle expiry, y broadcast de sync."*

---

## ✅ Decisiones de diseño aprobadas

| Decisión | Veredicto |
|---|---|
| **Decisión 1 — Dialog/Modal bloqueante (MatDialog)** | Arquitectónicamente sólida; el spec requiere acción explícita del usuario. Pendiente de corrección MAYOR-2 (disableClose). |
| **Decisión 2 — BroadcastChannel para multi-tab sync** | Arquitectónicamente sólida; única alternativa viable dado que localStorage está prohibido por el spec. |
| **Decisión 3 — Normalización de errores en AuthService** | Arquitectónicamente sólida como política de seguridad centralizada. La violación DIP (MENOR) es un trade-off documentado y aceptable. |
| **Decisión 4 — IdleService lifecycle gestionado en AuthService con effect()** | Arquitectónicamente sólida; el ciclo de vida de idle es parte del ciclo de vida de sesión. Pendiente de extensión para cubrir `IdleService.idle` (MAYOR-1). |

---

## 🛠️ Secuencia de implementación (post-revisión)

Una vez que el Architect resuelva MAYOR-1 y MAYOR-2, la secuencia de implementación recomendada es:

### Paso 1 — `SessionSyncService` (nuevo archivo, sin dependencias en código nuevo)
**Archivo:** `src/app/core/auth/services/session-sync.service.ts`  
**Responsabilidad:** Encapsular `BroadcastChannel('session')`. Exponer `broadcast(event: SessionSyncEvent): void` y `events$: Observable<SessionSyncEvent>`. Implementar `ngOnDestroy()` para cerrar el channel. Añadir fallback no-op si `BroadcastChannel` no está disponible (MENOR-3). Añadir a `src/app/core/auth/services/index.ts`.

### Paso 2 — `MockAuthProvider` (modificación de archivo existente)
**Archivo:** `src/app/core/auth/providers/mock/mock-auth.provider.ts`  
**Responsabilidad:** Reemplazar `localStorage.setItem/getItem/removeItem(this.SESSION_KEY, ...)` por un `private sessionActive = false` en memoria. Sin cambios en la interfaz pública. Resuelve GAP-5.

### Paso 3 — `AuthService` — integración de IdleService + SessionSyncService + error normalization
**Archivo:** `src/app/core/auth/services/auth.service.ts`  
**Responsabilidad:**
- Inyectar `IdleService` y `SessionSyncService`
- Añadir `effect()` #1: reacciona a `_status` → llama `idleService.start()`/`idleService.stop()`
- Añadir `effect()` #2 (resolver MAYOR-1): reacciona a `idleService.idle()` → llama `this.logout(AUTH_DEFAULTS.loginRoute).subscribe()`
- Modificar `clearSession()`: llamar `this.sessionSync.broadcast({ type: 'SESSION_CLEARED' })` antes de la navegación
- Modificar `login()` en `catchError`: normalizar errores HTTP (`401` → credenciales genéricas, `5xx` → error de sistema, `ProgressEvent/sin status` → error de red). **Nunca propagar `error.message` raw.**
- Suscribirse a `sessionSync.events$` en constructor/`effect()`: cuando recibe `SESSION_CLEARED`, llamar `clearSession(AUTH_DEFAULTS.loginRoute)` sin volver a hacer broadcast (evitar loop)

### Paso 4 — `idle-warning-dialog.model.ts` (nuevo archivo)
**Archivo:** `src/app/layout/components/idle-warning-dialog/idle-warning-dialog.model.ts`  
**Responsabilidad:** Definir `IDLE_WARNING_DIALOG_DEFAULTS` con `warningDurationMs`, `extendLabel` y `logoutLabel`. Definir el tipo `IdleWarningDialogData` con `warningDurationMs: number`. Todos los strings de UI deben usar `$localize` con `@@id`.

### Paso 5 — `IdleWarningDialogComponent` (nuevo componente — 4 archivos)
**Archivos:**
- `src/app/layout/components/idle-warning-dialog/idle-warning-dialog.component.ts`
- `src/app/layout/components/idle-warning-dialog/idle-warning-dialog.component.html`
- `src/app/layout/components/idle-warning-dialog/idle-warning-dialog.component.scss`
- `src/app/layout/components/idle-warning-dialog/idle-warning-dialog.component.spec.ts`

**Responsabilidades del componente `.ts`:**
- Inyectar `MatDialogRef<IdleWarningDialogComponent>` y `MAT_DIALOG_DATA` (tipo `IdleWarningDialogData`)
- Inyectar `AuthService` para el botón "Cerrar sesión"
- Signal `protected readonly secondsRemaining` con countdown calculado desde `data.warningDurationMs`
- Signal `protected readonly displayTime = computed(() => ...)` para formato MM:SS
- Método `protected onExtend(): void` — cierra el dialog con resultado `'extended'` (el click en document propagará y reseteará el idle timer automáticamente via DOM event listener del IdleService)
- Método `protected onLogout(): void` — cierra el dialog y llama `authService.logout().subscribe()`
- Usar `COMPONENT_DEFAULTS` pattern con `IDLE_WARNING_DIALOG_DEFAULTS`

**Restricciones de template:**
- Clases CSS prefijadas con `app-idle-warning-dialog-`
- Colores via Material tokens, layout via Tailwind utilities
- `data-testid` aplicados según especificación del artefacto QA (NO inventarlos; dejar los elementos listos para recibirlos)

### Paso 6 — `LayoutComponent` (modificación de archivo existente)
**Archivo:** `src/app/layout/layout.component.ts`  
**Responsabilidad:**
- Inyectar `IdleService`, `MatDialog`
- Añadir `private dialogRef: MatDialogRef<IdleWarningDialogComponent> | null = null`
- Añadir `effect()`: cuando `idleService.warning()` es `true` Y `this.dialogRef === null`, llamar `this.dialogRef = this.dialog.open(IdleWarningDialogComponent, { disableClose: true, data: { warningDurationMs: AUTH_DEFAULTS.idleWarningMs } })`. Suscribirse al `afterClosed()` para limpiar `this.dialogRef = null`. **Resolver MAYOR-2 aquí.**
- No gestionar start/stop del IdleService (responsabilidad de AuthService)

### Paso 7 — `LoginComponent` (modificación de archivo existente)
**Archivo:** `src/app/features/auth/pages/login/login.component.ts`  
**Responsabilidad:**
- Eliminar el método `private resolveErrorMessage()` (o cualquier lógica de normalización de HttpErrorResponse)
- El `errorMessage` signal se asigna directamente desde el error que llega de `AuthService.login()` (que ya viene normalizado)
- Verificar que el template mantiene `data-testid="login-error-message"` existente

### Paso 8 — Verificación de stubs de test
**Archivos:** `src/tests/stubs/` (verificar existencia; crear si no existen)  
**Responsabilidad:**
- Verificar si existe un stub reutilizable para `IdleService`. Si no, crear `idle.service.stub.ts` con `warning = signal(false)`, `idle = signal(false)`, `start = vi.fn()`, `stop = vi.fn()`
- Verificar si existe stub para `SessionSyncService`. Si no, crear `session-sync.service.stub.ts`
- Actualizar `auth.service.stub.ts` si existe, para exponer métodos nuevos (`logout` como `vi.fn()`)
- Estos stubs son los únicos que el Dev Agent y QA Agent usarán; no crear mocks locales en spec files

---

## Estimación de complejidad

| Dimensión | Valor |
|---|---|
| **Confianza** | Media (baja post-resolución de MAYOR-1 y MAYOR-2) |
| **Scope** | 10 archivos (9 del Architect + `mock-auth.provider.ts` de MENOR-2; posiblemente +2 stubs nuevos) |
| **Nivel de riesgo** | Medio |

**Justificación de "Medio" y no "Alto":**  
El riesgo no es alto porque ~80% de los criterios del spec ya están implementados y validados. El trabajo nuevo (GAP-1 a GAP-4) es acotado: 1 servicio nuevo, 1 componente nuevo, 3 modificaciones. La complejidad técnica de `BroadcastChannel` y `MatDialog` es baja — ambas son APIs estándar con documentación extensa. El riesgo es "Medio" (no "Bajo") por los dos hallazgos MAYOR que, si no se resuelven, harían que los criterios de inactividad fallaran silenciosamente en QA, requiriendo una iteración adicional.

---

## Qué necesita saber el QA Agent

### Las 4 brechas y cómo las cubre este diseño

| Brecha | Criterios del spec afectados | Cobertura en el diseño |
|---|---|---|
| **GAP-1** — IdleService nunca se inicia | 3 criterios de expiración por inactividad | `AuthService.effect()` llama `idleService.start()` en transición a `authenticated`. **Pendiente:** designar subscriber para `idleService.idle()` (MAYOR-1) |
| **GAP-2** — Sin UI de advertencia de inactividad | "advertencia con opción de extender o cerrar sesión" | `IdleWarningDialogComponent` abierto por `LayoutComponent` cuando `IdleService.warning()` es true. **Pendiente:** `disableClose: true` (MAYOR-2) |
| **GAP-3** — Sin sync multi-tab | "todas las pestañas detectan la expiración" | `SessionSyncService` con `BroadcastChannel`. `clearSession()` broadcast → otras pestañas llaman `clearSession()` |
| **GAP-4** — Mensajes de error no normalizados | Error handling + requisito no funcional de mensajes | `AuthService.login()` normaliza `401`/`5xx`/`ProgressEvent` antes de propagar |

### Restricciones de entorno que QA debe conocer

- **GAP-5 (`MockAuthProvider`):** Si los tests e2e o de integración usan `MockAuthProvider`, la verificación de "no localStorage" fallará hasta que se aplique MENOR-2. Los tests de `SessionSyncService` en Vitest requieren mock de `BroadcastChannel` (no disponible en jsdom por defecto).
- **Countdown timer:** El `IdleWarningDialogComponent` muestra un countdown en tiempo real. Los tests de countdown requieren `vi.useFakeTimers()` y avance manual del reloj — documentar en el spec del componente.
- **Multi-tab sync:** No es verificable en Vitest. Los tests de `SessionSyncService.broadcast()` deben verificar que `postMessage` es llamado con el payload correcto, no el comportamiento cross-tab real (eso es materia de test e2e con Playwright usando dos contextos de browser).

### Criterios de aceptación que dependen de nuevos elementos UI (necesarios para data-testid)

Los siguientes criterios requieren nuevos elementos interactivos en `IdleWarningDialogComponent`:

| Criterio del spec | Elemento UI nuevo | data-testid sugerido (para QA) |
|---|---|---|
| "advertencia de sesión por expirar con opción de extender o cerrar sesión" | Dialog container | `idle-warning-dialog` |
| "temporizador de cuenta regresiva visible" | Display de countdown | `idle-warning-countdown` |
| "botón primario Mantener sesión activa" | Botón de extensión | `idle-warning-extend-button` |
| "botón secundario Cerrar sesión" | Botón de logout | `idle-warning-logout-button` |
| "si NO toma acción en 2 minutos → redirect a login" | (no UI nueva; requiere fake timer en test) | — |

Los criterios de **error de login** dependen de `data-testid="login-error-message"` ya existente en `LoginComponent`. El QA Agent debe verificar que los tres mensajes normalizados son observables en ese elemento.

---

## Veredicto

- [ ] `APPROVED`
- [x] `NEEDS_REVISION: Dos hallazgos MAYOR deben ser resueltos por el Architect antes de avanzar a QA: (MAYOR-1) el diseño no designa ningún artefacto para reaccionar a IdleService.idle y disparar el logout automático al expirar el countdown de 2 minutos; (MAYOR-2) el MatDialog de inactividad no especifica disableClose: true, lo que permite cerrarlo con ESC dejando la sesión en estado de advertencia sin salida observable. Ambos violan directamente criterios del spec sobre expiración por inactividad.`

---

## Estado del contexto

- [x] Completé esta auditoría con contexto completo
- [ ] Mi contexto estaba parcialmente saturado al auditar las siguientes secciones

Se leyeron y analizaron: `spec.md`, `design-decision.md` (completo), `architectural-principles.instructions.md`, `styling.instructions.md`, `testing.instructions.md`, `auth.service.ts`, `idle.service.ts`, `auth.interceptor.ts`, `auth.guard.ts` (todos los guards), `mock-auth.provider.ts`, `layout.component.ts`, y la estructura de directorios de `src/app/core/auth/` y `src/app/features/`.
