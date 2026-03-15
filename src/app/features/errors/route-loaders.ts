import { RouteLoaderRegistry } from '@core/registry/route-registry';

export const errorRouteLoaders: RouteLoaderRegistry = {
  'not-found': () => import('@features/errors/pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
  'unauthorized': () => import('@features/errors/pages/unauthorized/unauthorized.component').then((m) => m.UnauthorizedComponent),
  'server-error': () => import('@features/errors/pages/server-error/server-error.component').then((m) => m.ServerErrorComponent),
};

export const criticalErrorRouteLoaders: RouteLoaderRegistry = {
  'system-down': () => import('@features/errors/pages/system-down/system-down.component').then((m) => m.SystemDownComponent),
  'session-expired': () => import('@features/errors/pages/session-expired/session-expired.component').then((m) => m.SessionExpiredComponent),
  'access-denied': () => import('@features/errors/pages/access-denied/access-denied.component').then((m) => m.AccessDeniedComponent),
};
