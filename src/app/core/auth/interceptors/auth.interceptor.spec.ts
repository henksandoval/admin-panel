import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors, } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting, } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { authInterceptor } from './auth.interceptor';
import { AuthService } from '@core/auth/services';
import { AUTH_PROVIDER, AUTH_PUBLIC_URLS } from '@core/auth/providers';
import { createFailingAuthProvider, createMockAuthProvider, MOCK_TOKEN_RESPONSE, } from '@test-helpers/auth';

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

  afterEach(() => {
    if (httpMock) {
      httpMock.verify();
    }
    vi.restoreAllMocks();
  });

  it('injects the Authorization header when a token is present', () => {
    setup('my-token');
    http.get(TEST_URL).subscribe();

    const req = httpMock.expectOne(TEST_URL);
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-token');
    req.flush({});
  });

  it('does not inject Authorization when there is no token', () => {
    setup(null);
    http.get(TEST_URL).subscribe();

    const req = httpMock.expectOne(TEST_URL);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('does not inject Authorization for public URLs', () => {
    setup('valid-token', ['/auth/refresh', '/auth/login']);
    http.post('/auth/refresh', {}).subscribe();

    const req = httpMock.expectOne('/auth/refresh');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('retries the request with the new token after receiving a 401', () => {
    setup('old-token');
    let callCount = 0;

    http.get(TEST_URL).subscribe({
      next: (data) => {
        callCount++;
        expect(data).toEqual({ ok: true });
      },
    });

    const firstReq = httpMock.expectOne(TEST_URL);
    expect(firstReq.request.headers.get('Authorization')).toBe('Bearer old-token');
    firstReq.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    const retryReq = httpMock.expectOne(TEST_URL);
    expect(retryReq.request.headers.get('Authorization')).toBe(
      `Bearer ${MOCK_TOKEN_RESPONSE.accessToken}`,
    );
    retryReq.flush({ ok: true });

    expect(callCount).toBe(1);
  });

  it('calls logout when the token refresh also fails after a 401', () => {
    const failingProvider = createFailingAuthProvider();
    const mockAuthService = createMockAuthServiceWithToken('old-token');

    setup('old-token'); // Initialize TestBed first via setup to ensure httpMock is ready

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
      error: (_err: unknown) => { errorReceived = true; },
    });

    const req = httpMock.expectOne(TEST_URL);
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(errorReceived).toBe(true);
    expect(mockAuthService.logout).toHaveBeenCalled();
  });

  it('queues concurrent requests during refresh and resolves all with the new token', () => {
    setup('old-token');
    const results: unknown[] = [];

    http.get(`${TEST_URL}/a`).subscribe((d) => results.push(d));
    http.get(`${TEST_URL}/b`).subscribe((d) => results.push(d));

    const reqA = httpMock.expectOne(`${TEST_URL}/a`);
    const reqB = httpMock.expectOne(`${TEST_URL}/b`);

    reqA.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    reqB.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

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
