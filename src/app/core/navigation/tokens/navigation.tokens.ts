import { InjectionToken, Type } from '@angular/core';
import { Routes } from '@angular/router';

interface DefaultExport<T> {
  default: T;
}

export type LazyComponentLoader = () => Promise<Type<unknown> | DefaultExport<Type<unknown>>>;

export type RouteLoaderRegistry = Record<string, LazyComponentLoader>;

export const STRICT_MENU_ROUTES = new InjectionToken<boolean>('STRICT_MENU_ROUTES');

export const ROUTE_LOADER_REGISTRY = new InjectionToken<RouteLoaderRegistry>(
  'ROUTE_LOADER_REGISTRY',
);

export const LAYOUT_ROUTE_FACTORY = new InjectionToken<(dynamicChildren: Routes) => Routes>(
  'LAYOUT_ROUTE_FACTORY',
);
