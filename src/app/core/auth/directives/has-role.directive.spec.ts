import { Component, signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { beforeEach, describe, expect, it } from 'vitest';

import { HasRoleDirective } from './has-role.directive';
import { AuthService } from '@core/auth/services';
import { AUTH_PROVIDER } from '@core/auth/providers';
import { AuthUser } from '@auth/models/auth.model';
import { createMockAuthProvider, MOCK_USER } from '@auth/testing';

function createMockAuthService(user: AuthUser | null) {
  const userSignal = signal<AuthUser | null>(user);
  return {
    currentUser: userSignal.asReadonly(),
    hasPermission: (permission: string) =>
      signal(userSignal()?.permissions.includes(permission) ?? false).asReadonly(),
    hasRole: (role: string) =>
      signal(userSignal()?.roles.includes(role) ?? false).asReadonly(),
    hasAnyRole: (roles: string[]) =>
      signal(roles.some((r) => userSignal()?.roles.includes(r) ?? false)).asReadonly(),
  };
}

@Component({
  template: `
    <span *appHasRole="'admin'" data-testid="admin-element">admin-only</span>
    <span *appHasRole="'superadmin'" data-testid="superadmin-element">superadmin-only</span>
    <span *appHasRole="['admin', 'superadmin']" data-testid="any-role-element">any-role</span>
    <span *appHasRole="['admin', 'editor']; requireAll: true" data-testid="all-roles-element">all-roles</span>
    <span *appHasRole="['admin', 'superadmin']; requireAll: true" data-testid="mixed-all-roles-element">mixed-all</span>
  `,
  imports: [HasRoleDirective],
  standalone: true,
})
class TestHostComponent {}

describe('HasRoleDirective', () => {
  const defaultProviders = [
    { provide: AUTH_PROVIDER, useValue: createMockAuthProvider() },
  ];

  describe('when the user has roles [admin, editor]', () => {
    beforeEach(async () => {
      await render(TestHostComponent, {
        providers: [
          ...defaultProviders,
          { provide: AuthService, useValue: createMockAuthService(MOCK_USER) },
        ],
      });
    });

    it('renders elements when the user has the required role', () => {
      expect(screen.queryByTestId('admin-element')).not.toBeNull();
    });

    it('does not render elements when the user lacks the required role', () => {
      expect(screen.queryByTestId('superadmin-element')).toBeNull();
    });

    it('renders elements when the user has at least one of the required roles (OR logic)', () => {
      expect(screen.queryByTestId('any-role-element')).not.toBeNull();
    });

    it('renders elements when the user has all required roles (AND logic)', () => {
      expect(screen.queryByTestId('all-roles-element')).not.toBeNull();
    });

    it('does not render elements when the user is missing one role with requireAll', () => {
      expect(screen.queryByTestId('mixed-all-roles-element')).toBeNull();
    });
  });

  describe('when there is no authenticated user', () => {
    beforeEach(async () => {
      await render(TestHostComponent, {
        providers: [
          ...defaultProviders,
          { provide: AuthService, useValue: createMockAuthService(null) },
        ],
      });
    });

    it('does not render elements requiring roles', () => {
      expect(screen.queryByTestId('admin-element')).toBeNull();
      expect(screen.queryByTestId('superadmin-element')).toBeNull();
    });
  });
});
