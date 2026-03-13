import { RouteLoaderRegistry } from '@core/registry';

export const dashboardRouteLoaders: RouteLoaderRegistry = {
  dashboard: () => import('@features/dashboard/dashboard.component').then((m) => m.DashboardComponent)
};
