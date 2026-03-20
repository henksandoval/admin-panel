import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { describe, it, expect, afterEach, vi } from 'vitest';

import { errorInterceptor } from './error.interceptor';
import { NotificationService } from '@core/services/notification.service';
import { CorrelationService } from '@core/services/correlation.service';

const TEST_URL = 'https://api.example.com/data';

interface RouterMock {
  url: string;
  navigateByUrl: ReturnType<typeof vi.fn>;
}

function setup(initialUrl = '/dashboard') {
  const notificationServiceMock = {
    error: vi.fn(),
  };

  const routerMock: RouterMock = {
    url: initialUrl,
    navigateByUrl: vi.fn().mockResolvedValue(true),
  };

  const correlationServiceMock = { id: 'test-correlation-id' };

  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(withInterceptors([errorInterceptor])),
      provideHttpClientTesting(),
      { provide: NotificationService, useValue: notificationServiceMock },
      { provide: Router, useValue: routerMock },
      { provide: CorrelationService, useValue: correlationServiceMock },
    ],
  });

  return {
    http: TestBed.inject(HttpClient),
    httpMock: TestBed.inject(HttpTestingController),
    notificationServiceMock,
    routerMock,
  };
}

describe('errorInterceptor', () => {
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('navigates to unauthorized page when response status is 403', () => {
    const { http, httpMock, notificationServiceMock, routerMock } = setup();

    http.get(TEST_URL).subscribe({
      error: (_error: unknown) => {
        expect(notificationServiceMock.error).toHaveBeenCalled();
      },
    });

    const req = httpMock.expectOne(TEST_URL);
    req.flush({}, { status: 403, statusText: 'Forbidden' });

    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/errors/unauthorized');
  });

  it('navigates to not-found page when response status is 404', () => {
    const { http, httpMock, routerMock } = setup();

    http.get(TEST_URL).subscribe({ error: () => undefined });

    const req = httpMock.expectOne(TEST_URL);
    req.flush({}, { status: 404, statusText: 'Not Found' });

    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/errors/not-found');
  });

  it('navigates to server-error page when response status is 500', () => {
    const { http, httpMock, routerMock } = setup();

    http.get(TEST_URL).subscribe({ error: () => undefined });

    const req = httpMock.expectOne(TEST_URL);
    req.flush({}, { status: 500, statusText: 'Server Error' });

    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/errors/server-error');
  });

  it('navigates to critical system-down page when response status is 503', () => {
    const { http, httpMock, routerMock } = setup();

    http.get(TEST_URL).subscribe({ error: () => undefined });

    const req = httpMock.expectOne(TEST_URL);
    req.flush({}, { status: 503, statusText: 'Service Unavailable' });

    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/critical-errors/system-down');
  });

  it('does not navigate when the current route is already an error page', () => {
    const { http, httpMock, routerMock } = setup('/errors/not-found');

    http.get(TEST_URL).subscribe({ error: () => undefined });

    const req = httpMock.expectOne(TEST_URL);
    req.flush({}, { status: 500, statusText: 'Server Error' });

    expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
  });

  it('logs 5xx errors as operational using console.error', () => {
    const errorSpy = vi.spyOn(console, 'error').mockReturnValue(undefined);
    const { http, httpMock } = setup();

    http.get(TEST_URL).subscribe({ error: () => undefined });

    httpMock.expectOne(TEST_URL).flush({}, { status: 500, statusText: 'Server Error' });

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\[ERROR\]/),
      expect.objectContaining({ correlationId: 'test-correlation-id', status: 500 }),
    );

    vi.restoreAllMocks();
  });

  it('logs 4xx errors as expected using console.warn', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockReturnValue(undefined);
    const { http, httpMock } = setup();

    http.get(TEST_URL).subscribe({ error: () => undefined });

    httpMock.expectOne(TEST_URL).flush({}, { status: 403, statusText: 'Forbidden' });

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\[WARN\]/),
      expect.objectContaining({ correlationId: 'test-correlation-id', status: 403 }),
    );

    vi.restoreAllMocks();
  });

  it('includes the correlation ID in the log context', () => {
    const errorSpy = vi.spyOn(console, 'error').mockReturnValue(undefined);
    const { http, httpMock } = setup();

    http.get(TEST_URL).subscribe({ error: () => undefined });

    httpMock.expectOne(TEST_URL).flush({}, { status: 500, statusText: 'Server Error' });

    expect(errorSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ correlationId: 'test-correlation-id' }),
    );

    vi.restoreAllMocks();
  });
});
