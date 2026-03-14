import { InjectionToken } from '@angular/core';
import { Routes } from '@angular/router';
import { LayoutComponent } from '@layout/layout.component';
import { ErrorLayoutComponent } from '@features/errors/error-layout.component';
import { authGuard } from '@auth/guards/auth.guard';

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

export const ERROR_ROUTES: Routes = [
  {
    path: 'errors',
    component: ErrorLayoutComponent,
    children: [
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
    ],
  },
];

export const routes: Routes = [
  ...AUTH_ROUTES,
  ...ERROR_ROUTES,
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: LAYOUT_STATIC_CHILDREN,
  },
  {
    path: '**',
    redirectTo: '/errors/not-found',
  },
];
