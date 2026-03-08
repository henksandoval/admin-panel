# Test Cases — AppRadioComponent

| ID del Test | Tipo | Escenario / Propósito | Precondiciones | Pasos clave | Resultado Esperado | Justificación de Valor |
|---|---|---|---|---|---|---|
| TC-DefaultValues | Componente | Crea el componente con todos los valores por defecto | — | 1. Instanciar sin inputs opcionales. 2. Detectar cambios. | `disabled = false`, `ariaLabel = ''`. | Verifica el contrato de la API pública del componente. |
| TC-DOMRender | Componente | Renderiza un `mat-radio-button` en el DOM | Input `value` requerido provisto | 1. Instanciar con `value = 'opcion-1'`. 2. Detectar cambios. | Existe un elemento `mat-radio-button` en el DOM. | Garantiza que el componente produzca el elemento de UI esperado. |
| TC-DisabledState | Componente | El radio button queda deshabilitado cuando `disabled` es `true` | — | 1. Setear `disabled = true`. 2. Detectar cambios. | El `mat-radio-button` tiene el atributo `disabled`. | Previene la selección de opciones que no deben ser interactuables. |
