import { Routes } from '@angular/router';
import { LayoutComponent } from './core/components/layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      // Placeholder routes for the navigation items
      {
        path: 'apps',
        children: [
          {
            path: 'ecommerce',
            children: [
              { path: 'products', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
              { path: 'orders', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
              { path: 'customers', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) }
            ]
          },
          { path: 'mail', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
          { path: 'chat', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) }
        ]
      },
      {
        path: 'pages',
        children: [
          {
            path: 'auth',
            children: [
              { path: 'login', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
              { path: 'register', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
              { path: 'forgot-password', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) }
            ]
          },
          {
            path: 'errors',
            children: [
              { path: '404', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
              { path: '500', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) }
            ]
          },
          { path: 'profile', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) }
        ]
      },
      {
        path: 'ui',
        children: [
          { path: 'forms', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
          { path: 'tables', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
          { path: 'cards', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) }
        ]
      },
      { path: 'settings', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) }
    ]
  }
];
