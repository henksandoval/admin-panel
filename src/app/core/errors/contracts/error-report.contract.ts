export interface ErrorReportDto {
  readonly kind: string;
  readonly message: string;
  readonly correlationId: string | null;
  readonly context?: Record<string, unknown>;
  readonly timestamp: string;
}
