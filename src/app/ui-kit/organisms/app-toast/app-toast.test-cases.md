# Test Cases — AppToastComponent

| ID del Test | Tipo | Escenario / Propósito | Precondiciones | Pasos clave | Resultado Esperado | Justificación de Valor |
|---|---|---|---|---|---|---|
| TC-IconByType | Componente | `iconName` retorna el icono correcto para cada tipo de toast | — | 1. Setear `toast.type` a cada valor (`success`, `error`, `warning`, `info`). 2. Leer `iconName`. | Cada tipo retorna su icono correspondiente: `check_circle`, `error`, `warning`, `info`. | Garantiza el feedback visual correcto que distingue tipos críticos (error) de informativos. |
| TC-DismissEmit | Componente | `onDismiss` emite el `id` del toast | `toast.id = 'toast-123'` | 1. Llamar `onDismiss()`. 2. Escuchar el output `dismiss`. | `dismiss` emite `'toast-123'`. | Happy path crítico: sin esto el usuario no puede cerrar las notificaciones. |
| TC-RendersMessage | Componente | Renderiza el `message` del toast en el DOM | — | 1. Setear `toast.message = 'Guardado exitosamente'`. 2. Detectar cambios. | El texto `'Guardado exitosamente'` aparece en el DOM. | Garantiza que el contenido principal de la notificación sea visible al usuario. |
| TC-RendersTitle | Componente | Renderiza el `title` cuando está presente | `toast.title = 'Éxito'` | 1. Setear el toast con `title`. 2. Detectar cambios. | El texto del `title` aparece en el DOM. | Los títulos en toasts de error o warning mejoran la comprensión del mensaje. |
| TC-IconFallback | Componente | `iconName` retorna `'info'` para tipos desconocidos | — | 1. Setear `toast.type` a un valor no contemplado. | Retorna `'info'`. | Edge case defensivo: evita que el icono quede en blanco ante tipos inesperados. |
