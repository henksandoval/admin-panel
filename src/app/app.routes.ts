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
        path: 'pds',
        loadComponent: () => import('./features/pds/showcase.component').then(m => m.ShowcaseComponent),
        children: [
          { path: 'index', loadComponent: () => import('./features/pds/pages/index/index.component').then(m => m.IndexComponent) },
          { path: 'form', loadComponent: () => import('./features/pds/pages/form/form.component').then(m => m.FormComponent) },
          { path: 'buttons', loadComponent: () => import('./features/pds/pages/buttons/buttons.component') },
          { path: 'checkboxes', loadComponent: () => import('./features/pds/pages/checkboxes/checkboxes.component') },
          { path: 'radios', loadComponent: () => import('./features/pds/pages/radios/radios.component') },
          { path: 'indicators', loadComponent: () => import('./features/pds/pages/indicators/indicators.component') },
          { path: 'selects', loadComponent: () => import('./features/pds/pages/selects/selects.component') },
          { path: 'toggle-groups', loadComponent: () => import('./features/pds/pages/toggle-groups/toggle-groups.component') },
          {
            path: 'layout',
            children: [
              { path: 'full-width', loadComponent: () => import('./features/pds/pages/layouts/full-width.component') },
              { path: 'two-column', loadComponent: () => import('./features/pds/pages/layouts/two-column.component') },
              { path: 'two-column-footer', loadComponent: () => import('./features/pds/pages/layouts/two-column-footer.component') },
              { path: 'three-column', loadComponent: () => import('./features/pds/pages/layouts/three-column.component') },
              { path: 'main-sidebar', loadComponent: () => import('./features/pds/pages/layouts/main-sidebar.component') },
              { path: 'sidebar-main', loadComponent: () => import('./features/pds/pages/layouts/sidebar-main.component') },
              { path: 'dashboard', loadComponent: () => import('./features/pds/pages/layouts/dashboard.component') }
            ]
          }
        ]
      },
    ]
  }
];
