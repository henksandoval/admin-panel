import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { describe, it, expect, vi, afterEach } from 'vitest';

import { LoggingService } from '@core/logging-audit';
import { NotificationService } from '@core/notifications';
import { CorrelationService } from '@core/network/correlation.service';
import { HttpErrorOrchestratorService } from './http-error-orchestrator.service';

const TEST_URL = 'https://api.example.com/data';

interface RouterMock {
  url: string;
  navigateByUrl: ReturnType<typeof vi.fn>;
}

function buildHttpError(status: number, statusText: string): HttpErrorResponse {
  return new HttpErrorResponse({
    status,
    statusText,
    url: TEST_URL,
    error: {},
  });
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

  const loggingServiceMock = {
    error: vi.fn(),
    warn: vi.fn(),
  };

  const correlationServiceMock = { id: 'test-correlation-id' };

  TestBed.configureTestingModule({
    providers: [
      HttpErrorOrchestratorService,
      { provide: NotificationService, useValue: notificationServiceMock },
      { provide: Router, useValue: routerMock },
      { provide: LoggingService, useValue: loggingServiceMock },
      { provide: CorrelationService, useValue: correlationServiceMock },
    ],
  });

  return {
    service: TestBed.inject(HttpErrorOrchestratorService),
    notificationServiceMock,
    routerMock,
    loggingServiceMock,
  };
}

describe('HttpErrorOrchestratorService', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
  });

  it('navigates to unauthorized and suppresses toasts for status 403', () => {
    const { service, routerMock, notificationServiceMock } = setup();

    service.handle(buildHttpError(403, 'Forbidden'));

    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/errors/unauthorized');
    expect(notificationServiceMock.error).not.toHaveBeenCalled();
    expect(notificationServiceMock.warning).not.toHaveBeenCalled();
  });

  it('navigates to critical page and suppresses toasts for status 503', () => {
    const { service, routerMock, notificationServiceMock } = setup();

    service.handle(buildHttpError(503, 'Service Unavailable'));

    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/critical-errors/system-down');
    expect(notificationServiceMock.error).not.toHaveBeenCalled();
    expect(notificationServiceMock.warning).not.toHaveBeenCalled();
  });

  it('does not navigate when current route is already an error route', () => {
    const { service, routerMock } = setup('/errors/not-found');

    service.handle(buildHttpError(500, 'Server Error'));

    expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
  });

  it('shows warning notification for network error', () => {
    const { service, notificationServiceMock } = setup();

    service.handle(
      new HttpErrorResponse({
        status: 0,
        statusText: 'Unknown Error',
        url: TEST_URL,
        error: new ProgressEvent('error'),
      }),
    );

    expect(notificationServiceMock.warning).toHaveBeenCalled();
    expect(notificationServiceMock.error).not.toHaveBeenCalled();
  });

  it('shows warning notification for non-navigation 4xx errors', () => {
    const { service, notificationServiceMock } = setup();

    service.handle(buildHttpError(400, 'Bad Request'));

    expect(notificationServiceMock.warning).toHaveBeenCalled();
    expect(notificationServiceMock.error).not.toHaveBeenCalled();
  });

  it('shows error notification with operational duration for 5xx errors not covered by navigation', () => {
    const { service, notificationServiceMock } = setup();

    service.handle(buildHttpError(502, 'Bad Gateway'));

    expect(notificationServiceMock.error).toHaveBeenCalledWith(expect.any(String), expect.any(String), 8000);
    expect(notificationServiceMock.warning).not.toHaveBeenCalled();
  });

  it('logs 5xx errors as operational with correlation metadata', () => {
    const { service, loggingServiceMock } = setup();

    service.handle(buildHttpError(500, 'Server Error'));

    expect(loggingServiceMock.error).toHaveBeenCalledWith(
      'Operational HTTP error',
      expect.objectContaining({ correlationId: 'test-correlation-id', status: 500, url: TEST_URL }),
    );
    expect(loggingServiceMock.warn).not.toHaveBeenCalled();
  });

  it('logs 4xx errors as expected with correlation metadata', () => {
    const { service, loggingServiceMock } = setup();

    service.handle(buildHttpError(422, 'Unprocessable Entity'));

    expect(loggingServiceMock.warn).toHaveBeenCalledWith(
      'Expected HTTP error',
      expect.objectContaining({ correlationId: 'test-correlation-id', status: 422, url: TEST_URL }),
    );
    expect(loggingServiceMock.error).not.toHaveBeenCalled();
  });
});
