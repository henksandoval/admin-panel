import { inject, Injectable } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { LAYOUT_STATIC_CHILDREN } from '../../app.routes';
import { MenuDataService } from '@core/services/menu-data.service';
import { RouteBuilderService } from '@core/services/route-builder.service';
import { LoggingService } from '@core/services/logging.service';
import { LayoutComponent } from '@layout/layout.component';

@Injectable({
  providedIn: 'root',
})
export class InitializationService {
  private readonly menuDataService: MenuDataService = inject(MenuDataService);
  private readonly routeBuilder: RouteBuilderService = inject(RouteBuilderService);
  private readonly router: Router = inject(Router);
  private readonly logger: LoggingService = inject(LoggingService);

  async initialize(): Promise<void> {
    try {
      await lastValueFrom(this.menuDataService.loadMenu());

      const dynamicRoutes = this.routeBuilder.buildRoutes(this.menuDataService.menuItems());

      const freshRoutes: Routes = [
        {
          path: '',
          component: LayoutComponent,
          children: [...LAYOUT_STATIC_CHILDREN, ...dynamicRoutes],
        },
      ];

      this.router.resetConfig(freshRoutes);
      this.logger.info('Rutas dinámicas inicializadas correctamente.');
    } catch (error) {
      this.logger.error('Error al inicializar rutas dinámicas.', error);
      throw error;
    }
  }
}
