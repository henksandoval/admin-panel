import { inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { LoggingService } from './logging.service';
import { ApiMenuItem } from '@core/contracts';
import { NavigationItem, NavigationBadge, NAVIGATION_DEFAULTS } from '@core/models';
import { ROUTE_REGISTRY } from '@core/registry';

@Injectable({
  providedIn: 'root',
})
export class MenuDataService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly logger: LoggingService = inject(LoggingService);

  private readonly _menuItems: WritableSignal<ApiMenuItem[]> = signal<ApiMenuItem[]>([]);
  public readonly menuItems: Signal<ApiMenuItem[]> = this._menuItems.asReadonly();

  private readonly _navigationItems: WritableSignal<NavigationItem[]> = signal<NavigationItem[]>([]);
  public readonly navigationItems: Signal<NavigationItem[]> = this._navigationItems.asReadonly();

  public loadMenu(): Observable<void> {
    return this.http.get<ApiMenuItem[]>('data/menu.json').pipe(
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
        const definition = ROUTE_REGISTRY[item.id];

        if (!definition) {
          this.logger.warn(`[MenuDataService] id '${item.id}' no tiene entrada en ROUTE_REGISTRY. Se omite del menú.`);
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

        return {
          id: item.id,
          title: item.label,
          icon: item.icon ?? NAVIGATION_DEFAULTS.icon,
          url: definition.loader ? fullPath : undefined,
          badge,
          children: hasChildren
            ? this.buildNavigationItems(item.children, fullPath)
            : undefined,
        };
      })
      .filter((item): item is NavigationItem => item !== null);
  }
}

