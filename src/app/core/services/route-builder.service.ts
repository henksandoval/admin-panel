import { inject, Injectable } from '@angular/core';
import { Route } from '@angular/router';
import { ApiMenuItem } from '@core/contracts/api-menu-item.model';
import { ROUTE_REGISTRY, RouteDefinition } from '@core/registry/route-registry';
import { LoggingService } from '@core/services/logging.service';

@Injectable({
  providedIn: 'root',
})
export class RouteBuilderService {
  private readonly logger: LoggingService = inject(LoggingService);

  public buildRoutes(items: ApiMenuItem[]): Route[] {
    return items
      .map((item: ApiMenuItem) => this.buildRoute(item))
      .filter((route: Route | null): route is Route => route !== null);
  }

  private buildRoute(item: ApiMenuItem): Route | null {
    const definition: RouteDefinition | undefined = ROUTE_REGISTRY[item.id];

    if (!definition) {
      this.logger.warn(
        `[RouteBuilderService] id '${item.id}' no tiene entrada en ROUTE_REGISTRY. Se omite de las rutas.`,
      );
      return null;
    }

    const hasChildren = !!item.children?.length;

    if (definition.loader && !hasChildren) {
      return { path: definition.path, loadComponent: definition.loader };
    }

    if (definition.loader && hasChildren) {
      return {
        path: definition.path,
        loadComponent: definition.loader,
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
}

