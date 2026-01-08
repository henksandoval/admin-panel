import { MatFormFieldAppearance } from '@angular/material/form-field';

export type InputFieldType = 'text' | 'email' | 'password' | 'number' | 'tel';

export interface FormFieldInputConfig {
  label: string;
  placeholder: string;
  hint: string;
  icon: string;
  prefix: string;
  suffix: string;
  type: InputFieldType;
  appearance: MatFormFieldAppearance;
  ariaLabel: string;
  errorMessages: Record<string, string>;
}

export type FormFieldInputOptions = Partial<FormFieldInputConfig>;
