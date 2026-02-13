import { CheckboxColor, CheckboxSize, CheckboxLabelPosition } from '@shared/atoms/app-checkbox/app-checkbox.model';

export interface AppFormCheckboxConfig {
  color?: CheckboxColor;
  size?: CheckboxSize;
  labelPosition?: CheckboxLabelPosition;
  indeterminate?: boolean;
  ariaLabel?: string;
  errorMessages?: Record<string, string>;
  showErrors?: boolean;
}

export interface AppFormCheckboxConfigComplete extends Required<Omit<AppFormCheckboxConfig, 'ariaLabel' | 'errorMessages'>> {
  ariaLabel?: string;
  errorMessages: Record<string, string>;
}

export const APP_FORM_CHECKBOX_DEFAULTS: AppFormCheckboxConfigComplete = {
  color: 'primary',
  size: 'medium',
  labelPosition: 'after',
  indeterminate: false,
  showErrors: true,
  errorMessages: {}
};
