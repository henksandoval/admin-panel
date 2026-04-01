import { computed, inject, Injectable, signal, Signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreadcrumbItem, NavigationItem } from '../models/navigation.model';
import { AuthUser } from '@core/auth/models';
import { MenuDataService } from './menu-data.service';
import { AuthService } from '@core/auth/services';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private readonly router: Router = inject(Router);
  private readonly authService: AuthService = inject(AuthService);
  private readonly menuDataService: MenuDataService = inject(MenuDataService);

  private readonly navigationMenu = computed<NavigationItem[]>(() => this.menuDataService.navigationItems());
  private readonly filteredNavigationMenu = computed<NavigationItem[]>(() =>
    this.filterNavigationItems(
      this.navigationMenu(),
      this.authService.currentUser(),
      this.authService.isAuthenticated(),
    ),
  );
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
    const menu = this.filteredNavigationMenu();
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
    return this.filteredNavigationMenu;
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
    const activeItem = this.filteredNavigationMenu().find((rootItem) =>
      this.itemContainsActiveRoute(rootItem),
    );
    this.activeRootItemId.set(activeItem?.id ?? null);
  }

  private filterNavigationItems(
    items: NavigationItem[],
    user: AuthUser | null,
    isAuthenticated: boolean,
  ): NavigationItem[] {
    return items.reduce<NavigationItem[]>((filtered, item) => {
      if (!this.isNavigationItemAllowed(item, user, isAuthenticated)) {
        return filtered;
      }

      const children = item.children
        ? this.filterNavigationItems(item.children, user, isAuthenticated)
        : undefined;

      if (item.children && (!children || children.length === 0) && !item.url) {
        return filtered;
      }

      filtered.push({
        ...item,
        ...(children ? { children } : {}),
      });

      return filtered;
    }, []);
  }

  private isNavigationItemAllowed(
    item: NavigationItem,
    user: AuthUser | null,
    isAuthenticated: boolean,
  ): boolean {
    const roles = item.roles ?? [];
    const requiresAuth = item.requiresAuth ?? roles.length > 0;

    if (requiresAuth && !isAuthenticated) return false;
    if (roles.length === 0) return true;
    if (!user) return false;

    return item.requireAllRoles
      ? roles.every((role) => user.roles.includes(role))
      : roles.some((role) => user.roles.includes(role));
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
