import { inject, Injectable, InjectionToken } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AUTH_DEFAULTS,
  AuthSession,
  AuthUser,
  IAuthProvider,
  LoginCredentials,
  PasswordResetConfirm,
  PasswordResetRequest,
  RegisterCredentials,
  TokenResponse,
} from '@core/auth/models';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

@Injectable({ providedIn: 'root' })
export class JwtAuthProvider implements IAuthProvider {
  private readonly http = inject(HttpClient);
  private readonly apiBase = inject(API_BASE_URL);

  login(credentials: LoginCredentials): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.apiBase}/auth/login`, credentials, { withCredentials: true });
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiBase}/auth/logout`, {}, { withCredentials: true });
  }

  refreshAccessToken(): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.apiBase}/auth/refresh`, {}, { withCredentials: true });
  }

  getUser(accessToken: string): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.apiBase}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }

  isTokenExpired(session: AuthSession): boolean {
    return Date.now() >= session.accessTokenExpiresAt - AUTH_DEFAULTS.tokenRefreshThresholdMs;
  }

  register(credentials: RegisterCredentials): Observable<void> {
    return this.http.post<void>(`${this.apiBase}/auth/register`, credentials);
  }

  requestPasswordReset(request: PasswordResetRequest): Observable<void> {
    return this.http.post<void>(`${this.apiBase}/auth/password-reset/request`, request);
  }

  confirmPasswordReset(confirm: PasswordResetConfirm): Observable<void> {
    return this.http.post<void>(`${this.apiBase}/auth/password-reset/confirm`, confirm);
  }
}
