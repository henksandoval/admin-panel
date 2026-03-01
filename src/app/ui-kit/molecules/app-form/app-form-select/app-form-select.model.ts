import {MatFormFieldAppearance} from '@angular/material/form-field';

export interface SelectOption<T = any> {
  value: T;
  label: string;
  disabled?: boolean;
  group?: string;
}

export type SelectDensity = 0 | -1 | -2 | -3;

export interface AppFormSelectConfig {
  label?: string;
  placeholder?: string;
  hint?: string;
  icon?: string;
  appearance?: MatFormFieldAppearance;
  multiple?: boolean;
  ariaLabel?: string;
  panelClass?: string | string[];
  errorMessages?: Record<string, string>;
  showErrors?: boolean;
  density?: SelectDensity;
}

export const APP_FORM_SELECT_DEFAULTS: Required<Omit<AppFormSelectConfig, 'label' | 'placeholder' | 'hint' | 'icon' | 'ariaLabel' | 'panelClass' | 'errorMessages'>> = {
  appearance: 'fill',
  multiple: false,
  showErrors: true,
  density: -1
};
