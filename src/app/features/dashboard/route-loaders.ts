import { RouteLoaderRegistry } from '@core/navigation';

export const dashboardRouteLoaders: RouteLoaderRegistry = {
  dashboard: () => import('@features/dashboard/dashboard.component').then((m) => m.DashboardComponent)
};
