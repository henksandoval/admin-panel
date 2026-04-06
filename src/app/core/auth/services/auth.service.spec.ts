import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { lastValueFrom, of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from './auth.service';
import { AUTH_PROVIDER } from '@core/auth/providers';
import { AUTH_DEFAULTS } from '@auth/models/auth.model';
import { createFailingAuthProvider, createMockAuthProvider, MOCK_TOKEN_RESPONSE, MOCK_USER } from '@auth/testing';
import { AuditService } from '@core/logging-audit';

const mockAuditService: Pick<AuditService, 'record'> = {
  record: vi.fn(() => of(void 0)),
};

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
        { provide: AuditService, useValue: mockAuditService },
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
        { provide: AuditService, useValue: mockAuditService },
      ],
    });
    service = TestBed.inject(AuthService);
    router  = TestBed.inject(Router);
    return failing;
  }

  describe('initial state', () => {
    beforeEach(() => setup());

    it('initializes with status "checking"', () => {
      expect(service.status()).toBe('checking');
    });

    it('initializes with currentUser null', () => {
      expect(service.currentUser()).toBeNull();
    });

    it('initializes with accessToken null', () => {
      expect(service.accessToken()).toBeNull();
    });

    it('isAuthenticated is false on initial state', () => {
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('checkSession()', () => {
    it('sets status to "authenticated" when refresh succeeds', async () => {
      setup();
      await lastValueFrom(service.checkSession(), { defaultValue: undefined });

      expect(service.status()).toBe('authenticated');
      expect(service.currentUser()).toEqual(MOCK_USER);
      expect(service.accessToken()).toBe(MOCK_TOKEN_RESPONSE.accessToken);
      expect(service.isAuthenticated()).toBe(true);
    });

    it('sets status to "unauthenticated" when refresh fails', async () => {
      setupFailing();
      await lastValueFrom(service.checkSession(), { defaultValue: undefined });

      expect(service.status()).toBe('unauthenticated');
      expect(service.currentUser()).toBeNull();
      expect(service.accessToken()).toBeNull();
    });

    it('does not redirect when refresh fails during checkSession', async () => {
      setupFailing();
      const navigateSpy = vi.spyOn(router, 'navigateByUrl');

      await lastValueFrom(service.checkSession(), { defaultValue: undefined });

      expect(navigateSpy).not.toHaveBeenCalled();
    });
  });

  describe('login()', () => {
    it('sets status to "authenticated" after successful login', async () => {
      setup();
      await lastValueFrom(
        service.login({ email: 'test@example.com', password: 'pass1234' }),
        { defaultValue: undefined },
      );

      expect(service.status()).toBe('authenticated');
      expect(service.currentUser()).toEqual(MOCK_USER);
      expect(service.accessToken()).toBe(MOCK_TOKEN_RESPONSE.accessToken);
    });

    it('navigates to redirectAfterLogin by default after successful login', async () => {
      setup();
      const spy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

      await new Promise<void>((resolve) => {
        service.login({ email: 'test@example.com', password: 'pass1234' })
          .subscribe({ complete: resolve, error: () => resolve() });
      });

      expect(spy).toHaveBeenCalledWith(AUTH_DEFAULTS.redirectAfterLogin);
    });

    it('navigates to returnUrl when provided', async () => {
      setup();
      const spy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

      await new Promise<void>((resolve) => {
        service.login({ email: 'test@example.com', password: 'pass1234' }, '/dashboard')
          .subscribe({ complete: resolve, error: () => resolve() });
      });

      expect(spy).toHaveBeenCalledWith('/dashboard');
    });

    // ── Circuit #2: Login Failure ─────────────────────────────────────────────
    // RED phase — fails until AuthService.login() normalises HTTP 401 to a
    // generic message that does not reveal whether the user account exists (GAP-4).
    // Spec: CA-21 / "Mensajes de error" non-functional requirement.
    it('returns a generic credential error on invalid login — does not leak whether the user account exists', async () => {
      setup({
        login: vi.fn(() => throwError(() => new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' }))),
      });

      await expect(
        lastValueFrom(service.login({ email: 'bad@example.com', password: 'wrong' })),
      ).rejects.toMatchObject({ message: 'Correo o contraseña inválidos' });

      expect(service.status()).toBe('checking');
    });
  });

  describe('logout()', () => {
    it('clears session and redirects to login', async () => {
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

    it('clears session even when the logout endpoint fails', async () => {
      setup({ logout: vi.fn(() => throwError(() => new Error('Network error'))) });

      await lastValueFrom(service.logout(), { defaultValue: undefined });

      expect(service.status()).toBe('unauthenticated');
      expect(service.currentUser()).toBeNull();
    });
  });

  describe('authorization computed signals', () => {
    beforeEach(async () => {
      setup();
      await lastValueFrom(service.checkSession(), { defaultValue: undefined });
    });

    it('hasRole() returns true for a role the user has', () => {
      expect(service.hasRole('admin')()).toBe(true);
    });

    it('hasRole() returns false for a role the user does not have', () => {
      expect(service.hasRole('superadmin')()).toBe(false);
    });

    it('hasPermission() returns true for a permission the user has', () => {
      expect(service.hasPermission('write')()).toBe(true);
    });

    it('hasPermission() returns false for a permission the user does not have', () => {
      expect(service.hasPermission('delete')()).toBe(false);
    });

    it('hasAnyRole() returns true when the user has at least one of the given roles', () => {
      expect(service.hasAnyRole(['superadmin', 'editor'])()).toBe(true);
    });

    it('hasAnyRole() returns false when the user has none of the given roles', () => {
      expect(service.hasAnyRole(['superadmin', 'owner'])()).toBe(false);
    });

    it('hasRole() returns false when there is no authenticated user', async () => {
      setupFailing();
      await lastValueFrom(service.checkSession(), { defaultValue: undefined });

      expect(service.hasRole('admin')()).toBe(false);
    });
  });

  describe('proactive token refresh timer', () => {
    afterEach(() => vi.useRealTimers());

    it('refreshes the token after the expected delay when session is established with sufficient token lifetime', async () => {
      vi.useFakeTimers();
      const mockProvider = createMockAuthProvider();
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [RouterTestingModule],
        providers: [
          AuthService,
          { provide: AUTH_PROVIDER, useValue: mockProvider },
          { provide: AuditService, useValue: mockAuditService },
        ],
      });
      service = TestBed.inject(AuthService);

      await lastValueFrom(service.checkSession(), { defaultValue: undefined });
      expect(service.isAuthenticated()).toBe(true);

      const refreshSpy = vi.spyOn(mockProvider, 'refreshAccessToken');
      refreshSpy.mockClear();

      vi.advanceTimersByTime(839_999);
      expect(refreshSpy).toHaveBeenCalledTimes(0);

      vi.advanceTimersByTime(2);
      expect(refreshSpy).toHaveBeenCalledTimes(1);
    });

    it('does not attempt a token refresh when session is established with a token expiring within the threshold', async () => {
      vi.useFakeTimers();
      const shortLivedTokenResponse = { ...MOCK_TOKEN_RESPONSE, expiresInSeconds: 30 };
      const mockProvider = createMockAuthProvider({
        refreshAccessToken: vi.fn(() => of(shortLivedTokenResponse)),
      });
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [RouterTestingModule],
        providers: [
          AuthService,
          { provide: AUTH_PROVIDER, useValue: mockProvider },
          { provide: AuditService, useValue: mockAuditService },
        ],
      });
      service = TestBed.inject(AuthService);

      await lastValueFrom(service.checkSession(), { defaultValue: undefined });
      expect(service.isAuthenticated()).toBe(true);

      const refreshSpy = vi.spyOn(mockProvider, 'refreshAccessToken');
      refreshSpy.mockClear();

      vi.advanceTimersByTime(120_000);
      expect(refreshSpy).toHaveBeenCalledTimes(0);
    });
  });

});
