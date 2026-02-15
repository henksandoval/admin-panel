import { Component, computed, input, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule, MatCheckboxChange } from '@angular/material/checkbox';
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
  readonly checked = model<boolean>(false);
  readonly color = input<CheckboxColor>('primary');
  readonly size = input<CheckboxSize>('medium');
  readonly labelPosition = input<CheckboxLabelPosition>('after');
  readonly disabled = input<boolean>(false);
  readonly indeterminate = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly ariaLabel = input<string>();

  changed = output<boolean>();

  readonly checkboxClasses = computed(() => {
    const classes: string[] = [];

    if (this.size() !== 'medium') {
      classes.push(`checkbox-size-${this.size()}`);
    }

    return classes.join(' ');
  });

  onCheckboxChange(event: MatCheckboxChange): void {
    this.checked.set(event.checked);
    this.changed.emit(event.checked);
  }
}
