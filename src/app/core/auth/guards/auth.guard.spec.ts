import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { signal } from '@angular/core';
import { lastValueFrom, of } from 'rxjs';
import { describe, it, expect } from 'vitest';

import { authGuard, roleGuard } from './auth.guard';
import { AuthService } from '@auth/services/auth.service';
import { AUTH_PROVIDER } from '@auth/providers/auth-provider.token';
import { AUTH_DEFAULTS, AuthStatus, AuthUser } from '@auth/models/auth.model';
import { createMockAuthProvider, MOCK_USER } from '@auth/testing/auth-test.helpers';

// ── Factory de mocks de ruta ──────────────────────────────────────────────────
function mockRoute(data: Record<string, unknown> = {}): ActivatedRouteSnapshot {
  return { data } as unknown as ActivatedRouteSnapshot;
}

function mockRouterState(url = '/dashboard'): RouterStateSnapshot {
  return { url } as RouterStateSnapshot;
}

// ── Mock de AuthService ───────────────────────────────────────────────────────
function createMockAuthService(status: AuthStatus, user: AuthUser | null = null) {
  const statusSignal = signal<AuthStatus>(status);
  const userSignal   = signal<AuthUser | null>(user);
  return {
    status:      statusSignal.asReadonly(),
    currentUser: userSignal.asReadonly(),
  };
}

// ── Helper para ejecutar un guard funcional en TestBed ────────────────────────
function runAuthGuard(authServiceMock: ReturnType<typeof createMockAuthService>, url = '/dashboard') {
  return TestBed.runInInjectionContext(() =>
    authGuard(mockRoute(), mockRouterState(url)),
  );
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
  let router: Router;

  function setup(status: AuthStatus, user: AuthUser | null = null) {
    const mockAuthService = createMockAuthService(status, user);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: AuthService,   useValue: mockAuthService },
        { provide: AUTH_PROVIDER, useValue: createMockAuthProvider() },
      ],
    });
    router = TestBed.inject(Router);
    return mockAuthService;
  }

  it('debe retornar true cuando el usuario está autenticado', async () => {
    setup('authenticated', MOCK_USER);
    const guardResult = TestBed.runInInjectionContext(() =>
      authGuard(mockRoute(), mockRouterState('/dashboard')),
    );
    const resolved = await lastValueFrom(guardResult as ReturnType<typeof of>);
    expect(resolved).toBe(true);
  });

  it('debe redirigir a login con returnUrl cuando el usuario NO está autenticado', async () => {
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

  it('debe esperar si el status es "checking" y resolver cuando cambia', async () => {
    // Empezamos con checking, luego cambiamos a authenticated
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

    // El guard está esperando, resolvemos cambiando el status
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

  it('debe retornar true si el usuario tiene el rol requerido (OR lógico)', () => {
    setup(MOCK_USER); // MOCK_USER tiene roles: ['admin', 'editor']
    const result = runRoleGuard(
      createMockAuthService('authenticated', MOCK_USER),
      { roles: ['admin', 'superadmin'], requireAll: false },
    );
    expect(result).toBe(true);
  });

  it('debe redirigir a 403 si el usuario NO tiene ningún rol requerido', () => {
    setup(MOCK_USER);
    const result = runRoleGuard(
      createMockAuthService('authenticated', MOCK_USER),
      { roles: ['superadmin', 'owner'], requireAll: false },
    );
    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toContain(AUTH_DEFAULTS.unauthorizedRoute);
  });

  it('debe retornar true si el usuario tiene TODOS los roles (AND lógico)', () => {
    setup(MOCK_USER);
    const result = runRoleGuard(
      createMockAuthService('authenticated', MOCK_USER),
      { roles: ['admin', 'editor'], requireAll: true },
    );
    expect(result).toBe(true);
  });

  it('debe redirigir a 403 si falta algún rol con requireAll: true', () => {
    setup(MOCK_USER);
    const result = runRoleGuard(
      createMockAuthService('authenticated', MOCK_USER),
      { roles: ['admin', 'superadmin'], requireAll: true },
    );
    expect(result).toBeInstanceOf(UrlTree);
  });

  it('debe retornar true si no hay roles requeridos', () => {
    setup(MOCK_USER);
    const result = runRoleGuard(
      createMockAuthService('authenticated', MOCK_USER),
      { roles: [] },
    );
    expect(result).toBe(true);
  });

  it('debe retornar true si no hay usuario (la autenticación la gestiona authGuard)', () => {
    setup(null);
    const result = runRoleGuard(
      createMockAuthService('unauthenticated', null),
      { roles: ['admin'] },
    );
    expect(result).toBe(true);
  });
});



