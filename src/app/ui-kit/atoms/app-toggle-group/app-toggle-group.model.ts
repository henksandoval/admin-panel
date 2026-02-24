export type ToggleGroupColor = 'primary' | 'secondary' | 'tertiary';
export type ToggleGroupSize = 'small' | 'medium' | 'large';
export type ToggleGroupAppearance = 'standard' | 'legacy';

export interface ToggleOption {
  value: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  ariaLabel?: string;
}

export const TOGGLE_GROUP_DEFAULTS = {
  color: 'primary' as ToggleGroupColor,
  size: 'medium' as ToggleGroupSize,
  appearance: 'standard' as ToggleGroupAppearance,
  disabled: false,
  multiple: false,
  hideSingleSelectionIndicator: false,
  hideMultipleSelectionIndicator: false,
  vertical: false,
} as const;
