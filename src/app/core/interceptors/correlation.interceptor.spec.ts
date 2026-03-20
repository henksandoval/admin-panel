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
import { describe, it, expect, afterEach } from 'vitest';

import { correlationInterceptor, CORRELATION_ID_HEADER } from './correlation.interceptor';
import { CorrelationService } from '@core/services/correlation.service';

const TEST_URL = 'https://api.example.com/data';

function setup(correlationId = 'test-correlation-id') {
  const correlationServiceMock = { id: correlationId };

  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(withInterceptors([correlationInterceptor])),
      provideHttpClientTesting(),
      { provide: CorrelationService, useValue: correlationServiceMock },
    ],
  });

  return {
    http: TestBed.inject(HttpClient),
    httpMock: TestBed.inject(HttpTestingController),
  };
}

describe('correlationInterceptor', () => {
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    TestBed.resetTestingModule();
  });

  it('adds the X-Correlation-ID header to every outgoing request', () => {
    const { http, httpMock } = setup('abc-123');

    http.get(TEST_URL).subscribe();

    const req = httpMock.expectOne(TEST_URL);
    expect(req.request.headers.get(CORRELATION_ID_HEADER)).toBe('abc-123');
    req.flush({});
  });

  it('forwards the correlation ID from the service', () => {
    const correlationId = 'unique-id-xyz';
    const { http, httpMock } = setup(correlationId);

    http.post(TEST_URL, {}).subscribe();

    const req = httpMock.expectOne(TEST_URL);
    expect(req.request.headers.get(CORRELATION_ID_HEADER)).toBe(correlationId);
    req.flush({});
  });
});
