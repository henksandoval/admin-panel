import { Component, computed, input, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';
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
})
export class AppCheckboxComponent {
  checked = model<boolean>(false);
  color = input<CheckboxColor>('primary');
  size = input<CheckboxSize>('medium');
  labelPosition = input<CheckboxLabelPosition>('after');
  disabled = input<boolean>(false);
  indeterminate = input<boolean>(false);
  required = input<boolean>(false);
  ariaLabel = input<string>();

  changed = output<boolean>();

  checkboxClasses = computed(() => {
    const classes: string[] = [];

    if (this.size() !== 'medium') {
      classes.push(`checkbox-size-${this.size()}`);
    }

    return classes.join(' ');
  });

  onCheckboxChange(event: any): void {
    this.checked.set(event.checked);
    this.changed.emit(event.checked);
  }
}
