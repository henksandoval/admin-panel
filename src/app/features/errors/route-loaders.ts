import { RouteLoaderRegistry } from '@core/registry/route-registry';

export const errorRouteLoaders: RouteLoaderRegistry = {
  'error-403': () => import('@features/errors/pages/unauthorized/unauthorized.component').then((m) => m.UnauthorizedComponent),
  'error-404': () => import('@features/errors/pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
  'error-500': () => import('@features/errors/pages/server-error/server-error.component').then((m) => m.ServerErrorComponent),
  'not-found': () => import('@features/errors/pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
  'unauthorized': () => import('@features/errors/pages/unauthorized/unauthorized.component').then((m) => m.UnauthorizedComponent),
  'server-error': () => import('@features/errors/pages/server-error/server-error.component').then((m) => m.ServerErrorComponent),
};
