export type RadioColor = 'primary' | 'accent' | 'warn';

export interface AppRadioConfig {
  value: any;
  color?: RadioColor;
  disabled?: boolean;
  ariaLabel?: string;
}
