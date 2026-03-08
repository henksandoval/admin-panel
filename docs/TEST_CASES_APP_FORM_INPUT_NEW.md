# Test Cases: AppFormInputComponent (patrón `control` input)

> Componente: `app-form-input-new`  
> Arquitectura objetivo: el componente **no implementa CVA**. Recibe un `FormControl` directamente como `input.required<FormControl>()`.

---

## TC-01 — Muestra el valor del control en el input

**Dado** un `FormControl` con valor inicial `'admin@empresa.com'`  
**Cuando** se pasa ese control al componente  
**Entonces** el `<input>` nativo renderiza el valor `'admin@empresa.com'`

> **Valor:** verifica el binding fundamental. Si esto falla, todo lo demás falla.

---

## TC-02 — Actualiza el FormControl cuando el usuario escribe

**Dado** un `FormControl` vacío  
**Cuando** el usuario escribe `'nuevo@valor.com'` en el `<input>`  
**Entonces** `control.value` refleja `'nuevo@valor.com'`

> **Valor:** verifica que la comunicación es bidireccional —no solo de control a vista.

---

## TC-03 — Muestra el error correcto cuando el control es inválido y ha sido tocado

**Dado** un `FormControl` con `Validators.required` y sin valor  
**Cuando** el control se marca como `touched`  
**Entonces** `<mat-error>` está presente y muestra el mensaje de error correspondiente

> **Valor:** es el comportamiento de UX más crítico del componente — sin esto, los formularios no comunican errores.

---

## TC-04 — No muestra error si el control es inválido pero no ha sido tocado

**Dado** un `FormControl` con `Validators.required` y sin valor (estado inicial)  
**Cuando** el control NO ha sido tocado ni modificado  
**Entonces** `<mat-error>` no está presente en el DOM

> **Valor:** evitar mostrar errores antes de que el usuario interactúe — UX básica de formularios.

---

## TC-05 — Los `errorMessages` del config sobreescriben los mensajes por defecto

**Dado** un `FormControl` con `Validators.required`, marcado como `touched`  
**Y** un `config` con `errorMessages: { required: 'El email es obligatorio' }`  
**Entonces** `<mat-error>` muestra `'El email es obligatorio'` en lugar del mensaje por defecto

> **Valor:** es la razón de existir del `config.errorMessages` — si no funciona, el componente no es personalizable.

---

## TC-06 — El input queda deshabilitado cuando el FormControl está deshabilitado

**Dado** un `FormControl` deshabilitado (`control.disable()`)  
**Cuando** se pasa ese control al componente  
**Entonces** el `<input>` nativo tiene el atributo `disabled`

> **Valor:** los estados de disable son frecuentes en formularios con lógica condicional.

---

## TC-07 — `isRequired` es `true` cuando el control tiene `Validators.required`

**Dado** un `FormControl` con `Validators.required`  
**Cuando** se pasa al componente  
**Entonces** la propiedad `isRequired` del componente es `true` y el `<input>` tiene `[required]="true"`

> **Valor:** necesario para que `<mat-form-field>` muestre el asterisco de campo obligatorio correctamente.

---

## TC-08 — No muestra error mientras el usuario escribe, solo al perder el foco

**Dado** un `FormControl` con `Validators.email` y sin valor  
**Cuando** el usuario escribe texto inválido (control pasa a `dirty`)  
**Entonces** `errorState.shouldShow` es `false` — el error no se muestra  
**Cuando** el campo pierde el foco (control pasa a `touched`)  
**Entonces** `errorState.shouldShow` es `true` — el error aparece

> **Valor:** evitar interrumpir al usuario con errores mientras está escribiendo. El feedback se da al salir del campo (patrón Angular Material recomendado).
