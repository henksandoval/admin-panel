import { InjectionToken } from '@angular/core';
import { Routes } from '@angular/router';
import { LayoutComponent } from '@layout/layout.component';
import { authGuard } from '@auth/guards/auth.guard';
import { APP_PATHS, ROUTE_SEGMENTS } from '@core/models/app-routes.model';

export const LAYOUT_ROUTE_FACTORY = new InjectionToken<(dynamicChildren: Routes) => Routes>(
  'LAYOUT_ROUTE_FACTORY',
);

export const LAYOUT_STATIC_CHILDREN: Routes = [
  {
    path: '',
    redirectTo: ROUTE_SEGMENTS.dashboard,
    pathMatch: 'full',
  },
];

export const CONTEXT_AWARE_ERROR_ROUTES: Routes = [
  {
    path: ROUTE_SEGMENTS.notFound,
    loadComponent: () =>
      import('@features/errors/pages/not-found/not-found.component').then(
        (m) => m.NotFoundComponent,
      ),
  },
  {
    path: ROUTE_SEGMENTS.unauthorized,
    loadComponent: () =>
      import('@features/errors/pages/unauthorized/unauthorized.component').then(
        (m) => m.UnauthorizedComponent,
      ),
  },
  {
    path: ROUTE_SEGMENTS.serverError,
    loadComponent: () =>
      import('@features/errors/pages/server-error/server-error.component').then(
        (m) => m.ServerErrorComponent,
      ),
  },
];

export const CRITICAL_ERROR_ROUTES: Routes = [
  {
    path: ROUTE_SEGMENTS.sessionExpired,
    loadComponent: () =>
      import('@features/errors/pages/session-expired/session-expired.component').then(
        (m) => m.SessionExpiredComponent,
      ),
  },
  {
    path: ROUTE_SEGMENTS.accessDenied,
    loadComponent: () =>
      import('@features/errors/pages/access-denied/access-denied.component').then(
        (m) => m.AccessDeniedComponent,
      ),
  },
  {
    path: ROUTE_SEGMENTS.systemDown,
    loadComponent: () =>
      import('@features/errors/pages/system-down/system-down.component').then(
        (m) => m.SystemDownComponent,
      ),
  },
];

export const AUTH_ROUTES: Routes = [
  {
    path: ROUTE_SEGMENTS.auth,
    loadComponent: () =>
      import('@features/auth/auth-layout.component').then(
        (m) => m.AuthLayoutComponent,
      ),
    children: [
      {
        path: ROUTE_SEGMENTS.login,
        loadComponent: () =>
          import('@features/auth/pages/login/login.component').then(
            (m) => m.LoginComponent,
          ),
      },
      {
        path: ROUTE_SEGMENTS.register,
        loadComponent: () =>
          import('@features/auth/pages/register/register.component').then(
            (m) => m.RegisterComponent,
          ),
      },
      {
        path: ROUTE_SEGMENTS.forgotPassword,
        loadComponent: () =>
          import('@features/auth/pages/forgot-password/forgot-password.component').then(
            (m) => m.ForgotPasswordComponent,
          ),
      },
      {
        path: ROUTE_SEGMENTS.resetPassword,
        loadComponent: () =>
          import('@features/auth/pages/reset-password/reset-password.component').then(
            (m) => m.ResetPasswordComponent,
          ),
      },
      { path: '', redirectTo: ROUTE_SEGMENTS.login, pathMatch: 'full' },
    ],
  },
];

export const routes: Routes = [
  ...AUTH_ROUTES,
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      ...LAYOUT_STATIC_CHILDREN,
      {
        path: ROUTE_SEGMENTS.errors,
        children: CONTEXT_AWARE_ERROR_ROUTES,
      },
    ],
  },
  {
    path: ROUTE_SEGMENTS.criticalErrors,
    children: CRITICAL_ERROR_ROUTES,
  },
  {
    path: '**',
    redirectTo: APP_PATHS.errors.notFound,
  },
];
