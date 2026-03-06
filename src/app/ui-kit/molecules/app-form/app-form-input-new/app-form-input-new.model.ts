import { MatFormFieldAppearance } from '@angular/material/form-field';

export type InputFieldType = 'text' | 'email' | 'password' | 'number' | 'tel';

export interface AppFormInputConfig {
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

export type AppFormInputOptions = Partial<AppFormInputConfig>;

export const FORM_INPUT_DEFAULT_ERROR_MESSAGES: Record<string, string> = {
  required: $localize`:FormInput|Required error@@formInput.error.required:This field is required`,
  email: $localize`:FormInput|Email error@@formInput.error.email:Please enter a valid email address`,
  minlength: $localize`:FormInput|Min length error@@formInput.error.minlength:The value is too short`,
  maxlength: $localize`:FormInput|Max length error@@formInput.error.maxlength:The value is too long`,
  pattern: $localize`:FormInput|Pattern error@@formInput.error.pattern:The format is not valid`,
};
