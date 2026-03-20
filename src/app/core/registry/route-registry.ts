import { InjectionToken, Type } from '@angular/core';
import { ROUTE_SEGMENTS } from '@core/models/app-routes.model';

interface DefaultExport<T> {
  default: T;
}

export type LazyComponentLoader = () => Promise<Type<unknown> | DefaultExport<Type<unknown>>>;

export type RouteLoaderRegistry = Record<string, LazyComponentLoader>;

export const ROUTE_LOADER_REGISTRY = new InjectionToken<RouteLoaderRegistry>(
  'ROUTE_LOADER_REGISTRY',
);

export interface RouteDefinition {
  readonly path: string;
  readonly requiresAuth?: boolean;
  readonly roles?: string[];
  readonly requireAllRoles?: boolean;
  readonly permissions?: string[];
  readonly requireAllPermissions?: boolean;
}

const coreRoutes: Record<string, RouteDefinition> = {
  'dashboard': { path: ROUTE_SEGMENTS.dashboard, requiresAuth: true },
};

const errorRoutes: Record<string, RouteDefinition> = {
  'errors': { path: ROUTE_SEGMENTS.errors },
  'error-403': { path: ROUTE_SEGMENTS.unauthorized },
  'error-404': { path: ROUTE_SEGMENTS.notFound },
  'error-500': { path: ROUTE_SEGMENTS.serverError },
};

const criticalErrorRoutes: Record<string, RouteDefinition> = {
  'critical-errors': { path: ROUTE_SEGMENTS.criticalErrors },
  'error-session-expired': { path: ROUTE_SEGMENTS.sessionExpired },
  'error-access-denied': { path: ROUTE_SEGMENTS.accessDenied },
  'error-system-down': { path: ROUTE_SEGMENTS.systemDown },
};

const pdsRoutes: Record<string, RouteDefinition> = {
  'pds': { path: 'pds', requiresAuth: true, roles: ['admin'] },
  'pds-index': { path: 'index' },
  'pds-form': { path: 'form' },
  'pds-buttons': { path: 'buttons' },
  'pds-checkboxes': { path: 'checkboxes' },
  'pds-radios': { path: 'radios' },
  'pds-indicators': { path: 'indicators' },
  'pds-selects': { path: 'selects' },
  'pds-toggle-groups': { path: 'toggle-groups' },
  'pds-icons': { path: 'icons-gallery' },
  'pds-typography': { path: 'typography' },
  'pds-layout': { path: 'layout' },
  'pds-layout-dashboard': { path: 'dashboard' },
  'pds-layout-full-width': { path: 'full-width' },
  'pds-layout-main-sidebar': { path: 'main-sidebar' },
  'pds-layout-sidebar-main': { path: 'sidebar-main' },
  'pds-layout-two-column': { path: 'two-column' },
  'pds-layout-two-column-footer': { path: 'two-column-footer' },
  'pds-layout-three-column': { path: 'three-column' },
  'pds-table': { path: 'table' },
  'pds-table-client-side': { path: 'client-side' },
  'pds-table-server-side': { path: 'server-side' },
  'badges': { path: 'badges', requiresAuth: true },
  'normal': { path: 'normal' },
  'success': { path: 'success' },
  'info': { path: 'info' },
  'warning': { path: 'warning' },
  'error': { path: 'error' },
  'normal-indicator': { path: 'normal-indicator' },
  'success-indicator': { path: 'success-indicator' },
  'info-indicator': { path: 'info-indicator' },
  'warning-indicator': { path: 'warning-indicator' },
  'error-indicator': { path: 'error-indicator' },
};

export const ROUTE_REGISTRY: Record<string, RouteDefinition> = {
  ...coreRoutes,
  ...errorRoutes,
  ...criticalErrorRoutes,
  ...pdsRoutes,
};

