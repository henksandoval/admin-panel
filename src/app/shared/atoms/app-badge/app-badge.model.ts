export type BadgeVariant = 'inline' | 'overlay';
export type BadgeColor = 'primary' | 'accent' | 'warn' | 'normal' | 'info' | 'success' | 'warning' | 'error';
export type BadgePosition = 'above after' | 'above before' | 'below after' | 'below before';
export type BadgeSize = 'small' | 'medium' | 'large';

/**
 * Configuración para badges inline (custom CSS)
 */
export interface InlineBadgeConfig {
  variant: 'inline';
  color: Extract<BadgeColor, 'normal' | 'info' | 'success' | 'warning' | 'error'>;
  hasIndicator?: boolean;
  size?: BadgeSize;
}

/**
 * Configuración para badges overlay (matBadge)
 */
export interface OverlayBadgeConfig {
  variant: 'overlay';
  color: Extract<BadgeColor, 'primary' | 'accent' | 'warn'>;
  position?: BadgePosition;
  overlap?: boolean;
  size?: BadgeSize;
  hidden?: boolean;
}

export type BadgeConfig = InlineBadgeConfig | OverlayBadgeConfig;

