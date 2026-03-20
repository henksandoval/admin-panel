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
    warning: vi.fn(),
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

  it('navigates to the error page and suppresses the toast for 403', () => {
    const { http, httpMock, notificationServiceMock, routerMock } = setup();

    http.get(TEST_URL).subscribe({ error: () => undefined });
    httpMock.expectOne(TEST_URL).flush({}, { status: 403, statusText: 'Forbidden' });

    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/errors/unauthorized');
    expect(notificationServiceMock.error).not.toHaveBeenCalled();
    expect(notificationServiceMock.warning).not.toHaveBeenCalled();
  });

  it('navigates to the error page and suppresses the toast for 404', () => {
    const { http, httpMock, notificationServiceMock, routerMock } = setup();

    http.get(TEST_URL).subscribe({ error: () => undefined });
    httpMock.expectOne(TEST_URL).flush({}, { status: 404, statusText: 'Not Found' });

    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/errors/not-found');
    expect(notificationServiceMock.error).not.toHaveBeenCalled();
    expect(notificationServiceMock.warning).not.toHaveBeenCalled();
  });

  it('navigates to the error page and suppresses the toast for 500', () => {
    const { http, httpMock, notificationServiceMock, routerMock } = setup();

    http.get(TEST_URL).subscribe({ error: () => undefined });
    httpMock.expectOne(TEST_URL).flush({}, { status: 500, statusText: 'Server Error' });

    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/errors/server-error');
    expect(notificationServiceMock.error).not.toHaveBeenCalled();
    expect(notificationServiceMock.warning).not.toHaveBeenCalled();
  });

  it('navigates to the critical page and suppresses the toast for 503', () => {
    const { http, httpMock, notificationServiceMock, routerMock } = setup();

    http.get(TEST_URL).subscribe({ error: () => undefined });
    httpMock.expectOne(TEST_URL).flush({}, { status: 503, statusText: 'Service Unavailable' });

    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/critical-errors/system-down');
    expect(notificationServiceMock.error).not.toHaveBeenCalled();
    expect(notificationServiceMock.warning).not.toHaveBeenCalled();
  });

  it('does not navigate when the current route is already an error page', () => {
    const { http, httpMock, routerMock } = setup('/errors/not-found');

    http.get(TEST_URL).subscribe({ error: () => undefined });
    httpMock.expectOne(TEST_URL).flush({}, { status: 500, statusText: 'Server Error' });

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
  it('shows a warning notification for a network error', () => {
    const { http, httpMock, notificationServiceMock } = setup();

    http.get(TEST_URL).subscribe({ error: () => undefined });
    httpMock.expectOne(TEST_URL).error(new ProgressEvent('error'));

    expect(notificationServiceMock.warning).toHaveBeenCalled();
    expect(notificationServiceMock.error).not.toHaveBeenCalled();
  });

  it('shows a warning notification for a non-navigation 4xx error', () => {
    const { http, httpMock, notificationServiceMock } = setup();

    http.get(TEST_URL).subscribe({ error: () => undefined });
    httpMock.expectOne(TEST_URL).flush({}, { status: 400, statusText: 'Bad Request' });

    expect(notificationServiceMock.warning).toHaveBeenCalled();
    expect(notificationServiceMock.error).not.toHaveBeenCalled();
  });

  it('shows an error notification with longer duration for an operational 5xx error', () => {
    const { http, httpMock, notificationServiceMock } = setup();

    http.get(TEST_URL).subscribe({ error: () => undefined });
    httpMock.expectOne(TEST_URL).flush({}, { status: 502, statusText: 'Bad Gateway' });

    expect(notificationServiceMock.error).toHaveBeenCalledWith(expect.any(String), expect.any(String), 8000);
    expect(notificationServiceMock.warning).not.toHaveBeenCalled();
  });

  it('propagates the error to the subscriber after handling', () => {
    const { http, httpMock } = setup();
    let errorReceived = false;

    http.get(TEST_URL).subscribe({ error: () => { errorReceived = true; }});
    httpMock.expectOne(TEST_URL).flush({}, { status: 422, statusText: 'Unprocessable Entity' });

    expect(errorReceived).toBe(true);
  });
});
