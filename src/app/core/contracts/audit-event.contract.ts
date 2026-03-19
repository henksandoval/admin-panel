export interface AuditEventDto {
  readonly action: string;
  readonly userId: string | null;
  readonly userEmail: string | null;
  readonly timestamp: string;
  readonly metadata?: Record<string, unknown>;
}
