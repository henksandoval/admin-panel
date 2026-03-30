import { TestBed } from '@angular/core/testing';
import { ErrorHandler } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GlobalErrorHandler } from '@core/errors';
import { API_BASE_URL, CorrelationService } from '@core/network';
import { LOG_LEVEL } from '@core/logging-audit/tokens/logging.tokens';
import { LogLevel } from '@core/logging-audit/models/log-level.model';

const API_BASE = 'https://api.example.com';
const MOCK_CORRELATION_ID = 'test-correlation-id';

function setup() {
  const correlationServiceMock = { id: MOCK_CORRELATION_ID };

  TestBed.configureTestingModule({
    providers: [
      { provide: ErrorHandler, useClass: GlobalErrorHandler },
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: API_BASE_URL, useValue: API_BASE },
      { provide: LOG_LEVEL, useValue: LogLevel.warn },
      { provide: CorrelationService, useValue: correlationServiceMock },
    ],
  });

  return {
    handler: TestBed.inject(ErrorHandler) as GlobalErrorHandler,
    httpMock: TestBed.inject(HttpTestingController),
  };
}

describe('GlobalErrorHandler', () => {
  let handler: GlobalErrorHandler;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    ({ handler, httpMock } = setup());
  });

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
  });

  it('logs the error message to console.error', () => {
    const errorSpy = vi.spyOn(console, 'error').mockReturnValue(undefined);

    handler.handleError(new Error('Something broke'));

    httpMock.expectOne(`${API_BASE}/errors/report`).flush(null);

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\[ERROR]/),
      expect.anything(),
    );
  });

  it('reports the error to the backend via POST', () => {
    vi.spyOn(console, 'error').mockReturnValue(undefined);

    handler.handleError(new Error('Critical failure'));

    const req = httpMock.expectOne(`${API_BASE}/errors/report`);
    expect(req.request.method).toBe('POST');
    req.flush(null);
  });

  it('reports the error as operational kind', () => {
    vi.spyOn(console, 'error').mockReturnValue(undefined);

    handler.handleError(new Error('Infra failure'));

    const req = httpMock.expectOne(`${API_BASE}/errors/report`);
    expect(req.request.body).toMatchObject({ kind: 'operational' });
    req.flush(null);
  });

  it('includes the correlation ID in the error report', () => {
    vi.spyOn(console, 'error').mockReturnValue(undefined);

    handler.handleError(new Error('Traced error'));

    const req = httpMock.expectOne(`${API_BASE}/errors/report`);
    expect(req.request.body).toMatchObject({ correlationId: MOCK_CORRELATION_ID });
    req.flush(null);
  });

  it('includes the error message in the error report', () => {
    vi.spyOn(console, 'error').mockReturnValue(undefined);

    handler.handleError(new Error('Specific error message'));

    const req = httpMock.expectOne(`${API_BASE}/errors/report`);
    expect(req.request.body).toMatchObject({ message: 'Specific error message' });
    req.flush(null);
  });

  it('handles non-Error objects by converting them to string', () => {
    vi.spyOn(console, 'error').mockReturnValue(undefined);

    handler.handleError('plain string error');

    const req = httpMock.expectOne(`${API_BASE}/errors/report`);
    expect(req.request.body).toMatchObject({ message: 'plain string error' });
    req.flush(null);
  });

  it('does not throw when the backend report request fails', () => {
    vi.spyOn(console, 'error').mockReturnValue(undefined);
    vi.spyOn(console, 'warn').mockReturnValue(undefined);

    expect(() => handler.handleError(new Error('error'))).not.toThrow();

    httpMock.expectOne(`${API_BASE}/errors/report`).flush('Server Error', {
      status: 500,
      statusText: 'Internal Server Error',
    });
  });
});
