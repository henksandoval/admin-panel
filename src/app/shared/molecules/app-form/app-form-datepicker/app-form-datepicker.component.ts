import { ChangeDetectorRef, Component, computed, DestroyRef, forwardRef, inject, input, isDevMode, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, NgControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { provideNativeDateAdapter } from '@angular/material/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs/operators';
import { AppFormDatepickerOptions, APP_FORM_DATEPICKER_DEFAULTS } from './app-form-datepicker.model';

interface ErrorState {
  shouldShow: boolean;
  message: string;
}

@Component({
  selector: 'app-form-datepicker',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, MatIconModule],
  providers: [
    provideNativeDateAdapter(),
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppFormDatepickerComponent),
      multi: true
    }
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
        [matDatepicker]="picker"
        [formControl]="internalControl"
        [placeholder]="fullConfig().placeholder"
        [min]="fullConfig().minDate"
        [max]="fullConfig().maxDate"
        [attr.aria-label]="fullConfig().ariaLabel"
        [required]="isRequired"
        (blur)="handleBlur()">

      @if(fullConfig().suffix) {
        <span matTextSuffix>{{ fullConfig().suffix }}</span>
      }

      @if(fullConfig().icon) {
        <mat-icon matPrefix>{{ fullConfig().icon }}</mat-icon>
      }

      <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
      <mat-datepicker #picker [startView]="fullConfig().startView"></mat-datepicker>

      @if(fullConfig().hint) {
        <mat-hint>{{ fullConfig().hint }}</mat-hint>
      }

      @if(fullConfig().showErrors && errorState.shouldShow) {
        <mat-error>{{ errorState.message }}</mat-error>
      }
    </mat-form-field>
  `
})
export class AppFormDatepickerComponent implements ControlValueAccessor, AfterViewInit {
  config = input<AppFormDatepickerOptions>({});
  fullConfig = computed(() => ({
    label: '',
    placeholder: '',
    hint: '',
    icon: '',
    prefix: '',
    suffix: '',
    ariaLabel: '',
    errorMessages: {},
    ...APP_FORM_DATEPICKER_DEFAULTS,
    ...this.config()
  }));

  internalControl = new FormControl<Date | null>(null);
  public ngControl: NgControl | null = null;
  public isRequired = false;

  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private hasCheckedConnection = false;

  private onChange: (value: Date | null) => void = () => {};
  private onTouched: () => void = () => {};

  private readonly defaultErrorMessages: Record<string, string> = {
    required: 'This field is required',
    matDatepickerMin: 'Date is too early',
    matDatepickerMax: 'Date is too late',
    matDatepickerFilter: 'Invalid date',
    matDatepickerParse: 'Invalid date format'
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
        `⚠️ AppFormDatepickerComponent: No se detectó conexión con NgControl.\n\n` +
        `Si estás usando formControlName, asegúrate de agregar la directiva appFormDatepickerConnector.\n\n` +
        `Uso correcto:\n` +
        `<app-form-datepicker formControlName="birthDate" [config]="config" appFormDatepickerConnector>\n` +
        `</app-form-datepicker>\n\n` +
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

  writeValue(value: Date | null): void {
    this.internalControl.setValue(value, { emitEvent: false });
  }

  registerOnChange(fn: (value: Date | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    isDisabled ? this.internalControl.disable({ emitEvent: false }) : this.internalControl.enable({ emitEvent: false });
  }
}
