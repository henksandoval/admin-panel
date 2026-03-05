import { inject, Injectable, InjectionToken } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import {
  AuthSession,
  AuthUser,
  IAuthProvider,
  LoginCredentials,
  TokenResponse,
} from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class NullAuthProvider implements IAuthProvider {
  private readonly errorMsg = (method: string): string =>
    `[AUTH] NullAuthProvider.${method}() invocado. ` +
    `Registra un proveedor real en app.config.ts via: ` +
    `{ provide: AUTH_PROVIDER, useClass: JwtAuthProvider }`;

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
}

export const AUTH_PROVIDER = new InjectionToken<IAuthProvider>('AUTH_PROVIDER', {
  factory: () => inject(NullAuthProvider),
});

export const AUTH_PUBLIC_URLS = new InjectionToken<string[]>('AUTH_PUBLIC_URLS', {
  factory: () => [],
});
