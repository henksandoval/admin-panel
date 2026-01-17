import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormFieldInputComponent } from '@shared/atoms/form-field-input/form-field-input.component';
import { FormFieldInputOptions, InputFieldType } from '@shared/atoms/form-field-input/form-field-input.model';
import { ControlConnectorDirective } from '@shared/atoms/form-field-input/control-connector.directive';
import { AppButtonComponent } from '@shared/atoms/app-button/app-button.component';
import { AppCheckboxComponent } from '@shared/atoms/app-checkbox/app-checkbox.component';
import { AppToggleGroupComponent } from '@shared/atoms/app-toggle-group/app-toggle-group.component';
import { ToggleOption } from '@shared/atoms/app-toggle-group/app-toggle-group.model';
import { MatFormFieldAppearance } from '@angular/material/form-field';
import {
  API_PROPERTIES,
  BEST_PRACTICES,
  FIELD_CONFIG_GUIDES,
  FORM_FIELD_DEFAULTS,
  INPUT_TYPES,
  FIELD_APPEARANCES,
  COMMON_ICONS,
  type FieldConfigGuide,
} from './basic-forms.data';
import {PdsCodeBlockComponent} from '@shared/molecules/pds-code-block/pds-code-block.component';
import {PdsBestPracticesComponent} from '@shared/molecules/pds-best-practices/pds-best-practices.component';
import {PdsApiReferenceComponent} from '@shared/molecules/pds-api-reference/pds-api-reference.component';

@Component({
  selector: 'app-basic-forms',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatTooltipModule,
    FormFieldInputComponent,
    ControlConnectorDirective,
    AppButtonComponent,
    AppCheckboxComponent,
    AppToggleGroupComponent,
    PdsCodeBlockComponent,
    PdsBestPracticesComponent,
    PdsApiReferenceComponent
  ],
  templateUrl: './basic-forms.component.html'
})
export class BasicFormsComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  public form!: FormGroup;

  selectedConfig = signal<'basic' | 'with-validation' | 'with-extras'>('basic');
  fieldType = signal<InputFieldType>(FORM_FIELD_DEFAULTS.type);
  appearance = signal<MatFormFieldAppearance>(FORM_FIELD_DEFAULTS.appearance);
  fieldLabel = signal<string>('Field Label');
  fieldPlaceholder = signal<string>('Enter value...');
  fieldHint = signal<string>('');
  selectedIcon = signal<string>('');
  fieldPrefix = signal<string>('');
  fieldSuffix = signal<string>('');
  hasValidation = signal<boolean>(false);
  isDisabled = signal<boolean>(false);
  isRequired = signal<boolean>(false);

  readonly INPUT_TYPES = INPUT_TYPES;
  readonly FIELD_APPEARANCES = FIELD_APPEARANCES;
  readonly apiProperties = API_PROPERTIES;
  readonly bestPractices = BEST_PRACTICES;

  readonly configOptions: ToggleOption[] = [
    { value: 'basic', label: 'Basic' },
    { value: 'with-validation', label: 'With Validation' },
    { value: 'with-extras', label: 'With Extras' }
  ];

  readonly typeOptions: ToggleOption[] = [
    { value: 'text', label: 'Text' },
    { value: 'email', label: 'Email' },
    { value: 'password', label: 'Password' },
    { value: 'number', label: 'Number' },
    { value: 'tel', label: 'Tel' },
    { value: 'url', label: 'URL' }
  ];

  readonly appearanceOptions: ToggleOption[] = [
    { value: 'fill', label: 'Fill' },
    { value: 'outline', label: 'Outline' }
  ];

  readonly iconOptions: ToggleOption[] = [
    { value: '', label: 'None', icon: 'close', ariaLabel: 'No icon' },
    ...COMMON_ICONS.slice(0, 11).map(icon => ({
      value: icon,
      label: icon,
      icon: icon,
      ariaLabel: icon
    }))
  ];

  currentConfigGuide = computed(() => {
    return FIELD_CONFIG_GUIDES.find(guide => guide.config === this.selectedConfig());
  });

  currentFieldConfig = computed<FormFieldInputOptions>(() => {
    const config: FormFieldInputOptions = {
      label: this.fieldLabel(),
      placeholder: this.fieldPlaceholder()
    };

    if (this.fieldType() !== FORM_FIELD_DEFAULTS.type) {
      config.type = this.fieldType();
    }

    if (this.appearance() !== FORM_FIELD_DEFAULTS.appearance) {
      config.appearance = this.appearance();
    }

    if (this.fieldHint()) {
      config.hint = this.fieldHint();
    }

    if (this.selectedIcon()) {
      config.icon = this.selectedIcon();
    }

    if (this.fieldPrefix()) {
      config.prefix = this.fieldPrefix();
    }

    if (this.fieldSuffix()) {
      config.suffix = this.fieldSuffix();
    }

    if (this.hasValidation()) {
      config.errorMessages = {
        required: 'This field is required',
        email: 'Please enter a valid email address',
        minlength: 'Minimum length not met',
        min: 'Value is too low',
        max: 'Value is too high'
      };
    }

    return config;
  });

  generatedCode = computed(() => {
    const type = this.fieldType();
    const appearance = this.appearance();
    const label = this.fieldLabel();
    const placeholder = this.fieldPlaceholder();
    const hint = this.fieldHint();
    const icon = this.selectedIcon();
    const prefix = this.fieldPrefix();
    const suffix = this.fieldSuffix();
    const required = this.isRequired();

    let tsCode = `// TypeScript\n`;
    tsCode += `fieldConfig: FormFieldInputOptions = {\n`;
    tsCode += `  label: '${label}',\n`;
    tsCode += `  placeholder: '${placeholder}'`;

    if (type !== FORM_FIELD_DEFAULTS.type) {
      tsCode += `,\n  type: '${type}'`;
    }
    if (appearance !== FORM_FIELD_DEFAULTS.appearance) {
      tsCode += `,\n  appearance: '${appearance}'`;
    }
    if (hint) {
      tsCode += `,\n  hint: '${hint}'`;
    }
    if (icon) {
      tsCode += `,\n  icon: '${icon}'`;
    }
    if (prefix) {
      tsCode += `,\n  prefix: '${prefix}'`;
    }
    if (suffix) {
      tsCode += `,\n  suffix: '${suffix}'`;
    }

    tsCode += `\n};\n\n`;

    let htmlCode = `<!-- HTML -->\n`;
    htmlCode += `<form [formGroup]="form">\n`;
    htmlCode += `  <app-form-field\n`;
    htmlCode += `    formControlName="fieldName"\n`;
    htmlCode += `    [options]="fieldConfig"`;

    if (required) {
      htmlCode += `\n    required`;
    }

    htmlCode += `>\n  </app-form-field>\n`;
    htmlCode += `</form>`;

    return `${tsCode}${htmlCode}`;
  });

  ngOnInit(): void {
    this.form = this.fb.group({
      playgroundField: ['', this.hasValidation() ? [Validators.required] : []]
    });

    this.hasValidation.set(this.selectedConfig() === 'with-validation');
  }

  getEmphasisBadgeClasses(emphasis: FieldConfigGuide['emphasis']): string {
    const classMap = {
      high: 'emphasis-badge high',
      medium: 'emphasis-badge medium',
      low: 'emphasis-badge low'
    };
    return classMap[emphasis];
  }

  getCardBorderClasses(emphasis: FieldConfigGuide['emphasis']): string {
    const classMap = {
      high: 'card-border high',
      medium: 'card-border medium',
      low: 'card-border low'
    };
    return classMap[emphasis];
  }

  onConfigChange(value: string | string[]): void {
    // app-toggle-group emits string | string[], but we only use single selection
    const config = (typeof value === 'string' ? value : value[0]) as 'basic' | 'with-validation' | 'with-extras';

    this.selectedConfig.set(config);

    if (config === 'basic') {
      this.fieldType.set('text');
      this.appearance.set('fill');
      this.fieldHint.set('');
      this.selectedIcon.set('');
      this.fieldPrefix.set('');
      this.fieldSuffix.set('');
      this.hasValidation.set(false);
    } else if (config === 'with-validation') {
      this.fieldType.set('email');
      this.fieldLabel.set('Email Address');
      this.fieldPlaceholder.set('your@email.com');
      this.selectedIcon.set('email');
      this.hasValidation.set(true);
      this.isRequired.set(true);
    } else if (config === 'with-extras') {
      this.fieldType.set('text');
      this.appearance.set('outline');
      this.fieldLabel.set('Username');
      this.fieldPlaceholder.set('Enter username');
      this.fieldHint.set('Must be unique');
      this.selectedIcon.set('person');
      this.fieldPrefix.set('@');
      this.hasValidation.set(false);
    }
  }

  goBack(): void {
    this.router.navigate(['/pds/index']);
  }
}
