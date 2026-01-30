import { ChangeDetectorRef, Component, computed, DestroyRef, forwardRef, inject, input, isDevMode, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, NgControl, ReactiveFormsModule, Validators
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs/operators';
import {
  AppFormInputConfig,
  AppFormInputOptions
} from '@shared/molecules/app-form-field-input/app-form-field-input.model';

interface ErrorState {
  shouldShow: boolean;
  message: string;
}

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatIconModule
  ],
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
        [formControl]="internalControl"
        (blur)="handleBlur()"
        [placeholder]="fullConfig().placeholder"
        [attr.aria-label]="fullConfig().ariaLabel"
        [required]="isRequired"
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
      @if(errorState.shouldShow) {
        <mat-error>
          {{ errorState.message }}
        </mat-error>
      }
    </mat-form-field>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppFormInputComponent),
      multi: true
    }
  ]
})
export class AppFormInputComponent implements ControlValueAccessor, AfterViewInit {
  config = input<AppFormInputOptions>({});
  fullConfig = computed<AppFormInputConfig>(() => ({
    appearance: 'fill', type: 'text', label: '', placeholder: '', hint: '',
    icon: '', prefix: '', suffix: '', ariaLabel: '', errorMessages: {},
    ...this.config()
  }));

  internalControl = new FormControl('');
  public ngControl: NgControl | null = null;
  public isRequired = false;

  private readonly changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  private hasCheckedConnection = false;

  onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  private readonly defaultErrorMessages: Record<string, string> = {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    minlength: 'The value is too short',
    maxlength: 'The value is too long',
    pattern: 'The format is not valid'
  };

  constructor() {
    this.internalControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        this.onChange(value);
      });
  }

  ngAfterViewInit(): void {
    // Development warning if directive is missing
    if (isDevMode() && !this.ngControl && !this.hasCheckedConnection) {
      console.warn(
        `⚠️ FormFieldInputComponent: No se detectó conexión con NgControl.\n\n` +
        `Si estás usando formControlName, asegúrate de agregar la directiva appControlConnector.\n\n` +
        `Uso correcto:\n` +
        `<app-form-input formControlName="email" [config]="config" appControlConnector>\n` +
        `</app-form-input>\n\n` +
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
    isDisabled ? this.internalControl.disable({ emitEvent: false }) : this.internalControl.enable({ emitEvent: false });
  }
}
