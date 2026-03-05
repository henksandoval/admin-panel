import { of, throwError } from 'rxjs';
import { IAuthProvider, AuthUser, TokenResponse } from '@auth/models/auth.model';
import { vi } from 'vitest';

export const MOCK_USER: AuthUser = {
  id: 'user-1',
  email: 'test@example.com',
  displayName: 'Test User',
  roles: ['admin', 'editor'],
  permissions: ['read', 'write'],
};

export const MOCK_TOKEN_RESPONSE: TokenResponse = {
  accessToken: 'mock-access-token',
  expiresInSeconds: 900,  // 15 min
  tokenType: 'Bearer',
};

export function createMockAuthProvider(
  overrides: Partial<IAuthProvider> = {},
): IAuthProvider {
  return {
    login:               vi.fn(() => of(MOCK_TOKEN_RESPONSE)),
    logout:              vi.fn(() => of(undefined as unknown as void)),
    refreshAccessToken:  vi.fn(() => of(MOCK_TOKEN_RESPONSE)),
    getUser:             vi.fn(() => of(MOCK_USER)),
    isTokenExpired:      vi.fn(() => false),
    ...overrides,
  };
}

export function createFailingAuthProvider(): IAuthProvider {
  return {
    login:               vi.fn(() => throwError(() => new Error('Invalid credentials'))),
    logout:              vi.fn(() => throwError(() => new Error('Logout failed'))),
    refreshAccessToken:  vi.fn(() => throwError(() => new Error('No refresh token'))),
    getUser:             vi.fn(() => throwError(() => new Error('Unauthorized'))),
    isTokenExpired:      vi.fn(() => true),
  };
}

