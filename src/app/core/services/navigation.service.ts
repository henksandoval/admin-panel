import { computed, inject, Injectable, signal, Signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationItem, BreadcrumbItem } from '@core/models';
import { MenuDataService } from './menu-data.service';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private readonly router: Router = inject(Router);
  private readonly menuDataService: MenuDataService = inject(MenuDataService);

  private readonly navigationMenu = computed<NavigationItem[]>(() => this.menuDataService.navigationItems());
  private readonly currentNavigationChildren = signal<NavigationItem[]>([]);
  private readonly activeRootItemId = signal<string | null>(null);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  readonly breadcrumbs = computed<BreadcrumbItem[]>(() => {
    const url = this.currentUrl();
    const menu = this.navigationMenu();
    return this.buildBreadcrumbs(menu, url);
  });

  isRouteActive(url: string): boolean {
    return this.router.isActive(url, {
      paths: 'subset',
      queryParams: 'ignored',
      fragment: 'ignored',
      matrixParams: 'ignored',
    });
  }

  getNavigation(): Signal<NavigationItem[]> {
    return this.navigationMenu;
  }

  getCurrentNavigation(): Signal<NavigationItem[]> {
    return this.currentNavigationChildren.asReadonly();
  }

  setCurrentNavigation(navigation: NavigationItem[]): void {
    this.currentNavigationChildren.set(navigation);
  }

  getActiveRootItemId(): Signal<string | null> {
    return this.activeRootItemId.asReadonly();
  }

  updateActiveRootItem(): void {
    const activeItem = this.navigationMenu().find((rootItem) =>
      this.itemContainsActiveRoute(rootItem),
    );
    this.activeRootItemId.set(activeItem?.id ?? null);
  }

  private buildBreadcrumbs(menu: NavigationItem[], url: string): BreadcrumbItem[] {
    return this.findPathToUrl(menu, url).map((item) => ({
      label: item.title,
      icon: item.icon,
      route: item.url ?? null,
    }));
  }

  private findPathToUrl(
    items: NavigationItem[],
    targetUrl: string,
    path: NavigationItem[] = [],
  ): NavigationItem[] {
    return items.reduce<NavigationItem[]>((found, item) => {
      if (found.length > 0) return found;

      const currentPath = [...path, item];

      if (item.url === targetUrl) return currentPath;

      if (item.children) {
        const childResult = this.findPathToUrl(item.children, targetUrl, currentPath);
        if (childResult.length > 0) return childResult;
      }

      return found;
    }, []);
  }

  private itemContainsActiveRoute(item: NavigationItem): boolean {
    if (item.url && this.isRouteActive(item.url)) return true;
    return item.children?.some((child) => this.itemContainsActiveRoute(child)) ?? false;
  }
}
