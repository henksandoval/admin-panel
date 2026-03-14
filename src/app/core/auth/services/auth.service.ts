import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, EMPTY, Observable, of, switchMap, tap } from 'rxjs';
import { AUTH_PROVIDER } from '@auth/providers/auth-provider.token';
import {
  AUTH_DEFAULTS,
  AuthStatus,
  AuthUser,
  LoginCredentials,
  PasswordResetConfirm,
  PasswordResetRequest,
  RegisterCredentials,
  TokenResponse,
} from '@auth/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly provider = inject(AUTH_PROVIDER);
  private readonly router = inject(Router);

  private readonly _status = signal<AuthStatus>('checking');
  private readonly _currentUser = signal<AuthUser | null>(null);
  private readonly _accessToken = signal<string | null>(null);
  private _refreshTimer: ReturnType<typeof setTimeout> | null = null;

  readonly status: Signal<AuthStatus> = this._status.asReadonly();
  readonly currentUser: Signal<AuthUser | null> = this._currentUser.asReadonly();
  readonly accessToken: Signal<string | null> = this._accessToken.asReadonly();
  readonly isAuthenticated: Signal<boolean> = computed(
    () => this._status() === 'authenticated',
  );

  hasRole(role: string): Signal<boolean> {
    return computed(() => this._currentUser()?.roles.includes(role) ?? false);
  }

  hasPermission(permission: string): Signal<boolean> {
    return computed(
      () => this._currentUser()?.permissions.includes(permission) ?? false,
    );
  }

  hasAnyRole(roles: string[]): Signal<boolean> {
    return computed(
      () => roles.some((role) => this._currentUser()?.roles.includes(role) ?? false),
    );
  }


  checkSession(): Observable<void> {
    return this.provider.refreshAccessToken().pipe(
      switchMap((tokenResponse) => this.setSession(tokenResponse)),
      catchError(() => {
        this.clearSession(null);
        return EMPTY;
      }),
    );
  }

  login(credentials: LoginCredentials, returnUrl?: string): Observable<void> {
    return this.provider.login(credentials).pipe(
      switchMap((tokenResponse) => this.setSession(tokenResponse)),
      switchMap(() => {
        void this.router.navigateByUrl(returnUrl ?? AUTH_DEFAULTS.redirectAfterLogin);
        return EMPTY;
      }),
    );
  }

  register(credentials: RegisterCredentials): Observable<void> {
    return this.provider.register(credentials);
  }

  requestPasswordReset(request: PasswordResetRequest): Observable<void> {
    return this.provider.requestPasswordReset(request);
  }

  confirmPasswordReset(confirm: PasswordResetConfirm): Observable<void> {
    return this.provider.confirmPasswordReset(confirm);
  }

  logout(redirectTo: string | null = AUTH_DEFAULTS.loginRoute): Observable<void> {
    return this.provider.logout().pipe(
      tap(() => this.clearSession(redirectTo)),
      catchError(() => {
        this.clearSession(redirectTo);
        return of(undefined as unknown as void);
      }),
    );
  }

  private setSession(tokenResponse: TokenResponse): Observable<void> {
    const { accessToken, expiresInSeconds } = tokenResponse;
    const expiresAt = Date.now() + expiresInSeconds * 1000;

    this._accessToken.set(accessToken);

    return this.provider.getUser(accessToken).pipe(
      tap((user) => {
        this._currentUser.set(user);
        this._status.set('authenticated');
        this.scheduleTokenRefresh(expiresAt);
      }),
      switchMap(() => of(undefined as unknown as void)),
    );
  }

  private clearSession(redirectTo: string | null = AUTH_DEFAULTS.loginRoute): void {
    this.clearRefreshTimer();
    this._accessToken.set(null);
    this._currentUser.set(null);
    this._status.set('unauthenticated');
    if (redirectTo) {
      void this.router.navigateByUrl(redirectTo);
    }
  }

  private scheduleTokenRefresh(expiresAt: number): void {
    this.clearRefreshTimer();
    const delay =
      expiresAt - Date.now() - AUTH_DEFAULTS.tokenRefreshThresholdMs;
    if (delay <= 0) return;

    this._refreshTimer = setTimeout(() => {
      this.provider
        .refreshAccessToken()
        .pipe(
          switchMap((tr) => this.setSession(tr)),
          catchError(() => {
            this.clearSession();
            return EMPTY;
          }),
        )
        .subscribe();
    }, delay);
  }

  private clearRefreshTimer(): void {
    if (this._refreshTimer !== null) {
      clearTimeout(this._refreshTimer);
      this._refreshTimer = null;
    }
  }
}
