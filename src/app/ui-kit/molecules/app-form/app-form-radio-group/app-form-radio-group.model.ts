export interface RadioOption<T = any> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface AppFormRadioGroupConfig {
  label: string;
  hint: string;
  ariaLabel: string;
  errorMessages: Record<string, string>;
  layout: 'horizontal' | 'vertical';
}

export type AppFormRadioGroupOptions = Partial<AppFormRadioGroupConfig>;

export const FORM_RADIO_GROUP_DEFAULTS: AppFormRadioGroupConfig = {
  label: '',
  hint: '',
  ariaLabel: '',
  errorMessages: {},
  layout: 'vertical',
};

export const FORM_RADIO_GROUP_DEFAULT_ERROR_MESSAGES: Record<string, string> = {
  required: $localize`:FormRadioGroup|Required error@@formRadioGroup.error.required:This field is required`,
};

