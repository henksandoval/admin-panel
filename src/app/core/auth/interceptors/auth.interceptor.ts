import { inject } from '@angular/core';
import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '@auth/services/auth.service';
import { AUTH_PROVIDER, AUTH_PUBLIC_URLS } from '@auth/providers/auth-provider.token';
import { IAuthProvider, TokenResponse } from '@auth/models/auth.model';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const authProvider = inject(AUTH_PROVIDER);
  const publicUrls = inject(AUTH_PUBLIC_URLS);

  const isPublic = publicUrls.some((url) => req.url.includes(url));
  if (isPublic) return next(req);

  const token = authService.accessToken();
  const authReq = token ? addTokenHeader(req, token) : req;

  return next(authReq).pipe(
    catchError((error: any) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return handle401(req, next, authService, authProvider);
      }
      return throwError(() => error);
    }),
  );
};

function addTokenHeader(
  req: HttpRequest<unknown>,
  token: string,
): HttpRequest<unknown> {
  return req.clone({
    headers: req.headers.set('Authorization', `Bearer ${token}`),
  });
}

function handle401(
  req: HttpRequest<unknown>,
  next: Parameters<HttpInterceptorFn>[1],
  authService: AuthService,
  authProvider: IAuthProvider,
) {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authProvider.refreshAccessToken().pipe(
      switchMap((tokenResponse: TokenResponse) => {
        isRefreshing = false;
        refreshTokenSubject.next(tokenResponse.accessToken);
        return next(addTokenHeader(req, tokenResponse.accessToken));
      }),
      catchError((error: any) => {
        isRefreshing = false;
        // Logout silencioso: limpia estado y redirige a login
        authService.logout().subscribe();
        return throwError(() => error);
      }),
    );
  }

  return refreshTokenSubject.pipe(
    filter((token): token is string => token !== null),
    take(1),
    switchMap((token) => next(addTokenHeader(req, token))),
  );
}
