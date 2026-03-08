/**
 * External configuration file that controls E2E test behaviour.
 *
 * useMock: true  → Playwright intercepts all HTTP calls to the auth API and
 *                  returns the payloads defined below.  No real backend is
 *                  needed.  Set this when running in CI or locally without a
 *                  live API.
 *
 * useMock: false → HTTP requests are forwarded to the real API defined in
 *                  apiBaseUrl.  Requires a running backend and valid
 *                  credentials in the testCredentials block.
 *
 * Changing this flag (or any value below) is the ONLY change needed to switch
 * between both execution modes.  The test file and fixtures must never be
 * edited for this purpose.
 */

export interface LoginTestCredentials {
  readonly email: string;
  readonly password: string;
}

export interface MockTokenResponse {
  readonly accessToken: string;
  readonly expiresInSeconds: number;
  readonly tokenType: 'Bearer';
}

export interface MockUserResponse {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
  readonly roles: readonly string[];
  readonly permissions: readonly string[];
}

export interface E2ETestConfig {
  readonly useMock: boolean;
  readonly apiBaseUrl: string;
  readonly credentials: LoginTestCredentials;
  readonly expectedDefaultRedirect: string;
  readonly resetPasswordToken: string;
  readonly mockResponses: {
    readonly loginToken: MockTokenResponse;
    readonly user: MockUserResponse;
  };
}

export const testConfig: E2ETestConfig = {
  useMock: true,

  apiBaseUrl: 'http://localhost:3000',

  credentials: {
    email: 'dev@example.com',
    password: 'Password1234',
  },

  expectedDefaultRedirect: '/dashboard',

  resetPasswordToken: 'e2e-valid-reset-token',

  mockResponses: {
    loginToken: {
      accessToken: 'e2e-mock-access-token',
      expiresInSeconds: 3600,
      tokenType: 'Bearer',
    },
    user: {
      id: 'e2e-user-1',
      email: 'dev@example.com',
      displayName: 'E2E Test User',
      roles: ['admin'],
      permissions: ['read', 'write'],
    },
  },
};
