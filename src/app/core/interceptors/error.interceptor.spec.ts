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

  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(withInterceptors([errorInterceptor])),
      provideHttpClientTesting(),
      { provide: NotificationService, useValue: notificationServiceMock },
      { provide: Router, useValue: routerMock },
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
    const { http, httpMock, routerMock } = setup();

    http.get(TEST_URL).subscribe({ error: () => undefined });

    const req = httpMock.expectOne(TEST_URL);
    req.flush({}, { status: 403, statusText: 'Forbidden' });

    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/errors/unauthorized');
  });

  it('does not show a notification for 403 because the error page communicates it', () => {
    const { http, httpMock, notificationServiceMock } = setup();

    http.get(TEST_URL).subscribe({ error: () => undefined });

    const req = httpMock.expectOne(TEST_URL);
    req.flush({}, { status: 403, statusText: 'Forbidden' });

    expect(notificationServiceMock.error).not.toHaveBeenCalled();
    expect(notificationServiceMock.warning).not.toHaveBeenCalled();
  });

  it('navigates to not-found page when response status is 404', () => {
    const { http, httpMock, routerMock } = setup();

    http.get(TEST_URL).subscribe({ error: () => undefined });

    const req = httpMock.expectOne(TEST_URL);
    req.flush({}, { status: 404, statusText: 'Not Found' });

    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/errors/not-found');
  });

  it('does not show a notification for 404 because the error page communicates it', () => {
    const { http, httpMock, notificationServiceMock } = setup();

    http.get(TEST_URL).subscribe({ error: () => undefined });

    const req = httpMock.expectOne(TEST_URL);
    req.flush({}, { status: 404, statusText: 'Not Found' });

    expect(notificationServiceMock.error).not.toHaveBeenCalled();
    expect(notificationServiceMock.warning).not.toHaveBeenCalled();
  });

  it('navigates to server-error page when response status is 500', () => {
    const { http, httpMock, routerMock } = setup();

    http.get(TEST_URL).subscribe({ error: () => undefined });

    const req = httpMock.expectOne(TEST_URL);
    req.flush({}, { status: 500, statusText: 'Server Error' });

    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/errors/server-error');
  });

  it('does not show a notification for 500 because the error page communicates it', () => {
    const { http, httpMock, notificationServiceMock } = setup();

    http.get(TEST_URL).subscribe({ error: () => undefined });

    const req = httpMock.expectOne(TEST_URL);
    req.flush({}, { status: 500, statusText: 'Server Error' });

    expect(notificationServiceMock.error).not.toHaveBeenCalled();
    expect(notificationServiceMock.warning).not.toHaveBeenCalled();
  });

  it('navigates to critical system-down page when response status is 503', () => {
    const { http, httpMock, routerMock } = setup();

    http.get(TEST_URL).subscribe({ error: () => undefined });

    const req = httpMock.expectOne(TEST_URL);
    req.flush({}, { status: 503, statusText: 'Service Unavailable' });

    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/critical-errors/system-down');
  });

  it('does not show a notification for 503 because the error page communicates it', () => {
    const { http, httpMock, notificationServiceMock } = setup();

    http.get(TEST_URL).subscribe({ error: () => undefined });

    const req = httpMock.expectOne(TEST_URL);
    req.flush({}, { status: 503, statusText: 'Service Unavailable' });

    expect(notificationServiceMock.error).not.toHaveBeenCalled();
    expect(notificationServiceMock.warning).not.toHaveBeenCalled();
  });

  it('does not navigate when the current route is already an error page', () => {
    const { http, httpMock, routerMock } = setup('/errors/not-found');

    http.get(TEST_URL).subscribe({ error: () => undefined });

    const req = httpMock.expectOne(TEST_URL);
    req.flush({}, { status: 500, statusText: 'Server Error' });

    expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
  });

  it('shows a warning notification for a network error', () => {
    const { http, httpMock, notificationServiceMock } = setup();

    http.get(TEST_URL).subscribe({ error: () => undefined });

    const req = httpMock.expectOne(TEST_URL);
    req.error(new ProgressEvent('error'));

    expect(notificationServiceMock.warning).toHaveBeenCalled();
    expect(notificationServiceMock.error).not.toHaveBeenCalled();
  });

  it('shows a warning notification for a 400 bad request', () => {
    const { http, httpMock, notificationServiceMock } = setup();

    http.get(TEST_URL).subscribe({ error: () => undefined });

    const req = httpMock.expectOne(TEST_URL);
    req.flush({}, { status: 400, statusText: 'Bad Request' });

    expect(notificationServiceMock.warning).toHaveBeenCalled();
    expect(notificationServiceMock.error).not.toHaveBeenCalled();
  });

  it('shows an error notification with longer duration for an operational 502 error', () => {
    const { http, httpMock, notificationServiceMock } = setup();

    http.get(TEST_URL).subscribe({ error: () => undefined });

    const req = httpMock.expectOne(TEST_URL);
    req.flush({}, { status: 502, statusText: 'Bad Gateway' });

    expect(notificationServiceMock.error).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      8000,
    );
    expect(notificationServiceMock.warning).not.toHaveBeenCalled();
  });

  it('propagates the error to the subscriber after handling', () => {
    const { http, httpMock } = setup();
    let errorReceived = false;

    http.get(TEST_URL).subscribe({ error: () => { errorReceived = true; }});

    const req = httpMock.expectOne(TEST_URL);
    req.flush({}, { status: 422, statusText: 'Unprocessable Entity' });

    expect(errorReceived).toBe(true);
  });
});
