export interface RadioOption<T = any> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface AppFormRadioGroupConfig {
  label?: string;
  hint?: string;
  ariaLabel?: string;
  errorMessages?: Record<string, string>;
  showErrors?: boolean;
  layout?: 'horizontal' | 'vertical';
}

export type AppFormRadioGroupConfigComplete = Required<Omit<AppFormRadioGroupConfig, 'label' | 'hint' | 'ariaLabel' | 'errorMessages'>>;

export const APP_FORM_RADIO_GROUP_DEFAULTS: AppFormRadioGroupConfigComplete = {
  showErrors: true,
  layout: 'vertical'
};
