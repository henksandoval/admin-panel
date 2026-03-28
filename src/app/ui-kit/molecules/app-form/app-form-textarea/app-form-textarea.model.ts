import { MatFormFieldAppearance } from '@angular/material/form-field';

export interface AppFormTextareaNewConfig {
  label: string;
  placeholder: string;
  hint: string;
  icon: string;
  prefix: string;
  suffix: string;
  appearance: MatFormFieldAppearance;
  ariaLabel: string;
  errorMessages: Record<string, string>;
  rows: number;
  maxRows: number;
}

export type AppFormTextareaNewOptions = Partial<AppFormTextareaNewConfig>;

export const FORM_TEXTAREA_NEW_DEFAULTS: AppFormTextareaNewConfig = {
  appearance: 'fill',
  label: '',
  placeholder: '',
  hint: '',
  icon: '',
  prefix: '',
  suffix: '',
  ariaLabel: '',
  errorMessages: {},
  rows: 3,
  maxRows: 10,
};

export const FORM_TEXTAREA_NEW_DEFAULT_ERROR_MESSAGES: Record<string, string> = {
  required: $localize`:FormTextarea|Required error@@formTextarea.error.required:This field is required`,
  minlength: $localize`:FormTextarea|Min length error@@formTextarea.error.minlength:The text is too short`,
  maxlength: $localize`:FormTextarea|Max length error@@formTextarea.error.maxlength:The text is too long`,
  pattern: $localize`:FormTextarea|Pattern error@@formTextarea.error.pattern:The format is not valid`,
};
