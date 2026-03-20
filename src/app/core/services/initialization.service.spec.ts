import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Router } from '@angular/router';
import { EMPTY, of, throwError } from 'rxjs';
import { ApiMenuItem, MenuContractError, MENU_SCHEMA_VERSION } from '@core/contracts';
import { AuthService } from '@auth/services/auth.service';
import { LAYOUT_ROUTE_FACTORY } from '../../app.routes';
import { InitializationService } from './initialization.service';
import { LoggingService } from './logging.service';
import { MenuDataService } from './menu-data.service';
import { RouteBuilderService } from './route-builder.service';

const MOCK_MENU_ITEMS: ApiMenuItem[] = [{ id: 'dashboard', label: 'Dashboard' }];
const MOCK_DYNAMIC_ROUTES = [{ path: 'dashboard', loadComponent: vi.fn() }];

function createInitializationService() {
  const menuDataMock = {
    loadMenu: vi.fn().mockReturnValue(of(undefined)),
    menuItems: vi.fn().mockReturnValue(MOCK_MENU_ITEMS),
  };

  const routeBuilderMock = {
    buildRoutes: vi.fn().mockReturnValue(MOCK_DYNAMIC_ROUTES),
  };

  const routerMock = {
    resetConfig: vi.fn(),
    navigateByUrl: vi.fn().mockResolvedValue(true),
  };

  const loggerMock = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };

  const authServiceMock = {
    checkSession: vi.fn().mockReturnValue(EMPTY),
  };

  const layoutRouteFactoryMock = vi.fn().mockReturnValue(MOCK_DYNAMIC_ROUTES);

  TestBed.configureTestingModule({
    providers: [
      { provide: MenuDataService, useValue: menuDataMock },
      { provide: RouteBuilderService, useValue: routeBuilderMock },
      { provide: Router, useValue: routerMock },
      { provide: LoggingService, useValue: loggerMock },
      { provide: AuthService, useValue: authServiceMock },
      { provide: LAYOUT_ROUTE_FACTORY, useValue: layoutRouteFactoryMock },
    ],
  });

  const service = TestBed.inject(InitializationService);
  return { service, menuDataMock, routeBuilderMock, routerMock, loggerMock, authServiceMock, layoutRouteFactoryMock };
}

describe('InitializationService', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('calls router.resetConfig with combined routes after a successful full initialization sequence', async () => {
    const { service, routerMock, routeBuilderMock, menuDataMock, layoutRouteFactoryMock } = createInitializationService();

    await service.initialize();

    expect(menuDataMock.loadMenu).toHaveBeenCalled();
    expect(routeBuilderMock.buildRoutes).toHaveBeenCalledWith(MOCK_MENU_ITEMS);
    expect(layoutRouteFactoryMock).toHaveBeenCalledWith(MOCK_DYNAMIC_ROUTES);
    expect(routerMock.resetConfig).toHaveBeenCalledWith(MOCK_DYNAMIC_ROUTES);
  });

  it('still calls loadMenu and configures routes when no prior session exists', async () => {
    const { service, menuDataMock, routerMock, authServiceMock } = createInitializationService();
    authServiceMock.checkSession.mockReturnValue(EMPTY);

    await service.initialize();

    expect(menuDataMock.loadMenu).toHaveBeenCalled();
    expect(routerMock.resetConfig).toHaveBeenCalled();
  });

  it('re-throws the error and does not call router.resetConfig when loadMenu fails', async () => {
    const { service, menuDataMock, routerMock, loggerMock } = createInitializationService();
    const loadError = new Error('API Error');
    menuDataMock.loadMenu.mockReturnValue(throwError(() => loadError));

    await expect(service.initialize()).rejects.toThrow('API Error');

    expect(routerMock.resetConfig).not.toHaveBeenCalled();
    expect(loggerMock.error).toHaveBeenCalled();
  });

  it('navigates to the error page and does not re-throw when loadMenu fails with a MenuContractError', async () => {
    const { service, menuDataMock, routerMock, loggerMock } = createInitializationService();
    const contractError = new MenuContractError(`[MenuContract v${MENU_SCHEMA_VERSION}] 1 menu item(s) failed validation.`);
    menuDataMock.loadMenu.mockReturnValue(throwError(() => contractError));

    await expect(service.initialize()).resolves.toBeUndefined();

    expect(routerMock.resetConfig).toHaveBeenCalled();
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/errors/server-error');
    expect(loggerMock.error).toHaveBeenCalled();
  });
});
