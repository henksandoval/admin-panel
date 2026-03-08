# Test Cases: passwordMatchValidator

| ID del Test | Tipo | Escenario / Propósito | Precondiciones | Pasos clave | Resultado Esperado | Justificación de Valor |
|---|---|---|---|---|---|---|
| TC-PasswordMatchValid | Componente | Contraseñas iguales retornan `null` (sin error) | `FormGroup` con controles `password` y `confirm` con el mismo valor no vacío | 1. Asignar `password = 'Abc12345'` y `confirm = 'Abc12345'`. 2. Ejecutar el validador. | Retorna `null` | Valida el happy path del validador; es la condición que desbloquea el envío del formulario |
| TC-PasswordMismatch | Componente | Contraseñas distintas retornan `{ passwordMismatch: true }` | `FormGroup` con `password = 'Abc12345'` y `confirm = 'Different1'` | 1. Asignar valores distintos. 2. Ejecutar el validador. | Retorna `{ passwordMismatch: true }` | Es el error de negocio que el validador fue creado para detectar; su ausencia permitiría contraseñas inconsistentes |
| TC-PasswordConfirmEmpty | Componente | Si `confirm` está vacío el validador no produce errores prematuros | `FormGroup` con `password = 'Abc12345'` y `confirm = ''` | 1. Asignar `confirm = ''`. 2. Ejecutar el validador. | Retorna `null` | Evita que el error `passwordMismatch` aparezca antes de que el usuario haya tocado el segundo campo |
