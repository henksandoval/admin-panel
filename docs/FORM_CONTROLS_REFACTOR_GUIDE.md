# 🛠️ Guía de Implementación: Refactorización de Form Controls

## Opción Recomendada: Hybrid Base/Smart Pattern

---

## 📁 Estructura de Archivos Propuesta

```
src/app/shared/
  form-controls/
    _services/
      form-control-connector.service.ts
      form-validation.service.ts
    
    _base/
      base-form-control.ts (abstract class)
      input-base/
        input-base.component.ts
        input-base.model.ts
      select-base/
        select-base.component.ts
        select-base.model.ts
      checkbox-base/
        checkbox-base.component.ts
        checkbox-base.model.ts
    
    form-input/
      form-input.component.ts
      form-input.component.html
    
    form-select/
      form-select.component.ts
      form-select.component.html
    
    form-checkbox/
      form-checkbox.component.ts
      form-checkbox.component.html
  
  ui/  (mantener atoms puros)
    button/
    badge/
    card/
```

---

## 🔧 Implementación Paso a Paso

### Step 1: Service Compartido - FormControlConnector

```typescript
// _services/form-control-connector.service.ts
import { Injectable } from '@angular/core';
import { AbstractControl, FormControl, NgControl, ValidatorFn } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

export interface ErrorState {
  hasError: boolean;
  message: string;
  errorKey?: string;
}

@Injectable({ providedIn: 'root' })
export class FormControlConnectorService {
  
  private readonly DEFAULT_ERROR_MESSAGES: Record<string, string> = {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    minlength: 'Value is too short',
    maxlength: 'Value is too long',
    min: 'Value is too low',
    max: 'Value is too high',
    pattern: 'Invalid format',
    requiredTrue: 'This field must be checked'
  };

  /**
   * Conecta un componente ControlValueAccessor con NgControl
   * Sincroniza validadores y maneja el ciclo de vida
   */
  connectToParentControl(
    ngControl: NgControl,
    internalControl: FormControl,
    valueAccessor: any
  ): void {
    if (!ngControl) return;

    // Establecer el valueAccessor
    ngControl.valueAccessor = valueAccessor;

    const parentControl = ngControl.control;
    if (!parentControl) return;

    // Sincronizar validadores del padre al control interno
    const validators = parentControl.validator;
    if (validators) {
      internalControl.setValidators(validators);
      internalControl.updateValueAndValidity({ emitEvent: false });
    }
  }

  /**
   * Verifica si un control tiene un validador específico
   */
  hasValidator(control: AbstractControl | null, validatorType: any): boolean {
    if (!control) return false;
    return control.hasValidator(validatorType);
  }

  /**
   * Obtiene el estado de error de un control
   */
  getErrorState(
    control: AbstractControl | null,
    customMessages?: Record<string, string>
  ): ErrorState {
    if (!control) {
      return { hasError: false, message: '' };
    }

    const shouldShow = control.invalid && (control.touched || control.dirty);
    
    if (!shouldShow || !control.errors) {
      return { hasError: false, message: '' };
    }

    const errorKey = Object.keys(control.errors)[0];
    const errorValue = control.errors[errorKey];
    
    const message = this.getErrorMessage(errorKey, errorValue, customMessages);

    return {
      hasError: true,
      message,
      errorKey
    };
  }

  /**
   * Obtiene un stream observable del estado de error
   */
  getErrorState$(
    control: AbstractControl | null,
    customMessages?: Record<string, string>
  ): Observable<ErrorState> {
    if (!control) {
      return new Observable(observer => {
        observer.next({ hasError: false, message: '' });
      });
    }

    return control.statusChanges.pipe(
      startWith(control.status),
      map(() => this.getErrorState(control, customMessages))
    );
  }

  /**
   * Genera el mensaje de error apropiado
   */
  private getErrorMessage(
    errorKey: string,
    errorValue: any,
    customMessages?: Record<string, string>
  ): string {
    // Prioridad: mensaje custom > mensaje interpolado > mensaje default
    
    // 1. Mensaje custom
    if (customMessages?.[errorKey]) {
      return this.interpolateErrorMessage(customMessages[errorKey], errorValue);
    }

    // 2. Mensaje default interpolado
    if (this.DEFAULT_ERROR_MESSAGES[errorKey]) {
      return this.interpolateErrorMessage(this.DEFAULT_ERROR_MESSAGES[errorKey], errorValue);
    }

    // 3. Fallback
    return 'Validation error';
  }

  /**
   * Interpola valores en mensajes de error
   * Ejemplo: "Must be at least {min}" → "Must be at least 18"
   */
  private interpolateErrorMessage(message: string, errorValue: any): string {
    if (!errorValue || typeof errorValue !== 'object') {
      return message;
    }

    let result = message;
    Object.keys(errorValue).forEach(key => {
      result = result.replace(`{${key}}`, errorValue[key]);
    });

    return result;
  }
}
```

---

### Step 2: Abstract Base Class

```typescript
// _base/base-form-control.ts
import { Directive, inject, Optional, Self, DestroyRef, AfterViewInit } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControlConnectorService, ErrorState } from '../_services/form-control-connector.service';

@Directive()
export abstract class BaseFormControl implements ControlValueAccessor, AfterViewInit {
  protected readonly formConnector = inject(FormControlConnectorService);
  protected readonly destroyRef = inject(DestroyRef);
  
  // Inyección automática de NgControl - NO NECESITA DIRECTIVA EXTERNA
  public readonly ngControl = inject(NgControl, { optional: true, self: true });

  protected internalControl = new FormControl();
  protected onChange: (value: any) => void = () => {};
  protected onTouched: () => void = () => {};

  public isRequired = false;
  public isDisabled = false;

  constructor() {
    // Auto-conectar con NgControl si existe
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }

    // Propagar cambios del control interno
    this.internalControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        this.onChange(value);
      });
  }

  ngAfterViewInit(): void {
    if (this.ngControl?.control) {
      // Conectar con el control padre
      this.formConnector.connectToParentControl(
        this.ngControl,
        this.internalControl,
        this
      );

      // Detectar si es required
      this.isRequired = this.formConnector.hasValidator(
        this.ngControl.control,
        Validators.required
      );
    }
  }

  /**
   * Obtiene el estado de error actual
   */
  get errorState(): ErrorState {
    return this.formConnector.getErrorState(
      this.ngControl?.control || null,
      this.getCustomErrorMessages()
    );
  }

  /**
   * Método abstracto para obtener mensajes de error custom
   * Cada componente hijo puede override esto
   */
  protected abstract getCustomErrorMessages(): Record<string, string> | undefined;

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    this.internalControl.setValue(value, { emitEvent: false });
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    isDisabled 
      ? this.internalControl.disable({ emitEvent: false })
      : this.internalControl.enable({ emitEvent: false });
  }

  protected handleBlur(): void {
    this.onTouched();
  }
}
```

---

### Step 3: Base Component - Input

```typescript
// _base/input-base/input-base.component.ts
import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { BaseFormControl } from '../base-form-control';
import { InputBaseConfig, INPUT_DEFAULTS } from './input-base.model';

@Component({
  selector: 'app-input-base',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatInputModule],
  template: `
    <input
      matInput
      [type]="fullConfig().type"
      [formControl]="internalControl"
      [placeholder]="fullConfig().placeholder"
      [required]="isRequired"
      [disabled]="isDisabled"
      [attr.aria-label]="fullConfig().ariaLabel"
      (blur)="handleBlur()"
    />
  `
})
export class InputBaseComponent extends BaseFormControl {
  config = input<InputBaseConfig>({});
  
  fullConfig = computed<Required<InputBaseConfig>>(() => ({
    ...INPUT_DEFAULTS,
    ...this.config()
  }));

  protected getCustomErrorMessages(): Record<string, string> | undefined {
    return this.config().errorMessages;
  }
}
```

```typescript
// _base/input-base/input-base.model.ts
export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';

export interface InputBaseConfig {
  type?: InputType;
  placeholder?: string;
  ariaLabel?: string;
  errorMessages?: Record<string, string>;
}

export const INPUT_DEFAULTS: Required<InputBaseConfig> = {
  type: 'text',
  placeholder: '',
  ariaLabel: '',
  errorMessages: {}
};
```

---

### Step 4: Smart Component - Form Input

```typescript
// form-input/form-input.component.ts
import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { InputBaseComponent } from '../_base/input-base/input-base.component';
import { FormInputConfig, FORM_INPUT_DEFAULTS } from './form-input.model';

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    InputBaseComponent
  ],
  template: `
    <mat-form-field [appearance]="fullConfig().appearance" class="w-full">
      @if (fullConfig().label) {
        <mat-label>{{ fullConfig().label }}</mat-label>
      }
      
      @if (fullConfig().icon) {
        <mat-icon matPrefix>{{ fullConfig().icon }}</mat-icon>
      }
      
      @if (fullConfig().prefix) {
        <span matTextPrefix>{{ fullConfig().prefix }}&nbsp;</span>
      }

      <!-- BASE COMPONENT - Reutilizable -->
      <app-input-base [config]="baseConfig()" />

      @if (fullConfig().suffix) {
        <span matTextSuffix>{{ fullConfig().suffix }}</span>
      }
      
      @if (fullConfig().hint) {
        <mat-hint>{{ fullConfig().hint }}</mat-hint>
      }
      
      @if (showErrors() && errorState.hasError) {
        <mat-error>{{ errorState.message }}</mat-error>
      }
    </mat-form-field>
  `
})
export class FormInputComponent extends InputBaseComponent {
  config = input<FormInputConfig>({});
  
  fullConfig = computed<Required<FormInputConfig>>(() => ({
    ...FORM_INPUT_DEFAULTS,
    ...this.config()
  }));

  // Config para el componente base
  baseConfig = computed(() => ({
    type: this.fullConfig().type,
    placeholder: this.fullConfig().placeholder,
    ariaLabel: this.fullConfig().ariaLabel,
    errorMessages: this.fullConfig().errorMessages
  }));

  showErrors = computed(() => this.fullConfig().showErrors);

  protected getCustomErrorMessages(): Record<string, string> | undefined {
    return this.fullConfig().errorMessages;
  }
}
```

```typescript
// form-input/form-input.model.ts
import { MatFormFieldAppearance } from '@angular/material/form-field';
import { InputBaseConfig } from '../_base/input-base/input-base.model';

export interface FormInputConfig extends InputBaseConfig {
  label?: string;
  hint?: string;
  icon?: string;
  prefix?: string;
  suffix?: string;
  appearance?: MatFormFieldAppearance;
  showErrors?: boolean;
}

export const FORM_INPUT_DEFAULTS: Required<FormInputConfig> = {
  type: 'text',
  placeholder: '',
  ariaLabel: '',
  errorMessages: {},
  label: '',
  hint: '',
  icon: '',
  prefix: '',
  suffix: '',
  appearance: 'fill',
  showErrors: true
};
```

---

### Step 5: Base Component - Select

```typescript
// _base/select-base/select-base.component.ts
import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { BaseFormControl } from '../base-form-control';
import { SelectOption, SelectBaseConfig, SELECT_BASE_DEFAULTS } from './select-base.model';

@Component({
  selector: 'app-select-base',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSelectModule],
  template: `
    <mat-select
      [formControl]="internalControl"
      [placeholder]="fullConfig().placeholder"
      [multiple]="fullConfig().multiple"
      [required]="isRequired"
      [disabled]="isDisabled"
      [attr.aria-label]="fullConfig().ariaLabel"
      (blur)="handleBlur()"
    >
      @if (hasGroups()) {
        @for (group of groupedOptions(); track group.name) {
          <mat-optgroup [label]="group.name">
            @for (option of group.options; track option.value) {
              <mat-option [value]="option.value" [disabled]="option.disabled || false">
                {{ option.label }}
              </mat-option>
            }
          </mat-optgroup>
        }
      } @else {
        @for (option of options(); track option.value) {
          <mat-option [value]="option.value" [disabled]="option.disabled || false">
            {{ option.label }}
          </mat-option>
        }
      }
    </mat-select>
  `
})
export class SelectBaseComponent<T = any> extends BaseFormControl {
  options = input.required<SelectOption<T>[]>();
  config = input<SelectBaseConfig>({});

  fullConfig = computed<Required<SelectBaseConfig>>(() => ({
    ...SELECT_BASE_DEFAULTS,
    ...this.config()
  }));

  hasGroups = computed(() => {
    return this.options().some(opt => opt.group !== undefined);
  });

  groupedOptions = computed(() => {
    const groups = new Map<string, SelectOption<T>[]>();
    this.options().forEach(option => {
      const groupName = option.group || 'default';
      if (!groups.has(groupName)) {
        groups.set(groupName, []);
      }
      groups.get(groupName)!.push(option);
    });
    return Array.from(groups.entries()).map(([name, options]) => ({ name, options }));
  });

  protected getCustomErrorMessages(): Record<string, string> | undefined {
    return this.config().errorMessages;
  }
}
```

---

### Step 6: Smart Component - Form Select

```typescript
// form-select/form-select.component.ts
import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { SelectBaseComponent } from '../_base/select-base/select-base.component';
import { FormSelectConfig, FORM_SELECT_DEFAULTS } from './form-select.model';
import { SelectOption } from '../_base/select-base/select-base.model';

@Component({
  selector: 'app-form-select',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    SelectBaseComponent
  ],
  template: `
    <mat-form-field [appearance]="fullConfig().appearance" class="w-full">
      @if (fullConfig().label) {
        <mat-label>{{ fullConfig().label }}</mat-label>
      }
      
      @if (fullConfig().icon) {
        <mat-icon matPrefix>{{ fullConfig().icon }}</mat-icon>
      }

      <!-- BASE COMPONENT - Reutilizable -->
      <app-select-base [options]="options()" [config]="baseConfig()" />
      
      @if (fullConfig().hint) {
        <mat-hint>{{ fullConfig().hint }}</mat-hint>
      }
      
      @if (showErrors() && errorState.hasError) {
        <mat-error>{{ errorState.message }}</mat-error>
      }
    </mat-form-field>
  `
})
export class FormSelectComponent<T = any> extends SelectBaseComponent<T> {
  config = input<FormSelectConfig>({});
  
  fullConfig = computed<Required<FormSelectConfig>>(() => ({
    ...FORM_SELECT_DEFAULTS,
    ...this.config()
  }));

  baseConfig = computed(() => ({
    placeholder: this.fullConfig().placeholder,
    multiple: this.fullConfig().multiple,
    ariaLabel: this.fullConfig().ariaLabel,
    errorMessages: this.fullConfig().errorMessages
  }));

  showErrors = computed(() => this.fullConfig().showErrors);

  protected getCustomErrorMessages(): Record<string, string> | undefined {
    return this.fullConfig().errorMessages;
  }
}
```

---

## 🎯 Uso Comparativo

### ANTES (Inconsistente):

```html
<!-- app-form-field-input: Muestra errores automáticamente -->
<app-form-field-input
  formControlName="email"
  [config]="{ label: 'Email', type: 'email' }"
  appControlConnector>  <!-- ¿Por qué esto? -->
</app-form-field-input>

<!-- app-select: NO muestra errores -->
<app-select
  formControlName="country"
  [options]="countries"
  [config]="{ label: 'Country' }">
</app-select>
<!-- ¿Cómo muestro errores? 🤷 -->
```

### DESPUÉS (Consistente):

```html
<!-- Smart: Con validación integrada -->
<app-form-input
  formControlName="email"
  [config]="{ label: 'Email', type: 'email', hint: 'Enter your email' }">
</app-form-input>

<app-form-select
  formControlName="country"
  [options]="countries"
  [config]="{ label: 'Country', hint: 'Select your country' }">
</app-form-select>

<app-form-checkbox
  formControlName="accept"
  [config]="{ label: 'I accept terms' }">
</app-form-checkbox>
```

### O usa Base si NO quieres validación visible:

```html
<!-- Base: Sin error display (útil para forms custom) -->
<app-input-base
  formControlName="search"
  [config]="{ type: 'search', placeholder: 'Search...' }">
</app-input-base>
```

---

## 📊 Beneficios de esta Arquitectura

### 1. **Consistencia**
- Todos los form controls usan el mismo patrón
- API unificada con `config` object
- Error handling centralizado

### 2. **Flexibilidad**
- `Base` components para casos simples
- `Smart` components para forms con validación
- Puedes crear variantes (`form-input-material`, `form-input-tailwind`)

### 3. **Reusabilidad**
- Lógica compartida en `BaseFormControl`
- Service `FormControlConnector` reutilizable
- Base components reutilizables en Smart components

### 4. **Mantenibilidad**
- Cambios en validación: solo modificar `FormControlConnectorService`
- Cambios en UI: solo modificar Smart component
- Cambios en lógica base: solo modificar `BaseFormControl`

### 5. **Testabilidad**
- Service aislado → fácil de unit test
- Base components → test lógica sin UI
- Smart components → test integración

---

## 🚀 Plan de Migración

### Phase 1: Crear infraestructura (Día 1)
- ✅ `FormControlConnectorService`
- ✅ `BaseFormControl` abstract class
- ✅ Estructura de carpetas

### Phase 2: Crear Base components (Día 2)
- ✅ `InputBaseComponent`
- ✅ `SelectBaseComponent`
- ✅ `CheckboxBaseComponent`

### Phase 3: Crear Smart components (Día 3)
- ✅ `FormInputComponent`
- ✅ `FormSelectComponent`
- ✅ `FormCheckboxComponent`

### Phase 4: Migración gradual (Día 4-5)
- 🔄 Reemplazar `app-form-field-input` → `app-form-input`
- 🔄 Reemplazar `app-select` → `app-form-select`
- 🔄 Reemplazar `app-checkbox` → `app-form-checkbox`
- 🗑️ Eliminar `appControlConnector` directive

### Phase 5: Limpieza (Día 6)
- 🗑️ Remover componentes antiguos
- 📝 Actualizar documentación
- ✅ Review y tests

---

## 🎯 Resultado Final

```
✅ API consistente en todos los form controls
✅ Validación automática en todos los componentes
✅ NO necesita directivas externas (appControlConnector)
✅ Código compartido y DRY
✅ Fácil de extender y mantener
✅ Testeable y modular
```

---

**¿Listo para empezar?** 🚀
