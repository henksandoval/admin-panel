import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule, MatFormFieldAppearance } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Router } from '@angular/router';
import { AppButtonComponent } from '@shared/atoms/app-button/app-button.component';
import { AppToggleGroupComponent } from '@shared/atoms/app-toggle-group/app-toggle-group.component';
import { AppCheckboxComponent } from '@shared/atoms/app-checkbox/app-checkbox.component';
import { AppFormCheckboxComponent } from '@shared/molecules/app-form-checkbox/app-form-checkbox.component';
import { AppFormCheckboxConnectorDirective } from '@shared/molecules/app-form-checkbox/app-form-checkbox-connector.directive';
import { AppFormSelectComponent } from '@shared/molecules/app-form-select/app-form-select.component';
import { AppFormSelectConnectorDirective } from '@shared/molecules/app-form-select/app-form-select-connector.directive';
import { AppCardComponent } from '@shared/atoms/app-card/app-card.component';
import { PdsCodeBlockComponent } from '../../shared/molecules/pds-code-block/pds-code-block.component';
import { PdsPageLayoutComponent } from '../../shared/templates/pds-page-layout/pds-page-layout.component';
import { ToggleOption } from '@shared/atoms/app-toggle-group/app-toggle-group.model';
import {
  FIELD_EXAMPLES,
  API_PROPERTIES,
  BEST_PRACTICES
} from './form.data';
import { AppFormInputComponent} from '@shared/molecules/app-form-input/app-form-input.component';
import { AppFormInputConnectorDirective } from '@shared/molecules/app-form-input/app-form-input-connector.directive';
import { AppFormInputOptions } from '@shared/molecules/app-form-input/app-form-input.model';
import { AppFormTextareaComponent } from '@shared/molecules/app-form-textarea/app-form-textarea.component';
import { AppFormTextareaConnectorDirective } from '@shared/molecules/app-form-textarea/app-form-textarea-connector.directive';
import { AppFormDatepickerComponent } from '@shared/molecules/app-form-datepicker/app-form-datepicker.component';
import { AppFormDatepickerConnectorDirective } from '@shared/molecules/app-form-datepicker/app-form-datepicker-connector.directive';

@Component({
  selector: 'app-form-gallery',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatDividerModule,
    MatTabsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    AppFormInputComponent,
    AppFormInputConnectorDirective,
    AppFormTextareaComponent,
    AppFormTextareaConnectorDirective,
    AppFormDatepickerComponent,
    AppFormDatepickerConnectorDirective,
    AppButtonComponent,
    AppToggleGroupComponent,
    AppCheckboxComponent,
    AppFormCheckboxComponent,
    AppFormCheckboxConnectorDirective,
    AppFormSelectComponent,
    AppFormSelectConnectorDirective,
    AppCardComponent,
    PdsCodeBlockComponent,
    PdsPageLayoutComponent
  ],
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  public galleryForm!: FormGroup;

  globalAppearance = signal<MatFormFieldAppearance>('outline');
  showIcons = signal<boolean>(true);
  showHints = signal<boolean>(true);
  showPrefixSuffix = signal<boolean>(true);

  readonly FIELD_EXAMPLES = FIELD_EXAMPLES;
  readonly API_PROPERTIES = API_PROPERTIES;
  readonly BEST_PRACTICES = BEST_PRACTICES;

  readonly appearanceOptions: ToggleOption[] = [
    { value: 'fill', label: 'Fill' },
    { value: 'outline', label: 'Outline' }
  ];

  readonly countryOptions = [
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'ca', label: 'Canada' },
    { value: 'mx', label: 'Mexico' },
    { value: 'es', label: 'Spain' },
    { value: 'fr', label: 'France' },
    { value: 'de', label: 'Germany' },
    { value: 'it', label: 'Italy' }
  ];

  basicTextConfig = computed<AppFormInputOptions>(() => ({
    label: 'Full Name',
    placeholder: 'John Doe',
    type: 'text',
    appearance: this.globalAppearance(),
    icon: this.showIcons() ? 'person' : '',
    hint: this.showHints() ? 'Enter your full name' : ''
  }));

  emailConfig = computed<AppFormInputOptions>(() => ({
    label: 'Email Address',
    placeholder: 'your@email.com',
    type: 'email',
    appearance: this.globalAppearance(),
    icon: this.showIcons() ? 'email' : '',
    hint: this.showHints() ? "We'll never share your email" : '',
    errorMessages: {
      required: 'Email address is required',
      email: 'Please enter a valid email address'
    }
  }));

  passwordConfig = computed<AppFormInputOptions>(() => ({
    label: 'Password',
    placeholder: 'Enter secure password',
    type: 'password',
    appearance: this.globalAppearance(),
    icon: this.showIcons() ? 'lock' : '',
    hint: this.showHints() ? 'Must be at least 8 characters' : '',
    prefix: this.showPrefixSuffix() ? '🔒 ' : '',
    errorMessages: {
      required: 'Password is required',
      minlength: 'Password must be at least 8 characters long'
    }
  }));

  ageConfig = computed<AppFormInputOptions>(() => ({
    label: 'Age',
    placeholder: '18-99',
    type: 'number',
    appearance: this.globalAppearance(),
    icon: this.showIcons() ? 'cake' : '',
    suffix: this.showPrefixSuffix() ? ' years' : '',
    hint: this.showHints() ? 'You must be 18 or older' : '',
    errorMessages: {
      required: 'Age is required',
      min: 'You must be at least 18 years old',
      max: 'Please enter a valid age (maximum 99)'
    }
  }));

  phoneConfig = computed<AppFormInputOptions>(() => ({
    label: 'Phone Number',
    placeholder: '(555) 123-4567',
    type: 'tel',
    appearance: this.globalAppearance(),
    icon: this.showIcons() ? 'phone' : '',
    prefix: this.showPrefixSuffix() ? '+1 ' : '',
    hint: this.showHints() ? 'US phone numbers only' : '',
    errorMessages: {
      required: 'Phone number is required'
    }
  }));

  descriptionConfig = computed(() => ({
    label: 'Description',
    placeholder: 'Tell us about yourself...',
    appearance: this.globalAppearance(),
    icon: this.showIcons() ? 'description' : '',
    hint: this.showHints() ? 'Minimum 10 characters, maximum 500' : '',
    rows: 4,
    maxRows: 8,
    errorMessages: {
      required: 'Description is required',
      minlength: 'Description must be at least 10 characters',
      maxlength: 'Description cannot exceed 500 characters'
    }
  }));

  birthDateConfig = computed(() => ({
    label: 'Birth Date',
    placeholder: 'MM/DD/YYYY',
    appearance: this.globalAppearance(),
    icon: this.showIcons() ? 'cake' : '',
    hint: this.showHints() ? 'You must be 18 or older' : '',
    maxDate: new Date(new Date().getFullYear() - 18, 11, 31),
    errorMessages: {
      required: 'Birth date is required',
      matDatepickerMax: 'You must be at least 18 years old'
    }
  }));

  formStatus = computed(() => this.galleryForm?.status || 'UNKNOWN');
  formValid = computed(() => this.galleryForm?.valid || false);
  formTouched = computed(() => this.galleryForm?.touched || false);
  formDirty = computed(() => this.galleryForm?.dirty || false);

  completeFormCode = computed(() => this.generateCompleteFormCode());

  ngOnInit(): void {
    this.galleryForm = this.fb.group({
      basicText: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      age: ['', [Validators.required, Validators.min(18), Validators.max(99)]],
      phone: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      birthDate: [null, [Validators.required]],
      country: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]],
      matCountry: ['', [Validators.required]],
      matAcceptTerms: [false, [Validators.requiredTrue]]
    });
  }

  onSubmit(): void {
    if (this.galleryForm.valid) {
      console.log('✅ Form is valid!', this.galleryForm.value);
      alert('✅ Form submitted successfully! Check console for values.');
    } else {
      console.log('❌ Form has errors', this.galleryForm.value);
      this.galleryForm.markAllAsTouched();
      alert('❌ Please fix validation errors before submitting.');
    }
  }

  resetForm(): void {
    this.galleryForm.reset();
  }

  copyCode(fieldName: string): void {
    const example = this.FIELD_EXAMPLES.find((e: any) => e.id === fieldName);
    if (!example) return;

    const code = this.generateFieldCode(example);
    navigator.clipboard.writeText(code).then(() => {
      console.log('📋 Code copied to clipboard!');
      alert(`📋 ${example.title} code copied to clipboard!`);
    });
  }


  private generateFieldCode(example: any): string {
    let code = `// ${example.title}\n`;
    code += `// ${example.description}\n\n`;

    code += `// TypeScript Configuration\n`;
    code += `${example.configName}: AppFormFieldInputOptions = {\n`;
    code += `  label: '${example.config.label}',\n`;
    code += `  placeholder: '${example.config.placeholder}',\n`;
    code += `  type: '${example.config.type}'`;

    if (example.config.icon) {
      code += `,\n  icon: '${example.config.icon}'`;
    }
    if (example.config.hint) {
      code += `,\n  hint: '${example.config.hint}'`;
    }
    if (example.config.prefix) {
      code += `,\n  prefix: '${example.config.prefix}'`;
    }
    if (example.config.suffix) {
      code += `,\n  suffix: '${example.config.suffix}'`;
    }
    if (example.config.errorMessages) {
      code += `,\n  errorMessages: {\n`;
      Object.entries(example.config.errorMessages).forEach(([key, value]) => {
        code += `    ${key}: '${value}',\n`;
      });
      code = code.slice(0, -2) + '\n  }';
    }

    code += `\n};\n\n`;

    code += `// Form Setup\n`;
    code += `form = this.fb.group({\n`;
    code += `  ${example.formControlName}: ['', [${example.validators}]]\n`;
    code += `});\n\n`;

    code += `// HTML Template\n`;
    code += `<app-form-input\n`;
    code += `  formControlName="${example.formControlName}"\n`;
    code += `  [config]="${example.configName}"\n`;
    code += `  appFormInputConnector>\n`;
    code += `</app-form-input>`;

    return code;
  }

  private generateCompleteFormCode(): string {
    let code = `// Complete Form with All Field Types\n\n`;

    code += `// TypeScript - Form Initialization\n`;
    code += `form = this.fb.group({\n`;
    code += `  basicText: [''],\n`;
    code += `  email: ['', [Validators.required, Validators.email]],\n`;
    code += `  password: ['', [Validators.required, Validators.minLength(8)]],\n`;
    code += `  age: ['', [Validators.required, Validators.min(18), Validators.max(99)]],\n`;
    code += `  phone: ['', [Validators.required]],\n`;
    code += `  country: ['', [Validators.required]],\n`;
    code += `  acceptTerms: [false, [Validators.requiredTrue]],\n`;
    code += `  // Material native controls for comparison\n`;
    code += `  matCountry: ['', [Validators.required]],\n`;
    code += `  matAcceptTerms: [false, [Validators.requiredTrue]]\n`;
    code += `});\n\n`;

    code += `// HTML Template\n`;
    code += `<form [formGroup]="form" (ngSubmit)="onSubmit()">\n`;
    code += `  <!-- Custom Components -->\n`;
    code += `  <app-form-input\n`;
    code += `    formControlName="basicText"\n`;
    code += `    [config]="basicTextConfig"\n`;
    code += `    appFormInputConnector>\n`;
    code += `  </app-form-input>\n\n`;

    code += `  <app-select\n`;
    code += `    formControlName="country"\n`;
    code += `    [options]="countryOptions"\n`;
    code += `    [config]="{ label: 'Country', required: true }">\n`;
    code += `  </app-select>\n\n`;

    code += `  <app-checkbox formControlName="acceptTerms">\n`;
    code += `    I accept the terms\n`;
    code += `  </app-checkbox>\n\n`;

    code += `  <!-- Material Native for Comparison -->\n`;
    code += `  <mat-form-field>\n`;
    code += `    <mat-label>Country (Material)</mat-label>\n`;
    code += `    <mat-select formControlName="matCountry" required>\n`;
    code += `      <mat-option value="us">United States</mat-option>\n`;
    code += `    </mat-select>\n`;
    code += `    <mat-error>Country is required</mat-error>\n`;
    code += `  </mat-form-field>\n\n`;

    code += `  <mat-checkbox formControlName="matAcceptTerms">\n`;
    code += `    I accept the terms (Material)\n`;
    code += `  </mat-checkbox>\n\n`;

    code += `  <button type="submit">Submit</button>\n`;
    code += `</form>`;

    return code;
  }

  goBack(): void {
    this.router.navigate(['/pds/index']);
  }
}
