import { Observable } from 'rxjs';
import { APP_PATHS } from '@core/models/app-routes.model';

export type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';

export interface AuthUser {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
  readonly roles: readonly string[];
  readonly permissions: readonly string[];
  readonly avatarUrl?: string;
  readonly metadata?: Record<string, unknown>;
}

export interface AuthSession {
  readonly user: AuthUser;
  readonly accessToken: string;
  readonly accessTokenExpiresAt: number;
}

export interface LoginCredentials {
  readonly email: string;
  readonly password: string;
}

export interface RegisterCredentials {
  readonly displayName: string;
  readonly email: string;
  readonly password: string;
}

export interface PasswordResetRequest {
  readonly email: string;
}

export interface PasswordResetConfirm {
  readonly token: string;
  readonly password: string;
}

export interface TokenResponse {
  readonly accessToken: string;
  readonly expiresInSeconds: number;
  readonly tokenType: 'Bearer';
}

export interface IAuthProvider {
  login(credentials: LoginCredentials): Observable<TokenResponse>;
  logout(): Observable<void>;
  refreshAccessToken(): Observable<TokenResponse>;
  getUser(accessToken: string): Observable<AuthUser>;
  isTokenExpired(session: AuthSession): boolean;
  register(credentials: RegisterCredentials): Observable<void>;
  requestPasswordReset(request: PasswordResetRequest): Observable<void>;
  confirmPasswordReset(confirm: PasswordResetConfirm): Observable<void>;
}

export const AUTH_DEFAULTS = {
  tokenRefreshThresholdMs: 60_000,
  idleTimeoutMs: 15 * 60_000,
  idleWarningMs: 2 * 60_000,
  idleWarningToastDurationMs: 10_000,
  redirectAfterLogin: '/',
  loginRoute: APP_PATHS.auth.login,
  unauthorizedRoute: APP_PATHS.errors.unauthorized,
  sessionExpiredRoute: APP_PATHS.criticalErrors.sessionExpired,
} as const;

