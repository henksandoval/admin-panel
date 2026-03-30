import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';
import { AuthService } from '@core/auth/services';
import { AUTH_DEFAULTS } from '@core/auth/models';

export const authGuard: CanActivateFn = (
  _route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return toObservable(authService.status).pipe(
    filter((status) => status !== 'checking'),
    take(1),
    map((status) => {
      if (status === 'authenticated') return true;
      return router.createUrlTree([AUTH_DEFAULTS.loginRoute], {
        queryParams: { returnUrl: state.url },
      });
    }),
  );
};

export const roleGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot,
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles = (route.data['roles'] as string[] | undefined) ?? [];
  const requireAll = (route.data['requireAll'] as boolean | undefined) ?? false;
  const user = authService.currentUser();

  if (!user || requiredRoles.length === 0) return true;

  const hasAccess = requireAll
    ? requiredRoles.every((role) => user.roles.includes(role))
    : requiredRoles.some((role) => user.roles.includes(role));

  return hasAccess
    ? true
    : router.createUrlTree([AUTH_DEFAULTS.unauthorizedRoute]);
};

export const permissionGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot,
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredPermissions = (route.data['permissions'] as string[] | undefined) ?? [];
  const requireAll = (route.data['requireAllPermissions'] as boolean | undefined) ?? false;
  const user = authService.currentUser();

  if (!user || requiredPermissions.length === 0) return true;

  const hasAccess = requireAll
    ? requiredPermissions.every((permission) => user.permissions.includes(permission))
    : requiredPermissions.some((permission) => user.permissions.includes(permission));

  return hasAccess
    ? true
    : router.createUrlTree([AUTH_DEFAULTS.unauthorizedRoute]);
};
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return toObservable(authService.status).pipe(
    filter((status) => status !== 'checking'),
    take(1),
    map((status) => {
      if (status !== 'authenticated') return true;
      return router.createUrlTree([AUTH_DEFAULTS.redirectAfterLogin]);
    }),
  );
};
