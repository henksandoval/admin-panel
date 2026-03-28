import { inject, Injectable } from '@angular/core';
import { Route } from '@angular/router';
import { ApiMenuItem } from './api-menu-item.contract';
import { LoggingService } from '@core/logging-audit';
import { authGuard, permissionGuard, roleGuard } from '@core/auth/guards';
import { ROUTE_LOADER_REGISTRY, LazyComponentLoader } from './navigation.tokens';
import { RouteDefinition, ROUTE_REGISTRY } from './route-registry';

@Injectable({
  providedIn: 'root',
})
export class RouteBuilderService {
  private readonly logger: LoggingService = inject(LoggingService);
  private readonly routeLoaders = inject(ROUTE_LOADER_REGISTRY);

  public buildRoutes(items: ApiMenuItem[]): Route[] {
    return items
      .map((item: ApiMenuItem) => this.buildRoute(item))
      .filter((route: Route | null): route is Route => route !== null);
  }

  private buildRoute(item: ApiMenuItem): Route | null {
    const definition: RouteDefinition | undefined = ROUTE_REGISTRY[item.id];
    const loader = this.routeLoaders[item.id];

    if (!definition) {
      this.logger.warn(
        `[RouteBuilderService] id '${item.id}' no tiene entrada en ROUTE_REGISTRY. Se omite de las rutas.`,
      );
      return null;
    }

    const hasChildren = !!item.children?.length;
    const route = this.buildBaseRoute(definition, loader, hasChildren, item);

    if (!route) return null;

    return this.applyAuthGuards(route, definition);
  }

  private buildBaseRoute(
    definition: RouteDefinition,
    loader: LazyComponentLoader | undefined,
    hasChildren: boolean,
    item: ApiMenuItem,
  ): Route | null {
    if (loader && !hasChildren) {
      return { path: definition.path, loadComponent: loader };
    }

    if (loader && hasChildren) {
      return {
        path: definition.path,
        loadComponent: loader,
        children: this.buildRoutes(item.children!),
      };
    }

    if (hasChildren) {
      return {
        path: definition.path,
        children: this.buildRoutes(item.children!),
      };
    }

    this.logger.warn(
      `[RouteBuilderService] id '${item.id}' no tiene loader ni hijos. Se omite.`,
    );
    return null;
  }

  private applyAuthGuards(route: Route, definition: RouteDefinition): Route {
    if (!definition.requiresAuth) return route;

    const hasRoles = !!definition.roles?.length;
    const hasPermissions = !!definition.permissions?.length;

    const guards = [authGuard];
    if (hasRoles) guards.push(roleGuard);
    if (hasPermissions) guards.push(permissionGuard);

    return {
      ...route,
      canActivate: guards,
      ...((hasRoles || hasPermissions) && {
        data: {
          ...route.data,
          ...(hasRoles && {
            roles:      definition.roles,
            requireAll: definition.requireAllRoles ?? false,
          }),
          ...(hasPermissions && {
            permissions:           definition.permissions,
            requireAllPermissions: definition.requireAllPermissions ?? false,
          }),
        },
      }),
    };
  }
}
