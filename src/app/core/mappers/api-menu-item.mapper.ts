import { inject, Injectable } from '@angular/core';
import { ApiMenuItem } from '@core/contracts';
import { NavigationBadge, NavigationItem, NAVIGATION_DEFAULTS } from '@core/models';
import { ROUTE_REGISTRY } from '@core/registry/route-registry';
import { LoggingService } from '@core/services/logging.service';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiMenuItemMapper {
  private readonly logger = inject(LoggingService);

  toNavigationItems(items: ApiMenuItem[], parentPath = ''): NavigationItem[] {
    return items
      .map((item): NavigationItem | null => this.toNavigationItem(item, parentPath))
      .filter((item): item is NavigationItem => item !== null);
  }

  private toNavigationItem(item: ApiMenuItem, parentPath: string): NavigationItem | null {
    if (item.hidden) {
      return null;
    }

    const definition = ROUTE_REGISTRY[item.id];

    if (!definition) {
      this.logger.warn(`[ApiMenuItemMapper] id '${item.id}' not found in ROUTE_REGISTRY. Skipping.`);
      if (environment.strictMenuRoutes) {
        throw new Error(`[ApiMenuItemMapper] id '${item.id}' not found in ROUTE_REGISTRY.`);
      }
      return null;
    }

    const fullPath = parentPath ? `${parentPath}/${definition.path}` : `/${definition.path}`;
    const hasChildren = !!item.children?.length;

    const badge: NavigationBadge | undefined = item.badge
      ? {
          title: item.badge.title,
          type: item.badge.type,
          indicator: item.badge.indicator ?? NAVIGATION_DEFAULTS.badgeIndicator,
        }
      : undefined;

    return {
      id: item.id,
      title: item.label,
      icon: item.icon ?? NAVIGATION_DEFAULTS.icon,
      url: fullPath,
      badge,
      requiresAuth: item.requiresAuth ?? definition.requiresAuth ?? false,
      roles: item.roles ?? definition.roles,
      requireAllRoles: item.requireAllRoles ?? definition.requireAllRoles,
      children: hasChildren ? this.toNavigationItems(item.children ?? [], fullPath) : undefined,
    };
  }
}
