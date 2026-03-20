import { describe, expect, it } from 'vitest';
import { AuditEvent } from '@core/models';
import { toAuditEventDto } from './audit-event.mapper';

describe('toAuditEventDto', () => {
  it('maps all fields from AuditEvent to AuditEventDto', () => {
    const event: AuditEvent = {
      action: 'login_success',
      userId: 'user-1',
      userEmail: 'user@example.com',
      timestamp: '2026-01-01T00:00:00.000Z',
    };

    const dto = toAuditEventDto(event);

    expect(dto.action).toBe('login_success');
    expect(dto.userId).toBe('user-1');
    expect(dto.userEmail).toBe('user@example.com');
    expect(dto.timestamp).toBe('2026-01-01T00:00:00.000Z');
  });

  it('includes optional metadata when present', () => {
    const event: AuditEvent = {
      action: 'logout',
      userId: 'user-2',
      userEmail: 'admin@example.com',
      timestamp: '2026-03-01T12:00:00.000Z',
      metadata: { ip: '127.0.0.1', reason: 'manual' },
    };

    const dto = toAuditEventDto(event);

    expect(dto.metadata).toEqual({ ip: '127.0.0.1', reason: 'manual' });
  });

  it('maps null userId and userEmail for unauthenticated events', () => {
    const event: AuditEvent = {
      action: 'login_failure',
      userId: null,
      userEmail: null,
      timestamp: '2026-03-01T12:00:00.000Z',
    };

    const dto = toAuditEventDto(event);

    expect(dto.userId).toBeNull();
    expect(dto.userEmail).toBeNull();
  });
});
