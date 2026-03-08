# Análisis: Warning "Unrecognized Angular Form control name" en WebStorm

> **Fecha:** 2026-03-06  
> **Componentes afectados:** `app-form-input`, `app-form-select` (y todo CVA del ui-kit)  
> **Archivo de referencia:** `login.component.html`

---

## 1. Diagnóstico raíz

El Angular Language Service (usado por WebStorm) valida `formControlName` de forma estática en dos pasos:

| Paso | Validación | Resultado en nuestro caso |
|------|-----------|--------------------------|
| 1 | ¿El control name existe en el `FormGroup`? | ✅ `email` y `password` existen |
| 2 | ¿El host element es un `ControlValueAccessor` reconocido? | ❌ **Falla** |

El paso 2 falla porque el Language Service resuelve CVAs buscando el token `NG_VALUE_ACCESSOR` en los `providers` del componente de forma estática. Aunque `AppFormInputComponent` lo declara, hay **dos factores** que impiden que el análisis estático lo reconozca:

1. **`forwardRef`** — el Language Service no siempre desenvuelve `forwardRef(() => AppFormInputComponent)` correctamente para vincular el CVA al selector.
2. **La directiva connector como intermediaria** — el patrón de "doble pieza" (componente + directiva) hace que `formControlName` se resuelva contra `AppFormInputConnectorDirective` como co-host, pero el Language Service espera que el CVA esté directamente en el componente que matchea `formControlName`.

Cuando el `FormGroup` tiene **tipo genérico inferido** (como en `login.component.ts`), WebStorm activa la validación estricta de control names. Cuando el `FormGroup` es `FormGroup` sin tipo genérico (como en otros formularios del proyecto), WebStorm no puede validar los names y omite la inspección.

---

## 2. Soluciones evaluadas

### ❌ 2.1 Eliminar `forwardRef`

```typescript
// Cambiar esto:
providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AppFormInputComponent), multi: true }]
// Por esto:
providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: AppFormInputComponent, multi: true }]
```

**Resultado:** No resuelve el warning. En Angular 20 con standalone components `forwardRef` ya no es necesario (la clase ya existe en el momento de evaluación del decorator gracias a la semántica de clases ES2022), pero el Language Service sigue sin vincular el CVA al contexto de `formControlName` porque la conexión real se hace en runtime vía la directiva connector.

### ❌ 2.2 Inyectar `NgControl` directamente en el componente

```typescript
export class AppFormInputComponent implements ControlValueAccessor {
  private readonly ngControl = inject(NgControl, { optional: true, self: true });
}
```

**Resultado:** Error circular `NG0200` en runtime. Angular necesita resolver `NgValueAccessor` para construir `NgControl`, pero `NgValueAccessor` apunta al componente que está intentando inyectar `NgControl`. La circularidad es inherente al diseño del DI de Angular para CVAs.

### ❌ 2.3 Silenciar con `// noinspection`

Rechazado por el usuario. No es una solución, es un parche.

---

## 3. Solución recomendada: Inyección de `NgControl` vía `afterNextRender` + eliminación de `NG_VALUE_ACCESSOR`

### Concepto

Angular (v17+) permite romper la circularidad `NG0200` si el componente **no se registra como `NG_VALUE_ACCESSOR`** y en su lugar se auto-asigna como `valueAccessor` del `NgControl` **después** de la construcción del inyector. La clave es usar el `Injector` del propio componente para obtener `NgControl` de forma lazy.

### Arquitectura propuesta

```
ANTES (doble pieza):
  app-form-input.component.ts   → providers: [NG_VALUE_ACCESSOR]
  app-form-input-connector.directive.ts → inject(NgControl) → connectControl()

DESPUÉS (pieza única):
  app-form-input.component.ts   → sin NG_VALUE_ACCESSOR, auto-connect en afterNextRender
  app-form-input-connector.directive.ts → ELIMINADA (o mantenida como deprecated)
```

### Implementación detallada

**`app-form-input.component.ts`** — cambios clave:

```typescript
import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  inject,
  Injector,
  input,
  isDevMode,
  ChangeDetectorRef,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NgControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
// ... otros imports

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [/* ... sin cambios ... */],
  template: `/* ... sin cambios ... */`,
  // ⚠️ SIN providers de NG_VALUE_ACCESSOR
})
export class AppFormInputComponent implements ControlValueAccessor {
  private readonly injector = inject(Injector);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly config = input<AppFormInputOptions>({});
  readonly fullConfig = computed<AppFormInputConfig>(() => ({ /* ...sin cambios... */ }));

  internalControl = new FormControl('');
  public ngControl: NgControl | null = null;
  public isRequired = false;

  constructor() {
    // Suscripción al control interno (sin cambios)
    this.internalControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => this.onChange(value));

    // 🔑 Auto-conexión con NgControl sin circularidad
    afterNextRender(() => {
      const ngControl = this.injector.get(NgControl, null);
      if (ngControl) {
        this.connectControl(ngControl);
      } else if (isDevMode()) {
        // Warning de desarrollo existente
      }
    });
  }

  // connectControl() se mantiene igual que el actual
  public connectControl(ngControl: NgControl): void {
    this.ngControl = ngControl;
    this.ngControl.valueAccessor = this;
    const parentControl = this.ngControl.control;

    if (parentControl) {
      this.isRequired = parentControl.hasValidator(Validators.required);
      this.internalControl.setValidators(parentControl.validator);
      this.internalControl.updateValueAndValidity({ emitEvent: false });

      parentControl.statusChanges.pipe(
        startWith(parentControl.status),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
    }
    this.changeDetectorRef.detectChanges();
  }

  // writeValue, registerOnChange, registerOnTouched, setDisabledState — sin cambios
}
```

### ¿Por qué esto resuelve `NG0200`?

```
ANTES:
  Injector construye AppFormInputComponent
    → necesita NgControl (inyectado en constructor vía directiva)
    → NgControl necesita NG_VALUE_ACCESSOR
    → NG_VALUE_ACCESSOR apunta a AppFormInputComponent
    → 💥 CIRCULAR

DESPUÉS:
  Injector construye AppFormInputComponent
    → NO registra NG_VALUE_ACCESSOR (no hay provider)
    → NgControl se registra via formControlName con DefaultValueAccessor como fallback
    → afterNextRender: componente obtiene NgControl del injector (ya construido)
    → componente se auto-asigna como valueAccessor
    → ✅ Sin circularidad
```

### ¿Por qué esto resuelve el warning de WebStorm?

Al eliminar `formControlName` de la "ecuación CVA" (el componente ya no necesita ser reconocido como CVA para que `formControlName` funcione), el warning desaparece **si** además se ajusta el template:

**Opción A — `formControlName` en el componente (preferida):**

El `formControlName` seguirá en `<app-form-input>`. Angular creará un `FormControlName` directive instance en ese elemento. Como no hay `NG_VALUE_ACCESSOR` registrado, Angular usará el `DefaultValueAccessor` (o ninguno). Luego en `afterNextRender`, el componente se auto-asigna. **Pero el warning persiste** porque WebStorm sigue validando el CVA estáticamente.

**Opción B — Separar `formControlName` en un wrapper `ng-container` (elimina el warning):**

```html
<!-- Reestructurar: ng-container maneja el form control, app-form-input recibe el control como input -->
<form [formGroup]="formGroupLogin" (ngSubmit)="onSubmit()" class="flex flex-col gap-5">
  <app-form-input [config]="emailFieldConfig" [control]="formGroupLogin.controls.email" />
  <app-form-input [config]="passwordFieldConfig()" [control]="formGroupLogin.controls.password" />
</form>
```

Esto requiere cambiar el componente para aceptar un `FormControl` como input en lugar de depender de `formControlName`.

---

## 4. Solución recomendada final: Patrón `control` input (sin CVA)

Esta es la solución más limpia, más mantenible y **completamente compatible** con el análisis estático de WebStorm.

### Filosofía

En lugar de usar el mecanismo `ControlValueAccessor` + `formControlName` (diseñado para elementos nativos y wrappers simples), pasar el `FormControl` directamente como input al componente. Esto es un patrón cada vez más adoptado en la comunidad Angular para componentes de formulario complejos.

### Cambios en `app-form-input.component.ts`

```typescript
@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatIconModule],
  template: `
    <mat-form-field class="w-full" [appearance]="fullConfig().appearance">
      @if(fullConfig().label) {
        <mat-label>{{ fullConfig().label }}</mat-label>
      }
      @if(fullConfig().prefix) {
        <span matTextPrefix>{{ fullConfig().prefix }}&nbsp;</span>
      }
      <input
        matInput
        [type]="fullConfig().type"
        [formControl]="control()"
        [placeholder]="fullConfig().placeholder"
        [attr.aria-label]="fullConfig().ariaLabel"
      >
      @if(fullConfig().suffix) {
        <span matTextSuffix>{{ fullConfig().suffix }}</span>
      }
      @if(fullConfig().icon) {
        <mat-icon matSuffix>{{ fullConfig().icon }}</mat-icon>
      }
      @if(fullConfig().hint) {
        <mat-hint>{{ fullConfig().hint }}</mat-hint>
      }
      @if(errorState().shouldShow) {
        <mat-error>{{ errorState().message }}</mat-error>
      }
    </mat-form-field>
  `,
  // ⚠️ SIN providers de NG_VALUE_ACCESSOR
})
export class AppFormInputComponent {
  // 🔑 El control se pasa directamente como input signal
  readonly control = input.required<FormControl<string>>();
  readonly config = input<AppFormInputOptions>({});
  
  readonly fullConfig = computed<AppFormInputConfig>(() => ({
    appearance: 'fill', type: 'text', label: '', placeholder: '', hint: '',
    icon: '', prefix: '', suffix: '', ariaLabel: '', errorMessages: {},
    ...this.config()
  }));

  // Computed signal para el estado de error (reemplaza el getter)
  readonly errorState = computed<ErrorState>(() => {
    const ctrl = this.control();
    const shouldShow = ctrl.invalid && (ctrl.touched || ctrl.dirty);
    if (!shouldShow) return { shouldShow: false, message: '' };
    const errors = ctrl.errors;
    if (!errors) return { shouldShow: false, message: '' };
    const errorKey = Object.keys(errors)[0];
    const customMessages = this.fullConfig().errorMessages;
    const message = customMessages[errorKey] || this.defaultErrorMessages[errorKey] || 'Validation error';
    return { shouldShow: true, message };
  });

  private readonly defaultErrorMessages: Record<string, string> = {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    minlength: 'The value is too short',
    maxlength: 'The value is too long',
    pattern: 'The format is not valid',
  };
}
```

### Cambios en `login.component.html`

```html
<form [formGroup]="formGroupLogin" (ngSubmit)="onSubmit()" class="flex flex-col gap-5">
  <app-form-input [config]="emailFieldConfig" [control]="formGroupLogin.controls.email" />
  <app-form-input [config]="passwordFieldConfig()" [control]="formGroupLogin.controls.password" />
  <!-- ...resto sin cambios... -->
</form>
```

### Cambios en `login.component.ts`

- Eliminar import de `AppFormInputConnectorDirective` del array `imports`.
- Sin cambios en el `FormGroup` ni en la lógica.

### Cambios en `app-form-input.model.ts`

```typescript
// Agregar defaults para el nuevo patrón
export const FORM_INPUT_DEFAULTS = {
  appearance: 'fill' as const,
  type: 'text' as const,
  label: '',
  placeholder: '',
  hint: '',
  icon: '',
  prefix: '',
  suffix: '',
  ariaLabel: '',
  errorMessages: {} as Record<string, string>,
} as const;
```

---

## 5. Comparativa de soluciones

| Criterio | CVA + Connector (actual) | `afterNextRender` (§3) | `control` input (§4) |
|----------|--------------------------|------------------------|----------------------|
| Warning WebStorm | ❌ Persiste | ⚠️ Puede persistir | ✅ Eliminado |
| Circularidad NG0200 | ✅ Resuelta vía directiva | ✅ Resuelta vía timing | ✅ No aplica |
| Complejidad | Alta (2 archivos por CVA) | Media (1 archivo, lógica async) | **Baja (1 archivo, directo)** |
| Type safety | Parcial (string-based name) | Parcial (string-based name) | **Total (typed FormControl)** |
| Compatibilidad SSR | ✅ | ⚠️ `afterNextRender` no ejecuta en SSR | ✅ |
| Testabilidad | Requiere mock de NgControl | Requiere mock de NgControl | **Solo pasar FormControl** |
| Refactor necesario | N/A | Medio | **Medio-alto** (todos los consumidores) |
| Alineación Angular moderno | Patrón legacy | Transicional | **Patrón idiomático signals** |

---

## 6. Plan de migración (si se elige §4)

### Fase 1 — Compatibilidad dual (no-breaking)

1. Agregar `control` como input **opcional** en `AppFormInputComponent`.
2. Mantener CVA + connector como fallback.
3. Lógica interna: si `control()` está definido, usarlo directamente; si no, usar `internalControl` + CVA.
4. Marcar `appFormInputConnector` como `@deprecated`.

### Fase 2 — Migración de consumidores

1. Migrar cada template que use `formControlName` + `appFormInputConnector` al patrón `[control]`.
2. Orden sugerido: primero `login`, luego features por módulo.

### Fase 3 — Limpieza

1. Hacer `control` **required** (`input.required<FormControl<string>>()`).
2. Eliminar `NG_VALUE_ACCESSOR` provider.
3. Eliminar `internalControl`, `connectControl()`, CVA methods.
4. Eliminar archivos `*-connector.directive.ts`.

### Archivos impactados por feature

| Feature | Archivos |
|---------|----------|
| ui-kit (core) | `app-form-input.component.ts`, `app-form-input.model.ts`, `app-form-input-connector.directive.ts` |
| ui-kit (core) | `app-form-select.component.ts`, `app-form-select.model.ts`, `app-form-select-connector.directive.ts` |
| login | `login.component.html`, `login.component.ts` |
| Cualquier otro consumidor de `app-form-input` / `app-form-select` | HTML + TS |

---

## 7. Conclusión

**La solución recomendada es la §4 (patrón `control` input)** por las siguientes razones:

1. **Elimina el warning** de raíz — no hay `formControlName` en el componente, por lo que WebStorm no tiene nada que validar.
2. **Elimina complejidad** — desaparece la necesidad de CVA, connector directives, `forwardRef`, y `connectControl()`.
3. **Mejora el type safety** — pasar `FormControl<string>` directamente es más seguro que `formControlName="email"` (string mágico).
4. **Se alinea con Angular moderno** — signals, inputs tipados, composición sobre herencia DI.
5. **Compatible con SSR** — no depende de APIs del browser.
6. **Migratable de forma incremental** — la fase dual permite migrar sin romper nada.

