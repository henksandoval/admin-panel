import {MatButtonAppearance} from '@angular/material/button';

export type ButtonColor = 'primary' | 'secondary' | 'tertiary';
export type ButtonShape = 'square' | 'rounded';
export type ButtonSize = 'small' | 'medium' | 'large';
export type ButtonType = 'button' | 'submit' | 'reset';

export interface ButtonOptions {
  /**
   * Button variant style (text, elevated, outlined, filled, tonal)
   * @default 'filled'
   */
  variant: MatButtonAppearance;

  /**
   * Material color (primary, secondary, tertiary)
   */
  color: ButtonColor;

  /**
   * Button shape (square or rounded)
   * @default 'rounded'
   */
  shape: ButtonShape;

  /**
   * Button size (small, medium, large)
   * @default 'medium'
   */
  size?: ButtonSize;

  /**
   * Button type attribute
   * @default 'button'
   */
  type?: ButtonType;

  /**
   * Disabled state
   * @default false
   */
  disabled: boolean;

  /**
   * Full width button
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Icon to display before the button text
   */
  iconBefore?: string;

  /**
   * Icon to display after the button text
   */
  iconAfter?: string;

  /**
   * ARIA label for accessibility
   */
  ariaLabel?: string;
}

