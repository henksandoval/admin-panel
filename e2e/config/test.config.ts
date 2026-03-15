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

export interface RegisterTestCredentials {
  readonly displayName: string;
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

export interface ErrorPageRoutes {
  readonly notFound: string;
  readonly unauthorized: string;
  readonly serverError: string;
  readonly sessionExpired: string;
  readonly accessDenied: string;
  readonly systemDown: string;
}

export interface E2ETestConfig {
  readonly useMock: boolean;
  readonly apiBaseUrl: string;
  readonly credentials: LoginTestCredentials;
  readonly registerCredentials: RegisterTestCredentials;
  readonly expectedDefaultRedirect: string;
  readonly resetPasswordToken: string;
  readonly errorRoutes: ErrorPageRoutes;
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

  registerCredentials: {
    displayName: 'E2E Test User',
    email: 'newuser@example.com',
    password: 'RegisterPass1234',
  },

  expectedDefaultRedirect: '/dashboard',

  resetPasswordToken: 'e2e-valid-reset-token',

  errorRoutes: {
    notFound: '/errors/not-found',
    unauthorized: '/errors/unauthorized',
    serverError: '/errors/server-error',
    sessionExpired: '/critical-errors/session-expired',
    accessDenied: '/critical-errors/access-denied',
    systemDown: '/critical-errors/system-down',
  },

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
