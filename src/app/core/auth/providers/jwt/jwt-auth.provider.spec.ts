import { TestBed } from '@angular/core/testing';
import {
  provideHttpClient,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { JwtAuthProvider, API_BASE_URL } from './jwt-auth.provider';
import { AUTH_DEFAULTS, AuthSession, LoginCredentials } from '@auth/models/auth.model';
import { MOCK_USER, MOCK_TOKEN_RESPONSE } from '@auth/testing/auth-test.helpers';

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

  afterEach(() => httpMock.verify());

  describe('login()', () => {
    const credentials: LoginCredentials = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('debe hacer POST a /auth/login con las credenciales', () => {
      provider.login(credentials).subscribe();

      const req = httpMock.expectOne(`${API_BASE}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      req.flush(MOCK_TOKEN_RESPONSE);
    });

    it('debe enviar withCredentials: true', () => {
      provider.login(credentials).subscribe();

      const req = httpMock.expectOne(`${API_BASE}/auth/login`);
      expect(req.request.withCredentials).toBe(true);
      req.flush(MOCK_TOKEN_RESPONSE);
    });

    it('debe retornar el TokenResponse del servidor', () => {
      let result = null;
      provider.login(credentials).subscribe((r) => (result = r));

      httpMock.expectOne(`${API_BASE}/auth/login`).flush(MOCK_TOKEN_RESPONSE);
      expect(result).toEqual(MOCK_TOKEN_RESPONSE);
    });
  });

  describe('logout()', () => {
    it('debe hacer POST a /auth/logout', () => {
      provider.logout().subscribe();

      const req = httpMock.expectOne(`${API_BASE}/auth/logout`);
      expect(req.request.method).toBe('POST');
      req.flush(null);
    });

    it('debe enviar withCredentials: true', () => {
      provider.logout().subscribe();

      const req = httpMock.expectOne(`${API_BASE}/auth/logout`);
      expect(req.request.withCredentials).toBe(true);
      req.flush(null);
    });
  });

  describe('refreshAccessToken()', () => {
    it('debe hacer POST a /auth/refresh', () => {
      provider.refreshAccessToken().subscribe();

      const req = httpMock.expectOne(`${API_BASE}/auth/refresh`);
      expect(req.request.method).toBe('POST');
      req.flush(MOCK_TOKEN_RESPONSE);
    });

    it('debe enviar withCredentials: true para que el browser envíe la httpOnly cookie', () => {
      provider.refreshAccessToken().subscribe();

      const req = httpMock.expectOne(`${API_BASE}/auth/refresh`);
      expect(req.request.withCredentials).toBe(true);
      req.flush(MOCK_TOKEN_RESPONSE);
    });
  });

  describe('getUser()', () => {
    it('debe hacer GET a /auth/me con el header Authorization', () => {
      provider.getUser('my-token').subscribe();

      const req = httpMock.expectOne(`${API_BASE}/auth/me`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe('Bearer my-token');
      req.flush(MOCK_USER);
    });

    it('debe retornar el AuthUser del servidor', () => {
      let result = null;
      provider.getUser('my-token').subscribe((u) => (result = u));

      httpMock.expectOne(`${API_BASE}/auth/me`).flush(MOCK_USER);
      expect(result).toEqual(MOCK_USER);
    });
  });

  describe('isTokenExpired()', () => {
    it('debe retornar false cuando el token tiene vida útil suficiente', () => {
      const session: AuthSession = {
        user: MOCK_USER,
        accessToken: 'token',
        accessTokenExpiresAt: Date.now() + 120_000, // expira en 2 min (> threshold 60s)
      };
      expect(provider.isTokenExpired(session)).toBe(false);
    });

    it('debe retornar true cuando el token está dentro del umbral de refresh', () => {
      const session: AuthSession = {
        user: MOCK_USER,
        accessToken: 'token',
        accessTokenExpiresAt: Date.now() + 30_000, // expira en 30s (< threshold 60s)
      };
      expect(provider.isTokenExpired(session)).toBe(true);
    });

    it('debe retornar true cuando el token ya expiró', () => {
      const session: AuthSession = {
        user: MOCK_USER,
        accessToken: 'token',
        accessTokenExpiresAt: Date.now() - 1_000, // expiró hace 1s
      };
      expect(provider.isTokenExpired(session)).toBe(true);
    });

    it('debe usar AUTH_DEFAULTS.tokenRefreshThresholdMs como umbral', () => {
      const exactThreshold: AuthSession = {
        user: MOCK_USER,
        accessToken: 'token',
        // Exactamente en el umbral → considera expirado
        accessTokenExpiresAt: Date.now() + AUTH_DEFAULTS.tokenRefreshThresholdMs,
      };
      expect(provider.isTokenExpired(exactThreshold)).toBe(true);
    });
  });
});

