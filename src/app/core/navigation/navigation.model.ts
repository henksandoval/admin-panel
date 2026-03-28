export type BadgeType = 'normal' | 'success' | 'info' | 'warning' | 'error';

export interface NavigationBadge {
  readonly title: string;
  readonly type: BadgeType;
  readonly indicator: boolean;
}

export interface NavigationItem {
  readonly id: string;
  readonly title: string;
  readonly icon: string;
  readonly url?: string;
  readonly badge?: NavigationBadge;
  readonly requiresAuth?: boolean;
  readonly roles?: readonly string[];
  readonly requireAllRoles?: boolean;
  readonly children?: NavigationItem[];
}

export interface BreadcrumbItem {
  readonly label: string;
  readonly icon: string;
  readonly route: string | null;
}

export const NAVIGATION_DEFAULTS = {
  icon: '',
  badgeIndicator: false,
} as const;
