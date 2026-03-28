import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LoggingService } from '@core/logging-audit';
import { SettingsService } from './settings.service';

const STORAGE_KEY = 'app-settings';

function createSettingsService() {
  const loggerMock = { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() };

  TestBed.configureTestingModule({
    providers: [{ provide: LoggingService, useValue: loggerMock }],
  });

  const service = TestBed.inject(SettingsService);
  TestBed.flushEffects();

  return { service, loggerMock };
}

describe('SettingsService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.className = '';
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      } as MediaQueryList)),
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
    localStorage.clear();
    document.body.className = '';
  });

  it('restores persisted settings from localStorage on instantiation', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme: 'deep-ocean', scheme: 'dark' }));

    const { service } = createSettingsService();

    expect(service.config()).toEqual({ theme: 'deep-ocean', scheme: 'dark' });
  });

  it('falls back to default settings when localStorage contains invalid JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{ invalid json');

    const { service } = createSettingsService();

    expect(service.config()).toEqual({ theme: 'default', scheme: 'light' });
  });

  it('applies the new theme CSS class and removes the previous one when setTheme() is called', () => {
    const { service } = createSettingsService();

    service.setTheme('aurora-tech');
    TestBed.flushEffects();

    expect(document.body.classList.contains('theme-aurora-tech')).toBe(true);
    expect(document.body.classList.contains('theme-default')).toBe(false);
  });

  it('applies dark-theme class and isDarkMode returns true when scheme is auto and OS prefers dark', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      } as MediaQueryList)),
    });

    const { service } = createSettingsService();

    service.setScheme('auto');
    TestBed.flushEffects();

    expect(document.body.classList.contains('dark-theme')).toBe(true);
    expect(service.isDarkMode).toBe(true);
  });

  it('persists updated settings to localStorage after a theme change', () => {
    const { service } = createSettingsService();

    service.setTheme('forest-growth');
    TestBed.flushEffects();

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as { theme: string };
    expect(stored.theme).toBe('forest-growth');
  });
});
