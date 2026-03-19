import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { signal } from '@angular/core';
import { lastValueFrom, of } from 'rxjs';
import { describe, it, expect } from 'vitest';

import { authGuard, permissionGuard, roleGuard } from './auth.guard';
import { AuthService } from '@auth/services/auth.service';
import { AUTH_PROVIDER } from '@auth/providers/auth-provider.token';
import { AUTH_DEFAULTS, AuthStatus, AuthUser } from '@auth/models/auth.model';
import { createMockAuthProvider, MOCK_USER } from '@auth/testing/auth-test.helpers';

function mockRoute(data: Record<string, unknown> = {}): ActivatedRouteSnapshot {
  return { data } as unknown as ActivatedRouteSnapshot;
}

function mockRouterState(url = '/dashboard'): RouterStateSnapshot {
  return { url } as RouterStateSnapshot;
}

function createMockAuthService(status: AuthStatus, user: AuthUser | null = null) {
  const statusSignal = signal<AuthStatus>(status);
  const userSignal   = signal<AuthUser | null>(user);
  return {
    status:      statusSignal.asReadonly(),
    currentUser: userSignal.asReadonly(),
  };
}

function runRoleGuard(
  authServiceMock: ReturnType<typeof createMockAuthService>,
  routeData: Record<string, unknown>,
) {
  return TestBed.runInInjectionContext(() =>
    roleGuard(mockRoute(routeData), mockRouterState()),
  );
}

describe('authGuard', () => {
  function setup(status: AuthStatus, user: AuthUser | null = null) {
    const mockAuthService = createMockAuthService(status, user);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: AuthService,   useValue: mockAuthService },
        { provide: AUTH_PROVIDER, useValue: createMockAuthProvider() },
      ],
    });
    return mockAuthService;
  }

  it('returns true when the user is authenticated', async () => {
    setup('authenticated', MOCK_USER);
    const guardResult = TestBed.runInInjectionContext(() =>
      authGuard(mockRoute(), mockRouterState('/dashboard')),
    );
    const resolved = await lastValueFrom(guardResult as ReturnType<typeof of>);
    expect(resolved).toBe(true);
  });

  it('redirects to login with returnUrl when the user is not authenticated', async () => {
    setup('unauthenticated');
    const guardResult = TestBed.runInInjectionContext(() =>
      authGuard(mockRoute(), mockRouterState('/dashboard')),
    );
    const resolved = await lastValueFrom(guardResult as ReturnType<typeof of>);

    expect(resolved).toBeInstanceOf(UrlTree);
    const urlTree = resolved as UrlTree;
    expect(urlTree.toString()).toContain(AUTH_DEFAULTS.loginRoute);
    expect(urlTree.queryParams['returnUrl']).toBe('/dashboard');
  });

  it('waits when status is "checking" and resolves when status changes', async () => {
    const statusSignal = signal<AuthStatus>('checking');
    const mockAuthService = {
      status:      statusSignal.asReadonly(),
      currentUser: signal<AuthUser | null>(MOCK_USER).asReadonly(),
    };

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: AuthService,   useValue: mockAuthService },
        { provide: AUTH_PROVIDER, useValue: createMockAuthProvider() },
      ],
    });

    const guardResult = TestBed.runInInjectionContext(() =>
      authGuard(mockRoute(), mockRouterState('/dashboard')),
    );

    setTimeout(() => statusSignal.set('authenticated'), 0);

    const resolved = await lastValueFrom(guardResult as ReturnType<typeof of>);
    expect(resolved).toBe(true);
  });
});

describe('roleGuard', () => {
  function setup(user: AuthUser | null) {
    const mockAuthService = createMockAuthService(
      user ? 'authenticated' : 'unauthenticated',
      user,
    );

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: AuthService,   useValue: mockAuthService },
        { provide: AUTH_PROVIDER, useValue: createMockAuthProvider() },
      ],
    });
  }

  it('returns true when the user has at least one of the required roles (OR logic)', () => {
    setup(MOCK_USER);
    const result = runRoleGuard(
      createMockAuthService('authenticated', MOCK_USER),
      { roles: ['admin', 'superadmin'], requireAll: false },
    );
    expect(result).toBe(true);
  });

  it('redirects to 403 when the user has none of the required roles', () => {
    setup(MOCK_USER);
    const result = runRoleGuard(
      createMockAuthService('authenticated', MOCK_USER),
      { roles: ['superadmin', 'owner'], requireAll: false },
    );
    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toContain(AUTH_DEFAULTS.unauthorizedRoute);
  });

  it('returns true when the user has all required roles (AND logic)', () => {
    setup(MOCK_USER);
    const result = runRoleGuard(
      createMockAuthService('authenticated', MOCK_USER),
      { roles: ['admin', 'editor'], requireAll: true },
    );
    expect(result).toBe(true);
  });

  it('redirects to 403 when the user is missing a required role with requireAll: true', () => {
    setup(MOCK_USER);
    const result = runRoleGuard(
      createMockAuthService('authenticated', MOCK_USER),
      { roles: ['admin', 'superadmin'], requireAll: true },
    );
    expect(result).toBeInstanceOf(UrlTree);
  });

  it('returns true when no roles are required', () => {
    setup(MOCK_USER);
    const result = runRoleGuard(
      createMockAuthService('authenticated', MOCK_USER),
      { roles: [] },
    );
    expect(result).toBe(true);
  });

  it('returns true when there is no authenticated user, delegating to authGuard', () => {
    setup(null);
    const result = runRoleGuard(
      createMockAuthService('unauthenticated', null),
      { roles: ['admin'] },
    );
    expect(result).toBe(true);
  });
});

function runPermissionGuard(
  authServiceMock: ReturnType<typeof createMockAuthService>,
  routeData: Record<string, unknown>,
) {
  return TestBed.runInInjectionContext(() =>
    permissionGuard(mockRoute(routeData), mockRouterState()),
  );
}

describe('permissionGuard', () => {
  function setup(user: AuthUser | null) {
    const mockAuthService = createMockAuthService(
      user ? 'authenticated' : 'unauthenticated',
      user,
    );

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: AuthService,   useValue: mockAuthService },
        { provide: AUTH_PROVIDER, useValue: createMockAuthProvider() },
      ],
    });
  }

  it('returns true when the user has at least one of the required permissions (OR logic)', () => {
    setup(MOCK_USER);
    const result = runPermissionGuard(
      createMockAuthService('authenticated', MOCK_USER),
      { permissions: ['read', 'delete'], requireAllPermissions: false },
    );
    expect(result).toBe(true);
  });

  it('redirects to 403 when the user has none of the required permissions', () => {
    setup(MOCK_USER);
    const result = runPermissionGuard(
      createMockAuthService('authenticated', MOCK_USER),
      { permissions: ['delete', 'admin'], requireAllPermissions: false },
    );
    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toContain(AUTH_DEFAULTS.unauthorizedRoute);
  });

  it('returns true when the user has all required permissions (AND logic)', () => {
    setup(MOCK_USER);
    const result = runPermissionGuard(
      createMockAuthService('authenticated', MOCK_USER),
      { permissions: ['read', 'write'], requireAllPermissions: true },
    );
    expect(result).toBe(true);
  });

  it('redirects to 403 when the user is missing a required permission with requireAllPermissions: true', () => {
    setup(MOCK_USER);
    const result = runPermissionGuard(
      createMockAuthService('authenticated', MOCK_USER),
      { permissions: ['read', 'delete'], requireAllPermissions: true },
    );
    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toContain(AUTH_DEFAULTS.unauthorizedRoute);
  });

  it('returns true when no permissions are required', () => {
    setup(MOCK_USER);
    const result = runPermissionGuard(
      createMockAuthService('authenticated', MOCK_USER),
      { permissions: [] },
    );
    expect(result).toBe(true);
  });

  it('returns true when there is no authenticated user, delegating to authGuard', () => {
    setup(null);
    const result = runPermissionGuard(
      createMockAuthService('unauthenticated', null),
      { permissions: ['read'] },
    );
    expect(result).toBe(true);
  });
});



