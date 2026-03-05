import { Routes } from '@angular/router';
import { LayoutComponent } from '@layout/layout.component';
import { authGuard } from '@auth/guards/auth.guard';

export const LAYOUT_STATIC_CHILDREN: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () =>
      import('@features/auth/shared/auth-layout.component').then(
        (m) => m.AuthLayoutComponent,
      ),
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('@features/auth/login/login.component').then(
            (m) => m.LoginComponent,
          ),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },

  // ── Rutas protegidas (con layout principal) ───────────────────────────────
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: LAYOUT_STATIC_CHILDREN,
  },
];
