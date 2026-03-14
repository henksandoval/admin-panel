import { RouteLoaderRegistry } from '@core/registry/route-registry';
import { dashboardRouteLoaders } from '@features/dashboard/route-loaders';
import { pdsRouteLoaders } from '@features/pds/route-loaders';
import { errorRouteLoaders } from '@features/errors/route-loaders';

export const featureRouteLoaders: RouteLoaderRegistry = {
  ...dashboardRouteLoaders,
  ...pdsRouteLoaders,
  ...errorRouteLoaders,
};
