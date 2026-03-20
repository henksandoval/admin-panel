import { AuditEvent } from '@core/models';
import { AuditEventDto } from '@core/contracts';

export function toAuditEventDto(event: AuditEvent): AuditEventDto {
  return { ...event };
}
