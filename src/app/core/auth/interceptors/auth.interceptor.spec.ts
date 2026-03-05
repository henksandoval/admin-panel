import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { describe, it, expect, afterEach, vi } from 'vitest';

import { authInterceptor } from './auth.interceptor';
import { AuthService } from '@auth/services/auth.service';
import { AUTH_PROVIDER, AUTH_PUBLIC_URLS } from '@auth/providers/auth-provider.token';
import {
  createMockAuthProvider,
  createFailingAuthProvider,
  MOCK_TOKEN_RESPONSE,
} from '@auth/testing/auth-test.helpers';

const TEST_URL    = 'https://api.example.com/data';
const REFRESH_URL = '/auth/refresh';

function createMockAuthServiceWithToken(token: string | null) {
  return {
    accessToken: signal(token).asReadonly(),
    logout: vi.fn(() => ({ subscribe: vi.fn() })),
  };
}

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  function setup(token: string | null = 'valid-token', publicUrls: string[] = [REFRESH_URL]) {
    const mockAuthService = createMockAuthServiceWithToken(token);
    const mockProvider    = createMockAuthProvider();

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService,      useValue: mockAuthService },
        { provide: AUTH_PROVIDER,    useValue: mockProvider },
        { provide: AUTH_PUBLIC_URLS, useValue: publicUrls },
      ],
    });

    http     = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    return { mockAuthService, mockProvider };
  }

  afterEach(() => httpMock.verify());

  // ── Inyección de token ─────────────────────────────────────────────────────
  it('debe inyectar el header Authorization cuando hay token', () => {
    setup('my-token');
    http.get(TEST_URL).subscribe();

    const req = httpMock.expectOne(TEST_URL);
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-token');
    req.flush({});
  });

  it('NO debe inyectar Authorization cuando no hay token', () => {
    setup(null);
    http.get(TEST_URL).subscribe();

    const req = httpMock.expectOne(TEST_URL);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  // ── URLs públicas ──────────────────────────────────────────────────────────
  it('NO debe inyectar Authorization en URLs públicas', () => {
    setup('valid-token', ['/auth/refresh', '/auth/login']);
    http.post('/auth/refresh', {}).subscribe();

    const req = httpMock.expectOne('/auth/refresh');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  // ── Manejo de 401 ─────────────────────────────────────────────────────────
  it('debe reintentar con el nuevo token tras recibir 401', () => {
    setup('old-token');
    let callCount = 0;

    http.get(TEST_URL).subscribe({
      next: (data) => {
        callCount++;
        expect(data).toEqual({ ok: true });
      },
    });

    // Primera llamada → 401
    const firstReq = httpMock.expectOne(TEST_URL);
    expect(firstReq.request.headers.get('Authorization')).toBe('Bearer old-token');
    firstReq.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    // El interceptor llama a refreshAccessToken → mock devuelve MOCK_TOKEN_RESPONSE
    // Segunda llamada con nuevo token
    const retryReq = httpMock.expectOne(TEST_URL);
    expect(retryReq.request.headers.get('Authorization')).toBe(
      `Bearer ${MOCK_TOKEN_RESPONSE.accessToken}`,
    );
    retryReq.flush({ ok: true });

    expect(callCount).toBe(1);
  });

  it('debe llamar a logout cuando el refresh también falla', () => {
    const failingProvider = createFailingAuthProvider();
    const mockAuthService = createMockAuthServiceWithToken('old-token');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService,      useValue: mockAuthService },
        { provide: AUTH_PROVIDER,    useValue: failingProvider },
        { provide: AUTH_PUBLIC_URLS, useValue: [REFRESH_URL] },
      ],
    });
    http     = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);

    let errorReceived = false;
    http.get(TEST_URL).subscribe({
      error: (_err: HttpErrorResponse) => { errorReceived = true; },
    });

    const req = httpMock.expectOne(TEST_URL);
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(errorReceived).toBe(true);
    expect(mockAuthService.logout).toHaveBeenCalled();
  });

  // ── Cola de requests simultáneos ───────────────────────────────────────────
  it('debe encolar requests simultáneos durante el refresh y resolverlos con el nuevo token', () => {
    setup('old-token');
    const results: unknown[] = [];

    http.get(`${TEST_URL}/a`).subscribe((d) => results.push(d));
    http.get(`${TEST_URL}/b`).subscribe((d) => results.push(d));

    // Ambos requests van con el token viejo
    const reqA = httpMock.expectOne(`${TEST_URL}/a`);
    const reqB = httpMock.expectOne(`${TEST_URL}/b`);

    // El primer 401 dispara el refresh
    reqA.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    reqB.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    // Ambos deben reintentarse con el nuevo token
    const retryA = httpMock.expectOne(`${TEST_URL}/a`);
    const retryB = httpMock.expectOne(`${TEST_URL}/b`);

    expect(retryA.request.headers.get('Authorization')).toBe(
      `Bearer ${MOCK_TOKEN_RESPONSE.accessToken}`,
    );
    expect(retryB.request.headers.get('Authorization')).toBe(
      `Bearer ${MOCK_TOKEN_RESPONSE.accessToken}`,
    );

    retryA.flush({ resource: 'a' });
    retryB.flush({ resource: 'b' });

    expect(results).toHaveLength(2);
  });
});



