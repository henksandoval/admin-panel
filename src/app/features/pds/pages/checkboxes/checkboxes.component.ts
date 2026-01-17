import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { AppButtonComponent } from '@shared/atoms/app-button/app-button.component';
import { AppCheckboxComponent } from '@shared/atoms/app-checkbox/app-checkbox.component';
import { AppToggleGroupComponent } from '@shared/atoms/app-toggle-group/app-toggle-group.component';
import { ToggleOption } from '@shared/atoms/app-toggle-group/app-toggle-group.model';
import { CheckboxColor, CheckboxSize, CheckboxLabelPosition } from '@shared/atoms/app-checkbox/app-checkbox.model';
import {
  STATE_GUIDES,
  CHECKBOX_DEFAULTS,
  CHECKBOX_COLORS,
  CHECKBOX_SIZES,
  BEST_PRACTICES,
  API_PROPERTIES,
  type StateGuide
} from './checkboxes.data';
import {PdsCodeBlockComponent} from '@shared/molecules/pds-code-block/pds-code-block.component';
import {PdsBestPracticesComponent} from '@shared/molecules/pds-best-practices/pds-best-practices.component';
import {PdsApiReferenceComponent} from '@shared/molecules/pds-api-reference/pds-api-reference.component';

@Component({
  selector: 'app-checkboxes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatCheckboxModule,
    MatTooltipModule,
    AppButtonComponent,
    AppCheckboxComponent,
    AppToggleGroupComponent,
    PdsCodeBlockComponent,
    PdsBestPracticesComponent,
    PdsApiReferenceComponent
  ],
  templateUrl: './checkboxes.component.html'
})
export default class CheckboxesComponent {
  private readonly router = inject(Router);

  selectedState = signal<'checked' | 'unchecked' | 'indeterminate'>('checked');
  selectedColor = signal<CheckboxColor>(CHECKBOX_DEFAULTS.color);
  size = signal<CheckboxSize>(CHECKBOX_DEFAULTS.size);
  labelPosition = signal<CheckboxLabelPosition>(CHECKBOX_DEFAULTS.labelPosition);
  isDisabled = signal<boolean>(CHECKBOX_DEFAULTS.disabled);
  isRequired = signal<boolean>(CHECKBOX_DEFAULTS.required);
  checkboxLabel = signal<string>('Checkbox Label');

  readonly CHECKBOX_COLORS = CHECKBOX_COLORS;
  readonly CHECKBOX_SIZES = CHECKBOX_SIZES;
  readonly BEST_PRACTICES = BEST_PRACTICES;
  readonly apiProperties = API_PROPERTIES;

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

  isChecked = computed(() => this.selectedState() === 'checked');
  isIndeterminate = computed(() => this.selectedState() === 'indeterminate');

  currentStateGuide = computed(() => {
    return STATE_GUIDES.find(guide => guide.state === this.selectedState());
  });

  generatedCode = computed(() => {
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

  getEmphasisBadgeClasses(emphasis: StateGuide['emphasis']): string {
    const classMap = {
      high: 'emphasis-badge high',
      medium: 'emphasis-badge medium',
      low: 'emphasis-badge low'
    };
    return classMap[emphasis];
  }

  getCardBorderClasses(emphasis: StateGuide['emphasis']): string {
    const classMap = {
      high: 'card-border high',
      medium: 'card-border medium',
      low: 'card-border low'
    };
    return classMap[emphasis];
  }

  goBack(): void {
    this.router.navigate(['/pds/index']);
  }
}
