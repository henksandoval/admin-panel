import { Routes } from '@angular/router';
import { LayoutComponent } from '@layout/layout.component';

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
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'apps',
        children: [
          {
            path: 'ecommerce',
            children: [
              { path: 'products', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
              { path: 'orders', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
              { path: 'customers', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
              { path: 'reports', children: [
                { path: 'sales', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
                  { path: 'purchases', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) }
                ] },
              { path: 'analytics', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) }
            ]
          },
          { path: 'mail', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
          { path: 'chat', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) }
        ]
      },
      {
        path: 'pages',
        children: [
          {
            path: 'auth',
            children: [
              { path: 'login', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
              { path: 'register', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
              { path: 'forgot-password', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
              { path: 'lock-screen', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
              { path: 'two-factor-auth', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) }
            ]
          },
          {
            path: 'errors',
            children: [
              { path: '400', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
              { path: '401', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
              { path: '403', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
              { path: '404', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
              { path: '500', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
              { path: '503', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
              { path: '504', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) }
            ]
          },
          { path: 'profile', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) }
        ]
      },
      {
        path: 'ui',
        children: [
          { path: 'forms', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
          { path: 'tables', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
          { path: 'cards', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) }
        ]
      },
      { path: 'settings', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      {
        path: 'showcase',
        loadComponent: () => import('./features/showcase/showcase.component').then(m => m.ShowcaseComponent),
        children: [
          { path: 'index', loadComponent: () => import('./features/showcase/pages/index/index.component').then(m => m.IndexComponent) },
          { path: 'forms', loadComponent: () => import('./features/showcase/pages/basic-forms/basic-forms.component').then(m => m.BasicFormsComponent) },
          { path: 'buttons', loadComponent: () => import('./features/showcase/pages/buttons/buttons.component').then(m => m.ButtonsComponent) },
          { path: 'checkboxes', loadComponent: () => import('./features/showcase/pages/checkboxes/checkboxes.component').then(m => m.CheckboxesComponent) },
        ]
      },
      {
        path: 'pds',
        loadComponent: () => import('./features/pds/showcase.component').then(m => m.ShowcaseComponent),
        children: [
          { path: 'index', loadComponent: () => import('./features/pds/pages/index/index.component').then(m => m.IndexComponent) },
          { path: 'forms', loadComponent: () => import('./features/pds/pages/basic-forms/basic-forms.component').then(m => m.BasicFormsComponent) },
          { path: 'buttons', loadComponent: () => import('./features/pds/pages/buttons/buttons.component') },
          { path: 'checkboxes', loadComponent: () => import('./features/pds/pages/checkboxes/checkboxes.component') }
        ]
      },
    ]
  }
];
