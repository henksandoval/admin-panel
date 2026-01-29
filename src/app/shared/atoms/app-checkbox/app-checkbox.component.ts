import { Component, computed, forwardRef, input, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CheckboxColor, CheckboxSize, CheckboxLabelPosition } from './app-checkbox.model';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [CommonModule, MatCheckboxModule],
  template: `
    <mat-checkbox
      [checked]="checked()"
      [disabled]="disabled()"
      [indeterminate]="indeterminate()"
      [labelPosition]="labelPosition()"
      [required]="required()"
      [attr.color]="color()"
      [attr.aria-label]="ariaLabel()"
      [class]="checkboxClasses()"
      (change)="onCheckboxChange($event)">
      <ng-content />
    </mat-checkbox>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppCheckboxComponent),
      multi: true
    }
  ]
})
export class AppCheckboxComponent implements ControlValueAccessor {
  checked = model<boolean>(false);
  color = input<CheckboxColor>('primary');
  size = input<CheckboxSize>('medium');
  labelPosition = input<CheckboxLabelPosition>('after');
  disabled = input<boolean>(false);
  indeterminate = input<boolean>(false);
  required = input<boolean>(false);
  ariaLabel = input<string>();

  changed = output<boolean>();

  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  checkboxClasses = computed(() => {
    const classes: string[] = [];

    if (this.size() !== 'medium') {
      classes.push(`checkbox-size-${this.size()}`);
    }

    return classes.join(' ');
  });

  onCheckboxChange(event: any): void {
    const newValue = event.checked;
    this.checked.set(newValue);
    this.onChange(newValue);
    this.onTouched();
    this.changed.emit(newValue);
  }

  writeValue(value: boolean): void {
    this.checked.set(value ?? false);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Note: disabled is an input signal, it will be set from parent
    // This method is here for CVA compliance but Angular will handle it
  }
}
