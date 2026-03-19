import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { AuditService } from './audit.service';
import { API_BASE_URL } from '@auth/providers/jwt/jwt-auth.provider';
import { AuditEvent } from '@core/models';

const API_BASE = 'https://api.example.com';

const MOCK_EVENT: AuditEvent = {
  action: 'login_success',
  userId: 'user-1',
  userEmail: 'test@example.com',
  timestamp: '2026-01-01T00:00:00.000Z',
};

describe('AuditService', () => {
  let service: AuditService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuditService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: API_BASE },
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
    it('sends a POST request to /audit/events', () => {
      service.record(MOCK_EVENT).subscribe();

      const req = httpMock.expectOne(`${API_BASE}/audit/events`);
      expect(req.request.method).toBe('POST');
      req.flush(null);
    });

    it('sends the audit event data as the request body', () => {
      service.record(MOCK_EVENT).subscribe();

      const req = httpMock.expectOne(`${API_BASE}/audit/events`);
      expect(req.request.body).toEqual(MOCK_EVENT);
      req.flush(null);
    });

    it('completes without error when the server responds with an error', () => {
      let completed = false;
      let errorThrown = false;

      service.record(MOCK_EVENT).subscribe({
        complete: () => { completed = true; },
        error: () => { errorThrown = true; },
      });

      httpMock.expectOne(`${API_BASE}/audit/events`).flush('Server Error', {
        status: 500,
        statusText: 'Internal Server Error',
      });

      expect(completed).toBe(true);
      expect(errorThrown).toBe(false);
    });

    it('logs an error message when the server request fails', () => {
      const errorSpy = vi.spyOn(console, 'error').mockReturnValue(undefined);

      service.record(MOCK_EVENT).subscribe();

      httpMock.expectOne(`${API_BASE}/audit/events`).flush('Server Error', {
        status: 500,
        statusText: 'Internal Server Error',
      });

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringMatching(/\[ERROR\]/),
        expect.anything(),
      );
    });

    it('includes action, userId, userEmail, and timestamp in the request body', () => {
      const event: AuditEvent = {
        action: 'logout',
        userId: 'user-42',
        userEmail: 'admin@example.com',
        timestamp: '2026-03-01T12:00:00.000Z',
      };

      service.record(event).subscribe();

      const req = httpMock.expectOne(`${API_BASE}/audit/events`);
      expect(req.request.body).toMatchObject({
        action: 'logout',
        userId: 'user-42',
        userEmail: 'admin@example.com',
        timestamp: '2026-03-01T12:00:00.000Z',
      });
      req.flush(null);
    });

    it('sends null userId and userEmail when user is not authenticated', () => {
      const event: AuditEvent = {
        action: 'login_failure',
        userId: null,
        userEmail: 'unknown@example.com',
        timestamp: '2026-03-01T12:00:00.000Z',
      };

      service.record(event).subscribe();

      const req = httpMock.expectOne(`${API_BASE}/audit/events`);
      expect(req.request.body).toMatchObject({
        action: 'login_failure',
        userId: null,
        userEmail: 'unknown@example.com',
      });
      req.flush(null);
    });
  });
});
