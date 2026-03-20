import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiMenuItem } from '@core/contracts';
import { LoggingService } from '@core/services/logging.service';
import { ApiMenuItemMapper } from './api-menu-item.mapper';

vi.mock('@core/registry/route-registry', async (importOriginal) => {
  const original = await importOriginal<typeof import('@core/registry/route-registry')>();
  return {
    ...original,
    ROUTE_REGISTRY: {
      ...original.ROUTE_REGISTRY,
      'badge-item': { path: 'badge-item' },
    },
  };
});

function createMapper() {
  const loggerMock = { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() };

  TestBed.configureTestingModule({
    providers: [
      ApiMenuItemMapper,
      { provide: LoggingService, useValue: loggerMock },
    ],
  });

  const mapper = TestBed.inject(ApiMenuItemMapper);
  return { mapper, loggerMock };
}

describe('ApiMenuItemMapper', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  describe('toNavigationItems', () => {
    it('maps label to title and computes a root-level url', () => {
      const { mapper } = createMapper();
      const item: ApiMenuItem = { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' };

      const result = mapper.toNavigationItems([item]);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Dashboard');
      expect(result[0].url).toBe('/dashboard');
      expect(result[0].icon).toBe('dashboard');
    });

    it('computes full nested path for child items', () => {
      const { mapper } = createMapper();
      const item: ApiMenuItem = {
        id: 'pds',
        label: 'PDS',
        children: [{ id: 'pds-form', label: 'Form' }],
      };

      const result = mapper.toNavigationItems([item]);

      expect(result[0].children).toHaveLength(1);
      expect(result[0].children![0].url).toBe('/pds/form');
    });

    it('filters out hidden items', () => {
      const { mapper } = createMapper();
      const items: ApiMenuItem[] = [
        { id: 'dashboard', label: 'Dashboard', hidden: true },
        { id: 'pds', label: 'PDS' },
      ];

      const result = mapper.toNavigationItems(items);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('pds');
    });

    it('omits items with ids not found in ROUTE_REGISTRY and logs a warning', () => {
      const { mapper, loggerMock } = createMapper();
      const items: ApiMenuItem[] = [
        { id: 'unknown-item', label: 'Unknown' },
        { id: 'dashboard', label: 'Dashboard' },
      ];

      const result = mapper.toNavigationItems(items);

      const ids = result.map((i) => i.id);
      expect(ids).not.toContain('unknown-item');
      expect(ids).toContain('dashboard');
      expect(loggerMock.warn).toHaveBeenCalled();
    });

    it('maps badge fields including default indicator value', () => {
      const { mapper } = createMapper();
      const item: ApiMenuItem = {
        id: 'badge-item',
        label: 'Badge Item',
        badge: { title: '3', type: 'info' },
      };

      const result = mapper.toNavigationItems([item]);

      expect(result[0].badge).toEqual({ title: '3', type: 'info', indicator: false });
    });

    it('uses provided badge indicator when set', () => {
      const { mapper } = createMapper();
      const item: ApiMenuItem = {
        id: 'badge-item',
        label: 'Badge Item',
        badge: { title: '!', type: 'warning', indicator: true },
      };

      const result = mapper.toNavigationItems([item]);

      expect(result[0].badge?.indicator).toBe(true);
    });

    it('uses default icon when item has no icon', () => {
      const { mapper } = createMapper();
      const item: ApiMenuItem = { id: 'dashboard', label: 'Dashboard' };

      const result = mapper.toNavigationItems([item]);

      expect(result[0].icon).toBe('');
    });

    it('returns empty array when given empty input', () => {
      const { mapper } = createMapper();

      const result = mapper.toNavigationItems([]);

      expect(result).toEqual([]);
    });
  });
});
