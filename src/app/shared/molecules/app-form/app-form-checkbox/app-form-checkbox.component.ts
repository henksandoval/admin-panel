import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  forwardRef,
  inject,
  input,
  isDevMode
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  NgControl,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs/operators';
import { AppCheckboxComponent } from '@shared/atoms/app-checkbox/app-checkbox.component';
import {
  APP_FORM_CHECKBOX_DEFAULTS,
  AppFormCheckboxConfig,
  AppFormCheckboxConfigComplete
} from './app-form-checkbox.model';

interface ErrorState {
  shouldShow: boolean;
  message: string;
}

@Component({
  selector: 'app-form-checkbox',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AppCheckboxComponent],
  template: `
    <div class="form-checkbox-wrapper">
      <app-checkbox
        [checked]="internalControl.value ?? false"
        [disabled]="isDisabled"
        [color]="fullConfig().color"
        [size]="fullConfig().size"
        [labelPosition]="fullConfig().labelPosition"
        [indeterminate]="fullConfig().indeterminate"
        [required]="isRequired"
        [ariaLabel]="fullConfig().ariaLabel"
        (changed)="onCheckboxChange($event)">
        <ng-content/>
      </app-checkbox>

      @if (fullConfig().showErrors && errorState.shouldShow) {
        <div class="form-checkbox-error text-sm mt-1" role="alert">
          {{ errorState.message }}
        </div>
      }
    </div>
  `,
  styles: [`
    .form-checkbox-wrapper {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .form-checkbox-error {
      color: var(--mat-sys-error);
      padding-left: 32px;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppFormCheckboxComponent),
      multi: true
    }
  ]
})
export class AppFormCheckboxComponent implements ControlValueAccessor, AfterViewInit {
  readonly config = input<AppFormCheckboxConfig>({});
  readonly fullConfig = computed<AppFormCheckboxConfigComplete>(() => ({
    ...APP_FORM_CHECKBOX_DEFAULTS,
    ...this.config()
  }));

  internalControl = new FormControl<boolean>(false);
  public ngControl: NgControl | null = null;
  public isRequired = false;
  public isDisabled = false;

  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private hasCheckedConnection = false;
  private readonly defaultErrorMessages: Record<string, string> = {
    required: 'This field must be checked',
    requiredTrue: 'You must accept this to continue'
  };

  constructor() {
    this.internalControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        this.onChange(value ?? false);
      });
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

  ngAfterViewInit(): void {
    if (isDevMode() && !this.ngControl && !this.hasCheckedConnection) {
      console.warn(
        `⚠️ AppFormCheckboxComponent: No se detectó conexión con NgControl.\n\n` +
        `Si estás usando formControlName, asegúrate de agregar la directiva appFormCheckboxConnector.\n\n` +
        `Uso correcto:\n` +
        `<app-form-checkbox formControlName="acceptTerms" appFormCheckboxConnector>\n` +
        `  Accept terms\n` +
        `</app-form-checkbox>\n\n` +
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
      // eslint-disable-next-line @typescript-eslint/unbound-method
      this.isRequired = parentControl.hasValidator(Validators.required) || parentControl.hasValidator(Validators.requiredTrue);
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

  onCheckboxChange(checked: boolean): void {
    this.internalControl.setValue(checked);
    this.onTouched();
  }

  writeValue(value: boolean): void {
    this.internalControl.setValue(value ?? false, { emitEvent: false });
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    if (isDisabled) {
      this.internalControl.disable({ emitEvent: false });
    } else {
      this.internalControl.enable({ emitEvent: false });
    }
  }

  private onChange: (value: boolean) => void = () => {};

  private onTouched: () => void = () => {};
}
