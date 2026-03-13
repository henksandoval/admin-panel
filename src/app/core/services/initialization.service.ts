import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { LAYOUT_ROUTE_FACTORY } from '../../app.routes';
import { MenuDataService } from './menu-data.service';
import { RouteBuilderService } from './route-builder.service';
import { LoggingService } from './logging.service';
import { AuthService } from '@auth/services';

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

  async initialize(): Promise<void> {
    try {
      await lastValueFrom(this.authService.checkSession(), { defaultValue: undefined });
      await lastValueFrom(this.menuDataService.loadMenu());

      const dynamicRoutes = this.routeBuilder.buildRoutes(this.menuDataService.menuItems());

      this.router.resetConfig(this.layoutRouteFactory(dynamicRoutes));
      this.logger.info('Rutas dinámicas inicializadas correctamente.');
    } catch (error) {
      this.logger.error('Error al inicializar rutas dinámicas.', error);
      throw error;
    }
  }
}
