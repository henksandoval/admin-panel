import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { lastValueFrom, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

import { AuthService } from './auth.service';
import { AUTH_PROVIDER } from '@auth/providers/auth-provider.token';
import { AUTH_DEFAULTS } from '@auth/models/auth.model';
import {
  createMockAuthProvider,
  createFailingAuthProvider,
  MOCK_USER,
  MOCK_TOKEN_RESPONSE,
} from '@auth/testing/auth-test.helpers';

describe('AuthService', () => {
  let service: AuthService;
  let router: Router;

  function setup(providerOverrides = {}) {
    const mockProvider = createMockAuthProvider(providerOverrides);
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        AuthService,
        { provide: AUTH_PROVIDER, useValue: mockProvider },
      ],
    });
    service = TestBed.inject(AuthService);
    router  = TestBed.inject(Router);
    return mockProvider;
  }

  function setupFailing() {
    const failing = createFailingAuthProvider();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        AuthService,
        { provide: AUTH_PROVIDER, useValue: failing },
      ],
    });
    service = TestBed.inject(AuthService);
    router  = TestBed.inject(Router);
    return failing;
  }

  describe('estado inicial', () => {
    beforeEach(() => setup());

    it('debe iniciar con status "checking"', () => {
      expect(service.status()).toBe('checking');
    });

    it('debe iniciar con currentUser null', () => {
      expect(service.currentUser()).toBeNull();
    });

    it('debe iniciar con accessToken null', () => {
      expect(service.accessToken()).toBeNull();
    });

    it('isAuthenticated debe ser false en el estado inicial', () => {
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('checkSession()', () => {
    it('debe establecer status "authenticated" cuando el refresh tiene éxito', async () => {
      setup();
      await lastValueFrom(service.checkSession(), { defaultValue: undefined });

      expect(service.status()).toBe('authenticated');
      expect(service.currentUser()).toEqual(MOCK_USER);
      expect(service.accessToken()).toBe(MOCK_TOKEN_RESPONSE.accessToken);
      expect(service.isAuthenticated()).toBe(true);
    });

    it('debe establecer status "unauthenticated" cuando el refresh falla', async () => {
      setupFailing();
      await lastValueFrom(service.checkSession(), { defaultValue: undefined });

      expect(service.status()).toBe('unauthenticated');
      expect(service.currentUser()).toBeNull();
      expect(service.accessToken()).toBeNull();
    });

    it('NO debe redirigir cuando el refresh falla en checkSession', async () => {
      setupFailing();
      const navigateSpy = vi.spyOn(router, 'navigateByUrl');

      await lastValueFrom(service.checkSession(), { defaultValue: undefined });

      expect(navigateSpy).not.toHaveBeenCalled();
    });
  });

  describe('login()', () => {
    it('debe establecer status "authenticated" tras login exitoso', async () => {
      setup();
      await lastValueFrom(
        service.login({ email: 'test@example.com', password: 'pass1234' }),
        { defaultValue: undefined },
      );

      expect(service.status()).toBe('authenticated');
      expect(service.currentUser()).toEqual(MOCK_USER);
      expect(service.accessToken()).toBe(MOCK_TOKEN_RESPONSE.accessToken);
    });

    it('debe navegar a "/" por defecto tras login exitoso', async () => {
      setup();
      const spy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

      // El observable completa con EMPTY pero el tap se ejecuta antes de EMPTY
      await new Promise<void>((resolve) => {
        service.login({ email: 'test@example.com', password: 'pass1234' })
          .subscribe({ complete: resolve, error: () => resolve() });
      });

      expect(spy).toHaveBeenCalledWith(AUTH_DEFAULTS.redirectAfterLogin);
    });

    it('debe navegar a returnUrl cuando se provee', async () => {
      setup();
      const spy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

      await new Promise<void>((resolve) => {
        service.login({ email: 'test@example.com', password: 'pass1234' }, '/dashboard')
          .subscribe({ complete: resolve, error: () => resolve() });
      });

      expect(spy).toHaveBeenCalledWith('/dashboard');
    });

    it('debe propagar el error cuando el proveedor falla', async () => {
      setupFailing();

      await expect(
        lastValueFrom(service.login({ email: 'bad@example.com', password: 'wrong' })),
      ).rejects.toThrow('Invalid credentials');

      expect(service.status()).toBe('checking');
    });
  });

  describe('logout()', () => {
    it('debe limpiar la sesión y redirigir a login', async () => {
      setup();
      await lastValueFrom(
        service.login({ email: 'test@example.com', password: 'pass1234' }),
        { defaultValue: undefined },
      );
      expect(service.isAuthenticated()).toBe(true);

      const navigateSpy = vi.spyOn(router, 'navigateByUrl');
      await lastValueFrom(service.logout(), { defaultValue: undefined });

      expect(service.status()).toBe('unauthenticated');
      expect(service.currentUser()).toBeNull();
      expect(service.accessToken()).toBeNull();
      expect(navigateSpy).toHaveBeenCalledWith(AUTH_DEFAULTS.loginRoute);
    });

    it('debe limpiar la sesión incluso cuando el endpoint falla', async () => {
      // Proveedor que devuelve Observable de error (no throw síncrono)
      setup({ logout: vi.fn(() => throwError(() => new Error('Network error'))) });

      await lastValueFrom(service.logout(), { defaultValue: undefined });

      expect(service.status()).toBe('unauthenticated');
      expect(service.currentUser()).toBeNull();
    });
  });

  describe('computed de autorización', () => {
    beforeEach(async () => {
      setup();
      await lastValueFrom(service.checkSession(), { defaultValue: undefined });
    });

    it('hasRole() debe retornar true para un rol que el usuario tiene', () => {
      expect(service.hasRole('admin')()).toBe(true);
    });

    it('hasRole() debe retornar false para un rol que el usuario no tiene', () => {
      expect(service.hasRole('superadmin')()).toBe(false);
    });

    it('hasPermission() debe retornar true para un permiso que el usuario tiene', () => {
      expect(service.hasPermission('write')()).toBe(true);
    });

    it('hasPermission() debe retornar false para un permiso que el usuario no tiene', () => {
      expect(service.hasPermission('delete')()).toBe(false);
    });

    it('hasAnyRole() debe retornar true si el usuario tiene alguno de los roles', () => {
      expect(service.hasAnyRole(['superadmin', 'editor'])()).toBe(true);
    });

    it('hasAnyRole() debe retornar false si el usuario no tiene ninguno de los roles', () => {
      expect(service.hasAnyRole(['superadmin', 'owner'])()).toBe(false);
    });

    it('hasRole() debe retornar false cuando no hay usuario autenticado', async () => {
      setupFailing();
      await lastValueFrom(service.checkSession(), { defaultValue: undefined });

      expect(service.hasRole('admin')()).toBe(false);
    });
  });

  describe('timer de refresh proactivo', () => {
    afterEach(() => vi.useRealTimers());

    it('debe programar el refresh cuando la sesión se establece con vida útil suficiente', async () => {
      vi.useFakeTimers();
      const mockProvider = createMockAuthProvider();
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [RouterTestingModule],
        providers: [
          AuthService,
          { provide: AUTH_PROVIDER, useValue: mockProvider },
        ],
      });
      service = TestBed.inject(AuthService);

      await lastValueFrom(service.checkSession(), { defaultValue: undefined });
      expect(service.isAuthenticated()).toBe(true);

      // Instalamos el spy y reseteamos conteo DESPUÉS de checkSession
      const refreshSpy = vi.spyOn(mockProvider, 'refreshAccessToken');
      refreshSpy.mockClear();

      // expiresInSeconds=900s, threshold=60s → timer programado para 840s
      // Avanzamos menos de 840s para que el timer NO dispare aún
      vi.advanceTimersByTime(839_999);
      expect(refreshSpy).toHaveBeenCalledTimes(0);

      // Avanzamos los 2ms restantes → el timer dispara exactamente una vez
      vi.advanceTimersByTime(2);
      expect(refreshSpy).toHaveBeenCalledTimes(1);
    });
  });
});




