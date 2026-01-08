import { ChangeDetectorRef, Component, computed, DestroyRef, forwardRef, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, NgControl, ReactiveFormsModule, Validators
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs/operators';
import { FormFieldInputConfig, FormFieldInputOptions } from './form-field-input.model';

interface ErrorState {
  shouldShow: boolean;
  message: string;
}

@Component({
  selector: 'app-form-field-input',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatIconModule
  ],
  template: `
    <mat-form-field class="w-full" [appearance]="fullConfig().appearance">
      <mat-label *ngIf="fullConfig().label">{{ fullConfig().label }}</mat-label>
      <span *ngIf="fullConfig().prefix" matTextPrefix>{{ fullConfig().prefix }}&nbsp;</span>
      <input
        matInput
        [type]="fullConfig().type"
        [formControl]="internalControl"
        (blur)="handleBlur()"
        [placeholder]="fullConfig().placeholder"
        [attr.aria-label]="fullConfig().ariaLabel"
        [required]="isRequired"
      >
      <span *ngIf="fullConfig().suffix" matTextSuffix>{{ fullConfig().suffix }}</span>
      <mat-icon *ngIf="fullConfig().icon" matSuffix>{{ fullConfig().icon }}</mat-icon>
      <mat-hint *ngIf="fullConfig().hint">{{ fullConfig().hint }}</mat-hint>
      <mat-error *ngIf="errorState.shouldShow">
        {{ errorState.message }}
      </mat-error>
    </mat-form-field>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormFieldInputComponent),
      multi: true
    }
  ]
})
export class FormFieldInputComponent implements ControlValueAccessor {
  config = input<FormFieldInputOptions>({});
  fullConfig = computed<FormFieldInputConfig>(() => ({
    appearance: 'fill', type: 'text', label: '', placeholder: '', hint: '',
    icon: '', prefix: '', suffix: '', ariaLabel: '', errorMessages: {},
    ...this.config()
  }));

  internalControl = new FormControl('');
  public ngControl: NgControl | null = null;
  public isRequired = false;

  private readonly changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  private readonly defaultErrorMessages: Record<string, string> = {
    required: '$localize`:@@common.form.required:This field is required`',
    email: '$localize`:@@common.form.invalidEmail:Please enter a valid email address`',
    minlength: '$localize`:@@common.form.minlength:The value is too short`',
    maxlength: '$localize`:@@common.form.maxlength:The value is too long`',
    pattern: '$localize`:@@common.form.pattern:The format is not valid`'
  };

  constructor() {
    this.internalControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(value => {
        this.onChange(value);
      });
  }

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

  public get errorState(): ErrorState {
    const control = this.ngControl?.control;
    const shouldShow = !!(control && control.invalid && (control.touched || control.dirty));
    if (!shouldShow) return { shouldShow: false, message: '' };
    const errors = control.errors;
    if (!errors) return { shouldShow: false, message: '' };
    const errorKey = Object.keys(errors)[0];
    const customMessages = this.fullConfig().errorMessages || {};
    const message = customMessages[errorKey] || this.defaultErrorMessages[errorKey] || '$localize`:@@common.form.validationError:Validation error`';
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
