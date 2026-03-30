import { TestBed } from '@angular/core/testing';
import {
  provideHttpClient,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { JwtAuthProvider } from '@auth/providers';
import { API_BASE_URL } from '@core/network';
import { AUTH_DEFAULTS, AuthSession, LoginCredentials } from '@auth/models/auth.model';
import { MOCK_USER, MOCK_TOKEN_RESPONSE } from '@test-helpers/auth';

const API_BASE = 'https://api.example.com';

describe('JwtAuthProvider', () => {
  let provider: JwtAuthProvider;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        JwtAuthProvider,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: API_BASE },
      ],
    });
    provider = TestBed.inject(JwtAuthProvider);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    if (httpMock) {
      httpMock.verify();
    }
  });

  describe('login()', () => {
    const credentials: LoginCredentials = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('sends a POST request to /auth/login with the provided credentials', () => {
      provider.login(credentials).subscribe();

      const req = httpMock.expectOne(`${API_BASE}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      req.flush(MOCK_TOKEN_RESPONSE);
    });

    it('sends the request with withCredentials: true', () => {
      provider.login(credentials).subscribe();

      const req = httpMock.expectOne(`${API_BASE}/auth/login`);
      expect(req.request.withCredentials).toBe(true);
      req.flush(MOCK_TOKEN_RESPONSE);
    });

    it('returns the TokenResponse from the server', () => {
      let result = null;
      provider.login(credentials).subscribe((r) => (result = r));

      httpMock.expectOne(`${API_BASE}/auth/login`).flush(MOCK_TOKEN_RESPONSE);
      expect(result).toEqual(MOCK_TOKEN_RESPONSE);
    });
  });

  describe('logout()', () => {
    it('sends a POST request to /auth/logout', () => {
      provider.logout().subscribe();

      const req = httpMock.expectOne(`${API_BASE}/auth/logout`);
      expect(req.request.method).toBe('POST');
      req.flush({});
    });

    it('sends the request with withCredentials: true', () => {
      provider.logout().subscribe();

      const req = httpMock.expectOne(`${API_BASE}/auth/logout`);
      expect(req.request.withCredentials).toBe(true);
      req.flush({});
    });
  });

  describe('refreshAccessToken()', () => {
    it('sends a POST request to /auth/refresh', () => {
      provider.refreshAccessToken().subscribe();

      const req = httpMock.expectOne(`${API_BASE}/auth/refresh`);
      expect(req.request.method).toBe('POST');
      req.flush(MOCK_TOKEN_RESPONSE);
    });

    it('sends the request with withCredentials: true so the browser sends the httpOnly cookie', () => {
      provider.refreshAccessToken().subscribe();

      const req = httpMock.expectOne(`${API_BASE}/auth/refresh`);
      expect(req.request.withCredentials).toBe(true);
      req.flush(MOCK_TOKEN_RESPONSE);
    });
  });

  describe('getUser()', () => {
    it('sends a GET request to /auth/me with the Authorization header', () => {
      provider.getUser('my-token').subscribe();

      const req = httpMock.expectOne(`${API_BASE}/auth/me`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe('Bearer my-token');
      req.flush(MOCK_USER);
    });

    it('returns the AuthUser from the server', () => {
      let result = null;
      provider.getUser('my-token').subscribe((u) => (result = u));

      httpMock.expectOne(`${API_BASE}/auth/me`).flush(MOCK_USER);
      expect(result).toEqual(MOCK_USER);
    });
  });

  describe('isTokenExpired()', () => {
    it('returns false when the token has sufficient lifetime', () => {
      const session: AuthSession = {
        user: MOCK_USER,
        accessToken: 'token',
        accessTokenExpiresAt: Date.now() + 120_000,
      };
      expect(provider.isTokenExpired(session)).toBe(false);
    });

    it('returns true when the token is within the refresh threshold', () => {
      const session: AuthSession = {
        user: MOCK_USER,
        accessToken: 'token',
        accessTokenExpiresAt: Date.now() + 30_000,
      };
      expect(provider.isTokenExpired(session)).toBe(true);
    });

    it('returns true when the token has already expired', () => {
      const session: AuthSession = {
        user: MOCK_USER,
        accessToken: 'token',
        accessTokenExpiresAt: Date.now() - 1_000,
      };
      expect(provider.isTokenExpired(session)).toBe(true);
    });

    it('uses AUTH_DEFAULTS.tokenRefreshThresholdMs as the expiry threshold', () => {
      const exactThreshold: AuthSession = {
        user: MOCK_USER,
        accessToken: 'token',
        accessTokenExpiresAt: Date.now() + AUTH_DEFAULTS.tokenRefreshThresholdMs,
      };
      expect(provider.isTokenExpired(exactThreshold)).toBe(true);
    });
  });
});
