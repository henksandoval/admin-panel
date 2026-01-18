import { Component, computed, forwardRef, inject, input, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, NgControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SelectConfig, SelectOption, SELECT_DEFAULTS } from './app-select.model';

/**
 * Wrapper component for Angular Material Select with ControlValueAccessor support.
 *
 * @example
 * // Basic usage with ngModel
 * <app-select
 *   [(ngModel)]="selectedValue"
 *   [options]="countryOptions"
 *   [config]="{
 *     label: 'Country',
 *     placeholder: 'Select a country'
 *   }">
 * </app-select>
 *
 * @example
 * // Multiple selection
 * <app-select
 *   [(ngModel)]="selectedValues"
 *   [options]="options"
 *   [config]="{
 *     label: 'Tags',
 *     multiple: true
 *   }">
 * </app-select>
 *
 * @example
 * // With FormControl
 * <app-select
 *   [formControl]="myControl"
 *   [options]="options"
 *   [config]="{ label: 'Select Option' }">
 * </app-select>
 */
@Component({
  selector: 'app-select',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule
  ],
  template: `
    <mat-form-field class="w-full" [appearance]="fullConfig().appearance" [class]="selectClasses()">
      <mat-label *ngIf="fullConfig().label">{{ fullConfig().label }}</mat-label>

      @if (fullConfig().icon) {
        <mat-icon matPrefix>{{ fullConfig().icon }}</mat-icon>
      }

      <mat-select
        [formControl]="internalControl"
        [placeholder]="fullConfig().placeholder"
        [multiple]="fullConfig().multiple"
        [required]="fullConfig().required"
        [disabled]="fullConfig().disabled"
        [attr.aria-label]="fullConfig().ariaLabel"
        [panelClass]="fullConfig().panelClass"
        (selectionChange)="onSelectionChange()">

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

      @if (fullConfig().hint) {
        <mat-hint>{{ fullConfig().hint }}</mat-hint>
      }

      @if (errorState().shouldShow) {
        <mat-error>{{ errorState().message }}</mat-error>
      }
    </mat-form-field>
  `,
  styleUrls: ['./app-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppSelectComponent),
      multi: true
    }
  ]
})
export class AppSelectComponent<T = any> implements ControlValueAccessor {
  options = input.required<SelectOption<T>[]>();
  config = input<SelectConfig<T>>({});

  fullConfig = computed<Required<SelectConfig<T>>>(() => ({
    label: '',
    placeholder: '',
    hint: '',
    icon: '',
    errorMessages: {},
    panelClass: '',
    ...SELECT_DEFAULTS,
    ...this.config()
  }));

  internalControl = new FormControl<T | T[] | null>(null);

  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  public ngControl: NgControl | null = null;

  onChange: (value: T | T[] | null) => void = () => {};
  onTouched: () => void = () => {};

  selectClasses = computed(() => {
    const size = this.fullConfig().size;
    return `select-size-${size}`;
  });

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

    return Array.from(groups.entries()).map(([name, options]) => ({
      name,
      options
    }));
  });

  errorState = computed<{ shouldShow: boolean; message: string }>(() => {
    const control = this.internalControl;

    if (!control.invalid || !control.touched) {
      return { shouldShow: false, message: '' };
    }

    const errors = control.errors;
    if (!errors) {
      return { shouldShow: false, message: '' };
    }

    const customMessages = this.fullConfig().errorMessages;
    const errorKey = Object.keys(errors)[0];
    const message = customMessages[errorKey] || this.getDefaultErrorMessage(errorKey, errors[errorKey]);

    return { shouldShow: true, message };
  });

  constructor() {
    try {
      this.ngControl = inject(NgControl, { self: true, optional: true });
      if (this.ngControl) {
        this.ngControl.valueAccessor = this;
      }
    } catch {
      // NgControl not available, component used with [(ngModel)]
    }

    this.internalControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        this.onChange(value);
        this.changeDetectorRef.markForCheck();
      });
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
    if (isDisabled) {
      this.internalControl.disable({ emitEvent: false });
    } else {
      this.internalControl.enable({ emitEvent: false });
    }
  }

  onSelectionChange(): void {
    this.onTouched();
  }

  private getDefaultErrorMessage(errorKey: string, errorValue: any): string {
    const messages: Record<string, string> = {
      required: 'This field is required',
      min: `Minimum value is ${errorValue.min}`,
      max: `Maximum value is ${errorValue.max}`,
      minlength: `Minimum length is ${errorValue.requiredLength}`,
      maxlength: `Maximum length is ${errorValue.requiredLength}`,
      email: 'Please enter a valid email',
      pattern: 'Invalid format'
    };

    return messages[errorKey] || 'Invalid value';
  }
}
