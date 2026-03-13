import { CheckboxColor, CheckboxLabelPosition, CheckboxSize } from '@ui-atoms/app-checkbox';

export interface AppFormCheckboxNewConfig {
  color: CheckboxColor;
  size: CheckboxSize;
  labelPosition: CheckboxLabelPosition;
  indeterminate: boolean;
  ariaLabel: string;
  errorMessages: Record<string, string>;
}

export type AppFormCheckboxNewOptions = Partial<AppFormCheckboxNewConfig>;

export const FORM_CHECKBOX_NEW_DEFAULTS: AppFormCheckboxNewConfig = {
  color: 'primary',
  size: 'medium',
  labelPosition: 'after',
  indeterminate: false,
  ariaLabel: '',
  errorMessages: {},
};

export const FORM_CHECKBOX_NEW_DEFAULT_ERROR_MESSAGES: Record<string, string> = {
  required: $localize`:FormCheckbox|Required error@@formCheckbox.error.required:This field must be checked`,
  requiredTrue: $localize`:FormCheckbox|Required true error@@formCheckbox.error.requiredTrue:You must accept this to continue`,
};

