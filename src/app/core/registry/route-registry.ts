import { Type } from '@angular/core';

interface DefaultExport<T> {
  default: T;
}

export type LazyComponentLoader = () => Promise<Type<unknown> | DefaultExport<Type<unknown>>>;

export interface RouteDefinition {
  readonly path: string;
  readonly loader?: LazyComponentLoader;
}

export const ROUTE_REGISTRY: Record<string, RouteDefinition> = {
  'dashboard': {
    path: 'dashboard',
    loader: () => import('@features/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },

  // ── Nodos estructurales (sin componente propio) ──────────────────────────────
  'applications': { path: 'apps' },
  'ecommerce':    { path: 'ecommerce' },
  'reports':      { path: 'reports' },
  'pages':        { path: 'pages' },
  'authentication': { path: 'auth' },
  'errors':       { path: 'errors' },
  'user-interface': { path: 'ui' },

  // ── Páginas de aplicación ────────────────────────────────────────────────────
  'products':       { path: 'products',       loader: () => import('@features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  'orders':         { path: 'orders',         loader: () => import('@features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  'customers':      { path: 'customers',      loader: () => import('@features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  'sales':          { path: 'sales',          loader: () => import('@features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  'purchases':      { path: 'purchases',      loader: () => import('@features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  'analytics':      { path: 'analytics',      loader: () => import('@features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  'mail':           { path: 'mail',           loader: () => import('@features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  'chat':           { path: 'chat',           loader: () => import('@features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  'login':          { path: 'login',          loader: () => import('@features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  'register':       { path: 'register',       loader: () => import('@features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  'forgot-password':{ path: 'forgot-password',loader: () => import('@features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  'lock-screen':    { path: 'lock-screen',    loader: () => import('@features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  'two-factor-auth':{ path: 'two-factor-auth',loader: () => import('@features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  'error-400':      { path: '400',            loader: () => import('@features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  'error-401':      { path: '401',            loader: () => import('@features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  'error-403':      { path: '403',            loader: () => import('@features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  'error-404':      { path: '404',            loader: () => import('@features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  'error-500':      { path: '500',            loader: () => import('@features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  'error-503':      { path: '503',            loader: () => import('@features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  'error-504':      { path: '504',            loader: () => import('@features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  'forms':          { path: 'forms',          loader: () => import('@features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  'cards':          { path: 'cards',          loader: () => import('@features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  'settings':       { path: 'settings',       loader: () => import('@features/dashboard/dashboard.component').then(m => m.DashboardComponent) },

  // ── Badges ────────────────────────────────────────────────────────────────
  'badges':             { path: 'badges' },
  'normal':             { path: 'normal',             loader: () => import('@features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  'success':            { path: 'success',            loader: () => import('@features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  'info':               { path: 'info',               loader: () => import('@features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  'warning':            { path: 'warning',            loader: () => import('@features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  'error':              { path: 'error',              loader: () => import('@features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  'normal-indicator':   { path: 'normal-indicator',   loader: () => import('@features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  'success-indicator':  { path: 'success-indicator',  loader: () => import('@features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  'info-indicator':     { path: 'info-indicator',     loader: () => import('@features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  'warning-indicator':  { path: 'warning-indicator',  loader: () => import('@features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  'error-indicator':    { path: 'error-indicator',    loader: () => import('@features/dashboard/dashboard.component').then(m => m.DashboardComponent) },

  // ── PDS ───────────────────────────────────────────────────────────────────
  'pds': {
    path: 'pds',
    loader: () => import('@features/pds/showcase.component').then(m => m.ShowcaseComponent),
  },
  'pds-index': {
    path: 'index',
    loader: () => import('@features/pds/pages/index/index.component').then(m => m.IndexComponent),
  },
  'pds-form': {
    path: 'form',
    loader: () => import('@features/pds/pages/form/form.component').then(m => m.FormComponent),
  },
  'pds-buttons': {
    path: 'buttons',
    loader: () => import('@features/pds/pages/buttons/buttons.component'),
  },
  'pds-checkboxes': {
    path: 'checkboxes',
    loader: () => import('@features/pds/pages/checkboxes/checkboxes.component'),
  },
  'pds-radios': {
    path: 'radios',
    loader: () => import('@features/pds/pages/radios/radios.component'),
  },
  'pds-indicators': {
    path: 'indicators',
    loader: () => import('@features/pds/pages/indicators/indicators.component'),
  },
  'pds-selects': {
    path: 'selects',
    loader: () => import('@features/pds/pages/selects/selects.component'),
  },
  'pds-toggle-groups': {
    path: 'toggle-groups',
    loader: () => import('@features/pds/pages/toggle-groups/toggle-groups.component'),
  },
  'pds-icons': {
    path: 'icons-gallery',
    loader: () => import('@features/pds/pages/icons-gallery/icons-gallery.component'),
  },
  'pds-layout':       { path: 'layout' },
  'pds-layout-dashboard': {
    path: 'dashboard',
    loader: () => import('@features/pds/pages/layouts/dashboard.component'),
  },
  'pds-layout-full-width': {
    path: 'full-width',
    loader: () => import('@features/pds/pages/layouts/full-width.component'),
  },
  'pds-layout-main-sidebar': {
    path: 'main-sidebar',
    loader: () => import('@features/pds/pages/layouts/main-sidebar.component'),
  },
  'pds-layout-sidebar-main': {
    path: 'sidebar-main',
    loader: () => import('@features/pds/pages/layouts/sidebar-main.component'),
  },
  'pds-layout-two-column': {
    path: 'two-column',
    loader: () => import('@features/pds/pages/layouts/two-column.component'),
  },
  'pds-layout-two-column-footer': {
    path: 'two-column-footer',
    loader: () => import('@features/pds/pages/layouts/two-column-footer.component'),
  },
  'pds-layout-three-column': {
    path: 'three-column',
    loader: () => import('@features/pds/pages/layouts/three-column.component'),
  },
  'pds-table':        { path: 'table' },
  'pds-table-client-side': {
    path: 'client-side',
    loader: () => import('@features/pds/pages/table-client-side/table-client-side.component').then(m => m.TableClientSideComponent),
  },
  'pds-table-server-side': {
    path: 'server-side',
    loader: () => import('@features/pds/pages/table-server-side/table-server-side.component').then(m => m.TableServerSideComponent),
  },
};

