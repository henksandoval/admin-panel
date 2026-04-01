import { inject, Injectable, InjectionToken } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import {
  AuthSession,
  AuthUser,
  IAuthProvider,
  LoginCredentials,
  PasswordResetConfirm,
  PasswordResetRequest,
  RegisterCredentials,
  TokenResponse,
} from '@core/auth/models';

@Injectable({ providedIn: 'root' })
export class NullAuthProvider implements IAuthProvider {
  login(_credentials: LoginCredentials): Observable<TokenResponse> {
    return throwError(() => new Error(this.errorMsg('login')));
  }

  logout(): Observable<void> {
    return throwError(() => new Error(this.errorMsg('logout')));
  }

  refreshAccessToken(): Observable<TokenResponse> {
    return throwError(() => new Error(this.errorMsg('refreshAccessToken')));
  }

  getUser(_accessToken: string): Observable<AuthUser> {
    return throwError(() => new Error(this.errorMsg('getUser')));
  }

  isTokenExpired(_session: AuthSession): boolean {
    return true;
  }

  register(_credentials: RegisterCredentials): Observable<void> {
    return throwError(() => new Error(this.errorMsg('register')));
  }

  requestPasswordReset(_request: PasswordResetRequest): Observable<void> {
    return throwError(() => new Error(this.errorMsg('requestPasswordReset')));
  }

  confirmPasswordReset(_confirm: PasswordResetConfirm): Observable<void> {
    return throwError(() => new Error(this.errorMsg('confirmPasswordReset')));
  }

  private readonly errorMsg = (method: string): string =>
    `[AUTH] NullAuthProvider.${method}() invocado. ` +
    `Registra un proveedor real en app.config.ts via: ` +
    `{ provide: AUTH_PROVIDER, useClass: JwtAuthProvider }`;
}

export const AUTH_PROVIDER = new InjectionToken<IAuthProvider>('AUTH_PROVIDER', {
  factory: () => inject(NullAuthProvider),
});

export const AUTH_PUBLIC_URLS = new InjectionToken<string[]>('AUTH_PUBLIC_URLS', {
  factory: () => [],
});
