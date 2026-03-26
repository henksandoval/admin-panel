import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldAppearance, MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Router } from '@angular/router';
import { AppButtonComponent } from '@ui-atoms/app-button';
import { AppToggleGroupComponent } from '@ui-atoms/app-toggle-group';
import { AppCheckboxComponent } from '@ui-atoms/app-checkbox';
import { AppCardComponent } from '@ui-atoms/app-card';
import { ToggleOption } from '@ui-atoms/app-toggle-group';
import { API_PROPERTIES, BEST_PRACTICES } from './form.data';
import { LayoutConfig } from '@ui-templates/app-page-layout/app-page-layout.model';
import { PdsPageUtilitiesService } from '@features/pds/shared/templates/pds-page-layout';
import {
  PdsDocumentationTabsComponent
} from '@features/pds/shared/organisms/pds-documentation-tabs';
import { AppPageLayoutComponent } from "@ui-templates/app-page-layout/app-page-layout.component";
import { AppSlotContainerDirective } from '@ui-templates/app-page-layout/app-slot-container.directive';
import { AppFormCheckboxComponent } from '@ui-molecules/app-form/app-form-checkbox';
import {
  AppFormDatepickerComponent
} from '@ui-molecules/app-form/app-form-datepicker';
import { AppFormInputComponent } from '@ui-molecules/app-form/app-form-input';
import { AppFormInputOptions } from '@ui-molecules/app-form/app-form-input';
import {
  AppFormRadioGroupComponent
} from '@ui-molecules/app-form/app-form-radio-group';
import { RadioOption } from '@ui-molecules/app-form/app-form-radio-group';
import { AppFormSelectComponent } from '@ui-molecules/app-form/app-form-select';
import { AppFormTextareaComponent } from '@ui-molecules/app-form/app-form-textarea';
import { LoggingService } from '@core/logging-audit/logging.service';

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
    AppFormTextareaComponent,
    AppFormDatepickerComponent,
    AppFormRadioGroupComponent,
    AppButtonComponent,
    AppToggleGroupComponent,
    AppCheckboxComponent,
    AppFormCheckboxComponent,
    AppFormSelectComponent,
    AppCardComponent,
    AppPageLayoutComponent,
    AppSlotContainerDirective,
    PdsDocumentationTabsComponent
],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class FormComponent implements OnInit {
  public galleryForm!: FormGroup;
  readonly globalAppearance = signal<MatFormFieldAppearance>('fill');
  readonly showIcons = signal<boolean>(true);
  readonly showHints = signal<boolean>(true);
  readonly showPrefixSuffix = signal<boolean>(false);
  readonly customLayout: LayoutConfig = {
    grid: {
      columns: '2fr 1fr',
      gap: '1.5rem'
    },
    cells: [
      { slotId: 'header', colStart: 1, colEnd: 'full', rowStart: 1 },
      { slotId: 'left', colStart: 1, rowStart: 2 },
      { slotId: 'right', colStart: 2, rowStart: 2 },
      { slotId: 'footer', colStart: 1, colEnd: 'full', rowStart: 3 }
    ]
  };
  genderOptions: RadioOption<string>[] = [
    { value: 'male', label: $localize`:Form Gallery|Gender option male@@pds.form.gender.male:Male` },
    { value: 'female', label: $localize`:Form Gallery|Gender option female@@pds.form.gender.female:Female` },
    { value: 'other', label: $localize`:Form Gallery|Gender option other@@pds.form.gender.other:Other` },
    { value: 'prefer-not-to-say', label: $localize`:Form Gallery|Gender option prefer not to say@@pds.form.gender.preferNotToSay:Prefer not to say` }
  ];
  readonly API_PROPERTIES = API_PROPERTIES;
  readonly BEST_PRACTICES = BEST_PRACTICES;
  readonly appearanceOptions: ToggleOption[] = [
    { value: 'fill', label: $localize`:Form Gallery|Appearance option fill@@pds.form.appearance.fill:Fill` },
    { value: 'outline', label: $localize`:Form Gallery|Appearance option outline@@pds.form.appearance.outline:Outline` }
  ];
  readonly countryOptions = [
    { value: 'us', label: $localize`:Form Gallery|Country United States@@pds.form.country.us:United States` },
    { value: 'uk', label: $localize`:Form Gallery|Country United Kingdom@@pds.form.country.uk:United Kingdom` },
    { value: 'ca', label: $localize`:Form Gallery|Country Canada@@pds.form.country.ca:Canada` },
    { value: 'mx', label: $localize`:Form Gallery|Country Mexico@@pds.form.country.mx:Mexico` },
    { value: 'es', label: $localize`:Form Gallery|Country Spain@@pds.form.country.es:Spain` },
    { value: 'fr', label: $localize`:Form Gallery|Country France@@pds.form.country.fr:France` },
    { value: 'de', label: $localize`:Form Gallery|Country Germany@@pds.form.country.de:Germany` },
    { value: 'it', label: $localize`:Form Gallery|Country Italy@@pds.form.country.it:Italy` }
  ];
  readonly basicTextConfig = computed<AppFormInputOptions>(() => ({
    label: $localize`:Form Gallery|Full name field label@@pds.form.field.basicText.label:Full Name`,
    placeholder: $localize`:Form Gallery|Full name placeholder@@pds.form.field.basicText.placeholder:John Doe`,
    type: 'text',
    appearance: this.globalAppearance(),
    icon: this.showIcons() ? 'person' : '',
    hint: this.showHints() ? $localize`:Form Gallery|Full name hint@@pds.form.field.basicText.hint:Enter your full name` : ''
  }));
  readonly emailConfig = computed<AppFormInputOptions>(() => ({
    label: $localize`:Form Gallery|Email field label@@pds.form.field.email.label:Email Address`,
    placeholder: $localize`:Form Gallery|Email placeholder@@pds.form.field.email.placeholder:your@email.com`,
    type: 'email',
    appearance: this.globalAppearance(),
    icon: this.showIcons() ? 'email' : '',
    hint: this.showHints() ? $localize`:Form Gallery|Email hint@@pds.form.field.email.hint:We'll never share your email` : '',
    errorMessages: {
      required: $localize`:Form Gallery|Email required error@@pds.form.field.email.error.required:Email address is required`,
      email: $localize`:Form Gallery|Email invalid error@@pds.form.field.email.error.email:Please enter a valid email address`
    }
  }));
  readonly passwordConfig = computed<AppFormInputOptions>(() => ({
    label: $localize`:Form Gallery|Password field label@@pds.form.field.password.label:Password`,
    placeholder: $localize`:Form Gallery|Password placeholder@@pds.form.field.password.placeholder:Enter secure password`,
    type: 'password',
    appearance: this.globalAppearance(),
    icon: this.showIcons() ? 'lock' : '',
    hint: this.showHints() ? $localize`:Form Gallery|Password hint@@pds.form.field.password.hint:Must be at least 8 characters` : '',
    prefix: this.showPrefixSuffix() ? '🔒 ' : '',
    errorMessages: {
      required: $localize`:Form Gallery|Password required error@@pds.form.field.password.error.required:Password is required`,
      minlength: $localize`:Form Gallery|Password minlength error@@pds.form.field.password.error.minlength:Password must be at least 8 characters long`
    }
  }));
  readonly ageConfig = computed<AppFormInputOptions>(() => ({
    label: $localize`:Form Gallery|Age field label@@pds.form.field.age.label:Age`,
    placeholder: $localize`:Form Gallery|Age placeholder@@pds.form.field.age.placeholder:18-99`,
    type: 'number',
    appearance: this.globalAppearance(),
    icon: this.showIcons() ? 'cake' : '',
    suffix: this.showPrefixSuffix() ? $localize`:Form Gallery|Age suffix@@pds.form.field.age.suffix: years` : '',
    hint: this.showHints() ? $localize`:Form Gallery|Age hint@@pds.form.field.age.hint:You must be 18 or older` : '',
    errorMessages: {
      required: $localize`:Form Gallery|Age required error@@pds.form.field.age.error.required:Age is required`,
      min: $localize`:Form Gallery|Age min error@@pds.form.field.age.error.min:You must be at least 18 years old`,
      max: $localize`:Form Gallery|Age max error@@pds.form.field.age.error.max:Please enter a valid age (maximum 99)`
    }
  }));
  readonly phoneConfig = computed<AppFormInputOptions>(() => ({
    label: $localize`:Form Gallery|Phone field label@@pds.form.field.phone.label:Phone Number`,
    placeholder: $localize`:Form Gallery|Phone placeholder@@pds.form.field.phone.placeholder:(555) 123-4567`,
    type: 'tel',
    appearance: this.globalAppearance(),
    icon: this.showIcons() ? 'phone' : '',
    prefix: this.showPrefixSuffix() ? $localize`:Form Gallery|Phone prefix@@pds.form.field.phone.prefix:+1 ` : '',
    hint: this.showHints() ? $localize`:Form Gallery|Phone hint@@pds.form.field.phone.hint:US phone numbers only` : '',
    errorMessages: {
      required: $localize`:Form Gallery|Phone required error@@pds.form.field.phone.error.required:Phone number is required`
    }
  }));
  readonly descriptionConfig = computed(() => ({
    label: $localize`:Form Gallery|Description field label@@pds.form.field.description.label:Description`,
    placeholder: $localize`:Form Gallery|Description placeholder@@pds.form.field.description.placeholder:Tell us about yourself...`,
    appearance: this.globalAppearance(),
    icon: this.showIcons() ? 'description' : '',
    hint: this.showHints() ? $localize`:Form Gallery|Description hint@@pds.form.field.description.hint:Minimum 10 characters, maximum 500` : '',
    rows: 4,
    maxRows: 8,
    errorMessages: {
      required: $localize`:Form Gallery|Description required error@@pds.form.field.description.error.required:Description is required`,
      minlength: $localize`:Form Gallery|Description minlength error@@pds.form.field.description.error.minlength:Description must be at least 10 characters`,
      maxlength: $localize`:Form Gallery|Description maxlength error@@pds.form.field.description.error.maxlength:Description cannot exceed 500 characters`
    }
  }));
  readonly birthDateConfig = computed(() => ({
    label: $localize`:Form Gallery|Birth date field label@@pds.form.field.birthDate.label:Birth Date`,
    placeholder: $localize`:Form Gallery|Birth date placeholder@@pds.form.field.birthDate.placeholder:MM/DD/YYYY`,
    appearance: this.globalAppearance(),
    icon: this.showIcons() ? 'cake' : '',
    hint: this.showHints() ? $localize`:Form Gallery|Birth date hint@@pds.form.field.birthDate.hint:You must be 18 or older` : '',
    maxDate: new Date(new Date().getFullYear() - 18, 11, 31),
    errorMessages: {
      required: $localize`:Form Gallery|Birth date required error@@pds.form.field.birthDate.error.required:Birth date is required`,
      matDatepickerMax: $localize`:Form Gallery|Birth date max error@@pds.form.field.birthDate.error.max:You must be at least 18 years old`
    }
  }));

  readonly genderConfig = computed(() => ({
    label: $localize`:Form Gallery|Gender field label@@pds.form.field.gender.label:Gender`,
    hint: this.showHints() ? $localize`:Form Gallery|Gender hint@@pds.form.field.gender.hint:Select your gender identity` : '',
    color: 'primary' as const,
    layout: 'horizontal' as const,
    errorMessages: {
      required: $localize`:Form Gallery|Gender required error@@pds.form.field.gender.error.required:Gender selection is required`
    }
  }));

  readonly selectCountryConfig = computed(() => ({
    label: $localize`:Form Gallery|Select country field label@@pds.form.field.country.label:Country`,
    placeholder: $localize`:Form Gallery|Select country placeholder@@pds.form.field.country.placeholder:Choose a country`,
    appearance: this.globalAppearance(),
    icon: this.showIcons() ? 'public' : '',
    hint: this.showHints() ? $localize`:Form Gallery|Select country hint@@pds.form.field.country.hint:Select your country of residence` : '',
    errorMessages: {
      required: $localize`:Form Gallery|Select country required error@@pds.form.field.country.error.required:Country selection is required`
    }
  }));

  readonly formStatus = computed(() => this.galleryForm?.status || 'UNKNOWN');
  readonly formValid = computed(() => this.galleryForm?.valid || false);
  readonly formTouched = computed(() => this.galleryForm?.touched || false);
  readonly formDirty = computed(() => this.galleryForm?.dirty || false);
  readonly completeFormCode = computed(() => this.generateCompleteFormCode());
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly pdsUtils = inject(PdsPageUtilitiesService);
  private readonly log = inject(LoggingService);

  ngOnInit(): void {
    this.galleryForm = this.fb.group({
      basicText: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      age: ['', [Validators.required, Validators.min(18), Validators.max(99)]],
      phone: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      birthDate: [null, [Validators.required]],
      gender: ['', [Validators.required]],
      country: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]],
      matCountry: ['', [Validators.required]],
      matAcceptTerms: [false, [Validators.requiredTrue]]
    });
  }

  onSubmit(): void {
    if (this.galleryForm.valid) {
      this.log.warn('✅ Form is valid!', this.galleryForm.value);
      alert('✅ Form submitted successfully! Check console for values.');
    } else {
      this.log.warn('❌ Form has errors', this.galleryForm.value);
      this.galleryForm.markAllAsTouched();
      alert('❌ Please fix validation errors before submitting.');
    }
  }

  resetForm(): void {
    this.galleryForm.reset();
  }

  copyToClipboard(): void {
    void this.pdsUtils.copyToClipboard(this.completeFormCode());
  }

  goBack(): void {
    void this.router.navigate(['/pds/index']);
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
    code += `    [control]="form.controls.basicText"\n`;
    code += `    [config]="basicTextConfig">\n`;
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
}
