import { MatFormFieldAppearance } from '@angular/material/form-field';

export interface SelectOption<T = any> {
  value: T;
  label: string;
  disabled?: boolean;
  group?: string;
}

export type SelectDensity = 0 | -1 | -2 | -3;

export interface AppFormSelectConfig {
  label: string;
  placeholder: string;
  hint: string;
  icon: string;
  appearance: MatFormFieldAppearance;
  multiple: boolean;
  ariaLabel: string;
  panelClass: string | string[] | null;
  errorMessages: Record<string, string>;
  density: SelectDensity;
}

export type AppFormSelectOptions = Partial<AppFormSelectConfig>;

export const FORM_SELECT_DEFAULTS: AppFormSelectConfig = {
  appearance: 'fill',
  label: '',
  placeholder: '',
  hint: '',
  icon: '',
  multiple: false,
  ariaLabel: '',
  panelClass: null,
  errorMessages: {},
  density: -1,
};

export const FORM_SELECT_DEFAULT_ERROR_MESSAGES: Record<string, string> = {
  required: $localize`:FormSelect|Required error@@formSelect.error.required:This field is required`,
  minlength: $localize`:FormSelect|Min length error@@formSelect.error.minlength:Please select at least {requiredLength} options`,
  maxlength: $localize`:FormSelect|Max length error@@formSelect.error.maxlength:Please select no more than {requiredLength} options`,
};

