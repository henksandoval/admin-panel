export type ButtonColor = 'primary' | 'secondary' | 'tertiary';
export type ButtonShape = 'square' | 'rounded';
export type ButtonSize = 'small' | 'medium' | 'large';
export type ButtonType = 'button' | 'submit' | 'reset';

export const BUTTON_DEFAULTS = {
  variant: 'filled' as const,
  color: 'primary' as ButtonColor,
  shape: 'rounded' as ButtonShape,
  size: 'medium' as ButtonSize,
  type: 'button' as ButtonType,
  disabled: false,
} as const;

