import { MatFormFieldAppearance } from '@angular/material/form-field';

/**
 * Option interface for select dropdown items
 */
export interface SelectOption<T = any> {
  value: T;
  label: string;
  disabled?: boolean;
  group?: string; // For optgroup support
}

/**
 * Select appearance variants
 */
export type SelectAppearance = MatFormFieldAppearance;

/**
 * Select size variants
 */
export type SelectSize = 'small' | 'medium' | 'large';

/**
 * Select configuration options
 */
export interface SelectConfig<T = any> {
  label?: string;
  placeholder?: string;
  hint?: string;
  icon?: string; // Material Icon name
  appearance?: SelectAppearance;
  size?: SelectSize;
  multiple?: boolean;
  required?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  errorMessages?: Record<string, string>;
  panelClass?: string | string[];
}

/**
 * Default values for select component
 */
export const SELECT_DEFAULTS: Required<Omit<SelectConfig, 'label' | 'placeholder' | 'hint' | 'icon' | 'errorMessages' | 'panelClass'>> = {
  appearance: 'fill',
  size: 'medium',
  multiple: false,
  required: false,
  disabled: false,
  ariaLabel: ''
};
