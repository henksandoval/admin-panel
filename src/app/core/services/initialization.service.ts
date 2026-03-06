import { inject, Injectable } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { AUTH_ROUTES, LAYOUT_STATIC_CHILDREN } from '../../app.routes';
import { MenuDataService } from '@core/services/menu-data.service';
import { RouteBuilderService } from '@core/services/route-builder.service';
import { LoggingService } from '@core/services/logging.service';
import { LayoutComponent } from '@layout/layout.component';
import { AuthService } from '@auth/services/auth.service';
import { authGuard } from '@auth/guards/auth.guard';

@Injectable({
  providedIn: 'root',
})
export class InitializationService {
  private readonly menuDataService: MenuDataService = inject(MenuDataService);
  private readonly routeBuilder: RouteBuilderService = inject(RouteBuilderService);
  private readonly router: Router = inject(Router);
  private readonly logger: LoggingService = inject(LoggingService);
  private readonly authService: AuthService = inject(AuthService);

  async initialize(): Promise<void> {
    try {
      await lastValueFrom(this.authService.checkSession(), { defaultValue: undefined });
      await lastValueFrom(this.menuDataService.loadMenu());

      const dynamicRoutes = this.routeBuilder.buildRoutes(this.menuDataService.menuItems());

      const freshRoutes: Routes = [
        ...AUTH_ROUTES,
        {
          path: '',
          component: LayoutComponent,
          canActivate: [authGuard],
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
