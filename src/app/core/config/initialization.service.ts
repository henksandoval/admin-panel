import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { MenuDataService } from '@core/navigation/menu-data.service';
import { RouteBuilderService } from '@core/navigation/route-builder.service';
import { LoggingService } from '@core/logging-audit';
import { AuthService } from '@core/auth/services';
import { MenuContractError } from '@core/navigation/api-menu-item.contract';
import { IS_PRODUCTION } from '@core/config';
import { API_BASE_URL } from '@core/network';
import { LAYOUT_ROUTE_FACTORY } from '@core/navigation';

const MENU_CONTRACT_ERROR_ROUTE = '/errors/server-error';

@Injectable({
  providedIn: 'root',
})
export class InitializationService {
  private readonly menuDataService: MenuDataService = inject(MenuDataService);
  private readonly routeBuilder: RouteBuilderService = inject(RouteBuilderService);
  private readonly router: Router = inject(Router);
  private readonly logger: LoggingService = inject(LoggingService);
  private readonly authService: AuthService = inject(AuthService);
  private readonly layoutRouteFactory = inject(LAYOUT_ROUTE_FACTORY);
  private readonly isProduction = inject(IS_PRODUCTION);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  async initialize(): Promise<void> {
    try {
      if (this.isProduction && this.apiBaseUrl.includes('localhost')) {
        this.logger.warn($localize`@@envConfigWarning:Production build is using a localhost API base URL.`);
      }
      await lastValueFrom(this.authService.checkSession(), { defaultValue: undefined });
      await lastValueFrom(this.menuDataService.loadMenu());

      const dynamicRoutes = this.routeBuilder.buildRoutes(this.menuDataService.menuItems());

      this.router.resetConfig(this.layoutRouteFactory(dynamicRoutes));
      this.logger.info('Rutas dinámicas inicializadas correctamente.');
    } catch (error) {
      this.logger.error('Error al inicializar rutas dinámicas.', error);
      if (error instanceof MenuContractError) {
        this.router.resetConfig(this.layoutRouteFactory([]));
        await this.router.navigateByUrl(MENU_CONTRACT_ERROR_ROUTE);
        return;
      }
      throw error;
    }
  }
}
