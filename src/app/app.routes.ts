import { InjectionToken } from '@angular/core';
import { Routes } from '@angular/router';
import { authGuard } from '@core/auth/guards';
import { LayoutComponent } from '@layout/layout.component';

export const LAYOUT_ROUTE_FACTORY = new InjectionToken<(dynamicChildren: Routes) => Routes>(
  'LAYOUT_ROUTE_FACTORY',
);

export const LAYOUT_STATIC_CHILDREN: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];

export const CONTEXT_AWARE_ERROR_ROUTES: Routes = [
  {
    path: 'not-found',
    loadComponent: () =>
      import('@features/errors/pages/not-found/not-found.component').then(
        (m) => m.NotFoundComponent,
      ),
  },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('@features/errors/pages/unauthorized/unauthorized.component').then(
        (m) => m.UnauthorizedComponent,
      ),
  },
  {
    path: 'server-error',
    loadComponent: () =>
      import('@features/errors/pages/server-error/server-error.component').then(
        (m) => m.ServerErrorComponent,
      ),
  },
];

export const CRITICAL_ERROR_ROUTES: Routes = [
  {
    path: 'session-expired',
    loadComponent: () =>
      import('@features/errors/pages/session-expired/session-expired.component').then(
        (m) => m.SessionExpiredComponent,
      ),
  },
  {
    path: 'access-denied',
    loadComponent: () =>
      import('@features/errors/pages/access-denied/access-denied.component').then(
        (m) => m.AccessDeniedComponent,
      ),
  },
  {
    path: 'system-down',
    loadComponent: () =>
      import('@features/errors/pages/system-down/system-down.component').then(
        (m) => m.SystemDownComponent,
      ),
  },
];

export const AUTH_ROUTES: Routes = [
  {
    path: 'auth',
    loadComponent: () =>
      import('@features/auth/auth-layout.component').then(
        (m) => m.AuthLayoutComponent,
      ),
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('@features/auth/pages/login/login.component').then(
            (m) => m.LoginComponent,
          ),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('@features/auth/pages/register/register.component').then(
            (m) => m.RegisterComponent,
          ),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('@features/auth/pages/forgot-password/forgot-password.component').then(
            (m) => m.ForgotPasswordComponent,
          ),
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('@features/auth/pages/reset-password/reset-password.component').then(
            (m) => m.ResetPasswordComponent,
          ),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
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
        path: 'errors',
        children: CONTEXT_AWARE_ERROR_ROUTES,
      },
    ],
  },
  {
    path: 'critical-errors',
    children: CRITICAL_ERROR_ROUTES,
  },
  {
    path: '**',
    redirectTo: '/errors/not-found',
  },
];
