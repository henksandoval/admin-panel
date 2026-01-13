import {MatButtonAppearance} from '@angular/material/button';

export type ButtonColor = 'primary' | 'secondary' | 'tertiary';
export type ButtonShape = 'square' | 'rounded';
export type ButtonSize = 'small' | 'medium' | 'large';
export type ButtonType = 'button' | 'submit' | 'reset';

export interface ButtonOptions {
  variant: MatButtonAppearance;
  color: ButtonColor;
  shape: ButtonShape;
  disabled: boolean;
  size: ButtonSize;
  type?: ButtonType;
  iconBefore?: string;
  iconAfter?: string;
  ariaLabel?: string;
}

