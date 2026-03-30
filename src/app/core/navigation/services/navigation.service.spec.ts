import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Subject } from 'rxjs';
import { NavigationItem } from '../models/navigation.model';
import { AuthService } from '@core/auth/services';
import { MenuDataService } from './menu-data.service';
import { NavigationService } from './navigation.service';

const DASHBOARD_ITEM: NavigationItem = {
  id: 'dashboard',
  title: 'Dashboard',
  icon: 'dashboard',
  url: '/dashboard',
};

const APPS_ITEM: NavigationItem = {
  id: 'apps',
  title: 'Apps',
  icon: 'apps',
  children: [
    {
      id: 'products',
      title: 'Products',
      icon: 'products',
      url: '/apps/products',
    },
  ],
};

function createNavigationService(options: {
  url?: string;
  navigationItems?: NavigationItem[];
  isActiveUrl?: string;
} = {}) {
  const { url = '/', navigationItems = [], isActiveUrl } = options;

  const routerEventSubject = new Subject<NavigationEnd>();

  const routerMock = {
    url,
    events: routerEventSubject.asObservable(),
    isActive: vi.fn().mockImplementation((routeUrl: string) =>
      isActiveUrl ? routeUrl === isActiveUrl : false,
    ),
  };

  const menuDataServiceMock = {
    navigationItems: vi.fn().mockReturnValue(navigationItems),
  };

  const authServiceMock = {
    currentUser: vi.fn().mockReturnValue(null),
    isAuthenticated: vi.fn().mockReturnValue(false),
  };

  TestBed.configureTestingModule({
    providers: [
      { provide: Router, useValue: routerMock },
      { provide: MenuDataService, useValue: menuDataServiceMock },
      { provide: AuthService, useValue: authServiceMock },
    ],
  });

  const service = TestBed.inject(NavigationService);
  return { service, routerEventSubject, routerMock };
}

describe('NavigationService', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('returns breadcrumbs with one item when the current URL matches a top-level navigation item', () => {
    const { service } = createNavigationService({
      url: '/dashboard',
      navigationItems: [DASHBOARD_ITEM],
    });

    const breadcrumbs = service.breadcrumbs();

    expect(breadcrumbs).toHaveLength(1);
    expect(breadcrumbs[0].label).toBe('Dashboard');
    expect(breadcrumbs[0].route).toBe('/dashboard');
  });

  it('returns the full breadcrumb chain for a nested route URL', () => {
    const { service, routerEventSubject } = createNavigationService({
      url: '/',
      navigationItems: [APPS_ITEM],
    });

    routerEventSubject.next(new NavigationEnd(1, '/apps/products', '/apps/products'));

    const breadcrumbs = service.breadcrumbs();

    expect(breadcrumbs).toHaveLength(2);
    expect(breadcrumbs[0].label).toBe('Apps');
    expect(breadcrumbs[0].route).toBeNull();
    expect(breadcrumbs[1].label).toBe('Products');
    expect(breadcrumbs[1].route).toBe('/apps/products');
  });

  it('returns an empty breadcrumbs array for unknown URLs', () => {
    const { service } = createNavigationService({
      url: '/ruta-inexistente',
      navigationItems: [DASHBOARD_ITEM],
    });

    const breadcrumbs = service.breadcrumbs();

    expect(breadcrumbs).toHaveLength(0);
  });

  it('sets the active root item id to the root item that contains the currently active route', () => {
    const { service } = createNavigationService({
      navigationItems: [APPS_ITEM],
      isActiveUrl: '/apps/products',
    });

    service.updateActiveRootItem();

    expect(service.getActiveRootItemId()()).toBe('apps');
  });
});
