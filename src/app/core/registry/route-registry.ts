import { InjectionToken, Type } from '@angular/core';

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
}

export const ROUTE_REGISTRY: Record<string, RouteDefinition> = {
  'dashboard': {
    path: 'dashboard',
    requiresAuth: true,
  },
  'errors': { path: 'errors' },
  'error-403': { path: 'unauthorized' },
  'error-404': { path: 'not-found' },
  'error-500': { path: 'server-error' },
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
  'pds': {
    path: 'pds',
    requiresAuth: true,
    roles: ['admin'],
  },
  'pds-index': {
    path: 'index',
  },
  'pds-form': {
    path: 'form',
  },
  'pds-buttons': {
    path: 'buttons',
  },
  'pds-checkboxes': {
    path: 'checkboxes',
  },
  'pds-radios': {
    path: 'radios',
  },
  'pds-indicators': {
    path: 'indicators',
  },
  'pds-selects': {
    path: 'selects',
  },
  'pds-toggle-groups': {
    path: 'toggle-groups',
  },
  'pds-icons': {
    path: 'icons-gallery',
  },
  'pds-typography': {
    path: 'typography',
  },
  'pds-layout': { path: 'layout' },
  'pds-layout-dashboard': {
    path: 'dashboard',
  },
  'pds-layout-full-width': {
    path: 'full-width',
  },
  'pds-layout-main-sidebar': {
    path: 'main-sidebar',
  },
  'pds-layout-sidebar-main': {
    path: 'sidebar-main',
  },
  'pds-layout-two-column': {
    path: 'two-column',
  },
  'pds-layout-two-column-footer': {
    path: 'two-column-footer',
  },
  'pds-layout-three-column': {
    path: 'three-column',
  },
  'pds-table': { path: 'table' },
  'pds-table-client-side': {
    path: 'client-side',
  },
  'pds-table-server-side': {
    path: 'server-side',
  },
};

