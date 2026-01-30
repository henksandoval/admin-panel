import { ChangeDetectorRef, Component, computed, DestroyRef, forwardRef, inject, input, isDevMode, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, NgControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs/operators';
import { MatRadioModule } from '@angular/material/radio';
import { AppRadioComponent } from '@shared/atoms/app-radio/app-radio.component';
import { RadioOption, AppFormRadioGroupConfig, AppFormRadioGroupConfigComplete, APP_FORM_RADIO_GROUP_DEFAULTS } from './app-form-radio-group.model';

interface ErrorState {
  shouldShow: boolean;
  message: string;
}

@Component({
  selector: 'app-form-radio-group',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatRadioModule, AppRadioComponent],
  template: `
    <div class="form-radio-group-wrapper">
      @if(fullConfig().label) {
        <label class="text-sm font-medium mb-2 block">
          {{ fullConfig().label }}
          @if(isRequired) {
            <span>*</span>
          }
        </label>
      }

      <mat-radio-group
        [formControl]="internalControl"
        [attr.aria-label]="fullConfig().ariaLabel"
        [class]="fullConfig().layout === 'horizontal' ? 'flex gap-4' : 'flex flex-col gap-2'">
        @for (option of options(); track option.value) {
          <app-radio
            [value]="option.value"
            [disabled]="isDisabled || option.disabled || false">
            {{ option.label }}
          </app-radio>
        }
      </mat-radio-group>

      @if(fullConfig().hint) {
        <div class="text-xs mt-1">{{ fullConfig().hint }}</div>
      }

      @if (fullConfig().showErrors && errorState.shouldShow) {
        <div class="form-radio-error text-sm mt-1" role="alert">
          {{ errorState.message }}
        </div>
      }
    </div>
  `,
  styles: [`
    .form-radio-group-wrapper {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .form-radio-error {
      color: var(--mat-sys-error);
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppFormRadioGroupComponent),
      multi: true
    }
  ]
})
export class AppFormRadioGroupComponent<T = any> implements ControlValueAccessor, AfterViewInit {
  options = input.required<RadioOption<T>[]>();
  config = input<AppFormRadioGroupConfig>({});
  fullConfig = computed<AppFormRadioGroupConfigComplete & Pick<AppFormRadioGroupConfig, 'label' | 'hint' | 'ariaLabel' | 'errorMessages'>>(() => ({
    label: '',
    hint: '',
    ariaLabel: '',
    errorMessages: {},
    ...APP_FORM_RADIO_GROUP_DEFAULTS,
    ...this.config()
  }));

  internalControl = new FormControl<T | null>(null);
  public ngControl: NgControl | null = null;
  public isRequired = false;
  public isDisabled = false;

  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private hasCheckedConnection = false;

  private onChange: (value: T | null) => void = () => {};
  private onTouched: () => void = () => {};

  private readonly defaultErrorMessages: Record<string, string> = {
    required: 'This field is required'
  };

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
        `⚠️ AppFormRadioGroupComponent: No se detectó conexión con NgControl.\n\n` +
        `Si estás usando formControlName, asegúrate de agregar la directiva appFormRadioGroupConnector.\n\n` +
        `Uso correcto:\n` +
        `<app-form-radio-group formControlName="gender" [options]="genderOptions" appFormRadioGroupConnector>\n` +
        `</app-form-radio-group>\n\n` +
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

  writeValue(value: T | null): void {
    this.internalControl.setValue(value, { emitEvent: false });
  }

  registerOnChange(fn: (value: T | null) => void): void {
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
