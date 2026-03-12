import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AppButtonComponent } from '@ui-atoms/app-button';
import { AppCheckboxComponent } from '@ui-atoms/app-checkbox';
import { AppToggleGroupComponent } from '@ui-atoms/app-toggle-group';
import { ToggleOption } from '@ui-atoms/app-toggle-group';
import { CheckboxColor, CheckboxLabelPosition, CheckboxSize } from '@ui-atoms/app-checkbox';
import {
  API_PROPERTIES,
  BEST_PRACTICES,
  CHECKBOX_COLORS,
  CHECKBOX_DEFAULTS,
  CHECKBOX_SIZES,
  STATE_GUIDES
} from './checkboxes.data';
import { PdsPageLayoutComponent } from '@features/pds/shared/templates/pds-page-layout';
import { AppCardComponent } from '@ui-atoms/app-card';

@Component({
  selector: 'app-checkboxes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    AppButtonComponent,
    AppCheckboxComponent,
    AppToggleGroupComponent,
    PdsPageLayoutComponent,
    AppCardComponent
  ],
  templateUrl: './checkboxes.component.html'
})
export default class CheckboxesComponent {
  readonly selectedState = signal<'checked' | 'unchecked' | 'indeterminate'>('checked');
  readonly selectedColor = signal<CheckboxColor>(CHECKBOX_DEFAULTS.color);
  readonly size = signal<CheckboxSize>(CHECKBOX_DEFAULTS.size);
  readonly labelPosition = signal<CheckboxLabelPosition>(CHECKBOX_DEFAULTS.labelPosition);
  readonly isDisabled = signal<boolean>(CHECKBOX_DEFAULTS.disabled);
  readonly isRequired = signal<boolean>(CHECKBOX_DEFAULTS.required);
  readonly checkboxLabel = signal<string>('Checkbox Label');
  readonly CHECKBOX_COLORS = CHECKBOX_COLORS;
  readonly CHECKBOX_SIZES = CHECKBOX_SIZES;
  readonly BEST_PRACTICES = BEST_PRACTICES;
  readonly API_PROPERTIES = API_PROPERTIES;
  readonly STATE_GUIDES = STATE_GUIDES;
  readonly stateOptions: ToggleOption[] = [
    { value: 'checked', label: 'Checked' },
    { value: 'unchecked', label: 'Unchecked' },
    { value: 'indeterminate', label: 'Indeterminate' }
  ];
  readonly colorOptions: ToggleOption[] = [
    { value: 'primary', label: 'Primary' },
    { value: 'secondary', label: 'Secondary' },
    { value: 'tertiary', label: 'Tertiary' }
  ];
  readonly sizeOptions: ToggleOption[] = [
    { value: 'small', label: 'S' },
    { value: 'medium', label: 'M' },
    { value: 'large', label: 'L' }
  ];
  readonly labelPositionOptions: ToggleOption[] = [
    { value: 'before', label: 'Before' },
    { value: 'after', label: 'After' }
  ];
  readonly isChecked = computed(() => this.selectedState() === 'checked');
  readonly isIndeterminate = computed(() => this.selectedState() === 'indeterminate');
  readonly generatedCode = computed(() => {
    const state = this.selectedState();
    const color = this.selectedColor();
    const sizeValue = this.size();
    const labelPos = this.labelPosition();
    const disabled = this.isDisabled();
    const required = this.isRequired();
    const label = this.checkboxLabel();

    let code = '<app-checkbox';

    if (state === 'checked') {
      code += '\n  [checked]="true"';
    } else if (state === 'indeterminate') {
      code += '\n  [indeterminate]="true"';
    }

    if (color !== CHECKBOX_DEFAULTS.color) {
      code += `\n  color="${color}"`;
    }

    if (sizeValue !== CHECKBOX_DEFAULTS.size) {
      code += `\n  size="${sizeValue}"`;
    }

    if (labelPos !== CHECKBOX_DEFAULTS.labelPosition) {
      code += `\n  labelPosition="${labelPos}"`;
    }

    if (disabled !== CHECKBOX_DEFAULTS.disabled) {
      code += `\n  [disabled]="true"`;
    }

    if (required !== CHECKBOX_DEFAULTS.required) {
      code += `\n  [required]="true"`;
    }

    code += `>\n  ${label}\n</app-checkbox>`;

    return code;
  });
  private readonly router = inject(Router);

  goBack(): void {
    void this.router.navigate(['/pds/index']);
  }
}


