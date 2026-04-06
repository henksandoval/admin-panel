import { signal } from '@angular/core';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { AuthStatus, AuthUser } from '@core/auth/models';
import { MOCK_USER } from '@auth/testing';

/**
 * Stub for AuthService.
 *
 * Used by component tests that depend on AuthService (e.g.
 * IdleWarningDialogComponent, LayoutComponent).  The default user is the
 * shared MOCK_USER fixture so role/permission assertions in directive tests
 * are consistent.
 *
 * Override any property at call-site via the `overrides` argument:
 *   createAuthServiceStub({ status: signal<AuthStatus>('unauthenticated') })
 */
export function createAuthServiceStub(overrides: Partial<ReturnType<typeof _build>> = {}) {
  return { ..._build(), ...overrides };
}

function _build() {
  return {
    status:          signal<AuthStatus>('authenticated').asReadonly(),
    isAuthenticated: signal(true).asReadonly(),
    currentUser:     signal<AuthUser | null>(MOCK_USER).asReadonly(),
    accessToken:     signal<string | null>('mock-access-token').asReadonly(),

    login:                 vi.fn(() => of(undefined as unknown as void)),
    logout:                vi.fn(() => of(undefined as unknown as void)),
    checkSession:          vi.fn(() => of(undefined as unknown as void)),
    register:              vi.fn(() => of(undefined as unknown as void)),
    requestPasswordReset:  vi.fn(() => of(undefined as unknown as void)),
    confirmPasswordReset:  vi.fn(() => of(undefined as unknown as void)),

    hasRole:       vi.fn(() => signal(false).asReadonly()),
    hasPermission: vi.fn(() => signal(false).asReadonly()),
    hasAnyRole:    vi.fn(() => signal(false).asReadonly()),
  };
}

export type AuthServiceStub = ReturnType<typeof createAuthServiceStub>;
