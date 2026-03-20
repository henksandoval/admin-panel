export const MENU_SCHEMA_VERSION = '1.0';

export interface ApiMenuItemBadge {
  readonly title: string;
  readonly type: 'normal' | 'success' | 'info' | 'warning' | 'error';
  readonly indicator?: boolean;
}

export interface ApiMenuItem {
  readonly id: string;
  readonly label: string;
  readonly icon?: string;
  readonly hidden?: boolean;
  readonly requiresAuth?: boolean;
  readonly roles?: readonly string[];
  readonly requireAllRoles?: boolean;
  readonly badge?: ApiMenuItemBadge;
  readonly children?: ApiMenuItem[];
}

export class MenuContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MenuContractError';
  }
}

const VALID_BADGE_TYPES: ReadonlySet<string> = new Set(['normal', 'success', 'info', 'warning', 'error']);

function isValidBadge(badge: unknown): badge is ApiMenuItemBadge {
  if (typeof badge !== 'object' || badge === null) return false;
  const b = badge as Record<string, unknown>;
  return typeof b['title'] === 'string' && typeof b['type'] === 'string' && VALID_BADGE_TYPES.has(b['type']);
}

function isValidMenuItem(item: unknown): item is ApiMenuItem {
  if (typeof item !== 'object' || item === null) return false;
  const i = item as Record<string, unknown>;
  if (typeof i['id'] !== 'string' || i['id'].trim() === '') return false;
  if (typeof i['label'] !== 'string' || i['label'].trim() === '') return false;
  if (i['badge'] !== undefined && !isValidBadge(i['badge'])) return false;
  if (i['children'] !== undefined) {
    if (!Array.isArray(i['children'])) return false;
    if (!i['children'].every(isValidMenuItem)) return false;
  }
  return true;
}

export function validateApiMenuItems(data: unknown): ApiMenuItem[] {
  if (!Array.isArray(data)) {
    throw new MenuContractError(
      `[MenuContract v${MENU_SCHEMA_VERSION}] Expected an array of menu items, got ${typeof data}.`,
    );
  }
  const invalidItems = data.filter((item) => !isValidMenuItem(item));
  if (invalidItems.length > 0) {
    throw new MenuContractError(
      `[MenuContract v${MENU_SCHEMA_VERSION}] ${invalidItems.length} menu item(s) failed validation.`,
    );
  }
  return data as ApiMenuItem[];
}
