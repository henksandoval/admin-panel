import { dashboardRouteLoaders } from '@features/dashboard/route-loaders';
import { pdsRouteLoaders } from '@features/pds/route-loaders';
import { criticalErrorRouteLoaders, errorRouteLoaders } from '@features/errors/route-loaders';
import { RouteLoaderRegistry } from '@core/navigation';

export const featureRouteLoaders: RouteLoaderRegistry = {
  ...dashboardRouteLoaders,
  ...pdsRouteLoaders,
  ...errorRouteLoaders,
  ...criticalErrorRouteLoaders,
};
