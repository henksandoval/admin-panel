import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiMenuItem, MenuContractError, MenuDataService, STRICT_MENU_ROUTES } from '@core/navigation';
import { LoggingService } from '@core/logging-audit';

function createMenuDataService() {
  const loggerMock = { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() };

  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: LoggingService, useValue: loggerMock },
      { provide: STRICT_MENU_ROUTES, useValue: ['dashboard', 'pds', 'pds-form'] },
    ],
  });

  const service = TestBed.inject(MenuDataService);
  const httpController = TestBed.inject(HttpTestingController);
  return { service, httpController, loggerMock };
}

describe('MenuDataService', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('updates menuItems and navigationItems signals when API returns valid menu data', () => {
    const { service, httpController } = createMenuDataService();
    const apiResponse: ApiMenuItem[] = [
      { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    ];

    let completed = false;
    service.loadMenu().subscribe({ complete: () => (completed = true) });

    const req = httpController.expectOne('data/menu.json');
    req.flush(apiResponse);

    expect(completed).toBe(true);
    expect(service.menuItems()).toEqual(apiResponse);
    expect(service.navigationItems()).toHaveLength(1);
    expect(service.navigationItems()[0].url).toBe('/dashboard');
  });

  it('builds the full nested path for child navigation items', () => {
    const { service, httpController } = createMenuDataService();
    const apiResponse: ApiMenuItem[] = [
      {
        id: 'pds',
        label: 'PDS',
        children: [{ id: 'pds-form', label: 'Form' }],
      },
    ];

    service.loadMenu().subscribe();

    const req = httpController.expectOne('data/menu.json');
    req.flush(apiResponse);

    const pdsItem = service.navigationItems()[0];
    const formItem = pdsItem.children?.[0];

    expect(formItem?.url).toBe('/pds/form');
  });

  it('filters out items with unknown ids and emits a warning log', () => {
    // Override default to non-strict to test the filtering behavior
    TestBed.resetTestingModule();
    const loggerMock = { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: LoggingService, useValue: loggerMock },
        { provide: STRICT_MENU_ROUTES, useValue: false },
      ],
    });
    const service = TestBed.inject(MenuDataService);
    const httpController = TestBed.inject(HttpTestingController);

    const apiResponse: ApiMenuItem[] = [
      { id: 'unknown-feature', label: 'Unknown' },
      { id: 'dashboard', label: 'Dashboard' },
    ];

    service.loadMenu().subscribe();

    const req = httpController.expectOne('data/menu.json');
    req.flush(apiResponse);

    const ids = service.navigationItems().map((item) => item.id);
    expect(ids).not.toContain('unknown-feature');
    expect(ids).toContain('dashboard');
    expect(loggerMock.warn).toHaveBeenCalled();
  });

  it('clears signals and re-throws the error when the API returns an error', () => {
    const { service, httpController } = createMenuDataService();

    let thrownError: unknown;
    service.loadMenu().subscribe({ error: (e: unknown) => (thrownError = e) });

    const req = httpController.expectOne('data/menu.json');
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

    expect(service.menuItems()).toEqual([]);
    expect(service.navigationItems()).toEqual([]);
    expect(thrownError).toBeDefined();
  });

  it('throws a MenuContractError and clears signals when the API returns a non-array response', () => {
    const { service, httpController, loggerMock } = createMenuDataService();

    let thrownError: unknown;
    service.loadMenu().subscribe({ error: (e: unknown) => (thrownError = e) });

    const req = httpController.expectOne('data/menu.json');
    req.flush({ menu: [] });

    expect(thrownError).toBeInstanceOf(MenuContractError);
    expect(service.menuItems()).toEqual([]);
    expect(service.navigationItems()).toEqual([]);
    expect(loggerMock.error).toHaveBeenCalled();
  });

  it('throws a MenuContractError and clears signals when an item is missing required fields', () => {
    const { service, httpController, loggerMock } = createMenuDataService();

    let thrownError: unknown;
    service.loadMenu().subscribe({ error: (e: unknown) => (thrownError = e) });

    const req = httpController.expectOne('data/menu.json');
    req.flush([{ label: 'No ID here' }]);

    expect(thrownError).toBeInstanceOf(MenuContractError);
    expect(service.menuItems()).toEqual([]);
    expect(service.navigationItems()).toEqual([]);
    expect(loggerMock.error).toHaveBeenCalled();
  });
});
