import { Component, computed, forwardRef, input, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { SelectConfig, SelectOption, SELECT_DEFAULTS } from './app-select.model';

/**
 * Wrapper component for Angular Material Select with ControlValueAccessor support.
 *
 * @example
 * // With two-way binding
 * <app-select
 *   [(value)]="selectedValue"
 *   [options]="countryOptions"
 *   [config]="{ label: 'Country' }">
 * </app-select>
 *
 * @example
 * // With FormControl
 * <app-select
 *   [formControl]="myControl"
 *   [options]="options"
 *   [config]="{ label: 'Select Option' }">
 * </app-select>
 *
 * @example
 * // Multiple selection
 * <app-select
 *   formControlName="tags"
 *   [options]="options"
 *   [config]="{ label: 'Tags', multiple: true }">
 * </app-select>
 */
@Component({
  selector: 'app-select',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
        [value]="value()"
        [placeholder]="fullConfig().placeholder"
        [multiple]="fullConfig().multiple"
        [required]="fullConfig().required"
        [disabled]="fullConfig().disabled"
        [attr.aria-label]="fullConfig().ariaLabel"
        [panelClass]="fullConfig().panelClass"
        (selectionChange)="onSelectionChange($event)">

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

  value = model<T | T[] | null>(null);

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

  private onChange: (value: T | T[] | null) => void = () => {};
  private onTouched: () => void = () => {};

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

  onSelectionChange(event: any): void {
    const newValue = event.value;
    this.value.set(newValue);
    this.onChange(newValue);
    this.onTouched();
  }

  // ============================================================================
  // ControlValueAccessor Implementation
  // ============================================================================

  writeValue(value: T | T[] | null): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: T | T[] | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // disabled is handled by [disabled] binding in template from config
  }
}
