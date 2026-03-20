import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NavigationItem } from '@core/models';
import { authGuard, permissionGuard, roleGuard } from '@auth/guards/auth.guard';
import { ROUTE_LOADER_REGISTRY, RouteLoaderRegistry } from '@core/registry/route-registry';
import { LoggingService } from './logging.service';
import { RouteBuilderService } from './route-builder.service';

vi.mock('@core/registry/route-registry', async (importOriginal) => {
  const original = await importOriginal<typeof import('@core/registry/route-registry')>();
  return {
    ...original,
    ROUTE_REGISTRY: {
      ...original.ROUTE_REGISTRY,
      'permission-only': {
        path: 'permission-only',
        requiresAuth: true,
        permissions: ['write'],
      },
      'roles-and-permissions': {
        path: 'roles-and-permissions',
        requiresAuth: true,
        roles: ['admin'],
        permissions: ['write'],
      },
    },
  };
});

const MOCK_LOADER = vi.fn().mockResolvedValue({});

function createRouteBuilderService(loaders: RouteLoaderRegistry = {}) {
  const loggerMock = { warn: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn() };

  TestBed.configureTestingModule({
    providers: [
      { provide: LoggingService, useValue: loggerMock },
      { provide: ROUTE_LOADER_REGISTRY, useValue: loaders },
    ],
  });

  const service = TestBed.inject(RouteBuilderService);
  return { service, loggerMock };
}

describe('RouteBuilderService', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  describe('buildRoutes', () => {
    it('generates a route with loadComponent when the item has a registered loader', () => {
      const { service } = createRouteBuilderService({ dashboard: MOCK_LOADER });
      const item: NavigationItem = { id: 'dashboard', title: 'Dashboard', icon: '' };

      const routes = service.buildRoutes([item]);

      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('dashboard');
      expect(routes[0].loadComponent).toBe(MOCK_LOADER);
    });

    it('generates a parent route with children when the item has child items', () => {
      const { service } = createRouteBuilderService({ 'error-404': MOCK_LOADER });
      const parent: NavigationItem = {
        id: 'errors',
        title: 'Errors',
        icon: '',
        children: [{ id: 'error-404', title: '404', icon: '' }],
      };

      const routes = service.buildRoutes([parent]);

      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('errors');
      expect(routes[0].children).toHaveLength(1);
      expect(routes[0].children![0].path).toBe('404');
    });

    it('includes authGuard in canActivate for routes that require authentication without roles', () => {
      const { service } = createRouteBuilderService({ dashboard: MOCK_LOADER });
      const item: NavigationItem = { id: 'dashboard', title: 'Dashboard', icon: '' };

      const routes = service.buildRoutes([item]);

      expect(routes[0].canActivate).toEqual([authGuard]);
    });

    it('includes authGuard and roleGuard with role data for routes that require authentication with roles', () => {
      const { service } = createRouteBuilderService({ pds: MOCK_LOADER });
      const item: NavigationItem = { id: 'pds', title: 'PDS', icon: '' };

      const routes = service.buildRoutes([item]);

      expect(routes[0].canActivate).toEqual([authGuard, roleGuard]);
      expect(routes[0].data?.['roles']).toEqual(['admin']);
    });

    it('includes authGuard and permissionGuard with permission data for routes that require authentication with permissions', () => {
      const { service } = createRouteBuilderService({ 'permission-only': MOCK_LOADER });
      const item: NavigationItem = { id: 'permission-only', title: 'Permission Only', icon: '' };

      const routes = service.buildRoutes([item]);

      expect(routes[0].canActivate).toEqual([authGuard, permissionGuard]);
      expect(routes[0].data?.['permissions']).toEqual(['write']);
    });

    it('includes authGuard, roleGuard, and permissionGuard when both roles and permissions are required', () => {
      const { service } = createRouteBuilderService({ 'roles-and-permissions': MOCK_LOADER });
      const item: NavigationItem = { id: 'roles-and-permissions', title: 'Roles And Permissions', icon: '' };

      const routes = service.buildRoutes([item]);

      expect(routes[0].canActivate).toEqual([authGuard, roleGuard, permissionGuard]);
      expect(routes[0].data?.['roles']).toEqual(['admin']);
      expect(routes[0].data?.['permissions']).toEqual(['write']);
    });

    it('ignores items with unknown ids and still builds routes for valid items', () => {
      const { service, loggerMock } = createRouteBuilderService({ dashboard: MOCK_LOADER });
      const unknownItem: NavigationItem = { id: 'unknown-id', title: 'Unknown', icon: '' };
      const validItem: NavigationItem = { id: 'dashboard', title: 'Dashboard', icon: '' };

      const routes = service.buildRoutes([unknownItem, validItem]);

      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('dashboard');
      expect(loggerMock.warn).toHaveBeenCalled();
    });

    it('ignores items with no loader and no children and emits a warning', () => {
      const { service, loggerMock } = createRouteBuilderService({});
      const item: NavigationItem = { id: 'errors', title: 'Errors', icon: '' };

      const routes = service.buildRoutes([item]);

      expect(routes).toHaveLength(0);
      expect(loggerMock.warn).toHaveBeenCalled();
    });
  });
});
