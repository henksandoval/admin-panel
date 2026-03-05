import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import {
  AuthSession,
  AuthUser,
  IAuthProvider,
  LoginCredentials,
  TokenResponse,
} from '@auth/models/auth.model';

@Injectable({ providedIn: 'root' })
export class MockAuthProvider implements IAuthProvider {
  private readonly MOCK_USER: AuthUser = {
    id: 'mock-user-1',
    email: 'dev@example.com',
    displayName: 'Dev User',
    roles: ['admin'],
    permissions: ['read', 'write'],
  };

  private readonly MOCK_TOKEN: TokenResponse = {
    accessToken: 'mock-dev-token',
    expiresInSeconds: 3600,
    tokenType: 'Bearer',
  };

  login(credentials: LoginCredentials): Observable<TokenResponse> {
    if (credentials.email.includes('fail')) {
      return throwError(() => new Error('Credenciales incorrectas (mock).'));
    }
    return of(this.MOCK_TOKEN);
  }

  logout(): Observable<void> {
    return of(undefined as unknown as void);
  }

  refreshAccessToken(): Observable<TokenResponse> {
    return throwError(() => new Error('[MockAuthProvider] Sin sesión previa.'));
  }

  getUser(_accessToken: string): Observable<AuthUser> {
    return of(this.MOCK_USER);
  }

  isTokenExpired(_session: AuthSession): boolean {
    return false;
  }
}

