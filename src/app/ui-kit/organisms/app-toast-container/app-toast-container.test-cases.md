# Test Cases — AppToastContainerComponent

| ID del Test | Tipo | Escenario / Propósito | Precondiciones | Pasos clave | Resultado Esperado | Justificación de Valor |
|---|---|---|---|---|---|---|
| TC-RendersToasts | Integración | Renderiza un `app-toast` por cada toast del `NotificationService` | `NotificationService` mockeado | 1. Emitir un array de 2 toasts desde el mock. 2. Detectar cambios. | Existen 2 elementos `app-toast` en el DOM. | Happy path crítico: el contenedor debe mostrar todas las notificaciones activas. |
| TC-DismissCallsService | Integración | `onDismiss(id)` llama a `notificationService.remove(id)` | `NotificationService` mockeado con spy | 1. Llamar `onDismiss('toast-abc')`. | `notificationService.remove` se llama con `'toast-abc'`. | Garantiza que cerrar un toast lo elimina del estado global de notificaciones. |
| TC-SubscribesOnInit | Integración | Se suscribe a `toasts$` en `ngOnInit` | `NotificationService` mockeado con `toasts$` | 1. Instanciar el componente. 2. Llamar `ngOnInit()`. 3. Emitir un nuevo valor en `toasts$`. | El array `toasts` del componente se actualiza con el nuevo valor. | Garantiza que las nuevas notificaciones del servicio se reflejan automáticamente. |
| TC-UnsubscribesOnDestroy | Integración | Se desuscribe correctamente en `ngOnDestroy` | Componente inicializado | 1. Llamar `ngOnDestroy()`. 2. Emitir nuevo valor en `toasts$`. | El array `toasts` no se actualiza tras el destroy. | Evita memory leaks en la aplicación por suscripciones huérfanas. |
