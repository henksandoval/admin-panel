import { RouteLoaderRegistry } from '@core/registry';
import { dashboardRouteLoaders } from '@features/dashboard/route-loaders';
import { pdsRouteLoaders } from '@features/pds/route-loaders';

export const featureRouteLoaders: RouteLoaderRegistry = {
  ...dashboardRouteLoaders,
  ...pdsRouteLoaders,
};
