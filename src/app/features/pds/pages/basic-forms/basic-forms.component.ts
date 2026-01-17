import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormFieldInputComponent } from '@shared/atoms/form-field-input/form-field-input.component';
import { FormFieldInputOptions, InputFieldType } from '@shared/atoms/form-field-input/form-field-input.model';
import { ControlConnectorDirective } from '@shared/atoms/form-field-input/control-connector.directive';
import { MatFormFieldAppearance } from '@angular/material/form-field';
import {
  FIELD_CONFIG_GUIDES,
  FORM_FIELD_DEFAULTS,
  INPUT_TYPES,
  FIELD_APPEARANCES,
  COMMON_ICONS,
  type FieldConfigGuide
} from './basic-forms.data';
import {
  PdsCodeBlockComponent,
  PdsBestPracticesComponent,
  PdsApiReferenceComponent,
  type ApiProperty,
  type BestPracticeItem
} from '@shared/molecules';

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
    MatButtonToggleModule,
    MatCheckboxModule,
    MatTooltipModule,
    FormFieldInputComponent,
    ControlConnectorDirective,
    PdsCodeBlockComponent,
    PdsBestPracticesComponent,
    PdsApiReferenceComponent
  ],
  templateUrl: './basic-forms.component.html',
  styleUrl: './basic-forms.component.scss'
})
export class BasicFormsComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

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
  readonly COMMON_ICONS = COMMON_ICONS;

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

  onConfigChange(config: 'basic' | 'with-validation' | 'with-extras'): void {
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

  copyToClipboard(): void {
    navigator.clipboard.writeText(this.generatedCode()).then(() => {
      this.snackBar.open('Copiado al portapapeles', 'OK', { duration: 2000 });
    });
  }

  apiProperties: ApiProperty[] = [
    {
      name: 'config',
      decorator: '@Input()',
      description: 'Objeto de configuración completo del campo.',
      type: 'FormFieldInputOptions',
      defaultValue: '{}'
    },
    {
      name: 'type',
      decorator: '@Input()',
      description: 'Tipo de input HTML.',
      type: "'text' | 'email' | 'password' | 'number' | 'tel'",
      defaultValue: 'text'
    },
    {
      name: 'label',
      decorator: '@Input()',
      description: 'Etiqueta del campo.',
      type: 'string',
      optional: true
    },
    {
      name: 'placeholder',
      decorator: '@Input()',
      description: 'Texto placeholder del input.',
      type: 'string',
      optional: true
    },
    {
      name: 'appearance',
      decorator: '@Input()',
      description: 'Estilo visual del campo.',
      type: "'fill' | 'outline'",
      defaultValue: 'fill'
    },
    {
      name: 'hint',
      decorator: '@Input()',
      description: 'Texto de ayuda debajo del campo.',
      type: 'string',
      optional: true
    },
    {
      name: 'icon',
      decorator: '@Input()',
      description: 'Icono Material al inicio del campo.',
      type: 'string',
      optional: true
    },
    {
      name: 'prefix',
      decorator: '@Input()',
      description: 'Prefijo de texto (ej: "$", "@").',
      type: 'string',
      optional: true
    },
    {
      name: 'suffix',
      decorator: '@Input()',
      description: 'Sufijo de texto (ej: ".00", "km").',
      type: 'string',
      optional: true
    },
    {
      name: 'errorMessages',
      decorator: '@Input()',
      description: 'Mapeo de mensajes de error personalizados.',
      type: 'Record<string, string>',
      optional: true
    }
  ];

  bestPractices: BestPracticeItem[] = [
    { label: 'Labels', text: 'Usa labels descriptivos que indiquen claramente qué se espera del usuario.' },
    { label: 'Placeholders', text: 'Los placeholders deben ser ejemplos, no instrucciones. Usa hints para instrucciones.' },
    { label: 'Validación', text: 'Muestra errores de validación en tiempo real después del primer intento o blur.' },
    { label: 'Accesibilidad', text: 'Siempre incluye labels, marca campos requeridos y proporciona mensajes de error claros.' }
  ];
}
