import { ChangeDetectorRef, Component, computed, DestroyRef, forwardRef, inject, input, isDevMode, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, NgControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs/operators';
import { AppFormSelectConfig, APP_FORM_SELECT_DEFAULTS, SelectOption } from './app-form-select.model';

interface ErrorState {
  shouldShow: boolean;
  message: string;
}

@Component({
  selector: 'app-form-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, MatIconModule],
  template: `
    <mat-form-field class="w-full" [appearance]="fullConfig().appearance">
      @if(fullConfig().label) {
        <mat-label>{{ fullConfig().label }}</mat-label>
      }

      @if(fullConfig().icon) {
        <mat-icon matPrefix>{{ fullConfig().icon }}</mat-icon>
      }

      <mat-select
        [formControl]="internalControl"
        [placeholder]="fullConfig().placeholder"
        [multiple]="fullConfig().multiple"
        [attr.aria-label]="fullConfig().ariaLabel"
        [panelClass]="fullConfig().panelClass || ''"
        (blur)="handleBlur()">

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

      @if(fullConfig().hint) {
        <mat-hint>{{ fullConfig().hint }}</mat-hint>
      }

      @if(fullConfig().showErrors && errorState.shouldShow) {
        <mat-error>{{ errorState.message }}</mat-error>
      }
    </mat-form-field>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppFormSelectComponent),
      multi: true
    }
  ]
})
export class AppFormSelectComponent<T = any> implements ControlValueAccessor, AfterViewInit {
  options = input.required<SelectOption<T>[]>();
  config = input<AppFormSelectConfig>({});

  fullConfig = computed(() => ({
    label: '',
    placeholder: '',
    hint: '',
    icon: '',
    errorMessages: {},
    ...APP_FORM_SELECT_DEFAULTS,
    ...this.config()
  }));

  internalControl = new FormControl<T | T[] | null>(null);
  public ngControl: NgControl | null = null;
  public isRequired = false;
  public isDisabled = false;

  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private hasCheckedConnection = false;

  private onChange: (value: T | T[] | null) => void = () => {};
  private onTouched: () => void = () => {};

  private readonly defaultErrorMessages: Record<string, string> = {
    required: 'This field is required',
    minlength: 'Please select at least {requiredLength} options',
    maxlength: 'Please select no more than {requiredLength} options'
  };

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

  constructor() {
    this.internalControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        this.onChange(value);
      });
  }

  ngAfterViewInit(): void {
    if (isDevMode() && !this.ngControl && !this.hasCheckedConnection) {
      console.warn(
        `⚠️ AppFormSelectComponent: No se detectó conexión con NgControl.\n\n` +
        `Si estás usando formControlName, asegúrate de agregar la directiva appFormSelectConnector.\n\n` +
        `Uso correcto:\n` +
        `<app-form-select formControlName="country" [options]="countries" appFormSelectConnector>\n` +
        `</app-form-select>\n\n` +
        `Sin la directiva, los validadores del FormGroup padre NO se sincronizarán con este componente.`
      );
      this.hasCheckedConnection = true;
    }
  }

  public connectControl(ngControl: NgControl): void {
    this.hasCheckedConnection = true;
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

  public get errorState(): ErrorState {
    const control = this.ngControl?.control;
    const shouldShow = !!(control && control.invalid && (control.touched || control.dirty));
    if (!shouldShow) return { shouldShow: false, message: '' };
    const errors = control.errors;
    if (!errors) return { shouldShow: false, message: '' };
    const errorKey = Object.keys(errors)[0];
    const customMessages = this.fullConfig().errorMessages || {};
    const message = customMessages[errorKey] || this.defaultErrorMessages[errorKey] || 'Validation error';
    return { shouldShow: true, message };
  }


  handleBlur(): void {
    this.onTouched();
  }

  writeValue(value: T | T[] | null): void {
    this.internalControl.setValue(value, { emitEvent: false });
  }

  registerOnChange(fn: (value: T | T[] | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    isDisabled ? this.internalControl.disable({ emitEvent: false }) : this.internalControl.enable({ emitEvent: false });
  }
}
