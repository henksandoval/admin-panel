export type BadgeVariant = 'inline' | 'overlay';
export type BadgeColor = 'primary' | 'accent' | 'warn' | 'normal' | 'info' | 'success' | 'warning' | 'error';
export type BadgePosition = 'above after' | 'above before' | 'below after' | 'below before';
export type BadgeSize = 'small' | 'medium' | 'large';

export const BADGE_DEFAULTS = {
  variant: 'inline' as const,
  overlayColor: 'primary' as const,
  inlineColor: 'normal' as const,
  position: 'above after' as const,
  size: 'medium' as const,
  overlap: true,
  hidden: false,
  hasIndicator: false,
  content: ''
};
