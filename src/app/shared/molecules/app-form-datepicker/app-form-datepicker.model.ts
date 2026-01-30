import { MatFormFieldAppearance } from '@angular/material/form-field';

export interface AppFormDatepickerConfig {
  label?: string;
  placeholder?: string;
  hint?: string;
  icon?: string;
  appearance?: MatFormFieldAppearance;
  minDate?: Date;
  maxDate?: Date;
  startView?: 'month' | 'year' | 'multi-year';
  ariaLabel?: string;
  errorMessages?: Record<string, string>;
  showErrors?: boolean;
  prefix?: string;
  suffix?: string;
}

export type AppFormDatepickerOptions = Partial<AppFormDatepickerConfig>;

export const APP_FORM_DATEPICKER_DEFAULTS: Required<Omit<AppFormDatepickerConfig, 'label' | 'placeholder' | 'hint' | 'icon' | 'minDate' | 'maxDate' | 'ariaLabel' | 'errorMessages' | 'prefix' | 'suffix'>> = {
  appearance: 'fill',
  startView: 'month',
  showErrors: true
};
