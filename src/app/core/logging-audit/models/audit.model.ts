export type AuditAction =
  | 'login_success'
  | 'login_failure'
  | 'logout'
  | 'session_expired'
  | 'password_reset_requested'
  | 'password_reset_confirmed'
  | 'register'
  | 'token_refresh_failure';

export interface AuditEvent {
  readonly action: AuditAction;
  readonly userId: string | null;
  readonly userEmail: string | null;
  readonly timestamp: string;
  readonly metadata?: Record<string, unknown>;
}
