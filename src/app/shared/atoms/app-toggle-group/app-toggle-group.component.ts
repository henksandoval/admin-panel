import { Component, computed, forwardRef, input, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import {
  TOGGLE_GROUP_DEFAULTS,
  ToggleGroupAppearance,
  ToggleGroupColor,
  ToggleGroupSize,
  ToggleOption
} from './app-toggle-group.model';

@Component({
  selector: 'app-toggle-group',
  standalone: true,
  imports: [CommonModule, MatButtonToggleModule, MatIconModule, FormsModule],
  template: `
    <mat-button-toggle-group
      [value]="value()"
      [disabled]="disabled()"
      [multiple]="multiple()"
      [vertical]="vertical()"
      [hideSingleSelectionIndicator]="hideSingleSelectionIndicator()"
      [hideMultipleSelectionIndicator]="hideMultipleSelectionIndicator()"
      [attr.color]="color()"
      [attr.aria-label]="ariaLabel()"
      [class]="toggleGroupClasses()"
      (change)="onToggleChange($event)">
      @for (option of options(); track option.value) {
        <mat-button-toggle
          [value]="option.value"
          [disabled]="option.disabled || false"
          [attr.aria-label]="option.ariaLabel || option.label">
          @if (option.icon) {
            <mat-icon class="toggle-icon">{{ option.icon }}</mat-icon>
          } @else {
            {{ option.label }}
          }
        </mat-button-toggle>
      }
    </mat-button-toggle-group>
  `,
  styleUrls: ['./app-toggle-group.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppToggleGroupComponent),
      multi: true
    }
  ]
})
export class AppToggleGroupComponent implements ControlValueAccessor {
  readonly options = input.required<ToggleOption[]>();
  readonly color = input<ToggleGroupColor>(TOGGLE_GROUP_DEFAULTS.color);
  readonly size = input<ToggleGroupSize>(TOGGLE_GROUP_DEFAULTS.size);
  readonly appearance = input<ToggleGroupAppearance>(TOGGLE_GROUP_DEFAULTS.appearance);
  readonly disabled = input<boolean>(TOGGLE_GROUP_DEFAULTS.disabled);
  readonly multiple = input<boolean>(TOGGLE_GROUP_DEFAULTS.multiple);
  readonly vertical = input<boolean>(TOGGLE_GROUP_DEFAULTS.vertical);
  readonly hideSingleSelectionIndicator = input<boolean>(TOGGLE_GROUP_DEFAULTS.hideSingleSelectionIndicator);
  readonly hideMultipleSelectionIndicator = input<boolean>(TOGGLE_GROUP_DEFAULTS.hideMultipleSelectionIndicator);
  readonly ariaLabel = input<string>();

  readonly value = model<string | string[] | null>(null);

  changed = output<string | string[]>();

  readonly toggleGroupClasses = computed(() => {
    const classes: string[] = [];

    if (this.size() !== TOGGLE_GROUP_DEFAULTS.size) {
      classes.push(`toggle-size-${this.size()}`);
    }

    if (this.appearance() !== TOGGLE_GROUP_DEFAULTS.appearance) {
      classes.push(`toggle-appearance-${this.appearance()}`);
    }

    return classes.join(' ');
  });

  private onChange: (value: string | string[] | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | string[] | null): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: string | string[] | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onToggleChange(event: any): void {
    const newValue = event.value;
    this.value.set(newValue);
    this.onChange(newValue);
    this.onTouched();
    this.changed.emit(newValue);
  }
}
