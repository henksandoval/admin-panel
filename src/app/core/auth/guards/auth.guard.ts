import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';
import { AuthService } from '@auth/services/auth.service';
import { AUTH_DEFAULTS } from '@auth/models';

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

export const canActivateAuthenticated = [authGuard] as const;

export const canActivateWithRole = (
  roles: string[],
  requireAll = false,
): Pick<import('@angular/router').Route, 'canActivate' | 'data'> => ({
  canActivate: [authGuard, roleGuard],
  data: { roles, requireAll },
});

export const canActivateWithPermission = (
  permissions: string[],
  requireAll = false,
): Pick<import('@angular/router').Route, 'canActivate' | 'data'> => ({
  canActivate: [authGuard, permissionGuard],
  data: { permissions, requireAllPermissions: requireAll },
});

