import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
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
export class MockAuthProvider implements IAuthProvider {
  private sessionActive = false;

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
    this.sessionActive = true;
    return of(this.MOCK_TOKEN);
  }

  logout(): Observable<void> {
    this.sessionActive = false;
    return of(undefined as unknown as void);
  }

  refreshAccessToken(): Observable<TokenResponse> {
    if (!this.sessionActive) {
      return throwError(() => new Error('[MockAuthProvider] Sin sesión previa.'));
    }
    return of(this.MOCK_TOKEN);
  }

  getUser(_accessToken: string): Observable<AuthUser> {
    return of(this.MOCK_USER);
  }

  isTokenExpired(_session: AuthSession): boolean {
    return false;
  }

  register(credentials: RegisterCredentials): Observable<void> {
    if (credentials.email.includes('fail')) {
      return throwError(() => new Error('This email address is already registered (mock).'));
    }
    return of(undefined as unknown as void);
  }

  requestPasswordReset(_request: PasswordResetRequest): Observable<void> {
    return of(undefined as unknown as void);
  }

  confirmPasswordReset(confirm: PasswordResetConfirm): Observable<void> {
    if (confirm.token.includes('error')) {
      return throwError(() => new Error('This reset link is invalid or has expired (mock).'));
    }
    return of(undefined as unknown as void);
  }
}
