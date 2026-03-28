import { inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { LoggingService } from '@core/logging-audit';
import { ApiMenuItem, validateApiMenuItems } from './api-menu-item.contract';
import { NavigationItem, NavigationBadge, NAVIGATION_DEFAULTS } from './navigation.model';
import { ROUTE_REGISTRY } from './route-registry';
import { STRICT_MENU_ROUTES } from './navigation.tokens';

@Injectable({
  providedIn: 'root',
})
export class MenuDataService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly logger: LoggingService = inject(LoggingService);
  private readonly strictMenuRoutes = inject(STRICT_MENU_ROUTES);

  private readonly _menuItems: WritableSignal<ApiMenuItem[]> = signal<ApiMenuItem[]>([]);
  public readonly menuItems: Signal<ApiMenuItem[]> = this._menuItems.asReadonly();

  private readonly _navigationItems: WritableSignal<NavigationItem[]> = signal<NavigationItem[]>([]);
  public readonly navigationItems: Signal<NavigationItem[]> = this._navigationItems.asReadonly();

  public loadMenu(): Observable<void> {
    return this.http.get<unknown>('data/menu.json').pipe(
      map((data: unknown) => validateApiMenuItems(data)),
      tap((items: ApiMenuItem[]) => {
        this._menuItems.set(items);
        this._navigationItems.set(this.buildNavigationItems(items, ''));
        this.logger.info('Datos del menú cargados.');
      }),
      catchError((error: unknown) => {
        this.logger.error('Error al cargar el menú.', error);
        this._menuItems.set([]);
        this._navigationItems.set([]);
        throw error;
      }),
      map(() => void 0),
    );
  }

  private buildNavigationItems(items: ApiMenuItem[], parentPath: string): NavigationItem[] {
    return items
      .map((item: ApiMenuItem): NavigationItem | null => {
        if (item.hidden) {
          return null;
        }

        const definition = ROUTE_REGISTRY[item.id];

        if (!definition) {
          this.logger.warn(`[MenuDataService] id '${item.id}' no tiene entrada en ROUTE_REGISTRY. Se omite del menú.`);
          if (this.strictMenuRoutes) {
            throw new Error(`[MenuDataService] id '${item.id}' no tiene entrada en ROUTE_REGISTRY.`);
          }
          return null;
        }

        const fullPath = parentPath
          ? `${parentPath}/${definition.path}`
          : `/${definition.path}`;

        const hasChildren = !!item.children?.length;

        const badge: NavigationBadge | undefined = item.badge
          ? {
              title: item.badge.title,
              type: item.badge.type,
              indicator: item.badge.indicator ?? NAVIGATION_DEFAULTS.badgeIndicator,
            }
          : undefined;

        const requiresAuth = item.requiresAuth ?? definition.requiresAuth ?? false;
        const roles = item.roles ?? definition.roles;
        const requireAllRoles = item.requireAllRoles ?? definition.requireAllRoles;

        return {
          id: item.id,
          title: item.label,
          icon: item.icon ?? NAVIGATION_DEFAULTS.icon,
          url: fullPath,
          badge,
          requiresAuth,
          roles,
          requireAllRoles,
          children: hasChildren
            ? this.buildNavigationItems(item.children, fullPath)
            : undefined,
        };
      })
      .filter((item): item is NavigationItem => item !== null);
  }
}
