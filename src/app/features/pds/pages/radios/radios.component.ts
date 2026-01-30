import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AppButtonComponent } from '@shared/atoms/app-button/app-button.component';
import { AppToggleGroupComponent } from '@shared/atoms/app-toggle-group/app-toggle-group.component';
import { AppCheckboxComponent } from '@shared/atoms/app-checkbox/app-checkbox.component';
import { AppFormRadioGroupComponent } from '@shared/molecules/app-form-radio-group/app-form-radio-group.component';
import { AppFormRadioGroupConnectorDirective } from '@shared/molecules/app-form-radio-group/app-form-radio-group-connector.directive';

import {
  RADIO_STATE_GUIDES,
  GENDER_OPTIONS,
  SIZE_OPTIONS,
  PAYMENT_OPTIONS,
  NOTIFICATION_OPTIONS,
  API_PROPERTIES,
  BEST_PRACTICES
} from './radios.data';
import { PdsPageLayoutComponent } from '../../shared/templates/pds-page-layout/pds-page-layout.component';

@Component({
  selector: 'app-radios',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    AppButtonComponent,
    AppToggleGroupComponent,
    AppCheckboxComponent,
    AppFormRadioGroupComponent,
    AppFormRadioGroupConnectorDirective,
    PdsPageLayoutComponent
  ],
  templateUrl: './radios.component.html'
})
export default class RadiosComponent {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  selectedState = signal<'basic' | 'descriptions' | 'horizontal' | 'disabled'>('basic');
  showLabel = signal<boolean>(true);
  showHint = signal<boolean>(true);

  demoForm!: FormGroup;

  readonly RADIO_STATE_GUIDES = RADIO_STATE_GUIDES;
  readonly API_PROPERTIES = API_PROPERTIES;
  readonly BEST_PRACTICES = BEST_PRACTICES;

  stateOptions = [
    { value: 'basic', label: 'Basic' },
    { value: 'descriptions', label: 'With Descriptions' },
    { value: 'horizontal', label: 'Horizontal' },
    { value: 'disabled', label: 'Disabled' }
  ];

  currentOptions = computed(() => {
    const state = this.selectedState();
    if (state === 'basic') return GENDER_OPTIONS;
    if (state === 'descriptions') return NOTIFICATION_OPTIONS;
    if (state === 'horizontal') return SIZE_OPTIONS;
    if (state === 'disabled') return PAYMENT_OPTIONS;
    return GENDER_OPTIONS;
  });

  constructor() {
    this.demoForm = this.fb.group({
      basicSelection: ['male'],
      descriptionsSelection: ['important'],
      horizontalSelection: ['m'],
      disabledSelection: [{ value: 'credit-card', disabled: true }]
    });
  }

  generatedCode = computed(() => {
    const state = this.selectedState();
    const showLabel = this.showLabel();
    const showHint = this.showHint();

    let tsCode = `// TypeScript\n`;
    tsCode += `import { RadioOption } from '@shared/molecules/app-form-radio-group/app-form-radio-group.model';\n\n`;

    tsCode += `options: RadioOption<string>[] = [\n`;
    const options = this.currentOptions();
    options.slice(0, 3).forEach((opt, idx) => {
      tsCode += `  { value: '${opt.value}', label: '${opt.label}' }${idx < 2 ? ',' : ''}\n`;
    });
    tsCode += `];\n\n`;

    tsCode += `form = this.fb.group({\n`;
    tsCode += `  selection: ['${options[0].value}', [Validators.required]]\n`;
    tsCode += `});\n\n`;

    let htmlCode = `<!-- HTML -->\n`;
    htmlCode += `<app-form-radio-group\n`;
    htmlCode += `  formControlName="selection"\n`;
    htmlCode += `  [options]="options"\n`;
    htmlCode += `  [config]="{\n`;

    if (showLabel) {
      htmlCode += `    label: 'Select an option',\n`;
    }
    if (showHint) {
      htmlCode += `    hint: 'Choose the option that best fits',\n`;
    }
    htmlCode += `    layout: '${state === 'horizontal' ? 'horizontal' : 'vertical'}',\n`;
    htmlCode += `    errorMessages: {\n`;
    htmlCode += `      required: 'Please select an option'\n`;
    htmlCode += `    }\n`;
    htmlCode += `  }"\n`;
    htmlCode += `  appFormRadioGroupConnector>\n`;
    htmlCode += `</app-form-radio-group>`;

    return `${tsCode}${htmlCode}`;
  });

  goBack(): void {
    this.router.navigate(['/pds/index']);
  }
}
