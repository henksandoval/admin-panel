# Spec — Autenticación y Autorización - Requisitos de Seguridad

<!-- STATUS: PENDING - Esperando validación del PO -->

---

## Contexto [REQUERIDO]

La aplicación requiere un sistema de autenticación robusto que determine quién puede acceder, qué pueden ver, y cuándo se pierde acceso legítimo. Sin pautas claras de seguridad, implementaciones ad-hoc pueden dejar vulnerabilidades: usuarios no autenticados accediendo a datos privados, sesiones que no expiran, permisos no validados consistentemente.

Este spec define el comportamiento observable que DEBE cumplirse garantizar que solo usuarios autorizados accedan a sus recursos correspondientes.

---

## Historias de usuario [REQUERIDO]

- **Como usuario no autenticado**, quiero ser redirigido al formulario de login cuando intente acceder a cualquier página protegida, para que no pueda ver información privada.

- **Como usuario autenticado con credenciales válidas**, quiero poder acceder a mi panel de control y ejecutar acciones según mis rol y permisos, para realizar mi trabajo.

- **Como usuario cuya sesión ha expirado (inactividad o token vencido)**, quiero ser avisado y redirigido nuevamente al login, para que no pierda datos ni trabaje con una sesión inválida.

- **Como usuario con rol limitado**, quiero que se me bloquee el acceso a funciones que solo tienen roles superiores, para mantener la integridad de los datos.

- **Como administrador del sistema**, quiero que el logout cierre completamente la sesión y requiera re-autenticación, para que nadie pueda usar una sesión abandonada.

---

## Criterios de aceptación [REQUERIDO]

### Acceso sin autenticación

- [ ] Dado que un usuario NO está autenticado, cuando intenta acceder a cualquier página protegida (ej: `/dashboard`), entonces es redirigido al formulario de login y VE un mensaje informativo.

- [ ] Dado que un usuario NO está autenticado, cuando intenta navegar directamente a una URL protegida, entonces el servidor NO envía datos privados y la URL no es procesada como válida.

- [ ] Dado que un usuario NO está autenticado, cuando recarga la página, entonces permanece en el estado no autenticado (no falsifica sesión accidentalmente).

### Autenticación exitosa

- [ ] Dado que un usuario ingresa credenciales válidas (correo + contraseña), cuando hace clic en "Ingresar", entonces es redirigido al panel de control y puede ver su información personal.

- [ ] Dado que un usuario se ha autenticado correctamente, cuando recarga la página, entonces su sesión se mantiene válida y no es obligado a volver a ingresar (sesión persiste en el cliente de forma segura).

- [ ] Dado que un usuario se autentica, cuando navega entre páginas protegidas, entonces sus datos y contexto se mantienen consistentemente.

### Expiración de sesión por inactividad

- [ ] Dado que un usuario ha estado inactivo por más de 15 minutos, cuando intenta usar la aplicación, entonces se le muestra una advertencia de sesión por expirar con opción de extender o cerrar sesión.

- [ ] Dado que un usuario recibe la advertencia de inactividad y NO toma acción en 2 minutos, cuando el tiempo se agota, entonces la sesión se cierra automáticamente y es redirigido al login.

- [ ] Dado que un usuario recibe la advertencia y hace clic en "Mantener sesión activa", entonces el temporizador se reinicia y puede continuar trabajando.

### Expiración de token

- [ ] Dado que el token de acceso está próximo a vencer (menos de 60 segundos), cuando el usuario está activo, entonces la aplicación renueva el token de forma silenciosa sin interrumpir la experiencia.

- [ ] Dado que el token se ha vencido completamente, cuando el usuario intenta usar la aplicación, entonces es redirigido al login con un mensaje explicando que su sesión expiró.

### Logout

- [ ] Dado que un usuario hace clic en "Cerrar sesión", cuando la acción se completa, entonces su sesión se destruye (no persiste en memoria, almacenamiento local ni cookies).

- [ ] Dado que un usuario ha cerrado sesión, cuando intenta acceder a una URL protegida, entonces es redirigido al login sin poder ver datos anteriores.

- [ ] Dado que un usuario cierra sesión, cuando el servidor recibe la solicitud de logout, entonces valida que la sesión sea revocada en el backend.

### Autorización basada en roles

- [ ] Dado que un usuario tiene el rol "Viewer" (solo lectura), cuando intenta acceder a funciones que requieren "Admin" (ej: crear usuarios), entonces se le presenta una página de "Acceso denegado".

- [ ] Dado que un usuario tiene múltiples roles, cuando accede a una sección, entonces solo ve y puede ejecutar acciones permitidas por sus roles activos.

- [ ] Dado que un usuario tiene el rol "Admin", cuando accede a la sección de administración, entonces puede ver y ejecutar todas las funciones administrativas.

### Autorización basada en permisos

- [ ] Dado que una acción requiere el permiso "modify_users", cuando un usuario SIN ese permiso intenta ejecutarla, entonces recibe un mensaje "No tienes permiso para realizar esta acción" y la acción es bloqueada.

- [ ] Dado que un usuario tiene el permiso "view_reports", cuando accede a los reportes, entonces puede verlos; cuando intenta exportarlos sin el permiso "export_reports", entonces la opción está deshabilitada o bloqueada.

- [ ] Dado que múltiples permisos son requeridos para una acción, cuando el usuario cumple con todos, entonces la acción se permite; si falta alguno, entonces es bloqueada.

### Manejo de errores de autenticación

- [ ] Dado que un usuario ingresa credenciales incorrectas, cuando hace clic en "Ingresar", entonces ve un mensaje de error claro (ej: "Correo o contraseña inválidos") y permanece en el formulario.

- [ ] Dado que ocurre un error en el servidor durante el login, cuando el intento falla, entonces se muestra un mensaje "Error del sistema. Inténtelo más tarde" sin exponer detalles técnicos.

- [ ] Dado que la red falla durante un intento de login, cuando ocurre la desconexión, entonces se muestra un mensaje indicando el problema de conexión.

### Seguridad de tokens

- [ ] Dado que un usuario está autenticado, cuando se inspecciona el navegador, entonces el token NO está visible en localStorage/sessionStorage como texto plano (está protegido de XSS).

- [ ] Dado que múltiples pestañas están abiertas con la misma sesión, cuando una de ellas expira la sesión, entonces todas las pestañas detectan la expiración y redirigen al login.

- [ ] Dado que un atacante intenta usar un token expirado, cuando lo envía al servidor, entonces el servidor rechaza la solicitud y la aplicación redirige al login.

### Recuperación de contraseña

- [ ] Dado que un usuario olvida su contraseña, cuando hace clic en "¿Olvidaste tu contraseña?", entonces ve un formulario para ingresar su correo.

- [ ] Dado que un usuario valida su correo, cuando recibe el email de recuperación, entonces contiene un enlace temporal (válido por máximo 1 hora) para restablecer la contraseña.

- [ ] Dado que un usuario hace clic en el enlace de recuperación expirado, cuando intenta usarlo, entonces ve el mensaje "El enlace de recuperación ha expirado. Solicita uno nuevo".

- [ ] Dado que un usuario establece una nueva contraseña, cuando completa el proceso, entonces su antigua contraseña ya no funciona y debe usar la nueva para autenticarse.

### Registro de usuarios

- [ ] Dado que un usuario no autenticado accede al formulario de registro, cuando ingresa datos válidos y hace clic en "Registrarse", entonces su cuenta se crea y es redirigido al login.

- [ ] Dado que un usuario intenta registrarse con un correo ya usado, cuando intenta crear la cuenta, entonces ve el mensaje "Este correo ya está registrado".

- [ ] Dado que un usuario se registra exitosamente, cuando accede a la aplicación, entonces su nueva cuenta es inmediatamente usable sin pasos de confirmación adicionales (a menos que se requiera verificación de correo).

---

## Requisitos no funcionales [REQUERIDO]

- **Timeout de inactividad**: La sesión debe expirar automáticamente después de 15 minutos de inactividad, con una advertencia de 2 minutos antes.

- **Renovación automática de token**: El token debe renovarse automáticamente 60 segundos antes de su expiración, sin interrumpir la experiencia del usuario.

- **Seguridad de almacenamiento**: Los tokens NO deben almacenarse en `localStorage` o `sessionStorage` en texto plano; deben estar en memoria o protegidos contra XSS.

- **Consistencia multi-pestaña**: Si la sesión se cierra en una pestaña, las demás deben detectarlo y sincronizarse automáticamente.

- **Protección contra CSRF**: Las solicitudes de logout y cambios de credenciales deben estar protegidas contra ataques CSRF.

- **Mensajes de error**: Los mensajes de error de autenticación NO deben revelar si un usuario existe en el sistema (ej: no decir "Correo no encontrado" vs "Contraseña incorrecta").

- **Rate limiting**: Los intentos fallidos de login deben estar limitados para prevenir ataques de fuerza bruta.

- **Auditoría**: Cada cambio de estado de sesión (login, logout, expiración, refresh de token) debe ser registrado con timestamp para auditoría.

---

## Fuera de alcance [REQUERIDO]

- Implementación de autenticación multi-factor (MFA/2FA) — será requerida en una iteración futura.
- Autenticación con proveedores externos (Google, GitHub, etc.) — será requerida en una iteración futura.
- Cambio de contraseña dentro de la aplicación para usuarios autenticados — será requerida en una iteración futura.
- Detección y manejo de dispositivos no reconocidos — será requerida en una iteración futura.
- Auditoría detallada de eventos de seguridad en el dashboard administrativo — será requerida en una iteración futura.

---

## Supuestos explicitados [REQUERIDO]

| Supuesto | Nivel de confianza |
|---|---|
| El backend es responsable de validar credenciales y emitir tokens válidos | Alta |
| El backend proporciona un endpoint de logout que revoca la sesión | Alta |
| El backend valida roles y permisos antes de retornar datos sensibles | Alta |
| La aplicación usa HTTPS en producción (protección del token en tránsito) | Alta |
| El equipo técnico tiene acceso a monitoreo/logs para auditar sesiones | Media |
| Los usuarios confían que sus datos no serán expuestos por vulnerabilidades de sesión | Alta |

---

## Estado del contexto [REQUERIDO]

- [x] Completé este artefacto con contexto completo
- [x] Mi contexto estaba parcialmente saturado al generar las siguientes secciones: 
  - Requisitos no funcionales (asumí valores comunes de industria: 15 min timeout, 60s token refresh)
  - Supuestos de backend (asumí responsabilidades estándar de API segura)

---

## Checklist de completitud [REQUERIDO]

- [x] La sección "Contexto" describe el problema sin mencionar tecnología
- [x] Hay múltiples historias de usuario completas
- [x] Hay más de 30 criterios de aceptación con verbos de comportamiento observable
- [x] Los criterios NO mencionan componentes, servicios, signals ni patrones técnicos
- [x] La sección "Requisitos no funcionales" está rellena
- [x] La sección "Fuera de alcance" está rellena
- [x] Los supuestos tienen nivel de confianza asignado
- [x] El "Estado del contexto" está completado

---

## Próximos pasos

Este spec define el estándar de seguridad observable. El equipo técnico debe:

1. **Auditar** la implementación actual contra cada criterio de aceptación
2. **Documentar brechas** si algún criterio no se cumple
3. **Proponer remediación** con cambios específicos al código
4. **Validar** que cada criterio es verificable (manual o automatizado) antes de marcar como cumplido
