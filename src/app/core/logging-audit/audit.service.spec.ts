import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Subject } from 'rxjs';
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi, Mock } from 'vitest';

import { AuditService, AUDIT_BATCH_TRIGGER } from './audit.service';
import { API_BASE_URL } from '@auth/providers/jwt/jwt-auth.provider';
import { AuditEvent } from './audit.model';

const API_BASE = 'https://api.example.com';
const BATCH_URL = `${API_BASE}/audit/events/batch`;

const MOCK_EVENT: AuditEvent = {
  action: 'login_success',
  userId: 'user-1',
  userEmail: 'test@example.com',
  timestamp: '2026-01-01T00:00:00.000Z',
};

describe('AuditService', () => {
  let service: AuditService;
  let httpMock: HttpTestingController;
  let batchTrigger: Subject<void>;
  let sendBeaconMock: Mock;

  beforeAll(() => {
    // Polyfill sendBeacon for JSDOM environments that lack it.
    if (!('sendBeacon' in navigator)) {
      Object.defineProperty(navigator, 'sendBeacon', {
        value: vi.fn(),
        configurable: true,
        writable: true,
      });
    }
  });

  beforeEach(() => {
    // Fresh mock per test — avoids accumulated call history across test resets.
    sendBeaconMock = vi.fn().mockReturnValue(true);
    navigator.sendBeacon = sendBeaconMock;

    batchTrigger = new Subject<void>();

    TestBed.configureTestingModule({
      providers: [
        AuditService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: API_BASE },
        { provide: AUDIT_BATCH_TRIGGER, useValue: batchTrigger },
      ],
    });

    service = TestBed.inject(AuditService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.restoreAllMocks();
  });

  describe('record()', () => {
    it('does not send an HTTP request immediately when an event is recorded', () => {
      service.record(MOCK_EVENT);

      httpMock.expectNone(BATCH_URL);
    });

    it('batches multiple events into a single POST when the trigger fires', () => {
      const secondEvent: AuditEvent = { ...MOCK_EVENT, action: 'logout' };

      service.record(MOCK_EVENT);
      service.record(secondEvent);
      batchTrigger.next();

      const req = httpMock.expectOne(BATCH_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual([MOCK_EVENT, secondEvent]);
      req.flush(null);
    });

    it('flushes immediately when BATCH_MAX_SIZE events are queued', () => {
      for (let i = 0; i < 10; i++) {
        service.record(MOCK_EVENT);
      }

      const req = httpMock.expectOne(BATCH_URL);
      expect(req.request.body).toHaveLength(10);
      req.flush(null);
    });

    it('sends the correct DTO fields for each event in the batch', () => {
      service.record(MOCK_EVENT);
      batchTrigger.next();

      const req = httpMock.expectOne(BATCH_URL);
      expect(req.request.body[0]).toMatchObject({
        action: 'login_success',
        userId: 'user-1',
        userEmail: 'test@example.com',
        timestamp: '2026-01-01T00:00:00.000Z',
      });
      req.flush(null);
    });

    it('does not throw when the batch request fails', () => {
      service.record(MOCK_EVENT);
      batchTrigger.next();

      expect(() =>
        httpMock
          .expectOne(BATCH_URL)
          .flush('Server Error', { status: 500, statusText: 'Internal Server Error' }),
      ).not.toThrow();
    });

    it('logs an error when the batch request fails', () => {
      const errorSpy = vi.spyOn(console, 'error').mockReturnValue(undefined);

      service.record(MOCK_EVENT);
      batchTrigger.next();

      httpMock
        .expectOne(BATCH_URL)
        .flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringMatching(/\[ERROR]/),
        expect.anything(),
      );
    });

    it('sends null userId and userEmail when user is not authenticated', () => {
      const unauthEvent: AuditEvent = {
        action: 'login_failure',
        userId: null,
        userEmail: 'unknown@example.com',
        timestamp: '2026-03-01T12:00:00.000Z',
      };

      service.record(unauthEvent);
      batchTrigger.next();

      const req = httpMock.expectOne(BATCH_URL);
      expect(req.request.body[0]).toMatchObject({
        action: 'login_failure',
        userId: null,
        userEmail: 'unknown@example.com',
      });
      req.flush(null);
    });
  });

  describe('ngOnDestroy()', () => {
    it('flushes pending events via sendBeacon on destroy', () => {
      service.record(MOCK_EVENT);
      service.ngOnDestroy();

      expect(sendBeaconMock).toHaveBeenCalledWith(BATCH_URL, expect.any(Blob));
    });

    it('does not call sendBeacon when there are no pending events on destroy', () => {
      service.ngOnDestroy();

      expect(sendBeaconMock).not.toHaveBeenCalled();
    });
  });
});
