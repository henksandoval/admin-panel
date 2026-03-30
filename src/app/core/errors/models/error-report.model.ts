export type ErrorKind = 'operational' | 'expected';

export interface ErrorReport {
  readonly kind: ErrorKind;
  readonly message: string;
  readonly correlationId: string | null;
  readonly context?: Record<string, unknown>;
  readonly timestamp: string;
}
