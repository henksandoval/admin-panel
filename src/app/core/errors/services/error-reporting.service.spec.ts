import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { ErrorReport, ErrorReportingService } from '@core/errors';
import { API_BASE_URL } from '@core/network';
import { LOG_LEVEL } from '@core/logging-audit/tokens/logging.tokens';
import { LogLevel } from '@core/logging-audit/models/log-level.model';

const API_BASE = 'https://api.example.com';

const MOCK_REPORT: ErrorReport = {
  kind: 'operational',
  message: 'Something went wrong',
  correlationId: 'abc-123',
  timestamp: '2026-01-01T00:00:00.000Z',
};

describe('ErrorReportingService', () => {
  let service: ErrorReportingService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ErrorReportingService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: API_BASE },
        { provide: LOG_LEVEL, useValue: LogLevel.warn },
      ],
    });
    service = TestBed.inject(ErrorReportingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.restoreAllMocks();
  });

  it('sends a POST request to /errors/report', () => {
    service.report(MOCK_REPORT).subscribe();

    const req = httpMock.expectOne(`${API_BASE}/errors/report`);
    expect(req.request.method).toBe('POST');
    req.flush(null);
  });

  it('sends the error report data as the request body', () => {
    service.report(MOCK_REPORT).subscribe();

    const req = httpMock.expectOne(`${API_BASE}/errors/report`);
    expect(req.request.body).toEqual(MOCK_REPORT);
    req.flush(null);
  });

  it('completes without error when the backend request fails', () => {
    let completed = false;
    let errorThrown = false;

    // First expectation to ensure the module is instantiated before other code
    const request$ = service.report(MOCK_REPORT);

    request$.subscribe({
      complete: () => { completed = true; },
      error: () => { errorThrown = true; },
    });

    httpMock.expectOne(`${API_BASE}/errors/report`).flush('Server Error', {
      status: 500,
      statusText: 'Internal Server Error',
    });

    expect(completed).toBe(true);
    expect(errorThrown).toBe(false);
  });

  it('logs a warning when the backend request fails', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockReturnValue(undefined);

    service.report(MOCK_REPORT).subscribe();

    httpMock.expectOne(`${API_BASE}/errors/report`).flush('Server Error', {
      status: 500,
      statusText: 'Internal Server Error',
    });

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\[WARN]/),
      expect.anything(),
    );
  });
});
