export interface ApiMenuItemBadge {
  readonly title: string;
  readonly type: 'normal' | 'success' | 'info' | 'warning' | 'error';
  readonly indicator?: boolean;
}

export interface ApiMenuItem {
  readonly id: string;
  readonly label: string;
  readonly icon?: string;
  readonly requiresAuth?: boolean;
  readonly roles?: readonly string[];
  readonly requireAllRoles?: boolean;
  readonly badge?: ApiMenuItemBadge;
  readonly children?: ApiMenuItem[];
}

