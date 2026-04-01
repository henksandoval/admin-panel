import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { AuthUser, IAuthProvider, TokenResponse } from '@core/auth/models';

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
        login: vi.fn(() => of(MOCK_TOKEN_RESPONSE)),
        logout: vi.fn(() => of(undefined as unknown as void)),
        refreshAccessToken: vi.fn(() => of(MOCK_TOKEN_RESPONSE)),
        getUser: vi.fn(() => of(MOCK_USER)),
        isTokenExpired: vi.fn(() => false),
        register: vi.fn(() => of(undefined as unknown as void)),
        requestPasswordReset: vi.fn(() => of(undefined as unknown as void)),
        confirmPasswordReset: vi.fn(() => of(undefined as unknown as void)),
        ...overrides,
    };
}

export function createFailingAuthProvider(): IAuthProvider {
    return {
        login: vi.fn(() => throwError(() => new Error('Invalid credentials'))),
        logout: vi.fn(() => throwError(() => new Error('Logout failed'))),
        refreshAccessToken: vi.fn(() => throwError(() => new Error('No refresh token'))),
        getUser: vi.fn(() => throwError(() => new Error('Unauthorized'))),
        isTokenExpired: vi.fn(() => true),
        register: vi.fn(() => throwError(() => new Error('Registration failed'))),
        requestPasswordReset: vi.fn(() => throwError(() => new Error('Reset request failed'))),
        confirmPasswordReset: vi.fn(() => throwError(() => new Error('Reset confirm failed'))),
    };
}
