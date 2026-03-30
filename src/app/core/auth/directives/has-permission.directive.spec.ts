import { Component, signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { describe, it, expect, beforeEach } from 'vitest';

import { HasPermissionDirective } from './has-permission.directive';
import { AuthService } from '@core/auth/services';
import { AUTH_PROVIDER } from '@core/auth/providers';
import { AuthUser } from '@auth/models/auth.model';
import { createMockAuthProvider, MOCK_USER } from '@test-helpers/auth';

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
    <span *appHasPermission="'write'" data-testid="write-element">write-only</span>
    <span *appHasPermission="'delete'" data-testid="delete-element">delete-only</span>
    <span *appHasPermission="['read', 'write']" data-testid="any-element">any-permission</span>
    <span *appHasPermission="['read', 'write']; requireAll: true" data-testid="all-element">all-permissions</span>
    <span *appHasPermission="['read', 'delete']; requireAll: true" data-testid="mixed-all-element">mixed-all</span>
  `,
  imports: [HasPermissionDirective],
  standalone: true,
})
class TestHostComponent {}

describe('HasPermissionDirective', () => {
  const defaultProviders = [
    { provide: AUTH_PROVIDER, useValue: createMockAuthProvider() },
  ];

  describe('when the user has permissions [read, write]', () => {
    beforeEach(async () => {
      await render(TestHostComponent, {
        providers: [
          ...defaultProviders,
          { provide: AuthService, useValue: createMockAuthService(MOCK_USER) },
        ],
      });
    });

    it('renders elements when the user has the required permission', () => {
      expect(screen.queryByTestId('write-element')).not.toBeNull();
    });

    it('does not render elements when the user lacks the required permission', () => {
      expect(screen.queryByTestId('delete-element')).toBeNull();
    });

    it('renders elements when the user has at least one of the required permissions (OR logic)', () => {
      expect(screen.queryByTestId('any-element')).not.toBeNull();
    });

    it('renders elements when the user has all required permissions (AND logic)', () => {
      expect(screen.queryByTestId('all-element')).not.toBeNull();
    });

    it('does not render elements when the user is missing one permission with requireAll', () => {
      expect(screen.queryByTestId('mixed-all-element')).toBeNull();
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

    it('does not render elements requiring permissions', () => {
      expect(screen.queryByTestId('write-element')).toBeNull();
      expect(screen.queryByTestId('delete-element')).toBeNull();
    });
  });
});
