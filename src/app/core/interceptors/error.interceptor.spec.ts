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
import { TestBed } from '@angular/core/testing';
import { describe, it, expect, afterEach, vi } from 'vitest';

import { HttpErrorOrchestratorService } from '@core/services/http-error-orchestrator.service';
import { errorInterceptor } from './error.interceptor';

const TEST_URL = 'https://api.example.com/data';

function setup() {
  const httpErrorOrchestratorMock = {
    handle: vi.fn(),
  };

  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(withInterceptors([errorInterceptor])),
      provideHttpClientTesting(),
      { provide: HttpErrorOrchestratorService, useValue: httpErrorOrchestratorMock },
    ],
  });

  return {
    http: TestBed.inject(HttpClient),
    httpMock: TestBed.inject(HttpTestingController),
    httpErrorOrchestratorMock,
  };
}

describe('errorInterceptor', () => {
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    vi.restoreAllMocks();
  });

  it('delegates the intercepted error to HttpErrorOrchestratorService', () => {
    const { http, httpMock, httpErrorOrchestratorMock } = setup();

    http.get(TEST_URL).subscribe({ error: () => undefined });
    httpMock.expectOne(TEST_URL).flush({}, { status: 500, statusText: 'Server Error' });

    expect(httpErrorOrchestratorMock.handle).toHaveBeenCalledTimes(1);
    expect(httpErrorOrchestratorMock.handle).toHaveBeenCalledWith(expect.any(HttpErrorResponse));
  });

  it('rethrows the error after delegating to the orchestrator', () => {
    const { http, httpMock } = setup();
    let receivedError: unknown;

    http.get(TEST_URL).subscribe({
      error: (error: unknown) => {
        receivedError = error;
      },
    });

    httpMock.expectOne(TEST_URL).flush({}, { status: 422, statusText: 'Unprocessable Entity' });

    expect(receivedError).toBeInstanceOf(HttpErrorResponse);
    expect((receivedError as HttpErrorResponse).status).toBe(422);
  });
});
