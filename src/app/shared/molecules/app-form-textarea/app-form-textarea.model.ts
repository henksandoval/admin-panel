import { MatFormFieldAppearance } from '@angular/material/form-field';

interface AppFormTextareaConfig {
  label?: string;
  placeholder?: string;
  hint?: string;
  icon?: string;
  appearance?: MatFormFieldAppearance;
  rows?: number;
  maxRows?: number;
  ariaLabel?: string;
  errorMessages?: Record<string, string>;
  showErrors?: boolean;
  prefix?: string;
  suffix?: string;
}

export type AppFormTextareaOptions = Partial<AppFormTextareaConfig>;

export const APP_FORM_TEXTAREA_DEFAULTS: Required<Omit<AppFormTextareaConfig, 'label' | 'placeholder' | 'hint' | 'icon' | 'ariaLabel' | 'errorMessages' | 'prefix' | 'suffix'>> = {
  appearance: 'fill',
  rows: 3,
  maxRows: 10,
  showErrors: true
};
