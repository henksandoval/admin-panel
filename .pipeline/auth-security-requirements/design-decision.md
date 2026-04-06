# Design Decision — auth-security-requirements

<!-- STATUS: APPROVED -->

---

## Auditoría de implementación existente

Antes de proponer enfoques, se auditó la implementación actual contra los 30+ criterios de la spec. La arquitectura existente cubre la mayoría del comportamiento requerido. Los resultados del audit son el insumo directo para las decisiones de diseño.

### ✅ Ya implementado (no requiere trabajo nuevo)

| Criterio del spec | Implementación existente |
|---|---|
| Redirección al login sin autenticación | `authGuard` → `router.createUrlTree([loginRoute], { queryParams: { returnUrl } })` |
| No procesar URL protegida sin token | `authGuard` espera `status !== 'checking'` antes de decidir, bloquea la navegación |
| Sesión no falsificada en recarga | `checkSession()` llama `refreshAccessToken()` (cookie HttpOnly), falla silenciosamente a `unauthenticated` |
| Login exitoso redirige al panel | `AuthService.login()` navega a `returnUrl ?? AUTH_DEFAULTS.redirectAfterLogin` |
| Sesión persiste entre recargas | `InitializationService.initialize()` llama `checkSession()` en app initializer |
| Token en memoria, no en localStorage | `_accessToken` es un Signal en memoria; refresh token está en cookie HttpOnly (`withCredentials: true`) |
| Renovación automática de token (60s antes) | `scheduleTokenRefresh()` programa `setTimeout` con `expiresAt - now - 60_000` |
| 401 → intento de refresh → reintentar petición | `authInterceptor.handle401()` implementa el patrón refresh-and-retry con cola de peticiones pendientes |
| Token vencido completamente → login con mensaje | Refresh fallido en `handle401` llama `authService.logout('/critical-errors/session-expired')` |
| Logout destruye sesión (memoria + cookie) | `clearSession()` setea a null los Signals; provider llama `/auth/logout` con `withCredentials: true` |
| Logout funciona aunque la API falle | `catchError` en `AuthService.logout()` llama `clearSession()` de todas formas |
| Post-logout, URL protegida redirige al login | `authGuard` evalúa `status === 'unauthenticated'` correctamente |
| Rol "Viewer" bloqueado en funciones "Admin" | `roleGuard` + `HasRoleDirective (*appHasRole)` redirigen a `/errors/unauthorized` |
| Múltiples roles evaluados correctamente | `requireAll` flag en `roleGuard` y `HasRoleDirective`, `hasAnyRole()` en `AuthService` |
| Permiso específico requerido para acción | `permissionGuard` + `HasPermissionDirective (*appHasPermission)` con flag `requireAll` |
| Múltiples permisos requeridos simultáneamente | `requireAllPermissions` flag en `permissionGuard` |
| Error de credenciales → mensaje de error | `LoginComponent` muestra `errorMessage` signal con `data-testid="login-error-message"` |
| Página "Sesión expirada" existe | `SessionExpiredComponent` en `/critical-errors/session-expired` |
| Página "Acceso denegado" existe | `UnauthorizedComponent` en `/errors/unauthorized` + `AccessDeniedComponent` |
| Auditoría de eventos de sesión | `AuditService.record()` llamado en login, logout, password_reset, token_refresh_failure |
| Recuperación de contraseña (formulario + enlace) | `ForgotPasswordComponent` + `ResetPasswordComponent` + métodos en `AuthService` |
| Registro de usuarios | `RegisterComponent` + `AuthService.register()` |

### ❌ Brechas identificadas (requieren implementación nueva)

| Brecha | Severidad | Criterios afectados |
|---|---|---|
| **GAP-1**: `IdleService` nunca se inicia ni se detiene — `start()` no es llamado en ningún lugar | Crítica | Expiración por inactividad (3 criterios) |
| **GAP-2**: Sin UI de advertencia de inactividad — `IdleService._warning` emite pero nadie lo consume para mostrar diálogo | Crítica | "advertencia con opción extender o cerrar sesión" |
| **GAP-3**: Sin sincronización multi-pestaña — si una pestaña expira, las demás no lo saben | Media | Token security (criterio multi-tab) |
| **GAP-4**: Mensajes de error de login no normalizados — `err.message` se pasa directamente, podría revelar si un usuario existe | Media | Error handling + Requisito no funcional de mensajes |
| **GAP-5** (dev): `MockAuthProvider` usa `localStorage` para persistir sesión mock | Baja | Token security (solo afecta entorno de desarrollo) |

---

## Decisión 1 — Idle Warning UI: Modal bloqueante vs. Toast no bloqueante vs. Banner inline

### Enfoque A — Dialog/Modal bloqueante (Angular Material `MatDialog`)

**Descripción:** Cuando `IdleService.warning` se activa, se abre un `MatDialog` que ocupa el centro de la pantalla con un temporizador de cuenta regresiva (2 minutos), un botón primario "Mantener sesión activa" y un botón secundario "Cerrar sesión". El foco es capturado por el modal; el usuario no puede ignorarlo sin interactuar.

**Trade-offs:**
- Extensibilidad: Fácil añadir más botones o lógica al dialog en el futuro; el componente es autónomo
- Testeabilidad: Se puede testear en aislamiento via `MatDialogRef` mock; el componente no tiene dependencias de layout
- Coherencia arquitectónica: El dialog vive en `layout/` o en un subfolder de `core/auth/` — ambos son válidos dado que el LayoutComponent lo instanciaría; al ser un concern de seguridad de sesión, pertenece a `core/auth/` como componente secundario
- Lazy loading: No bloquea el bundle inicial; se puede importar dentro del `LayoutComponent` que ya es lazy

### Enfoque B — Toast/Notificación no bloqueante (NotificationService existente)

**Descripción:** Cuando `IdleService.warning` se activa, se llama `NotificationService.warning()` con un mensaje de advertencia y duración de 2 minutos. No hay botones de acción; el usuario debe hacer clic en cualquier lugar para resetear el timer o esperar a que expire.

**Trade-offs:**
- Extensibilidad: Simple, reutiliza infraestructura existente. Pero el `NotificationService` actual (BehaviorSubject + Toast interface) no soporta acciones/botones en el toast
- Testeabilidad: Fácil de testear pero no verifica comportamiento de acción del usuario
- Coherencia arquitectónica: `NotificationService` está en `core/notifications/` — adecuado para notificaciones pasivas, no para decisiones de sesión que requieren acción
- Lazy loading: Sin impacto (NotificationService ya existe)

### Enfoque C — Banner inline en el layout

**Descripción:** Una barra de advertencia aparece en la parte superior del `LayoutComponent` con el mensaje y botones. Se maneja como una variable de estado en el LayoutComponent.

**Trade-offs:**
- Extensibilidad: Acoplado al layout; difícil reutilizar fuera del shell principal
- Testeabilidad: Más difícil de testear en aislamiento; requiere testear el LayoutComponent completo
- Coherencia arquitectónica: Mezcla responsabilidad de sesión con la del shell de layout
- Lazy loading: Sin impacto adicional

---

## Decisión 2 — Sincronización multi-pestaña: BroadcastChannel vs. StorageEvent

### Enfoque A — BroadcastChannel API

**Descripción:** Un servicio `SessionSyncService` en `core/auth/services/` usa `BroadcastChannel('session')` para emitir eventos `{ type: 'SESSION_CLEARED' }` cuando la sesión se destruye. Otras pestañas escuchan el evento y llaman `clearSession()`.

**Trade-offs:**
- Extensibilidad: Se puede extender para sincronizar otros eventos (token refresh, rol changes) sin efectos secundarios
- Testeabilidad: `BroadcastChannel` se puede mockear como `{ postMessage: vi.fn(), onmessage: null }`
- Coherencia arquitectónica: Vive correctamente en `core/auth/services/` como concern de sesión cross-tab
- Lazy loading: Sin impacto (providedIn: root, sin código lazy)

### Enfoque B — localStorage events (`StorageEvent`)

**Descripción:** Al hacer logout, se escribe un key `session_state = 'logged_out'` en localStorage. Otras pestañas escuchan `window.storage` event y reaccionan.

**Trade-offs:**
- Extensibilidad: Funciona pero introduce un "tick" en localStorage que contradice el requisito de no almacenar estado de sesión en localStorage
- Testeabilidad: `StorageEvent` es difícil de simular en jsdom sin workarounds
- Coherencia arquitectónica: El Requisito No Funcional del spec dice explícitamente que tokens NO deben estar en localStorage; añadir cualquier estado de sesión en localStorage, aunque sea un flag booleano, va en contra del principio de seguridad establecido
- Lazy loading: Sin impacto

---

## Decisión 3 — Normalización de errores de login: Componente vs. Servicio vs. Proveedor

### Enfoque A — Normalización en `AuthService` (capa de servicio)

**Descripción:** `AuthService.login()` atrapa el error, inspecciona el tipo (`HttpErrorResponse.status`) y relanza un error con mensaje normalizado antes de que el componente lo reciba. El servicio es el único que mapea códigos HTTP a mensajes de usuario.

**Trade-offs:**
- Extensibilidad: Si en el futuro se agrega un segundo punto de autenticación (OAuth), la normalización ya está centralizada
- Testeabilidad: Se puede testear en `auth.service.spec.ts` inyectando providers que lanzan diferentes errores
- Coherencia arquitectónica: `AuthService` es la capa que conoce el contexto de autenticación; es el lugar correcto para este mapping
- Lazy loading: Sin impacto

### Enfoque B — Normalización en `LoginComponent` (capa de vista)

**Descripción:** `LoginComponent.resolveErrorMessage()` (ya existe) se enriquece para distinguir entre `HttpErrorResponse.status === 401`, `5xx` y `ProgressEvent` (red).

**Trade-offs:**
- Extensibilidad: Si el error de token refresh también debe normalizarse (ej: al expirar durante uso), este componente no lo cubriría. Lógica duplicada
- Testeabilidad: Testeable en el spec del componente pero no reutilizable
- Coherencia arquitectónica: La capa de vista no debería interpretar códigos HTTP; eso es responsabilidad de la capa de servicio/datos
- Lazy loading: Sin impacto

---

## Decisión 4 — Inicio/parada del ciclo de vida de IdleService

### Enfoque A — Gestionado en `AuthService` con `effect()`

**Descripción:** `AuthService` inyecta `IdleService` y usa un `effect()` que reacciona al cambio de `_status`: llama `idleService.start()` cuando pasa a `'authenticated'` y `idleService.stop()` cuando pasa a `'unauthenticated'`.

**Trade-offs:**
- Extensibilidad: El ciclo de vida de idle queda anclado al ciclo de vida de la sesión — coherente y fácil de razonar
- Testeabilidad: Se puede testear en `auth.service.spec.ts` verificando que `IdleService.start/stop` son llamados en las transiciones de estado
- Coherencia arquitectónica: `AuthService` ya gestiona todo el ciclo de vida de sesión (login, logout, refresh, audit). Añadir la coordinación con IdleService es coherente; no introduce una nueva responsabilidad, extiende la existente
- Lazy loading: `IdleService` es `providedIn: 'root'`, sin impacto

### Enfoque B — Gestionado en `LayoutComponent` con `effect()`

**Descripción:** `LayoutComponent` inyecta tanto `IdleService` como `AuthService` y usa un `effect()` para iniciar/parar el idle timer.

**Trade-offs:**
- Extensibilidad: El LayoutComponent ya tiene múltiples responsabilidades (sidebar, toolbar, settings). Añadir gestión de sesión crea acoplamiento entre el shell de UI y la lógica de seguridad
- Testeabilidad: Testear esta lógica requiere renderizar el LayoutComponent completo
- Coherencia arquitectónica: Viola la regla de que `layout/` orquesta UI pero no debería contener lógica de seguridad. La regla de dependencia dice `features/` y `layout/` pueden depender de `core/`, pero no al revés. Poner lógica de sesión en layout crea un acoplamiento implícito difícil de seguir

---

## Enfoques elegidos

### Decisión 1: **Enfoque A — Dialog/Modal bloqueante**
### Decisión 2: **Enfoque A — BroadcastChannel API**
### Decisión 3: **Enfoque A — Normalización en AuthService**
### Decisión 4: **Enfoque A — Gestionado en AuthService con effect()**

---

## Justificación

### Decisión 1 (Idle Warning Dialog)

#### Caso en contra

En los próximos 12 meses, si el equipo introduce flujos de formulario largos (wizard de multi-pasos, carga de archivos), un `MatDialog` que aparece tras 13 minutos de inactividad podría interrumpir una operación en curso. El usuario podría estar consultando un documento externo mientras escribe en la app — el sistema lo consideraría "inactivo" por no mover el mouse ni presionar teclas, pero el usuario sí está activo en su trabajo. El dialog puede parecer disruptivo e inesperado.

Adicionalmente, existe el riesgo de que si el dialog no se cierra correctamente en algún edge case (ej: error en el componente dialog), bloquee la UI permanentemente.

#### Caso a favor

El spec es explícito: **"se le muestra una advertencia de sesión por expirar con opción de extender o cerrar sesión"**. Esta es una acción de seguridad que requiere decisión consciente del usuario. Una notificación toast puede ser ignorada o no vista (usuario en pantalla secundaria, tab en background). Un dialog que captura el foco es la única forma de garantizar que el usuario **debe** decidir. El `NotificationService` existente no soporta acciones/botones, lo que requeriría modificarlo para este caso — mayor scope sin beneficio.

El dialog bloqueante también facilita el testeo del criterio "si NO toma acción en 2 minutos → logout automático" porque la decisión es explícita en el componente del dialog.

#### Veredicto

**Usar MatDialog bloqueante.** El riesgo de interrupción de workflows es real pero manejable: los activity events de `IdleService` (mousemove, keydown, click, scroll) resetean el timer automáticamente cuando el usuario está activo. Solo aparece si el usuario lleva más de 13 minutos sin ninguna interacción. El costo de un usuario que pierde su sesión sin aviso es mayor que el costo de ser interrumpido una vez por un dialog de seguridad.

---

### Decisión 2 (Multi-tab sync)

#### Caso en contra

`BroadcastChannel` requiere que todas las pestañas sean del mismo origen (same-origin), lo cual es siempre verdad para este admin panel. Sin embargo, si en el futuro se embeben iframes de otros orígenes que necesiten sincronizarse, `BroadcastChannel` no funcionará cross-origin. Adicionalmente, si el equipo escribe tests en jsdom (Vitest), `BroadcastChannel` puede no estar disponible y requerir un mock explícito.

#### Caso a favor

`BroadcastChannel` es la solución purpose-built para este problema. La alternativa (localStorage events) directamente contradice el Requisito No Funcional del spec que prohíbe almacenar estado de sesión en localStorage. No hay otra alternativa en el estándar web para comunicación cross-tab sin tocar storage. El soporte de browser es >97% en 2024. La API es simple y testeable.

#### Veredicto

**Usar BroadcastChannel.** El requisito "no localStorage para estado de sesión" invalida la única alternativa viable. El scope de iframes cross-origin está fuera de alcance del spec.

---

### Decisión 3 (Error message normalization)

#### Caso en contra

Poner el mapeo de errores en `AuthService` significa que el servicio ahora importa `HttpErrorResponse` de `@angular/common/http` para inspeccionar el status code. Esto mezcla la preocupación de "qué debo mostrar al usuario" con "cómo gestiono mi sesión". En principio, el servicio debería lanzar un error tipado de dominio y el componente debería decidir el mensaje.

#### Caso a favor

El spec tiene un requisito no funcional explícito: **"los mensajes de error de autenticación NO deben revelar si un usuario existe"**. Este es un requisito de seguridad, no de presentación. Si la normalización queda en el componente, es fácil que un desarrollador futuro rompa accidentalmente la regla ("¿qué decía el error message para 404?"). Centralizarlo en `AuthService` lo hace un contrato de seguridad que vive junto a la lógica de autenticación. `AuthService` ya importa `HttpErrorResponse` de facto a través de los providers.

#### Veredicto

**Normalizar en AuthService.** La seguridad es responsabilidad del servicio, no de la vista.

---

### Decisión 4 (IdleService lifecycle wiring)

#### Caso en contra

Si `AuthService` inyecta `IdleService`, se crea una dependencia circular potencial si en el futuro `IdleService` necesita conocer el estado de autenticación para tomar decisiones (ej: no iniciar el timer si está en modo guest). Además, `AuthService` ya es el servicio más complejo del sistema; añadir más responsabilidades lo hace más difícil de testear y razonar.

#### Caso a favor

`AuthService` ya gestiona: login, logout, token refresh, session check, idle timeout defaults (`AUTH_DEFAULTS.idleTimeoutMs`), y auditoría de todos los eventos de sesión. El idle timer **es** parte del ciclo de vida de la sesión. Si la sesión vive en `AuthService`, el servicio que controla "cuándo la sesión expira por inactividad" debe ser gestionado donde vive el concepto de "sesión activa". El `LayoutComponent` es código de presentación — no debe conocer la política de seguridad de sesión.

#### Veredicto

**Gestionar en AuthService.** La posible dependencia circular se previene manteniendo `IdleService` como un servicio de bajo nivel que solo emite señales de tiempo (no conoce `AuthService`).

---

## Resoluciones post-revisión del Tech Lead

> Las siguientes secciones resuelven los hallazgos MAYOR y MENOR identificados por el Tech Lead en la auditoría de `plan.md`. Las 4 decisiones originales se mantienen intactas; estas resoluciones las complementan con restricciones de implementación adicionales.

---

### Resolución 1 — MAYOR-1: Subscriber para `IdleService.idle` (logout automático)

Como señala el Tech Lead en MAYOR-1, el diseño original especificaba que `LayoutComponent` reacciona a `IdleService.warning()` para abrir el dialog, pero **ningún artefacto estaba designado para reaccionar a `IdleService.idle()`** (t=15min) y disparar el logout automático cuando el countdown de 2 minutos expira.

#### Opciones evaluadas

**Opción A — `AuthService` añade un segundo `effect()` que reacciona a `idleService.idle()`:**
`AuthService` observa `idleService.idle()` y llama `this.logout(AUTH_DEFAULTS.loginRoute)`. El dialog muestra el countdown visualmente, pero no es el responsable de disparar el logout. Si el usuario no actúa, el `IdleService` emite `idle = true` a t=15min y el `AuthService` reacciona.

**Opción B — `IdleWarningDialogComponent` gestiona su propio countdown y llama `authService.logout()`:**
El dialog tiene un timer interno de 2 minutos. Al llegar a cero, llama `authService.logout()`. `IdleService.idle` se convierte en dead code (se setea a `true` pero nadie lo consume).

#### Caso en contra de la Opción A (elegida)

En el escenario donde el usuario cierra el browser antes de que el dialog aparezca y lo reabre tras pasar t=15min, el `AuthService` recibe `idle = true` durante la re-hidratación del estado. Si `checkSession()` ya forzó `logout()` por token expirado, este segundo `effect()` dispararía un segundo logout en carrera. El `effect()` debe ser idempotente frente a este caso.

Adicionalmente, si el usuario cierra el dialog mediante un mecanismo no previsto y el `IdleService` no reinicia el timer, el logout se dispara sin que el usuario haya tenido la ventana de 2 minutos real. El dialog pasa a ser decorativo si el `AuthService` tiene el control real.

#### Caso a favor de la Opción A

La Opción A preserva el principio de una única fuente de verdad para decisiones de sesión: **solo `AuthService` toma la decisión de logout**. Con la Opción B, `IdleWarningDialogComponent` (un componente de layout) tomaría decisiones de seguridad — una violación de la regla de dependencia entre capas (`layout/` no debe dictar política de seguridad).

La Opción B también produce dead code documenta por el Tech Lead como consecuencia directa: `IdleService.idle` emitiría a `true` pero ningún artefacto lo leería, haciendo el signal inútil e introduciendo confusión para futuros desarrolladores.

La Opción A es además la más testeable en aislamiento: en `auth.service.spec.ts`, se puede setear `idleService.idle` a `true` y verificar que `logout()` fue llamado, sin necesidad de renderizar el dialog. El comportamiento de logout automático queda completamente cubierto por tests de la capa de servicio.

#### Veredicto

**Se elige la Opción A.** `AuthService` añade un segundo `effect()` que llama `this.logout(AUTH_DEFAULTS.loginRoute).subscribe()` cuando `idleService.idle()` es `true`. El `IdleWarningDialogComponent` es responsable únicamente de la presentación visual del countdown y de ofrecer las acciones al usuario; nunca llama `logout()` directamente. El dialog se cierra cuando `IdleService.warning()` vuelve a `false` (lo cual ocurre cuando el `AuthService` llama `idleService.stop()` dentro de su secuencia de logout).

**Regla de implementación derivada (Regla 9 — ver sección "Restricciones de implementación"):** `AuthService` DEBE contener un segundo `effect()` dedicado exclusivamente a la reacción `idleService.idle() === true → this.logout()`. Este `effect()` debe ser idempotente: debe verificar que `this._status() === 'authenticated'` antes de disparar el logout para evitar llamadas duplicadas durante la re-hidratación.

---

### Resolución 2 — MAYOR-2: `MatDialog.disableClose: true` y guard de instancia única

Como señala el Tech Lead en MAYOR-2, el comportamiento default de `MatDialog` (`disableClose: false`) permite que ESC o un click en el backdrop cierre el dialog silenciosamente. Si esto ocurre:

1. `IdleService.warning` permanece `true` (el signal no cambió).
2. El `effect()` en `LayoutComponent` **no se re-ejecuta** (Angular Signals solo re-ejecutan effects cuando el valor del signal cambia).
3. El dialog no se reabre.
4. El usuario pierde la opción de extender la sesión — violación directa del criterio del spec.

#### Adversarial check sobre la corrección

**Caso en contra:** Forzar `disableClose: true` significa que si hay un bug en el componente dialog (ej: `MatDialogRef.close()` nunca se llama porque un error es lanzado en el handler), la UI queda permanentemente bloqueada. El usuario no puede escapar del overlay.

**Caso a favor:** El riesgo de bloqueo permanente se mitiga con: (a) el logout automático vía `AuthService.idle effect()` que cierra la sesión de todos modos en t=15min, y (b) el botón "Cerrar sesión" siempre disponible en el dialog que llama `MatDialogRef.close()` explícitamente. El requisito del spec de un dialog **"bloqueante"** con **"opción de extender o cerrar sesión"** es incompatible con `disableClose: false`: si el usuario puede cerrar el dialog con ESC sin tomar ninguna acción, la opción de extender la sesión nunca se ejerce y la sesión expira sin que el usuario haya tenido la advertencia real.

**Veredicto:** `disableClose: true` es mandatorio. La justificación de la Decisión 1 original ("el foco es capturado por el modal; el usuario no puede ignorarlo sin interactuar") era correcta en intención pero incompleta en especificación.

**Regla de implementación derivada (Regla 10 — ver sección "Restricciones de implementación"):** El `MatDialog.open()` en `LayoutComponent` DEBE incluir `{ disableClose: true }` en la configuración. Adicionalmente, el `effect()` de `LayoutComponent` DEBE verificar si el dialog ya está abierto antes de abrirlo de nuevo, usando una referencia `private dialogRef: MatDialogRef<IdleWarningDialogComponent> | null = null`. La condición de apertura es: `IdleService.warning() === true && this.dialogRef === null`. El `dialogRef` se setea a `null` en el callback `afterClosed()`.

---

### Resolución 3 — MENOR-1: Ubicación definitiva de `IdleWarningDialogComponent`

Como señala el Tech Lead en MENOR-1, existía una contradicción entre el texto del trade-off de la Decisión 1 (que mencionaba `core/auth/` como ubicación natural) y la estructura de archivos (que ubicaba el componente en `layout/components/`).

**Ubicación elegida: `src/app/layout/components/idle-warning-dialog/`**

**Justificación:** `IdleWarningDialogComponent` es un componente de presentación pura. No contiene lógica de sesión (esa responsabilidad fue asignada a `AuthService` en la Resolución 1). Su único trabajo es renderizar un countdown y dos botones. El componente es instanciado por `LayoutComponent` via `MatDialog` — pertenecer al mismo dominio (`layout/`) mantiene la cohesión de "quién crea a quién". Los servicios de sesión (`IdleService`, `AuthService`) viven en `core/auth/` y son inyectados dentro del dialog como dependencias, respetando la dirección de dependencia: `layout/ → core/auth/`.

El texto del trade-off de la Decisión 1 que mencionaba `core/auth/` como ubicación alternativa debe considerarse superado por esta decisión explícita.

---

### Resolución 4 — MENOR-2: `MockAuthProvider` incluido en archivos a modificar

Como señala el Tech Lead en MENOR-2, `MockAuthProvider` fue identificado en el audit como GAP-5 (usa `localStorage` para persistir sesión mock) pero fue excluido de la lista de archivos a modificar.

**Corrección:** `src/app/core/auth/providers/mock/mock-auth.provider.ts` se añade a la lista de archivos a modificar. El cambio es una sola línea: reemplazar el `localStorage.setItem/getItem/removeItem(this.SESSION_KEY, ...)` por una variable `private sessionActive = false` en memoria. Sin cambios en la interfaz pública del provider. Esto garantiza que los tests que usan `MockAuthProvider` no contaminen `localStorage` y no violan el criterio del spec de no almacenar estado de sesión en localStorage.

---

### Resolución 5 — MENOR-3: Fallback documentado para `BroadcastChannel`

Como señala el Tech Lead en MENOR-3, `SessionSyncService` podría lanzar un `ReferenceError` en el ~3% de navegadores sin soporte para `BroadcastChannel`, potencialmente impidiendo el arranque de la aplicación.

**Mecanismo de fallback:** La implementación de `SessionSyncService` DEBE comenzar con una detección de características:

```
const supported = typeof BroadcastChannel !== 'undefined';
```

- Si `supported === true`: inicializar el channel normalmente.
- Si `supported === false`: registrar un warning en `AuditService` con el mensaje `"BroadcastChannel not supported; multi-tab session sync disabled"` y operar en **modo no-op** (los métodos `broadcast()` y `events$` existen en la interfaz pero no emiten ni suscriben nada). La aplicación continúa funcionando sin sincronización multi-pestaña.

Esta estrategia aplica degradación graceful: la feature de sincronización queda deshabilitada, pero la sesión del usuario en la pestaña activa funciona normalmente. El requisito no funcional del spec de sincronización multi-pestaña queda degradado para ese 3% de casos, lo cual es un trade-off aceptable frente a romper el arranque completo de la app.

**Regla de implementación derivada:** La Regla 4 existente sobre `BroadcastChannel` se extiende con esta condición de fallback (ver sección "Restricciones de implementación").

---

### Resolución 6 — MENOR-5: Umbral de extracción de `AuthService`

Como señala el Tech Lead en MENOR-5, post-implementación `AuthService` acumulará 12+ razones de cambio, degradando el Principio de Responsabilidad Única.

**Umbral de extracción documentado:** Si en iteraciones futuras `AuthService` supera **15 métodos públicos distintos** o si se añaden 2 o más concerns de sesión nuevos (ej: MFA, OAuth, device fingerprinting), se debe evaluar la extracción de `SessionLifecycleService` que encapsule:
- Gestión del ciclo de vida de `IdleService` (start/stop/idle reaction)
- Coordinación con `SessionSyncService` (broadcast + eventos entrantes)

Esta extracción no es mandatoria en esta iteración. El umbral es un contrato de deuda técnica documentado para el Tech Lead en futuras revisiones.

---

## Elementos UI observables

### Flujo de advertencia de inactividad (GAP-1, GAP-2)

- Un dialog/overlay que aparece en el centro de la pantalla después de 13 minutos de inactividad, superpuesto sobre el contenido actual
- Un texto principal indicando que la sesión está a punto de expirar por inactividad
- Un temporizador de cuenta regresiva visible dentro del dialog que muestra los minutos y segundos restantes (2 minutos)
- Un botón primario con texto "Mantener sesión activa" (o equivalente en el locale configurado)
- Un botón secundario con texto "Cerrar sesión"
- El dialog desaparece automáticamente cuando el usuario hace clic en "Mantener sesión activa"
- Si el temporizador llega a cero sin acción, el dialog desaparece y el usuario es redirigido al login

### Flujo de login con error (GAP-4)

- Un mensaje de error visible debajo del encabezado del formulario cuando las credenciales son inválidas (texto: "Correo o contraseña inválidos")
- Un mensaje de error diferente cuando el servidor falla ("Error del sistema. Inténtelo más tarde")
- Un mensaje de error diferente cuando no hay conexión de red ("No es posible conectarse. Comprueba tu conexión")
- El formulario permanece visible y editable después de cualquier error de login
- Los campos del formulario conservan los valores ingresados después de un error (excepción: la contraseña puede limpiarse)

### Flujo de sesión expirada

- Una página completa con icono de reloj, título "Sesión expirada" y descripción explicativa, cuando el token vence completamente
- Un botón "Ir al login" en esa página
- La misma página aparece cuando el dialog de inactividad expira sin acción del usuario

### Flujo de autorización por roles y permisos

- Una página de "Acceso denegado" (403) con mensaje claro cuando el usuario intenta acceder a una ruta que requiere rol superior al que posee
- Botones, opciones de menú o secciones que directamente no aparecen en la UI para usuarios que no tienen el permiso requerido (controlado via `*appHasRole` / `*appHasPermission`)
- Un mensaje "No tienes permiso para realizar esta acción" cuando se intenta ejecutar una acción protegida por permiso (presentado como toast de error o inline, según contexto)

### Estado de carga en login

- El botón "Sign In" muestra un ícono de carga y está deshabilitado mientras el servidor procesa la solicitud de autenticación

---

## Comportamientos observables verificables

### Acceso sin autenticación
- Al navegar a `/dashboard` sin estar autenticado, el usuario es redirigido a `/auth/login?returnUrl=%2Fdashboard`
- Al recargar `/auth/login` directamente, el usuario permanece en el formulario de login
- Al recargar la app con sesión válida (cookie HttpOnly presente), el usuario llega directamente a la ruta solicitada sin pasar por login

### Autenticación exitosa
- Al ingresar credenciales válidas y hacer clic en "Sign In", el usuario llega al dashboard en menos de 3 segundos
- Al ingresar credenciales válidas que tenían un `returnUrl`, el usuario llega a esa URL específica, no al dashboard por defecto
- Al navegar entre páginas protegidas después de autenticarse, el nombre del usuario y su contexto permanecen visibles consistentemente

### Expiración por inactividad
- Después de 13 minutos sin interacción (sin clic, scroll, teclado ni touch), aparece el dialog de advertencia con el temporizador en 2:00
- Al mover el mouse o hacer clic durante los primeros 13 minutos, el temporizador se reinicia silenciosamente (no hay elemento visible de feedback)
- Al hacer clic en "Mantener sesión activa" en el dialog, el dialog desaparece y el temporizador se reinicia a 15 minutos
- Al no actuar durante los 2 minutos del dialog, el usuario es redirigido a `/auth/login` y el dialog desaparece

### Expiración de token
- Durante el uso normal (usuario activo), no hay ningún elemento visible ni pausa cuando el token se renueva automáticamente
- Cuando el token vence completamente, el usuario llega a la página `/critical-errors/session-expired` con el mensaje explicativo

### Logout
- Al hacer clic en el botón de "Cerrar sesión" en la toolbar/sidebar, el usuario llega a `/auth/login`
- Al intentar navegar a una URL protegida después del logout (ej: botón "atrás" del browser), el usuario es redirigido a `/auth/login`
- Al abrir DevTools → Application → localStorage/sessionStorage después del logout, no hay tokens ni datos de sesión visibles

### Autorización por roles
- Un usuario con rol "Viewer" que navega a una URL protegida con rol "Admin" ve la página de "Acceso denegado" (403)
- Un usuario con rol "Admin" ve todas las acciones administrativas disponibles en la interfaz

### Autorización por permisos
- Un usuario sin el permiso `modify_users` que intenta ejecutar la acción de modificar usuarios recibe feedback de que la acción no está permitida, y la acción no se ejecuta
- Un usuario sin el permiso `export_reports` ve el botón de exportar deshabilitado o ausente en la sección de reportes
- Un usuario con todos los permisos requeridos para una acción multi-permiso puede ejecutarla normalmente

### Manejo de errores de autenticación
- Al ingresar email/contraseña incorrectos, aparece el mensaje "Correo o contraseña inválidos" (no especifica si el email existe o no)
- Al producirse un error 5xx en el servidor durante el login, aparece "Error del sistema. Inténtelo más tarde"
- Al intentar login sin conexión de red, aparece un mensaje indicando el problema de conectividad

### Seguridad de tokens
- Al abrir DevTools → Application → localStorage, no hay ningún token JWT visible como texto plano
- Al abrir DevTools → Application → sessionStorage, no hay ningún token JWT visible
- Al inspeccionar cookies, el refresh token está marcado como `HttpOnly` (no visible desde JavaScript)
- Al cerrar una sesión en una pestaña, las demás pestañas abiertas de la misma app son redirigidas al login automáticamente

---

## Restricciones de implementación

### Estructura de archivos nueva

Los siguientes artefactos deben crearse en los dominios correctos según screaming architecture:

```
src/app/core/auth/services/
  session-sync.service.ts          ← GAP-3: BroadcastChannel multi-tab sync

src/app/layout/components/
  idle-warning-dialog/
    idle-warning-dialog.component.ts
    idle-warning-dialog.component.html
    idle-warning-dialog.component.scss
    idle-warning-dialog.component.spec.ts
    idle-warning-dialog.model.ts
```

### Archivos a modificar

```
src/app/core/auth/services/auth.service.ts
  ← Inyectar IdleService + SessionSyncService
  ← Añadir effect() #1 para start/stop del idle timer (reacciona a _status)
  ← Añadir effect() #2 para logout automático (reacciona a idleService.idle(); verifica _status === 'authenticated' antes de disparar) [MAYOR-1]
  ← Normalizar mensajes de error en login()
  ← Llamar sessionSync.broadcast() en clearSession()

src/app/layout/layout.component.ts
  ← Inyectar MatDialog + IdleService
  ← Declarar private dialogRef: MatDialogRef<IdleWarningDialogComponent> | null = null
  ← Añadir effect() que reacciona a IdleService.warning(): abre el dialog SOLO SI dialogRef === null; pasa { disableClose: true } en la config de MatDialog.open(); setea dialogRef = null en afterClosed() [MAYOR-2]

src/app/features/auth/pages/login/login.component.ts
  ← Eliminar resolveErrorMessage() privado
  ← El errorMessage llega ya normalizado desde AuthService

src/app/core/auth/providers/mock/mock-auth.provider.ts
  ← Reemplazar localStorage.setItem/getItem/removeItem(SESSION_KEY, ...) por private sessionActive = false en memoria [MENOR-2]
```

### Reglas de implementación obligatorias

1. **Token storage**: El access token DEBE permanecer exclusivamente en el Signal `_accessToken` en memoria. Ninguna modificación debe mover tokens a localStorage, sessionStorage, ni cookies accesibles por JS.

2. **Error messages**: `AuthService.login()` DEBE normalizar errores antes de propagarlos. La regla: `HttpErrorResponse.status === 401` → mensaje genérico de credenciales; `HttpErrorResponse.status >= 500` → mensaje de sistema; `ProgressEvent | !error.status` → mensaje de red. Nunca propagar `error.message` del backend directamente.

3. **IdleService wiring**: `AuthService` debe ser el único lugar donde `IdleService.start()` y `IdleService.stop()` son llamados. El `LayoutComponent` solo abre el dialog cuando `IdleService.warning()` es true; no gestiona el ciclo de vida del timer.

4. **BroadcastChannel**: `SessionSyncService` debe cerrar el channel en `ngOnDestroy()`. Los mensajes deben ser tipados (`{ type: 'SESSION_CLEARED' }`). El servicio debe ignorar mensajes que reciba en el mismo tab que los emitió (BroadcastChannel ya hace esto por defecto). **Fallback (MENOR-3):** Si `typeof BroadcastChannel === 'undefined'`, el servicio DEBE registrar un warning en `AuditService` (`"BroadcastChannel not supported; multi-tab session sync disabled"`) y operar en modo no-op: los métodos `broadcast()` y `events$` existen en la interfaz pero no emiten ni suscriben nada. La aplicación NO debe lanzar error en arranque por la ausencia de esta API.

5. **Dialog de inactividad**: El componente dialog DEBE usar el patrón `COMPONENT_DEFAULTS` en su `model.ts`. Todos los strings visibles al usuario deben usar `$localize` con `@@id`. No usar CVA. El dialog recibe los tiempos como `input()` desde el model, no hardcoded. El componente dialog NO llama `authService.logout()` directamente — el logout es responsabilidad exclusiva de `AuthService` (ver Regla 9).

6. **CSS**: El dialog debe usar clases prefijadas con `app-idle-warning-dialog-`. Los colores usan Material tokens, no clases Tailwind de color. El layout interno del dialog usa Tailwind utilities (`flex`, `gap-4`, etc.).

7. **data-testid**: El Developer Agent debe aplicar exactamente los `data-testid` que especifique el QA Agent. No debe definirlos por cuenta propia. Los templates deben construirse con los elementos estructuralmente completos para recibir los atributos antes de que el Dev Agent aplique el artefacto de QA.

8. **Dependency direction**: `SessionSyncService` e `IdleService` viven en `core/auth/` y NUNCA deben importar de `features/` ni de `layout/`.

9. **Logout automático por idle (MAYOR-1):** `AuthService` DEBE contener un segundo `effect()` que observe `idleService.idle()`. La condición de disparo es `idleService.idle() === true && this._status() === 'authenticated'`. Cuando se cumple, llama `this.logout(AUTH_DEFAULTS.loginRoute).subscribe()`. Este guard de `_status` garantiza idempotencia frente a re-hidratación de estado. El `IdleWarningDialogComponent` NO llama `logout()` en ningún caso.

10. **Dialog bloqueante — instancia única y disableClose (MAYOR-2):** El `LayoutComponent` DEBE:
    - Declarar `private dialogRef: MatDialogRef<IdleWarningDialogComponent> | null = null`
    - Abrir el dialog solo cuando `IdleService.warning() === true && this.dialogRef === null`
    - Pasar `{ disableClose: true, data: { warningDurationMs: IDLE_WARNING_DIALOG_DEFAULTS.warningDurationMs } }` en `MatDialog.open()`
    - Setear `this.dialogRef = null` en el callback `afterClosed()` del `MatDialogRef`
    - El dialog NO puede cerrarse con ESC ni con click en backdrop. Solo se cierra mediante los botones del componente (`MatDialogRef.close()` explícito) o cuando `AuthService` llama `idleService.stop()` durante la secuencia de logout.

---

## Estimación de complejidad

- [ ] `simple` — menos de 5 archivos, 1 componente o servicio
- [x] `moderate` — entre 5 y 15 archivos, 2–4 componentes o servicios
- [ ] `complex` — más de 15 archivos o dependencias cross-dominio *(requiere escalada al humano en v1)*

**Justificación:** La auditoría determinó que ~80% de los criterios del spec ya están implementados. El trabajo restante comprende:
- 5 archivos nuevos: `IdleWarningDialogComponent` (5-file pattern: ts + html + scss + spec + model)
- 1 archivo nuevo: `SessionSyncService` (ts)
- 4 archivos modificados: `AuthService`, `LayoutComponent`, `LoginComponent`, `MockAuthProvider` (añadido en revisión MENOR-2)

**Total: 10 archivos**. El único cross-domain dependency es `layout/` → `core/auth/` (ya existe este patrón en `LayoutComponent` que usa `LayoutService` de `core/`). No se introducen nuevas dependencias cross-domain. Permanece en `moderate`.

---

## Estado del contexto

- [x] Completé este artefacto con contexto completo
- [ ] Mi contexto estaba parcialmente saturado al generar las siguientes secciones

Se leyeron y analizaron completamente: `auth.service.ts`, `idle.service.ts`, `auth.guard.ts` (todos los guards), `auth.interceptor.ts`, `jwt-auth.provider.ts`, `mock-auth.provider.ts`, `auth.model.ts`, `audit.service.ts`, `notification.service.ts`, `login.component.ts` + template, `layout.component.ts`, `app.routes.ts`, `app.config.ts`, `initialization.service.ts`, páginas de error existentes, y los 4 archivos de instrucciones arquitectónicas.

**Revisión post-Tech Lead (MAYOR-1, MAYOR-2, MENOR-1…3, MENOR-5):** Se añadieron 6 secciones de resolución, 2 nuevas reglas de implementación (Reglas 9 y 10), se actualizaron las Reglas 4 y 7, se añadió `MockAuthProvider` a los archivos a modificar, y se documentó el umbral de extracción de `AuthService`. Todos los hallazgos MAYOR están resueltos; todos los hallazgos MENOR están abordados o documentados como deuda técnica con umbral explícito. MENOR-4 fue resuelto mediante la corrección de la Regla 7.

---

## Checklist de completitud

- [x] Se consideraron al menos 2 enfoques con trade-offs explícitos (4 decisiones, 2-3 enfoques cada una)
- [x] El enfoque elegido tiene caso en contra documentado
- [x] El enfoque elegido tiene caso a favor documentado
- [x] La sección "Elementos UI observables" no menciona data-testid ni nombres de componentes
- [x] La sección "Comportamientos observables verificables" está presente y es derivable de la spec
- [x] La estimación de complejidad está seleccionada (`moderate`)
- [x] El "Estado del contexto" está completado
- [x] MAYOR-1 resuelto: `AuthService` effect() #2 designado como subscriber de `IdleService.idle` → logout automático (Resolución 1 + Regla 9)
- [x] MAYOR-2 resuelto: `disableClose: true` y guard `dialogRef !== null` documentados como Regla 10 y en "Archivos a modificar" (Resolución 2)
- [x] MENOR-1 resuelto: ubicación definitiva `layout/components/idle-warning-dialog/` con justificación coherente (Resolución 3)
- [x] MENOR-2 resuelto: `MockAuthProvider` añadido a "Archivos a modificar" (Resolución 4)
- [x] MENOR-3 resuelto: fallback no-op documentado en Regla 4 (Resolución 5)
- [x] MENOR-4 resuelto: Regla 7 reescrita con verbo correcto ("debe aplicar" en lugar de "NO debe definir")
- [x] MENOR-5 resuelto: umbral de extracción (15 métodos públicos) documentado como deuda técnica con condición de activación (Resolución 6)
